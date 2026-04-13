import { EmptyState } from "@/components/shared/empty-state";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-serif font-bold text-foreground mb-1">Settings</h1>
      <p className="text-sm text-muted-foreground mb-8">Manage your account preferences.</p>
      <EmptyState icon={Settings} title="Settings" description="Account, billing, and notification preferences." />
    </div>
  );
}
