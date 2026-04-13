import { EmptyState } from "@/components/shared/empty-state";
import { Plug } from "lucide-react";

export default function IntegrationsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-serif font-bold text-foreground mb-1">Integrations</h1>
      <p className="text-sm text-muted-foreground mb-8">Connect your tools and platforms.</p>
      <EmptyState icon={Plug} title="No integrations connected" description="Connect Gmail, Outlook, TikTok, Instagram, and YouTube to power your createOS." />
    </div>
  );
}
