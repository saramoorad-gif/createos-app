-- CreateOS Pricing Tiers Migration
-- Run in Supabase SQL editor

-- Expand account_type to include new tiers
alter table public.profiles drop constraint if exists profiles_account_type_check;
alter table public.profiles add constraint profiles_account_type_check
  check (account_type in ('free', 'ugc', 'ugc_influencer', 'agency'));

-- Add new fields
alter table public.profiles
  add column if not exists agency_plan text check (agency_plan in ('starter', 'growth')),
  add column if not exists roster_size text check (roster_size in ('1-5', '6-15', '16-40', '40+')),
  add column if not exists agency_role text check (agency_role in ('owner', 'manager', 'assistant')),
  add column if not exists agency_invite_code text unique,
  add column if not exists linked_agency_id uuid references public.profiles(id),
  add column if not exists has_agency boolean not null default false;
