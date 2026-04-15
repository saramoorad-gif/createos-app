-- Admin portal: error logs table for tracking bugs and issues

create table if not exists public.error_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  user_email text,
  level text not null default 'error' check (level in ('error', 'warning', 'info')),
  source text not null,
  message text not null,
  stack text,
  metadata jsonb default '{}'::jsonb,
  user_agent text,
  url text,
  resolved boolean default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_error_logs_created on public.error_logs(created_at desc);
create index if not exists idx_error_logs_level on public.error_logs(level);
create index if not exists idx_error_logs_resolved on public.error_logs(resolved);

-- Only service role can read/write error logs (admin portal uses service role)
alter table public.error_logs enable row level security;

-- No user access — only accessed via server-side admin API with service role
create policy "No direct access" on public.error_logs for all using (false);
