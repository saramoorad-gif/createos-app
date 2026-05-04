"use client";

import { useAuth } from "@/contexts/auth-context";
import { hasFeatureAccess, getUpgradeMessage, getUpgradeTargetFor } from "@/lib/feature-gates";
import { Lock, Sparkles } from "lucide-react";
import Link from "next/link";

interface UpgradeGateProps {
  feature: string;
  children: React.ReactNode;
}

export function UpgradeGate({ feature, children }: UpgradeGateProps) {
  const { profile } = useAuth();

  if (hasFeatureAccess(profile?.account_type, feature)) {
    return <>{children}</>;
  }

  const message = getUpgradeMessage(feature);
  const target = getUpgradeTargetFor(feature);
  const isInfluencerFeature = target.tier === "ugc_influencer";

  // Feature list shown in the comparison box — tailored to the tier the
  // user needs so the pitch matches what they're about to buy.
  const features = isInfluencerFeature
    ? [
        "Audience demographics & analytics",
        "Revenue forecasting & projections",
        "Tax-ready income export",
        "Exclusivity manager",
        "Everything in UGC Creator",
      ]
    : [
        "Unlimited deal pipeline",
        "AI contract review & deal scanner",
        "Rate calculator & media kit builder",
        "Content calendar & task management",
        "Gmail & Google Calendar integrations",
        "Brand Radar — AI brand matching",
      ];

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md text-center px-6">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#F2F8FB] to-[#D8E8EE] border-[1.5px] border-[#D8E8EE] mx-auto mb-5 flex items-center justify-center">
          <Lock className="h-7 w-7 text-[#7BAFC8]" />
        </div>
        <h2 className="text-[24px] font-serif text-[#1A2C38] mb-3">
          Upgrade to <em className="italic text-[#7BAFC8]">{target.tierName}</em>
        </h2>
        <p className="text-[14px] font-sans text-[#4A6070] leading-relaxed mb-6">
          {message}
        </p>
        <div className="space-y-3">
          <Link
            href={`/checkout?plan=${target.planSlug}`}
            className="inline-flex items-center gap-2 bg-[#1E3F52] text-white rounded-[8px] px-6 py-3 text-[14px] font-sans hover:bg-[#2a5269] transition-colors"
            style={{ fontWeight: 600 }}
          >
            <Sparkles className="h-4 w-4" /> Upgrade to {target.tierName} — {target.price}
          </Link>
          <p className="text-[12px] font-sans text-[#8AAABB]">
            <Link href="/pricing" className="hover:underline">Compare all plans →</Link>
          </p>
        </div>

        {/* Feature comparison */}
        <div className="mt-8 bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5 text-left">
          <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-3" style={{ fontWeight: 600 }}>WHAT YOU GET</p>
          <div className="space-y-2.5">
            {features.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-[#E8F4EE] flex items-center justify-center flex-shrink-0">
                  <svg className="h-2.5 w-2.5 text-[#3D7A58]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="text-[13px] font-sans text-[#1A2C38]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
