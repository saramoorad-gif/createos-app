"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { revenueStats } from "@/lib/placeholder-data";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
} from "lucide-react";

const stats = [
  {
    label: "Revenue This Month",
    value: revenueStats.thisMonth,
    icon: DollarSign,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    label: "Pipeline Value",
    value: revenueStats.pipeline,
    icon: TrendingUp,
    color: "text-terra-600",
    bgColor: "bg-terra-50",
  },
  {
    label: "Pending Invoices",
    value: revenueStats.invoicesPending,
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    label: "Overdue",
    value: revenueStats.invoicesOverdue,
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
];

export function RevenueOverview() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-serif font-bold mt-1">
                  {formatCurrency(stat.value)}
                </p>
              </div>
              <div className={`${stat.bgColor} rounded-lg p-2.5`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
