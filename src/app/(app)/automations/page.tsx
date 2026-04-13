"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { automations, type Automation } from "@/lib/placeholder-data";

export default function AutomationsPage() {
  const [items, setItems] = useState<Automation[]>(automations);

  const active = items.filter((a) => a.category === "active");
  const available = items.filter((a) => a.category === "available");

  function toggle(id: string) {
    setItems((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  }

  function formatLastFired(date: string | null) {
    if (!date) return "Never";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  }

  return (
    <div>
      <PageHeader
        headline={<>Your <em className="italic text-[#C4714A]">automations</em></>}
        subheading="Set up workflows that run automatically so you can focus on creating."
      />

      {/* Active Automations */}
      <section className="mb-10">
        <p className="text-[10px] uppercase tracking-[3px] text-[#9A9088] font-sans font-semibold mb-4">
          Active
        </p>
        <div className="space-y-3">
          {active.map((a) => (
            <div
              key={a.id}
              className="bg-white border border-[#E5E0D8] rounded-[10px] px-5 py-4 flex items-start justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-sans font-medium text-[#1C1714]">{a.title}</p>
                <p className="text-[13px] font-sans text-[#9A9088] mt-1 leading-relaxed">{a.description}</p>
                <p className="text-[11px] font-mono text-[#9A9088] mt-2">
                  Last fired: {formatLastFired(a.last_fired)}
                </p>
              </div>
              <button
                onClick={() => toggle(a.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 mt-1 ${
                  a.enabled ? "bg-[#C4714A]" : "bg-[#E5E0D8]"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    a.enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Available Automations */}
      <section>
        <p className="text-[10px] uppercase tracking-[3px] text-[#9A9088] font-sans font-semibold mb-4">
          Available
        </p>
        <div className="space-y-3">
          {available.map((a) => (
            <div
              key={a.id}
              className="bg-white border border-[#E5E0D8] rounded-[10px] px-5 py-4 flex items-start justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-sans font-medium text-[#1C1714]">{a.title}</p>
                <p className="text-[13px] font-sans text-[#9A9088] mt-1 leading-relaxed">{a.description}</p>
              </div>
              <button
                onClick={() => toggle(a.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 mt-1 ${
                  a.enabled ? "bg-[#C4714A]" : "bg-[#E5E0D8]"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    a.enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
