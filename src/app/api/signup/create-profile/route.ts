import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/signup/create-profile
 *
 * Server-side profile creation for new signups. Uses the service role
 * to bypass RLS, so it works even when Supabase email confirmation is
 * enabled (which prevents the client from having a session immediately
 * after signUp() and blocks client-side profile inserts).
 *
 * If a giftCode is provided, it's redeemed here too — so the whole
 * signup → profile → gift-code flow completes in one server call that
 * doesn't require a client session at any point.
 *
 * The FK constraint on profiles.id → auth.users(id) validates the
 * userId. A bogus userId → 23503 FK violation → 404 response.
 *
 * Body: { userId, email, fullName, accountType, agencyName?, refCode?, giftCode? }
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, email, fullName, accountType, agencyName, refCode, giftCode } = await req.json();

    if (!userId || !email || !fullName) {
      return NextResponse.json({ error: "Missing userId, email, or fullName" }, { status: 400 });
    }

    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
    const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const sb = createClient(supabaseUrl, serviceKey);

    // Check if profile already exists (idempotent — retry-safe).
    const { data: existing } = await sb
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (existing) {
      // Profile already there — skip insert, but still attempt gift
      // redemption if a code was provided. Otherwise a retry (same
      // email, different session) would silently drop the gift.
      let giftResult: any = null;
      if (giftCode && typeof giftCode === "string" && giftCode.trim()) {
        giftResult = await redeemGiftCodeForUser(sb, giftCode.trim().toUpperCase(), userId);
      }
      return NextResponse.json({ ok: true, alreadyExists: true, gift: giftResult });
    }

    // Generate a unique referral code (8-char uppercase).
    const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Create the profile. The FK on profiles.id → auth.users(id)
    // provides validation: if the caller passes a bogus userId, the
    // insert fails with a foreign-key error. So we don't need a
    // separate auth.admin lookup (which has eventual-consistency
    // issues right after signUp — it sometimes can't see the freshly
    // created user for a few seconds).
    //
    // Everyone starts as "free" — paid tiers get upgraded later by
    // Stripe webhook or gift code redemption.
    const { error: insertErr } = await sb.from("profiles").insert({
      id: userId,
      full_name: fullName,
      email,
      account_type: "free",
      agency_name: accountType === "agency" ? (agencyName || null) : null,
      referral_code: referralCode,
      referred_by_code: refCode ? refCode.toUpperCase() : null,
    });

    if (insertErr) {
      // 23503 = FK violation — userId doesn't match an auth.users row.
      if (insertErr.code === "23503") {
        return NextResponse.json(
          { error: "Invalid user ID — auth user not found" },
          { status: 404 }
        );
      }
      // 23505 = unique violation — profile already exists (race condition).
      if (insertErr.code === "23505") {
        // Still redeem the gift code if one was supplied, same reason
        // as the "existing" branch above.
        let giftResult: any = null;
        if (giftCode && typeof giftCode === "string" && giftCode.trim()) {
          giftResult = await redeemGiftCodeForUser(sb, giftCode.trim().toUpperCase(), userId);
        }
        return NextResponse.json({ ok: true, alreadyExists: true, gift: giftResult });
      }
      return NextResponse.json(
        { error: "Failed to create profile", detail: insertErr.message },
        { status: 500 }
      );
    }

    // ─── Gift code redemption (optional, server-side) ────────────
    // If a gift code was provided, apply it immediately using the same
    // service-role client so we don't need a session on the client.
    // This keeps the whole signup flow working even when Supabase email
    // confirmation is enabled (which prevents the client from having a
    // session until the user clicks the confirmation email link).
    let giftResult: any = null;
    if (giftCode && typeof giftCode === "string" && giftCode.trim()) {
      giftResult = await redeemGiftCodeForUser(sb, giftCode.trim().toUpperCase(), userId);
    }

    return NextResponse.json({ ok: true, gift: giftResult });
  } catch (err: any) {
    console.error("[create-profile] Error:", err);
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}

// ─── Gift code redemption helper ─────────────────────────────────
// Mirrors /api/gift-codes/redeem but runs with a service-role client
// already in hand (and a userId passed in, rather than extracted from
// auth.getUser()). We deliberately don't throw — if the code is bad,
// the profile is still created as free and the response body just
// indicates the gift didn't apply so the client can show a message.

async function redeemGiftCodeForUser(
  sb: ReturnType<typeof createClient>,
  code: string,
  userId: string
): Promise<{ ok: boolean; reason?: string; plan_tier?: string; access_expires_at?: string | null }> {
  const { data: giftCode } = await sb
    .from("gift_codes")
    .select("id, code, plan_tier, duration_months, max_uses, uses_count, active, expires_at")
    .eq("code", code)
    .single();

  if (!giftCode) return { ok: false, reason: "invalid_code" };
  if (!giftCode.active) return { ok: false, reason: "deactivated" };
  if (giftCode.expires_at && new Date(giftCode.expires_at) < new Date()) {
    return { ok: false, reason: "code_expired" };
  }
  if (giftCode.max_uses !== null && giftCode.uses_count >= giftCode.max_uses) {
    return { ok: false, reason: "max_uses_reached" };
  }

  // Idempotency check.
  const { data: existing } = await sb
    .from("gift_code_redemptions")
    .select("id")
    .eq("gift_code_id", giftCode.id)
    .eq("user_id", userId)
    .single();
  if (existing) return { ok: false, reason: "already_redeemed" };

  // Calculate access expiry.
  const accessExpiresAt = giftCode.duration_months
    ? (() => {
        const d = new Date();
        d.setMonth(d.getMonth() + giftCode.duration_months);
        return d.toISOString();
      })()
    : null;

  // Upgrade the profile.
  const { error: upgradeErr } = await sb
    .from("profiles")
    .update({
      account_type: giftCode.plan_tier,
      subscription_status: "active",
    })
    .eq("id", userId);

  if (upgradeErr) return { ok: false, reason: "upgrade_failed" };

  // Record the redemption.
  await sb.from("gift_code_redemptions").insert({
    gift_code_id: giftCode.id,
    user_id: userId,
    access_expires_at: accessExpiresAt,
  });

  // Increment uses_count.
  await sb
    .from("gift_codes")
    .update({ uses_count: giftCode.uses_count + 1 })
    .eq("id", giftCode.id);

  return {
    ok: true,
    plan_tier: giftCode.plan_tier,
    access_expires_at: accessExpiresAt,
  };
}
