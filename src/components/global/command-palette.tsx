"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Plus, FileText, Users, BarChart3, Mail, Settings, DollarSign, Briefcase, TrendingUp, Star } from "lucide-react";

interface CommandItem {
  name: string;
  href: string;
  icon: typeof Search;
  category: string;
}

const items: CommandItem[] = [
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
  { name: "New Deal", href: "/deals", icon: Plus, category: "Create" },
  { name: "New Invoice", href: "/invoices", icon: Plus, category: "Create" },
  { name: "Log Earnings", href: "/income", icon: DollarSign, category: "Create" },
  { name: "Import CSV", href: "/import", icon: FileText, category: "Create" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = query
    ? items.filter(i => i.name.toLowerCase().includes(query.toLowerCase()))
    : items;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setOpen(prev => !prev);
      setQuery("");
      setSelected(0);
    }
    if (e.key === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function navigate(href: string) {
    router.push(href);
    setOpen(false);
    setQuery("");
  }

  function handleInputKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === "Enter" && filtered[selected]) { navigate(filtered[selected].href); }
  }

  if (!open) return null;

  const categories = [...new Set(filtered.map(i => i.category))];

  return (
    <div className="fixed inset-0 z-[100]" style={{ background: "rgba(26,44,56,.3)" }} onClick={() => setOpen(false)}>
      <div className="flex justify-center pt-[15vh]" onClick={e => e.stopPropagation()}>
        <div
          className="w-[560px] bg-white border-[1.5px] border-[#D8E8EE] rounded-[16px] overflow-hidden"
          style={{ boxShadow: "0 24px 64px rgba(30,63,82,.18)", animation: "cmdkIn 200ms cubic-bezier(0.16,1,0.3,1)" }}
        >
          <style>{`@keyframes cmdkIn { from { opacity: 0; transform: translateY(-8px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>

          <div className="flex items-center gap-3 px-4 border-b border-[#D8E8EE]">
            <Search className="h-4 w-4 text-[#8AAABB] flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => { setQuery(e.target.value); setSelected(0); }}
              onKeyDown={handleInputKey}
              placeholder="Search pages, create items..."
              className="w-full py-3.5 text-[15px] font-sans text-[#1A2C38] placeholder-[#8AAABB] bg-transparent border-none outline-none"
            />
            <kbd className="text-[10px] font-mono text-[#8AAABB] bg-[#F2F8FB] border border-[#D8E8EE] rounded px-1.5 py-0.5 flex-shrink-0">ESC</kbd>
          </div>

          <div className="max-h-[320px] overflow-y-auto p-2">
            {filtered.length === 0 && (
              <p className="py-8 text-center text-[14px] font-sans text-[#8AAABB]">No results found</p>
            )}

            {categories.map(cat => {
              const catItems = filtered.filter(i => i.category === cat);
              return (
                <div key={cat}>
                  <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] px-2 py-2" style={{ fontWeight: 600 }}>{cat}</p>
                  {catItems.map(item => {
                    const idx = filtered.indexOf(item);
                    return (
                      <button
                        key={item.name + item.href}
                        onClick={() => navigate(item.href)}
                        onMouseEnter={() => setSelected(idx)}
                        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-[8px] text-left text-[14px] font-sans text-[#1A2C38] transition-colors ${
                          selected === idx ? "bg-[#F2F8FB]" : "hover:bg-[#F2F8FB]"
                        }`}
                      >
                        <item.icon className="h-4 w-4 text-[#8AAABB]" />
                        <span className="flex-1">{item.name}</span>
                        <ArrowRight className="h-3 w-3 text-[#D8E8EE]" />
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div className="border-t border-[#D8E8EE] px-4 py-2 flex items-center gap-4">
            <span className="text-[11px] font-sans text-[#8AAABB]">↑↓ Navigate</span>
            <span className="text-[11px] font-sans text-[#8AAABB]">↵ Open</span>
            <span className="text-[11px] font-sans text-[#8AAABB]">esc Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
