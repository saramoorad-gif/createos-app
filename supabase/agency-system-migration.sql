-- CreateOS Agency System Migration
-- Run in Supabase SQL editor

-- ─── Agency-Creator Links ────────────────────────────────────────

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

comment on table public.agency_creator_links is 'Links between agency accounts and creator accounts';

create index idx_agency_links_agency on public.agency_creator_links(agency_id) where status = 'active';
create index idx_agency_links_creator on public.agency_creator_links(creator_id) where status = 'active';

-- ─── Activity Log ────────────────────────────────────────────────

create table if not exists public.activity_log (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid not null references public.profiles(id) on delete cascade,
  actor_type text not null check (actor_type in ('creator', 'agency')),
  action text not null check (action in (
    'created_deal', 'updated_deal', 'uploaded_contract',
    'created_invoice', 'updated_invoice', 'added_note',
    'moved_stage', 'linked_creator', 'unlinked_creator'
  )),
  target_id uuid not null,
  target_type text not null check (target_type in ('deal', 'invoice', 'contract', 'note', 'link')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.activity_log is 'Audit trail of all agency and creator actions';

create index idx_activity_log_actor on public.activity_log(actor_id, created_at desc);
create index idx_activity_log_target on public.activity_log(target_id);

-- ─── Update deals table for agency support ───────────────────────

alter table public.deals
  add column if not exists deal_type text check (deal_type in ('ugc', 'influencer', 'both')),
  add column if not exists exclusivity_days integer,
  add column if not exists exclusivity_category text,
  add column if not exists created_by_agency boolean not null default false,
  add column if not exists agency_id uuid references public.profiles(id),
  add column if not exists creator_id uuid references public.profiles(id);

-- Update stage constraint to include 'pitched'
alter table public.deals drop constraint if exists deals_stage_check;
alter table public.deals add constraint deals_stage_check
  check (stage in ('lead', 'pitched', 'negotiating', 'contracted', 'in_progress', 'delivered', 'paid'));

-- ─── Update invoices table for agency support ────────────────────

alter table public.invoices
  add column if not exists created_by_agency boolean not null default false,
  add column if not exists agency_id uuid references public.profiles(id),
  add column if not exists creator_id uuid references public.profiles(id),
  add column if not exists invoice_number text;

-- ─── Deal Notes ──────────────────────────────────────────────────

create table if not exists public.deal_notes (
  id uuid primary key default uuid_generate_v4(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  author_type text not null check (author_type in ('creator', 'agency')),
  content text not null,
  created_at timestamptz not null default now()
);

create index idx_deal_notes_deal on public.deal_notes(deal_id, created_at desc);

-- ─── Contracts ───────────────────────────────────────────────────

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

create index idx_contracts_deal on public.contracts(deal_id);

-- ─── RLS Policies ────────────────────────────────────────────────

-- Agency-Creator Links
alter table public.agency_creator_links enable row level security;

create policy "Users can view their own links"
  on public.agency_creator_links for select
  using (auth.uid() = agency_id or auth.uid() = creator_id);

create policy "Agencies can create links"
  on public.agency_creator_links for insert
  with check (auth.uid() = agency_id);

create policy "Either party can update link status"
  on public.agency_creator_links for update
  using (auth.uid() = agency_id or auth.uid() = creator_id);

-- Helper function: check if user is agency for a creator
create or replace function public.is_agency_for(p_creator_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.agency_creator_links
    where agency_id = auth.uid()
      and creator_id = p_creator_id
      and status = 'active'
  );
end;
$$ language plpgsql security definer;

-- Deals: creators own + agencies for linked creators
alter table public.deals enable row level security;

create policy "Creators can manage own deals"
  on public.deals for all
  using (auth.uid() = user_id or auth.uid() = creator_id);

create policy "Agencies can read linked creator deals"
  on public.deals for select
  using (public.is_agency_for(coalesce(creator_id, user_id)));

create policy "Agencies can insert deals for linked creators"
  on public.deals for insert
  with check (
    created_by_agency = true
    and agency_id = auth.uid()
    and public.is_agency_for(creator_id)
  );

create policy "Agencies can update deals for linked creators"
  on public.deals for update
  using (public.is_agency_for(coalesce(creator_id, user_id)));

-- Invoices: same pattern
alter table public.invoices enable row level security;

create policy "Creators can manage own invoices"
  on public.invoices for all
  using (auth.uid() = user_id or auth.uid() = creator_id);

create policy "Agencies can read linked creator invoices"
  on public.invoices for select
  using (public.is_agency_for(coalesce(creator_id, user_id)));

create policy "Agencies can insert invoices for linked creators"
  on public.invoices for insert
  with check (
    created_by_agency = true
    and agency_id = auth.uid()
    and public.is_agency_for(creator_id)
  );

create policy "Agencies can update invoices for linked creators"
  on public.invoices for update
  using (public.is_agency_for(coalesce(creator_id, user_id)));

-- Contracts: agencies can insert for linked creators
alter table public.contracts enable row level security;

create policy "Creators can view own contracts"
  on public.contracts for select
  using (auth.uid() = creator_id);

create policy "Agencies can view linked creator contracts"
  on public.contracts for select
  using (public.is_agency_for(creator_id));

create policy "Agencies can upload contracts for linked creators"
  on public.contracts for insert
  with check (
    uploaded_by = auth.uid()
    and public.is_agency_for(creator_id)
  );

-- Deal Notes: agencies can insert for linked creators
alter table public.deal_notes enable row level security;

create policy "Users can read notes on accessible deals"
  on public.deal_notes for select
  using (
    exists (
      select 1 from public.deals d
      where d.id = deal_id
        and (d.user_id = auth.uid() or d.creator_id = auth.uid() or public.is_agency_for(coalesce(d.creator_id, d.user_id)))
    )
  );

create policy "Agencies can add notes to linked creator deals"
  on public.deal_notes for insert
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.deals d
      where d.id = deal_id
        and public.is_agency_for(coalesce(d.creator_id, d.user_id))
    )
  );

-- Activity Log: read own, agencies read linked
alter table public.activity_log enable row level security;

create policy "Users can read own activity"
  on public.activity_log for select
  using (actor_id = auth.uid());

create policy "Creators can read agency activity on their account"
  on public.activity_log for select
  using (
    exists (
      select 1 from public.agency_creator_links
      where agency_id = actor_id
        and creator_id = auth.uid()
        and status = 'active'
    )
  );

create policy "Anyone can insert own activity"
  on public.activity_log for insert
  with check (actor_id = auth.uid());

-- Profiles: ONLY the user themselves can update (agency CANNOT)
-- (already enforced by profiles-migration.sql)
