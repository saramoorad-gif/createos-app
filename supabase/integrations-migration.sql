-- Integration token storage on profiles
alter table public.profiles
  add column if not exists google_access_token text,
  add column if not exists google_refresh_token text,
  add column if not exists google_connected boolean not null default false,
  add column if not exists docusign_access_token text,
  add column if not exists docusign_refresh_token text,
  add column if not exists docusign_connected boolean not null default false;
