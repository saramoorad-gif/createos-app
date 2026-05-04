import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Health check endpoint for uptime monitors (UptimeRobot, Better Uptime,
 * Pingdom, Vercel Analytics, etc.).
 *
 * Hit GET /api/health — returns 200 when everything's OK, 503 when
 * something critical is down. The JSON body shows which dependency failed.
 *
 * Checks performed:
 *   1. Process is running and can serve requests (trivial)
 *   2. Critical env vars are set
 *   3. Supabase is reachable and returning rows
 *   4. Stripe secret key is present and looks valid
 *
 * Every check has a 4-second hard timeout so a slow dependency can't hang
 * the uptime monitor.
 */

const CHECK_TIMEOUT_MS = 4000;

type CheckResult = { ok: boolean; ms: number; error?: string };

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

async function timeCheck(fn: () => Promise<void>): Promise<CheckResult> {
  const t0 = Date.now();
  try {
    await withTimeout(fn(), CHECK_TIMEOUT_MS);
    return { ok: true, ms: Date.now() - t0 };
  } catch (e: any) {
    return { ok: false, ms: Date.now() - t0, error: e?.message || "Unknown error" };
  }
}

async function checkEnvVars(): Promise<CheckResult> {
  return timeCheck(async () => {
    const required = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "STRIPE_SECRET_KEY",
    ];
    const missing = required.filter((k) => !(process.env[k] || "").trim());
    if (missing.length > 0) {
      throw new Error(`Missing env vars: ${missing.join(", ")}`);
    }
  });
}

async function checkSupabase(): Promise<CheckResult> {
  return timeCheck(async () => {
    const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
    const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
    if (!url || !key) throw new Error("Supabase env vars missing");

    const sb = createClient(url, key);
    // Tiny query — tests connectivity + auth + RLS without reading any real data.
    // profiles has a 'Users can read own profile' policy so anon gets 0 rows,
    // but the query should still succeed without an error.
    const { error } = await sb.from("profiles").select("id", { count: "exact", head: true }).limit(1);
    if (error) throw new Error(`Supabase: ${error.message}`);
  });
}

async function checkStripe(): Promise<CheckResult> {
  return timeCheck(async () => {
    const key = (process.env.STRIPE_SECRET_KEY || "").trim();
    if (!key) throw new Error("STRIPE_SECRET_KEY not set");
    if (!key.startsWith("sk_")) {
      throw new Error("STRIPE_SECRET_KEY doesn't look like a valid Stripe key");
    }
    // We don't actually hit the Stripe API here — that would be slow and
    // rate-limited when monitors ping every minute. Format validation is
    // enough to catch the "pasted with newline" or "missing entirely"
    // class of failure, which is what has broken us in practice.
  });
}

export async function GET() {
  const t0 = Date.now();
  const [envCheck, supabaseCheck, stripeCheck] = await Promise.all([
    checkEnvVars(),
    checkSupabase(),
    checkStripe(),
  ]);

  const checks = {
    env: envCheck,
    supabase: supabaseCheck,
    stripe: stripeCheck,
  };

  const allOk = Object.values(checks).every((c) => c.ok);
  const totalMs = Date.now() - t0;

  const body = {
    status: allOk ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    uptime_check: true,
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "dev",
    region: process.env.VERCEL_REGION || "local",
    total_ms: totalMs,
    checks,
  };

  // 200 when healthy, 503 when anything critical is down. Uptime monitors
  // key off the HTTP status code so this is the important bit.
  return NextResponse.json(body, {
    status: allOk ? 200 : 503,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "X-Health-Status": allOk ? "ok" : "degraded",
    },
  });
}
