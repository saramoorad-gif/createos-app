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

    // ── Phase 4: Gift code expiry ─────────────────────────────────
    results.giftCodes = await processGiftCodeExpiry(sb);

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

/**
 * Gift code lifecycle:
 *   1. Send a 7-day warning email to users whose access expires within
 *      the next 7 days (and hasn't already been warned).
 *   2. Expire access — downgrade to free — when access_expires_at passes.
 */
async function processGiftCodeExpiry(sb: ReturnType<typeof createClient>) {
  const now = new Date();
  const sevenDaysOut = new Date(now.getTime() + 7 * 86400000);
  const results: any = { warned: 0, expired: 0 };

  // ── Phase A: Warning emails (7 days out) ──────────────────────
  const { data: warningCandidates } = await sb
    .from("gift_code_redemptions")
    .select("id, user_id, access_expires_at, gift_codes(plan_tier)")
    .is("expired_at", null)
    .is("warning_email_sent_at", null)
    .lte("access_expires_at", sevenDaysOut.toISOString())
    .gt("access_expires_at", now.toISOString());

  if (warningCandidates && warningCandidates.length > 0) {
    for (const r of warningCandidates as any[]) {
      try {
        // Get user email
        const { data: profile } = await sb
          .from("profiles")
          .select("email, full_name")
          .eq("id", r.user_id)
          .single();

        if (!profile?.email) continue;

        // Send email via internal /api/email route — bypass with direct Resend call
        // so we don't need to round-trip through the app URL.
        const resendKey = (process.env.RESEND_API_KEY || "").trim();
        if (resendKey) {
          const expiryDate = new Date(r.access_expires_at);
          const daysLeft = Math.max(1, Math.ceil((expiryDate.getTime() - now.getTime()) / 86400000));
          const fromAddress = (process.env.ADMIN_ALERT_FROM || "").trim() || "Create Suite <onboarding@resend.dev>";

          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: fromAddress,
              to: [profile.email],
              subject: `Your Create Suite gift access ends in ${daysLeft} days`,
              html: buildWarningEmailHTML(profile.full_name || "there", daysLeft, expiryDate),
            }),
          });
        }

        // Mark as warned so we don't email again
        await sb
          .from("gift_code_redemptions")
          .update({ warning_email_sent_at: now.toISOString() })
          .eq("id", r.id);

        results.warned++;
      } catch (err: any) {
        console.error(`[Cron] Gift warning email failed for redemption ${r.id}:`, err.message);
      }
    }
  }

  // ── Phase B: Expire access ─────────────────────────────────────
  const { data: expired } = await sb
    .from("gift_code_redemptions")
    .select("id, user_id")
    .is("expired_at", null)
    .not("access_expires_at", "is", null)
    .lte("access_expires_at", now.toISOString());

  if (expired && expired.length > 0) {
    for (const r of expired) {
      try {
        // Downgrade the user's profile to free. Only do this if they're
        // not currently on a paid Stripe subscription (they might have
        // subscribed during their gift period).
        const { data: profile } = await sb
          .from("profiles")
          .select("stripe_subscription_id, subscription_status")
          .eq("id", r.user_id)
          .single();

        const hasPaidSub =
          profile?.stripe_subscription_id &&
          (profile?.subscription_status === "active" || profile?.subscription_status === "trialing");

        if (!hasPaidSub) {
          await sb
            .from("profiles")
            .update({ account_type: "free", subscription_status: null })
            .eq("id", r.user_id);
        }

        // Mark the redemption as expired regardless (so we don't retry).
        await sb
          .from("gift_code_redemptions")
          .update({ expired_at: now.toISOString() })
          .eq("id", r.id);

        results.expired++;
      } catch (err: any) {
        console.error(`[Cron] Gift expiry failed for redemption ${r.id}:`, err.message);
      }
    }
  }

  return results;
}

function buildWarningEmailHTML(name: string, daysLeft: number, expiryDate: Date): string {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#FAF8F4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
      <div style="text-align:center;margin-bottom:32px;">
        <h1 style="font-family:Georgia,serif;font-size:24px;color:#1A2C38;margin:0;">
          Create<em style="color:#7BAFC8;font-style:italic;">Suite</em>
        </h1>
      </div>
      <div style="background:white;border:1px solid #D8E8EE;border-radius:10px;padding:32px;">
        <h2 style="font-family:Georgia,serif;font-size:22px;color:#1A2C38;margin:0 0 12px 0;">
          Hey ${escapeHtml(name)},
        </h2>
        <p style="font-size:15px;color:#4A6070;line-height:1.6;margin:0 0 16px 0;">
          Your complimentary Create Suite access ends in <strong style="color:#A03D3D;">${daysLeft} day${daysLeft === 1 ? "" : "s"}</strong>
          on ${expiryDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}.
        </p>
        <p style="font-size:14px;color:#4A6070;line-height:1.6;margin:0 0 20px 0;">
          After that, your account will switch to the Free plan. Your data stays with you —
          deals, contracts, media kit, everything — but features like AI contract review, rate calculator,
          and media kit will be locked behind an upgrade.
        </p>
        <p style="font-size:14px;color:#4A6070;line-height:1.6;margin:0 0 28px 0;">
          Want to keep going? Subscribe anytime to continue uninterrupted.
        </p>
        <div style="text-align:center;">
          <a href="https://createsuite.co/checkout?plan=ugc_influencer" style="display:inline-block;background:#1E3F52;color:white;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:600;">
            Continue with UGC + Influencer →
          </a>
        </div>
      </div>
      <p style="text-align:center;font-size:12px;color:#8AAABB;margin-top:24px;">
        Questions? Reply to this email or write to{" "}
        <a href="mailto:hello@createsuite.co" style="color:#7BAFC8;">hello@createsuite.co</a>.
      </p>
    </div>
  </body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
