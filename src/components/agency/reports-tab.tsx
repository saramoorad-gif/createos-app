"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useSupabaseQuery } from "@/lib/hooks";
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

  const { data: agencyRoster, loading: rosterLoading } = useSupabaseQuery<any>("agency_creator_links");
  const { data: agencyPipeline, loading: pipelineLoading } = useSupabaseQuery<any>("deals");
  const { data: commissionPayouts, loading: commissionsLoading } = useSupabaseQuery<any>("commission_payouts");
  const { data: campaigns, loading: campaignsLoading } = useSupabaseQuery<any>("campaigns");

  const loading = rosterLoading || pipelineLoading || commissionsLoading || campaignsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#D8E8EE] border-t-[#7BAFC8]" />
      </div>
    );
  }

  const totalPipeline = agencyPipeline.reduce((s: number, d: any) => s + (d.value || 0), 0);
  const totalCommission = commissionPayouts.reduce((s: number, p: any) => s + (p.amount || 0), 0);
  const sortedRoster = [...agencyRoster].sort((a: any, b: any) => (b.totalEarned || 0) - (a.totalEarned || 0));
  const topCreator = sortedRoster[0];

  return (
    <div>
      <PageHeader
        headline={<>Agency <em className="italic text-[#7BAFC8]">reports</em></>}
        subheading="Generate and export reports across your entire operation."
      />

      {!activeReport ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agencyRoster.length === 0 && agencyPipeline.length === 0 && commissionPayouts.length === 0 && campaigns.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <p className="font-serif italic text-[16px] text-[#8AAABB] mb-4">No data available for reports yet</p>
            </div>
          )}
          {reportTypes.map(r => (
            <button
              key={r.key}
              onClick={() => setActiveReport(r.key)}
              className="text-left bg-white border border-[#D8E8EE] rounded-[10px] p-5 hover:border-[#7BAFC8]/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="h-9 w-9 rounded-lg bg-[#FAF8F4] flex items-center justify-center">
                  <r.icon className="h-4 w-4 text-[#7BAFC8]" />
                </div>
                <span className="text-[15px] font-sans font-600 text-[#1A2C38]">{r.label}</span>
              </div>
              <p className="text-[12px] font-sans text-[#8AAABB]">{r.desc}</p>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button onClick={() => setActiveReport(null)} className="text-[13px] font-sans font-500 text-[#7BAFC8] hover:underline mb-6">
            ← Back to reports
          </button>

          {activeReport === "overview" && (
            agencyPipeline.length === 0 && agencyRoster.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <p className="font-serif italic text-[16px] text-[#8AAABB]">No data available for this report yet.</p>
              </div>
            ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#8AAABB]">AGENCY OVERVIEW</p>
                <button onClick={() => window.print()} className="flex items-center gap-1.5 text-[12px] font-sans font-500 text-[#7BAFC8] hover:underline"><Download className="h-3.5 w-3.5" /> Export PDF</button>
              </div>
              <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-6">
                <h3 className="text-[20px] font-serif text-[#1A2C38] mb-4">Bright Talent Mgmt — <em className="italic text-[#7BAFC8]">Q2 2026</em></h3>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Pipeline Value", value: formatCurrency(totalPipeline) },
                    { label: "Total Commission", value: formatCurrency(totalCommission) },
                    { label: "Active Creators", value: String(agencyRoster.length) },
                    { label: "Active Deals", value: String(agencyPipeline.length) },
                  ].map(s => (
                    <div key={s.label} className="bg-[#FAF8F4] rounded-lg p-3">
                      <p className="text-[10px] font-sans uppercase tracking-[1.5px] text-[#8AAABB] mb-1">{s.label}</p>
                      <p className="text-[22px] font-serif text-[#1A2C38]">{s.value}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#8AAABB] mb-2">TOP PERFORMER</p>
                    <p className="text-[15px] font-sans font-600 text-[#1A2C38]">{topCreator?.name || "—"}</p>
                    <p className="text-[13px] font-serif text-[#7BAFC8]">{formatCurrency(topCreator?.totalEarned || 0)} lifetime</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#8AAABB] mb-2">AVG DEAL SIZE</p>
                    <p className="text-[22px] font-serif text-[#1A2C38]">{formatCurrency(agencyPipeline.length > 0 ? totalPipeline / agencyPipeline.length : 0)}</p>
                  </div>
                </div>
              </div>
            </div>
            )
          )}

          {activeReport === "creator" && (
            agencyRoster.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <p className="font-serif italic text-[16px] text-[#8AAABB]">No data available for this report yet.</p>
              </div>
            ) : (
            <div>
              <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#8AAABB] mb-4">CREATOR COMPARISON</p>
              <div className="bg-white border border-[#D8E8EE] rounded-[10px] overflow-hidden">
                <div className="grid grid-cols-7 gap-4 px-5 py-3 text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#8AAABB] border-b border-[#D8E8EE]">
                  <span>Creator</span><span>Total Earned</span><span>Avg Deal</span><span>Completed</span><span>Active</span><span>Health</span><span>Repeat %</span>
                </div>
                {agencyRoster.map((c: any) => (
                  <div key={c.id} className="grid grid-cols-7 gap-4 px-5 py-3.5 items-center border-b border-[#D8E8EE] last:border-b-0">
                    <span className="text-[13px] font-sans font-500 text-[#1A2C38]">{c.name}</span>
                    <span className="text-[14px] font-serif text-[#1A2C38]">{formatCurrency(c.totalEarned)}</span>
                    <span className="text-[13px] font-serif text-[#8AAABB]">{formatCurrency(c.avgDealValue)}</span>
                    <span className="text-[13px] font-sans text-[#1A2C38]">{c.dealsCompleted}</span>
                    <span className="text-[13px] font-sans text-[#1A2C38]">{c.dealsActive}</span>
                    <div className="flex items-center gap-1.5">
                      <div className={`h-2 w-2 rounded-full ${c.healthScore >= 80 ? "bg-[#3D7A58]" : c.healthScore >= 60 ? "bg-[#A07830]" : "bg-[#A03D3D]"}`} />
                      <span className="text-[12px] font-sans text-[#8AAABB]">{c.healthScore}</span>
                    </div>
                    <span className="text-[13px] font-sans text-[#8AAABB]">{c.repeatBrandRate}%</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  const headers = ["Creator", "Total Earned", "Avg Deal", "Completed", "Active", "Health", "Repeat %"];
                  const rows = agencyRoster.map((c: any) => [c.name, c.totalEarned, c.avgDealValue, c.dealsCompleted, c.dealsActive, c.healthScore, `${c.repeatBrandRate}%`]);
                  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "creator-performance.csv";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="mt-4 flex items-center gap-1.5 text-[12px] font-sans font-500 text-[#7BAFC8] hover:underline"
              ><Download className="h-3.5 w-3.5" /> Export CSV</button>
            </div>
            )
          )}

          {activeReport === "brand" && (
            campaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <p className="font-serif italic text-[16px] text-[#8AAABB]">No data available for this report yet.</p>
              </div>
            ) : (
            <div>
              <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#8AAABB] mb-4">BRAND REPORT — SELECT A CAMPAIGN</p>
              <div className="space-y-3">
                {campaigns.map((c: any) => (
                  <div key={c.id} className="bg-white border border-[#D8E8EE] rounded-[10px] p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[15px] font-sans font-600 text-[#1A2C38]">{c.name}</h4>
                      <button onClick={() => window.print()} className="flex items-center gap-1.5 text-[12px] font-sans font-500 text-[#7BAFC8] hover:underline"><Download className="h-3.5 w-3.5" /> Export</button>
                    </div>
                    <p className="text-[12px] font-sans text-[#8AAABB] mb-3">{c.brand} · {c.creators.length} creators · {formatCurrency(c.budget)} budget</p>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-[#FAF8F4] rounded-lg p-2.5"><p className="text-[10px] font-sans uppercase tracking-[1px] text-[#8AAABB]">Budget</p><p className="text-[14px] font-serif text-[#1A2C38]">{formatCurrency(c.budget)}</p></div>
                      <div className="bg-[#FAF8F4] rounded-lg p-2.5"><p className="text-[10px] font-sans uppercase tracking-[1px] text-[#8AAABB]">Creators</p><p className="text-[14px] font-serif text-[#1A2C38]">{c.creators.length}</p></div>
                      <div className="bg-[#FAF8F4] rounded-lg p-2.5"><p className="text-[10px] font-sans uppercase tracking-[1px] text-[#8AAABB]">Completion</p><p className="text-[14px] font-serif text-[#1A2C38]">{c.completionPct}%</p></div>
                      <div className="bg-[#FAF8F4] rounded-lg p-2.5"><p className="text-[10px] font-sans uppercase tracking-[1px] text-[#8AAABB]">Commission</p><p className="text-[14px] font-serif text-[#3D7A58]">{formatCurrency(c.agencyCommission)}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )
          )}

          {activeReport === "commission" && (
            commissionPayouts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <p className="font-serif italic text-[16px] text-[#8AAABB]">No data available for this report yet.</p>
              </div>
            ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#8AAABB]">COMMISSION SUMMARY — APRIL 2026</p>
                <button onClick={() => window.print()} className="flex items-center gap-1.5 text-[12px] font-sans font-500 text-[#7BAFC8] hover:underline"><Download className="h-3.5 w-3.5" /> Export PDF</button>
              </div>
              <div className="bg-white border border-[#D8E8EE] rounded-[10px] overflow-hidden">
                <div className="grid grid-cols-5 gap-4 px-5 py-3 text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#8AAABB] border-b border-[#D8E8EE]">
                  <span>Creator</span><span>Deal</span><span>Deal Value</span><span>Rate</span><span className="text-right">Commission</span>
                </div>
                {commissionPayouts.map((p: any) => (
                  <div key={p.id} className="grid grid-cols-5 gap-4 px-5 py-3.5 items-center border-b border-[#D8E8EE] last:border-b-0">
                    <span className="text-[13px] font-sans font-500 text-[#1A2C38]">{p.creator}</span>
                    <span className="text-[12px] font-sans text-[#8AAABB]">{p.deal}</span>
                    <span className="text-[14px] font-serif text-[#1A2C38]">{formatCurrency(p.dealValue)}</span>
                    <span className="text-[12px] font-sans text-[#8AAABB]">{p.rate}%</span>
                    <span className="text-[14px] font-serif text-[#3D7A58] text-right">{formatCurrency(p.amount)}</span>
                  </div>
                ))}
                <div className="grid grid-cols-5 gap-4 px-5 py-3 bg-[#FAF8F4] border-t border-[#D8E8EE]">
                  <span className="text-[12px] font-sans font-600 text-[#1A2C38] col-span-4">Total</span>
                  <span className="text-[16px] font-serif text-[#3D7A58] text-right">{formatCurrency(commissionPayouts.reduce((s: number, p: any) => s + p.amount, 0))}</span>
                </div>
              </div>
            </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
