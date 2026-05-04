import { NextRequest, NextResponse } from "next/server";

/**
 * Receives a Supabase Database Webhook whenever a row is inserted into
 * public.error_logs, then emails the alert to the admin address defined
 * in ADMIN_ALERT_EMAIL.
 *
 * Wire-up (one-time, in Supabase dashboard):
 *   Database → Webhooks → Create a new hook
 *     Name:        error_logs → email alert
 *     Table:       error_logs
 *     Events:      Insert
 *     Type:        HTTP Request
 *     Method:      POST
 *     URL:         https://createsuite.co/api/admin/error-alert
 *     HTTP Headers: Authorization: Bearer <value of ADMIN_ALERT_SECRET>
 *     HTTP Params (body): (leave as default — Supabase sends { record, ... })
 *
 * Required Vercel env vars:
 *   ADMIN_ALERT_EMAIL   — where to send alerts (e.g. you@email.com)
 *   ADMIN_ALERT_SECRET  — any long random string, must match the
 *                         Authorization header in the Supabase webhook
 *   RESEND_API_KEY      — already set up for /api/email
 */

interface ErrorLogRecord {
  id: string;
  user_id: string | null;
  user_email: string | null;
  level: "error" | "warning" | "info";
  source: string;
  message: string;
  stack: string | null;
  metadata: Record<string, any> | null;
  user_agent: string | null;
  url: string | null;
  created_at: string;
}

// Rate limit: don't email more than N alerts per minute per error source,
// so a single runaway bug doesn't flood the inbox. We store the timestamp
// of the last email per source in an in-process map. (Serverless note: each
// Vercel instance has its own map — with multiple instances, you may get up
// to N alerts per minute per source per instance. Acceptable tradeoff.)
const recentAlerts = new Map<string, number>();
const ALERT_WINDOW_MS = 60_000; // 60s
const MAX_PER_WINDOW = 3;

function shouldThrottle(source: string): boolean {
  const now = Date.now();
  const cutoff = now - ALERT_WINDOW_MS;

  // Clean up old entries (cheap, keeps map small)
  for (const [key, time] of recentAlerts.entries()) {
    if (time < cutoff) recentAlerts.delete(key);
  }

  // Count emails sent for this source in the window
  let count = 0;
  for (const [key, time] of recentAlerts.entries()) {
    if (key.startsWith(`${source}::`) && time >= cutoff) count++;
  }

  if (count >= MAX_PER_WINDOW) return true;
  recentAlerts.set(`${source}::${now}`, now);
  return false;
}

export async function POST(req: NextRequest) {
  // Authenticate the webhook via shared secret header.
  const authHeader = req.headers.get("authorization") || "";
  const expectedSecret = (process.env.ADMIN_ALERT_SECRET || "").trim();

  if (!expectedSecret) {
    return NextResponse.json(
      { error: "ADMIN_ALERT_SECRET not set on the server" },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminEmail = (process.env.ADMIN_ALERT_EMAIL || "").trim();
  if (!adminEmail) {
    return NextResponse.json(
      { error: "ADMIN_ALERT_EMAIL not set on the server" },
      { status: 500 }
    );
  }

  const resendKey = (process.env.RESEND_API_KEY || "").trim();
  if (!resendKey) {
    // Resend not configured — log and accept silently (don't break the webhook).
    console.log("[error-alert] Resend not configured; would have emailed:", adminEmail);
    return NextResponse.json({ ok: true, sent: false, reason: "resend_not_configured" });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Supabase database webhooks send the new row as `record`.
  const record: ErrorLogRecord | undefined = body?.record;
  if (!record || !record.source) {
    return NextResponse.json({ error: "Missing record.source" }, { status: 400 });
  }

  if (shouldThrottle(record.source)) {
    return NextResponse.json({ ok: true, throttled: true });
  }

  // Build the email body.
  const subject = `🚨 [${(record.level || "error").toUpperCase()}] ${record.source}`;
  const html = buildEmailHTML(record);

  try {
    // Sender address: uses ADMIN_ALERT_FROM if set (e.g. once you've
    // verified createsuite.co on Resend), otherwise falls back to Resend's
    // sandbox address which works without any domain setup.
    const fromAddress =
      (process.env.ADMIN_ALERT_FROM || "").trim() ||
      "Create Suite Alerts <onboarding@resend.dev>";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [adminEmail],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[error-alert] Resend rejected:", err);
      return NextResponse.json(
        { error: err.message || "Email send failed" },
        { status: 502 }
      );
    }
    return NextResponse.json({ ok: true, sent: true });
  } catch (e: any) {
    console.error("[error-alert] send failed:", e);
    return NextResponse.json(
      { error: e?.message || "Email send failed" },
      { status: 502 }
    );
  }
}

function buildEmailHTML(r: ErrorLogRecord): string {
  const escape = (s: string | null | undefined): string =>
    (s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const metaRows = r.metadata
    ? Object.entries(r.metadata)
        .map(
          ([k, v]) =>
            `<tr><td style="padding:4px 12px 4px 0;color:#8AAABB;font-size:12px;">${escape(k)}</td><td style="padding:4px 0;color:#1A2C38;font-size:12px;font-family:monospace;">${escape(JSON.stringify(v))}</td></tr>`
        )
        .join("")
    : "";

  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#FAF8F4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
      <div style="background:white;border:1px solid #D8E8EE;border-radius:10px;padding:28px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <span style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#A03D3D;font-weight:600;">
            ${escape(r.level.toUpperCase())}
          </span>
          <span style="font-size:11px;color:#8AAABB;">
            ${escape(new Date(r.created_at).toLocaleString())}
          </span>
        </div>

        <h1 style="font-family:Georgia,serif;font-size:22px;color:#1A2C38;margin:0 0 4px 0;">
          ${escape(r.source)}
        </h1>

        <p style="font-size:14px;color:#4A6070;line-height:1.5;margin:0 0 20px 0;font-family:monospace;word-break:break-word;">
          ${escape(r.message)}
        </p>

        ${
          r.user_email
            ? `<div style="background:#F2F8FB;border:1px solid #D8E8EE;border-radius:8px;padding:12px;margin-bottom:16px;">
                 <p style="margin:0;font-size:12px;color:#8AAABB;">Affected user</p>
                 <p style="margin:2px 0 0 0;font-size:13px;color:#1A2C38;">${escape(r.user_email)}</p>
               </div>`
            : ""
        }

        ${
          r.url
            ? `<div style="margin-bottom:16px;">
                 <p style="font-size:12px;color:#8AAABB;margin:0 0 4px 0;">URL</p>
                 <p style="font-size:12px;color:#4A6070;margin:0;font-family:monospace;word-break:break-all;">${escape(r.url)}</p>
               </div>`
            : ""
        }

        ${
          r.stack
            ? `<details style="margin-bottom:16px;">
                 <summary style="font-size:12px;color:#8AAABB;cursor:pointer;">Stack trace</summary>
                 <pre style="margin:8px 0 0 0;padding:12px;background:#1A2C38;color:#F2F8FB;border-radius:6px;font-size:11px;line-height:1.4;overflow-x:auto;white-space:pre-wrap;">${escape(r.stack)}</pre>
               </details>`
            : ""
        }

        ${
          metaRows
            ? `<div style="margin-bottom:16px;">
                 <p style="font-size:12px;color:#8AAABB;margin:0 0 4px 0;">Metadata</p>
                 <table style="width:100%;border-collapse:collapse;">${metaRows}</table>
               </div>`
            : ""
        }

        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #D8E8EE;">
          <a href="https://createsuite.co/admin/errors" style="display:inline-block;background:#1E3F52;color:white;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;">
            View in admin panel →
          </a>
        </div>

        ${
          r.user_agent
            ? `<p style="font-size:10px;color:#8AAABB;margin:16px 0 0 0;">UA: ${escape(r.user_agent)}</p>`
            : ""
        }
      </div>

      <p style="text-align:center;color:#8AAABB;font-size:11px;margin:20px 0 0 0;">
        You're getting this because you're listed as ADMIN_ALERT_EMAIL in Create Suite.
        Rate-limited to ${MAX_PER_WINDOW} alerts/minute per error source.
      </p>
    </div>
  </body>
</html>`;
}
