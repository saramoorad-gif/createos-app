"use client";

import { PageHeader } from "@/components/layout/page-header";
import { commissionPayouts, agencyRoster } from "@/lib/placeholder-data";
import { formatCurrency } from "@/lib/utils";
import { Download, CheckCircle2 } from "lucide-react";

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  paid: { bg: "bg-[#EBF5EB]", text: "text-[#4A9060]", label: "Paid" },
  pending: { bg: "bg-[#FBF5EC]", text: "text-[#D4A030]", label: "Pending" },
  processing: { bg: "bg-[#F2EEE8]", text: "text-[#9A9088]", label: "Processing" },
};

export function CommissionsTab() {
  const earned = commissionPayouts.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const pending = commissionPayouts.filter(p => p.status === "pending" || p.status === "processing").reduce((s, p) => s + p.amount, 0);
  const ytd = commissionPayouts.reduce((s, p) => s + p.amount, 0);

  // Per-creator breakdown
  const creatorTotals = agencyRoster.map(c => {
    const total = commissionPayouts.filter(p => p.creatorId === c.id).reduce((s, p) => s + p.amount, 0);
    return { name: c.name, total, rate: c.commissionRate };
  }).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  const maxCreatorTotal = Math.max(...creatorTotals.map(c => c.total), 1);

  return (
    <div>
      <PageHeader
        headline={<>Commission <em className="italic text-[#C4714A]">tracker</em></>}
        subheading="Track earnings, payouts, and commission rates across your roster."
        stats={[
          { value: formatCurrency(earned), label: "Earned (paid)" },
          { value: formatCurrency(pending), label: "Pending" },
          { value: formatCurrency(ytd), label: "YTD total" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main — Payout table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#9A9088]">ALL PAYOUTS</p>
            <button className="flex items-center gap-1.5 text-[12px] font-sans font-500 text-[#C4714A] hover:underline">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
          </div>

          <div className="bg-white border border-[#E5E0D8] rounded-[10px] overflow-hidden">
            <div className="grid grid-cols-7 gap-4 px-5 py-3 text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#9A9088] border-b border-[#E5E0D8]">
              <span>Creator</span><span>Deal</span><span>Deal Value</span><span>Rate</span><span>Commission</span><span>Period</span><span>Status</span>
            </div>
            {commissionPayouts.map(p => {
              const s = statusStyles[p.status];
              return (
                <div key={p.id} className="grid grid-cols-7 gap-4 px-5 py-3.5 items-center border-b border-[#E5E0D8] last:border-b-0">
                  <span className="text-[13px] font-sans font-500 text-[#1C1714]">{p.creator}</span>
                  <span className="text-[12px] font-sans text-[#9A9088]">{p.deal}</span>
                  <span className="text-[13px] font-serif text-[#1C1714]">{formatCurrency(p.dealValue)}</span>
                  <span className="text-[12px] font-sans text-[#9A9088]">{p.rate}%</span>
                  <span className="text-[14px] font-serif text-[#4A9060]">{formatCurrency(p.amount)}</span>
                  <span className="text-[11px] font-mono text-[#9A9088]">{p.period}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-sans font-500 uppercase tracking-[1.5px] px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>{s.label}</span>
                    {p.status === "pending" && (
                      <button className="text-[#4A9060] hover:text-[#3a7a4a]" title="Mark paid"><CheckCircle2 className="h-3.5 w-3.5" /></button>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="grid grid-cols-7 gap-4 px-5 py-3 bg-[#F7F4EF] border-t border-[#E5E0D8]">
              <span className="text-[12px] font-sans font-600 text-[#1C1714] col-span-4">Total</span>
              <span className="text-[16px] font-serif text-[#4A9060]">{formatCurrency(ytd)}</span>
              <span className="col-span-2" />
            </div>
          </div>
        </div>

        {/* Sidebar — Per-creator breakdown */}
        <div>
          <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#9A9088] mb-4">BY CREATOR</p>
          <div className="bg-white border border-[#E5E0D8] rounded-[10px] p-5 space-y-4">
            {creatorTotals.map(c => (
              <div key={c.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-sans font-500 text-[#1C1714]">{c.name}</span>
                  <span className="text-[13px] font-serif text-[#4A9060]">{formatCurrency(c.total)}</span>
                </div>
                <div className="h-[6px] bg-[#F2EEE8] rounded-full overflow-hidden">
                  <div className="h-full bg-[#C4714A] rounded-full" style={{ width: `${(c.total / maxCreatorTotal) * 100}%` }} />
                </div>
                <p className="text-[11px] font-sans text-[#9A9088] mt-1">{c.rate}% rate</p>
              </div>
            ))}
          </div>

          <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#9A9088] mt-6 mb-4">RATE MANAGEMENT</p>
          <div className="bg-white border border-[#E5E0D8] rounded-[10px] p-5 space-y-3">
            {agencyRoster.slice(0, 4).map(c => (
              <div key={c.id} className="flex items-center justify-between">
                <span className="text-[13px] font-sans text-[#1C1714]">{c.name}</span>
                <div className="flex items-center gap-1">
                  <input type="number" defaultValue={c.commissionRate} className="w-14 text-right rounded-lg border border-[#E5E0D8] px-2 py-1 text-[13px] font-sans text-[#1C1714] focus:outline-none focus:border-[#C4714A]" />
                  <span className="text-[12px] font-sans text-[#9A9088]">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
