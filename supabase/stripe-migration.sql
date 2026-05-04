-- Stripe integration fields on profiles
alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status text check (subscription_status in ('active', 'past_due', 'cancelled', 'trialing')) default null;
