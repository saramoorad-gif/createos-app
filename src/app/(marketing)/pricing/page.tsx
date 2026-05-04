"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getSupabase } from "@/lib/supabase";

type Billing = "monthly" | "annual";

type PlanSlug = "free" | "ugc" | "ugc_influencer" | "agency_starter" | "agency_growth";

/* ─── Pricing Data ─── */

const creatorTiers: Array<{
  name: string;
  slug: PlanSlug;
  monthly: number;
  annual: number;
  description: string;
  features: string[];
  cta: string;
  featured: boolean;
}> = [
  {
    name: "Free",
    slug: "free",
    monthly: 0,
    annual: 0,
    description: "For creators just starting to monetize.",
    features: [
      "3 active deals",
      "Basic invoicing",
      "Inbound inquiry form",
      "Public media kit",
      "Community support",
    ],
    cta: "Start free",
    featured: false,
  },
  {
    name: "UGC Creator",
    slug: "ugc",
    monthly: 27,
    annual: 270,
    description: "For UGC creators running a real business.",
    features: [
      "Unlimited deal pipeline",
      "Contract review",
      "Gmail deal scanner",
      "Rate calculator",
      "Media kit builder",
      "Brand Radar",
      "Content calendar",
      "Email support",
    ],
    cta: "Get started",
    featured: false,
  },
  {
    name: "UGC + Influencer",
    slug: "ugc_influencer",
    monthly: 39,
    annual: 390,
    description: "Everything UGC Creator has, plus audience analytics and exclusivity.",
    features: [
      "Everything in UGC Creator",
      "Exclusivity manager",
      "Audience analytics",
      "Revenue forecast",
      "Campaign recaps",
      "Tax-ready income export",
      "Sponsor tolerance tracker",
    ],
    cta: "Start 14-day trial",
    featured: true,
  },
];

const agencyTiers: Array<{
  name: string;
  slug: PlanSlug;
  monthly: number;
  annual: number;
  description: string;
  creators: string;
  features: string[];
  cta: string;
  featured: boolean;
}> = [
  {
    name: "Agency Starter",
    slug: "agency_starter",
    monthly: 149,
    annual: 1490,
    description: "Roster management, campaign builder, and commission tracking.",
    creators: "Up to 15 creators",
    features: [
      "Roster dashboard",
      "Campaign builder",
      "Commission tracking",
      "Conflict detection",
      "Brand reports (saved + PDF export)",
      "Internal messaging",
      "Contract templates",
      "Dedicated onboarding",
    ],
    cta: "Start agency plan",
    featured: false,
  },
  {
    name: "Agency Growth",
    slug: "agency_growth",
    monthly: 249,
    annual: 2490,
    description: "Everything in Starter plus team permissions, custom reporting, and API.",
    creators: "Up to 40 creators",
    features: [
      "Everything in Starter",
      "Team permissions (RBAC)",
      "Custom reporting",
      "API access",
      "Priority support",
      "SSO / SAML",
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
  { feature: "Contract review", free: false, ugc: true, ugcInfluencer: true, agencyStarter: true, agencyGrowth: true },
  { feature: "Gmail deal scanner", free: false, ugc: true, ugcInfluencer: true, agencyStarter: true, agencyGrowth: true },
  { feature: "Rate calculator", free: false, ugc: true, ugcInfluencer: true, agencyStarter: false, agencyGrowth: false },
  { feature: "Brand Radar", free: false, ugc: true, ugcInfluencer: true, agencyStarter: false, agencyGrowth: false },
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
  { feature: "Brand reports (saved + PDF)", free: false, ugc: false, ugcInfluencer: false, agencyStarter: true, agencyGrowth: true },
  { feature: "Internal messaging", free: false, ugc: false, ugcInfluencer: false, agencyStarter: true, agencyGrowth: true },
  { feature: "Team permissions (RBAC)", free: false, ugc: false, ugcInfluencer: false, agencyStarter: false, agencyGrowth: true },
  { feature: "Scheduled custom reports", free: false, ugc: false, ugcInfluencer: false, agencyStarter: false, agencyGrowth: true },
  { feature: "API access", free: false, ugc: false, ugcInfluencer: false, agencyStarter: false, agencyGrowth: true },
  { feature: "SSO / SAML", free: false, ugc: false, ugcInfluencer: false, agencyStarter: false, agencyGrowth: true },
  { feature: "Priority support", free: false, ugc: false, ugcInfluencer: false, agencyStarter: false, agencyGrowth: true },
];

/* ─── FAQ ─── */

const faqs = [
  {
    q: "Can I try Create Suite before committing to a paid plan?",
    a: "Yes. The Free plan gives you access to 3 active deals, basic invoicing, and an inbound form with no time limit. You can upgrade whenever you are ready for unlimited deals and the full toolkit.",
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
    a: "Absolutely. If you start as a solo creator and grow into managing other creators, you can upgrade to an agency plan at any time. We prorate your remaining balance so you never pay twice.",
  },
  {
    q: "Is there a limit on how many deals I can track?",
    a: "Only on the Free plan, which allows up to 3 active deals. All paid plans include unlimited deals, so you can track as many brand partnerships as you want.",
  },
  {
    q: "How does contract review work?",
    a: "Upload any brand contract as a PDF or image and we review it for red flags, unfair terms, missing clauses, and vague language. You receive a plain-English summary with suggested counter-language you can copy and send to the brand.",
  },
  {
    q: "Can my team members access our agency account?",
    a: "Yes. The Agency Starter plan supports multiple team members with shared access. Agency Growth adds granular permissions so you can control who sees financial data, specific creators, or sensitive deals.",
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

/* ─── Cell renderer ─── */

function Cell({ value, highlight }: { value: CellValue; highlight?: boolean }) {
  const base = highlight ? "text-[#3D6E8A] font-semibold" : "text-[#4A6070]";
  if (value === true) return <span className={highlight ? "text-[#7BAFC8]" : "text-[#7BAFC8]"}>✓</span>;
  if (value === false) return <span className="text-[#D8E8EE]">—</span>;
  return <span className={`text-[12.5px] font-sans ${base}`}>{value}</span>;
}

/* ─── Page ─── */

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [downgrading, setDowngrading] = useState(false);
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();

  async function handleFreeClick(e: React.MouseEvent) {
    if (!user) return;
    e.preventDefault();

    if (profile?.account_type === "free") {
      router.push("/dashboard");
      return;
    }

    const hasActivePaid =
      profile?.subscription_status === "active" || profile?.subscription_status === "trialing";
    if (hasActivePaid) {
      const ok = window.confirm(
        "Switching to Free will cancel your paid subscription at the end of the current billing period. You'll keep your current features until then. Continue?"
      );
      if (!ok) return;
    }

    setDowngrading(true);
    try {
      const sb = getSupabase();
      const { data: { session } } = await sb.auth.getSession();
      if (!session?.access_token) {
        router.push("/login");
        return;
      }
      const res = await fetch("/api/account/downgrade-to-free", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Could not switch to Free. Please try again.");
        setDowngrading(false);
        return;
      }
      await refreshProfile();
      router.push("/dashboard");
    } catch (err) {
      console.error("Downgrade failed:", err);
      alert("Could not switch to Free. Please try again.");
      setDowngrading(false);
    }
  }

  function ctaHrefFor(slug: PlanSlug): string {
    if (!user) {
      if (slug === "free") return "/signup";
      return `/signup?plan=${slug}`;
    }
    if (slug === "free") return "/dashboard";
    if (profile?.account_type === slug && profile?.subscription_status === "active") {
      return "/dashboard";
    }
    const checkoutSlug = slug === "agency_starter" || slug === "agency_growth" ? "agency" : slug;
    return `/checkout?plan=${checkoutSlug}`;
  }

  function ctaLabelFor(slug: PlanSlug, defaultLabel: string): string {
    if (user && profile?.account_type === slug && profile?.subscription_status === "active") {
      return "Current plan";
    }
    if (user && slug === "free") return "Continue with free";
    return defaultLabel;
  }

  function price(monthly: number, annual: number) {
    return billing === "annual" ? Math.round(annual / 12) : monthly;
  }
  function priceSub(monthly: number) {
    if (monthly === 0) return "";
    return billing === "annual" ? "/mo billed annually" : "/mo";
  }

  return (
    <>
      {/* ══════════════════════ HERO ══════════════════════ */}
      <section className="relative overflow-hidden pt-20 pb-10">
        <div
          className="absolute inset-0 pointer-events-none opacity-70"
          style={{
            background: `
              radial-gradient(50% 70% at 20% 20%, color-mix(in oklab, #7BAFC8 14%, transparent), transparent 65%),
              radial-gradient(45% 60% at 80% 30%, color-mix(in oklab, #F0EAE0 70%, transparent), transparent 70%)
            `,
          }}
        />
        <div className="relative max-w-[1000px] mx-auto px-6 text-center">
          <div className="section-num justify-center mb-6" style={{ justifyContent: "center" as any }}>
            <span className="line" />
            <span>Pricing</span>
            <span className="line" />
          </div>
          <h1
            className="font-serif font-normal text-[52px] sm:text-[68px] lg:text-[88px] leading-[0.94] tracking-[-0.025em] text-[#0F1E28] m-0 max-w-[18ch] mx-auto"
            style={{ textWrap: "balance" as any }}
          >
            Priced for <em className="italic text-[#3D6E8A]">real</em> careers.
          </h1>
          <p className="text-[17px] leading-[1.5] text-[#4A6070] max-w-[52ch] mt-7 mx-auto">
            Start free for as long as you want. Upgrade the day your first deal closes. Every paid tier includes contract review, Gmail scanner, and the template library.
          </p>

          {/* Monthly / Annual toggle */}
          <div className="inline-flex items-center bg-white border border-[#D8E8EE] rounded-full p-1 mt-7">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-4 py-1.5 rounded-full text-[12px] font-sans font-medium transition-colors ${
                billing === "monthly" ? "bg-[#0F1E28] text-white" : "text-[#4A6070]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("annual")}
              className={`px-4 py-1.5 rounded-full text-[12px] font-sans font-medium transition-colors ${
                billing === "annual" ? "bg-[#0F1E28] text-white" : "text-[#4A6070]"
              }`}
            >
              Annual
              <span className="ml-2 text-[10px] text-[#3D7A58]">save 17%</span>
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════ CREATOR TIERS ══════════════════════ */}
      <section className="pt-4 pb-16 lg:pb-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <p className="eyebrow mb-4 text-center">For creators</p>

          <div className="pricing-tiers" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {creatorTiers.map((t) => {
              const label = ctaLabelFor(t.slug, t.cta);
              const href = ctaHrefFor(t.slug);
              const isFreeAction = t.slug === "free" && user;
              return (
                <div key={t.slug} className={`tier ${t.featured ? "featured" : ""}`}>
                  {t.featured && <span className="ribbon">Most picked</span>}
                  <div className="tname">{t.name}</div>
                  <div className="tprice">
                    <sup>$</sup>
                    {price(t.monthly, t.annual)}
                    {t.monthly > 0 && <sub>{priceSub(t.monthly)}</sub>}
                  </div>
                  <div className="tdesc">{t.description}</div>
                  <hr />
                  <ul>
                    {t.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <div className="tcta">
                    <Link
                      href={href}
                      onClick={isFreeAction ? handleFreeClick : undefined}
                      className={`inline-flex items-center justify-center w-full px-4 py-2.5 rounded-[6px] text-[13.5px] font-medium transition-colors ${
                        downgrading && t.slug === "free" ? "opacity-50 pointer-events-none" : ""
                      } ${
                        t.featured
                          ? "bg-white text-[#0F1E28] hover:bg-[#7BAFC8] hover:text-white"
                          : "bg-white text-[#1A2C38] border border-[#D8E8EE] hover:border-[#7BAFC8] hover:text-[#3D6E8A]"
                      }`}
                    >
                      {downgrading && t.slug === "free" ? "Switching…" : label}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════ AGENCY TIERS ══════════════════════ */}
      <section className="py-16 lg:py-24 bg-[#F4F1EA] border-y border-[#E3DED2]">
        <div className="max-w-[1000px] mx-auto px-6">
          <p className="eyebrow mb-4 text-center">For agencies</p>
          <h2 className="font-serif font-normal text-[32px] lg:text-[48px] leading-[0.98] tracking-[-0.02em] text-[#0F1E28] text-center m-0 mb-10 max-w-[22ch] mx-auto">
            Managing a roster of <em className="italic text-[#3D6E8A]">creators</em>?
          </h2>

          <div className="pricing-tiers" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
            {agencyTiers.map((t) => {
              const label = ctaLabelFor(t.slug, t.cta);
              const href = ctaHrefFor(t.slug);
              return (
                <div key={t.slug} className={`tier ${t.featured ? "featured" : ""}`}>
                  {t.featured && <span className="ribbon">Best value</span>}
                  <div className="tname">{t.name}</div>
                  <div className="tprice">
                    <sup>$</sup>
                    {price(t.monthly, t.annual)}
                    <sub>{priceSub(t.monthly)}</sub>
                  </div>
                  <div className="tdesc">
                    {t.creators}. {t.description}
                  </div>
                  <hr />
                  <ul>
                    {t.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <div className="tcta">
                    <Link
                      href={href}
                      className={`inline-flex items-center justify-center w-full px-4 py-2.5 rounded-[6px] text-[13.5px] font-medium transition-colors ${
                        t.featured
                          ? "bg-white text-[#0F1E28] hover:bg-[#7BAFC8] hover:text-white"
                          : "bg-white text-[#1A2C38] border border-[#D8E8EE] hover:border-[#7BAFC8] hover:text-[#3D6E8A]"
                      }`}
                    >
                      {label}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-[13px] text-[#8AAABB] mt-6">
            Managing 40+ creators?{" "}
            <a href="mailto:hello@createsuite.co" className="text-[#3D6E8A] hover:underline">
              Contact us for custom pricing →
            </a>
          </p>
        </div>
      </section>

      {/* ══════════════════════ COMPARISON MATRIX ══════════════════════ */}
      <section className="py-16 lg:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end mb-10 lg:mb-16">
            <div>
              <div className="section-num">
                <span className="line" />
                <span>Compare</span>
              </div>
              <h2 className="font-serif font-normal text-[42px] lg:text-[60px] leading-[0.98] tracking-[-0.02em] mt-4 text-[#0F1E28]">
                Every feature,
                <br />
                <em className="italic text-[#3D6E8A]">line by line</em>.
              </h2>
            </div>
            <div className="text-[16px] leading-[1.5] text-[#4A6070] max-w-[50ch] pb-1.5">
              A single honest table. No footnotes, no &ldquo;starting at&rdquo;, no hidden seats. What you see is what you pay.
            </div>
          </div>

          <div className="bg-white border border-[#D8E8EE] rounded-[14px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13.5px]" style={{ minWidth: 780 }}>
                <thead>
                  <tr className="bg-[#F4F1EA] border-b border-[#D8E8EE]">
                    <th className="text-left px-5 py-3.5 font-mono text-[11px] tracking-widest uppercase text-[#8AAABB] font-medium">
                      Feature
                    </th>
                    <th className="text-center px-3 py-3.5 font-serif text-[15px] tracking-[-0.01em] text-[#0F1E28]">Free</th>
                    <th className="text-center px-3 py-3.5 font-serif text-[15px] tracking-[-0.01em] text-[#0F1E28]">UGC</th>
                    <th
                      className="text-center px-3 py-3.5 font-serif text-[15px] tracking-[-0.01em] text-[#3D6E8A]"
                      style={{ background: "color-mix(in oklab, #7BAFC8 8%, transparent)" }}
                    >
                      <em className="italic">Influencer</em>
                    </th>
                    <th className="text-center px-3 py-3.5 font-serif text-[15px] tracking-[-0.01em] text-[#0F1E28]">Starter</th>
                    <th className="text-center px-3 py-3.5 font-serif text-[15px] tracking-[-0.01em] text-[#0F1E28]">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={i} className="border-t border-[#D8E8EE]">
                      <td className="px-5 py-3 text-[#1A2C38]">{row.feature}</td>
                      <td className="text-center px-3 py-3"><Cell value={row.free} /></td>
                      <td className="text-center px-3 py-3"><Cell value={row.ugc} /></td>
                      <td
                        className="text-center px-3 py-3"
                        style={{ background: "color-mix(in oklab, #7BAFC8 5%, transparent)" }}
                      >
                        <Cell value={row.ugcInfluencer} highlight />
                      </td>
                      <td className="text-center px-3 py-3"><Cell value={row.agencyStarter} /></td>
                      <td className="text-center px-3 py-3"><Cell value={row.agencyGrowth} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ FAQ ══════════════════════ */}
      <section className="py-16 lg:py-28 bg-[#F4F1EA] border-y border-[#E3DED2]">
        <div className="max-w-[820px] mx-auto px-6">
          <div className="text-center mb-12">
            <div className="section-num justify-center" style={{ justifyContent: "center" as any }}>
              <span className="line" />
              <span>Frequently asked</span>
              <span className="line" />
            </div>
            <h2 className="font-serif font-normal text-[36px] lg:text-[52px] leading-[0.98] tracking-[-0.02em] mt-4 text-[#0F1E28]">
              Before you <em className="italic text-[#3D6E8A]">sign up</em>.
            </h2>
          </div>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-[#D8E8EE] rounded-[10px] overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-[#FAF8F4]"
                >
                  <span className="text-[15px] font-medium text-[#0F1E28] font-sans">{faq.q}</span>
                  <span
                    className={`text-[#7BAFC8] text-lg flex-shrink-0 transition-transform ${
                      openFaq === i ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 -mt-1">
                    <p className="text-[14px] text-[#4A6070] leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ CTA BAND ══════════════════════ */}
      <section className="relative overflow-hidden py-20 lg:py-32" style={{ background: "#0F1E28", color: "white" }}>
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            background: `
              radial-gradient(50% 70% at 10% 100%, color-mix(in oklab, #7BAFC8 30%, transparent), transparent 60%),
              radial-gradient(50% 60% at 90% 0%, color-mix(in oklab, #3D6E8A 40%, transparent), transparent 60%)
            `,
          }}
        />
        <div className="relative max-w-[1200px] mx-auto px-6">
          <h2 className="font-serif font-normal text-[54px] lg:text-[96px] leading-[0.94] tracking-[-0.02em] m-0 mb-8 text-white max-w-[18ch]">
            Start free. Upgrade <em className="italic text-[#7BAFC8]">when you&apos;re ready</em>.
          </h2>
          <div className="flex gap-3 flex-wrap items-center">
            <Link
              href={user ? "/dashboard" : "/signup"}
              className="inline-flex items-center gap-2 bg-white text-[#0F1E28] px-5 py-3 rounded-[8px] text-[14px] font-medium hover:bg-[#7BAFC8] hover:text-white transition-colors"
            >
              {user ? "Go to dashboard" : "Start free →"}
            </Link>
            <Link
              href="/for-creators"
              className="inline-flex items-center gap-2 bg-transparent text-white border px-5 py-3 rounded-[8px] text-[14px] font-medium hover:bg-white/10 transition-colors"
              style={{ borderColor: "rgba(255,255,255,.3)" }}
            >
              For creators
            </Link>
            <Link
              href="/for-agencies"
              className="inline-flex items-center gap-2 bg-transparent text-white border px-5 py-3 rounded-[8px] text-[14px] font-medium hover:bg-white/10 transition-colors"
              style={{ borderColor: "rgba(255,255,255,.3)" }}
            >
              For agencies
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
