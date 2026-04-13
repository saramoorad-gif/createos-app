import { DealsKanban } from "@/components/deals/deals-kanban";

export default function DealsPage() {
  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Deals</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your brand deals from pitch to payment.
          </p>
        </div>
      </div>

      <DealsKanban />
    </div>
  );
}
