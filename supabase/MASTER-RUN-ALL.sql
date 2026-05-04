-- ══════════════════════════════════════════════════════════════════
-- CreateOS — MASTER SQL SCRIPT
-- Run this ENTIRE script in one go in Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════════

-- Enable UUID generation
create extension if not exists "uuid-ossp";


-- ══════════════════════════════════════════════════════════════════
-- 1. BASE SCHEMA — users, deals, invoices, inbox, inbound
-- ══════════════════════════════════════════════════════════════════

create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  email text unique not null,
  avatar_url text,
  tier text not null check (tier in ('ugc_creator', 'influencer')),
  platforms jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.deals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  brand_name text not null,
  brand_logo text,
  stage text not null check (stage in ('lead', 'negotiating', 'contracted', 'in_progress', 'delivered', 'paid')),
  value numeric(10, 2) not null default 0,
  deliverables text,
  platform text check (platform in ('tiktok', 'instagram', 'youtube')),
  due_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_deals_user_id on public.deals(user_id);
create index if not exists idx_deals_stage on public.deals(stage);

create table if not exists public.invoices (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  deal_id uuid references public.deals(id) on delete set null,
  brand_name text not null,
  amount numeric(10, 2) not null,
  status text not null check (status in ('draft', 'sent', 'paid', 'overdue')),
  due_date date not null,
  paid_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_invoices_user_id on public.invoices(user_id);
create index if not exists idx_invoices_status on public.invoices(status);

create table if not exists public.inbox_emails (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  provider text not null check (provider in ('gmail', 'outlook')),
  from_name text not null,
  from_email text not null,
  subject text not null,
  preview text,
  is_brand_deal boolean not null default false,
  brand_name text,
  is_read boolean not null default false,
  is_starred boolean not null default false,
  received_at timestamptz not null default now()
);

create index if not exists idx_inbox_emails_user_id on public.inbox_emails(user_id);

create table if not exists public.inbound_inquiries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  brand_name text not null,
  contact_name text not null,
  contact_email text not null,
  message text,
  budget_range text,
  platforms_requested jsonb not null default '[]'::jsonb,
  status text not null check (status in ('new', 'reviewed', 'added_to_pipeline', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_inbound_inquiries_user_id on public.inbound_inquiries(user_id);

-- Updated at trigger
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_users_updated_at before update on public.users for each row execute function public.update_updated_at_column();
create trigger update_deals_updated_at before update on public.deals for each row execute function public.update_updated_at_column();
create trigger update_invoices_updated_at before update on public.invoices for each row execute function public.update_updated_at_column();
create trigger update_inbound_inquiries_updated_at before update on public.inbound_inquiries for each row execute function public.update_updated_at_column();


-- ══════════════════════════════════════════════════════════════════
-- 2. PROFILES — linked to Supabase Auth
-- ══════════════════════════════════════════════════════════════════

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  account_type text not null check (account_type in ('ugc', 'influencer', 'agency')),
  agency_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create trigger update_profiles_updated_at before update on public.profiles for each row execute function public.update_updated_at_column();


-- ══════════════════════════════════════════════════════════════════
-- 3. PRICING TIERS — expand account types + agency fields
-- ══════════════════════════════════════════════════════════════════

alter table public.profiles drop constraint if exists profiles_account_type_check;
alter table public.profiles add constraint profiles_account_type_check
  check (account_type in ('free', 'ugc', 'ugc_influencer', 'agency'));

alter table public.profiles
  add column if not exists agency_plan text check (agency_plan in ('starter', 'growth')),
  add column if not exists roster_size text check (roster_size in ('1-5', '6-15', '16-40', '40+')),
  add column if not exists agency_role text check (agency_role in ('owner', 'manager', 'assistant')),
  add column if not exists agency_invite_code text unique,
  add column if not exists linked_agency_id uuid references public.profiles(id),
  add column if not exists has_agency boolean not null default false;


-- ══════════════════════════════════════════════════════════════════
-- 4. AGENCY SYSTEM — links, activity log, deal updates, RLS
-- ══════════════════════════════════════════════════════════════════

create table if not exists public.agency_creator_links (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid not null references public.profiles(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  commission_rate numeric(5, 2) not null default 15.00,
  status text not null check (status in ('active', 'pending', 'disconnected')) default 'active',
  linked_at timestamptz not null default now(),
  disconnected_at timestamptz,
  unique(agency_id, creator_id)
);

create index if not exists idx_agency_links_agency on public.agency_creator_links(agency_id) where status = 'active';
create index if not exists idx_agency_links_creator on public.agency_creator_links(creator_id) where status = 'active';

create table if not exists public.activity_log (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid not null references public.profiles(id) on delete cascade,
  actor_type text not null check (actor_type in ('creator', 'agency')),
  action text not null,
  target_id uuid not null,
  target_type text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_log_actor on public.activity_log(actor_id, created_at desc);

-- Update deals table for agency support
alter table public.deals
  add column if not exists deal_type text,
  add column if not exists exclusivity_days integer,
  add column if not exists exclusivity_category text,
  add column if not exists created_by_agency boolean not null default false,
  add column if not exists agency_id uuid references public.profiles(id),
  add column if not exists creator_id uuid references public.profiles(id);

alter table public.deals drop constraint if exists deals_stage_check;
alter table public.deals add constraint deals_stage_check
  check (stage in ('lead', 'pitched', 'negotiating', 'contracted', 'in_progress', 'delivered', 'paid'));

-- Update invoices for agency support
alter table public.invoices
  add column if not exists created_by_agency boolean not null default false,
  add column if not exists agency_id uuid references public.profiles(id),
  add column if not exists creator_id uuid references public.profiles(id),
  add column if not exists invoice_number text;

-- Deal notes
create table if not exists public.deal_notes (
  id uuid primary key default uuid_generate_v4(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  author_type text not null check (author_type in ('creator', 'agency')),
  content text not null,
  created_at timestamptz not null default now()
);

-- Contracts
create table if not exists public.contracts (
  id uuid primary key default uuid_generate_v4(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  creator_id uuid not null references public.profiles(id),
  uploaded_by uuid not null references public.profiles(id),
  uploaded_by_type text not null check (uploaded_by_type in ('creator', 'agency')),
  file_url text not null,
  file_name text not null,
  ai_analysis jsonb,
  created_at timestamptz not null default now()
);

-- RLS on agency tables
alter table public.agency_creator_links enable row level security;
create policy "View own links" on public.agency_creator_links for select using (auth.uid() = agency_id or auth.uid() = creator_id);
create policy "Create links" on public.agency_creator_links for insert with check (auth.uid() = agency_id);
create policy "Update links" on public.agency_creator_links for update using (auth.uid() = agency_id or auth.uid() = creator_id);

create or replace function public.is_agency_for(p_creator_id uuid)
returns boolean as $$
begin
  return exists (select 1 from public.agency_creator_links where agency_id = auth.uid() and creator_id = p_creator_id and status = 'active');
end;
$$ language plpgsql security definer;

alter table public.deals enable row level security;
create policy "Own deals" on public.deals for all using (auth.uid() = user_id or auth.uid() = creator_id);
create policy "Agency read deals" on public.deals for select using (public.is_agency_for(coalesce(creator_id, user_id)));
create policy "Agency insert deals" on public.deals for insert with check (created_by_agency = true and agency_id = auth.uid());
create policy "Agency update deals" on public.deals for update using (public.is_agency_for(coalesce(creator_id, user_id)));

alter table public.invoices enable row level security;
create policy "Own invoices" on public.invoices for all using (auth.uid() = user_id or auth.uid() = creator_id);
create policy "Agency read invoices" on public.invoices for select using (public.is_agency_for(coalesce(creator_id, user_id)));
create policy "Agency insert invoices" on public.invoices for insert with check (created_by_agency = true and agency_id = auth.uid());

alter table public.contracts enable row level security;
create policy "Own contracts" on public.contracts for select using (auth.uid() = creator_id);
create policy "Agency contracts" on public.contracts for select using (public.is_agency_for(creator_id));
create policy "Agency upload contracts" on public.contracts for insert with check (uploaded_by = auth.uid());

alter table public.deal_notes enable row level security;
create policy "Read deal notes" on public.deal_notes for select using (author_id = auth.uid());
create policy "Insert deal notes" on public.deal_notes for insert with check (author_id = auth.uid());

alter table public.activity_log enable row level security;
create policy "Read own activity" on public.activity_log for select using (actor_id = auth.uid());
create policy "Insert own activity" on public.activity_log for insert with check (actor_id = auth.uid());


-- ══════════════════════════════════════════════════════════════════
-- 5. AGENCY PM — campaigns, performance, growth, conflicts, payouts, team
-- ══════════════════════════════════════════════════════════════════

create table if not exists public.campaigns (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid not null references public.profiles(id) on delete cascade,
  brand_name text not null, brand_contact text, brief_text text, brief_file_url text,
  budget numeric(10,2) not null default 0, commission_rate numeric(5,2) not null default 15,
  start_date date, end_date date,
  status text not null check (status in ('planning','active','completed','paused')) default 'planning',
  created_at timestamptz not null default now()
);
alter table public.campaigns enable row level security;
create policy "Agency campaigns" on public.campaigns for all using (agency_id = auth.uid());

create table if not exists public.campaign_creators (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  creator_id uuid not null references public.profiles(id),
  budget_allocation numeric(10,2) default 0,
  deliverables jsonb not null default '[]'::jsonb,
  status text not null check (status in ('not_started','contracted','in_progress','delivered','approved')) default 'not_started'
);
alter table public.campaign_creators enable row level security;
create policy "Agency campaign creators" on public.campaign_creators for all using (exists (select 1 from public.campaigns c where c.id = campaign_id and c.agency_id = auth.uid()));

create table if not exists public.campaign_deliverables (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  creator_id uuid not null references public.profiles(id),
  type text not null, due_date date,
  status text not null check (status in ('not_started','in_progress','in_review','approved','published')) default 'not_started',
  content_url text, approval_status text check (approval_status in ('pending','approved','revision_requested')),
  notes text, created_at timestamptz not null default now()
);
alter table public.campaign_deliverables enable row level security;
create policy "Agency deliverables" on public.campaign_deliverables for all using (exists (select 1 from public.campaigns c where c.id = campaign_id and c.agency_id = auth.uid()));

create table if not exists public.agency_notes (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid not null references public.profiles(id) on delete cascade,
  creator_id uuid references public.profiles(id),
  campaign_id uuid references public.campaigns(id),
  body text not null, pinned boolean not null default false,
  tags text[] default '{}', created_at timestamptz not null default now()
);
alter table public.agency_notes enable row level security;
create policy "Agency notes" on public.agency_notes for all using (agency_id = auth.uid());

create table if not exists public.content_performance (
  id uuid primary key default uuid_generate_v4(),
  deal_id uuid references public.deals(id),
  creator_id uuid not null references public.profiles(id),
  views integer default 0, saves integer default 0, shares integer default 0,
  engagement_rate numeric(5,2) default 0, posted_at date,
  created_at timestamptz not null default now()
);
alter table public.content_performance enable row level security;
create policy "Performance access" on public.content_performance for all using (creator_id = auth.uid() or public.is_agency_for(creator_id));

create table if not exists public.creator_growth (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid not null references public.profiles(id),
  platform text not null, follower_count integer not null,
  recorded_at date not null default current_date
);
alter table public.creator_growth enable row level security;
create policy "Growth access" on public.creator_growth for all using (creator_id = auth.uid() or public.is_agency_for(creator_id));

create table if not exists public.conflict_log (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid not null references public.profiles(id) on delete cascade,
  creator_ids uuid[] not null, conflict_type text not null, category text,
  brand1 text, brand2 text, severity text check (severity in ('high','medium','low')),
  status text not null check (status in ('active','resolved','monitoring')) default 'active',
  resolution text, resolved_at timestamptz, created_at timestamptz not null default now()
);
alter table public.conflict_log enable row level security;
create policy "Agency conflicts" on public.conflict_log for all using (agency_id = auth.uid());

create table if not exists public.commission_payouts (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid not null references public.profiles(id) on delete cascade,
  creator_id uuid not null references public.profiles(id),
  deal_id uuid references public.deals(id),
  amount numeric(10,2) not null, rate numeric(5,2) not null,
  period text not null, paid_at timestamptz, notes text,
  created_at timestamptz not null default now()
);
alter table public.commission_payouts enable row level security;
create policy "Agency payouts" on public.commission_payouts for all using (agency_id = auth.uid());

create table if not exists public.agency_team (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid not null references public.profiles(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  role text not null check (role in ('owner','manager','assistant')),
  invited_at timestamptz not null default now(), accepted_at timestamptz
);
alter table public.agency_team enable row level security;
create policy "Team view" on public.agency_team for select using (agency_id = auth.uid() or user_id = auth.uid());
create policy "Team manage" on public.agency_team for all using (agency_id = auth.uid());


-- ══════════════════════════════════════════════════════════════════
-- 6. MESSAGING — threads, messages, tasks, announcements
-- ══════════════════════════════════════════════════════════════════

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
create policy "Agency threads" on public.message_threads for all using (agency_id = auth.uid());
create policy "Creator threads" on public.message_threads for select using (creator_id = auth.uid() and thread_type = 'creator_facing');

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
create policy "Agency messages" on public.messages for all using (exists (select 1 from public.message_threads t where t.id = thread_id and t.agency_id = auth.uid()));
create policy "Creator read messages" on public.messages for select using (exists (select 1 from public.message_threads t where t.id = thread_id and t.creator_id = auth.uid() and t.thread_type = 'creator_facing') and is_internal = false);
create policy "Creator send messages" on public.messages for insert with check (sender_id = auth.uid() and sender_type = 'creator');

create table if not exists public.creator_tasks (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  agency_id uuid not null references public.profiles(id),
  created_from_message_id uuid references public.messages(id),
  title text not null, due_date date,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.creator_tasks enable row level security;
create policy "Creator view tasks" on public.creator_tasks for select using (creator_id = auth.uid());
create policy "Creator update tasks" on public.creator_tasks for update using (creator_id = auth.uid());
create policy "Agency manage tasks" on public.creator_tasks for all using (agency_id = auth.uid());

create table if not exists public.announcements (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  sent_to text not null check (sent_to in ('all', 'selected')),
  selected_creator_ids uuid[] default '{}',
  sent_at timestamptz not null default now()
);
alter table public.announcements enable row level security;
create policy "Agency announcements" on public.announcements for all using (agency_id = auth.uid());


-- ══════════════════════════════════════════════════════════════════
-- DONE — All tables created with RLS policies
-- ══════════════════════════════════════════════════════════════════
