"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { revenueStats, totalFollowers } from "@/lib/placeholder-data";
import { formatCurrency } from "@/lib/utils";

const tabs = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Inbox", href: "/inbox" },
  { name: "Inbound", href: "/inbound" },
  { name: "Deals", href: "/deals" },
  { name: "Invoices", href: "/invoices" },
];

export function Topbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-white/80 backdrop-blur-sm px-6 h-14">
      {/* Left — Tier chips */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-full border border-terra-200 bg-terra-50 px-2.5 py-0.5 text-[11px] font-semibold text-terra-700">
          UGC $27
        </span>
        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
          Influencer $39
        </span>
      </div>

      {/* Center — Tab navigation */}
      <nav className="flex items-center gap-1">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-terra-50 text-terra-700"
                  : "text-muted-foreground hover:text-foreground hover:bg-warm-100"
              )}
            >
              {tab.name}
            </Link>
          );
        })}
      </nav>

      {/* Right — Quick stats */}
      <div className="flex items-center gap-4 text-xs">
        <div className="text-right">
          <p className="text-muted-foreground">April Earned</p>
          <p className="font-serif font-bold text-terra-600 text-sm">
            {formatCurrency(revenueStats.thisMonth)}
          </p>
        </div>
        <div className="h-6 w-px bg-border" />
        <div className="text-right">
          <p className="text-muted-foreground">Followers</p>
          <p className="font-semibold text-foreground text-sm">
            {(totalFollowers / 1000).toFixed(0)}K
          </p>
        </div>
        <div className="h-6 w-px bg-border" />
        <div className="text-right">
          <p className="text-muted-foreground">Eng. Rate</p>
          <p className="font-semibold text-emerald-600 text-sm">6.4%</p>
        </div>
      </div>
    </header>
  );
}
