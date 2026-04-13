"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Mail,
  MessageSquareText,
  FileText,
  Handshake,
  Calendar,
  ScrollText,
  Users,
  ShieldCheck,
  Lock,
  Radar,
  BarChart3,
  Calculator,
  Briefcase,
  Zap,
  Plug,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { currentUser, totalFollowers } from "@/lib/placeholder-data";

type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  dot?: "red" | "gold";
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Inbox", href: "/inbox", icon: Mail, dot: "red" },
      { name: "Inbound", href: "/inbound", icon: MessageSquareText, dot: "gold" },
      { name: "Deals", href: "/deals", icon: Handshake },
      { name: "Invoices", href: "/invoices", icon: FileText, dot: "red" },
      { name: "Calendar", href: "/calendar", icon: Calendar },
      { name: "Contracts", href: "/contracts", icon: ScrollText },
    ],
  },
  {
    label: "Influencer",
    items: [
      { name: "Audience", href: "/audience", icon: Users },
      { name: "Sponsor Tolerance", href: "/sponsor-tolerance", icon: ShieldCheck, dot: "gold" },
      { name: "Exclusivity", href: "/exclusivity", icon: Lock },
    ],
  },
  {
    label: "Business",
    items: [
      { name: "Brand Radar", href: "/brand-radar", icon: Radar },
      { name: "Campaign Recaps", href: "/campaign-recaps", icon: BarChart3 },
      { name: "Rate Calculator", href: "/rate-calculator", icon: Calculator },
      { name: "Media Kit", href: "/media-kit", icon: Briefcase },
      { name: "Automations", href: "/automations", icon: Zap },
      { name: "Integrations", href: "/integrations", icon: Plug },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[220px] flex-col border-r border-border bg-white">
      {/* Logo */}
      <div className="flex items-center gap-1.5 px-5 py-4 border-b border-border">
        <span className="text-lg font-serif text-foreground">
          create
        </span>
        <span className="text-lg font-serif italic text-terra-500 font-semibold">
          OS
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                      isActive
                        ? "bg-terra-50 text-terra-700"
                        : "text-muted-foreground hover:bg-warm-100 hover:text-foreground"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 flex-shrink-0",
                        isActive ? "text-terra-500" : ""
                      )}
                    />
                    <span className="flex-1 truncate">{item.name}</span>
                    {item.dot && (
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full flex-shrink-0",
                          item.dot === "red"
                            ? "bg-red-500"
                            : "bg-amber-500"
                        )}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Saved from mgmt */}
      <div className="mx-3 mb-2 rounded-lg border border-amber-200 bg-amber-50/60 p-3">
        <p className="text-[10px] font-semibold text-amber-700/70 uppercase tracking-wider mb-0.5">
          Saved from mgmt
        </p>
        <p className="text-xl font-serif font-bold text-amber-700 flex items-center gap-1">
          <DollarSign className="h-4 w-4" />
          1,648
        </p>
      </div>

      {/* User Profile */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">BC</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {currentUser.full_name}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {(totalFollowers / 1000).toFixed(0)}K followers
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
