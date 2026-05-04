import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/referrals/validate
 *
 * Looks up a creator's referral code and returns the referrer's name
 * if valid. Used by the checkout page so a follower who typed Bri's
 * code sees an immediate confirmation ("Referred by Bri Cole — $12 off
 * your first month") before clicking Continue to Payment.
 *
 * Read-only. Does not mutate anything. Safe to expose without auth —
 * the response only reveals a first name + validity, which is already
 * shared publicly when Bri posts her referral link.
 *
 * Body: { code }
 */
export async function POST(req: NextRequest) {
  const { code } = await req.json().catch(() => ({}));
  if (!code || typeof code !== "string") {
    return NextResponse.json({ ok: false, reason: "missing_code" }, { status: 400 });
  }

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ ok: false, reason: "server_misconfigured" }, { status: 500 });
  }

  const sb = createClient(supabaseUrl, serviceKey);

  const normalized = code.trim().toUpperCase();

  // Primary: check the creator profiles.referral_code (every user gets one).
  const { data: profile } = await sb
    .from("profiles")
    .select("id, full_name, referral_code")
    .eq("referral_code", normalized)
    .single();

  if (profile) {
    const firstName = (profile.full_name || "").split(" ")[0] || "a creator";
    return NextResponse.json({
      ok: true,
      code: normalized,
      referrer_name: firstName,
      source: "profile",
    });
  }

  // Secondary: affiliates.promo_code (Bri's custom affiliate code, if any).
  const { data: affiliate } = await sb
    .from("affiliates")
    .select("id, display_name, promo_code, status")
    .eq("promo_code", normalized)
    .eq("status", "active")
    .single();

  if (affiliate) {
    return NextResponse.json({
      ok: true,
      code: normalized,
      referrer_name: affiliate.display_name || "a creator",
      source: "affiliate",
    });
  }

  return NextResponse.json({ ok: false, reason: "invalid_code" });
}
