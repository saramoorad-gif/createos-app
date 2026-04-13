"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  deals as allDeals,
  dealStageLabels,
  dealStageColors,
  type DealStage,
  type Deal,
} from "@/lib/placeholder-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  GripVertical,
  Calendar,
  Plus,
  X,
  ChevronRight,
  FileText,
  CheckCircle2,
  Eye,
  StickyNote,
} from "lucide-react";

const kanbanStages: DealStage[] = [
  "pitched",
  "negotiating",
  "in_progress",
  "delivered",
];

// ─── New Deal Modal ──────────────────────────────────────────────

function NewDealModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-serif font-semibold">New Deal</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Brand Name</label>
            <input
              type="text"
              placeholder="e.g., Nike"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Deal Type</label>
              <select className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 bg-white">
                <option value="ugc">UGC</option>
                <option value="influencer">Influencer</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Platform</label>
              <select className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 bg-white">
                <option value="tiktok">TikTok</option>
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Deliverables</label>
            <input
              type="text"
              placeholder="e.g., 2 TikTok videos + 1 Reel"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Amount</label>
              <input
                type="number"
                placeholder="$0"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Due Date</label>
              <input
                type="date"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Exclusivity (days)</label>
              <input
                type="number"
                placeholder="None"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Category</label>
              <input
                type="text"
                placeholder="e.g., Beauty"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Notes</label>
            <textarea
              placeholder="Any additional notes..."
              rows={2}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={onClose}>Create Deal</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Deal Slide-over Panel ───────────────────────────────────────

function DealPanel({ deal, onClose }: { deal: Deal; onClose: () => void }) {
  const stageIndex = kanbanStages.indexOf(deal.stage);
  const progressPct =
    deal.stage === "pitched" ? 15
    : deal.stage === "negotiating" ? 35
    : deal.stage === "in_progress" ? 65
    : deal.stage === "delivered" ? 90
    : 100;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white border-l border-border shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-serif font-semibold">{deal.brand_name}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status + Tags */}
          <div className="flex items-center gap-2">
            <Badge className={`${dealStageColors[deal.stage]} text-xs`}>
              {dealStageLabels[deal.stage]}
            </Badge>
            <Badge variant={deal.deal_type === "ugc" ? "platform" : "brand"} className="text-xs">
              {deal.deal_type === "ugc" ? "UGC" : "Influencer"}
            </Badge>
          </div>

          {/* Progress */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Progress</span>
              <span>{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-2" />
          </div>

          <Separator />

          {/* Details */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="text-sm font-semibold text-terra-600">
                {deal.value > 0 ? formatCurrency(deal.value) : "TBD"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Deliverables</span>
              <span className="text-sm font-medium text-right max-w-[200px]">
                {deal.deliverables}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Platform</span>
              <span className="text-sm font-medium capitalize">{deal.platform}</span>
            </div>
            {deal.due_date && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Due Date</span>
                <span className="text-sm font-medium">{formatDate(deal.due_date)}</span>
              </div>
            )}
            {deal.exclusivity_days && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Exclusivity</span>
                <span className="text-sm font-medium">
                  {deal.exclusivity_days} days — {deal.exclusivity_category}
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Timeline</h3>
            <div className="space-y-3">
              {kanbanStages.map((stage, i) => {
                const isPast = i <= stageIndex;
                return (
                  <div key={stage} className="flex items-center gap-3">
                    <div className={`h-2.5 w-2.5 rounded-full ${isPast ? "bg-terra-500" : "bg-muted"}`} />
                    <span className={`text-sm ${isPast ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {dealStageLabels[stage]}
                    </span>
                    {i === stageIndex && (
                      <span className="text-[10px] text-terra-500 font-medium bg-terra-50 rounded-full px-2 py-0.5">
                        Current
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Notes */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Notes</h3>
            </div>
            <p className="text-sm text-muted-foreground bg-warm-100 rounded-lg p-3">
              {deal.notes}
            </p>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            <Button className="w-full gap-2">
              <ChevronRight className="h-4 w-4" />
              Move to next stage
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Generate invoice
              </Button>
              <Button variant="outline" className="gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Mark delivered
              </Button>
            </div>
            <Button variant="ghost" className="w-full gap-1.5 text-muted-foreground">
              <Eye className="h-3.5 w-3.5" />
              View contract
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Deal Card ───────────────────────────────────────────────────

function DealCard({ deal, onClick }: { deal: Deal; onClick: () => void }) {
  const progressPct =
    deal.stage === "pitched" ? 15
    : deal.stage === "negotiating" ? 35
    : deal.stage === "in_progress" ? 65
    : 90;

  return (
    <div
      onClick={onClick}
      className="group rounded-lg border border-border bg-white p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <GripVertical className="h-3 w-3 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
          <span className="text-sm font-semibold text-foreground">
            {deal.brand_name}
          </span>
        </div>
        <Badge
          variant={deal.deal_type === "ugc" ? "platform" : "brand"}
          className="text-[10px] px-1.5 py-0"
        >
          {deal.deal_type === "ugc" ? "UGC" : "Influencer"}
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
        {deal.deliverables}
      </p>

      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-terra-600">
          {deal.value > 0 ? formatCurrency(deal.value) : "TBD"}
        </span>
        {deal.due_date && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDate(deal.due_date)}
          </div>
        )}
      </div>

      <Progress value={progressPct} className="h-1.5" />
    </div>
  );
}

// ─── Main Kanban ─────────────────────────────────────────────────

export function DealsKanban() {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showNewDeal, setShowNewDeal] = useState(false);

  const dealsByStage = kanbanStages.reduce(
    (acc, stage) => {
      acc[stage] = allDeals.filter((d) => d.stage === stage);
      return acc;
    },
    {} as Record<DealStage, Deal[]>
  );

  return (
    <>
      {/* Top actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {kanbanStages.map((stage) => (
            <span key={stage} className="text-xs text-muted-foreground">
              <span className={`inline-block h-2 w-2 rounded-full mr-1 ${
                stage === "pitched" ? "bg-violet-400"
                : stage === "negotiating" ? "bg-amber-400"
                : stage === "in_progress" ? "bg-terra-400"
                : "bg-purple-400"
              }`} />
              {dealStageLabels[stage]} ({(dealsByStage[stage] || []).length})
            </span>
          ))}
        </div>
        <Button className="gap-1.5" onClick={() => setShowNewDeal(true)}>
          <Plus className="h-4 w-4" />
          New deal
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-4 gap-4">
        {kanbanStages.map((stage) => {
          const stageDeals = dealsByStage[stage] || [];
          const stageTotal = stageDeals.reduce((sum, d) => sum + d.value, 0);
          return (
            <div key={stage}>
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${dealStageColors[stage]}`}
                >
                  {dealStageLabels[stage]}
                </span>
                {stageTotal > 0 && (
                  <span className="text-xs text-muted-foreground font-medium">
                    {formatCurrency(stageTotal)}
                  </span>
                )}
              </div>

              {/* Cards */}
              <div className="space-y-2 min-h-[200px]">
                {stageDeals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    onClick={() => setSelectedDeal(deal)}
                  />
                ))}
                {stageDeals.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border p-8 text-center">
                    <p className="text-xs text-muted-foreground">No deals</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide-over Panel */}
      {selectedDeal && (
        <DealPanel deal={selectedDeal} onClose={() => setSelectedDeal(null)} />
      )}

      {/* New Deal Modal */}
      {showNewDeal && <NewDealModal onClose={() => setShowNewDeal(false)} />}
    </>
  );
}
