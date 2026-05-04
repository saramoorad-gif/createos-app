-- ═══════════════════════════════════════════════════════════════════
-- AFFILIATE PROGRAM SCHEMA
--
-- Five tables for the full affiliate/commission system:
--   affiliates          — creators who refer others
--   affiliate_referrals — each signup attributed to an affiliate
--   commissions         — per-charge commission rows
--   payouts             — monthly aggregated Stripe transfers
--   referral_clicks     — click-level attribution for the funnel
--
-- The existing `referrals` table (from referral-migration.sql) is kept
-- for backwards compat. New code reads from these new tables.
--
-- Safe to run multiple times (uses IF NOT EXISTS).
-- ═══════════════════════════════════════════════════════════════════

-- ─── Affiliates ─────────────────────────────────────────────────────

create table if not exists public.affiliates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  promo_code text unique not null,
  display_name text not null,
  instagram_handle text,
  follower_tier text check (follower_tier in ('10k-50k', '50k-150k', '150k-500k', '500k+')),
  motivation text,
  status text not null default 'pending' check (status in ('pending', 'active', 'paused', 'terminated')),
  stripe_connect_account_id text,
  stripe_connect_onboarded boolean not null default false,
  terms_accepted_at timestamptz,
  terms_version text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_affiliates_user on public.affiliates(user_id);
create index if not exists idx_affiliates_promo_code on public.affiliates(promo_code);
create index if not exists idx_affiliates_status on public.affiliates(status);

-- ─── Affiliate Referrals ────────────────────────────────────────────

create table if not exists public.affiliate_referrals (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete restrict,
  referred_user_id uuid references public.profiles(id) on delete set null,
  attribution_method text not null check (attribution_method in ('link', 'code')),
  clicked_at timestamptz,
  signed_up_at timestamptz,
  first_paid_at timestamptz,
  commission_ends_at timestamptz,
  status text not null default 'clicked' check (status in ('clicked', 'signed_up', 'paying', 'churned', 'refunded', 'graduated')),
  plan_tier text,
  stripe_subscription_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_aff_referrals_affiliate on public.affiliate_referrals(affiliate_id);
create index if not exists idx_aff_referrals_user on public.affiliate_referrals(referred_user_id);
create index if not exists idx_aff_referrals_status on public.affiliate_referrals(status);

-- ─── Commissions ────────────────────────────────────────────────────

create table if not exists public.commissions (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete restrict,
  referral_id uuid not null references public.affiliate_referrals(id) on delete restrict,
  stripe_charge_id text unique not null,
  stripe_invoice_id text,
  charge_amount_cents integer not null,
  commission_amount_cents integer not null,
  charged_at timestamptz not null,
  releases_at timestamptz not null,
  status text not null default 'held' check (status in ('held', 'payable', 'paid', 'voided')),
  voided_reason text,
  payout_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists idx_commissions_affiliate on public.commissions(affiliate_id);
create index if not exists idx_commissions_status on public.commissions(status);
create index if not exists idx_commissions_releases on public.commissions(releases_at) where status = 'held';

-- ─── Payouts ────────────────────────────────────────────────────────

create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete restrict,
  amount_cents integer not null,
  stripe_transfer_id text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  period_start date not null,
  period_end date not null,
  paid_at timestamptz,
  failure_reason text,
  created_at timestamptz not null default now()
);

create index if not exists idx_payouts_affiliate on public.payouts(affiliate_id);
create index if not exists idx_payouts_status on public.payouts(status);

-- Now add the FK from commissions.payout_id to payouts.id
-- (deferred because payouts table must exist first)
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'fk_commissions_payout'
  ) then
    alter table public.commissions
      add constraint fk_commissions_payout
      foreign key (payout_id) references public.payouts(id) on delete set null;
  end if;
exception when others then null;
end $$;

-- ─── Referral Clicks ────────────────────────────────────────────────

create table if not exists public.referral_clicks (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  cookie_id text not null,
  ip_hash text,
  user_agent text,
  referer text,
  landing_page text,
  clicked_at timestamptz not null default now()
);

create index if not exists idx_clicks_affiliate on public.referral_clicks(affiliate_id);
create index if not exists idx_clicks_cookie on public.referral_clicks(cookie_id);

-- ═══════════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════

-- Affiliates: users can read their own row. Service role does writes.
alter table public.affiliates enable row level security;
drop policy if exists "affiliates_own" on public.affiliates;
create policy "affiliates_own" on public.affiliates
  for select using (auth.uid() = user_id);
-- Allow authenticated users to insert their own application
drop policy if exists "affiliates_apply" on public.affiliates;
create policy "affiliates_apply" on public.affiliates
  for insert with check (auth.uid() = user_id);

-- Affiliate referrals: affiliate can read their own referrals.
alter table public.affiliate_referrals enable row level security;
drop policy if exists "aff_referrals_own" on public.affiliate_referrals;
create policy "aff_referrals_own" on public.affiliate_referrals
  for select using (
    affiliate_id in (select id from public.affiliates where user_id = auth.uid())
  );

-- Commissions: affiliate can read their own.
alter table public.commissions enable row level security;
drop policy if exists "commissions_own" on public.commissions;
create policy "commissions_own" on public.commissions
  for select using (
    affiliate_id in (select id from public.affiliates where user_id = auth.uid())
  );

-- Payouts: affiliate can read their own.
alter table public.payouts enable row level security;
drop policy if exists "payouts_own" on public.payouts;
create policy "payouts_own" on public.payouts
  for select using (
    affiliate_id in (select id from public.affiliates where user_id = auth.uid())
  );

-- Referral clicks: service role only (no user reads).
alter table public.referral_clicks enable row level security;
drop policy if exists "clicks_service_only" on public.referral_clicks;
create policy "clicks_service_only" on public.referral_clicks
  for all using (false);

-- ═══════════════════════════════════════════════════════════════════
-- DONE. Run this in Supabase SQL Editor.
-- ═══════════════════════════════════════════════════════════════════
