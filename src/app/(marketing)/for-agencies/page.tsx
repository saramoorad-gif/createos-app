"use client";

import Link from "next/link";
import { useState } from "react";

/* ─── Pain points ─── */
const painPoints = [
  {
    emoji: "🧩",
    title: "Your stack is held together with duct tape",
    desc: "Asana for tasks, HoneyBook for contracts, Slack for comms, Google Sheets for payments. Nothing talks to each other, and things fall through the cracks daily.",
  },
  {
    emoji: "🔥",
    title: "Conflicts slip through until it's too late",
    desc: "Creator signs a competing brand deal and nobody catches it until the client calls. Manual exclusivity tracking doesn't scale past 10 creators.",
  },
  {
    emoji: "📊",
    title: "Commission reconciliation is a nightmare",
    desc: "End of month means hours of cross-referencing spreadsheets to figure out who's owed what. One mistake and you lose trust with your talent.",
  },
];

/* ─── Comparison table ─── */
const comparisonRows = [
  { need: "Task & campaign management", old: "Asana / Monday", suite: "Campaign Builder with deliverable boards" },
  { need: "Contracts & proposals", old: "HoneyBook / Dubsado", suite: "AI-powered contract management" },
  { need: "Team communication", old: "Slack / email threads", suite: "Internal messaging with brand comms log" },
  { need: "Payments & commissions", old: "Spreadsheets / QuickBooks", suite: "Automatic commission tracking & payouts" },
  { need: "Creator CRM & roster", old: "Airtable / Google Sheets", suite: "Roster dashboard with health scores" },
  { need: "Brand reporting", old: "Canva + manual data pulls", suite: "Auto-generated campaign reports" },
];

/* ─── Feature deep-dives ─── */
const features = [
  {
    label: "ROSTER DASHBOARD",
    heading: "Your entire roster at a ",
    italicWord: "glance",
    headingEnd: "",
    desc: "See every creator's health score, active deals, earnings, and contract status in one view. Filter by niche, tier, or availability to staff campaigns in seconds.",
    bullets: [
      "Creator health scores (deal activity, earnings, response time)",
      "Filter by niche, audience size, or availability",
      "Earnings tracking per creator and per brand",
      "Quick-access to contracts, invoices, and comms",
    ],
    mockup: {
      title: "Roster Dashboard",
      type: "roster",
      items: [
        { name: "Brianna Cole", score: 92, deals: 4, earned: "$12,400", niche: "Lifestyle" },
        { name: "Marcus Chen", score: 78, deals: 2, earned: "$6,200", niche: "Tech" },
        { name: "Ava Martinez", score: 88, deals: 3, earned: "$9,800", niche: "Beauty" },
      ],
    },
  },
  {
    label: "CAMPAIGN BUILDER",
    heading: "Multi-creator campaigns, ",
    italicWord: "organized",
    headingEnd: "",
    desc: "Build campaigns with multiple creators, assign deliverables, track approvals, and generate brand reports — all from one board. No more juggling tools.",
    bullets: [
      "Deliverable boards with status tracking",
      "Assign creators, set deadlines, track approvals",
      "Auto-generated brand reports with metrics",
      "Client-facing campaign links",
    ],
    mockup: {
      title: "Campaign: Glossier Summer",
      type: "campaign",
      items: [
        { creator: "Brianna Cole", deliverable: "3x IG Reels", status: "Content Approved", progress: 90 },
        { creator: "Marcus Chen", deliverable: "1x YT Integration", status: "In Review", progress: 60 },
        { creator: "Ava Martinez", deliverable: "2x TikToks", status: "Drafting", progress: 30 },
      ],
    },
  },
  {
    label: "CONTRACT MANAGEMENT",
    heading: "AI-analyzed contracts at ",
    italicWord: "scale",
    headingEnd: "",
    desc: "Upload any contract and get instant AI analysis. Manage templates, track versions, and handle e-signatures for your entire roster without switching tools.",
    bullets: [
      "AI clause analysis with red flag detection",
      "Reusable contract templates",
      "Version history and change tracking",
      "E-signature support built in",
    ],
    mockup: {
      title: "Contracts",
      type: "contracts",
      items: [
        { creator: "Brianna Cole", brand: "Mejuri", status: "Signed", flags: 0 },
        { creator: "Marcus Chen", brand: "Notion", status: "Review", flags: 2 },
        { creator: "Ava Martinez", brand: "Aritzia", status: "Sent", flags: 0 },
      ],
    },
  },
  {
    label: "CONFLICT DETECTION",
    heading: "Catch exclusivity ",
    italicWord: "conflicts",
    headingEnd: " before they happen",
    desc: "Real-time scanning across your entire roster. When a creator is about to sign a deal that violates an existing exclusivity clause, you'll know instantly.",
    bullets: [
      "Real-time exclusivity scanning across all creators",
      "Automatic alerts when conflicts are detected",
      "Category-level and brand-level exclusivity support",
      "Historical conflict log for compliance",
    ],
    mockup: {
      title: "Conflict Detection",
      type: "conflicts",
      items: [
        { creator: "Marcus Chen", conflict: "Tech category overlap", brands: "Notion vs. Coda", severity: "High" },
        { creator: "Ava Martinez", conflict: "None detected", brands: "-", severity: "Clear" },
        { creator: "Brianna Cole", conflict: "Window expires in 12 days", brands: "Mejuri exclusivity", severity: "Watch" },
      ],
    },
  },
  {
    label: "COMMISSION TRACKING",
    heading: "Commissions calculated ",
    italicWord: "automatically",
    headingEnd: "",
    desc: "Set commission rates per creator or per deal. Payouts are calculated automatically as deals close, with monthly exports ready for your accountant.",
    bullets: [
      "Flexible commission rates (flat or percentage)",
      "Auto-calculated as deals move to paid",
      "Monthly payout exports and summaries",
      "Per-creator and per-brand breakdowns",
    ],
    mockup: {
      title: "Commissions — April",
      type: "commissions",
      items: [
        { creator: "Brianna Cole", dealTotal: "$12,400", rate: "15%", commission: "$1,860", status: "Pending" },
        { creator: "Marcus Chen", dealTotal: "$6,200", rate: "20%", commission: "$1,240", status: "Paid" },
        { creator: "Ava Martinez", dealTotal: "$9,800", rate: "15%", commission: "$1,470", status: "Pending" },
      ],
    },
  },
  {
    label: "INTERNAL MESSAGING",
    heading: "Replace Slack for ",
    italicWord: "creator",
    headingEnd: " comms",
    desc: "Threaded messaging built into your workflow. Discuss deals, share briefs, assign tasks, and keep a full brand communication log — without leaving the platform.",
    bullets: [
      "Threaded conversations per deal or campaign",
      "Task assignment and @mentions",
      "Brand communication log for compliance",
      "File sharing and brief attachments",
    ],
    mockup: {
      title: "Messages",
      type: "messages",
      items: [
        { from: "Sara (Manager)", msg: "Glossier brief is attached. Review by Friday?", time: "2h ago" },
        { from: "Brianna Cole", msg: "Looks good! One question about the exclusivity clause.", time: "1h ago" },
        { from: "Sara (Manager)", msg: "Flagged it with legal. Will update by EOD.", time: "30m ago" },
      ],
    },
  },
];

/* ─── Pricing ─── */
const pricingTiers = [
  {
    name: "Agency Starter",
    price: "$149",
    period: "/mo",
    desc: "For teams managing up to 15 creators",
    features: [
      "Up to 15 creators",
      "Roster dashboard",
      "Campaign builder",
      "Contract management + AI analysis",
      "Commission tracking",
      "Conflict detection",
      "Internal messaging",
      "Brand reports",
    ],
    cta: "Start agency trial",
    featured: false,
  },
  {
    name: "Agency Growth",
    price: "$249",
    period: "/mo",
    desc: "For growing agencies with larger rosters",
    features: [
      "Unlimited creators",
      "Everything in Starter",
      "Advanced analytics & reporting",
      "Custom commission structures",
      "API access",
      "Priority support",
      "Custom onboarding",
      "Dedicated account manager",
    ],
    cta: "Book a demo",
    featured: true,
  },
];

/* ─── FAQ ─── */
const faqs = [
  {
    q: "How is Create Suite different from Asana or Monday?",
    a: "Asana and Monday are generic project management tools. Create Suite is purpose-built for talent agencies managing creator rosters. You get campaign-specific workflows, AI contract analysis, commission tracking, and conflict detection — features that would require 4-5 separate tools to replicate.",
  },
  {
    q: "Can I migrate from HoneyBook or Dubsado?",
    a: "Yes. We offer assisted migration from HoneyBook, Dubsado, and other CRMs. Our team will help you import your creator roster, active deals, and contract templates so you're up and running without re-entering data.",
  },
  {
    q: "How does conflict detection work?",
    a: "Our system continuously scans all active contracts across your roster for exclusivity clauses. When a new deal is being negotiated, we automatically check it against existing exclusivity windows at both the brand and category level. You get instant alerts if a conflict is detected.",
  },
  {
    q: "What does the onboarding process look like?",
    a: "Agency Starter includes self-serve onboarding with video walkthroughs and templates. Agency Growth includes a dedicated onboarding specialist who will set up your workspace, import your data, and train your team within the first week.",
  },
  {
    q: "Can my creators access the platform?",
    a: "Yes. Each creator on your roster gets their own login with a creator-facing dashboard. They can view their deals, download contracts, check payment status, and message your team — without seeing other creators' data or your commission structure.",
  },
  {
    q: "How are commissions calculated?",
    a: "You set commission rates per creator (flat fee or percentage) or per deal. As deals move through your pipeline and payments are confirmed, commissions are calculated automatically. Monthly exports are generated for your accounting team with full breakdowns per creator and per brand.",
  },
  {
    q: "Is there a limit on team members?",
    a: "No. Both Agency plans include unlimited team seats for managers, coordinators, and account executives. You only pay based on the number of creators in your roster, not the number of people on your internal team.",
  },
  {
    q: "Do you offer custom pricing for large agencies?",
    a: "Yes. If you manage more than 50 creators or need custom integrations, we offer tailored pricing with volume discounts. Book a demo and we'll build a plan that fits your roster size and workflow.",
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
            <span
              className="text-[20px] text-[#7BAFC8] flex-shrink-0 transition-transform duration-200"
              style={{ transform: openIndex === i ? "rotate(45deg)" : "rotate(0deg)" }}
            >
              +
            </span>
          </button>
          <div
            className="overflow-hidden transition-all duration-300"
            style={{ maxHeight: openIndex === i ? "300px" : "0px", opacity: openIndex === i ? 1 : 0 }}
          >
            <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed pb-5">{faq.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Mockup renderers ─── */
function RosterMockup({ items }: { items: { name: string; score: number; deals: number; earned: string; niche: string }[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.name} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#F2F8FB] border border-[#D8E8EE] flex items-center justify-center text-[12px] font-sans font-600 text-[#3D6E8A]">
              {item.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <p className="text-[14px] font-sans font-600 text-[#1A2C38]">{item.name}</p>
              <p className="text-[12px] font-sans text-[#8AAABB]">{item.niche} &middot; {item.deals} deals</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-[15px] font-serif text-[#3D6E8A]">{item.earned}</p>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.score >= 85 ? "#4A9060" : item.score >= 70 ? "#D4A030" : "#E05C3A" }} />
              <span className="text-[12px] font-sans text-[#8AAABB]">{item.score}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CampaignMockup({ items }: { items: { creator: string; deliverable: string; status: string; progress: number }[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.creator} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-sans font-600 text-[#1A2C38]">{item.creator}</p>
              <p className="text-[12px] font-sans text-[#8AAABB]">{item.deliverable}</p>
            </div>
            <span className="text-[12px] font-sans font-500 text-[#4A6070]">{item.status}</span>
          </div>
          <div className="h-[4px] bg-[#D8E8EE] rounded-full overflow-hidden">
            <div className="h-full bg-[#7BAFC8] rounded-full transition-all" style={{ width: `${item.progress}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ContractsMockup({ items }: { items: { creator: string; brand: string; status: string; flags: number }[] }) {
  const statusColor: Record<string, string> = { Signed: "#4A9060", Review: "#D4A030", Sent: "#7BAFC8" };
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.creator} className="flex items-center justify-between">
          <div>
            <p className="text-[14px] font-sans font-600 text-[#1A2C38]">{item.creator}</p>
            <p className="text-[12px] font-sans text-[#8AAABB]">{item.brand}</p>
          </div>
          <div className="flex items-center gap-2">
            {item.flags > 0 && (
              <span className="text-[11px] font-sans font-600 px-2 py-0.5 rounded-full bg-[#D4A030]/10 text-[#D4A030]">
                {item.flags} flags
              </span>
            )}
            <span
              className="text-[12px] font-sans font-600 px-2.5 py-1 rounded-full"
              style={{ backgroundColor: `${statusColor[item.status]}15`, color: statusColor[item.status] }}
            >
              {item.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ConflictsMockup({ items }: { items: { creator: string; conflict: string; brands: string; severity: string }[] }) {
  const sevColor: Record<string, string> = { High: "#E05C3A", Clear: "#4A9060", Watch: "#D4A030" };
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.creator} className="flex items-center justify-between">
          <div>
            <p className="text-[14px] font-sans font-600 text-[#1A2C38]">{item.creator}</p>
            <p className="text-[12px] font-sans text-[#8AAABB]">{item.conflict}</p>
          </div>
          <span
            className="text-[12px] font-sans font-600 px-2.5 py-1 rounded-full"
            style={{ backgroundColor: `${sevColor[item.severity]}15`, color: sevColor[item.severity] }}
          >
            {item.severity}
          </span>
        </div>
      ))}
    </div>
  );
}

function CommissionsMockup({ items }: { items: { creator: string; dealTotal: string; rate: string; commission: string; status: string }[] }) {
  const statusColor: Record<string, string> = { Paid: "#4A9060", Pending: "#7BAFC8" };
  return (
    <div>
      <div className="grid grid-cols-4 gap-2 mb-2">
        {["Creator", "Deal Total", "Rate", "Commission"].map((h) => (
          <p key={h} className="text-[11px] font-sans font-600 text-[#8AAABB] uppercase tracking-wider">{h}</p>
        ))}
      </div>
      {items.map((item) => (
        <div key={item.creator} className="grid grid-cols-4 gap-2 py-2.5 border-t border-[#D8E8EE] items-center">
          <p className="text-[13px] font-sans font-500 text-[#1A2C38]">{item.creator.split(" ")[0]}</p>
          <p className="text-[13px] font-sans text-[#4A6070]">{item.dealTotal}</p>
          <p className="text-[13px] font-sans text-[#8AAABB]">{item.rate}</p>
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-serif text-[#3D6E8A]">{item.commission}</p>
            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColor[item.status] }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function MessagesMockup({ items }: { items: { from: string; msg: string; time: string }[] }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className={`flex gap-3 ${i % 2 === 1 ? "flex-row-reverse" : ""}`}>
          <div className="h-8 w-8 rounded-full bg-[#F2F8FB] border border-[#D8E8EE] flex items-center justify-center flex-shrink-0 text-[10px] font-sans font-600 text-[#3D6E8A]">
            {item.from.split(" ")[0][0]}
          </div>
          <div className={`flex-1 ${i % 2 === 1 ? "text-right" : ""}`}>
            <div className="flex items-center gap-2 mb-0.5" style={{ justifyContent: i % 2 === 1 ? "flex-end" : "flex-start" }}>
              <p className="text-[12px] font-sans font-600 text-[#1A2C38]">{item.from}</p>
              <p className="text-[11px] font-sans text-[#8AAABB]">{item.time}</p>
            </div>
            <p className="text-[13px] font-sans text-[#4A6070] leading-relaxed">{item.msg}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const mockupByType: Record<string, React.FC<{ items: any[] }>> = {
  roster: RosterMockup,
  campaign: CampaignMockup,
  contracts: ContractsMockup,
  conflicts: ConflictsMockup,
  commissions: CommissionsMockup,
  messages: MessagesMockup,
};

/* ═══════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════ */
export default function ForAgenciesPage() {
  return (
    <div>
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden pt-24 pb-20 px-6">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#7BAFC8]/10 blur-[120px] pointer-events-none" />

        <div className="max-w-[800px] mx-auto text-center relative z-10">
          <p className="text-[12px] font-sans font-600 uppercase tracking-[3px] text-[#7BAFC8] mb-4">
            FOR AGENCIES
          </p>
          <h1 className="text-[44px] md:text-[56px] font-serif font-normal leading-[1.1] text-[#1A2C38] mb-6">
            One platform to run<br className="hidden md:block" /> your entire <em className="italic text-[#3D6E8A]">roster</em>.
          </h1>
          <p className="text-[18px] font-sans text-[#4A6070] max-w-[580px] mx-auto mb-8 leading-relaxed">
            Replace Asana, HoneyBook, Dubsado, and Slack. Manage campaigns, contracts, commissions, and creator comms in one place.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/contact?topic=demo"
              className="bg-[#1E3F52] text-white text-[15px] font-sans font-500 px-7 py-3.5 rounded-[10px] hover:bg-[#2a5269] transition-colors"
            >
              Book a demo
            </Link>
            <a
              href="/signup"
              className="border border-[#D8E8EE] text-[#3D6E8A] text-[15px] font-sans font-500 px-7 py-3.5 rounded-[10px] hover:bg-[#F2F8FB] transition-colors"
            >
              Start free trial
            </a>
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
            Managing creators shouldn&apos;t require <em className="italic text-[#3D6E8A]">six tools</em>
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

      {/* ═══ WHAT AGENCIES REPLACE ═══ */}
      <section className="py-20 px-6">
        <div className="max-w-[900px] mx-auto">
          <p className="text-[12px] font-sans font-600 uppercase tracking-[3px] text-[#7BAFC8] mb-3 text-center">
            CONSOLIDATE YOUR STACK
          </p>
          <h2 className="text-[32px] md:text-[40px] font-serif text-[#1A2C38] leading-tight mb-12 text-center">
            Replace <em className="italic text-[#3D6E8A]">everything</em> with one platform
          </h2>
          <div className="bg-white border border-[#D8E8EE] rounded-[16px] overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-[#F2F8FB] border-b border-[#D8E8EE]">
              <p className="text-[12px] font-sans font-600 uppercase tracking-[2px] text-[#8AAABB]">What you need</p>
              <p className="text-[12px] font-sans font-600 uppercase tracking-[2px] text-[#8AAABB]">Old way</p>
              <p className="text-[12px] font-sans font-600 uppercase tracking-[2px] text-[#3D6E8A]">Create Suite</p>
            </div>
            {/* Rows */}
            {comparisonRows.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 gap-4 px-6 py-4 ${i < comparisonRows.length - 1 ? "border-b border-[#D8E8EE]" : ""}`}>
                <p className="text-[14px] font-sans font-500 text-[#1A2C38]">{row.need}</p>
                <p className="text-[14px] font-sans text-[#8AAABB] line-through decoration-[#D8E8EE]">{row.old}</p>
                <p className="text-[14px] font-sans text-[#3D6E8A] font-500">{row.suite}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURE DEEP-DIVES ═══ */}
      {features.map((f, i) => {
        const reversed = i % 2 === 1;
        const Mockup = mockupByType[f.mockup.type];
        return (
          <section
            key={f.label}
            className={`py-20 px-6 ${i % 2 === 0 ? "" : "bg-[#F2F8FB]"}`}
          >
            <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
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
                  {Mockup && <Mockup items={f.mockup.items as any} />}
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* ═══ AGENCY PRICING ═══ */}
      <section className="py-20 px-6">
        <div className="max-w-[800px] mx-auto">
          <p className="text-[12px] font-sans font-600 uppercase tracking-[3px] text-[#7BAFC8] mb-3 text-center">
            PRICING
          </p>
          <h2 className="text-[32px] md:text-[40px] font-serif text-[#1A2C38] leading-tight mb-4 text-center">
            Built for agencies at <em className="italic text-[#3D6E8A]">every</em> stage
          </h2>
          <p className="text-[16px] font-sans text-[#4A6070] text-center mb-12 max-w-[500px] mx-auto">
            Unlimited team seats on every plan. You pay for creators, not staff.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <span className="text-[15px] font-sans text-[#8AAABB]">{tier.period}</span>
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
                  href={tier.featured ? "/signup" : "/signup"}
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
            Ready to manage your roster<br className="hidden md:block" /> from <em className="italic text-[#3D6E8A]">one platform</em>?
          </h2>
          <p className="text-[16px] font-sans text-[#4A6070] mb-8">
            Book a demo or start your free trial today.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/contact?topic=demo"
              className="bg-[#1E3F52] text-white text-[15px] font-sans font-500 px-8 py-4 rounded-[10px] hover:bg-[#2a5269] transition-colors"
            >
              Book a demo
            </Link>
            <a
              href="/signup"
              className="border border-[#D8E8EE] text-[#3D6E8A] text-[15px] font-sans font-500 px-8 py-4 rounded-[10px] hover:bg-white transition-colors"
            >
              Start free trial
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
