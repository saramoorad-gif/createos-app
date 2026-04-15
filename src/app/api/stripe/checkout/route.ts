import { NextRequest, NextResponse } from "next/server";
import { stripe, PRICE_IDS, isStripeConfigured } from "@/lib/stripe";

// Cache for referral coupon ID so we don't create a new one every request
let CACHED_REFERRAL_COUPON_ID: string | null = null;

async function getOrCreateReferralCoupon(): Promise<string> {
  if (CACHED_REFERRAL_COUPON_ID) return CACHED_REFERRAL_COUPON_ID;

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
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  try {
    const { priceKey, userId, email, successUrl, cancelUrl, referralCode } = await req.json();

    const priceId = PRICE_IDS[priceKey as keyof typeof PRICE_IDS];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    // Apply referral discount only for ugc_influencer plan
    const shouldApplyDiscount = referralCode && priceKey.startsWith("ugc_influencer");
    let discounts: any = undefined;

    if (shouldApplyDiscount) {
      try {
        const couponId = await getOrCreateReferralCoupon();
        discounts = [{ coupon: couponId }];
      } catch (e) {
        console.error("Failed to create/apply referral coupon:", e);
        // Continue without discount rather than failing the checkout
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      discounts,
      success_url: successUrl || `${req.nextUrl.origin}/dashboard?checkout=success`,
      cancel_url: cancelUrl || `${req.nextUrl.origin}/pricing?checkout=cancelled`,
      metadata: {
        userId,
        priceKey,
        referralCode: referralCode || "",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
