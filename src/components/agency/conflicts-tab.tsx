"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { conflicts, exclusivityMap } from "@/lib/placeholder-data";
import { formatDate, timeAgo } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

const severityStyles: Record<string, { bg: string; text: string; dot: string }> = {
  high: { bg: "bg-[#FEF0EB]", text: "text-[#E05C3A]", dot: "bg-[#E05C3A]" },
  medium: { bg: "bg-[#FBF5EC]", text: "text-[#D4A030]", dot: "bg-[#D4A030]" },
  low: { bg: "bg-[#F2EEE8]", text: "text-[#9A9088]", dot: "bg-[#9A9088]" },
};

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-[#FEF0EB]", text: "text-[#E05C3A]", label: "Active" },
  monitoring: { bg: "bg-[#FBF5EC]", text: "text-[#D4A030]", label: "Monitoring" },
  resolved: { bg: "bg-[#EBF5EB]", text: "text-[#4A9060]", label: "Resolved" },
};

const categoryColors: Record<string, string> = {
  "Fashion / Jewelry": "bg-[#C4714A]", Fashion: "bg-[#C4714A]", Jewelry: "bg-[#D4A030]",
  Beverage: "bg-[#4A9060]", Grocery: "bg-[#4A9060]", Beauty: "bg-[#E05C3A]",
};

const resolutionChecklist = [
  "Notify affected brand(s)",
  "Renegotiate exclusivity terms",
  "Delay new deal start date",
  "Reassign to different creator",
];

export function ConflictsTab() {
  const [view, setView] = useState<"conflicts" | "calendar">("conflicts");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const activeCount = conflicts.filter(c => c.status === "active").length;

  return (
    <div>
      <PageHeader
        headline={<>Conflict <em className="italic text-[#C4714A]">manager</em></>}
        subheading="Track exclusivity conflicts and resolve them before they become problems."
        stats={[
          { value: String(conflicts.length), label: "Total conflicts" },
          { value: String(activeCount), label: "Active" },
          { value: String(exclusivityMap.length), label: "Active exclusivities" },
        ]}
      />

      <div className="flex items-center gap-1 mb-6">
        {(["conflicts", "calendar"] as const).map(v => (
          <button key={v} onClick={() => setView(v)} className={`px-3 py-1 text-[10px] font-sans font-500 uppercase tracking-[1.5px] rounded-full ${view === v ? "bg-[#1C1714] text-[#F7F4EF]" : "text-[#9A9088] hover:bg-[#F2EEE8]"}`}>
            {v === "conflicts" ? "All Conflicts" : "Exclusivity Calendar"}
          </button>
        ))}
      </div>

      {view === "conflicts" && (
        <div className="space-y-3">
          {conflicts.map(conflict => {
            const sev = severityStyles[conflict.severity];
            const st = statusStyles[conflict.status];
            const expanded = expandedId === conflict.id;

            return (
              <div key={conflict.id} className="bg-white border border-[#E5E0D8] rounded-[10px] overflow-hidden">
                <div className="p-5 cursor-pointer" onClick={() => setExpandedId(expanded ? null : conflict.id)}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-[3px] h-12 rounded-full ${sev.dot} mt-0.5`} />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-[15px] font-sans font-600 text-[#1C1714]">{conflict.creators.join(", ")}</p>
                          <span className={`text-[10px] font-sans font-500 uppercase tracking-[1.5px] px-2 py-0.5 rounded-full ${sev.bg} ${sev.text}`}>{conflict.severity}</span>
                          <span className={`text-[10px] font-sans font-500 uppercase tracking-[1.5px] px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>{st.label}</span>
                        </div>
                        <p className="text-[13px] font-sans text-[#9A9088]">
                          {conflict.brand1} vs {conflict.brand2} — {conflict.category}
                        </p>
                        <p className="text-[12px] font-sans text-[#9A9088] mt-0.5">{conflict.type}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-[#9A9088]">{timeAgo(conflict.detectedAt)}</span>
                  </div>

                  {conflict.resolution && (
                    <div className="mt-3 bg-[#EBF5EB] rounded-lg p-3 flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#4A9060] mt-0.5 flex-shrink-0" />
                      <p className="text-[12px] font-sans text-[#4A9060]">{conflict.resolution}</p>
                    </div>
                  )}
                </div>

                {/* Expanded resolution workflow */}
                {expanded && conflict.status === "active" && (
                  <div className="border-t border-[#E5E0D8] p-5 bg-[#F7F4EF]">
                    <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#9A9088] mb-3">RESOLUTION CHECKLIST</p>
                    <div className="space-y-2">
                      {resolutionChecklist.map((item, i) => (
                        <label key={i} className="flex items-center gap-2.5 cursor-pointer">
                          <input type="checkbox" className="rounded border-[#E5E0D8] text-[#C4714A] focus:ring-[#C4714A]" />
                          <span className="text-[13px] font-sans text-[#1C1714]">{item}</span>
                        </label>
                      ))}
                    </div>
                    <button className="mt-4 bg-[#4A9060] text-white rounded-[10px] px-4 py-2 text-[12px] font-sans font-500 hover:bg-[#3a7a4a]">
                      Mark as resolved
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {view === "calendar" && (
        <div>
          <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#9A9088] mb-4">EXCLUSIVITY TIMELINE</p>
          <div className="bg-white border border-[#E5E0D8] rounded-[10px] p-5 space-y-4">
            {exclusivityMap.map((ex, i) => {
              const start = new Date(ex.start);
              const end = new Date(ex.end);
              const today = new Date();
              const total = end.getTime() - start.getTime();
              const elapsed = Math.max(0, today.getTime() - start.getTime());
              const pct = Math.min(100, (elapsed / total) * 100);
              const isExpired = today > end;

              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${categoryColors[ex.category] || "bg-[#9A9088]"}`} />
                      <span className="text-[13px] font-sans font-500 text-[#1C1714]">{ex.creator}</span>
                      <span className="text-[12px] font-sans text-[#9A9088]">— {ex.brand} ({ex.category})</span>
                    </div>
                    <span className={`text-[11px] font-mono ${isExpired ? "text-[#9A9088]" : "text-[#1C1714]"}`}>
                      {formatDate(ex.start)} → {formatDate(ex.end)}
                    </span>
                  </div>
                  <div className="h-[6px] bg-[#F2EEE8] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${isExpired ? "bg-[#9A9088]" : "bg-[#C4714A]"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
