"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { getSupabase } from "@/lib/supabase";
import { useToast } from "@/components/global/toast";
import { CheckCircle2, CreditCard, FileText, Sparkles, Loader2 } from "lucide-react";

function OnboardingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const stepParam = searchParams.get("step") || "terms";

  const [currentStep, setCurrentStep] = useState<"terms" | "connect" | "welcome">(
    stepParam === "welcome" ? "welcome" : stepParam === "connect" ? "connect" : "terms"
  );
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [connectChecking, setConnectChecking] = useState(false);

  // If returning from Stripe Connect onboarding, check status
  useEffect(() => {
    if (stepParam === "welcome" && user) {
      checkConnectStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepParam, user]);

  async function getAuthHeaders() {
    const sb = getSupabase();
    const { data: { session } } = await sb.auth.getSession();
    if (!session?.access_token) return null;
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    };
  }

  async function checkConnectStatus() {
    setConnectChecking(true);
    try {
      const headers = await getAuthHeaders();
      if (!headers) return;
      const res = await fetch("/api/affiliates/stripe-connect", { headers });
      const data = await res.json();
      if (data.onboarded) {
        setCurrentStep("welcome");
        toast("success", "Stripe Connect connected!");
      } else {
        setCurrentStep("connect");
        if (searchParams.get("refresh")) {
          toast("info", "Please complete Stripe Connect setup to receive payouts.");
        }
      }
    } catch {
      setCurrentStep("connect");
    }
    setConnectChecking(false);
  }

  async function handleAcceptTerms() {
    setTermsAccepted(true);
    setCurrentStep("connect");
  }

  async function handleStartConnect() {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      if (!headers) {
        toast("error", "Please sign in first.");
        return;
      }
      const res = await fetch("/api/affiliates/stripe-connect", {
        method: "POST",
        headers,
      });
      const data = await res.json();
      if (data.alreadyOnboarded) {
        setCurrentStep("welcome");
        toast("success", "Already connected!");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast("error", data.error || "Failed to start Stripe Connect");
      }
    } catch (err: any) {
      toast("error", err.message || "Failed to start Stripe Connect");
    }
    setLoading(false);
  }

  const steps = [
    { key: "terms", label: "Accept terms", icon: FileText },
    { key: "connect", label: "Connect bank", icon: CreditCard },
    { key: "welcome", label: "Start earning", icon: Sparkles },
  ] as const;

  const stepIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="max-w-lg mx-auto py-12">
      {/* Progress steps */}
      <div className="flex items-center justify-center gap-3 mb-10">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-[12px] ${
                i < stepIndex
                  ? "bg-[#E8F4EE] text-[#3D7A58]"
                  : i === stepIndex
                    ? "bg-[#1E3F52] text-white"
                    : "bg-[#F2F8FB] text-[#8AAABB]"
              }`}
            >
              {i < stepIndex ? <CheckCircle2 className="h-4 w-4" /> : <s.icon className="h-3.5 w-3.5" />}
            </div>
            <span
              className={`text-[11px] font-sans hidden sm:block ${
                i === stepIndex ? "text-[#1A2C38]" : "text-[#8AAABB]"
              }`}
              style={{ fontWeight: i === stepIndex ? 600 : 400 }}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className={`w-12 h-[2px] ${i < stepIndex ? "bg-[#3D7A58]" : "bg-[#D8E8EE]"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Accept terms */}
      {currentStep === "terms" && (
        <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-6 text-center">
          <FileText className="h-10 w-10 text-[#7BAFC8] mx-auto mb-4" />
          <h2 className="text-[22px] font-serif text-[#1A2C38] mb-2">
            Review the <em className="italic text-[#7BAFC8]">terms</em>
          </h2>
          <p className="text-[14px] font-sans text-[#4A6070] mb-6 leading-relaxed">
            Before receiving commissions, please review and accept the Affiliate Program Agreement.
          </p>
          <Link
            href="/affiliate-agreement"
            target="_blank"
            className="inline-block text-[13px] font-sans text-[#7BAFC8] hover:underline mb-6"
          >
            Read the full Affiliate Program Agreement →
          </Link>
          <br />
          <button
            onClick={handleAcceptTerms}
            className="bg-[#1E3F52] text-white rounded-[10px] px-8 py-3 text-[14px] font-sans hover:bg-[#2a5269] transition-colors"
            style={{ fontWeight: 600 }}
          >
            I accept the terms
          </button>
        </div>
      )}

      {/* Step 2: Stripe Connect */}
      {currentStep === "connect" && (
        <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-6 text-center">
          <CreditCard className="h-10 w-10 text-[#7BAFC8] mx-auto mb-4" />
          <h2 className="text-[22px] font-serif text-[#1A2C38] mb-2">
            Connect your <em className="italic text-[#7BAFC8]">bank</em>
          </h2>
          <p className="text-[14px] font-sans text-[#4A6070] mb-6 leading-relaxed">
            Set up Stripe Connect so we can send your commission payouts directly to your bank account. This is a secure, one-time setup through Stripe.
          </p>
          <button
            onClick={handleStartConnect}
            disabled={loading || connectChecking}
            className="inline-flex items-center gap-2 bg-[#1E3F52] text-white rounded-[10px] px-8 py-3 text-[14px] font-sans hover:bg-[#2a5269] transition-colors disabled:opacity-50"
            style={{ fontWeight: 600 }}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Redirecting to Stripe...
              </>
            ) : (
              "Set up Stripe Connect"
            )}
          </button>
          <p className="text-[11px] font-sans text-[#8AAABB] mt-4">
            You&apos;ll be redirected to Stripe&apos;s secure setup page and then back here.
          </p>
        </div>
      )}

      {/* Step 3: Welcome */}
      {currentStep === "welcome" && (
        <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-6 text-center">
          <div className="h-14 w-14 rounded-full bg-[#E8F4EE] flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-7 w-7 text-[#3D7A58]" />
          </div>
          <h2 className="text-[22px] font-serif text-[#1A2C38] mb-2">
            You&apos;re all <em className="italic text-[#7BAFC8]">set!</em>
          </h2>
          <p className="text-[14px] font-sans text-[#4A6070] mb-6 leading-relaxed">
            Your affiliate account is fully set up. Share your link and promo code — every paying
            subscriber you refer earns you 15% recurring for 12 months.
          </p>
          <Link
            href="/referrals"
            className="inline-block bg-[#1E3F52] text-white rounded-[10px] px-8 py-3 text-[14px] font-sans hover:bg-[#2a5269] transition-colors"
            style={{ fontWeight: 600 }}
          >
            Go to your affiliate dashboard →
          </Link>
        </div>
      )}
    </div>
  );
}

export default function AffiliateOnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-[#7BAFC8] animate-spin" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
