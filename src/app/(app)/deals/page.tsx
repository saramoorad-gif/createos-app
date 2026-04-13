"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import {
  deals,
  dealStageLabels,
  type Deal,
} from "@/lib/placeholder-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { X, ChevronRight, FileText, Eye } from "lucide-react";

type Filter = "all" | "active" | "pending" | "complete";

const filterMap: Record<Filter, (d: Deal) => boolean> = {
  all: () => true,
  active: (d) => ["contracted", "in_progress"].includes(d.stage),
  pending: (d) => ["pitched", "negotiating"].includes(d.stage),
  complete: (d) => ["delivered", "paid"].includes(d.stage),
};

const stageProgress: Record<string, number> = {
  pitched: 10, negotiating: 25, contracted: 40, in_progress: 65, delivered: 85, paid: 100,
};

function DealPanel({ deal, onClose }: { deal: Deal; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-full max-w-[440px] bg-white border-l border-[#E5E0D8] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[#E5E0D8] px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-[20px] font-serif text-[#1C1714]">{deal.brand_name}</h2>
          <button onClick={onClose} className="text-[#9A9088] hover:text-[#1C1714]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-sans font-500 uppercase tracking-[1.5px] px-2 py-0.5 rounded-full bg-[#F2EEE8] text-[#9A9088]">
              {dealStageLabels[deal.stage]}
            </span>
            <span className="text-[10px] font-sans font-500 uppercase tracking-[1.5px] px-2 py-0.5 rounded-full bg-[#FBF0EA] text-[#C4714A]">
              {deal.deal_type === "ugc" ? "UGC" : "Influencer"}
            </span>
          </div>

          <div className="h-[3px] w-full bg-[#E5E0D8] rounded-full overflow-hidden">
            <div className="h-full bg-[#C4714A] rounded-full" style={{ width: `${stageProgress[deal.stage]}%` }} />
          </div>

          <div className="space-y-3 divide-y divide-[#E5E0D8]">
            {([
              ["Amount", deal.value > 0 ? formatCurrency(deal.value) : "TBD"],
              ["Deliverables", deal.deliverables],
              ["Platform", deal.platform],
              ["Due Date", deal.due_date ? formatDate(deal.due_date) : "—"],
              ["Exclusivity", deal.exclusivity_days ? `${deal.exclusivity_days}d — ${deal.exclusivity_category}` : "None"],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} className="flex justify-between pt-3 first:pt-0">
                <span className="text-[12px] font-sans text-[#9A9088]">{label}</span>
                <span className="text-[13px] font-sans font-500 text-[#1C1714] text-right max-w-[220px]">{value}</span>
              </div>
            ))}
          </div>

          {deal.notes && (
            <div className="bg-[#F7F4EF] rounded-[10px] p-4">
              <p className="text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#9A9088] mb-2">Notes</p>
              <p className="text-[13px] font-sans text-[#1C1714] leading-relaxed">{deal.notes}</p>
            </div>
          )}

          <div className="space-y-2 pt-2">
            <button className="w-full flex items-center justify-center gap-2 bg-[#C4714A] text-white rounded-[10px] px-4 py-2.5 text-[13px] font-sans font-500 hover:bg-[#B05C38] transition-colors">
              <ChevronRight className="h-4 w-4" /> Move to next stage
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-1.5 border border-[#E5E0D8] rounded-[10px] px-3 py-2 text-[12px] font-sans font-500 text-[#1C1714] hover:bg-[#F7F4EF]">
                <FileText className="h-3.5 w-3.5" /> Invoice
              </button>
              <button className="flex items-center justify-center gap-1.5 border border-[#E5E0D8] rounded-[10px] px-3 py-2 text-[12px] font-sans font-500 text-[#1C1714] hover:bg-[#F7F4EF]">
                <Eye className="h-3.5 w-3.5" /> Contract
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DealsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  const filtered = deals.filter(filterMap[filter]);
  const totalValue = deals.reduce((s, d) => s + d.value, 0);
  const activeCount = deals.filter((d) => ["contracted", "in_progress"].includes(d.stage)).length;

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: `All (${deals.length})` },
    { key: "active", label: "Active" },
    { key: "pending", label: "Pending" },
    { key: "complete", label: "Complete" },
  ];

  return (
    <div>
      <PageHeader
        headline={<>Your deal <em className="italic text-[#C4714A]">pipeline</em></>}
        subheading="Track every brand partnership from pitch to payment."
        stats={[
          { value: String(deals.length), label: "Total deals" },
          { value: String(activeCount), label: "Active" },
          { value: formatCurrency(totalValue), label: "Pipeline value" },
        ]}
      />

      {/* Filters */}
      <div className="flex items-center gap-1 mb-6">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1 text-[10px] font-sans font-500 uppercase tracking-[1.5px] rounded-full transition-colors ${
              filter === f.key
                ? "bg-[#1C1714] text-[#F7F4EF]"
                : "text-[#9A9088] hover:text-[#1C1714] hover:bg-[#F2EEE8]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Deal list */}
      <div className="space-y-3">
        {filtered.map((deal) => (
          <button
            key={deal.id}
            onClick={() => setSelectedDeal(deal)}
            className="w-full text-left bg-white border border-[#E5E0D8] rounded-[10px] p-5 hover:border-[#C4714A]/30 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <p className="text-[15px] font-sans font-600 text-[#1C1714]">{deal.brand_name}</p>
                <span className="text-[10px] font-sans font-500 uppercase tracking-[1px] px-2 py-0.5 rounded-full bg-[#FBF0EA] text-[#C4714A]">
                  {deal.deal_type === "ugc" ? "UGC" : "Influencer"}
                </span>
              </div>
              <p className="text-[20px] font-serif text-[#1C1714]">
                {deal.value > 0 ? formatCurrency(deal.value) : "TBD"}
              </p>
            </div>
            <div className="h-[3px] w-full bg-[#E5E0D8] rounded-full overflow-hidden mb-2">
              <div className="h-full bg-[#C4714A] rounded-full" style={{ width: `${stageProgress[deal.stage]}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-sans font-500 uppercase tracking-[1.5px] text-[#9A9088]">
                  {dealStageLabels[deal.stage]}
                </span>
                <span className="text-[12px] font-sans text-[#9A9088]">{deal.deliverables}</span>
              </div>
              {deal.due_date && (
                <span className="text-[11px] font-mono text-[#9A9088]">Due {formatDate(deal.due_date)}</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[20px] font-serif italic text-[#9A9088]">No deals found</p>
          <button className="mt-4 text-[13px] font-sans font-500 text-[#C4714A] hover:underline">Create your first deal →</button>
        </div>
      )}

      {selectedDeal && <DealPanel deal={selectedDeal} onClose={() => setSelectedDeal(null)} />}
    </div>
  );
}
