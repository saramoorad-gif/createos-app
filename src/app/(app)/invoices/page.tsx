import { InvoicesDashboard } from "@/components/invoices/invoices-dashboard";

export default function InvoicesPage() {
  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Invoices</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track payments and manage invoices for all your deals.
        </p>
      </div>

      <InvoicesDashboard />
    </div>
  );
}
