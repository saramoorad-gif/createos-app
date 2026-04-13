import { EmptyState } from "@/components/shared/empty-state";
import { ShieldCheck } from "lucide-react";

export default function SponsorTolerancePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-serif font-bold text-foreground mb-1">Sponsor Tolerance</h1>
      <p className="text-sm text-muted-foreground mb-8">Monitor your posting frequency and audience fatigue.</p>
      <EmptyState icon={ShieldCheck} title="Sponsor tolerance tracker" description="This feature analyzes your posting frequency to prevent audience fatigue." />
    </div>
  );
}
