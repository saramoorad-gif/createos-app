import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getStripe, PRICE_IDS, isStripeConfigured } from "@/lib/stripe";

// Cache for referral coupon ID so we don't create a new one every request
let CACHED_REFERRAL_COUPON_ID: string | null = null;

async function getOrCreateReferralCoupon(): Promise<string> {
  if (CACHED_REFERRAL_COUPON_ID) return CACHED_REFERRAL_COUPON_ID;
  const stripe = getStripe();

  // Try to find existing coupon
  const existingCoupons = await stripe.coupons.list({ limit: 100 });
  const found = existingCoupons.data.find(c => c.id === "creator-referral-12off");
  if (found) {
    CACHED_REFERRAL_COUPON_ID = found.id;
    return found.id;
  }

  // Create a new coupon: $12 off first month (39-27=12)
  const coupon = await stripe.coupons.create({
    id: "creator-referral-12off",
    name: "Creator Referral - $12 off first month",
    amount_off: 1200, // $12 in cents
    currency: "usd",
    duration: "once",
  });

  CACHED_REFERRAL_COUPON_ID = coupon.id;
  return coupon.id;
}

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error: "Stripe is not configured on the server.",
        detail: "STRIPE_SECRET_KEY is missing, empty, or does not start with 'sk_'. Set it in the Vercel project environment variables and redeploy.",
      },
      { status: 500 }
    );
  }

  try {
    const { priceKey, userId, email, successUrl, cancelUrl, referralCode } = await req.json();

    const priceId = PRICE_IDS[priceKey as keyof typeof PRICE_IDS];
    if (!priceId || priceId === "") {
      return NextResponse.json(
        {
          error: `Price ID not configured for ${priceKey}.`,
          detail: `The environment variable for this plan is missing. Create the price in the Stripe Dashboard and set STRIPE_PRICE_${priceKey.toUpperCase()} in Vercel.`,
        },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Apply referral discount only for ugc_influencer plan
    const shouldApplyDiscount = referralCode && priceKey.startsWith("ugc_influencer");
    let discounts: any = undefined;
    let affiliateId: string | null = null;

    if (shouldApplyDiscount) {
      try {
        const couponId = await getOrCreateReferralCoupon();
        discounts = [{ coupon: couponId }];
      } catch (e) {
        console.error("Failed to create/apply referral coupon:", e);
        // Continue without discount rather than failing the checkout
      }

      // Look up the affiliate by promo code so we can track the commission.
      try {
        const sb = createClient(
          (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
          (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim()
        );
        const { data: affiliate } = await sb
          .from("affiliates")
          .select("id")
          .eq("promo_code", referralCode.toUpperCase())
          .eq("status", "active")
          .single();
        if (affiliate) affiliateId = affiliate.id;
      } catch {
        // If the affiliates table doesn't exist yet or the lookup fails,
        // continue without affiliate tracking — don't block checkout.
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      discounts,
      success_url: successUrl || `${req.nextUrl.origin}/dashboard?checkout=success`,
      cancel_url: cancelUrl || `${req.nextUrl.origin}/checkout?plan=${priceKey.split("_")[0]}&cancelled=1`,
      metadata: {
        userId,
        priceKey,
        referralCode: referralCode || "",
        affiliateId: affiliateId || "",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    // Extract every useful field Stripe's error object exposes.
    const type: string = error?.type || error?.name || "UnknownError";
    const code: string = error?.code || "";
    const statusCode: number = error?.statusCode || error?.raw?.statusCode || 500;
    const requestId: string = error?.requestId || error?.raw?.requestId || "";
    const message: string = error?.message || "Unknown error";
    const stack: string | undefined = error?.stack;

    console.error("[Stripe Checkout] Error:", {
      type,
      code,
      statusCode,
      requestId,
      message,
    });

    // Map the common Stripe SDK error types to a more helpful user-facing hint.
    let hint = "";
    if (type === "StripeAuthenticationError" || message.includes("Invalid API Key")) {
      hint = "Stripe rejected the API key. Check STRIPE_SECRET_KEY in Vercel — it may be wrong, expired, or pointing at the wrong account (test vs. live).";
    } else if (type === "StripeConnectionError" || message.includes("connection to Stripe")) {
      hint = "Could not connect to api.stripe.com from the server. This is usually a missing or malformed STRIPE_SECRET_KEY in Vercel. Verify the key is set (starts with 'sk_live_' or 'sk_test_'), has no extra whitespace, and redeploy.";
    } else if (type === "StripeInvalidRequestError") {
      hint = `Stripe rejected the request: ${message}. Check that STRIPE_PRICE_* env vars point to valid price IDs in the same Stripe account as STRIPE_SECRET_KEY (test keys need test prices, live keys need live prices).`;
    } else if (type === "StripePermissionError") {
      hint = "The API key does not have permission for this operation. Use a full-access secret key, not a restricted one.";
    }

    // Log to admin error logs (fire-and-forget, never blocks the response)
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.SUPABASE_SERVICE_ROLE_KEY || ""
      );
      await sb.from("error_logs").insert({
        level: "error",
        source: "api/stripe/checkout",
        message,
        stack,
        metadata: { type, code, statusCode, requestId, hint },
      });
    } catch {}

    return NextResponse.json(
      {
        error: message,
        type,
        code,
        requestId,
        hint,
      },
      { status: 500 }
    );
  }
}
