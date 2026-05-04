"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { getCreatorNavLinks } from "@/lib/feature-gates";
import { LogOut, Settings, Search, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { NotificationBell } from "@/components/global/notification-panel";

const agencyLinks = [
  { name: "Home", param: "home" },
  { name: "Pipeline", param: "pipeline" },
  { name: "Roster", param: "roster" },
  { name: "Campaigns", param: "campaigns" },
  { name: "Contracts", param: "contracts" },
  { name: "Commissions", param: "commissions" },
  { name: "Inbox", param: "inbox" },
  { name: "Conflicts", param: "conflicts" },
  { name: "Reports", param: "reports" },
  { name: "Team", param: "team" },
];

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const [activeAgencyTab, setActiveAgencyTab] = useState("home");

  // Keep the NavBar's active-tab underline in sync when the agency
  // dashboard switches tabs from inside (e.g. AgencyHome → onNavigate).
  useEffect(() => {
    function onAgencyTab(e: Event) {
      const tab = (e as CustomEvent).detail;
      if (typeof tab === "string") setActiveAgencyTab(tab);
    }
    window.addEventListener("agency-tab", onAgencyTab);
    return () => window.removeEventListener("agency-tab", onAgencyTab);
  }, []);

  const isAgency = profile?.account_type === "agency";
  const displayName = profile?.full_name || "Creator";
  const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <header
      className="sticky top-0 z-50 w-full h-[64px] flex items-center px-6 border-b border-[#D8E8EE]"
      style={{ background: "rgba(250,248,244,.85)", backdropFilter: "saturate(160%) blur(14px)", WebkitBackdropFilter: "saturate(160%) blur(14px)" }}
    >
      {/* Left — Logo */}
      <Link href="/dashboard" className="flex-shrink-0 mr-6">
        <img src="/logo.svg" alt="Create Suite" className="h-8" />
      </Link>

      {/* Search — opens command palette */}
      <button
        onClick={() => window.dispatchEvent(new CustomEvent("cs:open-command-palette"))}
        className="flex-shrink-0 mr-4 flex items-center gap-2 bg-white/60 border border-[#D8E8EE] rounded-[8px] px-3 py-1.5 text-[12px] font-sans text-[#8AAABB] hover:border-[#7BAFC8] hover:text-[#4A6070] transition-colors cursor-pointer"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="text-[10px] font-mono bg-[#F2F8FB] border border-[#D8E8EE] rounded px-1 py-0.5 ml-1">⌘K</kbd>
      </button>

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
                    if (pathname !== "/dashboard") {
                      // Queue the tab in sessionStorage; AgencyDashboard
                      // reads + clears it on mount. This is reliable
                      // regardless of how long the route transition takes
                      // (the old setTimeout(100) could race mount).
                      try {
                        sessionStorage.setItem("cs:agency-tab", link.param);
                      } catch {
                        /* no-op */
                      }
                      router.push("/dashboard");
                    } else {
                      window.dispatchEvent(new CustomEvent("agency-tab", { detail: link.param }));
                    }
                  }}
                  className={cn(
                    "px-3 py-1.5 text-[13px] font-sans font-500 transition-colors relative whitespace-nowrap",
                    isActive ? "text-[#0F1E28] font-semibold" : "text-[#8AAABB] hover:text-[#4A6070]"
                  )}
                >
                  {link.name}
                  {isActive && <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#7BAFC8]" />}
                  {link.name === "Inbox" && <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[#7BAFC8]" />}
                </button>
              );
            })
          : getCreatorNavLinks(profile?.account_type).map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "px-3 py-1.5 text-[13px] font-sans font-500 transition-colors relative whitespace-nowrap",
                    isActive ? "text-[#0F1E28] font-semibold" : "text-[#8AAABB] hover:text-[#4A6070]"
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
        <NotificationBell />
        <span className="text-[13px] font-sans text-[#4A6070] hidden sm:block">{displayName}</span>
        <div className="h-8 w-8 rounded-full bg-[#F2F8FB] border border-[#D8E8EE] flex items-center justify-center text-[11px] font-sans font-500 text-[#7BAFC8]">
          {initials}
        </div>
        <Link href="/help-center" className="text-[#8AAABB] hover:text-[#3D6E8A] transition-colors" title="Help">
          <HelpCircle className="h-4 w-4" />
        </Link>
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
