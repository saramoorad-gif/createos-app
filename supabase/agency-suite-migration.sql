-- Agency Suite Complete Migration
-- Run in Supabase SQL editor

-- ─── Agency Brands (CRM) ─────────────────────────────────────────
create table if not exists public.agency_brands (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid not null references public.profiles(id) on delete cascade,
  brand_name text not null,
  category text,
  contact_name text,
  contact_email text,
  notes text,
  status text not null check (status in ('active','warm','cold','blacklisted')) default 'active',
  deals_completed integer default 0,
  total_deal_value numeric(10,2) default 0,
  last_deal_date date,
  created_at timestamptz not null default now()
);
alter table public.agency_brands enable row level security;
create policy "Agency brands" on public.agency_brands for all using (agency_id = auth.uid());

-- ─── Agency Tasks ────────────────────────────────────────────────
create table if not exists public.agency_tasks (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  assigned_to uuid references public.profiles(id),
  created_by uuid not null references public.profiles(id),
  due_date date,
  priority text check (priority in ('low','medium','high','urgent')) default 'medium',
  status text not null check (status in ('todo','in_progress','done')) default 'todo',
  linked_deal_id uuid references public.deals(id),
  linked_creator_id uuid references public.profiles(id),
  linked_campaign_id uuid references public.campaigns(id),
  created_at timestamptz not null default now()
);
alter table public.agency_tasks enable row level security;
create policy "Agency tasks" on public.agency_tasks for all using (agency_id = auth.uid());

-- ─── Agency Channels ─────────────────────────────────────────────
create table if not exists public.agency_channels (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  visibility text not null check (visibility in ('all','managers','custom')) default 'all',
  created_by uuid references public.profiles(id),
  archived boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.agency_channels enable row level security;
create policy "Agency channels" on public.agency_channels for all using (agency_id = auth.uid());

-- ─── Agency Channel Members ──────────────────────────────────────
create table if not exists public.agency_channel_members (
  id uuid primary key default uuid_generate_v4(),
  channel_id uuid not null references public.agency_channels(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  joined_at timestamptz not null default now()
);
alter table public.agency_channel_members enable row level security;
create policy "Channel members" on public.agency_channel_members for all using (
  exists (select 1 from public.agency_channels c where c.id = channel_id and c.agency_id = auth.uid())
);

-- ─── Agency Channel Messages ─────────────────────────────────────
create table if not exists public.agency_channel_messages (
  id uuid primary key default uuid_generate_v4(),
  channel_id uuid not null references public.agency_channels(id) on delete cascade,
  agency_id uuid not null references public.profiles(id),
  sender_id uuid not null references public.profiles(id),
  content text not null,
  pinned boolean not null default false,
  parent_message_id uuid references public.agency_channel_messages(id),
  created_at timestamptz not null default now(),
  edited_at timestamptz
);
alter table public.agency_channel_messages enable row level security;
create policy "Channel messages" on public.agency_channel_messages for all using (agency_id = auth.uid());

-- ─── Agency Message Reactions ────────────────────────────────────
create table if not exists public.agency_message_reactions (
  id uuid primary key default uuid_generate_v4(),
  message_id uuid not null references public.agency_channel_messages(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  emoji text not null,
  created_at timestamptz not null default now()
);
alter table public.agency_message_reactions enable row level security;
create policy "Message reactions" on public.agency_message_reactions for all using (user_id = auth.uid());

-- ─── Agency Inbox Threads ────────────────────────────────────────
create table if not exists public.agency_inbox_threads (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid not null references public.profiles(id) on delete cascade,
  creator_id uuid not null references public.profiles(id),
  assigned_to uuid references public.profiles(id),
  status text not null check (status in ('open','in_progress','resolved')) default 'open',
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.agency_inbox_threads enable row level security;
create policy "Inbox threads" on public.agency_inbox_threads for all using (agency_id = auth.uid());

-- ─── Agency Inbox Messages ───────────────────────────────────────
create table if not exists public.agency_inbox_messages (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid not null references public.agency_inbox_threads(id) on delete cascade,
  sender_type text not null check (sender_type in ('creator','agency')),
  sender_id uuid not null references public.profiles(id),
  content text not null,
  internal_note boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.agency_inbox_messages enable row level security;
create policy "Inbox messages" on public.agency_inbox_messages for all using (
  exists (select 1 from public.agency_inbox_threads t where t.id = thread_id and t.agency_id = auth.uid())
);

-- ─── Agency Activity Log ─────────────────────────────────────────
create table if not exists public.agency_activity_log (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid not null references public.profiles(id),
  action_type text not null,
  target_type text,
  target_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.agency_activity_log enable row level security;
create policy "Activity log" on public.agency_activity_log for all using (agency_id = auth.uid());

-- ─── Agency Presence ─────────────────────────────────────────────
create table if not exists public.agency_presence (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid not null references public.profiles(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  last_seen_at timestamptz not null default now(),
  unique(agency_id, user_id)
);
alter table public.agency_presence enable row level security;
create policy "Presence" on public.agency_presence for all using (agency_id = auth.uid());

-- ─── Agency Settings ─────────────────────────────────────────────
create table if not exists public.agency_settings (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid not null references public.profiles(id) on delete cascade unique,
  logo_url text,
  bio text,
  contact_name text,
  contact_email text,
  contact_phone text,
  website text,
  instagram text,
  linkedin text,
  tiktok text,
  agency_type text,
  niche_tags text[] default '{}',
  founded_year integer,
  headquarters text,
  timezone text default 'America/New_York',
  default_commission_rate numeric(5,2) default 20,
  default_payment_terms text default 'net_30',
  default_contract_template_id uuid,
  auto_create_invoice boolean default false,
  deal_expiry_alert_days integer default 3,
  exclusivity_check_on_new_deal boolean default true,
  auto_approve_creators boolean default false,
  email_notifications jsonb default '{}'::jsonb,
  inapp_notifications jsonb default '{}'::jsonb,
  daily_digest boolean default false,
  digest_time text default '08:00',
  weekly_report boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.agency_settings enable row level security;
create policy "Agency settings" on public.agency_settings for all using (agency_id = auth.uid());

-- ─── Campaign Templates ──────────────────────────────────────────
create table if not exists public.campaign_templates (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  default_deliverables jsonb default '[]'::jsonb,
  default_budget numeric(10,2),
  created_at timestamptz not null default now()
);
alter table public.campaign_templates enable row level security;
create policy "Campaign templates" on public.campaign_templates for all using (agency_id = auth.uid());

-- Add agency_role to profiles if not exists
alter table public.profiles add column if not exists agency_role text check (agency_role in ('owner','manager','assistant'));
