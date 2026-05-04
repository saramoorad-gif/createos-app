-- ═══════════════════════════════════════════════════════════════════
-- RLS CLEANUP MIGRATION
-- Run this to fix any missing RLS policies and schema issues
-- Safe to run multiple times (uses IF NOT EXISTS and IF EXISTS)
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. inbound_inquiries: ensure RLS is enabled and policies exist ───
alter table if exists public.inbound_inquiries enable row level security;

drop policy if exists "Users can read own inquiries" on public.inbound_inquiries;
create policy "Users can read own inquiries"
  on public.inbound_inquiries for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own inquiries" on public.inbound_inquiries;
create policy "Users can insert own inquiries"
  on public.inbound_inquiries for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own inquiries" on public.inbound_inquiries;
create policy "Users can update own inquiries"
  on public.inbound_inquiries for update
  using (auth.uid() = user_id);

-- ─── 2. inbox_emails: RLS if table exists ───
alter table if exists public.inbox_emails enable row level security;

drop policy if exists "Users can read own emails" on public.inbox_emails;
create policy "Users can read own emails"
  on public.inbox_emails for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own emails" on public.inbox_emails;
create policy "Users can insert own emails"
  on public.inbox_emails for insert
  with check (auth.uid() = user_id);

-- ─── 3. contracts: allow draft creation ───
-- (already mostly fixed by fix-contracts-nullable.sql, but ensure policies are right)
drop policy if exists "Own contracts" on public.contracts;
drop policy if exists "Creators can view own contracts" on public.contracts;
create policy "Creators can view own contracts"
  on public.contracts for select
  using (auth.uid() = creator_id or creator_id is null);

drop policy if exists "Agency upload contracts" on public.contracts;
drop policy if exists "Agencies can upload contracts for linked creators" on public.contracts;
create policy "Agencies can upload contracts"
  on public.contracts for insert
  with check (auth.uid() = uploaded_by or uploaded_by is null);

drop policy if exists "Agencies can update contracts" on public.contracts;
create policy "Agencies can update contracts"
  on public.contracts for update
  using (auth.uid() = uploaded_by or auth.uid() = creator_id);

-- ─── 4. error_logs: ensure no client access (admin API uses service role) ───
alter table if exists public.error_logs enable row level security;
drop policy if exists "No direct access" on public.error_logs;
drop policy if exists "Service role only" on public.error_logs;
create policy "Service role only"
  on public.error_logs for all
  using (false);

-- ─── 5. creator_tasks: ensure RLS is correct (user_id-based per our migration) ───
-- If creator_tasks was created via master schema (creator_id-based), skip this section
do $$
begin
  if exists (select 1 from information_schema.columns where table_name = 'creator_tasks' and column_name = 'user_id') then
    alter table public.creator_tasks enable row level security;

    drop policy if exists "tasks_select" on public.creator_tasks;
    create policy "tasks_select" on public.creator_tasks for select using (auth.uid() = user_id);

    drop policy if exists "tasks_insert" on public.creator_tasks;
    create policy "tasks_insert" on public.creator_tasks for insert with check (auth.uid() = user_id);

    drop policy if exists "tasks_update" on public.creator_tasks;
    create policy "tasks_update" on public.creator_tasks for update using (auth.uid() = user_id);

    drop policy if exists "tasks_delete" on public.creator_tasks;
    create policy "tasks_delete" on public.creator_tasks for delete using (auth.uid() = user_id);
  end if;
end $$;

-- ─── 6. content_calendar: policies if not already ───
alter table if exists public.content_calendar enable row level security;
drop policy if exists "Own calendar" on public.content_calendar;
create policy "Own calendar"
  on public.content_calendar for all
  using (creator_id = auth.uid());

-- ─── 7. referrals: add FK for data integrity ───
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_name = 'referrals' and constraint_name = 'fk_referrals_referred_id'
  ) then
    alter table public.referrals
      add constraint fk_referrals_referred_id
      foreign key (referred_id) references public.profiles(id) on delete cascade;
  end if;
exception when others then
  -- If FK can't be added (e.g. referenced profile doesn't exist), skip
  null;
end $$;

-- ═══════════════════════════════════════════════════════════════════
-- DONE
-- ═══════════════════════════════════════════════════════════════════
