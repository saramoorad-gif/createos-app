"use client";

import { useState } from "react";
import Link from "next/link";

type Billing = "monthly" | "annual";

/* ─── Pricing Data ─── */

const creatorTiers = [
  {
    name: "Free",
    monthly: 0,
    annual: 0,
    description: "Get started with the basics. Perfect for creators just starting out with brand deals.",
    features: [
      { name: "3 active deals", included: true },
      { name: "Basic invoicing", included: true },
      { name: "Inbound form", included: true },
      { name: "AI contract analysis", included: false },
      { name: "Rate calculator", included: false },
      { name: "Brand radar", included: false },
      { name: "Media kit builder", included: false },
      { name: "Deliverable tracking", included: false },
      { name: "Exclusivity manager", included: false },
      { name: "Audience analytics", included: false },
      { name: "Campaign recaps", included: false },
      { name: "Creator health score", included: false },
    ],
    cta: "Start free",
    featured: false,
  },
  {
    name: "UGC Creator",
    monthly: 27,
    annual: 270,
    description: "Full deal pipeline with AI tools. Everything you need to run your UGC business professionally.",
    features: [
      { name: "Unlimited deals", included: true },
      { name: "Full invoicing + reminders", included: true },
      { name: "Inbound form", included: true },
      { name: "AI contract analysis", included: true },
      { name: "Rate calculator", included: true },
      { name: "Brand radar", included: true },
      { name: "Media kit builder", included: true },
      { name: "Deliverable tracking", included: true },
      { name: "Exclusivity manager", included: false },
      { name: "Audience analytics", included: false },
      { name: "Campaign recaps", included: false },
      { name: "Creator health score", included: true },
    ],
    cta: "Get started",
    featured: false,
  },
  {
    name: "UGC + Influencer",
    monthly: 39,
    annual: 390,
    description: "Everything in UGC Creator plus audience analytics, engagement tracking, and campaign recaps.",
    features: [
      { name: "Unlimited deals", included: true },
      { name: "Full invoicing + reminders", included: true },
      { name: "Inbound form", included: true },
      { name: "AI contract analysis", included: true },
      { name: "Rate calculator", included: true },
      { name: "Brand radar", included: true },
      { name: "Media kit builder", included: true },
      { name: "Deliverable tracking", included: true },
      { name: "Exclusivity manager", included: true },
      { name: "Audience analytics", included: true },
      { name: "Campaign recaps", included: true },
      { name: "Creator health score", included: true },
    ],
    cta: "Get started",
    featured: true,
  },
];

const agencyTiers = [
  {
    name: "Agency Starter",
    monthly: 149,
    annual: 1490,
    description: "Up to 15 creators. Full roster management, campaign builder, and commission tracking.",
    creators: "Up to 15 creators",
    features: [
      { name: "Roster dashboard", included: true },
      { name: "Campaign builder", included: true },
      { name: "Commission tracking", included: true },
      { name: "Conflict detection", included: true },
      { name: "Brand reports", included: true },
      { name: "Internal messaging", included: true },
      { name: "Contract templates", included: true },
      { name: "E-Signature", included: true },
      { name: "AI contract analysis", included: true },
      { name: "Team permissions", included: false },
      { name: "Custom reporting", included: false },
      { name: "API access", included: false },
      { name: "Priority support", included: false },
    ],
    cta: "Start agency plan",
    featured: false,
  },
  {
    name: "Agency Growth",
    monthly: 249,
    annual: 2490,
    description: "Up to 40 creators. Everything in Starter plus team permissions, custom reporting, and API access.",
    creators: "Up to 40 creators",
    features: [
      { name: "Roster dashboard", included: true },
      { name: "Campaign builder", included: true },
      { name: "Commission tracking", included: true },
      { name: "Conflict detection", included: true },
      { name: "Brand reports", included: true },
      { name: "Internal messaging", included: true },
      { name: "Contract templates", included: true },
      { name: "E-Signature", included: true },
      { name: "AI contract analysis", included: true },
      { name: "Team permissions", included: true },
      { name: "Custom reporting", included: true },
      { name: "API access", included: true },
      { name: "Priority support", included: true },
    ],
    cta: "Start growth plan",
    featured: true,
  },
];

/* ─── Comparison Matrix ─── */

type CellValue = true | false | "Partial" | string;

interface ComparisonRow {
  feature: string;
  free: CellValue;
  ugc: CellValue;
  ugcInfluencer: CellValue;
  agencyStarter: CellValue;
  agencyGrowth: CellValue;
}

const comparisonRows: ComparisonRow[] = [
  { feature: "Active deals", free: "3", ugc: "Unlimited", ugcInfluencer: "Unlimited", agencyStarter: "Unlimited", agencyGrowth: "Unlimited" },
  { feature: "Deal pipeline (Kanban)", free: true, ugc: true, ugcInfluencer: true, agencyStarter: true, agencyGrowth: true },
  { feature: "Invoicing", free: "Partial", ugc: true, ugcInfluencer: true, agencyStarter: true, agencyGrowth: true },
  { feature: "Automatic payment reminders", free: false, ugc: true, ugcInfluencer: true, agencyStarter: true, agencyGrowth: true },
  { feature: "Inbound form", free: true, ugc: true, ugcInfluencer: true, agencyStarter: true, agencyGrowth: true },
  { feature: "AI contract analysis", free: false, ugc: true, ugcInfluencer: true, agencyStarter: true, agencyGrowth: true },
  { feature: "Rate calculator", free: false, ugc: true, ugcInfluencer: true, agencyStarter: false, agencyGrowth: false },
  { feature: "Brand radar", free: false, ugc: true, ugcInfluencer: true, agencyStarter: false, agencyGrowth: false },
  { feature: "Media kit builder", free: false, ugc: true, ugcInfluencer: true, agencyStarter: false, agencyGrowth: false },
  { feature: "Deliverable tracking", free: false, ugc: true, ugcInfluencer: true, agencyStarter: true, agencyGrowth: true },
  { feature: "Creator health score", free: false, ugc: true, ugcInfluencer: true, agencyStarter: true, agencyGrowth: true },
  { feature: "Exclusivity manager", free: false, ugc: false, ugcInfluencer: true, agencyStarter: true, agencyGrowth: true },
  { feature: "Audience analytics", free: false, ugc: false, ugcInfluencer: true, agencyStarter: false, agencyGrowth: false },
  { feature: "Campaign recaps", free: false, ugc: false, ugcInfluencer: true, agencyStarter: true, agencyGrowth: true },
  { feature: "Roster dashboard", free: false, ugc: false, ugcInfluencer: false, agencyStarter: true, agencyGrowth: true },
  { feature: "Campaign builder", free: false, ugc: false, ugcInfluencer: false, agencyStarter: true, agencyGrowth: true },
  { feature: "Commission tracking", free: false, ugc: false, ugcInfluencer: false, agencyStarter: true, agencyGrowth: true },
  { feature: "Conflict detection", free: false, ugc: false, ugcInfluencer: false, agencyStarter: true, agencyGrowth: true },
  { feature: "Contract templates", free: false, ugc: false, ugcInfluencer: false, agencyStarter: true, agencyGrowth: true },
  { feature: "E-Signature", free: false, ugc: false, ugcInfluencer: false, agencyStarter: true, agencyGrowth: true },
  { feature: "Internal messaging", free: false, ugc: false, ugcInfluencer: false, agencyStarter: true, agencyGrowth: true },
  { feature: "Brand reports", free: false, ugc: false, ugcInfluencer: false, agencyStarter: true, agencyGrowth: true },
  { feature: "Team permissions", free: false, ugc: false, ugcInfluencer: false, agencyStarter: false, agencyGrowth: true },
  { feature: "Custom reporting", free: false, ugc: false, ugcInfluencer: false, agencyStarter: false, agencyGrowth: true },
  { feature: "API access", free: false, ugc: false, ugcInfluencer: false, agencyStarter: false, agencyGrowth: true },
  { feature: "Priority support", free: false, ugc: false, ugcInfluencer: false, agencyStarter: false, agencyGrowth: true },
];

/* ─── FAQ ─── */

const faqs = [
  {
    q: "Can I try Create Suite before committing to a paid plan?",
    a: "Yes. The Free plan gives you access to 3 active deals, basic invoicing, and an inbound form with no time limit. You can upgrade whenever you are ready for unlimited deals and AI-powered features.",
  },
  {
    q: "What happens to my data if I downgrade or cancel?",
    a: "Your data is never deleted. If you downgrade, you keep read-only access to everything you created on your paid plan. You can export all your data at any time from the Settings page.",
  },
  {
    q: "How does annual billing work?",
    a: "Annual plans are billed once per year at the price shown and save you the equivalent of two months compared to paying monthly. You can switch between monthly and annual billing at any time from your account settings.",
  },
  {
    q: "Can I switch between creator and agency plans?",
    a: "Absolutely. If you start as a solo creator and grow into managing other creators, you can upgrade to an agency plan at any time. We will prorate your remaining balance so you never pay twice.",
  },
  {
    q: "Is there a limit on how many deals I can track?",
    a: "Only on the Free plan, which allows up to 3 active deals. All paid plans include unlimited deals, so you can track as many brand partnerships as you want.",
  },
  {
    q: "Do agency plans include creator features like the rate calculator?",
    a: "Agency plans are built for managing a roster and include features like commission tracking, conflict detection, and campaign builder. Individual creator tools like the rate calculator and brand radar are included in creator plans. If you need both, contact us about a bundled arrangement.",
  },
  {
    q: "How does the AI contract analysis work?",
    a: "Upload any brand contract as a PDF or image and our AI reviews it for red flags, unfair terms, missing clauses, and vague language. You receive a plain-English summary with suggested counter-language you can copy and send to the brand.",
  },
  {
    q: "Can my team members access our agency account?",
    a: "Yes. The Agency Starter plan supports multiple team members with shared access. The Agency Growth plan adds granular team permissions so you can control who sees financial data, specific creators, or sensitive deals.",
  },
  {
    q: "Do you offer discounts for larger agencies?",
    a: "If you manage more than 40 creators or need a custom setup, reach out to us at hello@createsuite.co. We offer custom pricing for larger teams with dedicated onboarding and support.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards through Stripe. For annual agency plans, we can also arrange invoice-based payment. All transactions are processed securely and you can update your payment method at any time.",
  },
];

/* ─── Cell Renderer ─── */

function CellDisplay({ value }: { value: CellValue }) {
  if (value === true) {
    return <span className="text-[#3D6E8A] font-500">&#10003;</span>;
  }
  if (value === false) {
    return <span className="text-[#D8E8EE]">&mdash;</span>;
  }
  return (
    <span className="text-[12px] font-sans font-500 text-[#4A6070]">
      {value}
    </span>
  );
}

/* ─── Page ─── */

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function price(monthly: number, annual: number) {
    return billing === "annual" ? annual : monthly;
  }

  function priceLabel(monthly: number, annual: number) {
    if (monthly === 0) return "$0";
    return `$${price(monthly, annual)}`;
  }

  function period(monthly: number) {
    if (monthly === 0) return "";
    return billing === "annual" ? "/yr" : "/mo";
  }

  function strikethrough(monthly: number) {
    if (monthly === 0 || billing === "monthly") return null;
    return `$${monthly * 12}`;
  }

  return (
    <div>
      {/* Hero */}
      <section className="pt-20 pb-12 px-6">
        <div className="max-w-[900px] mx-auto text-center">
          <p className="text-[12px] font-sans font-600 uppercase tracking-[3px] text-[#7BAFC8] mb-3">
            PRICING
          </p>
          <h1 className="text-[48px] md:text-[56px] font-serif font-normal leading-[1.1] text-[#1A2C38] mb-4">
            Simple, transparent{" "}
            <em className="italic text-[#3D6E8A]">pricing</em>
          </h1>
          <p className="text-[17px] font-sans text-[#4A6070] max-w-[520px] mx-auto leading-relaxed">
            Start free. Upgrade when you&apos;re ready. No hidden fees, no
            surprises.
          </p>
        </div>
      </section>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3 mb-12">
        <span
          className={`text-[14px] font-sans font-500 ${
            billing === "monthly" ? "text-[#1A2C38]" : "text-[#8AAABB]"
          }`}
        >
          Monthly
        </span>
        <button
          onClick={() =>
            setBilling(billing === "monthly" ? "annual" : "monthly")
          }
          className="relative w-12 h-6 rounded-full bg-[#D8E8EE] transition-colors"
        >
          <div
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-[#3D6E8A] transition-transform ${
              billing === "annual" ? "translate-x-6" : "translate-x-0.5"
            }`}
          />
        </button>
        <span
          className={`text-[14px] font-sans font-500 ${
            billing === "annual" ? "text-[#1A2C38]" : "text-[#8AAABB]"
          }`}
        >
          Annual
        </span>
        {billing === "annual" && (
          <span className="text-[11px] font-sans font-600 text-[#3D6E8A] bg-[#F2F8FB] rounded-full px-2.5 py-1">
            Save 2 months
          </span>
        )}
      </div>

      {/* ═══ CREATOR PRICING ═══ */}
      <section className="px-6 pb-16">
        <div className="max-w-[1000px] mx-auto">
          <p className="text-[12px] font-sans font-600 uppercase tracking-[3px] text-[#7BAFC8] mb-6 text-center">
            FOR CREATORS
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {creatorTiers.map((tier) => (
              <div
                key={tier.name}
                className={`bg-white rounded-[10px] p-6 flex flex-col ${
                  tier.featured
                    ? "border-2 border-[#3D6E8A] shadow-[0_8px_30px_rgba(61,110,138,.12)]"
                    : "border border-[#D8E8EE]"
                }`}
              >
                {tier.featured && (
                  <span className="text-[10px] font-sans font-600 uppercase tracking-[1.5px] text-[#3D6E8A] bg-[#F2F8FB] rounded-full px-2.5 py-1 self-start mb-3">
                    Recommended
                  </span>
                )}
                <h3 className="text-[17px] font-sans font-600 text-[#1A2C38]">
                  {tier.name}
                </h3>
                <div className="mt-2 mb-1 flex items-baseline gap-2">
                  <span className="text-[36px] font-serif text-[#1A2C38]">
                    {priceLabel(tier.monthly, tier.annual)}
                  </span>
                  <span className="text-[14px] font-sans text-[#8AAABB]">
                    {period(tier.monthly)}
                  </span>
                  {strikethrough(tier.monthly) && (
                    <span className="text-[14px] font-sans text-[#8AAABB] line-through">
                      {strikethrough(tier.monthly)}/yr
                    </span>
                  )}
                </div>
                <p className="text-[13px] font-sans text-[#4A6070] leading-relaxed mb-5">
                  {tier.description}
                </p>

                <div className="flex-1 space-y-2.5 mb-6">
                  {tier.features.map((f) => (
                    <div key={f.name} className="flex items-start gap-2.5">
                      {f.included ? (
                        <span className="text-[#3D6E8A] text-sm mt-0.5 flex-shrink-0">
                          &#10003;
                        </span>
                      ) : (
                        <span className="text-[#D8E8EE] text-sm mt-0.5 flex-shrink-0">
                          &mdash;
                        </span>
                      )}
                      <span
                        className={`text-[13px] font-sans ${
                          f.included ? "text-[#1A2C38]" : "text-[#8AAABB]"
                        }`}
                      >
                        {f.name}
                      </span>
                    </div>
                  ))}
                </div>

                <a
                  href="https://app.createsuite.co/signup"
                  className={`block text-center rounded-[10px] px-4 py-3 text-[14px] font-sans font-500 transition-colors ${
                    tier.featured
                      ? "bg-[#1E3F52] text-white hover:bg-[#2a5269]"
                      : "border border-[#D8E8EE] text-[#3D6E8A] hover:bg-[#F2F8FB]"
                  }`}
                >
                  {tier.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ AGENCY PRICING ═══ */}
      <section className="px-6 pb-16 pt-4">
        <div className="max-w-[700px] mx-auto">
          <p className="text-[12px] font-sans font-600 uppercase tracking-[3px] text-[#7BAFC8] mb-6 text-center">
            FOR AGENCIES
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {agencyTiers.map((tier) => (
              <div
                key={tier.name}
                className={`bg-white rounded-[10px] p-6 flex flex-col ${
                  tier.featured
                    ? "border-2 border-[#3D6E8A] shadow-[0_8px_30px_rgba(61,110,138,.12)]"
                    : "border border-[#D8E8EE]"
                }`}
              >
                {tier.featured && (
                  <span className="text-[10px] font-sans font-600 uppercase tracking-[1.5px] text-[#3D6E8A] bg-[#F2F8FB] rounded-full px-2.5 py-1 self-start mb-3">
                    Most Popular
                  </span>
                )}
                <h3 className="text-[17px] font-sans font-600 text-[#1A2C38]">
                  {tier.name}
                </h3>
                <p className="text-[12px] font-sans text-[#7BAFC8] font-500 mt-1">
                  {tier.creators}
                </p>
                <div className="mt-2 mb-1 flex items-baseline gap-2">
                  <span className="text-[36px] font-serif text-[#1A2C38]">
                    {priceLabel(tier.monthly, tier.annual)}
                  </span>
                  <span className="text-[14px] font-sans text-[#8AAABB]">
                    {period(tier.monthly)}
                  </span>
                  {strikethrough(tier.monthly) && (
                    <span className="text-[14px] font-sans text-[#8AAABB] line-through">
                      {strikethrough(tier.monthly)}/yr
                    </span>
                  )}
                </div>
                <p className="text-[13px] font-sans text-[#4A6070] leading-relaxed mb-5">
                  {tier.description}
                </p>

                <div className="flex-1 space-y-2.5 mb-6">
                  {tier.features.map((f) => (
                    <div key={f.name} className="flex items-start gap-2.5">
                      {f.included ? (
                        <span className="text-[#3D6E8A] text-sm mt-0.5 flex-shrink-0">
                          &#10003;
                        </span>
                      ) : (
                        <span className="text-[#D8E8EE] text-sm mt-0.5 flex-shrink-0">
                          &mdash;
                        </span>
                      )}
                      <span
                        className={`text-[13px] font-sans ${
                          f.included ? "text-[#1A2C38]" : "text-[#8AAABB]"
                        }`}
                      >
                        {f.name}
                      </span>
                    </div>
                  ))}
                </div>

                <a
                  href="https://app.createsuite.co/signup"
                  className={`block text-center rounded-[10px] px-4 py-3 text-[14px] font-sans font-500 transition-colors ${
                    tier.featured
                      ? "bg-[#1E3F52] text-white hover:bg-[#2a5269]"
                      : "border border-[#D8E8EE] text-[#3D6E8A] hover:bg-[#F2F8FB]"
                  }`}
                >
                  {tier.cta}
                </a>
              </div>
            ))}
          </div>
          <p className="text-center text-[13px] font-sans text-[#8AAABB] mt-4">
            Managing 40+ creators?{" "}
            <a
              href="mailto:hello@createsuite.co"
              className="text-[#3D6E8A] hover:underline"
            >
              Contact us for custom pricing
            </a>
          </p>
        </div>
      </section>

      {/* ═══ COMPARISON MATRIX ═══ */}
      <section className="py-16 px-6 bg-[#F2F8FB]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-10">
            <p className="text-[12px] font-sans font-600 uppercase tracking-[3px] text-[#7BAFC8] mb-3">
              COMPARE PLANS
            </p>
            <h2 className="text-[36px] font-serif text-[#1A2C38]">
              Full feature <em className="italic text-[#3D6E8A]">comparison</em>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-[#D8E8EE]">
                  <th className="text-left py-3 pr-4 text-[13px] font-sans font-600 text-[#1A2C38] w-[200px]">
                    Feature
                  </th>
                  <th className="text-center py-3 px-3 text-[12px] font-sans font-600 text-[#4A6070]">
                    Free
                  </th>
                  <th className="text-center py-3 px-3 text-[12px] font-sans font-600 text-[#4A6070]">
                    UGC
                  </th>
                  <th className="text-center py-3 px-3 text-[12px] font-sans font-600 text-[#3D6E8A]">
                    UGC + Influencer
                  </th>
                  <th className="text-center py-3 px-3 text-[12px] font-sans font-600 text-[#4A6070]">
                    Agency Starter
                  </th>
                  <th className="text-center py-3 px-3 text-[12px] font-sans font-600 text-[#4A6070]">
                    Agency Growth
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-[#D8E8EE] ${
                      i % 2 === 0 ? "bg-white" : "bg-[#F2F8FB]"
                    }`}
                  >
                    <td className="py-3 pr-4 text-[13px] font-sans text-[#1A2C38]">
                      {row.feature}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <CellDisplay value={row.free} />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <CellDisplay value={row.ugc} />
                    </td>
                    <td className="py-3 px-3 text-center bg-[#F2F8FB]/50">
                      <CellDisplay value={row.ugcInfluencer} />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <CellDisplay value={row.agencyStarter} />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <CellDisplay value={row.agencyGrowth} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-20 px-6">
        <div className="max-w-[700px] mx-auto">
          <div className="text-center mb-10">
            <p className="text-[12px] font-sans font-600 uppercase tracking-[3px] text-[#7BAFC8] mb-3">
              FAQ
            </p>
            <h2 className="text-[36px] font-serif text-[#1A2C38]">
              Common <em className="italic text-[#3D6E8A]">questions</em>
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white border border-[#D8E8EE] rounded-[10px] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-[14px] font-sans font-600 text-[#1A2C38] pr-4">
                    {faq.q}
                  </span>
                  <span
                    className={`text-[#7BAFC8] text-lg flex-shrink-0 transition-transform ${
                      openFaq === i ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-[13px] font-sans text-[#4A6070] leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-[#F0EAE0]">
        <div className="max-w-[600px] mx-auto text-center">
          <h2 className="text-[36px] font-serif text-[#1A2C38] mb-3">
            Ready to get <em className="italic text-[#3D6E8A]">started</em>?
          </h2>
          <p className="text-[15px] font-sans text-[#4A6070] mb-8">
            Join 2,400+ creators and 180+ agencies already using Create Suite.
          </p>
          <div className="flex items-center justify-center gap-3">
            <a
              href="https://app.createsuite.co/signup"
              className="bg-[#1E3F52] text-white text-[15px] font-sans font-500 px-7 py-3.5 rounded-[10px] hover:bg-[#2a5269] transition-colors"
            >
              Get started free
            </a>
            <Link
              href="/contact"
              className="border border-[#DDD6C8] text-[#3D6E8A] text-[15px] font-sans font-500 px-7 py-3.5 rounded-[10px] hover:bg-white transition-colors"
            >
              Contact sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
