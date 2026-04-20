import type { Metadata } from "next";
import Link from "next/link";
import { SmartCTA } from "@/components/marketing/smart-cta";

export const metadata: Metadata = {
  title: "For Creators — Create Suite",
  description:
    "Run the business part. Keep the creative part. CreateSuite handles deals, paperwork, exclusivities, and taxes so your calendar is yours again.",
};

// Feature grid
const featureCells = [
  {
    accent: true,
    num: "01",
    title: <>Pitch <em>sorter</em></>,
    desc: "Gmail inbound, auto-parsed. Rate, brand, deadline at a glance — no more scrolling threads.",
  },
  {
    num: "02",
    title: "Contract review",
    desc: "Every clause flagged: exclusivity, IP, perpetuity, payment risk. Plain-English redlines in seconds.",
  },
  {
    num: "03",
    title: "Rate card",
    desc: "Versioned over time, so you know exactly when you undercharged.",
  },
  {
    dark: true,
    num: "04",
    title: <>Ask <em>honestly</em></>,
    desc: "\"Is $12k fair for 3 Reels?\" Grounded in your own history, not someone else's benchmark.",
    flag: "New",
  },
  {
    num: "05",
    title: "Exclusivity tracker",
    desc: "Never double-book a category. A calendar map of every non-compete window.",
  },
  {
    wide: true,
    num: "06",
    title: <>Tax-ready <em>income journal</em></>,
    desc: "Every invoice, receipt, and 1099 ready to hand your CPA at the end of Q4. Export to Stripe, QuickBooks, or a plain CSV.",
  },
  {
    num: "07",
    title: "Counter-offers",
    desc: "One click. In your voice. With your line in the sand.",
  },
];

export default function ForCreatorsPage() {
  return (
    <>
      {/* ══════════════════════ HERO ══════════════════════ */}
      <section className="relative overflow-hidden pt-16 pb-10 lg:pt-24 lg:pb-12">
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
          <div className="section-num mb-8">
            <span>For creators</span>
            <span className="line" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-8 lg:gap-16 items-start">
            {/* Copy */}
            <div>
              <h1
                className="font-serif font-normal text-[52px] sm:text-[68px] lg:text-[96px] leading-[0.94] tracking-[-0.025em] text-[#0F1E28]"
                style={{ textWrap: "balance" as any }}
              >
                Run the <em className="italic text-[#3D6E8A]">business</em> part.
                <br />
                Keep the creative part.
              </h1>

              <p
                className="text-[17px] leading-[1.5] text-[#4A6070] max-w-[48ch] mt-7"
                style={{ textWrap: "pretty" as any }}
              >
                You didn&apos;t become a creator to parse contract PDFs at midnight. CreateSuite for Creators handles deals, paperwork, exclusivities, and taxes — so your calendar is yours again.
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
                <span>Unlimited deal pipeline</span>
                <span>Contract review · 9 sec</span>
                <span>Gmail read-only</span>
              </div>
            </div>

            {/* Inbox device preview */}
            <div className="device">
              <div className="device-chrome">
                <div className="dots">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
                <div className="url">app.createsuite.co / inbox</div>
                <div style={{ width: 36 }} />
              </div>
              <div style={{ padding: 0 }}>
                <div className="px-4 py-4 border-b border-[#D8E8EE]">
                  <div className="eyebrow mb-2">Inbox · pitch extraction</div>
                  <div className="font-serif text-[22px] tracking-[-0.01em] text-[#0F1E28]">
                    Collab · Mother&apos;s Day
                  </div>
                </div>
                <div className="px-4 py-4" style={{ background: "#0F1E28", color: "white" }}>
                  <div className="grid grid-cols-4 gap-3.5">
                    {[
                      { l: "Brand", v: "—" },
                      { l: "Rate", v: "$18,500" },
                      { l: "Deliver", v: "3 Reels" },
                      { l: "Go live", v: "May 2" },
                    ].map((k) => (
                      <div key={k.l}>
                        <div
                          className="font-mono text-[9px] uppercase tracking-widest mb-0.5"
                          style={{ color: "rgba(255,255,255,.45)" }}
                        >
                          {k.l}
                        </div>
                        <div className="font-serif text-[16px] text-white">{k.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-5 font-serif text-[13.5px] leading-[1.6] text-[#1A2C38]">
                  <p className="m-0 mb-2.5">
                    Hi — we&apos;d love to partner on a Mother&apos;s Day capsule push. Rate: $18,500, 3 Reels, go live May 2nd. Usage: 90 days organic…
                  </p>
                  <div className="px-3 py-2.5 bg-[#F2F8FB] rounded-lg font-sans text-[12px]">
                    <span className="font-mono text-[9.5px] tracking-[.14em] uppercase text-[#3D6E8A] font-medium">
                      — Draft reply
                    </span>
                    <p className="m-0 mt-1.5">
                      Thanks for thinking of me! Rate looks in range. Can we move usage to 90-day paid ($22k) and drop the exclusivity to 60 days?
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ FEATURE GRID ══════════════════════ */}
      <section className="py-16 lg:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
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
          <h2 className="font-serif font-normal text-[54px] lg:text-[96px] leading-[0.94] tracking-[-0.02em] m-0 mb-8 text-white max-w-[16ch]">
            Your calendar, <em className="italic text-[#7BAFC8]">back</em>.
          </h2>
          <div className="flex gap-3 flex-wrap items-center">
            <SmartCTA
              label="Start free →"
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
              Free to start · No credit card
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
