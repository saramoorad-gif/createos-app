"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { invoices } from "@/lib/placeholder-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FileText, Plus } from "lucide-react";

const statusConfig: Record<
  string,
  { variant: "success" | "warning" | "destructive" | "muted"; label: string }
> = {
  paid: { variant: "success", label: "Paid" },
  sent: { variant: "warning", label: "Sent" },
  draft: { variant: "muted", label: "Draft" },
  overdue: { variant: "destructive", label: "Overdue" },
};

export function InvoiceSummary() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Recent Invoices</CardTitle>
            <Badge variant="muted">{invoices.length}</Badge>
          </div>
          <Button size="sm" variant="outline" className="h-8 gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            New Invoice
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-0 divide-y divide-border">
          {invoices.map((invoice) => {
            const config = statusConfig[invoice.status];
            return (
              <div
                key={invoice.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{invoice.brand_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Due {formatDate(invoice.due_date)}
                      {invoice.paid_date &&
                        ` · Paid ${formatDate(invoice.paid_date)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">
                    {formatCurrency(invoice.amount)}
                  </span>
                  <Badge variant={config.variant}>{config.label}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
