"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { useSupabaseQuery } from "@/lib/hooks";
import { UpgradeGate } from "@/components/global/upgrade-gate";
import { TableSkeleton } from "@/components/global/skeleton";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Trophy, FileText, Download, TrendingUp, Calendar, Sparkles, X } from "lucide-react";

interface Deal {
  id: string;
  brand_name: string;
  stage: string;
  value: number;
  deliverables: string;
  platform: string | null;
  deal_type: string;
  due_date: string | null;
  notes: string;
  created_at: string;
}

interface Invoice {
  id: string;
  brand_name: string;
  amount: number;
  status: string;
  due_date: string;
  deal_id?: string;
}

export default function CampaignRecapsPage() {
  return (
    <UpgradeGate feature="campaign-recaps">
      <CampaignRecapsContent />
    </UpgradeGate>
  );
}

function CampaignRecapsContent() {
  const { data: deals, loading: dealsLoading } = useSupabaseQuery<Deal>("deals", {
    order: { column: "created_at", ascending: false },
  });
  const { data: invoices, loading: invoicesLoading } = useSupabaseQuery<Invoice>("invoices");
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  // Completed deals (delivered + paid) become recap-eligible campaigns
  const completedDeals = useMemo(
    () => deals.filter((d) => ["delivered", "paid"].includes(d.stage)),
    [deals]
  );

  const totalRevenue = completedDeals.reduce((s, d) => s + (d.value || 0), 0);
  const paidDeals = completedDeals.filter((d) => d.stage === "paid");
  const uniqueBrands = new Set(completedDeals.map((d) => d.brand_name)).size;
  const avgDealValue =
    completedDeals.length > 0 ? Math.round(totalRevenue / completedDeals.length) : 0;

  const loading = dealsLoading || invoicesLoading;

  if (loading) return <TableSkeleton rows={4} cols={4} />;

  return (
    <div>
      <PageHeader
        headline={
          <>
            Campaign <em className="italic text-[#7BAFC8]">recaps</em>
          </>
        }
        subheading="Performance summaries for every completed campaign. Download to share with brands or add to your media kit."
        stats={[
          { value: String(completedDeals.length), label: "Campaigns" },
          { value: String(uniqueBrands), label: "Unique brands" },
          { value: formatCurrency(totalRevenue), label: "Total earned" },
          { value: formatCurrency(avgDealValue), label: "Avg value" },
        ]}
      />

      {completedDeals.length === 0 ? (
        <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-12 text-center">
          <Trophy className="h-8 w-8 text-[#7BAFC8] mx-auto mb-3" />
          <p className="text-[16px] font-serif italic text-[#8AAABB]">
            No completed campaigns yet
          </p>
          <p className="text-[13px] font-sans text-[#8AAABB] mt-2 mb-4">
            Campaigns appear here once a deal is marked <em>delivered</em> or <em>paid</em>.
          </p>
          <Link
            href="/deals"
            className="inline-block text-[13px] font-sans font-medium text-[#7BAFC8] hover:underline"
          >
            View your pipeline →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {completedDeals.map((deal) => (
            <button
              key={deal.id}
              onClick={() => setSelectedDeal(deal)}
              className="text-left bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5 hover:border-[#7BAFC8] hover:shadow-card transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <h3 className="text-[15px] font-serif text-[#1A2C38] truncate">{deal.brand_name}</h3>
                  <p className="text-[11px] font-sans text-[#8AAABB] mt-0.5">
                    {deal.deal_type || "UGC"} · {deal.platform || "multi-platform"}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-sans uppercase tracking-[1.5px] px-2 py-0.5 rounded-full whitespace-nowrap ${
                    deal.stage === "paid"
                      ? "bg-[#E8F4EE] text-[#3D7A58]"
                      : "bg-[#F2F8FB] text-[#7BAFC8]"
                  }`}
                  style={{ fontWeight: 600 }}
                >
                  {deal.stage === "paid" ? "Paid" : "Delivered"}
                </span>
              </div>

              <p className="text-[22px] font-serif text-[#1A2C38] mb-1">
                {formatCurrency(deal.value || 0)}
              </p>

              {deal.deliverables && (
                <p className="text-[12px] font-sans text-[#4A6070] line-clamp-2 mb-3">
                  {deal.deliverables}
                </p>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-[#EEE8E0]">
                <span className="text-[11px] font-sans text-[#8AAABB] flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {deal.due_date ? formatDate(deal.due_date) : formatDate(deal.created_at)}
                </span>
                <span className="text-[11px] font-sans text-[#7BAFC8]" style={{ fontWeight: 500 }}>
                  View recap →
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selectedDeal && (
        <RecapModal
          deal={selectedDeal}
          invoices={invoices.filter((i) => i.deal_id === selectedDeal.id)}
          onClose={() => setSelectedDeal(null)}
        />
      )}
    </div>
  );
}

function RecapModal({
  deal,
  invoices,
  onClose,
}: {
  deal: Deal;
  invoices: Invoice[];
  onClose: () => void;
}) {
  const paidInvoice = invoices.find((i) => i.status === "paid");
  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);

  function downloadRecapMarkdown() {
    const md = `# Campaign Recap — ${deal.brand_name}

**Type:** ${deal.deal_type || "UGC"}
**Platform:** ${deal.platform || "Multi-platform"}
**Value:** ${formatCurrency(deal.value || 0)}
**Status:** ${deal.stage === "paid" ? "Paid" : "Delivered"}
**Completed:** ${deal.due_date ? formatDate(deal.due_date) : formatDate(deal.created_at)}

## Deliverables
${deal.deliverables || "(none specified)"}

## Payment
${
  invoices.length === 0
    ? "No invoices on file."
    : invoices
        .map(
          (i) =>
            `- ${formatCurrency(i.amount)} — ${i.status}${
              i.status === "paid" ? ` (paid ${formatDate(i.due_date)})` : ""
            }`
        )
        .join("\n")
}

${deal.notes ? `## Notes\n${deal.notes}` : ""}
`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recap-${deal.brand_name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-[#D8E8EE] px-6 py-4 flex items-center justify-between">
          <h2 className="text-[20px] font-serif text-[#1A2C38]">
            {deal.brand_name} — <em className="italic text-[#7BAFC8]">recap</em>
          </h2>
          <button onClick={onClose} className="text-[#8AAABB] hover:text-[#1A2C38]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Headline stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#F2F8FB] rounded-[8px] p-4">
              <p className="text-[10px] font-sans uppercase tracking-[1.5px] text-[#8AAABB] mb-1" style={{ fontWeight: 600 }}>
                Value
              </p>
              <p className="text-[18px] font-serif text-[#1A2C38]">{formatCurrency(deal.value || 0)}</p>
            </div>
            <div className="bg-[#F2F8FB] rounded-[8px] p-4">
              <p className="text-[10px] font-sans uppercase tracking-[1.5px] text-[#8AAABB] mb-1" style={{ fontWeight: 600 }}>
                Platform
              </p>
              <p className="text-[14px] font-sans text-[#1A2C38] capitalize pt-1" style={{ fontWeight: 500 }}>
                {deal.platform || "Multi"}
              </p>
            </div>
            <div className="bg-[#F2F8FB] rounded-[8px] p-4">
              <p className="text-[10px] font-sans uppercase tracking-[1.5px] text-[#8AAABB] mb-1" style={{ fontWeight: 600 }}>
                Status
              </p>
              <p className="text-[14px] font-sans text-[#1A2C38] capitalize pt-1" style={{ fontWeight: 500 }}>
                {deal.stage === "paid" ? "Paid" : "Delivered"}
              </p>
            </div>
          </div>

          {/* Deliverables */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-[#7BAFC8]" />
              <p className="text-[11px] font-sans uppercase tracking-[2px] text-[#8AAABB]" style={{ fontWeight: 600 }}>
                Deliverables
              </p>
            </div>
            <p className="text-[14px] font-sans text-[#1A2C38] leading-relaxed">
              {deal.deliverables || (
                <span className="italic text-[#8AAABB]">No deliverables recorded</span>
              )}
            </p>
          </div>

          {/* Timeline */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-[#7BAFC8]" />
              <p className="text-[11px] font-sans uppercase tracking-[2px] text-[#8AAABB]" style={{ fontWeight: 600 }}>
                Timeline
              </p>
            </div>
            <div className="text-[14px] font-sans text-[#1A2C38] space-y-1">
              <p>Started: {formatDate(deal.created_at)}</p>
              <p>
                {deal.stage === "paid" ? "Paid" : "Delivered"}:{" "}
                {deal.due_date ? formatDate(deal.due_date) : "—"}
              </p>
            </div>
          </div>

          {/* Payment */}
          {invoices.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-[#7BAFC8]" />
                <p className="text-[11px] font-sans uppercase tracking-[2px] text-[#8AAABB]" style={{ fontWeight: 600 }}>
                  Payment
                </p>
              </div>
              <div className="bg-[#F2F8FB] border border-[#D8E8EE] rounded-[8px] p-4 space-y-2">
                {invoices.map((i) => (
                  <div key={i.id} className="flex items-center justify-between text-[13px] font-sans">
                    <span className="text-[#4A6070]">
                      Invoice — {i.status}
                      {i.status === "paid" && paidInvoice && ` · ${formatDate(i.due_date)}`}
                    </span>
                    <span className="text-[#1A2C38]" style={{ fontWeight: 500 }}>
                      {formatCurrency(i.amount)}
                    </span>
                  </div>
                ))}
                {totalPaid > 0 && totalPaid !== (deal.value || 0) && (
                  <div className="flex items-center justify-between text-[13px] font-sans pt-2 border-t border-[#D8E8EE]">
                    <span className="text-[#8AAABB]">Paid</span>
                    <span className="text-[#3D7A58]" style={{ fontWeight: 600 }}>
                      {formatCurrency(totalPaid)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {deal.notes && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-[#7BAFC8]" />
                <p className="text-[11px] font-sans uppercase tracking-[2px] text-[#8AAABB]" style={{ fontWeight: 600 }}>
                  Notes
                </p>
              </div>
              <p className="text-[13px] font-sans text-[#4A6070] leading-relaxed whitespace-pre-wrap">
                {deal.notes}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t border-[#D8E8EE]">
            <button
              onClick={downloadRecapMarkdown}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#1E3F52] text-white rounded-[8px] px-4 py-2.5 text-[13px] font-sans hover:bg-[#2a5269] transition-colors"
              style={{ fontWeight: 600 }}
            >
              <Download className="h-4 w-4" />
              Download recap
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-[13px] font-sans text-[#4A6070] border border-[#D8E8EE] rounded-[8px] hover:bg-[#FAF8F4]"
              style={{ fontWeight: 500 }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
