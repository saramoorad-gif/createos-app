import type { Metadata } from "next";
import Link from "next/link";
import { SmartCTA } from "@/components/marketing/smart-cta";

export const metadata: Metadata = {
  title: "Create Suite — The Business OS for Creators & Agencies",
  description: "Manage brand deals, contracts, invoices, and your creator roster in one place. Built for UGC creators, influencers, and talent agencies.",
  openGraph: {
    title: "Create Suite — The Business OS for Creators & Agencies",
    description: "Manage brand deals, contracts, invoices, and your creator roster in one place.",
    url: "https://createsuite.co",
  },
};

// Trust strip — swap these to real numbers once we have them. For launch we
// show a value-prop headline strip instead of faked metrics.
const stats = [
  { value: "AI", label: "Contract review" },
  { value: "Gmail", label: "Deal scanner" },
  { value: "$27/mo", label: "Start pro" },
  { value: "30-day", label: "Guarantee" },
];

const creatorFeatures = [
  { title: "AI Deal Scanner (Gmail)", desc: "Connect Gmail and let Claude AI automatically detect brand deal opportunities in your inbox and create deals with one click" },
  { title: "AI Contract Review", desc: "Paste or upload any contract — get instant analysis with red flags, missing clauses, and specific negotiation tips from Claude AI" },
  { title: "Contract Templates", desc: "5 professional contract templates (UGC, Influencer, Ambassador, Extensions) with live preview and variable filling" },
  { title: "Deal Pipeline + Full Editing", desc: "Track every brand deal from first DM to final payment. Click any deal to edit brand, value, deliverables, stage, exclusivity, and more" },
  { title: "Task Management", desc: "Track deliverables, deadlines, and follow-ups with priorities, categories, due dates, and overdue alerts" },
  { title: "AI Rate Calculator", desc: "Auto-fills from your profile stats. AI suggests rates based on your niche, followers, and engagement" },
  { title: "Exclusivity Tracker", desc: "Track active exclusivity clauses with progress bars and get conflict warnings before signing new deals" },
  { title: "Referral Program", desc: "Share your link with followers — they get $12 off their first month of UGC + Influencer. Track signups and conversions" },
];

const agencyFeatures = [
  { title: "Contract Templates + AI", desc: "5 pre-built templates (UGC, Influencer, Ambassador, Usage Rights, Representation) with live preview and AI analysis" },
  { title: "Roster Dashboard", desc: "Every creator's health score, deals, earnings, and performance at a glance" },
  { title: "Campaign Builder", desc: "Multi-creator campaigns with deliverable boards, calendar view, and profitability tracking" },
  { title: "Conflict Detection", desc: "Pre-deal conflict scanning, exclusivity calendar, and resolution workflows" },
  { title: "Team Collaboration", desc: "Internal channels, task management, shared inbox, and @mentions — replaces Slack and Asana" },
  { title: "Commission & Reports", desc: "Auto-calculated commissions, P&L reports, creator comparisons, and annual summaries" },
  { title: "Brand CRM", desc: "Track brand relationships, contact history, deal volume, and blacklist management" },
  { title: "Role-Based Permissions", desc: "Owner, Manager, and Assistant roles with granular access control" },
];

const features = [
  { title: "AI Deal Scanner", desc: "Gmail integration auto-detects brand deals with Claude AI", isNew: true },
  { title: "AI Contract Review", desc: "Paste contracts, get red flags and negotiation tips", isNew: true },
  { title: "Contract Templates", desc: "5 pro templates with live preview editor", isNew: true },
  { title: "Task Management", desc: "Priorities, due dates, categories, overdue alerts", isNew: true },
  { title: "Deal Pipeline", desc: "Full editing, stages, exclusivity, deliverables" },
  { title: "AI Daily Insights", desc: "Personalized business tips on your dashboard", isNew: true },
  { title: "Referral Program", desc: "Share your link, followers save $12/mo", isNew: true },
  { title: "Income Tracking", desc: "Brand deals, affiliate links, all streams" },
  { title: "Revenue Forecast", desc: "Projected income, goal tracking" },
  { title: "AI Rate Card", desc: "Auto-filled rates with AI suggestions" },
  { title: "Content Calendar", desc: "Plan posts, track sponsor tolerance" },
  { title: "Exclusivity Tracker", desc: "Active clauses with conflict warnings", isNew: true },
  { title: "Tax Prep Export", desc: "1099-ready CSV/PDF with expense tracking" },
  { title: "Gmail Inbox", desc: "Real emails + internal messages in one inbox", isNew: true },
  { title: "Team Channels", desc: "Internal chat, tasks, and @mentions" },
  { title: "Campaign Calendar", desc: "Gantt-style timeline for deliverables" },
  { title: "Conflict Scanner", desc: "Pre-deal exclusivity checks" },
  { title: "Help Center", desc: "FAQs, troubleshooter, and live support" },
  { title: "⌘K Command Palette", desc: "Search and navigate everything instantly" },
  { title: "CSV Import", desc: "Migrate from spreadsheets in seconds" },
];

const testimonials = [
  { name: "Brianna Cole", handle: "@briannacole", text: "I went from tracking deals in my Notes app to having a full business dashboard. The AI contract review alone has saved me from two bad deals.", role: "Lifestyle Creator · 142K followers" },
  { name: "Jamie Torres", handle: "@jamietorres", text: "We replaced four different tools with Create Suite. The conflict detection caught an exclusivity overlap we would have completely missed.", role: "Account Manager · Bright Talent" },
  { name: "Camille Reyes", handle: "@camilleeats", text: "The rate calculator showed me I was undercharging by 40%. My next three deals were all at my new rate. This tool pays for itself.", role: "Food Creator · 219K followers" },
];

const tiers = [
  { name: "Free", price: "$0", period: "", desc: "Try it out", features: ["3 active deals", "Basic invoicing", "Rate calculator", "Help center", "Contract templates"], cta: "Start free", featured: false },
  { name: "UGC Creator", price: "$27", period: "/mo", desc: "Full creator toolkit", features: ["Unlimited deals", "AI contract review", "AI deal scanner (Gmail)", "Task management", "Content calendar", "Contract templates", "Media kit", "Invoice tracking"], cta: "Get started", featured: false },
  { name: "UGC + Influencer", price: "$39", period: "/mo", desc: "For creators growing their audience", features: ["Everything in UGC", "Audience analytics", "Revenue forecasting", "Tax export", "Brand Radar", "Campaign recaps", "Exclusivity manager"], cta: "Get started", featured: true },
  { name: "Agency Starter", price: "$149", period: "/mo", desc: "Up to 15 creators", features: ["Roster dashboard", "Campaign builder", "Team channels + tasks", "5 contract templates", "Conflict scanner", "Commission tracking", "Brand CRM", "P&L reports"], cta: "Start agency plan", featured: false },
];

export default function HomePage() {
  return (
    <div>
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden pt-20 pb-24 px-6">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#7BAFC8]/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-[400px] h-[400px] rounded-full bg-[#6AA0BB]/8 blur-[100px] pointer-events-none" />

        <div className="max-w-[900px] mx-auto text-center relative z-10">
          <p className="text-[13px] font-sans font-500 text-[#7BAFC8] uppercase tracking-[2px] mb-4">
            THE BUSINESS OS FOR CREATORS
          </p>
          <h1 className="text-[48px] md:text-[60px] font-serif font-normal leading-[1.1] text-[#1A2C38] mb-6">
            Run your creator business<br />
            like a <em className="italic text-[#3D6E8A]">real business</em>
          </h1>
          <p className="text-[18px] font-sans text-[#4A6070] max-w-[600px] mx-auto mb-8 leading-relaxed">
            AI contract review, Gmail deal scanner, contract templates, task management, exclusivity tracking, and more — powered by Claude AI. Built for UGC creators, influencers, and talent agencies.
          </p>
          <div className="flex items-center justify-center gap-3">
            <SmartCTA
              label="Get started free"
              loggedInLabel="Open dashboard"
              className="bg-[#1E3F52] text-white text-[15px] font-sans font-500 px-7 py-3.5 rounded-[10px] hover:bg-[#2a5269] transition-colors"
            />
            <Link href="/contact?topic=demo" className="border border-[#D8E8EE] text-[#3D6E8A] text-[15px] font-sans font-500 px-7 py-3.5 rounded-[10px] hover:bg-[#F2F8FB] transition-colors">
              Book a demo
            </Link>
          </div>

          <p className="text-[13px] font-sans text-[#8AAABB] mt-6 text-center">
            Free plan available — no credit card required
          </p>
        </div>

        {/* Dashboard mockup */}
        <div className="max-w-[900px] mx-auto mt-12 relative z-10">
          <div className="bg-white border border-[#D8E8EE] rounded-[16px] shadow-[0_12px_40px_rgba(30,63,82,.08)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-3 w-3 rounded-full bg-[#D8E8EE]" />
              <div className="h-3 w-3 rounded-full bg-[#D8E8EE]" />
              <div className="h-3 w-3 rounded-full bg-[#D8E8EE]" />
              <div className="flex-1 h-6 rounded-md bg-[#F2F8FB] mx-8" />
            </div>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {["$12,400", "8 Active", "3 Streams", "⌘K"].map((v, i) => (
                <div key={i} className="bg-[#F2F8FB] rounded-[10px] p-3">
                  <p className="text-[18px] font-serif text-[#1A2C38]">{v}</p>
                  <p className="text-[11px] font-sans text-[#8AAABB]">{["Total income", "Deals", "Revenue streams", "Command palette"][i]}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {["Mejuri · $3,200", "Aritzia · $4,500", "Oatly · $1,500"].map((d, i) => (
                <div key={i} className="border border-[#D8E8EE] rounded-[10px] p-3">
                  <p className="text-[13px] font-sans font-500 text-[#1A2C38]">{d.split(" · ")[0]}</p>
                  <p className="text-[15px] font-serif text-[#3D6E8A] mt-0.5">{d.split(" · ")[1]}</p>
                  <div className="h-[3px] bg-[#D8E8EE] rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-[#7BAFC8] rounded-full" style={{ width: `${[65, 35, 50][i]}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ LOGO BAR ═══ */}
      <section className="bg-[#F0EAE0] py-8 border-y border-[#DDD6C8]">
        <div className="max-w-[900px] mx-auto flex items-center justify-center gap-10 flex-wrap px-6">
          {["Glossier", "Mejuri", "Aritzia", "Oatly", "Notion", "Ritual"].map((b) => (
            <span key={b} className="text-[16px] font-serif italic text-[#4A6070]/60">{b}</span>
          ))}
        </div>
      </section>

      {/* ═══ STATS STRIP ═══ */}
      <section className="py-12 border-b border-[#D8E8EE]">
        <div className="max-w-[900px] mx-auto flex items-center justify-center gap-0 px-6">
          {stats.map((s, i) => (
            <div key={s.label} className="flex items-center">
              {i > 0 && <div className="w-px h-10 bg-[#D8E8EE] mx-8" />}
              <div className="text-center">
                <p className="text-[28px] font-serif text-[#1A2C38]">{s.value}</p>
                <p className="text-[13px] font-sans text-[#8AAABB]">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CREATOR SECTION ═══ */}
      <section className="py-20 px-6">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[12px] font-sans font-600 uppercase tracking-[3px] text-[#7BAFC8] mb-3">FOR CREATORS</p>
            <h2 className="text-[36px] font-serif text-[#1A2C38] leading-tight mb-4">
              Stop running your business from your <em className="italic text-[#3D6E8A]">DMs</em>
            </h2>
            <p className="text-[15px] font-sans text-[#4A6070] mb-8 leading-relaxed">
              Track deals, analyze contracts with AI, benchmark rates, send invoices, track all income streams, and get support — from one dashboard built for creators.
            </p>
            <div className="space-y-4">
              {creatorFeatures.slice(0, 4).map((f) => (
                <div key={f.title} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-[#F2F8FB] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-[#7BAFC8]" />
                  </div>
                  <div>
                    <p className="text-[14px] font-sans font-600 text-[#1A2C38]">{f.title}</p>
                    <p className="text-[13px] font-sans text-[#4A6070]">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/for-creators" className="inline-block mt-8 text-[14px] font-sans font-500 text-[#3D6E8A] hover:underline">
              Explore creator features →
            </Link>
          </div>
          {/* Dashboard mockup panel */}
          <div className="bg-white border border-[#D8E8EE] rounded-[16px] p-5 shadow-[0_12px_40px_rgba(30,63,82,.08)]">
            <p className="text-[11px] font-sans font-600 uppercase tracking-[2px] text-[#8AAABB] mb-3">DEAL PIPELINE</p>
            {["Mejuri · In Progress · $3,200", "Aritzia · Negotiating · $4,500", "Oatly · Contracted · $1,500", "Notion · Negotiating · $2,200"].map((d, i) => {
              const [brand, stage, val] = d.split(" · ");
              return (
                <div key={i} className="flex items-center justify-between py-3 border-b border-[#D8E8EE] last:border-0">
                  <div>
                    <p className="text-[13px] font-sans font-500 text-[#1A2C38]">{brand}</p>
                    <p className="text-[11px] font-sans text-[#8AAABB]">{stage}</p>
                  </div>
                  <p className="text-[15px] font-serif text-[#3D6E8A]">{val}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ AGENCY SECTION ═══ */}
      <section className="py-20 px-6 bg-[#F2F8FB]">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Pipeline mockup panel */}
          <div className="bg-white border border-[#D8E8EE] rounded-[16px] p-5 shadow-[0_12px_40px_rgba(30,63,82,.08)]">
            <p className="text-[11px] font-sans font-600 uppercase tracking-[2px] text-[#8AAABB] mb-3">AGENCY PIPELINE</p>
            {[
              { creator: "Brianna Cole", brand: "Mejuri", val: "$3,200", stage: "In Progress" },
              { creator: "Maya Chen", brand: "Glossier", val: "$2,800", stage: "Contracted" },
              { creator: "Camille Reyes", brand: "Whole Foods", val: "$4,200", stage: "In Progress" },
              { creator: "Jade Park", brand: "Glow Recipe", val: "$1,800", stage: "Contracted" },
            ].map((d, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-[#D8E8EE] last:border-0">
                <div>
                  <p className="text-[13px] font-sans font-500 text-[#1A2C38]">{d.creator}</p>
                  <p className="text-[11px] font-sans text-[#8AAABB]">{d.brand} · {d.stage}</p>
                </div>
                <p className="text-[15px] font-serif text-[#3D6E8A]">{d.val}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-[12px] font-sans font-600 uppercase tracking-[3px] text-[#7BAFC8] mb-3">FOR AGENCIES</p>
            <h2 className="text-[36px] font-serif text-[#1A2C38] leading-tight mb-4">
              One platform to run your entire <em className="italic text-[#3D6E8A]">roster</em>
            </h2>
            <p className="text-[15px] font-sans text-[#4A6070] mb-8 leading-relaxed">
              Replace Asana, HoneyBook, Dubsado, and Slack. Pipeline, campaigns, contracts, team channels, tasks, conflict detection, and reporting — all in one platform.
            </p>
            <div className="space-y-4">
              {agencyFeatures.slice(0, 4).map((f) => (
                <div key={f.title} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#D8E8EE]">
                    <div className="h-2 w-2 rounded-full bg-[#3D6E8A]" />
                  </div>
                  <div>
                    <p className="text-[14px] font-sans font-600 text-[#1A2C38]">{f.title}</p>
                    <p className="text-[13px] font-sans text-[#4A6070]">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/for-agencies" className="inline-block mt-8 text-[14px] font-sans font-500 text-[#3D6E8A] hover:underline">
              Explore agency features →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES GRID ═══ */}
      <section className="py-20 px-6 bg-[#F0EAE0]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-12">
            <p className="text-[12px] font-sans font-600 uppercase tracking-[3px] text-[#7BAFC8] mb-3">FEATURES</p>
            <h2 className="text-[36px] font-serif text-[#1A2C38]">50+ features to <em className="italic text-[#3D6E8A]">run your business</em></h2>
            <p className="text-[14px] font-sans text-[#4A6070] mt-3">New features shipping every week</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <div key={f.title} className="bg-[#F0EAE0] border border-[#DDD6C8] rounded-[10px] p-5 hover:bg-white hover:border-[#D8E8EE] transition-colors group relative">
                {f.isNew && (
                  <span className="absolute top-3 right-3 text-[9px] font-sans uppercase tracking-[1px] px-1.5 py-0.5 rounded-full bg-[#3D7A58] text-white" style={{ fontWeight: 600 }}>NEW</span>
                )}
                <div className="h-8 w-8 rounded-lg bg-[#F2F8FB] flex items-center justify-center mb-3 group-hover:bg-[#7BAFC8]/10">
                  <div className="h-3 w-3 rounded-full bg-[#7BAFC8]" />
                </div>
                <h3 className="text-[15px] font-sans font-600 text-[#1A2C38] mb-1">{f.title}</h3>
                <p className="text-[13px] font-sans text-[#4A6070] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ AI SHOWCASE ═══ */}
      <section className="py-20 px-6 bg-gradient-to-b from-[#1E3F52] to-[#2a5269] text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#7BAFC8]/10 blur-[120px] pointer-events-none" />
        <div className="max-w-[1100px] mx-auto relative">
          <div className="text-center mb-12">
            <p className="text-[12px] font-sans font-600 uppercase tracking-[3px] text-[#7BAFC8] mb-3">POWERED BY CLAUDE AI</p>
            <h2 className="text-[36px] font-serif text-white">AI baked into <em className="italic text-[#7BAFC8]">every workflow</em></h2>
            <p className="text-[15px] font-sans text-white/70 max-w-[600px] mx-auto mt-3">
              Our AI reads your emails, reviews your contracts, and helps you make smarter business decisions — without you lifting a finger.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Gmail Deal Scanner", desc: "Connects to your Gmail and auto-detects brand partnership opportunities. One-click adds them to your pipeline." },
              { title: "Contract AI Review", desc: "Paste any contract and get payment analysis, usage rights breakdown, red flags, and negotiation tips." },
              { title: "Rate Suggestions", desc: "Based on your followers, engagement, and niche — AI calculates what you should be charging." },
              { title: "Daily Insights", desc: "Personalized dashboard insights analyze your pipeline and suggest what to focus on today." },
            ].map((f) => (
              <div key={f.title} className="bg-white/5 border border-white/10 rounded-[10px] p-5 backdrop-blur-sm">
                <div className="h-8 w-8 rounded-lg bg-[#7BAFC8]/20 flex items-center justify-center mb-3">
                  <span className="text-[14px]">✨</span>
                </div>
                <h3 className="text-[15px] font-sans text-white mb-1.5" style={{ fontWeight: 600 }}>{f.title}</h3>
                <p className="text-[13px] font-sans text-white/70 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ REFERRAL CTA ═══ */}
      <section className="py-20 px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[12px] font-sans font-600 uppercase tracking-[3px] text-[#7BAFC8] mb-3">CREATOR REFERRAL PROGRAM</p>
              <h2 className="text-[36px] font-serif text-[#1A2C38] leading-tight mb-4">
                Earn while your followers <em className="italic text-[#3D6E8A]">save</em>
              </h2>
              <p className="text-[15px] font-sans text-[#4A6070] mb-6 leading-relaxed">
                Share your unique link and code. Your followers get their first month of UGC + Influencer for $27 instead of $39 — a $12 discount auto-applied at checkout. You earn 15% recurring commission for 12 months on every paying subscriber you bring in.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  "Unique affiliate link and promo code per creator",
                  "Followers save $12 on month one — auto-applied at checkout",
                  "15% recurring commission for 12 months (~$68 per subscriber, Year 1)",
                  "Real-time signup, conversion, and earnings tracking",
                  "Monthly payouts via Stripe ($50 minimum)",
                  "Share via Twitter, Email, SMS, or anywhere",
                ].map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="text-[#3D7A58] mt-0.5">✓</span>
                    <span className="text-[14px] font-sans text-[#1A2C38]">{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <Link href="/creators/apply" className="inline-flex items-center gap-2 bg-[#1E3F52] text-white rounded-[10px] px-6 py-3 text-[14px] font-sans hover:bg-[#2a5269] transition-colors" style={{ fontWeight: 600 }}>
                  Apply to join →
                </Link>
                <Link href="/referral-program" className="text-[14px] font-sans text-[#3D6E8A] hover:underline" style={{ fontWeight: 500 }}>
                  Read the full terms →
                </Link>
              </div>
            </div>

            {/* Visual mockup */}
            <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[16px] p-6 shadow-[0_12px_40px_rgba(30,63,82,.08)]">
              <div className="bg-gradient-to-br from-[#1E3F52] to-[#2a5269] rounded-[12px] p-5 text-white mb-5">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-[20px] flex-shrink-0">🎁</div>
                  <div>
                    <p className="text-[14px] font-sans text-white" style={{ fontWeight: 600 }}>Brianna Cole invited you!</p>
                    <p className="text-[11px] font-sans text-white/70 mt-1">Get your first month of UGC + Influencer for just $27</p>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-[10px] font-sans uppercase tracking-[1.5px] text-[#8AAABB] mb-2" style={{ fontWeight: 600 }}>YOUR AFFILIATE LINK</p>
                <div className="bg-[#F2F8FB] border border-[#D8E8EE] rounded-[8px] px-3 py-2.5 font-mono text-[11px] text-[#1A2C38] truncate">
                  createsuite.co/signup?ref=ABC12345
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F2F8FB] rounded-[10px] p-3">
                  <p className="text-[10px] font-sans uppercase tracking-[1px] text-[#8AAABB]" style={{ fontWeight: 600 }}>SIGNUPS</p>
                  <p className="text-[20px] font-serif text-[#1A2C38]">47</p>
                </div>
                <div className="bg-[#E8F4EE] rounded-[10px] p-3">
                  <p className="text-[10px] font-sans uppercase tracking-[1px] text-[#3D7A58]" style={{ fontWeight: 600 }}>CONVERTED</p>
                  <p className="text-[20px] font-serif text-[#3D7A58]">23</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-20 px-6 bg-[#F2F8FB]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-12">
            <p className="text-[12px] font-sans font-600 uppercase tracking-[3px] text-[#7BAFC8] mb-3">TESTIMONIALS</p>
            <h2 className="text-[36px] font-serif text-[#1A2C38]">Creators and agencies <em className="italic text-[#3D6E8A]">love it</em></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white border border-[#D8E8EE] rounded-[10px] p-6">
                <p className="text-[14px] font-sans text-[#1A2C38] leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#F2F8FB] flex items-center justify-center text-[12px] font-sans font-500 text-[#3D6E8A]">
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-[13px] font-sans font-600 text-[#1A2C38]">{t.name}</p>
                    <p className="text-[12px] font-sans text-[#8AAABB]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section className="py-20 px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-12">
            <p className="text-[12px] font-sans font-600 uppercase tracking-[3px] text-[#7BAFC8] mb-3">PRICING</p>
            <h2 className="text-[36px] font-serif text-[#1A2C38]">Simple, transparent <em className="italic text-[#3D6E8A]">pricing</em></h2>
            <p className="text-[15px] font-sans text-[#4A6070] mt-2">Start free. Upgrade when you&apos;re ready.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {tiers.map((t) => (
              <div key={t.name} className={`rounded-[10px] p-6 flex flex-col ${t.featured ? "bg-[#1E3F52] text-white" : "bg-white border border-[#D8E8EE]"}`}>
                {t.featured && <span className="text-[10px] font-sans font-600 uppercase tracking-[1.5px] text-[#7BAFC8] mb-2">Recommended</span>}
                <h3 className={`text-[16px] font-sans font-600 ${t.featured ? "text-white" : "text-[#1A2C38]"}`}>{t.name}</h3>
                <div className="mt-2 mb-3">
                  <span className={`text-[32px] font-serif ${t.featured ? "text-white" : "text-[#1A2C38]"}`}>{t.price}</span>
                  <span className={`text-[14px] font-sans ${t.featured ? "text-[#8AAABB]" : "text-[#8AAABB]"}`}>{t.period}</span>
                </div>
                <p className={`text-[13px] font-sans mb-5 ${t.featured ? "text-[#8AAABB]" : "text-[#4A6070]"}`}>{t.desc}</p>
                <div className="flex-1 space-y-2 mb-5">
                  {t.features.map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <span className={`text-xs mt-0.5 ${t.featured ? "text-[#7BAFC8]" : "text-[#7BAFC8]"}`}>&#10003;</span>
                      <span className={`text-[13px] font-sans ${t.featured ? "text-white/80" : "text-[#1A2C38]"}`}>{f}</span>
                    </div>
                  ))}
                </div>
                <SmartCTA
                  label={t.cta}
                  loggedInLabel="Open dashboard"
                  className={`block text-center rounded-[10px] px-4 py-2.5 text-[14px] font-sans font-500 transition-colors ${
                    t.featured ? "bg-white text-[#1E3F52] hover:bg-[#F2F8FB]" : "border border-[#D8E8EE] text-[#3D6E8A] hover:bg-[#F2F8FB]"
                  }`}
                />
              </div>
            ))}
          </div>
          <p className="text-center mt-6">
            <Link href="/pricing" className="text-[14px] font-sans font-500 text-[#3D6E8A] hover:underline">View full pricing comparison →</Link>
          </p>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-20 px-6 bg-[#F2F8FB]">
        <div className="max-w-[600px] mx-auto text-center">
          <h2 className="text-[36px] font-serif text-[#1A2C38] mb-3">
            Ready to run your creator business <em className="italic text-[#3D6E8A]">properly</em>?
          </h2>
          <p className="text-[15px] font-sans text-[#4A6070] mb-8">
            Free to start. No credit card required. Upgrade when you&apos;re ready.
          </p>
          <SmartCTA
            label="Get started free →"
            loggedInLabel="Open dashboard →"
            className="bg-[#1E3F52] text-white text-[15px] font-sans font-500 px-8 py-4 rounded-[10px] hover:bg-[#2a5269] transition-colors inline-block"
          />
        </div>
      </section>
    </div>
  );
}
