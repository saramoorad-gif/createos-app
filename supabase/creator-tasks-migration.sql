-- Creator Tasks table
-- Standalone task list for creators (not tied to agency)

create table if not exists public.creator_tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  brand_name text,
  deal_id uuid,
  due_date date,
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  category text not null default 'content' check (category in ('content', 'admin', 'outreach', 'delivery', 'invoicing', 'other')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_creator_tasks_user_id on public.creator_tasks(user_id);
create index if not exists idx_creator_tasks_status on public.creator_tasks(status);
create index if not exists idx_creator_tasks_due_date on public.creator_tasks(due_date);

-- RLS
alter table public.creator_tasks enable row level security;

create policy "Users can view their own tasks"
  on public.creator_tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert their own tasks"
  on public.creator_tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on public.creator_tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete their own tasks"
  on public.creator_tasks for delete
  using (auth.uid() = user_id);
