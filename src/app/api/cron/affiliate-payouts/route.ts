import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { AFFILIATE_CONFIG } from "@/lib/affiliate-config";
import {
  releaseHeldCommissions,
  graduateExpiredReferrals,
} from "@/lib/affiliate-commissions";

/**
 * Daily cron job for the affiliate program.
 *
 * Runs every day at 09:00 UTC (configured in vercel.json).
 * Three phases:
 *   1. Release held commissions past the 30-day hold window
 *   2. On the 15th: process payouts for affiliates with >= $50 payable
 *   3. Graduate referrals past the 12-month window
 *
 * Protected by CRON_SECRET Bearer token (Vercel injects this automatically
 * for scheduled cron invocations).
 */
export async function GET(req: NextRequest) {
  // Auth: Vercel sends Authorization: Bearer <CRON_SECRET> for cron jobs.
  const authHeader = req.headers.get("authorization") || "";
  const cronSecret = (process.env.CRON_SECRET || "").trim();

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const sb = createClient(supabaseUrl, serviceKey);
  const results: Record<string, any> = {};

  try {
    // ── Phase 1: Release held commissions ─────────────────────────
    const released = await releaseHeldCommissions(sb);
    results.released = released;
    console.log(`[Cron] Released ${released} held commissions`);

    // ── Phase 2: Process payouts (15th of the month only) ─────────
    const today = new Date();
    const dayOfMonth = today.getUTCDate();

    if (dayOfMonth === AFFILIATE_CONFIG.PAYOUT_DAY_OF_MONTH) {
      results.payouts = await processPayouts(sb);
    } else {
      results.payouts = { skipped: true, reason: `Not the ${AFFILIATE_CONFIG.PAYOUT_DAY_OF_MONTH}th` };
    }

    // ── Phase 3: Graduate expired referrals ────────────────────────
    const graduated = await graduateExpiredReferrals(sb);
    results.graduated = graduated;
    console.log(`[Cron] Graduated ${graduated} expired referrals`);

    return NextResponse.json({ ok: true, ...results });
  } catch (err: any) {
    console.error("[Cron] Affiliate payouts error:", err);

    // Log to error_logs table so the admin gets an email alert.
    try {
      await sb.from("error_logs").insert({
        level: "error",
        source: "cron/affiliate-payouts",
        message: err.message || "Cron job failed",
        stack: err.stack,
        metadata: results,
      });
    } catch {}

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * Process payouts for all affiliates with >= $50 payable balance.
 */
async function processPayouts(sb: ReturnType<typeof createClient>) {
  // Find all affiliates with payable commissions.
  const { data: affiliates, error: affErr } = await sb
    .from("affiliates")
    .select("id, stripe_connect_account_id, stripe_connect_onboarded, display_name")
    .eq("status", "active")
    .eq("stripe_connect_onboarded", true);

  if (affErr) throw affErr;
  if (!affiliates || affiliates.length === 0) {
    return { processed: 0, reason: "no_onboarded_affiliates" };
  }

  let processed = 0;
  let failed = 0;
  const details: any[] = [];

  for (const affiliate of affiliates) {
    // Sum payable commissions for this affiliate.
    const { data: commissions, error: commErr } = await sb
      .from("commissions")
      .select("id, commission_amount_cents")
      .eq("affiliate_id", affiliate.id)
      .eq("status", "payable");

    if (commErr || !commissions || commissions.length === 0) continue;

    const totalCents = commissions.reduce((s, c) => s + c.commission_amount_cents, 0);

    if (totalCents < AFFILIATE_CONFIG.MIN_PAYOUT_CENTS) {
      details.push({
        affiliate: affiliate.display_name,
        balance: totalCents,
        skipped: true,
        reason: "below_minimum",
      });
      continue;
    }

    // Determine the payout period.
    const periodEnd = new Date();
    const periodStart = new Date(periodEnd);
    periodStart.setMonth(periodStart.getMonth() - 1);
    periodStart.setDate(AFFILIATE_CONFIG.PAYOUT_DAY_OF_MONTH + 1);

    // Create a payout row first (pending status).
    const { data: payout, error: payoutErr } = await sb
      .from("payouts")
      .insert({
        affiliate_id: affiliate.id,
        amount_cents: totalCents,
        status: "pending",
        period_start: periodStart.toISOString().split("T")[0],
        period_end: periodEnd.toISOString().split("T")[0],
      })
      .select("id")
      .single();

    if (payoutErr || !payout) {
      console.error(`[Cron] Failed to create payout row for ${affiliate.display_name}:`, payoutErr);
      failed++;
      continue;
    }

    // Create the Stripe transfer to the affiliate's Connect account.
    if (!isStripeConfigured() || !affiliate.stripe_connect_account_id) {
      // No Stripe Connect — mark as failed so it retries next month.
      await sb
        .from("payouts")
        .update({ status: "failed", failure_reason: "stripe_not_configured" })
        .eq("id", payout.id);
      failed++;
      continue;
    }

    try {
      const stripe = getStripe();
      const transfer = await stripe.transfers.create({
        amount: totalCents,
        currency: "usd",
        destination: affiliate.stripe_connect_account_id,
        description: `CreateSuite affiliate payout — ${periodStart.toISOString().split("T")[0]} to ${periodEnd.toISOString().split("T")[0]}`,
      });

      // Mark payout as paid.
      await sb
        .from("payouts")
        .update({
          status: "paid",
          stripe_transfer_id: transfer.id,
          paid_at: new Date().toISOString(),
        })
        .eq("id", payout.id);

      // Mark all included commissions as paid.
      const commissionIds = commissions.map((c) => c.id);
      await sb
        .from("commissions")
        .update({ status: "paid", payout_id: payout.id })
        .in("id", commissionIds);

      processed++;
      details.push({
        affiliate: affiliate.display_name,
        amount: totalCents,
        transfer_id: transfer.id,
        commissions_count: commissions.length,
      });

      console.log(`[Cron] Paid ${affiliate.display_name}: $${(totalCents / 100).toFixed(2)} via transfer ${transfer.id}`);
    } catch (stripeErr: any) {
      console.error(`[Cron] Stripe transfer failed for ${affiliate.display_name}:`, stripeErr.message);

      await sb
        .from("payouts")
        .update({
          status: "failed",
          failure_reason: stripeErr.message || "Stripe transfer failed",
        })
        .eq("id", payout.id);

      failed++;
      details.push({
        affiliate: affiliate.display_name,
        amount: totalCents,
        error: stripeErr.message,
      });
    }
  }

  return { processed, failed, details };
}
