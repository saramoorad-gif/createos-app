-- CreateOS Agency PM Platform Migration
-- Run in Supabase SQL editor

-- ─── Campaigns ───────────────────────────────────────────────────
create table if not exists public.campaigns (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid not null references public.profiles(id) on delete cascade,
  brand_name text not null,
  brand_contact text,
  brief_text text,
  brief_file_url text,
  budget numeric(10,2) not null default 0,
  commission_rate numeric(5,2) not null default 15,
  start_date date,
  end_date date,
  status text not null check (status in ('planning','active','completed','paused')) default 'planning',
  created_at timestamptz not null default now()
);
alter table public.campaigns enable row level security;
create policy "Agency can manage own campaigns" on public.campaigns for all using (agency_id = auth.uid());

-- ─── Campaign Creators ───────────────────────────────────────────
create table if not exists public.campaign_creators (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  creator_id uuid not null references public.profiles(id),
  budget_allocation numeric(10,2) default 0,
  deliverables jsonb not null default '[]'::jsonb,
  status text not null check (status in ('not_started','contracted','in_progress','delivered','approved')) default 'not_started'
);
alter table public.campaign_creators enable row level security;
create policy "Agency can manage campaign creators" on public.campaign_creators for all using (exists (select 1 from public.campaigns c where c.id = campaign_id and c.agency_id = auth.uid()));

-- ─── Campaign Deliverables ───────────────────────────────────────
create table if not exists public.campaign_deliverables (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  creator_id uuid not null references public.profiles(id),
  type text not null,
  due_date date,
  status text not null check (status in ('not_started','in_progress','in_review','approved','published')) default 'not_started',
  content_url text,
  approval_status text check (approval_status in ('pending','approved','revision_requested')),
  notes text,
  created_at timestamptz not null default now()
);
alter table public.campaign_deliverables enable row level security;
create policy "Agency can manage deliverables" on public.campaign_deliverables for all using (exists (select 1 from public.campaigns c where c.id = campaign_id and c.agency_id = auth.uid()));

-- ─── Agency Messages ─────────────────────────────────────────────
create table if not exists public.agency_messages (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid not null references public.profiles(id) on delete cascade,
  thread_id text not null,
  thread_type text not null check (thread_type in ('creator','brand','internal')),
  creator_id uuid references public.profiles(id),
  sender_type text not null check (sender_type in ('agency','creator','brand')),
  body text not null,
  attachments jsonb default '[]'::jsonb,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.agency_messages enable row level security;
create policy "Agency can manage messages" on public.agency_messages for all using (agency_id = auth.uid());
create policy "Creators can read own messages" on public.agency_messages for select using (creator_id = auth.uid());

-- ─── Agency Notes ────────────────────────────────────────────────
create table if not exists public.agency_notes (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid not null references public.profiles(id) on delete cascade,
  creator_id uuid references public.profiles(id),
  campaign_id uuid references public.campaigns(id),
  body text not null,
  pinned boolean not null default false,
  tags text[] default '{}',
  created_at timestamptz not null default now()
);
alter table public.agency_notes enable row level security;
create policy "Agency can manage notes" on public.agency_notes for all using (agency_id = auth.uid());

-- ─── Content Performance ─────────────────────────────────────────
create table if not exists public.content_performance (
  id uuid primary key default uuid_generate_v4(),
  deal_id uuid references public.deals(id),
  creator_id uuid not null references public.profiles(id),
  views integer default 0,
  saves integer default 0,
  shares integer default 0,
  engagement_rate numeric(5,2) default 0,
  posted_at date,
  created_at timestamptz not null default now()
);
alter table public.content_performance enable row level security;
create policy "Agency can view linked creator performance" on public.content_performance for all using (public.is_agency_for(creator_id) or creator_id = auth.uid());

-- ─── Creator Growth ──────────────────────────────────────────────
create table if not exists public.creator_growth (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid not null references public.profiles(id),
  platform text not null,
  follower_count integer not null,
  recorded_at date not null default current_date
);
alter table public.creator_growth enable row level security;
create policy "Agency can view linked creator growth" on public.creator_growth for all using (public.is_agency_for(creator_id) or creator_id = auth.uid());

-- ─── Conflict Log ────────────────────────────────────────────────
create table if not exists public.conflict_log (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid not null references public.profiles(id) on delete cascade,
  creator_ids uuid[] not null,
  conflict_type text not null,
  category text,
  brand1 text,
  brand2 text,
  severity text check (severity in ('high','medium','low')),
  status text not null check (status in ('active','resolved','monitoring')) default 'active',
  resolution text,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.conflict_log enable row level security;
create policy "Agency can manage conflicts" on public.conflict_log for all using (agency_id = auth.uid());

-- ─── Commission Payouts ──────────────────────────────────────────
create table if not exists public.commission_payouts (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid not null references public.profiles(id) on delete cascade,
  creator_id uuid not null references public.profiles(id),
  deal_id uuid references public.deals(id),
  amount numeric(10,2) not null,
  rate numeric(5,2) not null,
  period text not null,
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.commission_payouts enable row level security;
create policy "Agency can manage payouts" on public.commission_payouts for all using (agency_id = auth.uid());

-- ─── Agency Team ─────────────────────────────────────────────────
create table if not exists public.agency_team (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid not null references public.profiles(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  role text not null check (role in ('owner','manager','assistant')),
  invited_at timestamptz not null default now(),
  accepted_at timestamptz
);
alter table public.agency_team enable row level security;
create policy "Agency team can view own team" on public.agency_team for select using (agency_id = auth.uid() or user_id = auth.uid());
create policy "Owners can manage team" on public.agency_team for all using (agency_id = auth.uid());
