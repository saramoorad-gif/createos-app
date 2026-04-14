"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { LogOut, Settings, Bell, Search } from "lucide-react";
import { useState } from "react";

const creatorLinks = [
  { name: "Today", href: "/dashboard" },
  { name: "Deals", href: "/deals" },
  { name: "Invoices", href: "/invoices" },
  { name: "Inbox", href: "/inbox" },
  { name: "Brands", href: "/brand-radar" },
  { name: "Media Kit", href: "/media-kit" },
  { name: "Rate Calculator", href: "/rate-calculator" },
];

const agencyLinks = [
  { name: "Pipeline", param: "pipeline" },
  { name: "Roster", param: "roster" },
  { name: "Campaigns", param: "campaigns" },
  { name: "Contracts", param: "contracts" },
  { name: "Commissions", param: "commissions" },
  { name: "Inbox", param: "inbox" },
  { name: "Conflicts", param: "conflicts" },
  { name: "Reports", param: "reports" },
];

export function NavBar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const [activeAgencyTab, setActiveAgencyTab] = useState("pipeline");

  const isAgency = profile?.account_type === "agency";
  const displayName = profile?.full_name || "Creator";
  const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <header
      className="sticky top-0 z-50 w-full h-[60px] flex items-center px-6 border-b border-[#D8E8EE]"
      style={{ background: "rgba(250,248,244,.95)", backdropFilter: "blur(12px)" }}
    >
      {/* Left — Logo */}
      <Link href="/dashboard" className="flex-shrink-0 mr-6">
        <img src="/logo.svg" alt="Create Suite" className="h-8" />
      </Link>

      {/* Search (agency) */}
      {isAgency && (
        <div className="flex-shrink-0 mr-4">
          {showSearch ? (
            <input
              autoFocus
              type="text"
              placeholder="Search creators, deals, brands..."
              className="w-56 bg-white border border-[#D8E8EE] rounded-btn px-3 py-1.5 text-[12px] font-sans text-[#1A2C38] placeholder-[#8AAABB] focus:outline-none focus:border-[#7BAFC8]"
              onBlur={() => setShowSearch(false)}
            />
          ) : (
            <button onClick={() => setShowSearch(true)} className="text-[#8AAABB] hover:text-[#3D6E8A] transition-colors">
              <Search className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Center — Nav tabs */}
      <nav className="flex-1 flex items-center justify-center gap-0.5 overflow-x-auto">
        {isAgency
          ? agencyLinks.map((link) => {
              const isActive = activeAgencyTab === link.param;
              return (
                <button
                  key={link.name}
                  onClick={() => {
                    setActiveAgencyTab(link.param);
                    window.dispatchEvent(new CustomEvent("agency-tab", { detail: link.param }));
                  }}
                  className={cn(
                    "px-3 py-1.5 text-[13px] font-sans font-500 transition-colors relative whitespace-nowrap",
                    isActive ? "text-[#1A2C38]" : "text-[#8AAABB] hover:text-[#4A6070]"
                  )}
                >
                  {link.name}
                  {isActive && <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#7BAFC8]" />}
                  {link.name === "Inbox" && <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[#7BAFC8]" />}
                </button>
              );
            })
          : creatorLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "px-3 py-1.5 text-[13px] font-sans font-500 transition-colors relative whitespace-nowrap",
                    isActive ? "text-[#1A2C38]" : "text-[#8AAABB] hover:text-[#4A6070]"
                  )}
                >
                  {link.name}
                  {isActive && <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#7BAFC8]" />}
                  {link.name === "Inbox" && <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[#7BAFC8]" />}
                </Link>
              );
            })}
      </nav>

      {/* Right */}
      <div className="flex-shrink-0 flex items-center gap-3">
        {isAgency && (
          <button className="relative text-[#8AAABB] hover:text-[#3D6E8A] transition-colors" title="Notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#7BAFC8]" />
          </button>
        )}
        <span className="text-[13px] font-sans text-[#4A6070] hidden sm:block">{displayName}</span>
        <div className="h-8 w-8 rounded-full bg-[#F2F8FB] border border-[#D8E8EE] flex items-center justify-center text-[11px] font-sans font-500 text-[#7BAFC8]">
          {initials}
        </div>
        <Link href="/settings" className="text-[#8AAABB] hover:text-[#3D6E8A] transition-colors" title="Settings">
          <Settings className="h-4 w-4" />
        </Link>
        <button onClick={signOut} className="text-[#8AAABB] hover:text-[#A03D3D] transition-colors" title="Sign out">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
