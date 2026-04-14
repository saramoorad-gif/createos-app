import { NextRequest, NextResponse } from "next/server";
import { stripe, PRICE_IDS, isStripeConfigured } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  try {
    const { priceKey, userId, email, successUrl, cancelUrl } = await req.json();

    const priceId = PRICE_IDS[priceKey as keyof typeof PRICE_IDS];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${req.nextUrl.origin}/dashboard?checkout=success`,
      cancel_url: cancelUrl || `${req.nextUrl.origin}/pricing?checkout=cancelled`,
      metadata: {
        userId,
        priceKey,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
