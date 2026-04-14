import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const priceKey = session.metadata?.priceKey;

      if (userId && priceKey) {
        // Map price key to account type
        let accountType = "free";
        if (priceKey.startsWith("ugc_influencer")) accountType = "ugc_influencer";
        else if (priceKey.startsWith("ugc")) accountType = "ugc";
        else if (priceKey.startsWith("agency")) accountType = "agency";

        await getSupabaseAdmin()
          .from("profiles")
          .update({
            account_type: accountType,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
          })
          .eq("id", userId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;

      // Find user by Stripe customer ID and update status
      if (subscription.status === "active") {
        await getSupabaseAdmin()
          .from("profiles")
          .update({ subscription_status: "active" })
          .eq("stripe_customer_id", customerId);
      } else if (subscription.status === "past_due") {
        await getSupabaseAdmin()
          .from("profiles")
          .update({ subscription_status: "past_due" })
          .eq("stripe_customer_id", customerId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;

      await getSupabaseAdmin()
        .from("profiles")
        .update({
          account_type: "free",
          subscription_status: "cancelled",
          stripe_subscription_id: null,
        })
        .eq("stripe_customer_id", customerId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
