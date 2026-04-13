import { EmptyState } from "@/components/shared/empty-state";
import { Lock } from "lucide-react";

export default function ExclusivityPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-serif font-bold text-foreground mb-1">Exclusivity</h1>
      <p className="text-sm text-muted-foreground mb-8">Track exclusivity clauses across your deals.</p>
      <EmptyState icon={Lock} title="No active exclusivity" description="When you sign deals with exclusivity clauses, they'll be tracked here." />
    </div>
  );
}
