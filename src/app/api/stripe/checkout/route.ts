import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getStripe, PRICE_IDS, isStripeConfigured } from "@/lib/stripe";

// Cache for referral coupon IDs so we don't re-list them every request.
const REFERRAL_COUPONS: Record<"monthly" | "annual", { id: string; amountOff: number; name: string }> = {
  monthly: { id: "creator-referral-12off", amountOff: 1200, name: "Creator Referral — $12 off first month" },
  annual: { id: "creator-referral-1mo-free", amountOff: 3100, name: "Creator Referral — one month free (annual)" },
};
const COUPON_CACHE: Record<string, string> = {};

async function getOrCreateReferralCoupon(cycle: "monthly" | "annual"): Promise<string> {
  const cfg = REFERRAL_COUPONS[cycle];
  if (COUPON_CACHE[cfg.id]) return COUPON_CACHE[cfg.id];
  const stripe = getStripe();

  try {
    const existing = await stripe.coupons.retrieve(cfg.id);
    if (existing && !(existing as any).deleted) {
      COUPON_CACHE[cfg.id] = existing.id;
      return existing.id;
    }
  } catch {
    // Not found — create below.
  }

  const coupon = await stripe.coupons.create({
    id: cfg.id,
    name: cfg.name,
    amount_off: cfg.amountOff,
    currency: "usd",
    duration: "once",
  });
  COUPON_CACHE[cfg.id] = coupon.id;
  return coupon.id;
}

// Validate a referral code server-side before applying a discount. Returns
// the referrer's profile/affiliate id if the code resolves to a real row,
// or null otherwise. Mirrors /api/referrals/validate but runs inline here
// so we never apply a coupon for a code that doesn't exist.
async function resolveReferralCode(
  sb: any,
  code: string
): Promise<{ affiliateId: string | null; valid: boolean }> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { affiliateId: null, valid: false };

  const { data: profile } = await sb
    .from("profiles")
    .select("id")
    .eq("referral_code", normalized)
    .single();
  if (profile) return { affiliateId: null, valid: true };

  const { data: affiliate } = await sb
    .from("affiliates")
    .select("id")
    .eq("promo_code", normalized)
    .eq("status", "active")
    .single();
  if (affiliate) return { affiliateId: affiliate.id as string, valid: true };

  return { affiliateId: null, valid: false };
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
    const { priceKey, userId, email, successUrl, cancelUrl, referralCode, billingCycle } = await req.json();

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

    // Apply referral discount only for ugc_influencer plan, and only when
    // the code resolves to a real referrer. Previously any non-empty
    // string got $12 off — now we verify it exists first.
    const cycle: "monthly" | "annual" =
      billingCycle === "annual" || priceKey.endsWith("_annual") ? "annual" : "monthly";
    const isInfluencerPlan = priceKey.startsWith("ugc_influencer");
    let discounts: any = undefined;
    let affiliateId: string | null = null;
    let validatedRefCode: string | null = null;

    if (referralCode && isInfluencerPlan) {
      try {
        const sb = createClient(
          (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
          (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim()
        );
        const { valid, affiliateId: affId } = await resolveReferralCode(sb, referralCode);
        if (valid) {
          validatedRefCode = referralCode.trim().toUpperCase();
          affiliateId = affId;
          try {
            const couponId = await getOrCreateReferralCoupon(cycle);
            discounts = [{ coupon: couponId }];
          } catch (e) {
            console.error("Failed to create/apply referral coupon:", e);
            // Continue without discount rather than failing the checkout.
          }

          // If the user typed the code at checkout (rather than arriving
          // via ?ref= URL at signup), the profiles.referred_by_code and
          // referrals row were never set. Backfill them now so the
          // Stripe webhook — which keys on referrals — can credit the
          // referrer when the subscription activates.
          if (userId) {
            try {
              const { data: existingProfile } = await sb
                .from("profiles")
                .select("referred_by_code")
                .eq("id", userId)
                .single();
              if (existingProfile && !(existingProfile as any).referred_by_code) {
                await sb
                  .from("profiles")
                  .update({ referred_by_code: validatedRefCode })
                  .eq("id", userId);
              }

              const { data: referrerRow } = await sb
                .from("profiles")
                .select("id")
                .eq("referral_code", validatedRefCode)
                .single();
              if (referrerRow && (referrerRow as any).id !== userId) {
                const { data: existingRef } = await sb
                  .from("referrals")
                  .select("id")
                  .eq("referred_id", userId)
                  .eq("referrer_id", (referrerRow as any).id)
                  .maybeSingle();
                if (!existingRef) {
                  await sb.from("referrals").insert({
                    referrer_id: (referrerRow as any).id,
                    referred_id: userId,
                    referrer_code: validatedRefCode,
                    status: "signup",
                  });
                }
              }
            } catch (trackErr: any) {
              // Surface this — silent failure here means Bri (or any
              // creator) doesn't get credited when one of her followers
              // redeems her code. Push to error_logs so the admin
              // dashboard catches it instead of leaving it in stdout.
              console.error("[stripe/checkout] Referral backfill failed:", trackErr);
              try {
                await sb.from("error_logs").insert({
                  level: "error",
                  source: "api/stripe/checkout/referral-backfill",
                  message: trackErr?.message || "Referral backfill failed",
                  user_id: userId || null,
                  metadata: { referralCode: validatedRefCode },
                });
              } catch {}
            }
          }
        } else {
          console.warn("[stripe/checkout] Ignored unknown referral code:", referralCode);
        }
      } catch (e) {
        console.error("[stripe/checkout] Referral validation errored, skipping discount:", e);
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      discounts,
      // Lock down discount stacking: never let the user paste a Stripe
      // promo code on top of an already-applied creator referral coupon.
      // Stripe rejects `allow_promotion_codes: true` when `discounts`
      // is set, but being explicit also rules out accidental future
      // changes to that default.
      allow_promotion_codes: false,
      success_url: successUrl || `${req.nextUrl.origin}/dashboard?checkout=success`,
      cancel_url: cancelUrl || `${req.nextUrl.origin}/checkout?plan=${priceKey.split("_")[0]}&cancelled=1`,
      metadata: {
        userId,
        priceKey,
        billingCycle: cycle,
        referralCode: validatedRefCode || "",
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
