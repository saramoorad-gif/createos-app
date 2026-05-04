"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/contexts/auth-context";
import { useSupabaseQuery } from "@/lib/hooks";
import { useToast } from "@/components/global/toast";
import { TableSkeleton } from "@/components/global/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AFFILIATE_CONFIG, ESTIMATED_YEAR1_EARNINGS_CENTS } from "@/lib/affiliate-config";
import {
  Copy, Check, Share2, DollarSign, Users, TrendingUp,
  Calendar, ChevronDown, ChevronRight, Sparkles, ExternalLink,
} from "lucide-react";

interface Affiliate {
  id: string;
  promo_code: string;
  display_name: string;
  status: string;
  stripe_connect_onboarded: boolean;
}

interface Referral {
  id: string;
  referred_user_id: string | null;
  status: string;
  plan_tier: string | null;
  signed_up_at: string | null;
  first_paid_at: string | null;
  commission_ends_at: string | null;
}

interface Commission {
  id: string;
  referral_id: string;
  charge_amount_cents: number;
  commission_amount_cents: number;
  charged_at: string;
  releases_at: string;
  status: string;
  voided_reason: string | null;
}

interface Payout {
  id: string;
  amount_cents: number;
  status: string;
  period_start: string;
  period_end: string;
  paid_at: string | null;
  stripe_transfer_id: string | null;
}

export default function ReferralsPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState<"link" | "code" | null>(null);
  const [showLedger, setShowLedger] = useState(false);

  const { data: affiliatesRaw, loading: affLoading } = useSupabaseQuery<Affiliate>("affiliates");
  const affiliate = affiliatesRaw[0] || null; // User has at most one affiliate row

  const { data: referrals, loading: refLoading } = useSupabaseQuery<Referral>("affiliate_referrals", {
    order: { column: "created_at", ascending: false },
  });
  const { data: commissions, loading: commLoading } = useSupabaseQuery<Commission>("commissions", {
    order: { column: "charged_at", ascending: false },
  });
  const { data: payouts, loading: payLoading } = useSupabaseQuery<Payout>("payouts", {
    order: { column: "created_at", ascending: false },
  });

  const loading = affLoading || refLoading || commLoading || payLoading;

  // ── Derived stats ──────────────────────────────────────────────

  const totalSignups = referrals.filter((r) => r.status !== "clicked").length;
  const convertedCount = referrals.filter((r) => ["paying", "graduated"].includes(r.status)).length;

  const thisMonthCommissions = useMemo(() => {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return commissions
      .filter((c) => c.status !== "voided" && new Date(c.charged_at) >= start)
      .reduce((s, c) => s + c.commission_amount_cents, 0);
  }, [commissions]);

  const lifetimeEarnings = commissions
    .filter((c) => c.status !== "voided")
    .reduce((s, c) => s + c.commission_amount_cents, 0);

  const payableBalance = commissions
    .filter((c) => c.status === "payable")
    .reduce((s, c) => s + c.commission_amount_cents, 0);

  const heldBalance = commissions
    .filter((c) => c.status === "held")
    .reduce((s, c) => s + c.commission_amount_cents, 0);

  // Next payout date (15th of next month or this month if before the 15th)
  const nextPayoutDate = useMemo(() => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), AFFILIATE_CONFIG.PAYOUT_DAY_OF_MONTH);
    if (d <= now) d.setMonth(d.getMonth() + 1);
    return d;
  }, []);

  // Active subscribers — referrals that are still in their 12-month window
  const activeSubscribers = referrals.filter((r) => r.status === "paying");

  function copyText(text: string, type: "link" | "code") {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
    toast("success", type === "link" ? "Link copied!" : "Code copied!");
  }

  // ── Not an affiliate yet ───────────────────────────────────────

  if (!loading && !affiliate) {
    return (
      <div>
        <PageHeader
          headline={<>Creator <em className="italic text-[#7BAFC8]">Program</em></>}
          subheading="Earn 15% recurring commission for 12 months on every paying subscriber you refer."
        />
        <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-12 text-center max-w-lg mx-auto">
          <Sparkles className="h-10 w-10 text-[#7BAFC8] mx-auto mb-4" />
          <h2 className="text-[20px] font-serif text-[#1A2C38] mb-2">
            Join the affiliate program
          </h2>
          <p className="text-[14px] font-sans text-[#4A6070] leading-relaxed mb-2">
            Share your link, your followers save $12 on month 1, and you earn ~${(ESTIMATED_YEAR1_EARNINGS_CENTS / 100).toFixed(0)} per subscriber over 12 months.
          </p>
          <p className="text-[12px] font-sans text-[#8AAABB] mb-6">
            Payouts via Stripe Connect, monthly on the 15th.
          </p>
          <Link
            href="/creators/apply"
            className="inline-block bg-[#1E3F52] text-white rounded-[10px] px-6 py-3 text-[14px] font-sans hover:bg-[#2a5269] transition-colors"
            style={{ fontWeight: 600 }}
          >
            Apply now →
          </Link>
        </div>
      </div>
    );
  }

  // ── Pending application ────────────────────────────────────────

  if (!loading && affiliate && affiliate.status === "pending") {
    return (
      <div>
        <PageHeader
          headline={<>Creator <em className="italic text-[#7BAFC8]">Program</em></>}
          subheading="Your application is under review."
        />
        <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-12 text-center max-w-lg mx-auto">
          <Calendar className="h-10 w-10 text-[#A07830] mx-auto mb-4" />
          <h2 className="text-[20px] font-serif text-[#1A2C38] mb-2">Application under review</h2>
          <p className="text-[14px] font-sans text-[#4A6070] leading-relaxed mb-2">
            We&apos;re reviewing your application. You&apos;ll be notified once approved — usually within 5 business days.
          </p>
          <p className="text-[13px] font-sans text-[#8AAABB]">
            Your reserved code: <strong className="text-[#1A2C38]">{affiliate.promo_code}</strong>
          </p>
        </div>
      </div>
    );
  }

  // ── Approved but not onboarded ─────────────────────────────────

  if (!loading && affiliate && affiliate.status === "active" && !affiliate.stripe_connect_onboarded) {
    return (
      <div>
        <PageHeader
          headline={<>Creator <em className="italic text-[#7BAFC8]">Program</em></>}
          subheading="Complete your setup to start earning."
        />
        <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-12 text-center max-w-lg mx-auto">
          <DollarSign className="h-10 w-10 text-[#3D7A58] mx-auto mb-4" />
          <h2 className="text-[20px] font-serif text-[#1A2C38] mb-2">You&apos;re approved!</h2>
          <p className="text-[14px] font-sans text-[#4A6070] leading-relaxed mb-6">
            One more step — connect your bank account via Stripe so we can send payouts.
          </p>
          <Link
            href="/referrals/onboarding?step=connect"
            className="inline-block bg-[#1E3F52] text-white rounded-[10px] px-6 py-3 text-[14px] font-sans hover:bg-[#2a5269] transition-colors"
            style={{ fontWeight: 600 }}
          >
            Complete setup →
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return <TableSkeleton rows={4} cols={4} />;

  // ── Full dashboard (active + onboarded) ────────────────────────

  const promoLink = `createsuite.co/signup?ref=${affiliate?.promo_code || ""}`;

  return (
    <div>
      <PageHeader
        headline={<>Your <em className="italic text-[#7BAFC8]">referrals</em></>}
        subheading={`Code: ${affiliate?.promo_code} · 15% recurring for 12 months`}
        stats={[
          { value: String(totalSignups), label: "Signups" },
          { value: String(convertedCount), label: "Converted" },
          { value: formatCurrency(thisMonthCommissions / 100), label: "This month" },
          { value: formatCurrency(lifetimeEarnings / 100), label: "Lifetime" },
        ]}
      />

      {/* Next payout banner */}
      <div className="mb-6 bg-gradient-to-r from-[#1E3F52] to-[#2a5269] rounded-[10px] p-5 flex items-center justify-between">
        <div>
          <p className="text-[14px] font-sans text-white" style={{ fontWeight: 600 }}>
            {payableBalance >= AFFILIATE_CONFIG.MIN_PAYOUT_CENTS
              ? `Next payout: ${formatCurrency(payableBalance / 100)} on ${nextPayoutDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
              : `${formatCurrency((AFFILIATE_CONFIG.MIN_PAYOUT_CENTS - payableBalance) / 100)} until minimum payout`}
          </p>
          <p className="text-[12px] font-sans text-white/60 mt-0.5">
            {formatCurrency(heldBalance / 100)} held (releases after 30-day refund window)
            {payableBalance > 0 && ` · ${formatCurrency(payableBalance / 100)} ready to pay`}
          </p>
        </div>
        <DollarSign className="h-8 w-8 text-white/20" />
      </div>

      {/* Share section */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5">
          <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-2" style={{ fontWeight: 600 }}>
            YOUR AFFILIATE LINK
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-[#F2F8FB] border border-[#D8E8EE] rounded-[8px] px-3 py-2 text-[12px] font-mono text-[#1A2C38] truncate">
              {promoLink}
            </code>
            <button
              onClick={() => copyText(`https://${promoLink}`, "link")}
              className="flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-[8px] border border-[#D8E8EE] hover:bg-[#F2F8FB] text-[#7BAFC8]"
            >
              {copied === "link" ? <Check className="h-4 w-4 text-[#3D7A58]" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5">
          <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-2" style={{ fontWeight: 600 }}>
            YOUR PROMO CODE
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-[#F2F8FB] border border-[#D8E8EE] rounded-[8px] px-3 py-2 text-[16px] font-mono text-[#1A2C38] tracking-wider" style={{ fontWeight: 700 }}>
              {affiliate?.promo_code}
            </code>
            <button
              onClick={() => copyText(affiliate?.promo_code || "", "code")}
              className="flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-[8px] border border-[#D8E8EE] hover:bg-[#F2F8FB] text-[#7BAFC8]"
            >
              {copied === "code" ? <Check className="h-4 w-4 text-[#3D7A58]" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Active subscribers table */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-[#7BAFC8]" />
          <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB]" style={{ fontWeight: 600 }}>
            ACTIVE SUBSCRIBERS ({activeSubscribers.length})
          </p>
        </div>

        {activeSubscribers.length === 0 ? (
          <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-8 text-center">
            <p className="text-[14px] font-sans text-[#8AAABB] italic">
              No paying subscribers yet. Share your link to start earning!
            </p>
          </div>
        ) : (
          <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-4 px-5 py-3 bg-[#F0EAE0] text-[10px] font-sans uppercase tracking-[2px] text-[#8AAABB] border-b border-[#D8E8EE]" style={{ fontWeight: 600 }}>
              <span>Signed up</span>
              <span>Plan</span>
              <span>Months remaining</span>
              <span>Commission earned</span>
            </div>
            {activeSubscribers.map((r) => {
              const monthsLeft = r.commission_ends_at
                ? Math.max(0, Math.ceil((new Date(r.commission_ends_at).getTime() - Date.now()) / (30 * 86400000)))
                : AFFILIATE_CONFIG.COMMISSION_DURATION_MONTHS;
              const earned = commissions
                .filter((c) => c.referral_id === r.id && c.status !== "voided")
                .reduce((s, c) => s + c.commission_amount_cents, 0);
              return (
                <div key={r.id} className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-[#EEE8E0] last:border-b-0 items-center">
                  <span className="text-[13px] font-sans text-[#1A2C38]">
                    {r.first_paid_at ? formatDate(r.first_paid_at) : r.signed_up_at ? formatDate(r.signed_up_at) : "—"}
                  </span>
                  <span className="text-[13px] font-sans text-[#4A6070] capitalize">{r.plan_tier || "—"}</span>
                  <span className="text-[13px] font-sans text-[#4A6070]">{monthsLeft} of {AFFILIATE_CONFIG.COMMISSION_DURATION_MONTHS}</span>
                  <span className="text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>
                    {formatCurrency(earned / 100)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payout history */}
      {payouts.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-4 w-4 text-[#7BAFC8]" />
            <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB]" style={{ fontWeight: 600 }}>
              PAYOUT HISTORY
            </p>
          </div>
          <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-4 px-5 py-3 bg-[#F0EAE0] text-[10px] font-sans uppercase tracking-[2px] text-[#8AAABB] border-b border-[#D8E8EE]" style={{ fontWeight: 600 }}>
              <span>Date</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Period</span>
            </div>
            {payouts.map((p) => (
              <div key={p.id} className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-[#EEE8E0] last:border-b-0 items-center">
                <span className="text-[13px] font-sans text-[#1A2C38]">
                  {p.paid_at ? formatDate(p.paid_at) : formatDate(p.period_end)}
                </span>
                <span className="text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>
                  {formatCurrency(p.amount_cents / 100)}
                </span>
                <span className={`text-[11px] font-sans uppercase tracking-wide px-2 py-0.5 rounded-full inline-block ${
                  p.status === "paid" ? "bg-[#E8F4EE] text-[#3D7A58]" :
                  p.status === "pending" ? "bg-[#FFF8E8] text-[#A07830]" :
                  "bg-[#F4EAEA] text-[#A03D3D]"
                }`} style={{ fontWeight: 600 }}>
                  {p.status}
                </span>
                <span className="text-[12px] font-sans text-[#8AAABB]">
                  {formatDate(p.period_start)} – {formatDate(p.period_end)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commission ledger (collapsible) */}
      {commissions.length > 0 && (
        <div>
          <button
            onClick={() => setShowLedger(!showLedger)}
            className="flex items-center gap-2 mb-3 text-[#8AAABB] hover:text-[#4A6070]"
          >
            {showLedger ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <p className="text-[10px] font-sans uppercase tracking-[3px]" style={{ fontWeight: 600 }}>
              COMMISSION LEDGER ({commissions.length} entries)
            </p>
          </button>

          {showLedger && (
            <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] overflow-hidden">
              <div className="grid grid-cols-[1fr_1fr_1fr_1fr_100px] gap-4 px-5 py-3 bg-[#F0EAE0] text-[10px] font-sans uppercase tracking-[2px] text-[#8AAABB] border-b border-[#D8E8EE]" style={{ fontWeight: 600 }}>
                <span>Date</span>
                <span>Charge</span>
                <span>Commission</span>
                <span>Releases</span>
                <span>Status</span>
              </div>
              {commissions.map((c) => (
                <div key={c.id} className="grid grid-cols-[1fr_1fr_1fr_1fr_100px] gap-4 px-5 py-2.5 border-b border-[#EEE8E0] last:border-b-0 items-center text-[12px] font-sans">
                  <span className="text-[#4A6070]">{formatDate(c.charged_at)}</span>
                  <span className="text-[#1A2C38]">{formatCurrency(c.charge_amount_cents / 100)}</span>
                  <span className="text-[#1A2C38]" style={{ fontWeight: 500 }}>
                    {formatCurrency(c.commission_amount_cents / 100)}
                  </span>
                  <span className="text-[#8AAABB]">{formatDate(c.releases_at)}</span>
                  <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full text-center ${
                    c.status === "paid" ? "bg-[#E8F4EE] text-[#3D7A58]" :
                    c.status === "payable" ? "bg-[#F2F8FB] text-[#7BAFC8]" :
                    c.status === "held" ? "bg-[#FFF8E8] text-[#A07830]" :
                    "bg-[#F4EAEA] text-[#A03D3D]"
                  }`} style={{ fontWeight: 600 }}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
