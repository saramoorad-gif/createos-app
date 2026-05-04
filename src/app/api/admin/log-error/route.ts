import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/admin/log-error
 *
 * Receives client-side error reports and persists them to error_logs.
 *
 * Hardening:
 *  - Requires a Supabase auth bearer token. Anonymous clients can no
 *    longer flood the table.
 *  - Caps the payload size (rejects > 32KB to keep stack traces sane).
 *  - Best-effort per-user rate limit using a 1-minute count check
 *    (DB-side, since this runs on Vercel's stateless serverless and
 *    process-local memory wouldn't persist across instances).
 *  - Stores the verified user_id from the session — body fields are
 *    accepted only for context (level/source/message/stack/metadata).
 */

const MAX_PAYLOAD_BYTES = 32 * 1024;
const RATE_LIMIT_PER_MIN = 30;

export async function POST(req: NextRequest) {
  // Cheap size guard before parsing JSON so a multi-MB body never even
  // reaches our parser.
  const lenHeader = req.headers.get("content-length");
  if (lenHeader && Number(lenHeader) > MAX_PAYLOAD_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!supabaseUrl || !anonKey || !serviceKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // Verify the bearer token resolves to a real user.
  const sbAuth = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authErr } = await sbAuth.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = createClient(supabaseUrl, serviceKey);

  // Rate limit: count this user's inserts in the last 60s. This is
  // best-effort — a real attacker with multiple accounts can still
  // submit, but we'd notice through error_logs growth.
  try {
    const oneMinAgo = new Date(Date.now() - 60_000).toISOString();
    const { count } = await sb
      .from("error_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", oneMinAgo);
    if ((count || 0) >= RATE_LIMIT_PER_MIN) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
  } catch {
    // Don't fail the log-write because the rate-limit query failed —
    // logs are valuable; abuse is rare. Just continue.
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const truncate = (v: unknown, max: number): string | null => {
    if (v == null) return null;
    const s = typeof v === "string" ? v : JSON.stringify(v);
    return s.length > max ? s.slice(0, max) : s;
  };

  await sb.from("error_logs").insert({
    user_id: user.id,
    user_email: user.email || null,
    level: typeof body.level === "string" ? body.level.slice(0, 16) : "error",
    source: truncate(body.source, 200) || "unknown",
    message: truncate(body.message, 4000) || "Unknown error",
    stack: truncate(body.stack, 8000),
    metadata: typeof body.metadata === "object" && body.metadata !== null ? body.metadata : {},
    user_agent: truncate(body.userAgent, 512),
    url: truncate(body.url, 1000),
  });

  return NextResponse.json({ success: true });
}
