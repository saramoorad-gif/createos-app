import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

/**
 * Track an affiliate link click for attribution.
 *
 * Called client-side when a visitor lands on /signup (or any page) with
 * a cs_ref cookie set by the middleware. Inserts a row into
 * referral_clicks and returns the affiliate info for display.
 *
 * POST /api/affiliates/track-click
 * Body: { promo_code, cookie_id, referer?, user_agent?, landing_page? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Accept both { promo_code } (original middleware flow) and
    // { code } (signup/checkout page direct call). cookie_id is
    // optional — callers that don't have one get a server-generated id.
    const promo_code: string = (body.promo_code || body.code || "").trim();
    const cookie_id: string = (body.cookie_id || `auto-${Date.now()}`).trim();
    const referer: string = body.referer || "";
    const user_agent: string = body.user_agent || "";
    const landing_page: string = body.landing_page || body.page || "";

    if (!promo_code) {
      return NextResponse.json({ error: "Missing promo_code" }, { status: 400 });
    }

    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
    const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const sb = createClient(supabaseUrl, serviceKey);

    // Look up the affiliate by promo_code (must be active).
    const { data: affiliate, error: affErr } = await sb
      .from("affiliates")
      .select("id, display_name, promo_code, status")
      .eq("promo_code", promo_code.toUpperCase())
      .eq("status", "active")
      .single();

    if (affErr || !affiliate) {
      // Invalid or inactive code — don't error out, just return empty
      // so the signup page can fall back to the basic referral flow.
      return NextResponse.json({ affiliate: null });
    }

    // Hash the IP for privacy (we don't store raw IPs).
    const forwarded = req.headers.get("x-forwarded-for") || "";
    const ip = forwarded.split(",")[0]?.trim() || "unknown";
    const ipHash = createHash("sha256").update(ip + "createsuite-salt").digest("hex").slice(0, 16);

    // Insert click row (fire-and-forget — don't block the response on this).
    await sb.from("referral_clicks").insert({
      affiliate_id: affiliate.id,
      cookie_id,
      ip_hash: ipHash,
      user_agent: (user_agent || "").slice(0, 500),
      referer: (referer || "").slice(0, 1000),
      landing_page: (landing_page || "").slice(0, 500),
    });

    return NextResponse.json({
      affiliate: {
        id: affiliate.id,
        display_name: affiliate.display_name,
        promo_code: affiliate.promo_code,
      },
    });
  } catch (err: any) {
    console.error("[track-click] Error:", err);
    return NextResponse.json({ affiliate: null });
  }
}
