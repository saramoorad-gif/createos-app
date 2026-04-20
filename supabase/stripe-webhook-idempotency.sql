-- ─────────────────────────────────────────────────────────────────
-- Stripe webhook idempotency
--
-- Stripe retries webhook events if the endpoint doesn't return 200
-- within ~3s. Without a seen-events guard, any non-idempotent side
-- effect in the handler (profile upgrade, activity log row, email
-- send) can fire twice. The commissions table already has a unique
-- constraint on stripe_charge_id, so it's safe, but the rest of the
-- handler is not.
--
-- The API route INSERTs the event.id on every webhook call. On a
-- retry, the insert fails with 23505 and the handler no-ops.
-- ─────────────────────────────────────────────────────────────────

create table if not exists public.stripe_webhook_events (
  event_id    text primary key,
  type        text not null,
  received_at timestamptz not null default now()
);

-- Service role (used by the webhook handler) bypasses RLS, but we
-- still want RLS enabled so no client ever reads this table.
alter table public.stripe_webhook_events enable row level security;

-- No policies → no anon/authenticated access. Only service role can
-- read/write, which is what we want.

-- Index on received_at makes cleanup queries fast.
create index if not exists stripe_webhook_events_received_at_idx
  on public.stripe_webhook_events (received_at desc);

-- Optional: a housekeeping function you can schedule to drop rows
-- older than 30 days. Not required — the table stays tiny.
-- create or replace function public.prune_stripe_webhook_events()
-- returns void language sql as $$
--   delete from public.stripe_webhook_events
--   where received_at < now() - interval '30 days';
-- $$;
