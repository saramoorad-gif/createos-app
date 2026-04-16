import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

/**
 * Downgrades the authenticated user to the Free tier.
 *
 * Handles two cases:
 * 1. User picked a paid tier at signup but never completed checkout
 *    → just flips account_type to "free" in the DB
 * 2. User has an active paid subscription
 *    → cancels the Stripe subscription (at period end by default) then
 *      flips account_type + subscription_status so SubscriptionGate
 *      stops blocking them.
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use the user's own auth token to load their profile (RLS enforces that
  // they can only read/write their own row).
  const sbUser = createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim(),
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: authError } = await sbUser.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Load the profile so we know whether to cancel a Stripe subscription.
  const { data: profile, error: profileError } = await sbUser
    .from("profiles")
    .select("account_type, subscription_status, stripe_subscription_id, stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Already free? No-op.
  if (profile.account_type === "free") {
    return NextResponse.json({ ok: true, alreadyFree: true });
  }

  // If there's a live Stripe subscription, cancel it FIRST.
  // We cancel at period end so the user keeps the paid features until their
  // current billing cycle ends. If the cancel fails, we refuse to flip the
  // DB to 'free' — otherwise the user would keep being billed by Stripe while
  // showing up as a free account in our system (double-bad: charged + no
  // access to paid features they paid for).
  const hasLiveStripeSub =
    profile.stripe_subscription_id &&
    (profile.subscription_status === "active" ||
      profile.subscription_status === "trialing" ||
      profile.subscription_status === "past_due");

  if (hasLiveStripeSub) {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        {
          error: "Cannot downgrade: Stripe is not configured on the server.",
          hint: "Contact support to cancel manually.",
        },
        { status: 500 }
      );
    }
    try {
      const stripe = getStripe();
      await stripe.subscriptions.update(profile.stripe_subscription_id!, {
        cancel_at_period_end: true,
      });
    } catch (e: any) {
      const message = e?.message || "Unknown Stripe error";
      console.error("[downgrade-to-free] Failed to cancel Stripe subscription:", message);
      return NextResponse.json(
        {
          error: "Could not cancel subscription with Stripe. Please try again or contact support.",
          detail: message,
        },
        { status: 502 }
      );
    }
  }

  // Stripe cancellation succeeded (or there was no live sub). Safe to flip
  // the profile to free. subscription_status = "cancelled" so the webhook's
  // subsequent customer.subscription.deleted event is a no-op.
  // We keep stripe_customer_id so the user can easily re-subscribe later.
  const { error: updateError } = await sbUser
    .from("profiles")
    .update({
      account_type: "free",
      subscription_status: hasLiveStripeSub ? "cancelled" : null,
    })
    .eq("id", user.id);

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to update profile", detail: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    stripeCancelled: hasLiveStripeSub,
  });
}
