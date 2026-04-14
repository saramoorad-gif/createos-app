"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useSupabaseQuery } from "@/lib/hooks";
import { formatCurrency } from "@/lib/utils";
import { Download, FileText, BarChart3, Users, DollarSign, TrendingUp, CalendarDays } from "lucide-react";
import { useToast } from "@/components/global/toast";
import { TableSkeleton } from "@/components/global/skeleton";

type ReportType = "overview" | "creator" | "brand" | "commission" | "pnl" | "comparison" | "annual";

const reportTypes: { key: ReportType; label: string; icon: typeof BarChart3; desc: string }[] = [
  { key: "overview", label: "Agency Overview", icon: BarChart3, desc: "Total pipeline, commissions, creator count, top performers" },
  { key: "creator", label: "Creator Performance", icon: Users, desc: "Select creators, compare metrics, export performance data" },
  { key: "brand", label: "Brand Report", icon: FileText, desc: "Client-facing campaign report with reach and deliverables" },
  { key: "commission", label: "Commission Report", icon: DollarSign, desc: "Monthly commission summary for accounting" },
  { key: "pnl", label: "Agency P&L", icon: TrendingUp, desc: "Total roster earnings, commissions, net agency income with date ranges" },
  { key: "comparison", label: "Creator Comparison", icon: Users, desc: "Side-by-side comparison of 2-5 selected creators with export" },
  { key: "annual", label: "Annual Summary", icon: CalendarDays, desc: "Full year breakdown by month, creator, and brand with chart" },
];

// ---------------------------------------------------------------------------
// Agency P&L Report
// ---------------------------------------------------------------------------
type PnLRange = "this_month" | "last_month" | "this_quarter" | "this_year";

function AgencyPnLReport({ agencyRoster, agencyPipeline, commissionPayouts }: { agencyRoster: any[]; agencyPipeline: any[]; commissionPayouts: any[] }) {
  const [range, setRange] = useState<PnLRange>("this_month");
  const { toast } = useToast();

  const now = new Date();
  const filterByRange = (dateStr: string) => {
    if (!dateStr) return true;
    const d = new Date(dateStr);
    switch (range) {
      case "this_month": return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      case "last_month": {
        const lm = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const ly = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        return d.getMonth() === lm && d.getFullYear() === ly;
      }
      case "this_quarter": {
        const q = Math.floor(now.getMonth() / 3);
        const dq = Math.floor(d.getMonth() / 3);
        return dq === q && d.getFullYear() === now.getFullYear();
      }
      case "this_year": return d.getFullYear() === now.getFullYear();
      default: return true;
    }
  };

  const filteredDeals = agencyPipeline.filter((d: any) => filterByRange(d.created_at || d.startDate));
  const filteredCommissions = commissionPayouts.filter((p: any) => filterByRange(p.paid_at || p.created_at));

  const totalEarnings = filteredDeals.reduce((s: number, d: any) => s + (d.value || 0), 0);
  const totalCommission = filteredCommissions.reduce((s: number, p: any) => s + (p.amount || 0), 0);
  const netIncome = totalCommission; // Commission is the agency income

  // Build month breakdown
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyBreakdown = months.map((m, i) => {
    const monthDeals = agencyPipeline.filter((d: any) => {
      const dt = new Date(d.created_at || d.startDate);
      return dt.getMonth() === i && dt.getFullYear() === now.getFullYear();
    });
    const monthCommissions = commissionPayouts.filter((p: any) => {
      const dt = new Date(p.paid_at || p.created_at);
      return dt.getMonth() === i && dt.getFullYear() === now.getFullYear();
    });
    return {
      month: m,
      earnings: monthDeals.reduce((s: number, d: any) => s + (d.value || 0), 0),
      commissions: monthCommissions.reduce((s: number, p: any) => s + (p.amount || 0), 0),
    };
  });

  const rangeLabels: Record<PnLRange, string> = {
    this_month: "This Month",
    last_month: "Last Month",
    this_quarter: "This Quarter",
    this_year: "This Year",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#8AAABB]">AGENCY P&L</p>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {(Object.keys(rangeLabels) as PnLRange[]).map(r => (
              <button key={r} onClick={() => setRange(r)} className={`px-2.5 py-1 text-[10px] font-sans font-500 rounded-full ${range === r ? "bg-[#1A2C38] text-[#FAF8F4]" : "text-[#8AAABB] hover:bg-[#F2F8FB]"}`}>
                {rangeLabels[r]}
              </button>
            ))}
          </div>
          <button onClick={() => { window.print(); toast("info", "Report exported"); }} className="flex items-center gap-1.5 text-[12px] font-sans font-500 text-[#7BAFC8] hover:underline"><Download className="h-3.5 w-3.5" /> Export PDF</button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-5">
          <p className="text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#8AAABB] mb-1">Total Roster Earnings</p>
          <p className="text-[22px] font-serif text-[#1A2C38]">{formatCurrency(totalEarnings)}</p>
        </div>
        <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-5">
          <p className="text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#8AAABB] mb-1">Total Commissions</p>
          <p className="text-[22px] font-serif text-[#3D7A58]">{formatCurrency(totalCommission)}</p>
        </div>
        <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-5">
          <p className="text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#8AAABB] mb-1">Net Agency Income</p>
          <p className="text-[22px] font-serif text-[#1E3F52]">{formatCurrency(netIncome)}</p>
        </div>
      </div>

      {/* Monthly breakdown table */}
      <div className="bg-white border border-[#D8E8EE] rounded-[10px] overflow-hidden">
        <div className="grid grid-cols-4 gap-4 px-5 py-3 text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#8AAABB] border-b border-[#D8E8EE]">
          <span>Month</span><span>Roster Earnings</span><span>Commissions</span><span className="text-right">Net</span>
        </div>
        {monthlyBreakdown.filter(m => m.earnings > 0 || m.commissions > 0).map(m => (
          <div key={m.month} className="grid grid-cols-4 gap-4 px-5 py-3 items-center border-b border-[#D8E8EE] last:border-b-0">
            <span className="text-[13px] font-sans font-500 text-[#1A2C38]">{m.month}</span>
            <span className="text-[14px] font-serif text-[#1A2C38]">{formatCurrency(m.earnings)}</span>
            <span className="text-[14px] font-serif text-[#3D7A58]">{formatCurrency(m.commissions)}</span>
            <span className="text-[14px] font-serif text-[#1E3F52] text-right">{formatCurrency(m.commissions)}</span>
          </div>
        ))}
        {monthlyBreakdown.every(m => m.earnings === 0 && m.commissions === 0) && (
          <div className="px-5 py-8 text-center">
            <p className="font-serif italic text-[14px] text-[#8AAABB]">No data for selected period</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Creator Comparison Report
// ---------------------------------------------------------------------------
function CreatorComparisonReport({ agencyRoster }: { agencyRoster: any[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { toast } = useToast();

  const toggleCreator = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  };

  const selected = agencyRoster.filter((c: any) => selectedIds.includes(c.id));

  const exportCsv = () => {
    const headers = ["Name", "Total Earned", "Avg Deal Value", "Deals Completed", "Health Score"];
    const rows = selected.map((c: any) => [c.name, c.totalEarned || 0, c.avgDealValue || 0, c.dealsCompleted || 0, c.healthScore || 0]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "creator-comparison.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast("info", "Report exported");
  };

  return (
    <div>
      <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#8AAABB] mb-4">CREATOR COMPARISON — SELECT 2-5 CREATORS</p>

      {/* Creator selection */}
      <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-4 mb-4">
        <div className="flex flex-wrap gap-2">
          {agencyRoster.map((c: any) => {
            const isSelected = selectedIds.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggleCreator(c.id)}
                className={`px-3 py-1.5 text-[12px] font-sans font-500 rounded-full border transition-colors ${
                  isSelected
                    ? "bg-[#1A2C38] text-[#FAF8F4] border-[#1A2C38]"
                    : "text-[#8AAABB] border-[#D8E8EE] hover:border-[#7BAFC8] hover:text-[#1A2C38]"
                } ${!isSelected && selectedIds.length >= 5 ? "opacity-40 cursor-not-allowed" : ""}`}
                disabled={!isSelected && selectedIds.length >= 5}
              >
                {c.name}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] font-sans text-[#8AAABB] mt-2">{selectedIds.length}/5 selected</p>
      </div>

      {/* Comparison table */}
      {selected.length >= 2 && (
        <>
          <div className="bg-white border border-[#D8E8EE] rounded-[10px] overflow-hidden mb-4">
            <div className="grid gap-4 px-5 py-3 text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#8AAABB] border-b border-[#D8E8EE]" style={{ gridTemplateColumns: `repeat(${selected.length + 1}, 1fr)` }}>
              <span>Metric</span>
              {selected.map((c: any) => <span key={c.id}>{c.name}</span>)}
            </div>
            {[
              { label: "Total Earned", key: "totalEarned", format: (v: number) => formatCurrency(v || 0) },
              { label: "Avg Deal Value", key: "avgDealValue", format: (v: number) => formatCurrency(v || 0) },
              { label: "Deals Completed", key: "dealsCompleted", format: (v: number) => String(v || 0) },
              { label: "Health Score", key: "healthScore", format: (v: number) => String(v || 0) },
            ].map(metric => (
              <div key={metric.label} className="grid gap-4 px-5 py-3 items-center border-b border-[#D8E8EE] last:border-b-0" style={{ gridTemplateColumns: `repeat(${selected.length + 1}, 1fr)` }}>
                <span className="text-[12px] font-sans font-500 text-[#8AAABB]">{metric.label}</span>
                {selected.map((c: any) => (
                  <span key={c.id} className="text-[14px] font-serif text-[#1A2C38]">{metric.format(c[metric.key])}</span>
                ))}
              </div>
            ))}
          </div>
          <button onClick={exportCsv} className="flex items-center gap-1.5 text-[12px] font-sans font-500 text-[#7BAFC8] hover:underline">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </>
      )}

      {selected.length < 2 && selectedIds.length > 0 && (
        <div className="bg-[#FAF8F4] rounded-[10px] p-6 text-center">
          <p className="text-[13px] font-sans text-[#8AAABB]">Select at least 2 creators to compare</p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Annual Summary Report
// ---------------------------------------------------------------------------
function AnnualSummaryReport({ agencyRoster, agencyPipeline, commissionPayouts }: { agencyRoster: any[]; agencyPipeline: any[]; commissionPayouts: any[] }) {
  const { toast } = useToast();
  const now = new Date();
  const year = now.getFullYear();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const monthlyData = useMemo(() => {
    return months.map((m, i) => {
      const monthDeals = agencyPipeline.filter((d: any) => {
        const dt = new Date(d.created_at || d.startDate);
        return dt.getMonth() === i && dt.getFullYear() === year;
      });
      return {
        month: m,
        earnings: monthDeals.reduce((s: number, d: any) => s + (d.value || 0), 0),
      };
    });
  }, [agencyPipeline, year]);

  const maxEarning = Math.max(...monthlyData.map(m => m.earnings), 1);

  // By creator
  const creatorTotals = agencyRoster.map((c: any) => ({
    name: c.name,
    total: c.totalEarned || 0,
  })).sort((a, b) => b.total - a.total);

  // By brand (from deals)
  const brandMap: Record<string, number> = {};
  agencyPipeline.forEach((d: any) => {
    const brand = d.brand || d.company || "Unknown";
    brandMap[brand] = (brandMap[brand] || 0) + (d.value || 0);
  });
  const brandTotals = Object.entries(brandMap).sort(([, a], [, b]) => b - a).map(([brand, total]) => ({ brand, total }));

  const totalYearEarnings = monthlyData.reduce((s, m) => s + m.earnings, 0);
  const totalCommissions = commissionPayouts.reduce((s: number, p: any) => s + (p.amount || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#8AAABB]">ANNUAL SUMMARY — {year}</p>
        <button onClick={() => { window.print(); toast("info", "Report exported"); }} className="flex items-center gap-1.5 text-[12px] font-sans font-500 text-[#7BAFC8] hover:underline"><Download className="h-3.5 w-3.5" /> Export PDF</button>
      </div>

      {/* Top-line stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-5">
          <p className="text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#8AAABB] mb-1">Total Earnings ({year})</p>
          <p className="text-[22px] font-serif text-[#1A2C38]">{formatCurrency(totalYearEarnings)}</p>
        </div>
        <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-5">
          <p className="text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#8AAABB] mb-1">Total Commissions</p>
          <p className="text-[22px] font-serif text-[#3D7A58]">{formatCurrency(totalCommissions)}</p>
        </div>
        <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-5">
          <p className="text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#8AAABB] mb-1">Active Creators</p>
          <p className="text-[22px] font-serif text-[#1A2C38]">{agencyRoster.length}</p>
        </div>
      </div>

      {/* 12-month bar chart */}
      <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-5 mb-6">
        <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#8AAABB] mb-4">MONTHLY EARNINGS</p>
        <div className="flex items-end gap-2 h-40">
          {monthlyData.map((m, i) => {
            const pct = maxEarning > 0 ? (m.earnings / maxEarning) * 100 : 0;
            const isCurrent = i === now.getMonth();
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] font-mono text-[#8AAABB]">
                  {m.earnings > 0 ? `${Math.round(m.earnings / 1000)}k` : ""}
                </span>
                <div className="w-full flex items-end" style={{ height: "120px" }}>
                  <div
                    className={`w-full rounded-t transition-all ${isCurrent ? "bg-[#7BAFC8]" : "bg-[#D8E8EE]"}`}
                    style={{ height: `${Math.max(pct, 2)}%` }}
                  />
                </div>
                <span className={`text-[10px] font-sans ${isCurrent ? "font-600 text-[#1A2C38]" : "text-[#8AAABB]"}`}>{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* By creator table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-[#D8E8EE] rounded-[10px] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#D8E8EE]">
            <p className="text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#8AAABB]">BY CREATOR</p>
          </div>
          {creatorTotals.length === 0 ? (
            <div className="px-5 py-6 text-center"><p className="text-[13px] font-sans text-[#8AAABB] italic">No data</p></div>
          ) : creatorTotals.map(c => (
            <div key={c.name} className="flex items-center justify-between px-5 py-3 border-b border-[#D8E8EE] last:border-b-0">
              <span className="text-[13px] font-sans font-500 text-[#1A2C38]">{c.name}</span>
              <span className="text-[14px] font-serif text-[#1A2C38]">{formatCurrency(c.total)}</span>
            </div>
          ))}
        </div>

        <div className="bg-white border border-[#D8E8EE] rounded-[10px] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#D8E8EE]">
            <p className="text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#8AAABB]">BY BRAND</p>
          </div>
          {brandTotals.length === 0 ? (
            <div className="px-5 py-6 text-center"><p className="text-[13px] font-sans text-[#8AAABB] italic">No data</p></div>
          ) : brandTotals.map(b => (
            <div key={b.brand} className="flex items-center justify-between px-5 py-3 border-b border-[#D8E8EE] last:border-b-0">
              <span className="text-[13px] font-sans font-500 text-[#1A2C38]">{b.brand}</span>
              <span className="text-[14px] font-serif text-[#1A2C38]">{formatCurrency(b.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ReportsTab() {
  const [activeReport, setActiveReport] = useState<ReportType | null>(null);

  const { data: agencyRoster, loading: rosterLoading } = useSupabaseQuery<any>("agency_creator_links");
  const { data: agencyPipeline, loading: pipelineLoading } = useSupabaseQuery<any>("deals");
  const { data: commissionPayouts, loading: commissionsLoading } = useSupabaseQuery<any>("commission_payouts");
  const { data: campaigns, loading: campaignsLoading } = useSupabaseQuery<any>("campaigns");

  const { toast } = useToast();
  const loading = rosterLoading || pipelineLoading || commissionsLoading || campaignsLoading;

  if (loading) {
    return <TableSkeleton rows={6} cols={5} />;
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
                <button onClick={() => { window.print(); toast("info", "Report exported"); }} className="flex items-center gap-1.5 text-[12px] font-sans font-500 text-[#7BAFC8] hover:underline"><Download className="h-3.5 w-3.5" /> Export PDF</button>
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
                      <button onClick={() => { window.print(); toast("info", "Report exported"); }} className="flex items-center gap-1.5 text-[12px] font-sans font-500 text-[#7BAFC8] hover:underline"><Download className="h-3.5 w-3.5" /> Export</button>
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
                <button onClick={() => { window.print(); toast("info", "Report exported"); }} className="flex items-center gap-1.5 text-[12px] font-sans font-500 text-[#7BAFC8] hover:underline"><Download className="h-3.5 w-3.5" /> Export PDF</button>
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

          {/* --- Agency P&L Report --- */}
          {activeReport === "pnl" && <AgencyPnLReport agencyRoster={agencyRoster} agencyPipeline={agencyPipeline} commissionPayouts={commissionPayouts} />}

          {/* --- Creator Comparison Report --- */}
          {activeReport === "comparison" && <CreatorComparisonReport agencyRoster={agencyRoster} />}

          {/* --- Annual Summary Report --- */}
          {activeReport === "annual" && <AnnualSummaryReport agencyRoster={agencyRoster} agencyPipeline={agencyPipeline} commissionPayouts={commissionPayouts} />}
        </div>
      )}
    </div>
  );
}
