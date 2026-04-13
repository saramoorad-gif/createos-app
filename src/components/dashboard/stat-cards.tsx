"use client";

import { Card, CardContent } from "@/components/ui/card";
import { revenueStats, totalFollowers } from "@/lib/placeholder-data";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  Camera,
  Megaphone,
  Users,
  TrendingUp,
} from "lucide-react";

const stats = [
  {
    label: "April Earned",
    value: formatCurrency(revenueStats.thisMonth),
    icon: DollarSign,
    color: "text-terra-600",
    bgColor: "bg-terra-50",
    accent: "border-t-2 border-t-terra-500",
  },
  {
    label: "UGC Income",
    value: formatCurrency(revenueStats.ugcIncome),
    icon: Camera,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    accent: "",
  },
  {
    label: "Influencer Income",
    value: formatCurrency(revenueStats.influencerIncome),
    icon: Megaphone,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    accent: "",
  },
  {
    label: "Following",
    value: `${(totalFollowers / 1000).toFixed(0)}K`,
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    accent: "",
  },
  {
    label: "Engagement",
    value: "6.4%",
    icon: TrendingUp,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    accent: "",
  },
];

export function StatCards() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className={stat.accent}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground font-medium">
                {stat.label}
              </p>
              <div className={`${stat.bgColor} rounded-md p-1.5`}>
                <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-xl font-serif font-bold text-foreground">
              {stat.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
