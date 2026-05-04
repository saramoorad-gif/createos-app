-- Audit hardening pass:
--   • Tighten contracts RLS so uploaded_by must equal auth.uid() (closes
--     the "OR uploaded_by IS NULL" loophole that let any authed user
--     create ownerless contracts).
--   • Add CHECK constraints on profiles so empty-string full_name/email
--     can't sneak in and break downstream UI/reports.
--   • Ensure the stripe_webhook_events idempotency table exists with
--     RLS open to the service role, so the webhook idempotency guard
--     actually works in production.
--
-- Safe to run multiple times — uses IF EXISTS / IF NOT EXISTS guards.

-- ─── contracts: drop the permissive insert policy and replace ────────
DROP POLICY IF EXISTS "Agencies can create contract drafts" ON public.contracts;

CREATE POLICY "Agencies can create contract drafts"
  ON public.contracts FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

-- ─── profiles: non-empty full_name + email ───────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_full_name_not_blank'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_full_name_not_blank
      CHECK (length(btrim(full_name)) > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_email_not_blank'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_email_not_blank
      CHECK (length(btrim(email)) > 0);
  END IF;
END$$;

-- ─── stripe_webhook_events: ensure exists ────────────────────────────
-- Webhook idempotency guard depends on this. If the migration in
-- stripe-webhook-idempotency.sql wasn't run yet, this catches it.
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  event_id text PRIMARY KEY,
  type text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS; this policy exists just so the table is
-- explicitly locked down against the anon key. No anon access by design.
DROP POLICY IF EXISTS "no anon access to webhook events" ON public.stripe_webhook_events;
CREATE POLICY "no anon access to webhook events"
  ON public.stripe_webhook_events FOR ALL
  USING (false)
  WITH CHECK (false);
