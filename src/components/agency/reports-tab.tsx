"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { agencyRoster, agencyPipeline, commissionPayouts, campaigns } from "@/lib/placeholder-data";
import { formatCurrency } from "@/lib/utils";
import { Download, FileText, BarChart3, Users, DollarSign } from "lucide-react";

type ReportType = "overview" | "creator" | "brand" | "commission";

const reportTypes: { key: ReportType; label: string; icon: typeof BarChart3; desc: string }[] = [
  { key: "overview", label: "Agency Overview", icon: BarChart3, desc: "Total pipeline, commissions, creator count, top performers" },
  { key: "creator", label: "Creator Performance", icon: Users, desc: "Select creators, compare metrics, export performance data" },
  { key: "brand", label: "Brand Report", icon: FileText, desc: "Client-facing campaign report with reach and deliverables" },
  { key: "commission", label: "Commission Report", icon: DollarSign, desc: "Monthly commission summary for accounting" },
];

export function ReportsTab() {
  const [activeReport, setActiveReport] = useState<ReportType | null>(null);

  const totalPipeline = agencyPipeline.reduce((s, d) => s + d.value, 0);
  const totalCommission = commissionPayouts.reduce((s, p) => s + p.amount, 0);
  const topCreator = agencyRoster.sort((a, b) => b.totalEarned - a.totalEarned)[0];

  return (
    <div>
      <PageHeader
        headline={<>Agency <em className="italic text-[#C4714A]">reports</em></>}
        subheading="Generate and export reports across your entire operation."
      />

      {!activeReport ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportTypes.map(r => (
            <button
              key={r.key}
              onClick={() => setActiveReport(r.key)}
              className="text-left bg-white border border-[#E5E0D8] rounded-[10px] p-5 hover:border-[#C4714A]/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="h-9 w-9 rounded-lg bg-[#F7F4EF] flex items-center justify-center">
                  <r.icon className="h-4 w-4 text-[#C4714A]" />
                </div>
                <span className="text-[15px] font-sans font-600 text-[#1C1714]">{r.label}</span>
              </div>
              <p className="text-[12px] font-sans text-[#9A9088]">{r.desc}</p>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button onClick={() => setActiveReport(null)} className="text-[13px] font-sans font-500 text-[#C4714A] hover:underline mb-6">
            ← Back to reports
          </button>

          {activeReport === "overview" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#9A9088]">AGENCY OVERVIEW</p>
                <button className="flex items-center gap-1.5 text-[12px] font-sans font-500 text-[#C4714A] hover:underline"><Download className="h-3.5 w-3.5" /> Export PDF</button>
              </div>
              <div className="bg-white border border-[#E5E0D8] rounded-[10px] p-6">
                <h3 className="text-[20px] font-serif text-[#1C1714] mb-4">Bright Talent Mgmt — <em className="italic text-[#C4714A]">Q2 2026</em></h3>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Pipeline Value", value: formatCurrency(totalPipeline) },
                    { label: "Total Commission", value: formatCurrency(totalCommission) },
                    { label: "Active Creators", value: String(agencyRoster.length) },
                    { label: "Active Deals", value: String(agencyPipeline.length) },
                  ].map(s => (
                    <div key={s.label} className="bg-[#F7F4EF] rounded-lg p-3">
                      <p className="text-[10px] font-sans uppercase tracking-[1.5px] text-[#9A9088] mb-1">{s.label}</p>
                      <p className="text-[22px] font-serif text-[#1C1714]">{s.value}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#9A9088] mb-2">TOP PERFORMER</p>
                    <p className="text-[15px] font-sans font-600 text-[#1C1714]">{topCreator.name}</p>
                    <p className="text-[13px] font-serif text-[#C4714A]">{formatCurrency(topCreator.totalEarned)} lifetime</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#9A9088] mb-2">AVG DEAL SIZE</p>
                    <p className="text-[22px] font-serif text-[#1C1714]">{formatCurrency(totalPipeline / agencyPipeline.length)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeReport === "creator" && (
            <div>
              <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#9A9088] mb-4">CREATOR COMPARISON</p>
              <div className="bg-white border border-[#E5E0D8] rounded-[10px] overflow-hidden">
                <div className="grid grid-cols-7 gap-4 px-5 py-3 text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#9A9088] border-b border-[#E5E0D8]">
                  <span>Creator</span><span>Total Earned</span><span>Avg Deal</span><span>Completed</span><span>Active</span><span>Health</span><span>Repeat %</span>
                </div>
                {agencyRoster.map(c => (
                  <div key={c.id} className="grid grid-cols-7 gap-4 px-5 py-3.5 items-center border-b border-[#E5E0D8] last:border-b-0">
                    <span className="text-[13px] font-sans font-500 text-[#1C1714]">{c.name}</span>
                    <span className="text-[14px] font-serif text-[#1C1714]">{formatCurrency(c.totalEarned)}</span>
                    <span className="text-[13px] font-serif text-[#9A9088]">{formatCurrency(c.avgDealValue)}</span>
                    <span className="text-[13px] font-sans text-[#1C1714]">{c.dealsCompleted}</span>
                    <span className="text-[13px] font-sans text-[#1C1714]">{c.dealsActive}</span>
                    <div className="flex items-center gap-1.5">
                      <div className={`h-2 w-2 rounded-full ${c.healthScore >= 80 ? "bg-[#4A9060]" : c.healthScore >= 60 ? "bg-[#D4A030]" : "bg-[#E05C3A]"}`} />
                      <span className="text-[12px] font-sans text-[#9A9088]">{c.healthScore}</span>
                    </div>
                    <span className="text-[13px] font-sans text-[#9A9088]">{c.repeatBrandRate}%</span>
                  </div>
                ))}
              </div>
              <button className="mt-4 flex items-center gap-1.5 text-[12px] font-sans font-500 text-[#C4714A] hover:underline"><Download className="h-3.5 w-3.5" /> Export CSV</button>
            </div>
          )}

          {activeReport === "brand" && (
            <div>
              <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#9A9088] mb-4">BRAND REPORT — SELECT A CAMPAIGN</p>
              <div className="space-y-3">
                {campaigns.map(c => (
                  <div key={c.id} className="bg-white border border-[#E5E0D8] rounded-[10px] p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[15px] font-sans font-600 text-[#1C1714]">{c.name}</h4>
                      <button className="flex items-center gap-1.5 text-[12px] font-sans font-500 text-[#C4714A] hover:underline"><Download className="h-3.5 w-3.5" /> Export</button>
                    </div>
                    <p className="text-[12px] font-sans text-[#9A9088] mb-3">{c.brand} · {c.creators.length} creators · {formatCurrency(c.budget)} budget</p>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-[#F7F4EF] rounded-lg p-2.5"><p className="text-[10px] font-sans uppercase tracking-[1px] text-[#9A9088]">Budget</p><p className="text-[14px] font-serif text-[#1C1714]">{formatCurrency(c.budget)}</p></div>
                      <div className="bg-[#F7F4EF] rounded-lg p-2.5"><p className="text-[10px] font-sans uppercase tracking-[1px] text-[#9A9088]">Creators</p><p className="text-[14px] font-serif text-[#1C1714]">{c.creators.length}</p></div>
                      <div className="bg-[#F7F4EF] rounded-lg p-2.5"><p className="text-[10px] font-sans uppercase tracking-[1px] text-[#9A9088]">Completion</p><p className="text-[14px] font-serif text-[#1C1714]">{c.completionPct}%</p></div>
                      <div className="bg-[#F7F4EF] rounded-lg p-2.5"><p className="text-[10px] font-sans uppercase tracking-[1px] text-[#9A9088]">Commission</p><p className="text-[14px] font-serif text-[#4A9060]">{formatCurrency(c.agencyCommission)}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeReport === "commission" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#9A9088]">COMMISSION SUMMARY — APRIL 2026</p>
                <button className="flex items-center gap-1.5 text-[12px] font-sans font-500 text-[#C4714A] hover:underline"><Download className="h-3.5 w-3.5" /> Export PDF</button>
              </div>
              <div className="bg-white border border-[#E5E0D8] rounded-[10px] overflow-hidden">
                <div className="grid grid-cols-5 gap-4 px-5 py-3 text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#9A9088] border-b border-[#E5E0D8]">
                  <span>Creator</span><span>Deal</span><span>Deal Value</span><span>Rate</span><span className="text-right">Commission</span>
                </div>
                {commissionPayouts.map(p => (
                  <div key={p.id} className="grid grid-cols-5 gap-4 px-5 py-3.5 items-center border-b border-[#E5E0D8] last:border-b-0">
                    <span className="text-[13px] font-sans font-500 text-[#1C1714]">{p.creator}</span>
                    <span className="text-[12px] font-sans text-[#9A9088]">{p.deal}</span>
                    <span className="text-[14px] font-serif text-[#1C1714]">{formatCurrency(p.dealValue)}</span>
                    <span className="text-[12px] font-sans text-[#9A9088]">{p.rate}%</span>
                    <span className="text-[14px] font-serif text-[#4A9060] text-right">{formatCurrency(p.amount)}</span>
                  </div>
                ))}
                <div className="grid grid-cols-5 gap-4 px-5 py-3 bg-[#F7F4EF] border-t border-[#E5E0D8]">
                  <span className="text-[12px] font-sans font-600 text-[#1C1714] col-span-4">Total</span>
                  <span className="text-[16px] font-serif text-[#4A9060] text-right">{formatCurrency(commissionPayouts.reduce((s, p) => s + p.amount, 0))}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
