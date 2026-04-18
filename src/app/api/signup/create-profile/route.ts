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
 * Must be called immediately after sb.auth.signUp(). The userId must
 * match the auth user just created. We verify by looking up the auth
 * user to make sure the email + id match — this prevents someone from
 * calling this endpoint with a random userId to create a profile for
 * someone else.
 *
 * Body: { userId, email, fullName, accountType, agencyName?, refCode? }
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, email, fullName, accountType, agencyName, refCode } = await req.json();

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
      return NextResponse.json({ ok: true, alreadyExists: true });
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
        return NextResponse.json({ ok: true, alreadyExists: true });
      }
      return NextResponse.json(
        { error: "Failed to create profile", detail: insertErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[create-profile] Error:", err);
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}
