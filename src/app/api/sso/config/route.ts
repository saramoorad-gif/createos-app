import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireFeature } from "@/lib/require-tier";

/**
 * SSO config endpoint.
 *
 * SAML/SSO is gated to Agency Growth. Actual SAML auth is wired
 * through Supabase's native SSO (a Pro-plan feature configured in
 * the Supabase dashboard) — we cannot programmatically register an
 * IdP with Supabase from a customer's browser. So this endpoint
 * stores the agency's intended IdP metadata + a status flag, and
 * fires a notification email to ops to flip the Supabase switch.
 *
 *   GET  /api/sso/config   load current config
 *   POST /api/sso/config   submit / update IdP metadata
 *
 * Once Supabase-side SSO is enabled for a domain, the user logs in
 * via the standard /login → "Sign in with SSO" path; nothing more
 * happens here.
 */
export async function GET(req: NextRequest) {
  const tier = await requireFeature(req, "sso");
  if (!tier.ok) {
    return NextResponse.json({ error: tier.error, hint: (tier as any).hint }, { status: tier.status });
  }

  const sb = createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
    (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim()
  );

  const { data } = await sb
    .from("sso_configs")
    .select("id, domain, idp_type, idp_metadata_url, status, created_at, activated_at")
    .eq("owner_id", tier.userId)
    .maybeSingle();

  return NextResponse.json({ config: data || null });
}

export async function POST(req: NextRequest) {
  const tier = await requireFeature(req, "sso");
  if (!tier.ok) {
    return NextResponse.json({ error: tier.error, hint: (tier as any).hint }, { status: tier.status });
  }

  const { domain, idp_type, idp_metadata_url } = await req.json().catch(() => ({}));
  if (typeof domain !== "string" || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) {
    return NextResponse.json({ error: "Provide a valid email domain (e.g. acme.co)" }, { status: 400 });
  }
  const validIdpTypes = ["okta", "google", "entra", "onelogin", "jumpcloud", "other"];
  if (!validIdpTypes.includes(idp_type)) {
    return NextResponse.json({ error: "Unsupported IdP type" }, { status: 400 });
  }
  if (typeof idp_metadata_url !== "string" || !/^https:\/\//.test(idp_metadata_url)) {
    return NextResponse.json({ error: "idp_metadata_url must be an https URL" }, { status: 400 });
  }

  const sb = createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
    (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim()
  );

  // Upsert by owner_id (one config per agency).
  const { data: existing } = await sb
    .from("sso_configs")
    .select("id")
    .eq("owner_id", tier.userId)
    .maybeSingle();

  const payload = {
    owner_id: tier.userId,
    domain: domain.toLowerCase().trim(),
    idp_type,
    idp_metadata_url: idp_metadata_url.trim(),
    status: "pending_review", // ops flips this to "active" after configuring Supabase
  };

  if (existing) {
    await sb.from("sso_configs").update(payload).eq("id", (existing as any).id);
  } else {
    await sb.from("sso_configs").insert(payload);
  }

  // Fire-and-forget ops email so we know to enable Supabase SSO for
  // this domain. Failure here doesn't block the user — they'll see
  // their submission in the UI either way.
  try {
    const apiKey = (process.env.RESEND_API_KEY || "").trim();
    if (apiKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Create Suite <noreply@createsuite.co>",
          to: ["hello@createsuite.co"],
          subject: `[SSO] New IdP submission — ${domain}`,
          html: `<p>Owner: ${tier.userId}</p><p>Domain: ${domain}</p><p>IdP type: ${idp_type}</p><p>Metadata URL: <a href="${idp_metadata_url}">${idp_metadata_url}</a></p><p>Action: configure SAML SSO in Supabase dashboard for this domain, then update <code>sso_configs.status</code> to <code>active</code> + <code>activated_at = now()</code>.</p>`,
        }),
      });
    }
  } catch {}

  return NextResponse.json({ ok: true, status: payload.status });
}
