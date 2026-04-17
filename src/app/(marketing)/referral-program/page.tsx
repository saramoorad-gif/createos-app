import type { Metadata } from "next";
import Link from "next/link";
import { AFFILIATE_CONFIG, ESTIMATED_YEAR1_EARNINGS_CENTS } from "@/lib/affiliate-config";

export const metadata: Metadata = {
  title: "Creator Referral Program — Create Suite",
  description: "Earn 15% recurring commission for 12 months on every paying subscriber you refer to Create Suite.",
};

const earningsTable = [
  { conversions: 10, year1: 684, monthly: 57 },
  { conversions: 25, year1: 1710, monthly: 143 },
  { conversions: 50, year1: 3420, monthly: 285 },
  { conversions: 100, year1: 6840, monthly: 570 },
];

const steps = [
  { num: "01", title: "Apply", desc: "Fill out a short form with your social handles and preferred promo code. We review applications within 5 business days." },
  { num: "02", title: "Share", desc: "Get a unique link and code. Share it on TikTok, Instagram, YouTube, newsletters — anywhere your audience finds you." },
  { num: "03", title: "Get paid", desc: "When your followers sign up and pay, you earn 15% of every payment for 12 months. Payouts hit your bank on the 15th." },
];

export default function ReferralProgramPage() {
  return (
    <div>
      {/* Hero */}
      <section className="pt-20 pb-16 px-6">
        <div className="max-w-[800px] mx-auto text-center">
          <p className="text-[12px] font-sans font-semibold uppercase tracking-[3px] text-[#7BAFC8] mb-3">
            CREATOR PROGRAM
          </p>
          <h1 className="text-[48px] md:text-[56px] font-serif font-normal leading-[1.1] text-[#1A2C38] mb-4">
            Earn 15% recurring commission.{" "}
            <em className="italic text-[#3D6E8A]">For 12 months.</em>
          </h1>
          <p className="text-[18px] font-sans text-[#4A6070] max-w-[600px] mx-auto mb-8 leading-relaxed">
            Share Create Suite with your audience. They save $12 on month one. You earn ~${(ESTIMATED_YEAR1_EARNINGS_CENTS / 100).toFixed(0)} per subscriber, per year.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/creators/apply"
              className="bg-[#1E3F52] text-white text-[15px] font-sans px-7 py-3.5 rounded-[10px] hover:bg-[#2a5269] transition-colors"
              style={{ fontWeight: 500 }}
            >
              Apply to join →
            </Link>
            <Link
              href="/affiliate-agreement"
              className="border border-[#D8E8EE] text-[#3D6E8A] text-[15px] font-sans px-7 py-3.5 rounded-[10px] hover:bg-[#F2F8FB] transition-colors"
              style={{ fontWeight: 500 }}
            >
              Read the terms
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6 bg-[#F2F8FB]">
        <div className="max-w-[900px] mx-auto">
          <p className="text-[12px] font-sans font-semibold uppercase tracking-[3px] text-[#7BAFC8] mb-8 text-center">
            HOW IT WORKS
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="h-14 w-14 rounded-full bg-white border-[1.5px] border-[#D8E8EE] flex items-center justify-center mx-auto mb-4">
                  <span className="text-[18px] font-serif text-[#3D6E8A]">{s.num}</span>
                </div>
                <h3 className="text-[18px] font-serif text-[#1A2C38] mb-2">{s.title}</h3>
                <p className="text-[14px] font-sans text-[#4A6070] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission breakdown */}
      <section className="py-16 px-6">
        <div className="max-w-[700px] mx-auto">
          <p className="text-[12px] font-sans font-semibold uppercase tracking-[3px] text-[#7BAFC8] mb-3 text-center">
            EARNINGS BREAKDOWN
          </p>
          <h2 className="text-[32px] font-serif text-[#1A2C38] text-center mb-2">
            What you could <em className="italic text-[#3D6E8A]">earn</em>
          </h2>
          <p className="text-[15px] font-sans text-[#4A6070] text-center mb-8 max-w-md mx-auto">
            Based on the UGC + Influencer plan at ${(AFFILIATE_CONFIG.PROMO_PLAN_PRICE_CENTS / 100).toFixed(0)}/month with {(AFFILIATE_CONFIG.COMMISSION_PERCENT * 100).toFixed(0)}% commission.
          </p>

          <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] overflow-hidden">
            <div className="grid grid-cols-3 gap-4 px-6 py-3 bg-[#F0EAE0] text-[10px] font-sans uppercase tracking-[2px] text-[#8AAABB]" style={{ fontWeight: 600 }}>
              <span>Paying subscribers</span>
              <span>Year 1 earnings</span>
              <span>Monthly avg</span>
            </div>
            {earningsTable.map((row) => (
              <div key={row.conversions} className="grid grid-cols-3 gap-4 px-6 py-4 border-t border-[#EEE8E0]">
                <span className="text-[16px] font-serif text-[#1A2C38]">{row.conversions}</span>
                <span className="text-[16px] font-serif text-[#3D7A58]">${row.year1.toLocaleString()}</span>
                <span className="text-[14px] font-sans text-[#4A6070]">${row.monthly}/mo</span>
              </div>
            ))}
          </div>

          <p className="text-[12px] font-sans text-[#8AAABB] text-center mt-4">
            Commission on month 1: ${((AFFILIATE_CONFIG.PROMO_FIRST_MONTH_PRICE_CENTS / 100) * AFFILIATE_CONFIG.COMMISSION_PERCENT).toFixed(2)}.
            Months 2–12: ${((AFFILIATE_CONFIG.PROMO_PLAN_PRICE_CENTS / 100) * AFFILIATE_CONFIG.COMMISSION_PERCENT).toFixed(2)}/mo.
            Held 30 days. Paid on the 15th. $50 minimum.
          </p>
        </div>
      </section>

      {/* Key details */}
      <section className="py-16 px-6 bg-[#F0EAE0]">
        <div className="max-w-[800px] mx-auto">
          <p className="text-[12px] font-sans font-semibold uppercase tracking-[3px] text-[#7BAFC8] mb-8 text-center">
            PROGRAM DETAILS
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Commission rate", value: `${(AFFILIATE_CONFIG.COMMISSION_PERCENT * 100).toFixed(0)}% recurring` },
              { label: "Duration", value: `${AFFILIATE_CONFIG.COMMISSION_DURATION_MONTHS} months per subscriber` },
              { label: "Follower discount", value: `$${(AFFILIATE_CONFIG.FOLLOWER_DISCOUNT_CENTS / 100).toFixed(0)} off month 1` },
              { label: "Attribution window", value: `${AFFILIATE_CONFIG.COOKIE_WINDOW_DAYS}-day cookie` },
              { label: "Minimum payout", value: `$${(AFFILIATE_CONFIG.MIN_PAYOUT_CENTS / 100).toFixed(0)}` },
              { label: "Payout schedule", value: `Monthly, on the ${AFFILIATE_CONFIG.PAYOUT_DAY_OF_MONTH}th` },
              { label: "Hold period", value: `${AFFILIATE_CONFIG.REFUND_HOLD_DAYS} days (refund window)` },
              { label: "Payout method", value: "Stripe Connect (direct to bank)" },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-[10px] border border-[#D8E8EE] px-5 py-4 flex items-center justify-between">
                <span className="text-[13px] font-sans text-[#4A6070]">{item.label}</span>
                <span className="text-[14px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-[600px] mx-auto text-center">
          <h2 className="text-[32px] font-serif text-[#1A2C38] mb-3">
            Ready to <em className="italic text-[#3D6E8A]">earn</em>?
          </h2>
          <p className="text-[15px] font-sans text-[#4A6070] mb-8">
            Applications are reviewed within 5 business days. Once approved, you can start sharing immediately.
          </p>
          <Link
            href="/creators/apply"
            className="bg-[#1E3F52] text-white text-[15px] font-sans px-8 py-4 rounded-[10px] hover:bg-[#2a5269] transition-colors inline-block"
            style={{ fontWeight: 500 }}
          >
            Apply to join →
          </Link>
        </div>
      </section>
    </div>
  );
}
