"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { needsCheckout } from "@/lib/feature-gates";
import { AlertTriangle } from "lucide-react";

interface SubscriptionGateProps {
  children: React.ReactNode;
}

export function SubscriptionGate({ children }: SubscriptionGateProps) {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!profile) return;

    // Paid tier without active subscription → redirect to checkout
    if (needsCheckout(profile)) {
      // Only redirect if we're not already on checkout/onboarding
      if (!pathname.startsWith("/checkout") && !pathname.startsWith("/onboarding")) {
        router.push(`/checkout?plan=${profile.account_type}`);
      }
    }
  }, [loading, profile, pathname, router]);

  // If past_due, show warning banner but allow access
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
