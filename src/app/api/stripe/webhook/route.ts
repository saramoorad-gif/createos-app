import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import {
  createCommissionForInvoice,
  voidCommissionForCharge,
  markReferralChurned,
} from "@/lib/affiliate-commissions";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  // Trim defensively — a stray newline in the Vercel env var is enough
  // to make signature verification silently fail.
  const webhookSecret = (process.env.STRIPE_WEBHOOK_SECRET || "").trim();

  if (!sig || !webhookSecret) {
    console.error("[Stripe Webhook] Missing signature or webhook secret");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (e: any) {
    console.error("[Stripe Webhook] Invalid signature:", e.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

  // Idempotency guard — Stripe retries webhook events if we don't ack
  // within a few seconds. The commissions table already has a unique
  // constraint on stripe_charge_id, but other side effects (profile
  // upgrades, account-type flips, activity log rows) aren't constrained,
  // so gate the whole handler on a seen-events check. If the INSERT
  // succeeds we own this event; if it fails with 23505 we've already
  // processed it and can no-op.
  {
    const sb = getSupabaseAdmin();
    const { error: seenErr } = await sb
      .from("stripe_webhook_events")
      .insert({ event_id: event.id, type: event.type });
    if (seenErr && seenErr.code === "23505") {
      console.log(`[Stripe Webhook] ${event.id} already processed — no-op`);
      return NextResponse.json({ received: true, duplicate: true });
    }
    // Any other error (table missing, RLS, etc.) — log but continue so
    // a missing idempotency table doesn't break payments. The unique
    // constraint on commissions.stripe_charge_id is still the hard guard.
    if (seenErr) {
      console.warn(`[Stripe Webhook] seen-events insert failed: ${seenErr.message} — proceeding without idempotency guard`);
    }
  }

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

        // Mark referral as converted if applicable (legacy referrals table)
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
          }
        }

        // ── Affiliate program: create affiliate_referrals row ──────
        const affiliateId = session.metadata?.affiliateId;
        if (affiliateId) {
          try {
            await sb.from("affiliate_referrals").insert({
              affiliate_id: affiliateId,
              referred_user_id: userId,
              attribution_method: "code",
              signed_up_at: new Date().toISOString(),
              status: "signed_up",
              plan_tier: accountType,
              stripe_subscription_id: session.subscription || null,
            });
            console.log(`[Stripe Webhook] Created affiliate referral: affiliate=${affiliateId}, user=${userId}`);
          } catch (affErr: any) {
            // Don't fail checkout — affiliate tracking is non-critical.
            // Might fail if affiliates table doesn't exist yet.
            console.error("[Stripe Webhook] Failed to create affiliate referral:", affErr?.message);
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

        // ── Affiliate program: mark referral as churned ──────
        try {
          await markReferralChurned(sb, subscription.id);
        } catch (affErr: any) {
          console.error("[Stripe Webhook] markReferralChurned error:", affErr?.message);
        }
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
          const { error } = await sb
            .from("profiles")
            .update({ subscription_status: "active" })
            .eq("stripe_customer_id", customerId);

          if (error) {
            console.error("[Stripe Webhook] payment_succeeded update failed:", error);
            return NextResponse.json({ error: "Status update failed" }, { status: 500 });
          }
          console.log(`[Stripe Webhook] Marked customer ${customerId} as active after successful payment`);

          // ── Affiliate program: create commission if referred user ──
          try {
            const result = await createCommissionForInvoice(sb, {
              id: invoice.id,
              charge: (invoice as any).charge as string,
              customer: customerId,
              amount_paid: (invoice as any).amount_paid as number,
              subscription: (invoice as any).subscription as string,
            });
            if (result.created) {
              console.log(`[Stripe Webhook] Commission created for invoice ${invoice.id}`);
            } else {
              console.log(`[Stripe Webhook] No commission for invoice ${invoice.id}: ${result.reason}`);
            }
          } catch (commErr: any) {
            // Don't fail the webhook — commission tracking is non-critical.
            console.error("[Stripe Webhook] Commission creation error:", commErr?.message);
          }
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object;
        const chargeId = charge.id;
        try {
          const sb = getSupabaseAdmin();
          const { voided } = await voidCommissionForCharge(sb, chargeId, "refund");
          if (voided) {
            console.log(`[Stripe Webhook] Voided commission for refunded charge ${chargeId}`);
          }
        } catch (err: any) {
          console.error("[Stripe Webhook] charge.refunded error:", err?.message);
        }
        break;
      }

      case "charge.dispute.created": {
        const dispute = event.data.object;
        const chargeId = (dispute as any).charge as string;
        if (chargeId) {
          try {
            const sb = getSupabaseAdmin();
            const { voided } = await voidCommissionForCharge(sb, chargeId, "chargeback");
            if (voided) {
              console.log(`[Stripe Webhook] Voided commission for disputed charge ${chargeId}`);
            }
          } catch (err: any) {
            console.error("[Stripe Webhook] charge.dispute.created error:", err?.message);
          }
        }
        break;
      }
    }
  } catch (err: any) {
    console.error(`[Stripe Webhook] Handler error for ${event.type}:`, err);

    // Log to admin error logs
    try {
      await getSupabaseAdmin().from("error_logs").insert({
        level: "error",
        source: `api/stripe/webhook/${event.type}`,
        message: err.message || "Webhook handler failed",
        stack: err.stack,
        metadata: { eventType: event.type, eventId: event.id },
      });
    } catch {}

    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
