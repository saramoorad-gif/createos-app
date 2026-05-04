"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { needsCheckout } from "@/lib/feature-gates";
import { isAdmin } from "@/lib/admin";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface SubscriptionGateProps {
  children: React.ReactNode;
}

// Inner component that uses useSearchParams — wrapped in Suspense below
function SubscriptionGateInner({ children }: SubscriptionGateProps) {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const checkoutSuccess = searchParams.get("checkout") === "success";
  const [waitingForWebhook, setWaitingForWebhook] = useState(false);
  const [pollAttempts, setPollAttempts] = useState(0);

  // Admin users bypass all subscription checks
  const userIsAdmin = isAdmin(user?.email);

  // If user just completed checkout, poll for active subscription for up to 15 seconds
  useEffect(() => {
    if (!checkoutSuccess || !profile) return;
    if (profile.subscription_status === "active" || profile.subscription_status === "trialing") {
      setWaitingForWebhook(false);
      return;
    }
    if (pollAttempts >= 15) {
      setWaitingForWebhook(false);
      return;
    }
    setWaitingForWebhook(true);
    const timer = setTimeout(async () => {
      await refreshProfile();
      setPollAttempts(n => n + 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [checkoutSuccess, profile, pollAttempts, refreshProfile]);

  useEffect(() => {
    if (loading) return;
    if (!profile) return;
    if (waitingForWebhook) return;
    if (userIsAdmin) return; // Admin bypass

    if (needsCheckout(profile)) {
      if (!pathname.startsWith("/checkout") && !pathname.startsWith("/onboarding")) {
        const planKey = profile.account_type && profile.account_type !== "free"
          ? profile.account_type
          : "ugc";
        router.push(`/checkout?plan=${planKey}`);
      }
    }
  }, [loading, profile, pathname, router, waitingForWebhook]);

  if (waitingForWebhook) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="h-14 w-14 rounded-full bg-[#F2F8FB] border-[1.5px] border-[#D8E8EE] mx-auto mb-4 flex items-center justify-center">
            <RefreshCw className="h-6 w-6 text-[#7BAFC8] animate-spin" />
          </div>
          <h2 className="text-[22px] font-serif text-[#1A2C38] mb-2">Activating your account</h2>
          <p className="text-[14px] font-sans text-[#8AAABB]">
            Payment confirmed. Setting up your subscription...
          </p>
        </div>
      </div>
    );
  }

  const showPastDueWarning = profile?.subscription_status === "past_due";

  return (
    <>
      {showPastDueWarning && (
        <div className="bg-[#FFF8E8] border-b border-[#A07830]/20 px-6 py-3">
          <div className="max-w-[1200px] mx-auto flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-[#A07830] flex-shrink-0" />
            <p className="text-[12px] font-sans text-[#A07830] flex-1">
              Your subscription payment failed. Please update your payment method to avoid losing access.
            </p>
            <a
              href="/settings"
              className="text-[12px] font-sans text-[#A07830] hover:underline"
              style={{ fontWeight: 600 }}
            >
              Update payment →
            </a>
          </div>
        </div>
      )}
      {children}
    </>
  );
}

// Wrapper with Suspense boundary (required by useSearchParams)
export function SubscriptionGate({ children }: SubscriptionGateProps) {
  return (
    <Suspense fallback={<>{children}</>}>
      <SubscriptionGateInner>{children}</SubscriptionGateInner>
    </Suspense>
  );
}
