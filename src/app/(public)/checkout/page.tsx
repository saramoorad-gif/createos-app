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
      "Brand reports",
      "E-signature integration",
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

  // Show referral discount if applicable
  const hasReferralDiscount = refCode && planKey === "ugc_influencer" && billingCycle === "monthly";

  // If user is already subscribed, redirect to dashboard
  useEffect(() => {
    if (!authLoading && profile && (profile.subscription_status === "active" || profile.subscription_status === "trialing")) {
      router.push("/dashboard");
    }
  }, [authLoading, profile, router]);

  // If not signed in, redirect to signup
  useEffect(() => {
    if (!authLoading && !user && isSupabaseConfigured()) {
      router.push("/signup");
    }
  }, [authLoading, user, router]);

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
          referralCode: hasReferralDiscount ? refCode : null,
          successUrl: `${window.location.origin}/dashboard?checkout=success&plan=${planKey}`,
          cancelUrl: `${window.location.origin}/checkout?plan=${planKey}${refCode ? `&ref=${refCode}` : ""}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

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
        metadata: { planKey, billingCycle, hasReferralDiscount },
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
                Referral discount applied!
              </p>
              <p className="text-[11px] font-sans text-white/80">
                You&apos;re getting $12 off your first month of UGC + Influencer.
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
                    <span className="text-[12px] font-sans text-[#3D7A58]" style={{ fontWeight: 500 }}>🎁 Referral discount</span>
                    <span className="text-[12px] font-sans text-[#3D7A58]" style={{ fontWeight: 600 }}>-$12.00</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 mb-5">
                <span className="text-[14px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>
                  {billingCycle === "monthly" ? "Due today" : "Due today (12 months)"}
                </span>
                <div className="text-right">
                  {hasReferralDiscount && (
                    <div className="text-[12px] font-sans text-[#8AAABB] line-through">$39.00</div>
                  )}
                  <span className="text-[20px] font-serif text-[#1A2C38]">
                    {hasReferralDiscount ? "$27.00" : (billingCycle === "monthly" ? currentPrice : `$${parseInt(currentPrice.replace("$", "")) * 12}`)}
                  </span>
                </div>
              </div>

              {error && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-[8px]">
                  <p className="text-[12px] font-sans text-red-700">{error}</p>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={loading || authLoading}
                className="w-full flex items-center justify-center gap-2 bg-[#1E3F52] text-white rounded-[8px] px-4 py-3 text-[14px] font-sans hover:bg-[#2a5269] transition-colors disabled:opacity-50"
                style={{ fontWeight: 600 }}
              >
                {loading ? (
                  "Redirecting to Stripe..."
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

            {/* Change plan link */}
            <div className="text-center">
              <Link href="/signup" className="text-[12px] font-sans text-[#7BAFC8] hover:underline" style={{ fontWeight: 500 }}>
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
