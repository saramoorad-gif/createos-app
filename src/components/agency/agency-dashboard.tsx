"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { formatCurrency } from "@/lib/utils";

type Tab = "pipeline" | "roster" | "commission";

const pipelineDeals = [
  { creator: "Brianna Cole", brand: "Mejuri", value: 3200, stage: "In Progress", due: "Apr 20", commission: 480, urgency: "medium" },
  { creator: "Brianna Cole", brand: "Aritzia", value: 4500, stage: "Negotiating", due: "—", commission: 675, urgency: "high" },
  { creator: "Maya Chen", brand: "Glossier", value: 2800, stage: "Contracted", due: "Apr 28", commission: 420, urgency: "low" },
  { creator: "Maya Chen", brand: "Summer Fridays", value: 1800, stage: "Pitched", due: "—", commission: 270, urgency: "low" },
  { creator: "Jordan Ellis", brand: "Oatly", value: 1500, stage: "In Progress", due: "May 1", commission: 225, urgency: "medium" },
  { creator: "Jordan Ellis", brand: "Notion", value: 2200, stage: "Delivered", due: "Apr 12", commission: 330, urgency: "low" },
];

const roster = [
  { name: "Brianna Cole", tier: "Influencer", activeDeals: 3, health: "green", earnings: 8240 },
  { name: "Maya Chen", tier: "UGC Creator", activeDeals: 2, health: "green", earnings: 4600 },
  { name: "Jordan Ellis", tier: "Influencer", activeDeals: 2, health: "amber", earnings: 3700 },
  { name: "Tara Washington", tier: "UGC Creator", activeDeals: 0, health: "red", earnings: 0 },
];

const urgencyColors: Record<string, string> = {
  high: "bg-[#E05C3A]",
  medium: "bg-[#D4A030]",
  low: "bg-[#4A9060]",
};

const healthColors: Record<string, string> = {
  green: "bg-[#4A9060]",
  amber: "bg-[#D4A030]",
  red: "bg-[#E05C3A]",
};

export function AgencyDashboard() {
  const [tab, setTab] = useState<Tab>("pipeline");

  const totalPipeline = pipelineDeals.reduce((s, d) => s + d.value, 0);
  const totalCommission = pipelineDeals.reduce((s, d) => s + d.commission, 0);

  const tabs: { key: Tab; label: string }[] = [
    { key: "pipeline", label: "Pipeline" },
    { key: "roster", label: "Roster" },
    { key: "commission", label: "Commission" },
  ];

  return (
    <div>
      <PageHeader
        headline={<>Agency <em className="italic text-[#C4714A]">overview</em></>}
        subheading="All active deals across your roster of creators."
        stats={[
          { value: String(pipelineDeals.length), label: "Active deals" },
          { value: String(roster.length), label: "Creators" },
          { value: formatCurrency(totalPipeline), label: "Pipeline value" },
          { value: formatCurrency(totalCommission), label: "Commission" },
        ]}
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1 text-[10px] font-sans font-500 uppercase tracking-[1.5px] rounded-full transition-colors ${
              tab === t.key ? "bg-[#1C1714] text-[#F7F4EF]" : "text-[#9A9088] hover:text-[#1C1714] hover:bg-[#F2EEE8]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Pipeline Tab */}
      {tab === "pipeline" && (
        <div className="bg-white border border-[#E5E0D8] rounded-[10px] overflow-hidden">
          <div className="grid grid-cols-6 gap-4 px-5 py-3 text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#9A9088] border-b border-[#E5E0D8]">
            <span>Creator</span><span>Brand</span><span>Value</span><span>Stage</span><span>Due</span><span className="text-right">Commission</span>
          </div>
          {pipelineDeals.map((deal, i) => (
            <div key={i} className="grid grid-cols-6 gap-4 px-5 py-3.5 items-center border-b border-[#E5E0D8] last:border-b-0">
              <div className="flex items-center gap-2">
                <div className={`w-[3px] h-8 rounded-full ${urgencyColors[deal.urgency]}`} />
                <span className="text-[13px] font-sans font-500 text-[#1C1714]">{deal.creator}</span>
              </div>
              <span className="text-[13px] font-sans text-[#1C1714]">{deal.brand}</span>
              <span className="text-[14px] font-serif text-[#1C1714]">{formatCurrency(deal.value)}</span>
              <span className="text-[10px] font-sans font-500 uppercase tracking-[1.5px] text-[#9A9088]">{deal.stage}</span>
              <span className="text-[11px] font-mono text-[#9A9088]">{deal.due}</span>
              <span className="text-[13px] font-sans font-500 text-[#4A9060] text-right">{formatCurrency(deal.commission)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Roster Tab */}
      {tab === "roster" && (
        <div className="bg-white border border-[#E5E0D8] rounded-[10px] overflow-hidden">
          <div className="grid grid-cols-6 gap-4 px-5 py-3 text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#9A9088] border-b border-[#E5E0D8]">
            <span>Creator</span><span>Tier</span><span>Active Deals</span><span>Health</span><span>Earnings</span><span className="text-right">Action</span>
          </div>
          {roster.map((c, i) => (
            <div key={i} className="grid grid-cols-6 gap-4 px-5 py-3.5 items-center border-b border-[#E5E0D8] last:border-b-0">
              <span className="text-[13px] font-sans font-500 text-[#1C1714]">{c.name}</span>
              <span className="text-[10px] font-sans font-500 uppercase tracking-[1.5px] px-2 py-0.5 rounded-full bg-[#F2EEE8] text-[#9A9088] w-fit">{c.tier}</span>
              <span className="text-[13px] font-sans text-[#1C1714]">{c.activeDeals}</span>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${healthColors[c.health]}`} />
              </div>
              <span className="text-[14px] font-serif text-[#1C1714]">{formatCurrency(c.earnings)}</span>
              <div className="text-right">
                <button className="text-[12px] font-sans font-500 text-[#C4714A] hover:underline">View →</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Commission Tab */}
      {tab === "commission" && (
        <div className="bg-white border border-[#E5E0D8] rounded-[10px] overflow-hidden">
          <div className="grid grid-cols-5 gap-4 px-5 py-3 text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#9A9088] border-b border-[#E5E0D8]">
            <span>Deal</span><span>Creator</span><span>Deal Value</span><span>Rate</span><span className="text-right">Commission</span>
          </div>
          {pipelineDeals.map((deal, i) => (
            <div key={i} className="grid grid-cols-5 gap-4 px-5 py-3.5 items-center border-b border-[#E5E0D8] last:border-b-0">
              <span className="text-[13px] font-sans font-500 text-[#1C1714]">{deal.brand}</span>
              <span className="text-[13px] font-sans text-[#9A9088]">{deal.creator}</span>
              <span className="text-[14px] font-serif text-[#1C1714]">{formatCurrency(deal.value)}</span>
              <span className="text-[12px] font-sans text-[#9A9088]">15%</span>
              <span className="text-[14px] font-serif text-[#4A9060] text-right">{formatCurrency(deal.commission)}</span>
            </div>
          ))}
          <div className="grid grid-cols-5 gap-4 px-5 py-3 bg-[#F7F4EF] border-t border-[#E5E0D8]">
            <span className="text-[12px] font-sans font-600 text-[#1C1714] col-span-4">Total</span>
            <span className="text-[16px] font-serif font-500 text-[#4A9060] text-right">{formatCurrency(totalCommission)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
