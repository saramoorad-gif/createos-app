"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";

type Platform = "tiktok" | "instagram" | "youtube";
type ContentType = "ugc_video" | "reel" | "static" | "story";
type UsageRights = "none" | "paid_ads" | "extended";
type ExclusivityDays = 0 | 30 | 60 | 90;

const contentTypeLabels: Record<ContentType, string> = {
  ugc_video: "UGC Video",
  reel: "Reel / Short",
  static: "Static Post",
  story: "Story",
};

const platformLabels: Record<Platform, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
};

function calculateRate(
  platform: Platform,
  contentType: ContentType,
  followers: number,
  engagementRate: number,
  usageRights: UsageRights,
  exclusivityDays: ExclusivityDays
) {
  const baseRatePer1K: Record<ContentType, number> = {
    ugc_video: 8,
    reel: 12,
    static: 5,
    story: 3,
  };

  const platformMult: Record<Platform, number> = {
    tiktok: 1.0,
    instagram: 1.15,
    youtube: 1.6,
  };

  const engMult = engagementRate > 5 ? 1.4 : engagementRate > 3 ? 1.15 : engagementRate > 1.5 ? 1.0 : 0.8;
  const usageMult = usageRights === "extended" ? 1.5 : usageRights === "paid_ads" ? 1.25 : 1.0;
  const exclMult = exclusivityDays === 90 ? 1.35 : exclusivityDays === 60 ? 1.2 : exclusivityDays === 30 ? 1.1 : 1.0;

  const followersInK = followers / 1000;
  const base = baseRatePer1K[contentType] * followersInK * platformMult[platform];
  const adjusted = base * engMult * usageMult * exclMult;

  const marketLow = Math.round(adjusted * 0.7);
  const marketHigh = Math.round(adjusted * 1.3);
  const yourRate = Math.round(adjusted);

  return {
    yourRate,
    marketLow,
    marketHigh,
    breakdown: {
      base: Math.round(base),
      engagementEffect: Math.round(base * (engMult - 1)),
      usageEffect: Math.round(base * engMult * (usageMult - 1)),
      exclusivityEffect: Math.round(base * engMult * usageMult * (exclMult - 1)),
    },
  };
}

function fmt(n: number) {
  return "$" + n.toLocaleString("en-US");
}

export default function RateCalculatorPage() {
  const [platform, setPlatform] = useState<Platform>("tiktok");
  const [contentType, setContentType] = useState<ContentType>("ugc_video");
  const [followers, setFollowers] = useState(142000);
  const [engagementRate, setEngagementRate] = useState(6.4);
  const [usageRights, setUsageRights] = useState<UsageRights>("none");
  const [exclusivity, setExclusivity] = useState<ExclusivityDays>(0);
  const [calculated, setCalculated] = useState(false);

  const result = calculateRate(platform, contentType, followers, engagementRate, usageRights, exclusivity);

  const rateCard = (["ugc_video", "reel", "static", "story"] as ContentType[]).map((ct) => {
    const r = calculateRate(platform, ct, followers, engagementRate, usageRights, exclusivity);
    return { type: ct, label: contentTypeLabels[ct], rate: r.yourRate };
  });

  const selectClass =
    "w-full rounded-[10px] border border-[#D8E8EE] bg-white px-3 py-2.5 text-[13px] font-sans text-[#1A2C38] focus:outline-none focus:ring-2 focus:ring-[#7BAFC8]/20 focus:border-[#7BAFC8]";
  const inputClass =
    "w-full rounded-[10px] border border-[#D8E8EE] bg-white px-3 py-2.5 text-[13px] font-sans text-[#1A2C38] focus:outline-none focus:ring-2 focus:ring-[#7BAFC8]/20 focus:border-[#7BAFC8]";

  return (
    <div>
      <PageHeader
        headline={<>Rate <em className="italic text-[#7BAFC8]">calculator</em></>}
        subheading="Calculate your rates based on platform, content type, and market data."
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left — Calculator Form */}
        <div className="space-y-6">
          <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-6">
            <p className="text-[10px] uppercase tracking-[3px] text-[#8AAABB] font-sans font-semibold mb-5">
              Calculate Your Rate
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-sans font-medium text-[#1A2C38] block mb-1.5">Platform</label>
                  <select className={selectClass} value={platform} onChange={(e) => setPlatform(e.target.value as Platform)}>
                    {Object.entries(platformLabels).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[12px] font-sans font-medium text-[#1A2C38] block mb-1.5">Content Type</label>
                  <select className={selectClass} value={contentType} onChange={(e) => setContentType(e.target.value as ContentType)}>
                    {Object.entries(contentTypeLabels).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-sans font-medium text-[#1A2C38] block mb-1.5">Follower Count</label>
                  <input type="number" className={inputClass} value={followers} onChange={(e) => setFollowers(Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-[12px] font-sans font-medium text-[#1A2C38] block mb-1.5">Engagement Rate (%)</label>
                  <input type="number" step="0.1" className={inputClass} value={engagementRate} onChange={(e) => setEngagementRate(Number(e.target.value))} />
                </div>
              </div>

              <div>
                <label className="text-[12px] font-sans font-medium text-[#1A2C38] block mb-1.5">Usage Rights</label>
                <select className={selectClass} value={usageRights} onChange={(e) => setUsageRights(e.target.value as UsageRights)}>
                  <option value="none">None — organic only</option>
                  <option value="paid_ads">Paid ads (+25%)</option>
                  <option value="extended">Extended / whitelisting (+50%)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-sans font-medium text-[#1A2C38] block mb-1.5">Exclusivity</label>
                  <select className={selectClass} value={exclusivity} onChange={(e) => setExclusivity(Number(e.target.value) as ExclusivityDays)}>
                    <option value={0}>None</option>
                    <option value={30}>30 days (+10%)</option>
                    <option value={60}>60 days (+20%)</option>
                    <option value={90}>90 days (+35%)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[12px] font-sans font-medium text-[#1A2C38] block mb-1.5">Category</label>
                  <input type="text" placeholder="e.g., Beauty" className={inputClass} />
                </div>
              </div>

              <button
                className="w-full bg-[#7BAFC8] text-white font-sans font-medium text-[13px] py-2.5 rounded-[10px] hover:bg-[#6AA0BB] transition-colors"
                onClick={() => setCalculated(true)}
              >
                Calculate Rate
              </button>
            </div>
          </div>

          {/* Results */}
          {calculated && (
            <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-6">
              <div className="text-center mb-4">
                <p className="text-[10px] uppercase tracking-[3px] text-[#8AAABB] font-sans font-semibold mb-2">Your Rate</p>
                <p className="text-[36px] font-serif text-[#7BAFC8]">{fmt(result.yourRate)}</p>
              </div>

              {/* Market range bar */}
              <div className="relative pt-6 pb-3 mb-4">
                <div className="h-2 rounded-full bg-gradient-to-r from-[#D8E8EE] via-[#7BAFC8]/30 to-[#7BAFC8]/50 relative">
                  {(() => {
                    const range = result.marketHigh - result.marketLow;
                    const pos = range > 0 ? ((result.yourRate - result.marketLow) / range) * 100 : 50;
                    const clamped = Math.max(5, Math.min(95, pos));
                    return (
                      <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#7BAFC8] border-2 border-white shadow" style={{ left: `${clamped}%` }} />
                    );
                  })()}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[11px] font-mono text-[#8AAABB]">{fmt(result.marketLow)}</span>
                  <span className="text-[11px] font-mono text-[#8AAABB]">{fmt(result.marketHigh)}</span>
                </div>
              </div>

              <div className="border-t border-[#D8E8EE] pt-4">
                <p className="text-[10px] uppercase tracking-[3px] text-[#8AAABB] font-sans font-semibold mb-3">Breakdown</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-[13px] font-sans">
                    <span className="text-[#8AAABB]">Base rate</span>
                    <span className="text-[#1A2C38] font-medium">{fmt(result.breakdown.base)}</span>
                  </div>
                  {result.breakdown.engagementEffect !== 0 && (
                    <div className="flex justify-between text-[13px] font-sans">
                      <span className="text-[#8AAABB]">Engagement bonus</span>
                      <span className="text-emerald-600 font-medium">+{fmt(result.breakdown.engagementEffect)}</span>
                    </div>
                  )}
                  {result.breakdown.usageEffect !== 0 && (
                    <div className="flex justify-between text-[13px] font-sans">
                      <span className="text-[#8AAABB]">Usage rights premium</span>
                      <span className="text-amber-600 font-medium">+{fmt(result.breakdown.usageEffect)}</span>
                    </div>
                  )}
                  {result.breakdown.exclusivityEffect !== 0 && (
                    <div className="flex justify-between text-[13px] font-sans">
                      <span className="text-[#8AAABB]">Exclusivity premium</span>
                      <span className="text-purple-600 font-medium">+{fmt(result.breakdown.exclusivityEffect)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right — Rate Card */}
        <div className="bg-white border border-[#D8E8EE] rounded-[10px] overflow-hidden h-fit">
          <div className="bg-gradient-to-r from-[#7BAFC8] to-[#D4956F] px-5 py-4">
            <p className="text-[15px] font-serif font-medium text-white">
              Brianna Cole — {platformLabels[platform]}
            </p>
            <p className="text-[12px] font-sans text-white/70 mt-0.5">
              {(followers / 1000).toFixed(0)}K followers &middot; {engagementRate}% engagement
            </p>
          </div>

          <div>
            {rateCard.map((item, i) => (
              <div
                key={item.type}
                className={`flex items-center justify-between px-5 py-3.5 ${
                  i < rateCard.length - 1 ? "border-b border-[#D8E8EE]" : ""
                }`}
              >
                <span className="text-[13px] font-sans text-[#1A2C38]">{item.label}</span>
                <span className="text-[15px] font-serif font-medium text-[#7BAFC8]">{fmt(item.rate)}</span>
              </div>
            ))}
          </div>

          <div className="bg-[#FAF8F4] px-5 py-3 text-[11px] font-sans text-[#8AAABB] space-y-0.5">
            {usageRights !== "none" && (
              <p>* Includes {usageRights === "paid_ads" ? "paid ads" : "extended/whitelisting"} rights</p>
            )}
            {exclusivity > 0 && <p>* Includes {exclusivity}-day exclusivity</p>}
            <p>Rates subject to campaign scope and deliverables.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
