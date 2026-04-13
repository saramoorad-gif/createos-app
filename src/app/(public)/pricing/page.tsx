"use client";

import { useState } from "react";
import Link from "next/link";

type Billing = "monthly" | "annual";

const tiers = [
  {
    name: "Free",
    monthly: 0,
    description: "3 deals, no AI features",
    badge: null,
    features: ["3 active deals", "Basic invoicing", "Inbound form"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "UGC Creator",
    monthly: 27,
    description: "Full deal pipeline, invoices, AI contract analysis, rate calculator, brand radar, media kit",
    badge: null,
    features: ["Unlimited deals", "AI contract analysis", "Rate calculator", "Brand radar", "Media kit builder", "Invoice tracking"],
    cta: "Get started",
    highlight: false,
  },
  {
    name: "UGC + Influencer",
    monthly: 39,
    description: "Everything in UGC + audience analytics, engagement tracking, sponsored post performance, campaign recaps",
    badge: "Recommended",
    features: ["Everything in UGC Creator", "Audience analytics", "Engagement tracking", "Sponsored post performance", "Campaign recaps", "Exclusivity manager"],
    cta: "Get started",
    highlight: true,
  },
  {
    name: "Agency — Starter",
    monthly: 149,
    description: "Up to 15 creators, roster dashboard, commission tracking, conflict manager, campaign builder, brand reports",
    badge: "Agency",
    features: ["Up to 15 creators", "Roster dashboard", "Commission tracking", "Conflict manager", "Campaign builder", "Brand reports"],
    cta: "Start agency plan",
    highlight: false,
  },
  {
    name: "Agency — Growth",
    monthly: 249,
    description: "Up to 40 creators, everything in Starter",
    badge: "Agency",
    features: ["Up to 40 creators", "Everything in Starter", "Priority support", "Custom reporting", "API access"],
    cta: "Start growth plan",
    highlight: false,
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>("monthly");

  function getPrice(monthly: number) {
    if (monthly === 0) return "$0";
    return billing === "annual"
      ? `$${monthly * 10}`
      : `$${monthly}`;
  }

  function getPeriod(monthly: number) {
    if (monthly === 0) return "";
    return billing === "annual" ? "/yr" : "/mo";
  }

  return (
    <div className="min-h-screen bg-[#F7F4EF] px-4 py-16">
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/login">
            <h1 className="text-[28px] font-serif text-[#1C1714] mb-2">
              create<em className="italic text-[#C4714A]">OS</em>
            </h1>
          </Link>
          <h2 className="text-[36px] font-serif text-[#1C1714] mt-6">
            Simple, transparent <em className="italic text-[#C4714A]">pricing</em>
          </h2>
          <p className="text-[14px] font-sans text-[#9A9088] mt-2 max-w-md mx-auto">
            Whether you&apos;re a solo creator or managing a roster, there&apos;s a plan for you.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={`text-[13px] font-sans font-500 ${billing === "monthly" ? "text-[#1C1714]" : "text-[#9A9088]"}`}>
              Monthly
            </span>
            <button
              onClick={() => setBilling(billing === "monthly" ? "annual" : "monthly")}
              className="relative w-12 h-6 rounded-full bg-[#E5E0D8] transition-colors"
            >
              <div
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-[#C4714A] transition-transform ${
                  billing === "annual" ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
            <span className={`text-[13px] font-sans font-500 ${billing === "annual" ? "text-[#1C1714]" : "text-[#9A9088]"}`}>
              Annual
            </span>
            {billing === "annual" && (
              <span className="text-[11px] font-sans font-500 text-[#4A9060] bg-[#EBF5EB] rounded-full px-2 py-0.5">
                2 months free
              </span>
            )}
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`bg-white border rounded-[10px] p-5 flex flex-col ${
                tier.highlight
                  ? "border-[#C4714A] ring-1 ring-[#C4714A]/20"
                  : "border-[#E5E0D8]"
              }`}
            >
              {/* Badge */}
              <div className="h-5 mb-3">
                {tier.badge === "Recommended" && (
                  <span className="text-[10px] font-sans font-600 uppercase tracking-[1.5px] text-[#C4714A] bg-[#FBF0EA] rounded-full px-2 py-0.5">
                    Recommended
                  </span>
                )}
                {tier.badge === "Agency" && (
                  <span className="text-[10px] font-sans font-600 uppercase tracking-[1.5px] text-[#1C1714] bg-[#F2EEE8] rounded-full px-2 py-0.5">
                    Agency
                  </span>
                )}
              </div>

              <h3 className="text-[15px] font-sans font-600 text-[#1C1714]">{tier.name}</h3>

              <div className="mt-2 mb-3">
                <span className="text-[28px] font-serif text-[#1C1714]">
                  {getPrice(tier.monthly)}
                </span>
                <span className="text-[13px] font-sans text-[#9A9088]">
                  {getPeriod(tier.monthly)}
                </span>
              </div>

              <p className="text-[12px] font-sans text-[#9A9088] leading-relaxed mb-4">
                {tier.description}
              </p>

              <div className="flex-1 space-y-2 mb-5">
                {tier.features.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <span className="text-[#4A9060] text-xs mt-0.5">&#10003;</span>
                    <span className="text-[12px] font-sans text-[#1C1714]">{f}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/signup"
                className={`block text-center rounded-[10px] px-4 py-2.5 text-[13px] font-sans font-500 transition-colors ${
                  tier.highlight
                    ? "bg-[#C4714A] text-white hover:bg-[#B05C38]"
                    : "border border-[#E5E0D8] text-[#1C1714] hover:bg-[#F7F4EF]"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
