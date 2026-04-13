import { EmptyState } from "@/components/shared/empty-state";
import { BarChart3 } from "lucide-react";

export default function CampaignRecapsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-serif font-bold text-foreground mb-1">Campaign Recaps</h1>
      <p className="text-sm text-muted-foreground mb-8">Review performance of completed campaigns.</p>
      <EmptyState icon={BarChart3} title="No completed campaigns" description="After delivering a deal, campaign recaps will be generated here." />
    </div>
  );
}
