"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useSupabaseQuery, useSupabaseMutation } from "@/lib/hooks";
import { formatDate, timeAgo } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

const severityStyles: Record<string, { bg: string; text: string; dot: string }> = {
  high: { bg: "bg-[#F4EAEA]", text: "text-[#A03D3D]", dot: "bg-[#A03D3D]" },
  medium: { bg: "bg-[#F4EEE0]", text: "text-[#A07830]", dot: "bg-[#A07830]" },
  low: { bg: "bg-[#F2F8FB]", text: "text-[#8AAABB]", dot: "bg-[#8AAABB]" },
};

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-[#F4EAEA]", text: "text-[#A03D3D]", label: "Active" },
  monitoring: { bg: "bg-[#F4EEE0]", text: "text-[#A07830]", label: "Monitoring" },
  resolved: { bg: "bg-[#E8F4EE]", text: "text-[#3D7A58]", label: "Resolved" },
};

const categoryColors: Record<string, string> = {
  "Fashion / Jewelry": "bg-[#7BAFC8]", Fashion: "bg-[#7BAFC8]", Jewelry: "bg-[#A07830]",
  Beverage: "bg-[#3D7A58]", Grocery: "bg-[#3D7A58]", Beauty: "bg-[#A03D3D]",
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

  const { data: conflicts, loading, setData: setConflicts } = useSupabaseQuery<any>("conflict_log");
  const { data: exclusivityMap } = useSupabaseQuery<any>("exclusivity_map");
  const { update: updateConflict } = useSupabaseMutation("conflict_log");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#D8E8EE] border-t-[#7BAFC8]" />
      </div>
    );
  }

  if (!loading && conflicts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="font-serif italic text-[16px] text-[#8AAABB] mb-4">No conflicts detected</p>
        <p className="text-[13px] text-[#8AAABB]">The system scans for exclusivity overlaps automatically.</p>
      </div>
    );
  }

  const activeCount = conflicts.filter((c: any) => c.status === "active").length;

  return (
    <div>
      <PageHeader
        headline={<>Conflict <em className="italic text-[#7BAFC8]">manager</em></>}
        subheading="Track exclusivity conflicts and resolve them before they become problems."
        stats={[
          { value: String(conflicts.length), label: "Total conflicts" },
          { value: String(activeCount), label: "Active" },
          { value: String(exclusivityMap.length), label: "Active exclusivities" },
        ]}
      />

      <div className="flex items-center gap-1 mb-6">
        {(["conflicts", "calendar"] as const).map(v => (
          <button key={v} onClick={() => setView(v)} className={`px-3 py-1 text-[10px] font-sans font-500 uppercase tracking-[1.5px] rounded-full ${view === v ? "bg-[#1A2C38] text-[#FAF8F4]" : "text-[#8AAABB] hover:bg-[#F2F8FB]"}`}>
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
              <div key={conflict.id} className="bg-white border border-[#D8E8EE] rounded-[10px] overflow-hidden">
                <div className="p-5 cursor-pointer" onClick={() => setExpandedId(expanded ? null : conflict.id)}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-[3px] h-12 rounded-full ${sev.dot} mt-0.5`} />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-[15px] font-sans font-600 text-[#1A2C38]">{conflict.creators.join(", ")}</p>
                          <span className={`text-[10px] font-sans font-500 uppercase tracking-[1.5px] px-2 py-0.5 rounded-full ${sev.bg} ${sev.text}`}>{conflict.severity}</span>
                          <span className={`text-[10px] font-sans font-500 uppercase tracking-[1.5px] px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>{st.label}</span>
                        </div>
                        <p className="text-[13px] font-sans text-[#8AAABB]">
                          {conflict.brand1} vs {conflict.brand2} — {conflict.category}
                        </p>
                        <p className="text-[12px] font-sans text-[#8AAABB] mt-0.5">{conflict.type}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-[#8AAABB]">{timeAgo(conflict.detectedAt)}</span>
                  </div>

                  {conflict.resolution && (
                    <div className="mt-3 bg-[#E8F4EE] rounded-lg p-3 flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#3D7A58] mt-0.5 flex-shrink-0" />
                      <p className="text-[12px] font-sans text-[#3D7A58]">{conflict.resolution}</p>
                    </div>
                  )}
                </div>

                {/* Expanded resolution workflow */}
                {expanded && conflict.status === "active" && (
                  <div className="border-t border-[#D8E8EE] p-5 bg-[#FAF8F4]">
                    <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#8AAABB] mb-3">RESOLUTION CHECKLIST</p>
                    <div className="space-y-2">
                      {resolutionChecklist.map((item, i) => (
                        <label key={i} className="flex items-center gap-2.5 cursor-pointer">
                          <input type="checkbox" className="rounded border-[#D8E8EE] text-[#7BAFC8] focus:ring-[#7BAFC8]" />
                          <span className="text-[13px] font-sans text-[#1A2C38]">{item}</span>
                        </label>
                      ))}
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await updateConflict(conflict.id, { status: "resolved", resolved_at: new Date().toISOString() });
                          setConflicts((prev: any[]) =>
                            prev.map((c) => c.id === conflict.id ? { ...c, status: "resolved", resolved_at: new Date().toISOString() } : c)
                          );
                          setExpandedId(null);
                        } catch (err) {
                          console.error("Failed to mark as resolved:", err);
                        }
                      }}
                      className="mt-4 bg-[#3D7A58] text-white rounded-[10px] px-4 py-2 text-[12px] font-sans font-500 hover:bg-[#3a7a4a]"
                    >
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
          <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#8AAABB] mb-4">EXCLUSIVITY TIMELINE</p>
          <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-5 space-y-4">
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
                      <div className={`h-2.5 w-2.5 rounded-full ${categoryColors[ex.category] || "bg-[#8AAABB]"}`} />
                      <span className="text-[13px] font-sans font-500 text-[#1A2C38]">{ex.creator}</span>
                      <span className="text-[12px] font-sans text-[#8AAABB]">— {ex.brand} ({ex.category})</span>
                    </div>
                    <span className={`text-[11px] font-mono ${isExpired ? "text-[#8AAABB]" : "text-[#1A2C38]"}`}>
                      {formatDate(ex.start)} → {formatDate(ex.end)}
                    </span>
                  </div>
                  <div className="h-[6px] bg-[#F2F8FB] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${isExpired ? "bg-[#8AAABB]" : "bg-[#7BAFC8]"}`} style={{ width: `${pct}%` }} />
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
