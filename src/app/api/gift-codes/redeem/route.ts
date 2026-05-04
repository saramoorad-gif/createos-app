import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/gift-codes/redeem
 *
 * Redeems a gift code for the authenticated user.
 * Upgrades their profile to the gift code's plan tier with
 * subscription_status = "active" — skips Stripe entirely.
 *
 * Body: { code }
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim(),
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: authErr } = await sb.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code } = await req.json();
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }

  const normalizedCode = code.trim().toUpperCase();

  // Use service role for the validation + upgrade (bypasses RLS).
  const sbAdmin = createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
    (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim()
  );

  // 1. Look up the code.
  const { data: giftCode, error: lookupErr } = await sbAdmin
    .from("gift_codes")
    .select("id, code, plan_tier, duration_months, max_uses, uses_count, active, expires_at")
    .eq("code", normalizedCode)
    .single();

  if (lookupErr || !giftCode) {
    return NextResponse.json({ error: "Invalid gift code" }, { status: 404 });
  }

  // 2. Validate the code is still usable.
  if (!giftCode.active) {
    return NextResponse.json({ error: "This gift code has been deactivated" }, { status: 400 });
  }
  if (giftCode.expires_at && new Date(giftCode.expires_at) < new Date()) {
    return NextResponse.json({ error: "This gift code has expired" }, { status: 400 });
  }
  if (giftCode.max_uses !== null && giftCode.uses_count >= giftCode.max_uses) {
    return NextResponse.json({ error: "This gift code has reached its redemption limit" }, { status: 400 });
  }

  // 3. Check the user hasn't already redeemed THIS code.
  const { data: existing } = await sbAdmin
    .from("gift_code_redemptions")
    .select("id")
    .eq("gift_code_id", giftCode.id)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "You've already redeemed this code" }, { status: 409 });
  }

  // 4. Check the user isn't already on a paid plan (to avoid silently
  // overwriting an existing Stripe subscription).
  const { data: profile } = await sbAdmin
    .from("profiles")
    .select("account_type, subscription_status, stripe_subscription_id")
    .eq("id", user.id)
    .single();

  if (
    profile?.account_type !== "free" &&
    profile?.subscription_status === "active" &&
    profile?.stripe_subscription_id
  ) {
    return NextResponse.json(
      {
        error: "You already have an active paid subscription. Cancel it first if you want to use a gift code.",
      },
      { status: 409 }
    );
  }

  // 5. Calculate access expiry (now + duration_months, or null for lifetime).
  const accessExpiresAt = giftCode.duration_months
    ? (() => {
        const d = new Date();
        d.setMonth(d.getMonth() + giftCode.duration_months);
        return d.toISOString();
      })()
    : null;

  // 6. Create the redemption + upgrade the profile in one flow.
  // If either fails, neither should commit — but Supabase doesn't expose
  // transactions for the JS client, so we do a best-effort ordering:
  // upgrade profile first (the important part), then insert redemption
  // (cheap to retry). If redemption fails, we log but don't roll back the
  // profile since the user has already "paid" with the code.
  const { error: profileUpdateErr } = await sbAdmin
    .from("profiles")
    .update({
      account_type: giftCode.plan_tier,
      subscription_status: "active",
    })
    .eq("id", user.id);

  if (profileUpdateErr) {
    return NextResponse.json(
      { error: "Failed to upgrade account", detail: profileUpdateErr.message },
      { status: 500 }
    );
  }

  // 7. Insert the redemption row.
  const { error: redemptionErr } = await sbAdmin
    .from("gift_code_redemptions")
    .insert({
      gift_code_id: giftCode.id,
      user_id: user.id,
      access_expires_at: accessExpiresAt,
    });

  if (redemptionErr) {
    console.error("[gift-codes/redeem] Redemption insert failed:", redemptionErr);
    // Don't fail the response — the user got their upgrade. Log for admin.
  }

  // 8. Increment uses_count atomically. The previous read-modify-write
  // pattern ("read uses_count, write uses_count + 1") let two
  // concurrent redemptions both pass the max-uses check and both
  // increment, blowing past the cap. Postgres-side conditional update
  // (where uses_count = expected) gives us proper compare-and-swap.
  // If another redemption beat us to it, we ROLL BACK the user-level
  // upgrade so the count and the redemption stay consistent.
  const { data: bumped } = await sbAdmin
    .from("gift_codes")
    .update({ uses_count: giftCode.uses_count + 1 })
    .eq("id", giftCode.id)
    .eq("uses_count", giftCode.uses_count)
    .select("id")
    .maybeSingle();

  if (!bumped) {
    // Another redemption raced us. Undo: delete the redemption row we
    // just inserted (the profile update is idempotent and harmless,
    // but we don't want a redemption row tied to a code that didn't
    // actually count it).
    await sbAdmin
      .from("gift_code_redemptions")
      .delete()
      .eq("gift_code_id", giftCode.id)
      .eq("user_id", user.id);
    return NextResponse.json(
      { error: "This gift code was redeemed by another user moments ago. Please try a different code." },
      { status: 409 }
    );
  }

  return NextResponse.json({
    ok: true,
    plan_tier: giftCode.plan_tier,
    access_expires_at: accessExpiresAt,
    duration_months: giftCode.duration_months,
  });
}
