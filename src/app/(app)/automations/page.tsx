import { AutomationsList } from "@/components/automations/automations-list";

export default function AutomationsPage() {
  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Automations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Set up workflows that run automatically so you can focus on creating.
        </p>
      </div>

      <AutomationsList />
    </div>
  );
}
