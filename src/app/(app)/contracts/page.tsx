import { EmptyState } from "@/components/shared/empty-state";
import { ScrollText } from "lucide-react";

export default function ContractsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-serif font-bold text-foreground mb-1">Contracts</h1>
      <p className="text-sm text-muted-foreground mb-8">Manage contracts from your deals.</p>
      <EmptyState icon={ScrollText} title="No contracts yet" description="Contracts from your deals will appear here for easy access." />
    </div>
  );
}
