import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

/**
 * POST /api/affiliates/stripe-connect
 *
 * Creates a Stripe Connect Express account for the affiliate and returns
 * the hosted onboarding URL to redirect the user to.
 *
 * Requires authenticated user who is an active affiliate.
 */
export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

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

  // Use service role for reads/writes
  const sbAdmin = createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
    (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim()
  );

  // Find the affiliate row
  const { data: affiliate, error: affErr } = await sbAdmin
    .from("affiliates")
    .select("id, status, stripe_connect_account_id, stripe_connect_onboarded, display_name")
    .eq("user_id", user.id)
    .single();

  if (affErr || !affiliate) {
    return NextResponse.json({ error: "Affiliate application not found" }, { status: 404 });
  }

  if (affiliate.status !== "active") {
    return NextResponse.json(
      { error: "Your application hasn't been approved yet. Status: " + affiliate.status },
      { status: 403 }
    );
  }

  if (affiliate.stripe_connect_onboarded) {
    return NextResponse.json({ error: "Already onboarded", alreadyOnboarded: true });
  }

  const stripe = getStripe();
  const origin = (process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin).replace(/\/$/, "");

  try {
    let accountId = affiliate.stripe_connect_account_id;

    // Create Express account if we don't have one yet
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: user.email,
        metadata: {
          affiliate_id: affiliate.id,
          user_id: user.id,
        },
        capabilities: {
          transfers: { requested: true },
        },
      });
      accountId = account.id;

      // Save the account ID
      await sbAdmin
        .from("affiliates")
        .update({ stripe_connect_account_id: accountId })
        .eq("id", affiliate.id);
    }

    // Generate an account link for the onboarding flow
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/referrals/onboarding?step=connect&refresh=1`,
      return_url: `${origin}/referrals/onboarding?step=welcome`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (err: any) {
    console.error("[stripe-connect] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to create Connect account" }, { status: 500 });
  }
}

/**
 * GET /api/affiliates/stripe-connect
 *
 * Check Connect onboarding status. Called when user returns from Stripe.
 */
export async function GET(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim(),
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sbAdmin = createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
    (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim()
  );

  const { data: affiliate } = await sbAdmin
    .from("affiliates")
    .select("id, stripe_connect_account_id, stripe_connect_onboarded")
    .eq("user_id", user.id)
    .single();

  if (!affiliate?.stripe_connect_account_id) {
    return NextResponse.json({ onboarded: false, reason: "no_account" });
  }

  if (affiliate.stripe_connect_onboarded) {
    return NextResponse.json({ onboarded: true });
  }

  // Check with Stripe if onboarding is complete
  try {
    const stripe = getStripe();
    const account = await stripe.accounts.retrieve(affiliate.stripe_connect_account_id);
    const isComplete = account.details_submitted && account.charges_enabled;

    if (isComplete) {
      await sbAdmin
        .from("affiliates")
        .update({
          stripe_connect_onboarded: true,
          terms_accepted_at: new Date().toISOString(),
          terms_version: "v1.0",
          updated_at: new Date().toISOString(),
        })
        .eq("id", affiliate.id);

      return NextResponse.json({ onboarded: true });
    }

    return NextResponse.json({ onboarded: false, reason: "incomplete" });
  } catch (err: any) {
    return NextResponse.json({ onboarded: false, reason: err.message });
  }
}
