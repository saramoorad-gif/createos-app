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
    console.error("[Stripe Webhook] Missing signature or webhook secret");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e: any) {
    console.error("[Stripe Webhook] Invalid signature:", e.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`[Stripe Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const priceKey = session.metadata?.priceKey;
        const referralCode = session.metadata?.referralCode;

        if (!userId || !priceKey) {
          console.error("[Stripe Webhook] checkout.session.completed missing metadata");
          break;
        }

        // Map price key to account type
        let accountType = "free";
        if (priceKey.startsWith("ugc_influencer")) accountType = "ugc_influencer";
        else if (priceKey.startsWith("ugc")) accountType = "ugc";
        else if (priceKey.startsWith("agency")) accountType = "agency";

        const sb = getSupabaseAdmin();

        const { error: profileError } = await sb
          .from("profiles")
          .update({
            account_type: accountType,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            subscription_status: "active",
            referral_applied: !!referralCode,
          })
          .eq("id", userId);

        if (profileError) {
          console.error("[Stripe Webhook] Failed to update profile:", profileError);
          return NextResponse.json({ error: "Profile update failed" }, { status: 500 });
        }

        console.log(`[Stripe Webhook] Upgraded user ${userId} to ${accountType}`);

        // Mark referral as converted if applicable
        if (referralCode) {
          const { error: refError } = await sb
            .from("referrals")
            .update({
              status: "converted",
              discount_applied: true,
              converted_at: new Date().toISOString(),
            })
            .eq("referred_id", userId)
            .eq("referrer_code", referralCode);

          if (refError) {
            console.error("[Stripe Webhook] Failed to update referral:", refError);
            // Don't fail — referral tracking is non-critical
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        const sb = getSupabaseAdmin();

        let newStatus: string | null = null;
        if (subscription.status === "active") newStatus = "active";
        else if (subscription.status === "trialing") newStatus = "trialing";
        else if (subscription.status === "past_due") newStatus = "past_due";
        else if (subscription.status === "canceled") newStatus = "cancelled";

        if (newStatus) {
          const { error } = await sb
            .from("profiles")
            .update({ subscription_status: newStatus })
            .eq("stripe_customer_id", customerId);

          if (error) {
            console.error("[Stripe Webhook] subscription.updated failed:", error);
            return NextResponse.json({ error: "Update failed" }, { status: 500 });
          }
          console.log(`[Stripe Webhook] Updated customer ${customerId} status to ${newStatus}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        const sb = getSupabaseAdmin();

        const { error } = await sb
          .from("profiles")
          .update({
            account_type: "free",
            subscription_status: "cancelled",
            stripe_subscription_id: null,
          })
          .eq("stripe_customer_id", customerId);

        if (error) {
          console.error("[Stripe Webhook] subscription.deleted failed:", error);
          return NextResponse.json({ error: "Downgrade failed" }, { status: 500 });
        }
        console.log(`[Stripe Webhook] Downgraded customer ${customerId} to free`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;

        if (customerId) {
          const sb = getSupabaseAdmin();
          const { error } = await sb
            .from("profiles")
            .update({ subscription_status: "past_due" })
            .eq("stripe_customer_id", customerId);

          if (error) {
            console.error("[Stripe Webhook] payment_failed failed:", error);
            return NextResponse.json({ error: "Status update failed" }, { status: 500 });
          }
          console.log(`[Stripe Webhook] Marked customer ${customerId} as past_due`);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;

        // Auto-clear past_due status when payment succeeds
        if (customerId) {
          const sb = getSupabaseAdmin();
          await sb
            .from("profiles")
            .update({ subscription_status: "active" })
            .eq("stripe_customer_id", customerId);
        }
        break;
      }
    }
  } catch (err: any) {
    console.error(`[Stripe Webhook] Handler error for ${event.type}:`, err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
