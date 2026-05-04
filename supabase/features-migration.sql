-- New feature tables

-- Expenses (for tax prep)
create table if not exists public.expenses (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  category text not null,
  amount numeric(10,2) not null,
  date date not null,
  description text,
  created_at timestamptz not null default now()
);
alter table public.expenses enable row level security;
drop policy if exists "Own expenses" on public.expenses;
create policy "Own expenses" on public.expenses for all using (creator_id = auth.uid());

-- Content calendar entries
create table if not exists public.content_calendar (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  title text not null,
  type text not null check (type in ('sponsored', 'organic', 'collab')),
  platform text,
  brand text,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.content_calendar enable row level security;
drop policy if exists "Own calendar" on public.content_calendar;
create policy "Own calendar" on public.content_calendar for all using (creator_id = auth.uid());

-- Content briefs
create table if not exists public.briefs (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  agency_id uuid references public.profiles(id),
  brand_name text not null,
  campaign_name text,
  brief_text text,
  deliverables jsonb default '[]'::jsonb,
  due_date date,
  status text not null check (status in ('received', 'in_progress', 'submitted', 'approved', 'revision_requested')) default 'received',
  created_at timestamptz not null default now()
);
alter table public.briefs enable row level security;
drop policy if exists "Own briefs" on public.briefs;
create policy "Own briefs" on public.briefs for all using (creator_id = auth.uid());
