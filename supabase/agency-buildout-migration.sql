-- Agency tier build-out migration.
--
-- This bundles every schema change needed for the parity push that
-- removes DocuSign and ships the missing agency features:
--   • Drop docusign_* columns on profiles
--   • Backfill profiles.agency_plan from existing Stripe state where
--     possible (best-effort) and ensure the column exists
--   • Roster size cap trigger (15 starter / 40 growth)
--   • brand_reports table  (Starter+)
--   • api_keys table       (Growth)
--   • scheduled_reports    (Growth)
--   • sso_configs          (Growth)
--
-- Safe to run multiple times — uses IF EXISTS / IF NOT EXISTS guards.

-- ─── 1. Drop DocuSign columns ────────────────────────────────────────
ALTER TABLE public.profiles DROP COLUMN IF EXISTS docusign_connected;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS docusign_access_token;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS docusign_refresh_token;

-- ─── 2. Ensure agency_plan exists + index it ─────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'agency_plan'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN agency_plan text CHECK (agency_plan IN ('starter','growth'));
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_profiles_agency_plan ON public.profiles(agency_plan);

-- Backfill: any agency-tier profile without an agency_plan defaults to
-- starter so the roster trigger has a value to compare against. Owners
-- on growth will be re-set on their next Stripe webhook event (or you
-- can manually update them).
UPDATE public.profiles
SET agency_plan = 'starter'
WHERE account_type = 'agency' AND agency_plan IS NULL;

-- ─── 3. Roster size cap trigger ──────────────────────────────────────
-- Enforces: an agency's active roster cannot exceed the limit set
-- by their agency_plan. This runs on INSERT into agency_creator_links
-- so it catches every code path (UI, API, direct SQL).

CREATE OR REPLACE FUNCTION public.enforce_roster_cap()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count int;
  plan text;
  cap int;
BEGIN
  -- Only enforce on rows transitioning to (or inserted as) "active".
  IF NEW.status IS DISTINCT FROM 'active' THEN
    RETURN NEW;
  END IF;

  SELECT agency_plan INTO plan FROM public.profiles WHERE id = NEW.agency_id;
  IF plan = 'growth' THEN cap := 40;
  ELSIF plan = 'starter' THEN cap := 15;
  ELSE cap := 15; -- safe default
  END IF;

  SELECT count(*) INTO current_count
  FROM public.agency_creator_links
  WHERE agency_id = NEW.agency_id
    AND status = 'active'
    AND (TG_OP = 'INSERT' OR id <> NEW.id);

  IF current_count >= cap THEN
    RAISE EXCEPTION 'Roster cap reached for this agency plan (% active creators max). Upgrade to add more.', cap
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS trg_roster_cap_insert ON public.agency_creator_links;
CREATE TRIGGER trg_roster_cap_insert
  BEFORE INSERT ON public.agency_creator_links
  FOR EACH ROW EXECUTE FUNCTION public.enforce_roster_cap();

DROP TRIGGER IF EXISTS trg_roster_cap_update ON public.agency_creator_links;
CREATE TRIGGER trg_roster_cap_update
  BEFORE UPDATE OF status ON public.agency_creator_links
  FOR EACH ROW EXECUTE FUNCTION public.enforce_roster_cap();

-- ─── 4. brand_reports ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.brand_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(btrim(title)) > 0),
  kind text NOT NULL,
  body jsonb NOT NULL DEFAULT '{}'::jsonb,
  share_token text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_brand_reports_owner ON public.brand_reports(owner_id);
ALTER TABLE public.brand_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner can manage their brand reports" ON public.brand_reports;
CREATE POLICY "Owner can manage their brand reports"
  ON public.brand_reports FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Public read by share_token is handled via the service-role API
-- route; no anon RLS policy is needed (and we don't want one — it
-- would expose every report unconditionally).

-- ─── 5. api_keys ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label text NOT NULL,
  prefix text NOT NULL,             -- first 16 chars for display only
  token_hash text NOT NULL UNIQUE,  -- sha256(plaintext) — plaintext is never stored
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_api_keys_owner ON public.api_keys(owner_id);
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner can manage their API keys" ON public.api_keys;
CREATE POLICY "Owner can manage their API keys"
  ON public.api_keys FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- ─── 6. scheduled_reports ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.scheduled_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('overview','pnl','commission','annual')),
  cadence text NOT NULL CHECK (cadence IN ('weekly','monthly')),
  recipients text[] NOT NULL CHECK (array_length(recipients, 1) BETWEEN 1 AND 10),
  next_run_at timestamptz NOT NULL,
  last_run_at timestamptz,
  paused boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_owner ON public.scheduled_reports(owner_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_next_run ON public.scheduled_reports(next_run_at) WHERE paused = false;
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner can manage their scheduled reports" ON public.scheduled_reports;
CREATE POLICY "Owner can manage their scheduled reports"
  ON public.scheduled_reports FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- ─── 7. sso_configs ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sso_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  domain text NOT NULL,
  idp_type text NOT NULL CHECK (idp_type IN ('okta','google','entra','onelogin','jumpcloud','other')),
  idp_metadata_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review','active','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  activated_at timestamptz
);
ALTER TABLE public.sso_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner can manage their SSO config" ON public.sso_configs;
CREATE POLICY "Owner can manage their SSO config"
  ON public.sso_configs FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- ─── Done ────────────────────────────────────────────────────────────
SELECT 'agency-buildout migration applied' AS status;
