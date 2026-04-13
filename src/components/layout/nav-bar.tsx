"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { LogOut, Settings } from "lucide-react";

const navLinks = [
  { name: "TODAY", href: "/dashboard" },
  { name: "DEALS", href: "/deals" },
  { name: "INVOICES", href: "/invoices" },
  { name: "BRANDS", href: "/brand-radar" },
  { name: "MEDIA KIT", href: "/media-kit" },
];

export function NavBar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  const displayName = profile?.full_name || "Creator";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-50 w-full h-[52px] bg-[#1C1714] flex items-center px-6">
      {/* Left — Logo */}
      <Link href="/dashboard" className="flex-shrink-0 mr-8">
        <span className="text-[22px] font-serif italic text-[#F7F4EF]">
          CreateOS
        </span>
      </Link>

      {/* Center — Nav links */}
      <nav className="flex-1 flex items-center justify-center gap-1">
        {navLinks.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "px-3 py-1.5 text-[12px] font-sans font-500 uppercase tracking-[1.5px] transition-colors relative",
                isActive
                  ? "text-[#F7F4EF]"
                  : "text-[rgba(247,244,239,0.4)] hover:text-[rgba(247,244,239,0.7)]"
              )}
            >
              {link.name}
              {isActive && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#C4714A]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Right — User */}
      <div className="flex-shrink-0 flex items-center gap-3">
        <span className="text-[13px] font-sans text-[rgba(247,244,239,0.6)]">
          {displayName}
        </span>
        <div className="h-8 w-8 rounded-full bg-[rgba(247,244,239,0.12)] flex items-center justify-center text-[11px] font-sans font-500 text-[rgba(247,244,239,0.7)]">
          {initials}
        </div>
        <Link
          href="/settings"
          className="text-[rgba(247,244,239,0.3)] hover:text-[rgba(247,244,239,0.7)] transition-colors"
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </Link>
        <button
          onClick={signOut}
          className="text-[rgba(247,244,239,0.3)] hover:text-[rgba(247,244,239,0.7)] transition-colors"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
