import type { Metadata } from "next";
import Link from "next/link";
import { SmartCTA } from "@/components/marketing/smart-cta";

export const metadata: Metadata = {
  title: "Create Suite — The Business OS for Creators & Agencies",
  description:
    "CreateSuite reviews your contracts, scans your inbox for brand deals, tracks exclusivities, and does the boring math — so you can get back to the work your audience came for.",
  openGraph: {
    title: "Create Suite — The Business OS for Creators & Agencies",
    description:
      "Manage brand deals, contracts, invoices, and your creator roster in one place.",
    url: "https://createsuite.co",
  },
};

// ─── Hero mock device data (visual placeholders only) ─────────────
const heroDeals = [
  { logo: "G", brand: "Glossier", deliv: "3 Reels · Mother's Day", stage: "hot", stageLabel: "negotiating", val: "$18,500" },
  { logo: "A", brand: "Athletic Greens", deliv: "1 haul · 2 Stories", stage: "ok", stageLabel: "contracted", val: "$12,000" },
  { logo: "R", brand: "Rhode", deliv: "UGC licensing · 90d", stage: "", stageLabel: "delivered", val: "$24,000" },
] as const;

// ─── Pipeline preview rows (under Section 01) ─────────────────────
const pipelineRows = [
  { logo: "G", brand: "Glossier", deliv: "3 Reels · Mother's Day", stage: "neg", stageLabel: "Negotiating", val: "$18,500" },
  { logo: "F", brand: "Fenty Beauty", deliv: "UGC pack · 4 clips", stage: "con", stageLabel: "Contracted", val: "$14,000" },
  { logo: "A", brand: "Aritzia", deliv: "Fall haul · 1 post", stage: "prog", stageLabel: "In progress", val: "$12,000" },
  { logo: "R", brand: "Rhode", deliv: "UGC licensing · 90d", stage: "del", stageLabel: "Delivered", val: "$24,000" },
  { logo: "V", brand: "Vuori", deliv: "2 Stories + 1 Reel", stage: "neg", stageLabel: "Negotiating", val: "$6,400" },
];

// ─── Feature grid cells ─────────────────────────────────────────
const featureCells = [
  { wide: true, accent: true, num: "01", title: <>Contract <em>templates</em></>, desc: "UGC, Influencer, Ambassador, Usage Rights — vetted templates with live preview, ready in a minute.", flag: "New" },
  { num: "02", title: <>Rate <em>calculator</em></>, desc: "Auto-fills from your stats. Suggests rates based on your niche, followers, and engagement." },
  { num: "03", title: "Exclusivity tracker", desc: "Every active clause with progress bars, expiry dates, and pre-deal conflict warnings." },
  { dark: true, num: "04", title: <>Contract <em>review</em></>, desc: "Paste any contract — get instant analysis with red flags, missing clauses, and specific negotiation tips.", flag: "New" },
  { num: "05", title: "Task management", desc: "Track deliverables, deadlines, and follow-ups. Priorities, due dates, overdue alerts." },
  { num: "06", title: "Brand Radar", desc: "Matches you with brands hiring creators in your niche, based on your rate card and history." },
  { num: "07", title: <>Income <em>journal</em></>, desc: "Affiliate links, Stan Store, brand deals — every stream tracked, tax-ready exports for your CPA." },
  { num: "08", title: "Agency mode", desc: "Roster dashboard, shared templates, commission splits, and per-creator P&L for talent managers." },
];

// ─── Pricing tiers (REAL pricing) ───────────────────────────────
const pricingTiers = [
  {
    name: "Free",
    price: <><sup>$</sup>0</>,
    desc: "For creators just starting to monetize.",
    features: ["3 active deals", "Basic invoicing", "Inbound inquiry form", "Public media kit"],
    cta: "Start free",
    href: "/signup",
  },
  {
    name: "UGC Creator",
    price: <><sup>$</sup>27<sub>/mo</sub></>,
    desc: "For UGC creators running a real business.",
    features: [
      "Unlimited deal pipeline",
      "Contract review",
      "Gmail deal scanner",
      "Rate calculator",
      "Media kit builder",
      "Content calendar",
    ],
    cta: "Get started",
    href: "/signup?plan=ugc",
  },
  {
    featured: true,
    ribbon: "Most picked",
    name: "UGC + Influencer",
    price: <><sup>$</sup>39<sub>/mo</sub></>,
    desc: "For creators with their own audience and brand deals both.",
    features: [
      "Everything in UGC Creator",
      "Audience analytics",
      "Revenue forecast",
      "Exclusivity manager",
      "Campaign recaps",
      "Tax export",
    ],
    cta: "Start 14-day trial",
    href: "/signup?plan=ugc_influencer",
  },
  {
    name: "Agency Starter",
    price: <><sup>$</sup>149<sub>/mo</sub></>,
    desc: "For talent managers running a roster of up to 15 creators.",
    features: [
      "Shared roster & commissions",
      "Campaign builder",
      "Brand CRM & contracts",
      "Team collaboration",
      "Conflict detection",
      "Dedicated onboarding",
    ],
    cta: "Start agency plan",
    href: "/signup?plan=agency",
  },
];

// ─── Testimonials (placeholders until you have real ones) ──────
const testimonials = [
  {
    q: "Flagged a perpetual IP clause I would have signed without thinking. That one catch paid for CreateSuite for three years.",
    initials: "MH",
    name: "Maya Hayes",
    role: "Beauty creator · 410K",
  },
  {
    q: "My manager used to spend Sunday nights in a Google Doc. Now she spends 20 minutes — on her phone.",
    initials: "JT",
    name: "Jordan Tran",
    role: "Lifestyle · 1.2M",
  },
  {
    q: "Run a roster of 28 creators. CreateSuite is the first tool that treats agencies like more than an afterthought.",
    initials: "RP",
    name: "Reya Patel",
    role: "Founder · Beam Talent",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ══════════════════════ HERO ══════════════════════ */}
      <section className="relative overflow-hidden pt-16 pb-8 sm:pt-20 sm:pb-12 lg:pt-24 lg:pb-16">
        {/* Radial gradient background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-70"
          style={{
            background: `
              radial-gradient(50% 70% at 20% 20%, color-mix(in oklab, #7BAFC8 18%, transparent), transparent 65%),
              radial-gradient(45% 60% at 85% 30%, color-mix(in oklab, #F0EAE0 70%, transparent), transparent 70%)
            `,
          }}
        />

        <div className="relative max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-8 lg:gap-16 items-start">
            {/* Hero copy */}
            <div>
              <div className="inline-flex items-center gap-2.5 pl-1.5 pr-3 py-1 bg-white border border-[#D8E8EE] rounded-full text-[11.5px] text-[#4A6070] font-mono tracking-wider mb-7">
                <span className="px-2 py-0.5 rounded-full bg-[#7BAFC8] text-white text-[10px] font-semibold tracking-widest uppercase">
                  New
                </span>
                <span>Gmail deal scanner — now live</span>
              </div>

              <h1
                className="font-serif font-normal text-[52px] sm:text-[68px] lg:text-[96px] leading-[0.94] tracking-[-0.025em] text-[#0F1E28]"
                style={{ textWrap: "balance" as any }}
              >
                The business
                <br />
                of being a <em className="italic text-[#3D6E8A]">creator</em>,
                <br />
                finally organized.
              </h1>

              <p
                className="text-[17px] leading-[1.5] text-[#4A6070] max-w-[48ch] mt-7"
                style={{ textWrap: "pretty" as any }}
              >
                CreateSuite reviews your contracts, scans your inbox for brand deals, tracks exclusivities, and does the boring math — so you can get back to the work your audience came for.
              </p>

              <div className="mt-7 flex gap-2.5 flex-wrap">
                <SmartCTA
                  label="Start free"
                  loggedInLabel="Open dashboard"
                  className="inline-flex items-center gap-2 bg-[#0F1E28] text-white px-4 py-2.5 rounded-[8px] text-[13.5px] font-medium hover:bg-[#1b2f3a] transition-colors"
                />
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 bg-white text-[#1A2C38] border border-[#D8E8EE] px-4 py-2.5 rounded-[8px] text-[13.5px] font-medium hover:border-[#7BAFC8] hover:text-[#3D6E8A] transition-colors"
                >
                  See pricing
                </Link>
              </div>

              <div className="mt-8 pt-5 border-t border-[#D8E8EE] flex gap-6 flex-wrap font-mono text-[11.5px] text-[#8AAABB] tracking-wider">
                <span>
                  <span className="pulse-dot" />
                  Contract review in 9 seconds
                </span>
                <span>Gmail read-only · secure</span>
                <span>Cancel in 1 click</span>
              </div>
            </div>

            {/* Device preview */}
            <div className="device">
              <div className="device-chrome">
                <div className="dots">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
                <div className="url">app.createsuite.co / overview</div>
                <div style={{ width: 36 }} />
              </div>
              <div className="p-4">
                <div className="flex items-baseline justify-between px-2 pb-3 mb-3 border-b border-dashed border-[#E3DED2]">
                  <h4 className="m-0 font-serif font-normal text-[22px] tracking-[-0.02em]">
                    Good afternoon, <em className="italic text-[#3D6E8A]">creator</em>.
                  </h4>
                  <span className="font-mono text-[10px] text-[#8AAABB] tracking-wider">
                    THU · APR 18 · 3 NEW PITCHES
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-px bg-[#D8E8EE] border border-[#D8E8EE] rounded-[10px] overflow-hidden mb-3">
                  {[
                    { l: "Booked Q2", v: "$84.2k", d: "▲ 22%", neg: false },
                    { l: "In review", v: "6", d: "2 need you", neg: false },
                    { l: "Exclusivities", v: "4", d: "1 expires Fri", neg: true },
                    { l: "Hrs saved", v: "11.4", d: "this week", neg: false },
                  ].map((k) => (
                    <div key={k.l} className="bg-white px-3 py-2.5 flex flex-col gap-0.5">
                      <span className="font-mono text-[9px] tracking-widest text-[#8AAABB] uppercase">
                        {k.l}
                      </span>
                      <span className="font-serif text-[22px] tracking-[-0.02em] leading-none text-[#0F1E28]">
                        {k.v}
                      </span>
                      <span className={`font-mono text-[10px] ${k.neg ? "text-[#A03D3D]" : "text-[#3D7A58]"}`}>
                        {k.d}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col">
                  {heroDeals.map((d, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[28px_1fr_auto_auto] gap-3 items-center px-2 py-2.5 border-t border-[#D8E8EE] first:border-t-0 text-[12px]"
                    >
                      <span className="inline-flex items-center justify-center w-[26px] h-[26px] rounded-md bg-[#F2F8FB] border border-[#D8E8EE] font-serif text-[14px] text-[#3D6E8A]">
                        {d.logo}
                      </span>
                      <div>
                        <div className="font-medium text-[#1A2C38]">{d.brand}</div>
                        <div className="text-[10.5px] text-[#8AAABB] font-mono tracking-wider">
                          {d.deliv}
                        </div>
                      </div>
                      <span
                        className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-widest font-medium ${
                          d.stage === "hot"
                            ? "bg-[#F4EEE0] text-[#A07830]"
                            : d.stage === "ok"
                              ? "bg-[#E8F4EE] text-[#3D7A58]"
                              : "bg-[#F2F8FB] text-[#3D6E8A]"
                        }`}
                      >
                        {d.stageLabel}
                      </span>
                      <span className="font-serif text-[17px] text-[#0F1E28] tracking-[-0.01em]">
                        {d.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ LOGO MARQUEE ══════════════════════ */}
      <div className="py-5 bg-[#F4F1EA] border-y border-[#E3DED2] overflow-hidden">
        <div className="logos-track">
          <span>Contract review in 9 seconds</span>
          <span>Gmail deal scanner</span>
          <span>Tax-ready income export</span>
          <span>Built for UGC creators + influencers</span>
          <span>Agency mode with commission tracking</span>
          <span>Gmail read-only · secure by default</span>
          {/* duplicate for seamless loop */}
          <span>Contract review in 9 seconds</span>
          <span>Gmail deal scanner</span>
          <span>Tax-ready income export</span>
          <span>Built for UGC creators + influencers</span>
          <span>Agency mode with commission tracking</span>
          <span>Gmail read-only · secure by default</span>
        </div>
      </div>

      {/* ══════════════════════ SECTION 01 — PIPELINE ══════════════════════ */}
      <section className="py-16 lg:py-28 relative">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end mb-10 lg:mb-16">
            <div>
              <div className="section-num">
                <span className="line" />
                <span>01 · Pipeline</span>
              </div>
              <h2 className="font-serif font-normal text-[42px] lg:text-[60px] leading-[0.98] tracking-[-0.02em] mt-4 text-[#0F1E28]">
                Every brand deal, in <em className="italic text-[#3D6E8A]">one</em> honest grid.
              </h2>
            </div>
            <div className="text-[16px] leading-[1.5] text-[#4A6070] max-w-[50ch] pb-1.5">
              Drag pitches through seven stages, from cold inbound to invoice paid. Every row knows your rate, your exclusivity window, and what you&apos;re contractually owed.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Copy */}
            <div>
              <div className="eyebrow mb-4">For creators</div>
              <h3 className="font-serif font-normal text-[32px] lg:text-[44px] leading-none tracking-[-0.02em] mt-3.5 mb-4 text-[#0F1E28]">
                A pipeline that <em className="italic text-[#3D6E8A]">reads</em> your inbox.
              </h3>
              <p className="text-[15px] leading-[1.55] text-[#4A6070] max-w-[44ch] mb-7">
                Connect Gmail read-only. Every pitch is parsed, priced against your rate card, and surfaced as a draft deal in your pipeline — before you&apos;ve finished your coffee.
              </p>
              <ul className="space-y-3.5 m-0 p-0 list-none">
                {[
                  { t: "Deal detection, automatic", d: "Parses brand, campaign, rate, and deadline from any pitch." },
                  { t: "Rate card aware", d: "Flags underpaid offers against your own historical median." },
                  { t: "Exclusivity radar", d: "Warns you before you double-book a category." },
                  { t: "One-click counter-offer", d: "Drafts a reply in your voice, with your rate and red lines." },
                ].map((item, i) => (
                  <li key={i} className="grid grid-cols-[22px_1fr] gap-3 items-start">
                    <span className="w-[22px] h-[22px] rounded-full bg-[#F2F8FB] border border-[#D8E8EE] inline-flex items-center justify-center font-mono text-[10px] text-[#3D6E8A] font-medium">
                      {i + 1}
                    </span>
                    <div>
                      <div className="text-[14px] font-semibold text-[#1A2C38]">{item.t}</div>
                      <div className="text-[13px] text-[#4A6070] mt-0.5 leading-[1.5]">{item.d}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                href="/for-creators"
                className="inline-flex items-center gap-2 mt-7 bg-white text-[#1A2C38] border border-[#D8E8EE] px-4 py-2.5 rounded-[8px] text-[13.5px] font-medium hover:border-[#7BAFC8] hover:text-[#3D6E8A] transition-colors"
              >
                See for creators →
              </Link>
            </div>

            {/* Board */}
            <div className="board">
              <div className="flex items-baseline justify-between px-1.5 pb-2.5 border-b border-[#D8E8EE]">
                <h5 className="m-0 font-serif text-[18px] font-normal tracking-[-0.01em]">
                  Q2 Pipeline <em className="italic text-[#3D6E8A]">&apos;26</em>
                </h5>
                <span className="font-mono text-[11px] text-[#8AAABB] tracking-widest uppercase">
                  {pipelineRows.length} deals · $74,900
                </span>
              </div>
              {pipelineRows.map((r, i) => (
                <div key={i} className="board-row">
                  <span className="logo">{r.logo}</span>
                  <div>
                    <div className="font-semibold text-[#1A2C38] text-[13.5px]">{r.brand}</div>
                    <div className="text-[11px] text-[#8AAABB] font-mono tracking-wider mt-0.5">
                      {r.deliv}
                    </div>
                  </div>
                  <span className={`stage-pill ${r.stage}`}>{r.stageLabel}</span>
                  <span className="font-serif text-[17px] tracking-[-0.01em] text-[#0F1E28] text-right">
                    {r.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ SECTION 02 — AI SHOWCASE (DARK) ══════════════════════ */}
      <section className="py-16 lg:py-28" style={{ background: "#0F1E28", color: "white" }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end mb-10 lg:mb-16">
            <div>
              <div className="section-num" style={{ color: "rgba(255,255,255,.5)" }}>
                <span className="line" style={{ background: "rgba(255,255,255,.2)" }} />
                <span>02 · Intelligence</span>
              </div>
              <h2 className="font-serif font-normal text-[42px] lg:text-[60px] leading-[0.98] tracking-[-0.02em] mt-4 text-white">
                Read a 40-page contract
                <br />
                in <em className="italic text-[#7BAFC8]">nine seconds</em>.
              </h2>
            </div>
            <div className="text-[16px] leading-[1.5] max-w-[50ch] pb-1.5" style={{ color: "rgba(255,255,255,.65)" }}>
              Every clause flagged, every exclusivity trap surfaced, perpetual IP grabs called out, and plain-English redlines drafted in your voice.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Copy */}
            <div>
              <h3 className="font-serif font-normal text-[32px] lg:text-[48px] leading-[0.98] tracking-[-0.02em] mt-3 mb-5 text-white">
                <em className="italic text-[#7BAFC8]">Flagged,</em> cited,
                <br />
                counter-drafted.
              </h3>
              <p className="text-[15px] leading-[1.55] max-w-[44ch] mb-7" style={{ color: "rgba(255,255,255,.7)" }}>
                Not a summary. A structured review: each risk tagged, located, explained, and paired with exact language to counter with.
              </p>
              <div className="flex flex-col gap-2.5">
                {[
                  {
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 9v4" />
                        <path d="M12 17h.01" />
                        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                      </svg>
                    ),
                    t: "Risk detection",
                    d: "Exclusivity length, IP transfer, perpetuity, morality traps.",
                  },
                  {
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    ),
                    t: "Plain-English redlines",
                    d: "Every clause rewritten in terms you can actually send back.",
                  },
                  {
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    ),
                    t: "Counter-offer drafter",
                    d: "Replies in your voice. Your rates. Your line in the sand.",
                  },
                ].map((c, i) => (
                  <div key={i} className="ai-chip">
                    <span className="icon">{c.icon}</span>
                    <div>
                      <div className="t">{c.t}</div>
                      <div className="d">{c.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scan widget */}
            <div className="scan-widget">
              <div className="head">
                <span>
                  <span className="stat-dot" />
                  Live contract review
                </span>
                <span>Sample contract · 03:18pm</span>
              </div>
              <div className="scan-doc">
                <h5>Collaboration Agreement</h5>
                <div className="meta">BRAND INC. · DRAFT V2 · 8 PAGES</div>
                <p>This agreement governs a sponsored content campaign between the Brand and the Creator across Instagram and TikTok.</p>
                <p>
                  Creator grants Brand a <span className="flag">perpetual, worldwide, royalty-free license</span> to use, edit, and sublicense all deliverables in paid media.
                </p>
                <p>
                  Creator shall refrain from posting content for any <span className="hi">competitor brand in the same category</span> for a period of <span className="flag">twelve (12) months</span> post-campaign.
                </p>
                <p>
                  Payment of $18,500 USD, payable <span className="flag">net-90 upon brand approval</span>, subject to a 25% revision fee.
                </p>
                <div className="scan-line" />
              </div>
              <div className="scan-chips">
                <span className="scan-chip risk">
                  <span className="dot" />
                  <span className="cat">§7.1</span>Perpetual IP grant — recommend 12-month paid usage
                </span>
                <span className="scan-chip warn">
                  <span className="dot" />
                  <span className="cat">§4.2</span>Exclusivity 12mo — conflicts with active campaigns
                </span>
                <span className="scan-chip ok">
                  <span className="dot" />
                  <span className="cat">§3.0</span>Counter drafted: net-30, 2 revisions, 90-day exclusivity
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ SECTION 03 — FEATURE GRID ══════════════════════ */}
      <section className="py-16 lg:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end mb-10 lg:mb-16">
            <div>
              <div className="section-num">
                <span className="line" />
                <span>03 · Surface area</span>
              </div>
              <h2 className="font-serif font-normal text-[42px] lg:text-[60px] leading-[0.98] tracking-[-0.02em] mt-4 text-[#0F1E28]">
                Everything else
                <br />a serious creator needs.
              </h2>
            </div>
            <div className="text-[16px] leading-[1.5] text-[#4A6070] max-w-[50ch] pb-1.5">
              Fifty-plus small features, designed for operators — not dashboards built to impress in a demo.
            </div>
          </div>

          <div className="features-grid">
            {featureCells.map((c, i) => (
              <div
                key={i}
                className={`fcell ${c.wide ? "wide" : ""} ${c.accent ? "accent" : ""} ${c.dark ? "dark" : ""}`}
              >
                <span className="fc-num">{c.num}</span>
                <h4>{c.title}</h4>
                <p>{c.desc}</p>
                {c.flag && <span className="new-flag">{c.flag}</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ SECTION 04 — TESTIMONIALS ══════════════════════ */}
      <section className="py-16 lg:py-28 bg-[#F4F1EA] border-y border-[#E3DED2]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end mb-10 lg:mb-16">
            <div>
              <div className="section-num">
                <span className="line" />
                <span>04 · Creators</span>
              </div>
              <h2 className="font-serif font-normal text-[42px] lg:text-[60px] leading-[0.98] tracking-[-0.02em] mt-4 text-[#0F1E28]">
                Creators who stopped
                <br />
                losing money in <em className="italic text-[#3D6E8A]">fine print</em>.
              </h2>
            </div>
            <div className="text-[16px] leading-[1.5] text-[#4A6070] max-w-[50ch] pb-1.5">
              We built CreateSuite for operators: creators who treat their work like a company, and want software that keeps up.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <div key={i} className="testi">
                <p className="q m-0">
                  <span className="opener">&ldquo;</span>
                  {t.q}
                </p>
                <div className="who">
                  <span className="av">{t.initials}</span>
                  <div>
                    <div className="text-[13px] font-semibold text-[#1A2C38]">{t.name}</div>
                    <div className="text-[11.5px] text-[#8AAABB] font-mono tracking-wider mt-0.5">
                      {t.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ SECTION 05 — PRICING ══════════════════════ */}
      <section className="py-16 lg:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end mb-10 lg:mb-16">
            <div>
              <div className="section-num">
                <span className="line" />
                <span>05 · Pricing</span>
              </div>
              <h2 className="font-serif font-normal text-[42px] lg:text-[60px] leading-[0.98] tracking-[-0.02em] mt-4 text-[#0F1E28]">
                Priced for <em className="italic text-[#3D6E8A]">real</em> careers.
              </h2>
            </div>
            <div className="text-[16px] leading-[1.5] text-[#4A6070] max-w-[50ch] pb-1.5">
              Start free. Upgrade when the first deal lands. Every paid plan includes contract review, Gmail scanner, and the template library.
            </div>
          </div>

          <div className="pricing-tiers">
            {pricingTiers.map((t, i) => (
              <div key={i} className={`tier ${t.featured ? "featured" : ""}`}>
                {t.ribbon && <span className="ribbon">{t.ribbon}</span>}
                <div className="tname">{t.name}</div>
                <div className="tprice">{t.price}</div>
                <div className="tdesc">{t.desc}</div>
                <hr />
                <ul>
                  {t.features.map((f, j) => (
                    <li key={j}>{f}</li>
                  ))}
                </ul>
                <div className="tcta">
                  <Link
                    href={t.href}
                    className={`inline-flex items-center justify-center w-full px-4 py-2.5 rounded-[6px] text-[13.5px] font-medium transition-colors ${
                      t.featured
                        ? "bg-white text-[#0F1E28] hover:bg-[#7BAFC8] hover:text-white"
                        : "bg-white text-[#1A2C38] border border-[#D8E8EE] hover:border-[#7BAFC8] hover:text-[#3D6E8A]"
                    }`}
                  >
                    {t.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center mt-6 text-[13px] text-[#8AAABB]">
            Also on Agency:{" "}
            <Link href="/pricing" className="text-[#3D6E8A] hover:underline">
              Agency Growth at $249/mo for 40+ creators →
            </Link>
          </p>
        </div>
      </section>

      {/* ══════════════════════ CTA BAND (DARK) ══════════════════════ */}
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
          <div className="eyebrow mb-6" style={{ color: "rgba(255,255,255,.55)" }}>
            — A calmer way to run the business
          </div>
          <h2 className="font-serif font-normal text-[54px] lg:text-[96px] leading-[0.94] tracking-[-0.02em] m-0 mb-8 text-white max-w-[16ch]">
            Stop losing money in the <em className="italic text-[#7BAFC8]">fine print</em>.
          </h2>
          <div className="flex gap-3 flex-wrap items-center">
            <SmartCTA
              label="Start free, forever →"
              loggedInLabel="Open dashboard →"
              className="inline-flex items-center gap-2 bg-white text-[#0F1E28] px-5 py-3 rounded-[8px] text-[14px] font-medium hover:bg-[#7BAFC8] hover:text-white transition-colors"
            />
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 bg-transparent text-white border px-5 py-3 rounded-[8px] text-[14px] font-medium hover:bg-white/10 transition-colors"
              style={{ borderColor: "rgba(255,255,255,.3)" }}
            >
              See pricing
            </Link>
            <span className="font-mono text-[11px] tracking-wider ml-3" style={{ color: "rgba(255,255,255,.5)" }}>
              No card · 2-minute setup · Cancel in one click
            </span>
          </div>
        </div>
      </section>

      {/* ══════════════════════ FOOTER ══════════════════════ */}
      <footer className="bg-[#FAF8F4] border-t border-[#E3DED2] pt-14 pb-6">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)] gap-8 pb-10 border-b border-[#E3DED2]">
            <div className="col-span-2 lg:col-span-1">
              <div className="font-serif font-normal text-[40px] lg:text-[56px] tracking-[-0.02em] leading-[0.95] text-[#0F1E28]">
                Create<em className="italic text-[#3D6E8A]">Suite.</em>
              </div>
              <p className="max-w-[32ch] text-[#4A6070] text-[13px] mt-2.5 leading-[1.5]">
                The operating system for creators. Deals, contracts, invoices, and your roster — all in one place.
              </p>
            </div>

            {[
              {
                title: "Product",
                links: [
                  { href: "/features", label: "Features" },
                  { href: "/pricing", label: "Pricing" },
                  { href: "/referral-program", label: "Referral program" },
                  { href: "/help", label: "Help center" },
                ],
              },
              {
                title: "For",
                links: [
                  { href: "/for-creators", label: "Creators" },
                  { href: "/for-agencies", label: "Agencies" },
                ],
              },
              {
                title: "Company",
                links: [
                  { href: "/contact", label: "Contact" },
                  { href: "/faq", label: "FAQ" },
                ],
              },
              {
                title: "Legal",
                links: [
                  { href: "/terms", label: "Terms" },
                  { href: "/privacy", label: "Privacy" },
                  { href: "/affiliate-agreement", label: "Affiliate Agreement" },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h5 className="font-mono text-[10.5px] uppercase tracking-widest text-[#8AAABB] font-medium m-0 mb-3">
                  {col.title}
                </h5>
                <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-[13.5px] text-[#4A6070] hover:text-[#0F1E28]">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Giant outlined brand mark */}
          <div className="foot-mark">
            Create<em>Suite.</em>
          </div>

          <div className="flex justify-between items-center pt-5 font-mono text-[11px] text-[#8AAABB] tracking-wider">
            <span>© 2026 CREATE SUITE LLC</span>
            <span>MADE FOR CREATORS</span>
          </div>
        </div>
      </footer>
    </>
  );
}
