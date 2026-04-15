-- Creator referral system
-- Creators can share an affiliate link: createsuite.co/signup?ref={their_code}
-- New signups who use the link get 1 month of Influencer plan at UGC price ($27 instead of $39)

-- Add referral fields to profiles
alter table public.profiles
  add column if not exists referral_code text unique,
  add column if not exists referred_by_code text,
  add column if not exists referral_applied boolean default false;

-- Index for fast lookup
create index if not exists idx_profiles_referral_code on public.profiles(referral_code);
create index if not exists idx_profiles_referred_by on public.profiles(referred_by_code);

-- Auto-generate referral code for all existing users that don't have one
-- Using random 8-char uppercase alphanumeric
update public.profiles
set referral_code = upper(substring(md5(random()::text || id::text) from 1 for 8))
where referral_code is null;

-- Referral tracking table
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null,
  referred_id uuid not null,
  referrer_code text not null,
  status text not null default 'signup' check (status in ('signup', 'converted', 'churned')),
  discount_applied boolean default false,
  created_at timestamptz not null default now(),
  converted_at timestamptz
);

create index if not exists idx_referrals_referrer on public.referrals(referrer_id);
create index if not exists idx_referrals_referred on public.referrals(referred_id);

-- RLS
alter table public.referrals enable row level security;

-- Creators can see their own referral records (people they referred)
create policy "Referrers can view their referrals"
  on public.referrals for select
  using (auth.uid() = referrer_id);

-- System can insert (via service role)
create policy "System can insert referrals"
  on public.referrals for insert
  with check (true);
