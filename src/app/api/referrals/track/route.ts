import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/referrals/track
 *
 * Records that the authenticated user signed up via someone else's
 * referral code. Previously trusted `referredId` from the body, which
 * let any caller falsely attribute a real user's signup to themselves.
 * `referredId` now comes from the verified bearer token; the body
 * field is ignored.
 */
export async function POST(req: NextRequest) {
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

  // Verify the session.
  const sbAuth = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authErr } = await sbAuth.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { referralCode } = await req.json().catch(() => ({}));
  if (!referralCode || typeof referralCode !== "string") {
    return NextResponse.json({ error: "Missing referralCode" }, { status: 400 });
  }

  const sb = createClient(supabaseUrl, serviceKey);
  const normalized = referralCode.toUpperCase().trim();

  try {
    const { data: referrer } = await sb
      .from("profiles")
      .select("id")
      .eq("referral_code", normalized)
      .single();

    if (!referrer) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 404 });
    }

    if ((referrer as any).id === user.id) {
      return NextResponse.json({ error: "Cannot refer yourself" }, { status: 400 });
    }

    // Idempotency: if a referrals row already exists for this user
    // (because they used a ?ref= URL or typed a code at checkout), do
    // nothing rather than inserting a duplicate.
    const { data: existing } = await sb
      .from("referrals")
      .select("id")
      .eq("referred_id", user.id)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ ok: true, alreadyTracked: true });
    }

    const { data, error } = await sb
      .from("referrals")
      .insert({
        referrer_id: (referrer as any).id,
        referred_id: user.id,
        referrer_code: normalized,
        status: "signup",
      })
      .select()
      .single();

    if (error) {
      console.error("Referral insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ referral: data });
  } catch (err: any) {
    console.error("Track referral error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
