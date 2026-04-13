import { EmptyState } from "@/components/shared/empty-state";
import { Calendar } from "lucide-react";

export default function CalendarPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-serif font-bold text-foreground mb-1">Calendar</h1>
      <p className="text-sm text-muted-foreground mb-8">Your upcoming events and deadlines.</p>
      <EmptyState icon={Calendar} title="No events yet" description="Connect your calendar to see upcoming deadlines and meetings." />
    </div>
  );
}
