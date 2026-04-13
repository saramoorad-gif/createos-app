"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  deals,
  dealStageLabels,
  dealStageColors,
  type DealStage,
  type Deal,
} from "@/lib/placeholder-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { GripVertical, Calendar } from "lucide-react";

const kanbanStages: DealStage[] = [
  "pitched",
  "negotiating",
  "in_progress",
  "delivered",
];

function DealCard({ deal }: { deal: Deal }) {
  return (
    <div className="group rounded-lg border border-border bg-white p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab">
      <div className="flex items-start justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <GripVertical className="h-3 w-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
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

      <div className="flex items-center justify-between">
        {deal.value > 0 ? (
          <span className="text-sm font-semibold text-terra-600">
            {formatCurrency(deal.value)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground italic">TBD</span>
        )}
        {deal.due_date && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDate(deal.due_date)}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-1 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-terra-400 transition-all"
          style={{
            width:
              deal.stage === "pitched"
                ? "15%"
                : deal.stage === "negotiating"
                  ? "35%"
                  : deal.stage === "in_progress"
                    ? "65%"
                    : "90%",
          }}
        />
      </div>
    </div>
  );
}

export function DealPipeline() {
  const dealsByStage = kanbanStages.reduce(
    (acc, stage) => {
      acc[stage] = deals.filter((d) => d.stage === stage);
      return acc;
    },
    {} as Record<DealStage, Deal[]>
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Deal Pipeline</CardTitle>
          <span className="text-xs text-muted-foreground">
            {deals.filter((d) => kanbanStages.includes(d.stage)).length} active deals
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3">
          {kanbanStages.map((stage) => {
            const stageDeals = dealsByStage[stage] || [];
            return (
              <div key={stage} className="kanban-column">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${dealStageColors[stage]}`}
                  >
                    {dealStageLabels[stage]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {stageDeals.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-2">
                  {stageDeals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} />
                  ))}
                  {stageDeals.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border p-6 text-center">
                      <p className="text-xs text-muted-foreground">No deals</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
