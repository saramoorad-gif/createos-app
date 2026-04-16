-- ═══════════════════════════════════════════════════════════════════
-- FIX LEGACY public.users FK CONSTRAINTS
--
-- Background:
-- The schema has TWO user-like tables:
--   public.users    — legacy, referenced by deals.user_id, invoices.user_id,
--                     inbox_emails.user_id, inbound_inquiries.user_id
--   public.profiles — current, populated on signup, drives the app
--
-- Nothing in the app populates public.users, so the FK constraints on
-- those four tables silently reject every creator-side INSERT. Creating
-- a deal, invoice, inbound inquiry, or cached email → foreign key error.
--
-- Fix: auto-populate public.users from auth.users via trigger, AND add
-- a safety net that inserts any missing profile user into public.users.
-- This avoids touching the schema structure or dropping FKs.
--
-- Safe to run multiple times.
-- ═══════════════════════════════════════════════════════════════════

-- 1. Make public.users tolerant of being called with minimal data.
-- full_name / email may have NOT NULL constraints — relax them if so.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'users' and column_name = 'full_name' and is_nullable = 'NO'
  ) then
    alter table public.users alter column full_name drop not null;
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'users' and column_name = 'email' and is_nullable = 'NO'
  ) then
    alter table public.users alter column email drop not null;
  end if;
end $$;

-- 2. Backfill: ensure every existing profile has a matching public.users row.
insert into public.users (id, full_name, email)
select p.id, coalesce(p.full_name, 'Creator'), coalesce(p.email, '')
from public.profiles p
where not exists (select 1 from public.users u where u.id = p.id)
on conflict (id) do nothing;

-- 3. Trigger: whenever a new row is inserted into public.profiles, mirror it
-- into public.users so the FK constraints on deals/invoices/etc. always pass.
create or replace function public.sync_profile_to_users()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users (id, full_name, email)
  values (
    new.id,
    coalesce(new.full_name, 'Creator'),
    coalesce(new.email, '')
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        email = excluded.email;
  return new;
end;
$$;

drop trigger if exists trg_sync_profile_to_users on public.profiles;
create trigger trg_sync_profile_to_users
  after insert or update of full_name, email on public.profiles
  for each row
  execute function public.sync_profile_to_users();

-- 4. RLS on public.users — allow users to read their own row (nothing
-- in the app reads this table currently, but lock it down regardless).
alter table public.users enable row level security;
drop policy if exists "Own user row" on public.users;
create policy "Own user row" on public.users for select using (auth.uid() = id);

-- ═══════════════════════════════════════════════════════════════════
-- DONE. After running, creating a deal/invoice/etc. will succeed because
-- the FK target row is guaranteed to exist.
-- ═══════════════════════════════════════════════════════════════════
