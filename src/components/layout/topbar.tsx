"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { revenueStats, totalFollowers } from "@/lib/placeholder-data";
import { formatCurrency } from "@/lib/utils";
import { Sparkles, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

const tabs = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Inbox", href: "/inbox" },
  { name: "Inbound", href: "/inbound" },
  { name: "Deals", href: "/deals" },
  { name: "Invoices", href: "/invoices" },
];

const accountTypeLabels: Record<string, string> = {
  ugc: "UGC Creator",
  influencer: "Influencer",
  agency: "Agency",
};

export function Topbar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  const displayName = profile?.full_name || "Creator";
  const accountLabel = profile?.account_type
    ? accountTypeLabels[profile.account_type]
    : "";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-white/80 backdrop-blur-sm px-4 lg:px-6 h-14">
      {/* Left — Logo (visible when sidebar hidden) + Tier chips */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 lg:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-terra-500">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-serif font-semibold">
            create<span className="italic text-terra-500">OS</span>
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          {accountLabel && (
            <span className="inline-flex items-center rounded-full border border-terra-200 bg-terra-50 px-2.5 py-0.5 text-[11px] font-semibold text-terra-700">
              {accountLabel}
            </span>
          )}
        </div>
      </div>

      {/* Center — Tab navigation */}
      <nav className="flex items-center gap-0.5 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "px-2.5 lg:px-3 py-1.5 text-xs lg:text-sm font-medium rounded-md transition-colors whitespace-nowrap",
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

      {/* Right — User name + stats + sign out */}
      <div className="hidden md:flex items-center gap-4 text-xs">
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
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {displayName.split(" ")[0]}
          </span>
          <button
            onClick={signOut}
            className="text-muted-foreground hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
