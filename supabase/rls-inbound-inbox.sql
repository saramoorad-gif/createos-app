-- ─────────────────────────────────────────────────────────────────
-- Enable RLS + owner-only policies for
--   public.inbound_inquiries
--   public.inbox_emails
--
-- Fixes the Supabase linter alert "RLS Disabled in Public" on both
-- tables. Both have a user_id column referencing the owning user.
-- Client-side code only reads + updates them; inserts happen
-- server-side via the service role (which bypasses RLS), so no
-- INSERT policy is required and in fact omitting it is more secure.
--
-- Safe to re-run.
-- ─────────────────────────────────────────────────────────────────

-- ── inbound_inquiries ────────────────────────────────────────────
alter table public.inbound_inquiries enable row level security;

drop policy if exists "Owner can read own inquiries"   on public.inbound_inquiries;
drop policy if exists "Owner can update own inquiries" on public.inbound_inquiries;
drop policy if exists "Owner can delete own inquiries" on public.inbound_inquiries;

create policy "Owner can read own inquiries"
  on public.inbound_inquiries
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Owner can update own inquiries"
  on public.inbound_inquiries
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Owner can delete own inquiries"
  on public.inbound_inquiries
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- ── inbox_emails ─────────────────────────────────────────────────
alter table public.inbox_emails enable row level security;

drop policy if exists "Owner can read own inbox emails"   on public.inbox_emails;
drop policy if exists "Owner can update own inbox emails" on public.inbox_emails;
drop policy if exists "Owner can delete own inbox emails" on public.inbox_emails;

create policy "Owner can read own inbox emails"
  on public.inbox_emails
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Owner can update own inbox emails"
  on public.inbox_emails
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Owner can delete own inbox emails"
  on public.inbox_emails
  for delete
  to authenticated
  using (auth.uid() = user_id);
