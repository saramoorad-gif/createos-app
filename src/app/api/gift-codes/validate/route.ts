import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/gift-codes/validate
 *
 * Public endpoint — lets the signup form check a gift code BEFORE the
 * user submits, so we can surface "that code is invalid/expired" without
 * creating a half-working free account first. Read-only; does not
 * redeem or mutate anything.
 *
 * Body: { code }
 * Returns: { ok: true, plan_tier, duration_months } on a usable code,
 *          { ok: false, reason } otherwise.
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

  const { data: giftCode } = await sb
    .from("gift_codes")
    .select("code, plan_tier, duration_months, max_uses, uses_count, active, expires_at")
    .eq("code", code.trim().toUpperCase())
    .single();

  if (!giftCode) return NextResponse.json({ ok: false, reason: "invalid_code" });
  if (!giftCode.active) return NextResponse.json({ ok: false, reason: "deactivated" });
  if (giftCode.expires_at && new Date(giftCode.expires_at as string) < new Date()) {
    return NextResponse.json({ ok: false, reason: "code_expired" });
  }
  if (giftCode.max_uses !== null && (giftCode.uses_count as number) >= (giftCode.max_uses as number)) {
    return NextResponse.json({ ok: false, reason: "max_uses_reached" });
  }

  return NextResponse.json({
    ok: true,
    plan_tier: giftCode.plan_tier,
    duration_months: giftCode.duration_months,
  });
}
