"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { logError } from "@/lib/error-logger";
import { CheckCircle2, ArrowRight, Shield, Lock, CreditCard } from "lucide-react";

interface PlanDetail {
  name: string;
  tagline: string;
  monthlyPrice: string;
  annualPrice: string;
  monthlyKey: string;
  annualKey: string;
  features: string[];
  popular?: boolean;
}

const plans: Record<string, PlanDetail> = {
  ugc: {
    name: "UGC Creator",
    tagline: "For creators who make content for brands",
    monthlyPrice: "$27",
    annualPrice: "$21",
    monthlyKey: "ugc_monthly",
    annualKey: "ugc_annual",
    features: [
      "Unlimited deal pipeline",
      "AI contract review",
      "AI deal scanner (Gmail)",
      "Rate calculator",
      "Contract templates",
      "Media kit builder",
      "Task management",
      "Content calendar",
      "Invoice tracking",
      "Income reports",
    ],
  },
  ugc_influencer: {
    name: "UGC + Influencer",
    tagline: "For creators building their own audience too",
    monthlyPrice: "$39",
    annualPrice: "$31",
    monthlyKey: "ugc_influencer_monthly",
    annualKey: "ugc_influencer_annual",
    popular: true,
    features: [
      "Everything in UGC Creator",
      "Audience analytics",
      "Revenue forecasting",
      "Tax-ready income export",
      "Brand Radar (AI matching)",
      "Campaign recaps",
      "Exclusivity manager",
      "Advanced media kit",
    ],
  },
  agency: {
    name: "Agency Starter",
    tagline: "Manage a roster of up to 15 creators",
    monthlyPrice: "$149",
    annualPrice: "$119",
    monthlyKey: "agency_starter_monthly",
    annualKey: "agency_starter_annual",
    features: [
      "Up to 15 creators",
      "Full pipeline & roster",
      "Campaign management",
      "Contract builder + templates",
      "Commission tracking",
      "Conflict detection",
      "Team collaboration",
      "Brand reports (saved + PDF)",
    ],
  },
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const rawPlanKey = searchParams.get("plan") || "ugc";
  // Validate plan key — only allow valid paid plans (not "free" or unknown)
  const validPlans = ["ugc", "ugc_influencer", "agency"];
  const planKey = validPlans.includes(rawPlanKey) ? rawPlanKey : "ugc";
  const refCode = searchParams.get("ref") || (profile as any)?.referred_by_code || null;
  const plan = plans[planKey] || plans.ugc;

  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Referral code input — either arrives via ?ref=URL or user types it here.
  const [showRefField, setShowRefField] = useState(Boolean(refCode));
  const [refInput, setRefInput] = useState(refCode || "");
  const [refCheck, setRefCheck] = useState<
    | { status: "idle" }
    | { status: "checking" }
    | { status: "valid"; code: string; referrerName: string }
    | { status: "invalid"; message: string }
  >(refCode ? { status: "checking" } : { status: "idle" });

  // Track affiliate link clicks from the checkout page too (creator may share
  // /checkout?ref=CODE directly instead of /signup?ref=CODE).
  useEffect(() => {
    if (!refCode) return;
    fetch("/api/affiliates/track-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: refCode.toUpperCase(), page: "checkout" }),
    }).catch(() => {});
  }, [refCode]);

  // Auto-validate a ref code that arrived via URL so the banner matches reality
  // (we used to assume URL codes were always valid, which meant a typo in a
  // shared link silently gave $12 off to a non-existent referrer).
  useEffect(() => {
    if (!refCode) return;
    (async () => {
      try {
        const res = await fetch("/api/referrals/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: refCode }),
        });
        const data = await res.json().catch(() => ({}));
        if (data?.ok) {
          setRefCheck({ status: "valid", code: data.code, referrerName: data.referrer_name });
        } else {
          setRefCheck({
            status: "invalid",
            message: "That referral link is no longer valid.",
          });
        }
      } catch {
        setRefCheck({ status: "idle" });
      }
    })();
  }, [refCode]);

  async function validateRefCode() {
    const code = refInput.trim().toUpperCase();
    if (!code) return;
    setRefCheck({ status: "checking" });
    try {
      const res = await fetch("/api/referrals/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.ok) {
        setRefCheck({ status: "valid", code: data.code, referrerName: data.referrer_name });
      } else {
        setRefCheck({ status: "invalid", message: "That code isn't valid — double-check with the creator who shared it." });
      }
    } catch {
      setRefCheck({ status: "invalid", message: "Network error — try again." });
    }
  }

  // Referral discount is available on the ugc_influencer plan for BOTH
  // billing cycles:
  //   • Monthly → $12 off first month (first month $27 instead of $39).
  //   • Annual  → one month free at the discounted annual rate ($31 off).
  const hasReferralDiscount =
    refCheck.status === "valid" && planKey === "ugc_influencer";
  const discountAmount =
    planKey === "ugc_influencer" && billingCycle === "monthly" ? 12 : 31;
  const appliedRefCode = refCheck.status === "valid" ? refCheck.code : null;

  // Single effect to avoid race conditions between multiple router.push calls
  useEffect(() => {
    if (authLoading) return;

    // Not signed in → signup. Preserve the ref code so the creator
    // gets credited even if the user lands directly on /checkout.
    if (!user && isSupabaseConfigured()) {
      const signupUrl = refCode
        ? `/signup?plan=${planKey}&ref=${encodeURIComponent(refCode)}`
        : `/signup?plan=${planKey}`;
      router.push(signupUrl);
      return;
    }

    // Already subscribed → dashboard
    if (profile && (profile.subscription_status === "active" || profile.subscription_status === "trialing")) {
      router.push("/dashboard");
      return;
    }
  }, [authLoading, user, profile, router]);

  async function handleCheckout() {
    if (!user) {
      router.push("/signup");
      return;
    }

    setLoading(true);
    setError("");

    const priceKey = billingCycle === "monthly" ? plan.monthlyKey : plan.annualKey;

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceKey,
          userId: user.id,
          email: user.email,
          referralCode: hasReferralDiscount ? appliedRefCode : null,
          billingCycle,
          successUrl: `${window.location.origin}/dashboard?checkout=success&plan=${planKey}`,
          cancelUrl: `${window.location.origin}/checkout?plan=${planKey}${appliedRefCode ? `&ref=${appliedRefCode}` : ""}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        // Surface the server's actionable hint when available so the real
        // cause (e.g. missing STRIPE_SECRET_KEY) is visible in the UI.
        const combined = data.hint
          ? `${data.error || "Checkout failed"} — ${data.hint}`
          : data.error || "Checkout failed";
        const err = new Error(combined);
        (err as any).type = data.type;
        (err as any).code = data.code;
        (err as any).requestId = data.requestId;
        throw err;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      logError({
        source: "checkout.handleCheckout",
        message: err.message || "Checkout failed",
        stack: err.stack,
        userId: user?.id,
        userEmail: user?.email,
        metadata: {
          planKey,
          billingCycle,
          hasReferralDiscount,
          type: err.type,
          code: err.code,
          requestId: err.requestId,
        },
      });
      setError(err.message || "Failed to start checkout. Please try again.");
      setLoading(false);
    }
  }

  const currentPrice = billingCycle === "monthly" ? plan.monthlyPrice : plan.annualPrice;

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-[28px] font-serif text-[#1A2C38]">
              create<em className="italic text-[#7BAFC8]">Suite</em>
            </h1>
          </Link>
          <p className="text-[13px] font-sans text-[#8AAABB] mt-1">
            Complete your subscription to access your account
          </p>
        </div>

        {/* Referral banner */}
        {hasReferralDiscount && (
          <div className="mb-6 bg-gradient-to-r from-[#3D7A58] to-[#2d5c42] rounded-[10px] p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <span className="text-[18px]">🎁</span>
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-sans text-white" style={{ fontWeight: 600 }}>
                {refCheck.status === "valid" ? `Referred by ${refCheck.referrerName} — discount applied!` : "Referral discount applied!"}
              </p>
              <p className="text-[11px] font-sans text-white/80">
                {billingCycle === "monthly"
                  ? "You’re getting $12 off your first month of UGC + Influencer."
                  : "You’re getting one month free at the annual rate — $31 off your first year."}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Plan details */}
          <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-[11px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-2" style={{ fontWeight: 600 }}>YOUR PLAN</p>
                <h2 className="text-[32px] font-serif text-[#1A2C38]">{plan.name}</h2>
                <p className="text-[14px] font-sans text-[#8AAABB] mt-1">{plan.tagline}</p>
              </div>
              {plan.popular && (
                <span className="text-[10px] font-sans uppercase tracking-[1.5px] px-2 py-1 rounded-full bg-[#E8F4EE] text-[#3D7A58]" style={{ fontWeight: 600 }}>
                  Most Popular
                </span>
              )}
            </div>

            {/* Billing cycle toggle */}
            <div className="mb-6">
              <div className="flex items-center bg-[#F2F8FB] rounded-[10px] p-1">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`flex-1 px-4 py-2.5 text-[12px] font-sans rounded-[8px] transition-all ${
                    billingCycle === "monthly" ? "bg-white text-[#1A2C38] shadow-sm" : "text-[#8AAABB]"
                  }`}
                  style={{ fontWeight: 600 }}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle("annual")}
                  className={`flex-1 px-4 py-2.5 text-[12px] font-sans rounded-[8px] transition-all ${
                    billingCycle === "annual" ? "bg-white text-[#1A2C38] shadow-sm" : "text-[#8AAABB]"
                  }`}
                  style={{ fontWeight: 600 }}
                >
                  Annual <span className="text-[10px] text-[#3D7A58]">· save 20%</span>
                </button>
              </div>
            </div>

            {/* Price display */}
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-[56px] font-serif text-[#1A2C38] leading-none">{currentPrice}</span>
              <span className="text-[14px] font-sans text-[#8AAABB]">
                per month{billingCycle === "annual" && ", billed annually"}
              </span>
            </div>

            {/* Features */}
            <div>
              <p className="text-[11px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-3" style={{ fontWeight: 600 }}>WHAT'S INCLUDED</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#3D7A58] flex-shrink-0 mt-0.5" />
                    <span className="text-[13px] font-sans text-[#1A2C38]">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Checkout sidebar */}
          <aside className="space-y-4">
            {/* Summary */}
            <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-6">
              <p className="text-[11px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-4" style={{ fontWeight: 600 }}>ORDER SUMMARY</p>

              <div className="space-y-3 pb-4 border-b border-[#D8E8EE]">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-sans text-[#4A6070]">{plan.name}</span>
                  <span className="text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>
                    {currentPrice}/mo
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-sans text-[#8AAABB]">Billing</span>
                  <span className="text-[12px] font-sans text-[#8AAABB]">{billingCycle === "monthly" ? "Monthly" : "Annual"}</span>
                </div>
                {hasReferralDiscount && (
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-sans text-[#3D7A58]" style={{ fontWeight: 500 }}>
                      🎁 {billingCycle === "annual" ? "One month free" : "Referral discount"}
                    </span>
                    <span className="text-[12px] font-sans text-[#3D7A58]" style={{ fontWeight: 600 }}>
                      -${discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 mb-5">
                <span className="text-[14px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>
                  {billingCycle === "monthly" ? "Due today" : "Due today (12 months)"}
                </span>
                <div className="text-right">
                  {(() => {
                    const unit = parseInt(currentPrice.replace("$", "")) || 0;
                    const base = billingCycle === "monthly" ? unit : unit * 12;
                    const finalTotal = hasReferralDiscount ? Math.max(0, base - discountAmount) : base;
                    return (
                      <>
                        {hasReferralDiscount && (
                          <div className="text-[12px] font-sans text-[#8AAABB] line-through">
                            ${base.toFixed(2)}
                          </div>
                        )}
                        <span className="text-[20px] font-serif text-[#1A2C38]">
                          ${finalTotal.toFixed(2)}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Referral / promo code entry (ugc_influencer only). Lets a
                  follower who got a code from a creator type it in here
                  instead of needing to click the creator's referral link. */}
              {planKey === "ugc_influencer" && (
                <div className="mb-5">
                  {!showRefField ? (
                    <button
                      type="button"
                      onClick={() => setShowRefField(true)}
                      className="text-[12px] font-sans text-[#3D6E8A] underline underline-offset-2 hover:text-[#0F1E28]"
                    >
                      Got a code from a creator?
                    </button>
                  ) : (
                    <div>
                      <label className="text-[11px] font-sans uppercase tracking-[3px] text-[#8AAABB] block mb-1.5" style={{ fontWeight: 600 }}>
                        Referral code
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={refInput}
                          onChange={(e) => {
                            setRefInput(e.target.value.toUpperCase().replace(/\s+/g, ""));
                            if (refCheck.status !== "idle") setRefCheck({ status: "idle" });
                          }}
                          placeholder="BRIFREE"
                          className="flex-1 h-[40px] rounded-[8px] border border-[#D8E8EE] px-3 text-[13px] font-mono tracking-wider text-[#1A2C38] bg-white focus:outline-none focus:ring-[3px] focus:ring-[#7BAFC8]/20 focus:border-[#7BAFC8]"
                        />
                        <button
                          type="button"
                          onClick={validateRefCode}
                          disabled={!refInput.trim() || refCheck.status === "checking"}
                          className="px-3 h-[40px] rounded-[8px] bg-[#0F1E28] text-white text-[12px] font-sans hover:bg-[#1b2f3a] disabled:opacity-40"
                          style={{ fontWeight: 600 }}
                        >
                          {refCheck.status === "checking" ? "..." : "Apply"}
                        </button>
                      </div>
                      {refCheck.status === "valid" && (
                        <p className="text-[11px] font-sans text-[#3D7A58] mt-1.5">
                          ✓ Referred by {refCheck.referrerName} — {billingCycle === "monthly" ? "$12 off first month" : "one month free"}.
                        </p>
                      )}
                      {refCheck.status === "invalid" && (
                        <p className="text-[11px] font-sans text-red-700 mt-1.5">⚠ {refCheck.message}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-[8px]">
                  <p className="text-[12px] font-sans text-red-700">{error}</p>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={loading || (authLoading && !user)}
                className="w-full flex items-center justify-center gap-2 bg-[#1E3F52] text-white rounded-[8px] px-4 py-3 text-[14px] font-sans hover:bg-[#2a5269] transition-colors disabled:opacity-50"
                style={{ fontWeight: 600 }}
              >
                {loading ? (
                  "Redirecting to Stripe..."
                ) : authLoading && !user ? (
                  "Loading..."
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" /> Continue to payment
                  </>
                )}
              </button>

              <p className="text-[11px] font-sans text-[#8AAABB] text-center mt-3">
                Cancel anytime. Subscription will auto-renew.
              </p>
            </div>

            {/* Security badges */}
            <div className="bg-[#F2F8FB] border-[1.5px] border-[#D8E8EE] rounded-[10px] p-4">
              <div className="flex items-start gap-2 mb-2">
                <Lock className="h-4 w-4 text-[#7BAFC8] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[12px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>Secure checkout</p>
                  <p className="text-[11px] font-sans text-[#8AAABB]">Payment powered by Stripe. Your card never touches our servers.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-[#7BAFC8] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[12px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>30-day guarantee</p>
                  <p className="text-[11px] font-sans text-[#8AAABB]">Not satisfied? Cancel within 30 days for a full refund.</p>
                </div>
              </div>
            </div>

            {/* Change plan link — /pricing shows all plans (Free, UGC, UGC+Influencer, Agency)
                and routes smartly based on auth state, so signed-in users don't get sent
                back to the signup form. */}
            <div className="text-center">
              <Link href="/pricing" className="text-[12px] font-sans text-[#7BAFC8] hover:underline" style={{ fontWeight: 500 }}>
                ← Change plan
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center"><p className="text-[14px] font-sans text-[#8AAABB]">Loading...</p></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
