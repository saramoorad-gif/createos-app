-- ═══════════════════════════════════════════════════════════════════
-- GIFT CODE SYSTEM
--
-- Lets admins issue comp codes that grant free access to a paid tier
-- for a specified duration (default 3 months). Used for:
--   - Onboarding affiliate creators with free access
--   - Press/partner comps
--   - Special offers
--
-- Codes are human-readable (e.g. BRI-FREE, PRESS-Q2-2026) and are
-- entered by the user at signup to skip the Stripe checkout step.
--
-- Safe to run multiple times (uses IF NOT EXISTS).
-- ═══════════════════════════════════════════════════════════════════

-- ─── Gift Codes ─────────────────────────────────────────────────────

create table if not exists public.gift_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  plan_tier text not null check (plan_tier in ('ugc', 'ugc_influencer', 'agency')),
  duration_months integer,  -- null = lifetime
  max_uses integer,          -- null = unlimited
  uses_count integer not null default 0,
  active boolean not null default true,
  expires_at timestamptz,    -- when the CODE itself stops working (null = never)
  notes text,                -- internal admin note
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_gift_codes_code on public.gift_codes(code);
create index if not exists idx_gift_codes_active on public.gift_codes(active) where active = true;

-- ─── Gift Code Redemptions ──────────────────────────────────────────

create table if not exists public.gift_code_redemptions (
  id uuid primary key default gen_random_uuid(),
  gift_code_id uuid not null references public.gift_codes(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  access_expires_at timestamptz,  -- when the user's free access ends (null = lifetime)
  warning_email_sent_at timestamptz,  -- 7-day expiry warning tracking
  expired_at timestamptz,              -- when the cron actually downgraded them
  created_at timestamptz not null default now(),
  unique (gift_code_id, user_id)  -- one user can't redeem the same code twice
);

create index if not exists idx_redemptions_user on public.gift_code_redemptions(user_id);
create index if not exists idx_redemptions_expires on public.gift_code_redemptions(access_expires_at)
  where expired_at is null;

-- ═══════════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════

-- Gift codes: service-role only (admins read/write via /api/admin routes).
alter table public.gift_codes enable row level security;
drop policy if exists "gift_codes_service_only" on public.gift_codes;
create policy "gift_codes_service_only" on public.gift_codes
  for all using (false);

-- Gift code redemptions: users can see their own redemptions.
alter table public.gift_code_redemptions enable row level security;
drop policy if exists "redemptions_own" on public.gift_code_redemptions;
create policy "redemptions_own" on public.gift_code_redemptions
  for select using (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════
-- DONE.
-- ═══════════════════════════════════════════════════════════════════
