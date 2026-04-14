"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search, ArrowRight, Plus, FileText, Users, BarChart3, Mail, Settings, DollarSign, Briefcase, TrendingUp, Star } from "lucide-react";

const pages = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3, category: "Navigate" },
  { name: "Deals", href: "/deals", icon: Briefcase, category: "Navigate" },
  { name: "Invoices", href: "/invoices", icon: FileText, category: "Navigate" },
  { name: "Income", href: "/income", icon: DollarSign, category: "Navigate" },
  { name: "Inbox", href: "/inbox", icon: Mail, category: "Navigate" },
  { name: "Brand Radar", href: "/brand-radar", icon: Star, category: "Navigate" },
  { name: "Media Kit", href: "/media-kit", icon: Users, category: "Navigate" },
  { name: "Rate Calculator", href: "/rate-calculator", icon: TrendingUp, category: "Navigate" },
  { name: "Settings", href: "/settings", icon: Settings, category: "Navigate" },
  { name: "Integrations", href: "/integrations", icon: Settings, category: "Navigate" },
  { name: "Import Data", href: "/import", icon: FileText, category: "Navigate" },
];

const actions = [
  { name: "New Deal", href: "/deals", icon: Plus, category: "Create" },
  { name: "New Invoice", href: "/invoices", icon: Plus, category: "Create" },
  { name: "Log Earnings", href: "/income", icon: DollarSign, category: "Create" },
  { name: "Import CSV", href: "/import", icon: FileText, category: "Create" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setOpen(prev => !prev);
    }
    if (e.key === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  function navigate(href: string) {
    router.push(href);
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]" style={{ background: "rgba(26,44,56,.3)" }} onClick={() => setOpen(false)}>
      <div className="flex justify-center pt-[15vh]" onClick={e => e.stopPropagation()}>
        <div
          className="w-[560px] bg-white border-[1.5px] border-[#D8E8EE] rounded-[16px] overflow-hidden"
          style={{ boxShadow: "0 24px 64px rgba(30,63,82,.18)", animation: "cmdkIn 200ms cubic-bezier(0.16,1,0.3,1)" }}
        >
          <style>{`
            @keyframes cmdkIn { from { opacity: 0; transform: translateY(-8px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
          `}</style>
          <Command className="w-full" label="Command palette">
            <div className="flex items-center gap-3 px-4 border-b border-[#D8E8EE]">
              <Search className="h-4 w-4 text-[#8AAABB] flex-shrink-0" />
              <Command.Input
                autoFocus
                placeholder="Search pages, create items..."
                className="w-full py-3.5 text-[15px] font-sans text-[#1A2C38] placeholder-[#8AAABB] bg-transparent border-none outline-none"
              />
              <kbd className="text-[10px] font-mono text-[#8AAABB] bg-[#F2F8FB] border border-[#D8E8EE] rounded px-1.5 py-0.5 flex-shrink-0">ESC</kbd>
            </div>

            <Command.List className="max-h-[320px] overflow-y-auto p-2">
              <Command.Empty className="py-8 text-center text-[14px] font-sans text-[#8AAABB]">
                No results found
              </Command.Empty>

              <Command.Group heading="Navigate" className="[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-sans [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[3px] [&_[cmdk-group-heading]]:text-[#8AAABB] [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-semibold">
                {pages.map(p => (
                  <Command.Item
                    key={p.href}
                    value={p.name}
                    onSelect={() => navigate(p.href)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] cursor-pointer text-[14px] font-sans text-[#1A2C38] hover:bg-[#F2F8FB] data-[selected=true]:bg-[#F2F8FB] transition-colors"
                  >
                    <p.icon className="h-4 w-4 text-[#8AAABB]" />
                    <span className="flex-1">{p.name}</span>
                    <ArrowRight className="h-3 w-3 text-[#D8E8EE]" />
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Separator className="h-px bg-[#D8E8EE] my-1" />

              <Command.Group heading="Quick Create" className="[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-sans [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[3px] [&_[cmdk-group-heading]]:text-[#8AAABB] [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-semibold">
                {actions.map(a => (
                  <Command.Item
                    key={a.name}
                    value={a.name}
                    onSelect={() => navigate(a.href)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] cursor-pointer text-[14px] font-sans text-[#1A2C38] hover:bg-[#F2F8FB] data-[selected=true]:bg-[#F2F8FB] transition-colors"
                  >
                    <a.icon className="h-4 w-4 text-[#7BAFC8]" />
                    <span className="flex-1">{a.name}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>

            <div className="border-t border-[#D8E8EE] px-4 py-2 flex items-center gap-4">
              <span className="text-[11px] font-sans text-[#8AAABB]">↑↓ Navigate</span>
              <span className="text-[11px] font-sans text-[#8AAABB]">↵ Open</span>
              <span className="text-[11px] font-sans text-[#8AAABB]">esc Close</span>
            </div>
          </Command>
        </div>
      </div>
    </div>
  );
}
