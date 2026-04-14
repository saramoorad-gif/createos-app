"use client";

import { PageHeader } from "@/components/layout/page-header";
import { useSupabaseQuery, useSupabaseMutation } from "@/lib/hooks";
import { formatCurrency } from "@/lib/utils";
import { Download, CheckCircle2 } from "lucide-react";

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  paid: { bg: "bg-[#E8F4EE]", text: "text-[#3D7A58]", label: "Paid" },
  pending: { bg: "bg-[#F4EEE0]", text: "text-[#A07830]", label: "Pending" },
  processing: { bg: "bg-[#F2F8FB]", text: "text-[#8AAABB]", label: "Processing" },
};

export function CommissionsTab() {
  const { data: commissionPayouts, loading, setData: setPayouts } = useSupabaseQuery<any>("commission_payouts");
  const { data: agencyRoster, setData: setRoster } = useSupabaseQuery<any>("agency_creator_links");
  const { update: updatePayout } = useSupabaseMutation("commission_payouts");
  const { update: updateCreatorLink } = useSupabaseMutation("agency_creator_links");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#D8E8EE] border-t-[#7BAFC8]" />
      </div>
    );
  }

  if (!loading && commissionPayouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="font-serif italic text-[16px] text-[#8AAABB] mb-4">No commissions tracked yet</p>
        <p className="text-[13px] text-[#8AAABB]">Commissions are calculated automatically when deals are completed.</p>
      </div>
    );
  }

  const earned = commissionPayouts.filter((p: any) => p.status === "paid").reduce((s: number, p: any) => s + p.amount, 0);
  const pending = commissionPayouts.filter((p: any) => p.status === "pending" || p.status === "processing").reduce((s: number, p: any) => s + p.amount, 0);
  const ytd = commissionPayouts.reduce((s: number, p: any) => s + p.amount, 0);

  // Per-creator breakdown
  const creatorTotals = agencyRoster.map((c: any) => {
    const total = commissionPayouts.filter((p: any) => p.creatorId === c.id).reduce((s: number, p: any) => s + p.amount, 0);
    return { name: c.name, total, rate: c.commissionRate };
  }).filter((c: any) => c.total > 0).sort((a: any, b: any) => b.total - a.total);

  const maxCreatorTotal = Math.max(...creatorTotals.map((c: any) => c.total), 1);

  return (
    <div>
      <PageHeader
        headline={<>Commission <em className="italic text-[#7BAFC8]">tracker</em></>}
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
            <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#8AAABB]">ALL PAYOUTS</p>
            <button
              onClick={() => {
                const headers = ["Creator", "Deal", "Deal Value", "Rate", "Commission", "Period", "Status"];
                const rows = commissionPayouts.map((p: any) => [p.creator, p.deal, p.dealValue, `${p.rate}%`, p.amount, p.period, p.status]);
                const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "commissions.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-1.5 text-[12px] font-sans font-500 text-[#7BAFC8] hover:underline"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
          </div>

          <div className="bg-white border border-[#D8E8EE] rounded-[10px] overflow-hidden">
            <div className="grid grid-cols-7 gap-4 px-5 py-3 text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#8AAABB] border-b border-[#D8E8EE]">
              <span>Creator</span><span>Deal</span><span>Deal Value</span><span>Rate</span><span>Commission</span><span>Period</span><span>Status</span>
            </div>
            {commissionPayouts.map(p => {
              const s = statusStyles[p.status];
              return (
                <div key={p.id} className="grid grid-cols-7 gap-4 px-5 py-3.5 items-center border-b border-[#D8E8EE] last:border-b-0">
                  <span className="text-[13px] font-sans font-500 text-[#1A2C38]">{p.creator}</span>
                  <span className="text-[12px] font-sans text-[#8AAABB]">{p.deal}</span>
                  <span className="text-[13px] font-serif text-[#1A2C38]">{formatCurrency(p.dealValue)}</span>
                  <span className="text-[12px] font-sans text-[#8AAABB]">{p.rate}%</span>
                  <span className="text-[14px] font-serif text-[#3D7A58]">{formatCurrency(p.amount)}</span>
                  <span className="text-[11px] font-mono text-[#8AAABB]">{p.period}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-sans font-500 uppercase tracking-[1.5px] px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>{s.label}</span>
                    {p.status === "pending" && (
                      <button
                        onClick={async () => {
                          try {
                            await updatePayout(p.id, { paid_at: new Date().toISOString(), status: "paid" });
                            setPayouts((prev: any[]) =>
                              prev.map((item) => item.id === p.id ? { ...item, status: "paid", paid_at: new Date().toISOString() } : item)
                            );
                          } catch (err) {
                            console.error("Failed to mark as paid:", err);
                          }
                        }}
                        className="text-[#3D7A58] hover:text-[#3a7a4a]"
                        title="Mark paid"
                      ><CheckCircle2 className="h-3.5 w-3.5" /></button>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="grid grid-cols-7 gap-4 px-5 py-3 bg-[#FAF8F4] border-t border-[#D8E8EE]">
              <span className="text-[12px] font-sans font-600 text-[#1A2C38] col-span-4">Total</span>
              <span className="text-[16px] font-serif text-[#3D7A58]">{formatCurrency(ytd)}</span>
              <span className="col-span-2" />
            </div>
          </div>
        </div>

        {/* Sidebar — Per-creator breakdown */}
        <div>
          <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#8AAABB] mb-4">BY CREATOR</p>
          <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-5 space-y-4">
            {creatorTotals.map(c => (
              <div key={c.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-sans font-500 text-[#1A2C38]">{c.name}</span>
                  <span className="text-[13px] font-serif text-[#3D7A58]">{formatCurrency(c.total)}</span>
                </div>
                <div className="h-[6px] bg-[#F2F8FB] rounded-full overflow-hidden">
                  <div className="h-full bg-[#7BAFC8] rounded-full" style={{ width: `${(c.total / maxCreatorTotal) * 100}%` }} />
                </div>
                <p className="text-[11px] font-sans text-[#8AAABB] mt-1">{c.rate}% rate</p>
              </div>
            ))}
          </div>

          <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#8AAABB] mt-6 mb-4">RATE MANAGEMENT</p>
          <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-5 space-y-3">
            {agencyRoster.slice(0, 4).map(c => (
              <div key={c.id} className="flex items-center justify-between">
                <span className="text-[13px] font-sans text-[#1A2C38]">{c.name}</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    defaultValue={c.commissionRate}
                    onBlur={async (e) => {
                      const newRate = Number(e.target.value);
                      if (newRate === c.commissionRate) return;
                      try {
                        await updateCreatorLink(c.id, { commissionRate: newRate });
                        setRoster((prev: any[]) =>
                          prev.map((item) => item.id === c.id ? { ...item, commissionRate: newRate } : item)
                        );
                      } catch (err) {
                        console.error("Failed to update commission rate:", err);
                        e.target.value = String(c.commissionRate);
                      }
                    }}
                    className="w-14 text-right rounded-lg border border-[#D8E8EE] px-2 py-1 text-[13px] font-sans text-[#1A2C38] focus:outline-none focus:border-[#7BAFC8]"
                  />
                  <span className="text-[12px] font-sans text-[#8AAABB]">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
