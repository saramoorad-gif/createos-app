"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { invoices, deals, type Invoice } from "@/lib/placeholder-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  AlertTriangle,
  DollarSign,
  CheckCircle2,
  Plus,
  Send,
  Eye,
  Bell,
  X,
  Sparkles,
} from "lucide-react";

const statusConfig: Record<
  string,
  { variant: "success" | "warning" | "destructive" | "muted"; label: string; color: string }
> = {
  paid: { variant: "success", label: "Paid", color: "text-emerald-600" },
  sent: { variant: "warning", label: "Sent", color: "text-amber-600" },
  draft: { variant: "muted", label: "Draft", color: "text-muted-foreground" },
  overdue: { variant: "destructive", label: "Overdue", color: "text-red-600" },
};

// ─── Invoice Slide-over ──────────────────────────────────────────

function InvoicePanel({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const config = statusConfig[invoice.status];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white border-l border-border shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-serif font-semibold">Invoice Preview</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Invoice Header */}
          <div className="rounded-lg border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Invoice</p>
                <p className="text-sm font-mono font-medium">{invoice.id.replace("inv_", "INV-")}</p>
              </div>
              <Badge variant={config.variant}>{config.label}</Badge>
            </div>

            <Separator className="mb-4" />

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Bill to</span>
                <span className="text-sm font-medium">{invoice.brand_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="text-lg font-serif font-bold text-terra-600">
                  {formatCurrency(invoice.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Due Date</span>
                <span className="text-sm font-medium">{formatDate(invoice.due_date)}</span>
              </div>
              {invoice.paid_date && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Paid On</span>
                  <span className="text-sm font-medium text-emerald-600">
                    {formatDate(invoice.paid_date)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm font-medium">{formatDate(invoice.created_at)}</span>
              </div>
            </div>
          </div>

          {/* From */}
          <div className="rounded-lg bg-warm-100 p-4">
            <p className="text-xs text-muted-foreground mb-1">From</p>
            <p className="text-sm font-medium">Brianna Cole</p>
            <p className="text-xs text-muted-foreground">brianna@briannacole.com</p>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {invoice.status === "draft" && (
              <Button className="w-full gap-2">
                <Send className="h-4 w-4" />
                Send Invoice
              </Button>
            )}
            {invoice.status === "sent" && (
              <>
                <Button className="w-full gap-2">
                  <Bell className="h-4 w-4" />
                  Send Reminder
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Mark as Paid
                </Button>
              </>
            )}
            {invoice.status === "overdue" && (
              <>
                <Button variant="destructive" className="w-full gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Send Final Reminder
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Mark as Paid
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── New Invoice Modal ───────────────────────────────────────────

function NewInvoiceModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-serif font-semibold">New Invoice</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Pre-fill from deal</label>
            <select className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500">
              <option value="">Select a deal...</option>
              {deals.filter(d => d.value > 0).map((deal) => (
                <option key={deal.id} value={deal.id}>
                  {deal.brand_name} — {formatCurrency(deal.value)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium block mb-1.5">Amount</label>
              <input
                type="number"
                placeholder="$0"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Due Date</label>
              <input
                type="date"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={onClose}>Create Invoice</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────

export function InvoicesDashboard() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showNewInvoice, setShowNewInvoice] = useState(false);

  const outstanding = invoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((sum, i) => sum + i.amount, 0);
  const collected = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.amount, 0);
  const overdueInvoices = invoices.filter((i) => i.status === "overdue");

  return (
    <>
      <div className="space-y-5">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-t-2 border-t-red-400">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Outstanding</p>
                  <p className="text-2xl font-serif font-bold text-red-600 mt-1">
                    {formatCurrency(outstanding)}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-2.5">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-t-2 border-t-emerald-400">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Collected This Month</p>
                  <p className="text-2xl font-serif font-bold text-emerald-600 mt-1">
                    {formatCurrency(collected)}
                  </p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-2.5">
                  <DollarSign className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overdue Alert */}
        {overdueInvoices.length > 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
            <p className="flex-1 text-sm text-red-800">
              <span className="font-semibold">
                {overdueInvoices.length} overdue invoice{overdueInvoices.length > 1 ? "s" : ""}
              </span>{" "}
              — {formatCurrency(overdueInvoices.reduce((s, i) => s + i.amount, 0))} outstanding
            </p>
            <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
              <Sparkles className="h-3 w-3" />
              AI suggests escalating with a formal follow-up
            </span>
          </div>
        )}

        {/* Invoice Table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">All Invoices</CardTitle>
              <Button className="gap-1.5" size="sm" onClick={() => setShowNewInvoice(true)}>
                <Plus className="h-3.5 w-3.5" />
                New invoice
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 px-6 py-2 bg-muted/50 text-xs font-medium text-muted-foreground border-y border-border">
              <span>Brand</span>
              <span>Invoice #</span>
              <span className="text-right">Amount</span>
              <span>Due Date</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-border">
              {invoices.map((invoice) => {
                const config = statusConfig[invoice.status];
                return (
                  <div
                    key={invoice.id}
                    className="grid grid-cols-6 gap-4 px-6 py-3 items-center hover:bg-warm-50 transition-colors"
                  >
                    <span className="text-sm font-medium">{invoice.brand_name}</span>
                    <span className="text-sm text-muted-foreground font-mono">
                      {invoice.id.replace("inv_", "INV-")}
                    </span>
                    <span className="text-sm font-semibold text-right">
                      {formatCurrency(invoice.amount)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(invoice.due_date)}
                    </span>
                    <Badge variant={config.variant} className="w-fit">
                      {config.label}
                    </Badge>
                    <div className="flex items-center justify-end gap-1">
                      {invoice.status === "sent" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Send reminder">
                          <Bell className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="View invoice"
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      {(invoice.status === "sent" || invoice.status === "overdue") && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Mark paid">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Panel */}
      {selectedInvoice && (
        <InvoicePanel
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      {/* New Invoice Modal */}
      {showNewInvoice && <NewInvoiceModal onClose={() => setShowNewInvoice(false)} />}
    </>
  );
}
