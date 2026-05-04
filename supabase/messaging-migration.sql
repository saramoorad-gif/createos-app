-- CreateOS Messaging System Migration
-- Run in Supabase SQL editor

-- ─── Message Threads ─────────────────────────────────────────────
create table if not exists public.message_threads (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid not null references public.profiles(id) on delete cascade,
  creator_id uuid references public.profiles(id),
  topic text not null,
  thread_type text not null check (thread_type in ('creator_facing', 'internal', 'brand_log')),
  last_message_at timestamptz not null default now(),
  unread_count_agency integer not null default 0,
  unread_count_creator integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.message_threads enable row level security;
create policy "Agency can manage threads" on public.message_threads for all using (agency_id = auth.uid());
create policy "Creators can read own threads" on public.message_threads for select using (creator_id = auth.uid() and thread_type = 'creator_facing');

-- ─── Messages ────────────────────────────────────────────────────
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid not null references public.message_threads(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  sender_type text not null check (sender_type in ('creator', 'agency_user')),
  body text not null,
  attachments jsonb default '[]'::jsonb,
  linked_object_type text check (linked_object_type in ('deal', 'invoice', 'contract', 'campaign')),
  linked_object_id uuid,
  is_internal boolean not null default false,
  is_urgent boolean not null default false,
  scheduled_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;
create policy "Agency can manage messages" on public.messages for all using (
  exists (select 1 from public.message_threads t where t.id = thread_id and t.agency_id = auth.uid())
);
create policy "Creators can read own messages" on public.messages for select using (
  exists (select 1 from public.message_threads t where t.id = thread_id and t.creator_id = auth.uid() and t.thread_type = 'creator_facing')
  and is_internal = false
);
create policy "Creators can send messages" on public.messages for insert with check (
  sender_id = auth.uid() and sender_type = 'creator'
  and exists (select 1 from public.message_threads t where t.id = thread_id and t.creator_id = auth.uid() and t.thread_type = 'creator_facing')
);

-- ─── Creator Tasks (from messages) ───────────────────────────────
create table if not exists public.creator_tasks (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  agency_id uuid not null references public.profiles(id),
  created_from_message_id uuid references public.messages(id),
  title text not null,
  due_date date,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.creator_tasks enable row level security;
create policy "Creators can view own tasks" on public.creator_tasks for select using (creator_id = auth.uid());
create policy "Creators can update own tasks" on public.creator_tasks for update using (creator_id = auth.uid());
create policy "Agency can manage tasks" on public.creator_tasks for all using (agency_id = auth.uid());

-- ─── Announcements ───────────────────────────────────────────────
create table if not exists public.announcements (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  sent_to text not null check (sent_to in ('all', 'selected')),
  selected_creator_ids uuid[] default '{}',
  sent_at timestamptz not null default now()
);
alter table public.announcements enable row level security;
create policy "Agency can manage announcements" on public.announcements for all using (agency_id = auth.uid());
