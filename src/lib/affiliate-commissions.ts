import { SupabaseClient } from "@supabase/supabase-js";
import { AFFILIATE_CONFIG } from "./affiliate-config";

/**
 * Core affiliate commission logic — used by the Stripe webhook and the
 * cron payout job. All functions take a service-role Supabase client.
 */

interface ReferralWithAffiliate {
  id: string;
  affiliate_id: string;
  first_paid_at: string | null;
  commission_ends_at: string | null;
  status: string;
}

/**
 * Called on `invoice.payment_succeeded`. Creates a commission row if the
 * payer was referred by an active affiliate and is within the 12-month
 * commission window.
 *
 * Idempotent via the unique constraint on commissions.stripe_charge_id.
 */
export async function createCommissionForInvoice(
  sb: SupabaseClient,
  invoice: {
    id: string;
    charge: string;
    customer: string;
    amount_paid: number; // cents
    subscription: string;
  }
): Promise<{ created: boolean; reason?: string }> {
  if (!invoice.charge || !invoice.amount_paid || invoice.amount_paid <= 0) {
    return { created: false, reason: "no_charge_or_zero_amount" };
  }

  // 1. Find the subscriber's profile via their Stripe customer ID.
  const { data: profile } = await sb
    .from("profiles")
    .select("id, stripe_customer_id")
    .eq("stripe_customer_id", invoice.customer)
    .single();

  if (!profile) {
    return { created: false, reason: "no_profile_for_customer" };
  }

  // 2. Find the referral linking this user to an affiliate.
  const { data: referral } = await sb
    .from("affiliate_referrals")
    .select("id, affiliate_id, first_paid_at, commission_ends_at, status")
    .eq("referred_user_id", profile.id)
    .in("status", ["signed_up", "paying"])
    .single() as { data: ReferralWithAffiliate | null; error: any };

  if (!referral) {
    return { created: false, reason: "no_active_referral" };
  }

  // 3. Check the affiliate is still active.
  const { data: affiliate } = await sb
    .from("affiliates")
    .select("id, status, stripe_connect_account_id")
    .eq("id", referral.affiliate_id)
    .single();

  if (!affiliate || affiliate.status !== "active") {
    return { created: false, reason: "affiliate_not_active" };
  }

  const now = new Date();

  // 4. First payment? Start the 12-month clock.
  if (!referral.first_paid_at) {
    const commissionEndsAt = new Date(now);
    commissionEndsAt.setMonth(
      commissionEndsAt.getMonth() + AFFILIATE_CONFIG.COMMISSION_DURATION_MONTHS
    );
    await sb
      .from("affiliate_referrals")
      .update({
        first_paid_at: now.toISOString(),
        commission_ends_at: commissionEndsAt.toISOString(),
        status: "paying",
      })
      .eq("id", referral.id);

    // Update local reference for the window check below.
    referral.commission_ends_at = commissionEndsAt.toISOString();
    referral.status = "paying";
  }

  // 5. Are we still within the commission window?
  if (referral.commission_ends_at && now > new Date(referral.commission_ends_at)) {
    return { created: false, reason: "past_commission_window" };
  }

  // 6. Calculate commission.
  const commissionCents = Math.round(
    invoice.amount_paid * AFFILIATE_CONFIG.COMMISSION_PERCENT
  );

  if (commissionCents <= 0) {
    return { created: false, reason: "commission_zero" };
  }

  // 7. Insert (idempotent via stripe_charge_id unique constraint).
  const releasesAt = new Date(now);
  releasesAt.setDate(releasesAt.getDate() + AFFILIATE_CONFIG.REFUND_HOLD_DAYS);

  const { error: insertErr } = await sb.from("commissions").insert({
    affiliate_id: referral.affiliate_id,
    referral_id: referral.id,
    stripe_charge_id: invoice.charge,
    stripe_invoice_id: invoice.id,
    charge_amount_cents: invoice.amount_paid,
    commission_amount_cents: commissionCents,
    charged_at: now.toISOString(),
    releases_at: releasesAt.toISOString(),
    status: "held",
  });

  if (insertErr) {
    // Likely duplicate — the unique constraint on stripe_charge_id prevents double-counting.
    if (insertErr.code === "23505") {
      return { created: false, reason: "duplicate_charge" };
    }
    throw insertErr;
  }

  return { created: true };
}

/**
 * Called on `charge.refunded`. Voids the commission associated with a charge.
 */
export async function voidCommissionForCharge(
  sb: SupabaseClient,
  chargeId: string,
  reason: "refund" | "chargeback"
): Promise<{ voided: boolean }> {
  const { data, error } = await sb
    .from("commissions")
    .update({
      status: "voided",
      voided_reason: reason,
    })
    .eq("stripe_charge_id", chargeId)
    .neq("status", "voided")
    .select("id")
    .single();

  return { voided: !!data && !error };
}

/**
 * Called on `customer.subscription.deleted`. Marks the referral as churned
 * so no future commissions are created.
 */
export async function markReferralChurned(
  sb: SupabaseClient,
  subscriptionId: string
): Promise<void> {
  await sb
    .from("affiliate_referrals")
    .update({ status: "churned" })
    .eq("stripe_subscription_id", subscriptionId)
    .in("status", ["signed_up", "paying"]);
}

/**
 * Release held commissions that have passed the hold period.
 * Called daily by the cron job.
 */
export async function releaseHeldCommissions(
  sb: SupabaseClient
): Promise<number> {
  const { data, error } = await sb
    .from("commissions")
    .update({ status: "payable" })
    .eq("status", "held")
    .lte("releases_at", new Date().toISOString())
    .select("id");

  if (error) throw error;
  return data?.length || 0;
}

/**
 * Graduate referrals past the 12-month commission window.
 * Called daily by the cron job.
 */
export async function graduateExpiredReferrals(
  sb: SupabaseClient
): Promise<number> {
  const { data, error } = await sb
    .from("affiliate_referrals")
    .update({ status: "graduated" })
    .eq("status", "paying")
    .lte("commission_ends_at", new Date().toISOString())
    .select("id");

  if (error) throw error;
  return data?.length || 0;
}
