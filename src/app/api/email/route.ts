import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/admin";

/**
 * POST /api/email
 *
 * Sends mail via Resend. Hardening pass:
 *  - Anonymous callers (the public /contact form) may ONLY mail an
 *    admin recipient. This keeps the marketing contact form working
 *    while shutting down the open relay we used to expose.
 *  - Authenticated callers may mail anywhere, but the recipient is
 *    capped at one address per request, the subject/body sizes are
 *    bounded, and a per-user rate limit (15/min) is enforced.
 *  - The `from` header is fixed; only `replyTo` is taken from the
 *    request so legitimate flows (contact form, invoice send) keep
 *    working.
 */

const MAX_SUBJECT = 200;
const MAX_BODY = 50_000; // Resend's body cap is much higher; this is just sanity.
const RATE_LIMIT_PER_MIN = 15;

function isValidEmail(addr: unknown): addr is string {
  if (typeof addr !== "string") return false;
  // Cheap, intentionally lenient — Resend will reject invalid addresses anyway.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr) && addr.length <= 320;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { to, subject, body: html, replyTo } = body || {};

  if (!isValidEmail(to)) {
    return NextResponse.json({ error: "Invalid 'to' address" }, { status: 400 });
  }
  if (typeof subject !== "string" || subject.length === 0 || subject.length > MAX_SUBJECT) {
    return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
  }
  if (typeof html !== "string" || html.length === 0 || html.length > MAX_BODY) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

  // Try to resolve a user from the auth header. Failure is allowed
  // (anonymous /contact form path), but only an admin recipient is
  // permitted in that case.
  let userId: string | null = null;
  let userEmail: string | null = null;
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ") && supabaseUrl && anonKey) {
    try {
      const sb = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await sb.auth.getUser();
      if (user) {
        userId = user.id;
        userEmail = user.email || null;
      }
    } catch {
      // Treat as anonymous.
    }
  }

  if (!userId && !isAdmin(to)) {
    return NextResponse.json(
      { error: "Anonymous senders may only contact support." },
      { status: 401 }
    );
  }

  // Per-user rate limit (best-effort, DB-backed). Skip for anon.
  if (userId && supabaseUrl && serviceKey) {
    try {
      const sb = createClient(supabaseUrl, serviceKey);
      const oneMinAgo = new Date(Date.now() - 60_000).toISOString();
      const { count } = await sb
        .from("error_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("source", "api/email/sent")
        .gte("created_at", oneMinAgo);
      if ((count || 0) >= RATE_LIMIT_PER_MIN) {
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
      }
    } catch {
      // Don't fail mail on a rate-limit query error.
    }
  }

  const apiKey = (process.env.RESEND_API_KEY || "").trim();
  if (!apiKey) {
    console.log(`[EMAIL] To: ${to}, Subject: ${subject}`);
    return NextResponse.json({ sent: false, message: "Email API not configured — logged to console" });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Create Suite <noreply@createsuite.co>",
        to: [to],
        subject,
        html,
        ...(isValidEmail(replyTo) ? { reply_to: replyTo } : {}),
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: (err as any)?.message || "Email send failed" }, { status: 500 });
    }

    // Log the send for rate-limit accounting (only for authed users —
    // anon contact-form sends aren't tracked).
    if (userId && supabaseUrl && serviceKey) {
      try {
        const sb = createClient(supabaseUrl, serviceKey);
        await sb.from("error_logs").insert({
          user_id: userId,
          user_email: userEmail,
          level: "info",
          source: "api/email/sent",
          message: `to=${to} subject=${subject.slice(0, 80)}`,
        });
      } catch {}
    }

    return NextResponse.json({ sent: true });
  } catch {
    return NextResponse.json({ error: "Email send failed" }, { status: 500 });
  }
}
