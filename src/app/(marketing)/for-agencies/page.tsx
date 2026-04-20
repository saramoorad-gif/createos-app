import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "For Agencies — Create Suite",
  description:
    "The back-office for every creator roster. Manage contracts, commissions, P&L, and pitches across every creator you represent.",
};

// Sample roster (visual placeholder)
const rosterSample = [
  { n: "Maya H.", c: "Beauty", v: "$124k", pct: 62 },
  { n: "Jordan T.", c: "Lifestyle", v: "$98k", pct: 71 },
  { n: "Sofia R.", c: "Fitness", v: "$82k", pct: 80 },
  { n: "Noa F.", c: "Food", v: "$76k", pct: 88 },
];

// Feature grid
const featureCells = [
  {
    wide: true,
    accent: true,
    num: "01",
    title: <>Roster <em>cockpit</em></>,
    desc: "Every creator, every deal, every deadline — in a single airlock. Filter by category, brand, stage, or manager.",
  },
  {
    num: "02",
    title: "Commission splits",
    desc: "Set per-creator or per-deal. Auto-calculates on every invoice.",
  },
  {
    num: "03",
    title: "Shared templates",
    desc: "Your agency's paper, versioned, with locked fields per creator.",
  },
  {
    dark: true,
    num: "04",
    title: <>Per-creator <em>P&L</em></>,
    desc: "Quarterly earnings reports, ready to share with your talent.",
  },
  {
    num: "05",
    title: "Role-based access",
    desc: "Managers see their book. Finance sees invoices. Talent sees their own.",
  },
  {
    num: "06",
    title: "Conflict detection",
    desc: "Pre-deal exclusivity scanning across your whole roster.",
  },
];

export default function ForAgenciesPage() {
  return (
    <>
      {/* ══════════════════════ HERO ══════════════════════ */}
      <section className="relative overflow-hidden pt-16 pb-12 lg:pt-24 lg:pb-16">
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
            <span>For agencies</span>
            <span className="line" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-8 lg:gap-16 items-start">
            {/* Copy */}
            <div>
              <h1
                className="font-serif font-normal text-[52px] sm:text-[68px] lg:text-[96px] leading-[0.94] tracking-[-0.025em] text-[#0F1E28]"
                style={{ textWrap: "balance" as any }}
              >
                The back-office for
                <br />
                every <em className="italic text-[#3D6E8A]">roster</em>.
              </h1>

              <p
                className="text-[17px] leading-[1.5] text-[#4A6070] max-w-[48ch] mt-7"
                style={{ textWrap: "pretty" as any }}
              >
                Manage contracts, commissions, P&amp;L, and pitches across every creator you represent — without a spreadsheet in sight. Role-based access, priced per creator.
              </p>

              <div className="mt-7 flex gap-2.5 flex-wrap">
                <Link
                  href="/contact?topic=demo"
                  className="inline-flex items-center gap-2 bg-[#0F1E28] text-white px-4 py-2.5 rounded-[8px] text-[13.5px] font-medium hover:bg-[#1b2f3a] transition-colors"
                >
                  Book a demo →
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 bg-white text-[#1A2C38] border border-[#D8E8EE] px-4 py-2.5 rounded-[8px] text-[13.5px] font-medium hover:border-[#7BAFC8] hover:text-[#3D6E8A] transition-colors"
                >
                  Agency pricing
                </Link>
              </div>

              <div className="mt-8 pt-5 border-t border-[#D8E8EE] flex gap-6 flex-wrap font-mono text-[11.5px] text-[#8AAABB] tracking-wider">
                <span>3 to 50 creators</span>
                <span>Commission tracking</span>
                <span>Role-based access</span>
              </div>
            </div>

            {/* Roster device preview */}
            <div className="device">
              <div className="device-chrome">
                <div className="dots">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
                <div className="url">app.createsuite.co / roster</div>
                <div style={{ width: 36 }} />
              </div>
              <div className="p-4">
                <div className="eyebrow mb-2.5">Roster · Q2 2026</div>
                <div className="grid grid-cols-3 gap-px bg-[#D8E8EE] border border-[#D8E8EE] rounded-[10px] overflow-hidden mb-3">
                  {[
                    { l: "Pipeline", v: "$1.82M", d: "▲ 18%" },
                    { l: "Booked", v: "$847k", d: "YTD" },
                    { l: "Commission", v: "$169k", d: "projected" },
                  ].map((k) => (
                    <div key={k.l} className="bg-white px-3 py-2.5 flex flex-col gap-0.5">
                      <span className="font-mono text-[9px] tracking-widest text-[#8AAABB] uppercase">
                        {k.l}
                      </span>
                      <span className="font-serif text-[22px] tracking-[-0.02em] leading-none text-[#0F1E28]">
                        {k.v}
                      </span>
                      <span className="font-mono text-[10px] text-[#3D7A58]">{k.d}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex flex-col gap-1.5">
                  {rosterSample.map((r) => (
                    <div
                      key={r.n}
                      className="grid grid-cols-[28px_1fr_auto_auto] gap-3 items-center px-3 py-2 bg-[#F4F1EA] rounded-lg"
                    >
                      <span
                        className="w-6 h-6 rounded-full text-white text-[10px] font-medium inline-flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #7BAFC8, #3D6E8A)" }}
                      >
                        {r.n
                          .split(" ")
                          .map((p) => p[0])
                          .join("")}
                      </span>
                      <div>
                        <div className="text-[12.5px] font-semibold">{r.n}</div>
                        <div className="text-[10.5px] text-[#8AAABB] font-mono">{r.c}</div>
                      </div>
                      <span className="font-serif text-[15px]">{r.v}</span>
                      <span className="w-[44px] h-[4px] bg-[#F2F8FB] rounded-full relative overflow-hidden">
                        <i
                          className="absolute left-0 top-0 bottom-0 bg-[#7BAFC8]"
                          style={{ width: `${r.pct}%` }}
                        />
                      </span>
                    </div>
                  ))}
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
            Run the roster <em className="italic text-[#7BAFC8]">without</em> the spreadsheet.
          </h2>
          <div className="flex gap-3 flex-wrap items-center">
            <Link
              href="/contact?topic=demo"
              className="inline-flex items-center gap-2 bg-white text-[#0F1E28] px-5 py-3 rounded-[8px] text-[14px] font-medium hover:bg-[#7BAFC8] hover:text-white transition-colors"
            >
              Book a demo →
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 bg-transparent text-white border px-5 py-3 rounded-[8px] text-[14px] font-medium hover:bg-white/10 transition-colors"
              style={{ borderColor: "rgba(255,255,255,.3)" }}
            >
              See agency pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
