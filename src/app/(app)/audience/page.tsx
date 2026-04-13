import { EmptyState } from "@/components/shared/empty-state";
import { Users } from "lucide-react";

export default function AudiencePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-serif font-bold text-foreground mb-1">Audience</h1>
      <p className="text-sm text-muted-foreground mb-8">Audience demographics and analytics.</p>
      <EmptyState icon={Users} title="Audience insights coming soon" description="Connect your platforms to unlock audience demographics and analytics." />
    </div>
  );
}
