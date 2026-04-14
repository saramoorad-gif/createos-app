-- Income tracking tables

create table if not exists public.affiliate_links (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null,
  nickname text not null,
  url text,
  category text,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.affiliate_links enable row level security;
create policy "Own affiliate links" on public.affiliate_links for all using (creator_id = auth.uid());

create table if not exists public.affiliate_earnings (
  id uuid primary key default uuid_generate_v4(),
  link_id uuid not null references public.affiliate_links(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  month text not null,
  amount numeric(10,2) not null default 0,
  notes text,
  logged_at timestamptz not null default now()
);
alter table public.affiliate_earnings enable row level security;
create policy "Own affiliate earnings" on public.affiliate_earnings for all using (creator_id = auth.uid());

create table if not exists public.stan_store_connections (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  username text,
  api_key text,
  connected_at timestamptz not null default now(),
  status text not null check (status in ('connected','disconnected','pending')) default 'pending'
);
alter table public.stan_store_connections enable row level security;
create policy "Own stan store" on public.stan_store_connections for all using (creator_id = auth.uid());

create table if not exists public.stan_store_earnings (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  month text not null,
  product_name text,
  units_sold integer default 0,
  revenue numeric(10,2) not null default 0,
  synced_at timestamptz not null default now()
);
alter table public.stan_store_earnings enable row level security;
create policy "Own stan store earnings" on public.stan_store_earnings for all using (creator_id = auth.uid());
