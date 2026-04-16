-- ═══════════════════════════════════════════════════════════════════
-- FIX LEGACY public.users FK CONSTRAINTS  (v2 — handles tier column)
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
-- Fix: backfill public.users from public.profiles, then install a trigger
-- that keeps them in sync forever. Relax every NOT NULL except `id` first
-- so we don't trip on surprise required columns.
--
-- Safe to run multiple times.
-- ═══════════════════════════════════════════════════════════════════

-- 1. Relax every NOT NULL on public.users except `id`, so the trigger
-- and backfill never fail on a surprise required column.
do $$
declare
  col record;
begin
  for col in
    select column_name
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'users'
      and column_name <> 'id'
      and is_nullable = 'NO'
  loop
    execute format('alter table public.users alter column %I drop not null', col.column_name);
  end loop;
end $$;

-- 2. Backfill: ensure every existing profile has a matching public.users row.
insert into public.users (id, full_name, email, tier)
select p.id,
       coalesce(p.full_name, 'Creator'),
       coalesce(p.email, ''),
       coalesce(p.account_type, 'free')
from public.profiles p
where not exists (select 1 from public.users u where u.id = p.id)
on conflict (id) do nothing;

-- 3. Trigger: mirror every future profile insert/update into public.users.
create or replace function public.sync_profile_to_users()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users (id, full_name, email, tier)
  values (
    new.id,
    coalesce(new.full_name, 'Creator'),
    coalesce(new.email, ''),
    coalesce(new.account_type, 'free')
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        email    = excluded.email,
        tier     = excluded.tier;
  return new;
end;
$$;

drop trigger if exists trg_sync_profile_to_users on public.profiles;
create trigger trg_sync_profile_to_users
  after insert or update of full_name, email, account_type on public.profiles
  for each row
  execute function public.sync_profile_to_users();

-- 4. RLS on public.users — lock it down.
alter table public.users enable row level security;
drop policy if exists "Own user row" on public.users;
create policy "Own user row" on public.users for select using (auth.uid() = id);

-- ═══════════════════════════════════════════════════════════════════
-- DONE. After running, creating a deal/invoice/etc. will succeed because
-- the FK target row is guaranteed to exist.
-- ═══════════════════════════════════════════════════════════════════
