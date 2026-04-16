# Monitoring Create Suite

You deployed — now how do you find out when something breaks? This guide walks through setting up automatic monitoring so bugs and outages wake you up instead of surprising your users.

Everything here is **free** at the scale you're launching at.

---

## The three layers you want

| Layer | What it catches | Tool |
|---|---|---|
| **Uptime** | Site is down, /api/health returning 503 | UptimeRobot (free) |
| **Runtime errors** | User hit a bug in the browser, API threw 500 | Built-in `error_logs` table + optional Sentry |
| **Business alerts** | Signup failed, Stripe webhook didn't fire | Cron check on Supabase tables |

Set up layer 1 first (5 minutes). It will tell you about ~80% of real problems.

---

## Layer 1: Uptime monitoring (UptimeRobot)

**Goal:** you get an email/SMS the moment your site goes down or a dependency breaks.

### What to monitor

Create Suite exposes a health endpoint at `GET /api/health` that returns:
- **200 OK** when everything's working
- **503 Service Unavailable** when Supabase, Stripe env vars, or a critical dependency is broken

The body is JSON with per-check details:

```json
{
  "status": "ok",
  "timestamp": "2026-04-16T...",
  "version": "abc1234",
  "total_ms": 340,
  "checks": {
    "env": { "ok": true, "ms": 1 },
    "supabase": { "ok": true, "ms": 290 },
    "stripe": { "ok": true, "ms": 1 }
  }
}
```

### Setup (5 minutes, free)

1. Go to **https://uptimerobot.com** → sign up with your email
2. Click **+ New Monitor**
3. Settings:
   - **Monitor Type:** HTTPS
   - **Friendly Name:** Create Suite Health
   - **URL:** `https://createsuite.co/api/health`
   - **Monitoring Interval:** 5 minutes (the free tier limit)
   - **Alert When:** *Keyword not found OR HTTP status code is not 2xx*
     - Optional: set keyword to `"status":"ok"` for an extra layer of check
4. Under **Alert Contacts**, add your email, phone for SMS, or a Slack webhook
5. Save

You'll now get an email within 5 minutes of any outage. If Supabase goes down, if your Stripe key breaks, if Vercel has a region outage — you'll know before a user does.

**Pro tip:** also add a monitor for `https://createsuite.co/` (your marketing homepage) with interval 5 min. That catches frontend build failures that `/api/health` might not.

### Alternative uptime services

- **Better Uptime** — 10 monitors free, better UI, built-in status page
- **Pingdom** — classic, 30-day free trial
- **Vercel Analytics** — built into Vercel dashboard, shows error rates and performance for free

---

## Layer 2: Runtime error tracking

**Goal:** when a user hits a bug in production, you see the stack trace.

### Option A: Use the built-in `error_logs` table (already wired up)

Create Suite already captures:

- **React component crashes** — via the `<ErrorBoundary>` wrapper around every page
- **Unhandled JS errors** — `window.error` handler in `error-tracker.tsx`
- **Unhandled promise rejections** — `window.unhandledrejection` handler
- **API route errors** — each route's catch block calls the log endpoint

Every error goes to the `error_logs` table in Supabase with:
- Source (`react-error-boundary`, `window.error`, `unhandledrejection`, `api/stripe/checkout`, etc.)
- Stack trace, user agent, URL
- User ID + email (so you can email the affected user)
- Level: error / warning / info

### View errors

Visit `/admin/errors` (admin-only route) to see every logged error with a resolve button. Admins are determined by the `isAdmin()` function in `src/lib/admin.ts`.

### Set up email alerts from the error_logs table

This is the piece that's missing and worth adding before launch. Supabase has built-in **Database Webhooks** — here's how to fire an email to yourself whenever a new error is logged:

1. In Supabase → **Database → Webhooks** → **Create a new hook**
2. Settings:
   - **Name:** Critical error alert
   - **Table:** `error_logs`
   - **Events:** Insert
   - **Type:** HTTP Request
   - **Method:** POST
   - **URL:** your Resend / SendGrid / Zapier webhook
   - **HTTP Params (body):** `{ "email": "you@email.com", "subject": "🚨 Create Suite error", "body": "{{record.source}}: {{record.message}}" }`
3. Save

Now every time an error lands in the table, you get an email within seconds.

**Cheaper version:** set up a Zapier zap that watches the Supabase table and sends you a Slack message for every new row. Free Zapier plan supports 100 tasks/month, which is plenty if your launch is small.

### Option B: Sentry (recommended once you have users)

Sentry gives you better grouping, search, and performance monitoring out of the box. Free tier includes 5k events/month which is plenty for early launch.

Install:

```bash
npm install --save @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

The wizard will:
1. Create `sentry.client.config.ts` and `sentry.server.config.ts`
2. Add `SENTRY_DSN` to your `.env.local` (copy to Vercel env vars)
3. Wrap your Next.js config

After this, every client-side error (including React errors, API 500s, unhandled promises) automatically flows to Sentry with stack traces, user breadcrumbs, and screenshots.

**Advantage over the built-in table:** Sentry groups similar errors, shows release comparisons, and has a better UI. The built-in `error_logs` table is a raw list.

You can use both. Set the built-in table as your fallback, Sentry as your primary.

---

## Layer 3: Business-logic alerts

Some failures aren't runtime errors — they're silent data problems:
- Stripe webhook didn't fire after a successful checkout (user paid but wasn't upgraded)
- A user signed up but their profile row never got created
- A deal was created but the invoice linked to it doesn't exist

For these, you want periodic sanity checks that email you if something looks wrong.

### Option A: Supabase scheduled functions (recommended)

Supabase's **Database → Cron** feature (uses `pg_cron`) lets you run SQL on a schedule. Examples you'd want:

**"Alert if any paid user has been stuck on `subscription_status != 'active'` for more than 10 minutes"**

```sql
-- Run every 15 minutes
select * from public.profiles
where account_type != 'free'
  and subscription_status is distinct from 'active'
  and subscription_status is distinct from 'trialing'
  and created_at < now() - interval '10 minutes';
```

If this returns rows, something's wrong with your Stripe webhook. Have this query push to a webhook (via `pg_net`) when it returns ≥ 1 row.

**"Alert if signup rate drops to zero for 2 hours"**

```sql
-- Run every hour
select count(*) from public.profiles
where created_at > now() - interval '2 hours';
-- If 0 during business hours, something's wrong with signup
```

### Option B: External cron ping (simpler)

1. Go to **https://cron-job.org** (free) → create new cron
2. URL: `https://createsuite.co/api/admin/health-detailed` *(you'd build this endpoint — it runs the same checks as /api/health plus business-logic checks)*
3. Schedule: every 15 minutes
4. Alert on non-200 response

---

## What alerts should look like

Create Suite's admin panel has an errors view at `/admin/errors`. For launch, make it your morning ritual:

1. Check `/admin/errors` for anything unresolved
2. Check UptimeRobot dashboard for any downtime overnight
3. Check Stripe dashboard for failed payments / disputes

A good launch-day setup:

- **UptimeRobot email alerts** → your inbox
- **Supabase database webhook** on `error_logs` → Slack channel you pin
- **Vercel dashboard** bookmarked → error rate per route visible
- **Stripe dashboard** bookmarked → failed payment alerts

---

## Quick-start checklist

The 15-minute "before I go to bed on launch day" setup:

- [ ] UptimeRobot monitoring `https://createsuite.co/api/health` every 5 min → email alerts
- [ ] UptimeRobot monitoring `https://createsuite.co/` every 5 min → email alerts
- [ ] Supabase database webhook on `error_logs` inserts → Zapier → Slack
- [ ] Vercel deploy notifications turned on (in Vercel project settings → Git → Production Deployments)
- [ ] Stripe email notifications turned on (Stripe dashboard → Profile → Notifications → enable failed payment + dispute emails)

That's it. Total cost: **$0/month**. Total setup time: **~15 minutes**.

---

## What I'm NOT recommending (yet)

- **Datadog / New Relic / Honeycomb** — great tools but overkill for launch. You'd pay $50-200/month and not use 90% of the features.
- **PagerDuty** — paid on-call rotation tooling. Unless you have a team, email/Slack is fine.
- **StatusPage** — public status page. Worth adding once you have real customers who care about SLAs.

Graduate to those once you have real traffic (>100 DAU) and the free tier starts dropping events.

---

## Troubleshooting

**UptimeRobot says my site is down but I can load it in a browser.**
Check: UptimeRobot hits from several regions. If /api/health returns 503 because Supabase timed out on a slow connection, it'll ring the alarm. Look at the response body — it tells you which specific check failed.

**I'm getting too many error alerts.**
The `error_logs` dedup logic is 5 seconds. If you're getting flooded, check `src/lib/error-logger.ts` → `DEDUPE_WINDOW_MS` and bump it to 60000 (1 minute). Also check if you have a React render loop somewhere generating the same error.

**My Stripe webhook isn't firing.**
Stripe dashboard → Developers → Webhooks → select your endpoint → look at recent events. If Stripe is trying but getting 4xx/5xx, the endpoint URL or signature secret is wrong.
