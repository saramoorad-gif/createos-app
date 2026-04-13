"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { LogOut, Settings, Bell, Search } from "lucide-react";
import { useState } from "react";

const creatorLinks = [
  { name: "TODAY", href: "/dashboard" },
  { name: "DEALS", href: "/deals" },
  { name: "INVOICES", href: "/invoices" },
  { name: "BRANDS", href: "/brand-radar" },
  { name: "MEDIA KIT", href: "/media-kit" },
];

const agencyLinks = [
  { name: "PIPELINE", href: "/dashboard", param: "pipeline" },
  { name: "ROSTER", href: "/dashboard", param: "roster" },
  { name: "CAMPAIGNS", href: "/dashboard", param: "campaigns" },
  { name: "CONTRACTS", href: "/dashboard", param: "contracts" },
  { name: "COMMISSIONS", href: "/dashboard", param: "commissions" },
  { name: "INBOX", href: "/dashboard", param: "inbox" },
  { name: "CONFLICTS", href: "/dashboard", param: "conflicts" },
  { name: "REPORTS", href: "/dashboard", param: "reports" },
];

export function NavBar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const [showSearch, setShowSearch] = useState(false);

  const isAgency = profile?.account_type === "agency";
  const displayName = profile?.full_name || "Creator";
  const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const links = isAgency ? agencyLinks : creatorLinks;

  return (
    <header className="sticky top-0 z-50 w-full h-[52px] bg-[#1C1714] flex items-center px-6">
      {/* Left — Logo */}
      <Link href="/dashboard" className="flex-shrink-0 mr-6">
        <span className="text-[22px] font-serif italic text-[#F7F4EF]">
          CreateOS
        </span>
      </Link>

      {/* Search (agency only) */}
      {isAgency && (
        <div className="flex-shrink-0 mr-4">
          {showSearch ? (
            <input
              autoFocus
              type="text"
              placeholder="Search creators, deals, brands..."
              className="w-56 bg-[rgba(247,244,239,0.08)] border border-[rgba(247,244,239,0.15)] rounded-lg px-3 py-1.5 text-[12px] font-sans text-[#F7F4EF] placeholder-[rgba(247,244,239,0.3)] focus:outline-none focus:border-[#C4714A]"
              onBlur={() => setShowSearch(false)}
            />
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="text-[rgba(247,244,239,0.3)] hover:text-[rgba(247,244,239,0.7)] transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Center — Nav links */}
      <nav className="flex-1 flex items-center justify-center gap-0.5 overflow-x-auto">
        {isAgency
          ? agencyLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => {
                  // Dispatch custom event for agency tab switching
                  window.dispatchEvent(
                    new CustomEvent("agency-tab", { detail: link.param })
                  );
                }}
                className="px-2.5 py-1.5 text-[11px] font-sans font-500 uppercase tracking-[1.5px] transition-colors relative text-[rgba(247,244,239,0.4)] hover:text-[rgba(247,244,239,0.7)] whitespace-nowrap"
              >
                {link.name}
                {link.name === "INBOX" && (
                  <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[#C4714A]" />
                )}
              </button>
            ))
          : creatorLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "px-3 py-1.5 text-[12px] font-sans font-500 uppercase tracking-[1.5px] transition-colors relative whitespace-nowrap",
                    isActive ? "text-[#F7F4EF]" : "text-[rgba(247,244,239,0.4)] hover:text-[rgba(247,244,239,0.7)]"
                  )}
                >
                  {link.name}
                  {isActive && <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#C4714A]" />}
                </Link>
              );
            })}
      </nav>

      {/* Right — Notifications + User */}
      <div className="flex-shrink-0 flex items-center gap-3">
        {isAgency && (
          <button className="relative text-[rgba(247,244,239,0.3)] hover:text-[rgba(247,244,239,0.7)] transition-colors" title="Notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#C4714A]" />
          </button>
        )}
        <span className="text-[13px] font-sans text-[rgba(247,244,239,0.6)]">
          {displayName}
        </span>
        <div className="h-8 w-8 rounded-full bg-[rgba(247,244,239,0.12)] flex items-center justify-center text-[11px] font-sans font-500 text-[rgba(247,244,239,0.7)]">
          {initials}
        </div>
        <Link href="/settings" className="text-[rgba(247,244,239,0.3)] hover:text-[rgba(247,244,239,0.7)] transition-colors" title="Settings">
          <Settings className="h-4 w-4" />
        </Link>
        <button onClick={signOut} className="text-[rgba(247,244,239,0.3)] hover:text-[rgba(247,244,239,0.7)] transition-colors" title="Sign out">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
