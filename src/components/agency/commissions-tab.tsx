"use client";

import { PageHeader } from "@/components/layout/page-header";
import { useSupabaseQuery, useSupabaseMutation } from "@/lib/hooks";
import { formatCurrency } from "@/lib/utils";
import { Download, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/global/toast";
import { TableSkeleton } from "@/components/global/skeleton";

interface CommissionPayout {
  id: string;
  agency_id: string;
  creator_id: string;
  deal_id: string | null;
  amount: number;
  rate: number;
  period: string;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
}

interface CreatorLink {
  id: string;
  agency_id: string;
  creator_id: string;
  commission_rate: number;
  status: string;
}

interface Deal {
  id: string;
  brand_name: string;
  value: number;
}

interface Profile {
  id: string;
  full_name: string;
}

export function CommissionsTab() {
  const { data: commissionPayouts, loading, setData: setPayouts } = useSupabaseQuery<CommissionPayout>("commission_payouts");
  const { data: agencyRoster, setData: setRoster } = useSupabaseQuery<CreatorLink>("agency_creator_links");
  const { data: deals } = useSupabaseQuery<Deal>("deals");
  const { data: profiles } = useSupabaseQuery<Profile>("profiles");
  const { update: updatePayout } = useSupabaseMutation("commission_payouts");
  const { update: updateCreatorLink } = useSupabaseMutation("agency_creator_links");
  const { toast } = useToast();

  if (loading) {
    return <TableSkeleton rows={8} cols={7} />;
  }

  if (!loading && commissionPayouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="font-serif italic text-[16px] text-[#8AAABB] mb-4">No commissions tracked yet</p>
        <p className="text-[13px] text-[#8AAABB]">Commissions are calculated automatically when deals are completed.</p>
      </div>
    );
  }

  // Helper maps for joining
  const profileById = new Map(profiles.map(p => [p.id, p]));
  const dealById = new Map(deals.map(d => [d.id, d]));

  // A payout is "paid" if paid_at is set, otherwise pending
  const paidPayouts = commissionPayouts.filter(p => p.paid_at);
  const pendingPayouts = commissionPayouts.filter(p => !p.paid_at);

  const earned = paidPayouts.reduce((s, p) => s + Number(p.amount || 0), 0);
  const pending = pendingPayouts.reduce((s, p) => s + Number(p.amount || 0), 0);
  const ytd = commissionPayouts.reduce((s, p) => s + Number(p.amount || 0), 0);

  // Per-creator breakdown — join payouts with profile info and creator link for rate
  const creatorTotals = agencyRoster.map(link => {
    const creatorProfile = profileById.get(link.creator_id);
    const total = commissionPayouts
      .filter(p => p.creator_id === link.creator_id)
      .reduce((s, p) => s + Number(p.amount || 0), 0);
    return {
      id: link.creator_id,
      linkId: link.id,
      name: creatorProfile?.full_name || "Unknown creator",
      total,
      rate: Number(link.commission_rate || 0),
    };
  }).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  const maxCreatorTotal = Math.max(...creatorTotals.map(c => c.total), 1);

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
                const rows = commissionPayouts.map((p) => {
                  const creator = profileById.get(p.creator_id);
                  const deal = p.deal_id ? dealById.get(p.deal_id) : null;
                  return [
                    creator?.full_name || "—",
                    deal?.brand_name || "—",
                    deal?.value || 0,
                    `${p.rate}%`,
                    p.amount,
                    p.period,
                    p.paid_at ? "paid" : "pending",
                  ];
                });
                const csv = [headers, ...rows].map((r) => r.map(v => `"${v}"`).join(",")).join("\n");
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
              const creator = profileById.get(p.creator_id);
              const deal = p.deal_id ? dealById.get(p.deal_id) : null;
              const isPaid = !!p.paid_at;
              return (
                <div key={p.id} className="grid grid-cols-7 gap-4 px-5 py-3.5 items-center border-b border-[#D8E8EE] last:border-b-0">
                  <span className="text-[13px] font-sans font-500 text-[#1A2C38]">{creator?.full_name || "—"}</span>
                  <span className="text-[12px] font-sans text-[#8AAABB]">{deal?.brand_name || "—"}</span>
                  <span className="text-[13px] font-serif text-[#1A2C38]">{deal ? formatCurrency(deal.value) : "—"}</span>
                  <span className="text-[12px] font-sans text-[#8AAABB]">{p.rate}%</span>
                  <span className="text-[14px] font-serif text-[#3D7A58]">{formatCurrency(p.amount)}</span>
                  <span className="text-[11px] font-mono text-[#8AAABB]">{p.period}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-sans font-500 uppercase tracking-[1.5px] px-2 py-0.5 rounded-full ${
                      isPaid ? "bg-[#E8F4EE] text-[#3D7A58]" : "bg-[#F4EEE0] text-[#A07830]"
                    }`}>{isPaid ? "Paid" : "Pending"}</span>
                    {!isPaid && (
                      <button
                        onClick={async () => {
                          try {
                            const nowIso = new Date().toISOString();
                            await updatePayout(p.id, { paid_at: nowIso });
                            setPayouts(prev => prev.map(item => item.id === p.id ? { ...item, paid_at: nowIso } : item));
                            toast("success", "Commission marked as paid");
                          } catch (err) {
                            console.error("Failed to mark as paid:", err);
                            toast("error", "Failed to update");
                          }
                        }}
                        className="text-[#3D7A58] hover:text-[#2d5c42]"
                        title="Mark as paid"
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
            {creatorTotals.length === 0 ? (
              <p className="text-[12px] font-serif italic text-[#8AAABB] text-center py-4">No commissions yet</p>
            ) : creatorTotals.map(c => (
              <div key={c.id}>
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
            {agencyRoster.slice(0, 4).map(link => {
              const creatorProfile = profileById.get(link.creator_id);
              return (
                <div key={link.id} className="flex items-center justify-between">
                  <span className="text-[13px] font-sans text-[#1A2C38]">{creatorProfile?.full_name || "Unknown"}</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      defaultValue={Number(link.commission_rate || 0)}
                      onBlur={async (e) => {
                        const newRate = Number(e.target.value);
                        if (isNaN(newRate) || newRate === Number(link.commission_rate)) return;
                        try {
                          await updateCreatorLink(link.id, { commission_rate: newRate });
                          setRoster(prev => prev.map(item => item.id === link.id ? { ...item, commission_rate: newRate } : item));
                          toast("success", "Commission rate updated");
                        } catch (err) {
                          console.error("Failed to update commission rate:", err);
                          e.target.value = String(link.commission_rate);
                          toast("error", "Failed to update rate");
                        }
                      }}
                      className="w-14 text-right rounded-lg border border-[#D8E8EE] px-2 py-1 text-[13px] font-sans text-[#1A2C38] focus:outline-none focus:border-[#7BAFC8]"
                    />
                    <span className="text-[12px] font-sans text-[#8AAABB]">%</span>
                  </div>
                </div>
              );
            })}
            {agencyRoster.length === 0 && (
              <p className="text-[12px] font-serif italic text-[#8AAABB] text-center py-2">No creators linked yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
