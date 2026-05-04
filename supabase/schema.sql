-- createOS Database Schema
-- Supabase PostgreSQL

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ─── Users ───────────────────────────────────────────────────────

create table public.users (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  email text unique not null,
  avatar_url text,
  tier text not null check (tier in ('ugc_creator', 'influencer')),
  platforms jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.users is 'Creator profiles with tier info and connected platforms';

-- ─── Deals ───────────────────────────────────────────────────────

create table public.deals (
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

comment on table public.deals is 'Brand deal pipeline — tracks deals from lead to paid';

create index idx_deals_user_id on public.deals(user_id);
create index idx_deals_stage on public.deals(stage);

-- ─── Invoices ────────────────────────────────────────────────────

create table public.invoices (
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

comment on table public.invoices is 'Invoices linked to deals with payment tracking';

create index idx_invoices_user_id on public.invoices(user_id);
create index idx_invoices_status on public.invoices(status);

-- ─── Inbox Emails ────────────────────────────────────────────────

create table public.inbox_emails (
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

comment on table public.inbox_emails is 'Unified inbox pulling from Gmail and Outlook with brand detection';

create index idx_inbox_emails_user_id on public.inbox_emails(user_id);
create index idx_inbox_emails_received_at on public.inbox_emails(received_at desc);
create index idx_inbox_emails_brand_deal on public.inbox_emails(is_brand_deal) where is_brand_deal = true;

-- ─── Inbound Inquiries ──────────────────────────────────────────

create table public.inbound_inquiries (
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

comment on table public.inbound_inquiries is 'Work With Me form submissions from brands';

create index idx_inbound_inquiries_user_id on public.inbound_inquiries(user_id);
create index idx_inbound_inquiries_status on public.inbound_inquiries(status);

-- ─── Updated At Triggers ─────────────────────────────────────────

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_users_updated_at
  before update on public.users
  for each row execute function public.update_updated_at_column();

create trigger update_deals_updated_at
  before update on public.deals
  for each row execute function public.update_updated_at_column();

create trigger update_invoices_updated_at
  before update on public.invoices
  for each row execute function public.update_updated_at_column();

create trigger update_inbound_inquiries_updated_at
  before update on public.inbound_inquiries
  for each row execute function public.update_updated_at_column();
