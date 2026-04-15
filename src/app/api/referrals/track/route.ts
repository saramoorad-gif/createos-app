import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Track a new referral signup
// Called when a user signs up via ?ref=XYZ link

export async function POST(req: NextRequest) {
  const { referredId, referralCode } = await req.json();

  if (!referredId || !referralCode) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );

  try {
    // Look up the referrer by their code
    const { data: referrer } = await sb
      .from("profiles")
      .select("id, referral_code")
      .eq("referral_code", referralCode.toUpperCase())
      .single();

    if (!referrer) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 404 });
    }

    // Don't let users refer themselves
    if (referrer.id === referredId) {
      return NextResponse.json({ error: "Cannot refer yourself" }, { status: 400 });
    }

    // Create the referral record
    const { data, error } = await sb
      .from("referrals")
      .insert({
        referrer_id: referrer.id,
        referred_id: referredId,
        referrer_code: referralCode.toUpperCase(),
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
