-- CreateOS Contract Lifecycle Migration
-- Run in Supabase SQL editor

-- Update contracts table with lifecycle stage
alter table public.contracts
  add column if not exists stage text check (stage in ('draft','sent_to_brand','under_review','redlined','countersigned','fully_executed','archived')) default 'draft',
  add column if not exists contract_type text,
  add column if not exists value numeric(10,2),
  add column if not exists expiry_date date,
  add column if not exists exclusivity_category text,
  add column if not exists exclusivity_days integer,
  add column if not exists brand_name text;

-- Contract templates
create table if not exists public.contract_templates (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  type text not null,
  description text,
  body_template text not null,
  variables text[] default '{}',
  created_at timestamptz not null default now()
);
alter table public.contract_templates enable row level security;
create policy "Agency templates" on public.contract_templates for all using (agency_id = auth.uid());

-- Contract versions
create table if not exists public.contract_versions (
  id uuid primary key default uuid_generate_v4(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  version_number integer not null,
  file_url text not null,
  notes text,
  uploaded_at timestamptz not null default now(),
  uploaded_by uuid not null references public.profiles(id),
  is_final boolean not null default false
);
alter table public.contract_versions enable row level security;
create policy "Contract version access" on public.contract_versions for all using (
  exists (select 1 from public.contracts c where c.id = contract_id and (c.creator_id = auth.uid() or c.uploaded_by = auth.uid() or public.is_agency_for(c.creator_id)))
);

-- Contract analysis (AI)
create table if not exists public.contract_analysis (
  id uuid primary key default uuid_generate_v4(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  payment_terms jsonb not null default '{}'::jsonb,
  deliverables jsonb not null default '{}'::jsonb,
  rights jsonb not null default '{}'::jsonb,
  red_flags jsonb not null default '[]'::jsonb,
  amber_flags jsonb not null default '[]'::jsonb,
  negotiation_suggestions jsonb not null default '[]'::jsonb,
  overall_score text check (overall_score in ('Favorable','Neutral','Needs Negotiation','Creator Unfavorable')),
  analyzed_at timestamptz not null default now()
);
alter table public.contract_analysis enable row level security;
create policy "Analysis access" on public.contract_analysis for all using (
  exists (select 1 from public.contracts c where c.id = contract_id and (c.creator_id = auth.uid() or c.uploaded_by = auth.uid() or public.is_agency_for(c.creator_id)))
);

-- Contract signatures
create table if not exists public.contract_signatures (
  id uuid primary key default uuid_generate_v4(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  signer_id uuid references public.profiles(id),
  signer_type text not null check (signer_type in ('creator','brand','agency')),
  signer_name text not null,
  signed_at timestamptz,
  ip_address text,
  method text check (method in ('in_app','docusign')),
  status text not null check (status in ('pending','signed')) default 'pending'
);
alter table public.contract_signatures enable row level security;
create policy "Signature access" on public.contract_signatures for all using (
  exists (select 1 from public.contracts c where c.id = contract_id and (c.creator_id = auth.uid() or c.uploaded_by = auth.uid() or public.is_agency_for(c.creator_id)))
);

-- Contract alerts
create table if not exists public.contract_alerts (
  id uuid primary key default uuid_generate_v4(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  alert_type text not null check (alert_type in ('expiring_soon','usage_rights_expiring','payment_due','exclusivity_ending')),
  trigger_date date not null,
  message text not null,
  sent boolean not null default false,
  dismissed boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.contract_alerts enable row level security;
create policy "Alert access" on public.contract_alerts for all using (
  exists (select 1 from public.contracts c where c.id = contract_id and (c.creator_id = auth.uid() or c.uploaded_by = auth.uid() or public.is_agency_for(c.creator_id)))
);
