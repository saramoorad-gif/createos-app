"use client";

import Link from "next/link";
import { useState } from "react";

/* ─── Pain points ─── */
const painPoints = [
  {
    emoji: "📱",
    title: "You're running a business from your Notes app",
    desc: "Deals scattered across DMs, emails, and spreadsheets. You forget follow-ups, miss deadlines, and lose track of who owes you money.",
  },
  {
    emoji: "📄",
    title: "You're signing contracts you don't fully understand",
    desc: "Usage rights, exclusivity windows, kill fees — buried in 12 pages of legalese. One bad clause can cost you thousands.",
  },
  {
    emoji: "💸",
    title: "You have no idea if you're charging enough",
    desc: "Brands lowball because they know you're guessing. Without benchmarks, you leave money on the table on every single deal.",
  },
];

/* ─── Steps ─── */
const steps = [
  {
    num: "01",
    title: "Connect your workflow",
    desc: "Sign up in 30 seconds. Import existing deals or start fresh. No onboarding call needed.",
  },
  {
    num: "02",
    title: "Let AI handle the busywork",
    desc: "Contracts get analyzed automatically. Rates get benchmarked. Invoices get generated. You focus on creating.",
  },
  {
    num: "03",
    title: "Get paid, grow faster",
    desc: "Track every dollar, spot new brand opportunities, and share a media kit that updates itself.",
  },
];

/* ─── Feature deep-dives ─── */
const features = [
  {
    label: "DEAL PIPELINE",
    heading: "Track every deal from first ",
    italicWord: "DM",
    headingEnd: " to final payment",
    desc: "A visual pipeline built for the way creators actually work. Drag deals through stages, set reminders, and never let a brand slip through the cracks.",
    bullets: [
      "Kanban board with customizable stages",
      "Automatic follow-up reminders",
      "Brand contact history and notes",
      "Revenue forecasting by month",
    ],
    mockup: {
      title: "Deal Pipeline",
      items: [
        { name: "Mejuri", amount: "$3,200", stage: "Negotiating", progress: 45 },
        { name: "Aritzia", amount: "$4,500", stage: "Contract Sent", progress: 65 },
        { name: "Oatly", amount: "$1,800", stage: "Content Approved", progress: 85 },
      ],
    },
  },
  {
    label: "AI DEAL SCANNER — NEW",
    heading: "Let AI find deals in your ",
    italicWord: "inbox",
    headingEnd: "",
    desc: "Connect Gmail and let Claude AI scan your emails for brand partnership opportunities. Every collab inquiry gets auto-detected with the brand name, estimated value, and deliverables — ready to add to your pipeline with one click.",
    bullets: [
      "Claude AI scans your Gmail for brand emails",
      "Auto-extracts brand name, value, deliverables",
      "Confidence scoring (high/medium/low)",
      "One-click add to pipeline with editable review",
    ],
    mockup: {
      title: "AI Deal Scanner",
      items: [
        { brand: "Glow Recipe", budget: "$2,500", niche: "Beauty", status: "Open" },
        { brand: "Olipop", budget: "$1,800", niche: "Beverage", status: "Closing Soon" },
        { brand: "Rare Beauty", budget: "$3,200", niche: "Makeup", status: "Open" },
      ],
    },
  },
  {
    label: "AI CONTRACTS",
    heading: "Never sign a bad ",
    italicWord: "contract",
    headingEnd: " again",
    desc: "Paste or upload any brand contract and get a Claude AI analysis in seconds. Red flags, missing clauses, exclusivity warnings, and AI-suggested counter-language — so you negotiate from strength.",
    bullets: [
      "Red flag detection for risky clauses",
      "Plain-English clause summaries",
      "Exclusivity conflict warnings",
      "AI-generated negotiation tips",
    ],
    mockup: {
      title: "Contract Analysis",
      items: [
        { label: "Usage Rights", status: "Caution", detail: "Perpetual, all platforms" },
        { label: "Exclusivity", status: "Fair", detail: "90 days, category only" },
        { label: "Payment Terms", status: "Good", detail: "Net 30, 50% upfront" },
      ],
    },
  },
  {
    label: "REFERRAL PROGRAM — NEW",
    heading: "Give your followers a ",
    italicWord: "discount",
    headingEnd: "",
    desc: "Share your unique affiliate link with your audience. Anyone who signs up gets their first month of UGC + Influencer for $27 instead of $39 — your followers save money and you grow the creator community.",
    bullets: [
      "Unique affiliate link with your name",
      "$12 off first month auto-applied",
      "Real-time signup and conversion tracking",
      "Share on Twitter, Email, SMS in one click",
    ],
    mockup: {
      title: "Your Referrals",
      items: [
        { stat: "47", label: "Total signups" },
        { stat: "23", label: "Converted" },
        { stat: "$276", label: "Discounts given" },
        { stat: "49%", label: "Conversion rate" },
      ],
    },
  },
  {
    label: "RATE CALCULATOR",
    heading: "Know your ",
    italicWord: "worth",
    headingEnd: " — backed by data",
    desc: "Stop guessing what to charge. Our rate engine benchmarks your audience, niche, and deliverables against real market data to recommend rates brands actually pay.",
    bullets: [
      "Benchmarked against real creator deals",
      "Adjusts for niche, platform, and audience size",
      "Deliverable-level pricing breakdowns",
      "Export rate cards for brand pitches",
    ],
    mockup: {
      title: "Rate Calculator",
      items: [
        { deliverable: "Instagram Reel", low: "$800", mid: "$1,200", high: "$1,600" },
        { deliverable: "TikTok Video", low: "$600", mid: "$950", high: "$1,300" },
        { deliverable: "YouTube Integration", low: "$2,000", mid: "$3,500", high: "$5,000" },
      ],
    },
  },
  {
    label: "BRAND RADAR",
    heading: "Discover brands actively ",
    italicWord: "hiring",
    headingEnd: " creators",
    desc: "Browse open brand campaigns matched to your niche and audience. See budgets, deliverables, and timelines — then pitch with one click using your media kit.",
    bullets: [
      "Curated brand opportunities in your niche",
      "Budget and deliverable details upfront",
      "One-click pitch with your media kit",
      "New opportunities added weekly",
    ],
    mockup: {
      title: "Brand Radar",
      items: [
        { brand: "Glossier", budget: "$2K-$5K", niche: "Beauty", status: "Open" },
        { brand: "Athletic Greens", budget: "$3K-$8K", niche: "Wellness", status: "Open" },
        { brand: "Notion", budget: "$1.5K-$4K", niche: "Productivity", status: "Closing Soon" },
      ],
    },
  },
  {
    label: "MEDIA KIT",
    heading: "A media kit that updates ",
    italicWord: "itself",
    headingEnd: "",
    desc: "Auto-generated from your real stats with a beautiful shareable link. No more updating Canva templates every month — your kit is always current, always on-brand.",
    bullets: [
      "Live follower and engagement stats",
      "Custom branding and color themes",
      "Shareable link for brand pitches",
      "Past brand collaborations showcase",
    ],
    mockup: {
      title: "Media Kit Preview",
      items: [
        { stat: "142K", label: "Instagram Followers" },
        { stat: "4.8%", label: "Engagement Rate" },
        { stat: "89K", label: "TikTok Followers" },
        { stat: "24", label: "Brand Partnerships" },
      ],
    },
  },
  {
    label: "INVOICING",
    heading: "Get paid on time, ",
    italicWord: "every",
    headingEnd: " time",
    desc: "Create branded invoices in seconds, send them directly to brands, and track payment status. Automatic reminders mean you never have to send an awkward follow-up.",
    bullets: [
      "Professional invoice templates",
      "Automatic payment reminders",
      "Track paid, pending, and overdue",
      "Export for tax season",
    ],
    mockup: {
      title: "Invoices",
      items: [
        { brand: "Mejuri", amount: "$3,200", status: "Paid", date: "Apr 2" },
        { brand: "Aritzia", amount: "$4,500", status: "Pending", date: "Apr 10" },
        { brand: "Oatly", amount: "$1,800", status: "Overdue", date: "Mar 28" },
      ],
    },
  },
];

/* ─── Pricing ─── */
const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "",
    desc: "Try the basics — no card required",
    features: ["3 active deals", "Basic invoicing", "Inbound form", "Media kit (limited)"],
    cta: "Start free",
    featured: false,
  },
  {
    name: "UGC Creator",
    price: "$27",
    period: "/mo",
    desc: "Full pipeline + AI-powered tools",
    features: [
      "Unlimited deals",
      "AI contract analysis",
      "Rate calculator",
      "Brand radar",
      "Media kit builder",
      "Invoice tracking + reminders",
    ],
    cta: "Get started",
    featured: false,
  },
  {
    name: "UGC + Influencer",
    price: "$39",
    period: "/mo",
    desc: "Everything + audience analytics",
    features: [
      "Everything in UGC Creator",
      "Audience analytics",
      "Engagement tracking",
      "Campaign recaps",
      "Exclusivity manager",
      "Priority support",
    ],
    cta: "Get started",
    featured: true,
  },
];

/* ─── FAQ ─── */
const faqs = [
  {
    q: "Is Create Suite free to start?",
    a: "Yes. The Free plan includes 3 active deals, basic invoicing, and an inbound form. No credit card required. You can upgrade to a paid plan anytime to unlock AI contract analysis, rate benchmarking, and unlimited deals.",
  },
  {
    q: "What types of creators is this built for?",
    a: "Create Suite is designed for UGC creators, influencers, and content creators who work with brands on sponsored content, product collaborations, and partnerships. Whether you have 5K or 5M followers, the tools scale with your business.",
  },
  {
    q: "How does the AI contract analysis work?",
    a: "Upload any brand contract as a PDF or paste the text directly. Our AI reads the entire document, highlights red flags like perpetual usage rights or unfavorable payment terms, explains each clause in plain English, and suggests counter-language you can send back to the brand.",
  },
  {
    q: "Where does the rate data come from?",
    a: "Our rate benchmarks are built from anonymized, real creator deal data across thousands of partnerships. We factor in your niche, audience size, platform, and deliverable type to give you accurate market-rate recommendations.",
  },
  {
    q: "Can I import existing deals and contacts?",
    a: "Yes. You can import deals via CSV or add them manually. We also support importing contacts from your existing CRM or spreadsheet so you can get started without re-entering everything from scratch.",
  },
  {
    q: "Is my data private and secure?",
    a: "Absolutely. Your contracts, financials, and deal information are encrypted at rest and in transit. We never share your data with brands or third parties. You own your data and can export or delete it at any time.",
  },
  {
    q: "What's the difference between UGC and UGC + Influencer?",
    a: "The UGC plan covers everything you need to manage deals, contracts, and payments. The UGC + Influencer plan adds audience analytics, engagement tracking, campaign recaps, and an exclusivity manager — tools designed for creators who post on their own channels and need to track performance.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. There are no annual contracts or cancellation fees. You can downgrade to the Free plan or cancel your subscription at any time from your account settings. Your data is retained for 30 days after cancellation in case you want to come back.",
  },
];

/* ─── FAQ Accordion (client component) ─── */
function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-[720px] mx-auto">
      {faqs.map((faq, i) => (
        <div key={i} className="border-b border-[#D8E8EE]">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between py-5 text-left group"
          >
            <span className="text-[16px] font-sans font-600 text-[#1A2C38] pr-4 group-hover:text-[#3D6E8A] transition-colors">
              {faq.q}
            </span>
            <span className="text-[20px] text-[#7BAFC8] flex-shrink-0 transition-transform duration-200" style={{ transform: openIndex === i ? "rotate(45deg)" : "rotate(0deg)" }}>
              +
            </span>
          </button>
          <div
            className="overflow-hidden transition-all duration-300"
            style={{ maxHeight: openIndex === i ? "300px" : "0px", opacity: openIndex === i ? 1 : 0 }}
          >
            <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed pb-5">
              {faq.a}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Mockup renderers ─── */
function DealPipelineMockup({ items }: { items: { name: string; amount: string; stage: string; progress: number }[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.name} className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-[14px] font-sans font-600 text-[#1A2C38]">{item.name}</p>
            <p className="text-[12px] font-sans text-[#8AAABB]">{item.stage}</p>
          </div>
          <p className="text-[15px] font-serif text-[#3D6E8A] mr-4">{item.amount}</p>
          <div className="w-20 h-[4px] bg-[#D8E8EE] rounded-full overflow-hidden">
            <div className="h-full bg-[#7BAFC8] rounded-full" style={{ width: `${item.progress}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ContractMockup({ items }: { items: { label: string; status: string; detail: string }[] }) {
  const statusColor: Record<string, string> = { Caution: "#D4A030", Fair: "#7BAFC8", Good: "#4A9060" };
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between">
          <div>
            <p className="text-[14px] font-sans font-600 text-[#1A2C38]">{item.label}</p>
            <p className="text-[12px] font-sans text-[#8AAABB]">{item.detail}</p>
          </div>
          <span className="text-[12px] font-sans font-600 px-2.5 py-1 rounded-full" style={{ backgroundColor: `${statusColor[item.status]}20`, color: statusColor[item.status] }}>
            {item.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function RateTableMockup({ items }: { items: { deliverable: string; low: string; mid: string; high: string }[] }) {
  return (
    <div>
      <div className="grid grid-cols-4 gap-2 mb-2">
        <p className="text-[11px] font-sans font-600 text-[#8AAABB] uppercase tracking-wider">Deliverable</p>
        <p className="text-[11px] font-sans font-600 text-[#8AAABB] uppercase tracking-wider text-center">Low</p>
        <p className="text-[11px] font-sans font-600 text-[#8AAABB] uppercase tracking-wider text-center">Mid</p>
        <p className="text-[11px] font-sans font-600 text-[#8AAABB] uppercase tracking-wider text-center">High</p>
      </div>
      {items.map((item) => (
        <div key={item.deliverable} className="grid grid-cols-4 gap-2 py-2 border-t border-[#D8E8EE]">
          <p className="text-[13px] font-sans font-500 text-[#1A2C38]">{item.deliverable}</p>
          <p className="text-[13px] font-sans text-[#8AAABB] text-center">{item.low}</p>
          <p className="text-[13px] font-serif text-[#3D6E8A] text-center font-500">{item.mid}</p>
          <p className="text-[13px] font-sans text-[#8AAABB] text-center">{item.high}</p>
        </div>
      ))}
    </div>
  );
}

function BrandRadarMockup({ items }: { items: { brand: string; budget: string; niche: string; status: string }[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.brand} className="flex items-center justify-between">
          <div>
            <p className="text-[14px] font-sans font-600 text-[#1A2C38]">{item.brand}</p>
            <p className="text-[12px] font-sans text-[#8AAABB]">{item.niche} &middot; {item.budget}</p>
          </div>
          <span className={`text-[12px] font-sans font-600 px-2.5 py-1 rounded-full ${item.status === "Open" ? "bg-[#4A9060]/10 text-[#4A9060]" : "bg-[#D4A030]/10 text-[#D4A030]"}`}>
            {item.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function MediaKitMockup({ items }: { items: { stat: string; label: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <div key={item.label} className="bg-[#F2F8FB] rounded-[10px] p-3 text-center">
          <p className="text-[20px] font-serif text-[#1A2C38]">{item.stat}</p>
          <p className="text-[11px] font-sans text-[#8AAABB]">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

function InvoiceMockup({ items }: { items: { brand: string; amount: string; status: string; date: string }[] }) {
  const statusColor: Record<string, string> = { Paid: "#4A9060", Pending: "#7BAFC8", Overdue: "#E05C3A" };
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.brand} className="flex items-center justify-between">
          <div>
            <p className="text-[14px] font-sans font-600 text-[#1A2C38]">{item.brand}</p>
            <p className="text-[12px] font-sans text-[#8AAABB]">{item.date}</p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-[15px] font-serif text-[#3D6E8A]">{item.amount}</p>
            <span className="text-[12px] font-sans font-600 px-2.5 py-1 rounded-full" style={{ backgroundColor: `${statusColor[item.status]}15`, color: statusColor[item.status] }}>
              {item.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Feature order: DEAL PIPELINE, AI DEAL SCANNER, AI CONTRACTS, REFERRAL PROGRAM, RATE CALCULATOR, BRAND RADAR, MEDIA KIT, INVOICING
const mockupRenderers = [DealPipelineMockup, BrandRadarMockup, ContractMockup, MediaKitMockup, RateTableMockup, BrandRadarMockup, MediaKitMockup, InvoiceMockup];

/* ═══════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════ */
export default function ForCreatorsPage() {
  return (
    <div>
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden pt-24 pb-20 px-6">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#7BAFC8]/10 blur-[120px] pointer-events-none" />

        <div className="max-w-[800px] mx-auto text-center relative z-10">
          <p className="text-[12px] font-sans font-600 uppercase tracking-[3px] text-[#7BAFC8] mb-4">
            FOR CREATORS
          </p>
          <h1 className="text-[44px] md:text-[56px] font-serif font-normal leading-[1.1] text-[#1A2C38] mb-6">
            Stop running your business<br className="hidden md:block" /> from your <em className="italic text-[#3D6E8A]">DMs</em>.
          </h1>
          <p className="text-[18px] font-sans text-[#4A6070] max-w-[560px] mx-auto mb-8 leading-relaxed">
            Deal tracking, AI contracts, invoices, rate benchmarking, and a live media kit. Everything you need to run your creator business like a real business.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a
              href="/signup"
              className="bg-[#1E3F52] text-white text-[15px] font-sans font-500 px-7 py-3.5 rounded-[10px] hover:bg-[#2a5269] transition-colors"
            >
              Get started free
            </a>
            <Link
              href="/login"
              className="border border-[#D8E8EE] text-[#3D6E8A] text-[15px] font-sans font-500 px-7 py-3.5 rounded-[10px] hover:bg-[#F2F8FB] transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ THE PROBLEM ═══ */}
      <section className="bg-[#F0EAE0] py-20 px-6 border-y border-[#DDD6C8]">
        <div className="max-w-[1000px] mx-auto">
          <p className="text-[12px] font-sans font-600 uppercase tracking-[3px] text-[#7BAFC8] mb-3 text-center">
            THE PROBLEM
          </p>
          <h2 className="text-[32px] md:text-[40px] font-serif text-[#1A2C38] leading-tight mb-12 text-center">
            Sound <em className="italic text-[#3D6E8A]">familiar</em>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {painPoints.map((p) => (
              <div key={p.title} className="bg-white border border-[#D8E8EE] rounded-[16px] p-6">
                <span className="text-[28px] mb-4 block">{p.emoji}</span>
                <h3 className="text-[17px] font-sans font-600 text-[#1A2C38] mb-2">{p.title}</h3>
                <p className="text-[14px] font-sans text-[#4A6070] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-20 px-6">
        <div className="max-w-[900px] mx-auto">
          <p className="text-[12px] font-sans font-600 uppercase tracking-[3px] text-[#7BAFC8] mb-3 text-center">
            HOW IT WORKS
          </p>
          <h2 className="text-[32px] md:text-[40px] font-serif text-[#1A2C38] leading-tight mb-12 text-center">
            Up and running in <em className="italic text-[#3D6E8A]">minutes</em>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="h-12 w-12 rounded-full bg-[#F2F8FB] border border-[#D8E8EE] flex items-center justify-center mx-auto mb-4">
                  <span className="text-[15px] font-serif text-[#3D6E8A]">{s.num}</span>
                </div>
                <h3 className="text-[17px] font-sans font-600 text-[#1A2C38] mb-2">{s.title}</h3>
                <p className="text-[14px] font-sans text-[#4A6070] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURE DEEP-DIVES ═══ */}
      {features.map((f, i) => {
        const reversed = i % 2 === 1;
        const Mockup = mockupRenderers[i];
        return (
          <section
            key={f.label}
            className={`py-20 px-6 ${i % 2 === 0 ? "" : "bg-[#F2F8FB]"}`}
          >
            <div className={`max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center`}>
              {/* Text side */}
              <div className={reversed ? "lg:order-2" : ""}>
                <p className="text-[12px] font-sans font-600 uppercase tracking-[3px] text-[#7BAFC8] mb-3">
                  {f.label}
                </p>
                <h2 className="text-[28px] md:text-[36px] font-serif text-[#1A2C38] leading-tight mb-4">
                  {f.heading}
                  <em className="italic text-[#3D6E8A]">{f.italicWord}</em>
                  {f.headingEnd}
                </h2>
                <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed mb-6">
                  {f.desc}
                </p>
                <div className="space-y-3">
                  {f.bullets.map((b) => (
                    <div key={b} className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-[#F2F8FB] border border-[#D8E8EE] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8 3" stroke="#7BAFC8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <p className="text-[14px] font-sans text-[#4A6070]">{b}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mockup side */}
              <div className={reversed ? "lg:order-1" : ""}>
                <div className="bg-white border border-[#D8E8EE] rounded-[16px] shadow-[0_8px_30px_rgba(30,63,82,.06)] p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#D8E8EE]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#D8E8EE]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#D8E8EE]" />
                    <span className="ml-3 text-[12px] font-sans text-[#8AAABB]">{f.mockup.title}</span>
                  </div>
                  <Mockup items={f.mockup.items as any} />
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* ═══ CREATOR PRICING ═══ */}
      <section className="py-20 px-6">
        <div className="max-w-[1000px] mx-auto">
          <p className="text-[12px] font-sans font-600 uppercase tracking-[3px] text-[#7BAFC8] mb-3 text-center">
            PRICING
          </p>
          <h2 className="text-[32px] md:text-[40px] font-serif text-[#1A2C38] leading-tight mb-4 text-center">
            Simple, <em className="italic text-[#3D6E8A]">transparent</em> pricing
          </h2>
          <p className="text-[16px] font-sans text-[#4A6070] text-center mb-12 max-w-[500px] mx-auto">
            Start free. Upgrade when you need AI tools and unlimited deals. No hidden fees, cancel anytime.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`border rounded-[16px] p-6 flex flex-col ${
                  tier.featured
                    ? "border-[#3D6E8A] bg-[#F2F8FB] ring-1 ring-[#3D6E8A]/20"
                    : "border-[#D8E8EE] bg-white"
                }`}
              >
                {tier.featured && (
                  <span className="text-[11px] font-sans font-600 uppercase tracking-[2px] text-[#3D6E8A] mb-3">
                    Most Popular
                  </span>
                )}
                <h3 className="text-[18px] font-sans font-600 text-[#1A2C38]">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mt-2 mb-1">
                  <span className="text-[36px] font-serif text-[#1A2C38]">{tier.price}</span>
                  {tier.period && <span className="text-[15px] font-sans text-[#8AAABB]">{tier.period}</span>}
                </div>
                <p className="text-[14px] font-sans text-[#4A6070] mb-6">{tier.desc}</p>
                <div className="space-y-2.5 mb-8 flex-1">
                  {tier.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7L6 10L11 4" stroke="#7BAFC8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span className="text-[14px] font-sans text-[#4A6070]">{feat}</span>
                    </div>
                  ))}
                </div>
                <a
                  href="/signup"
                  className={`text-center text-[15px] font-sans font-500 px-6 py-3 rounded-[10px] transition-colors ${
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

      {/* ═══ FAQ ═══ */}
      <section className="py-20 px-6 bg-[#F2F8FB]">
        <div className="max-w-[800px] mx-auto">
          <p className="text-[12px] font-sans font-600 uppercase tracking-[3px] text-[#7BAFC8] mb-3 text-center">
            FAQ
          </p>
          <h2 className="text-[32px] md:text-[40px] font-serif text-[#1A2C38] leading-tight mb-12 text-center">
            Common <em className="italic text-[#3D6E8A]">questions</em>
          </h2>
          <FAQAccordion />
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-20 px-6 bg-[#F2F8FB] border-t border-[#D8E8EE]">
        <div className="max-w-[600px] mx-auto text-center">
          <h2 className="text-[32px] md:text-[40px] font-serif text-[#1A2C38] leading-tight mb-4">
            Ready to run your business<br className="hidden md:block" /> like a <em className="italic text-[#3D6E8A]">real business</em>?
          </h2>
          <p className="text-[16px] font-sans text-[#4A6070] mb-8">
            Free to start. No credit card required.
          </p>
          <a
            href="/signup"
            className="inline-block bg-[#1E3F52] text-white text-[15px] font-sans font-500 px-8 py-4 rounded-[10px] hover:bg-[#2a5269] transition-colors"
          >
            Get started free
          </a>
        </div>
      </section>
    </div>
  );
}
