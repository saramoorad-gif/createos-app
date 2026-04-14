import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create Suite — The Business OS for Creators & Agencies",
  description: "Manage brand deals, contracts, invoices, and your creator roster in one place. Built for UGC creators, influencers, and talent agencies.",
  openGraph: {
    title: "Create Suite — The Business OS for Creators & Agencies",
    description: "Manage brand deals, contracts, invoices, and your creator roster in one place.",
    url: "https://createsuite.co",
  },
};

const stats = [
  { value: "$4.2M", label: "Earned by creators" },
  { value: "12K+", label: "Deals tracked" },
  { value: "2,400", label: "Active creators" },
  { value: "180+", label: "Agency teams" },
];

const creatorFeatures = [
  { title: "Deal Pipeline", desc: "Track every brand deal from first DM to final payment" },
  { title: "AI Contract Analysis", desc: "Upload any contract — get red flags, fair terms, and counter-clauses in seconds" },
  { title: "Rate Calculator", desc: "Know your worth with market-benchmarked rate recommendations" },
  { title: "Brand Radar", desc: "Discover brands hiring creators in your niche right now" },
  { title: "Media Kit Builder", desc: "Auto-generated media kit with live stats and a shareable link" },
  { title: "Invoicing", desc: "Create, send, and track invoices — with automatic reminders" },
];

const agencyFeatures = [
  { title: "Roster Dashboard", desc: "Every creator's health score, deals, and earnings at a glance" },
  { title: "Campaign Builder", desc: "Multi-creator campaigns with deliverable boards and brand reports" },
  { title: "Contract Management", desc: "AI analysis, templates, version tracking, and e-signatures" },
  { title: "Conflict Detection", desc: "Real-time exclusivity scanning catches conflicts before they happen" },
  { title: "Commission Tracking", desc: "Auto-calculated commissions with payout tracking and monthly exports" },
  { title: "Internal Messaging", desc: "Replace Slack — threaded messaging, task assignment, and brand comms log" },
];

const features = [
  { title: "Deal Pipeline", desc: "Track every deal from pitch to payment" },
  { title: "AI Contracts", desc: "Upload contracts, get instant analysis" },
  { title: "Rate Calculator", desc: "Market-benchmarked rate recommendations" },
  { title: "Brand Radar", desc: "Discover brands hiring in your niche" },
  { title: "Media Kit", desc: "Auto-generated with live stats" },
  { title: "Invoicing", desc: "Create, send, track — with reminders" },
  { title: "Campaign Builder", desc: "Multi-creator brand activations" },
  { title: "Conflict Detection", desc: "Exclusivity scanning in real-time" },
  { title: "Commission Tracking", desc: "Auto-calculated per deal" },
];

const testimonials = [
  { name: "Brianna Cole", handle: "@briannacole", text: "I went from tracking deals in my Notes app to having a full business dashboard. The AI contract review alone has saved me from two bad deals.", role: "Lifestyle Creator · 142K followers" },
  { name: "Jamie Torres", handle: "@jamietorres", text: "We replaced four different tools with Create Suite. The conflict detection caught an exclusivity overlap we would have completely missed.", role: "Account Manager · Bright Talent" },
  { name: "Camille Reyes", handle: "@camilleeats", text: "The rate calculator showed me I was undercharging by 40%. My next three deals were all at my new rate. This tool pays for itself.", role: "Food Creator · 219K followers" },
];

const tiers = [
  { name: "Free", price: "$0", period: "", desc: "3 deals, basic invoicing", features: ["3 active deals", "Basic invoicing", "Inbound form"], cta: "Start free", featured: false },
  { name: "UGC Creator", price: "$27", period: "/mo", desc: "Full pipeline + AI tools", features: ["Unlimited deals", "AI contract analysis", "Rate calculator", "Brand radar", "Media kit", "Invoice tracking"], cta: "Get started", featured: false },
  { name: "UGC + Influencer", price: "$39", period: "/mo", desc: "Everything + audience analytics", features: ["Everything in UGC", "Audience analytics", "Engagement tracking", "Campaign recaps", "Exclusivity manager"], cta: "Get started", featured: true },
  { name: "Agency Starter", price: "$149", period: "/mo", desc: "Up to 15 creators", features: ["Roster dashboard", "Campaign builder", "Commission tracking", "Conflict detection", "Brand reports", "Internal messaging"], cta: "Start agency plan", featured: false },
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
            Deals, contracts, invoices, rate benchmarking, and AI-powered insights — for solo creators and the agencies that manage them.
          </p>
          <div className="flex items-center justify-center gap-3">
            <a href="/signup" className="bg-[#1E3F52] text-white text-[15px] font-sans font-500 px-7 py-3.5 rounded-[10px] hover:bg-[#2a5269] transition-colors">
              Get started free
            </a>
            <Link href="/for-agencies" className="border border-[#D8E8EE] text-[#3D6E8A] text-[15px] font-sans font-500 px-7 py-3.5 rounded-[10px] hover:bg-[#F2F8FB] transition-colors">
              Book a demo
            </Link>
          </div>

          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="flex -space-x-2">
              {["BC", "MC", "JE", "CR"].map((i) => (
                <div key={i} className="h-8 w-8 rounded-full bg-[#D8E8EE] border-2 border-[#FAF8F4] flex items-center justify-center text-[10px] font-sans font-500 text-[#3D6E8A]">{i}</div>
              ))}
            </div>
            <p className="text-[13px] font-sans text-[#8AAABB]">Joined by 2,400+ creators this month</p>
          </div>
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
              {["$8,240", "6 Active", "142K", "84/100"].map((v, i) => (
                <div key={i} className="bg-[#F2F8FB] rounded-[10px] p-3">
                  <p className="text-[18px] font-serif text-[#1A2C38]">{v}</p>
                  <p className="text-[11px] font-sans text-[#8AAABB]">{["April earned", "Deals", "Followers", "Health"][i]}</p>
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
              Track every deal, analyze contracts with AI, benchmark your rates, and send invoices — all from one dashboard built for creators.
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
              Replace Asana, HoneyBook, Dubsado, and Slack. Manage deals, campaigns, contracts, commissions, and creator communication in one place.
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
            <h2 className="text-[36px] font-serif text-[#1A2C38]">Everything you need to <em className="italic text-[#3D6E8A]">grow</em></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="bg-[#F0EAE0] border border-[#DDD6C8] rounded-[10px] p-5 hover:bg-white hover:border-[#D8E8EE] transition-colors group">
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
                <a href="/signup" className={`block text-center rounded-[10px] px-4 py-2.5 text-[14px] font-sans font-500 transition-colors ${
                  t.featured ? "bg-white text-[#1E3F52] hover:bg-[#F2F8FB]" : "border border-[#D8E8EE] text-[#3D6E8A] hover:bg-[#F2F8FB]"
                }`}>
                  {t.cta}
                </a>
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
            Join 2,400+ creators and 180+ agencies already using Create Suite.
          </p>
          <a href="/signup" className="bg-[#1E3F52] text-white text-[15px] font-sans font-500 px-8 py-4 rounded-[10px] hover:bg-[#2a5269] transition-colors inline-block">
            Get started free →
          </a>
        </div>
      </section>
    </div>
  );
}
