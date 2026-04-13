"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { agencyContracts, exclusivityMap, type AgencyContract } from "@/lib/placeholder-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { X, Upload, AlertTriangle } from "lucide-react";

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-[#EBF5EB]", text: "text-[#4A9060]", label: "Active" },
  expired: { bg: "bg-[#F2EEE8]", text: "text-[#9A9088]", label: "Expired" },
  pending_signature: { bg: "bg-[#FBF5EC]", text: "text-[#D4A030]", label: "Pending Signature" },
  disputed: { bg: "bg-[#FEF0EB]", text: "text-[#E05C3A]", label: "Disputed" },
};

const categoryColors: Record<string, string> = {
  Fashion: "bg-[#C4714A]", Jewelry: "bg-[#D4A030]", Beauty: "bg-[#E05C3A]", Grocery: "bg-[#4A9060]",
};

function ContractPanel({ contract, onClose }: { contract: AgencyContract; onClose: () => void }) {
  const status = statusStyles[contract.status];
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-full max-w-[480px] bg-white border-l border-[#E5E0D8] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[#E5E0D8] px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-[20px] font-serif text-[#1C1714]">{contract.brand} Contract</h2>
          <button onClick={onClose} className="text-[#9A9088] hover:text-[#1C1714]"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-sans font-500 uppercase tracking-[1.5px] px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>{status.label}</span>
            <span className="text-[12px] font-sans text-[#9A9088]">{contract.creator}</span>
          </div>

          <div className="space-y-2 divide-y divide-[#E5E0D8]">
            {([["Type", contract.type], ["Value", formatCurrency(contract.value)], ["Signed", contract.signedDate ? formatDate(contract.signedDate) : "Not yet"], ["Expires", formatDate(contract.expiryDate)], ["Exclusivity", contract.exclusivityCategory ? `${contract.exclusivityCategory} — ${contract.exclusivityDays}d` : "None"], ["File", contract.fileName]] as [string, string][]).map(([k, v]) => (
              <div key={k} className="flex justify-between pt-2"><span className="text-[12px] font-sans text-[#9A9088]">{k}</span><span className="text-[13px] font-sans font-500 text-[#1C1714]">{v}</span></div>
            ))}
          </div>

          {contract.aiAnalysis && (
            <div>
              <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#9A9088] mb-3">AI ANALYSIS</p>
              <div className="space-y-2">
                {Object.entries(contract.aiAnalysis).filter(([k]) => k !== "redFlags").map(([key, val]) => (
                  <div key={key} className="bg-[#F7F4EF] rounded-lg p-3">
                    <p className="text-[10px] font-sans font-500 uppercase tracking-[1.5px] text-[#9A9088] mb-0.5">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                    <p className="text-[13px] font-sans text-[#1C1714]">{val as string}</p>
                  </div>
                ))}
                {contract.aiAnalysis.redFlags.length > 0 && (
                  <div className="bg-[#FEF0EB] border border-[#E05C3A]/20 rounded-lg p-3">
                    <p className="text-[10px] font-sans font-600 uppercase tracking-[1.5px] text-[#E05C3A] mb-2">RED FLAGS</p>
                    {contract.aiAnalysis.redFlags.map((flag, i) => (
                      <div key={i} className="flex items-start gap-2 mb-1.5 last:mb-0">
                        <AlertTriangle className="h-3 w-3 text-[#E05C3A] mt-0.5 flex-shrink-0" />
                        <p className="text-[12px] font-sans text-[#E05C3A]">{flag}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ContractsTab() {
  const [selected, setSelected] = useState<AgencyContract | null>(null);
  const [view, setView] = useState<"list" | "exclusivity">("list");

  const pending = agencyContracts.filter(c => c.status === "pending_signature").length;
  const expiringSoon = agencyContracts.filter(c => c.status === "active").length;

  return (
    <div>
      <PageHeader
        headline={<>Contract <em className="italic text-[#C4714A]">manager</em></>}
        subheading="Central contract management across all creators and brands."
        stats={[
          { value: String(agencyContracts.length), label: "Total contracts" },
          { value: String(pending), label: "Pending signature" },
          { value: String(expiringSoon), label: "Active" },
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1">
          {(["list", "exclusivity"] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-3 py-1 text-[10px] font-sans font-500 uppercase tracking-[1.5px] rounded-full ${view === v ? "bg-[#1C1714] text-[#F7F4EF]" : "text-[#9A9088] hover:bg-[#F2EEE8]"}`}>
              {v === "list" ? "All Contracts" : "Exclusivity Map"}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1.5 bg-[#C4714A] text-white rounded-[10px] px-3.5 py-2 text-[12px] font-sans font-500 hover:bg-[#B05C38]">
          <Upload className="h-3.5 w-3.5" /> Upload Contract
        </button>
      </div>

      {view === "list" && (
        <div className="bg-white border border-[#E5E0D8] rounded-[10px] overflow-hidden">
          <div className="grid grid-cols-7 gap-4 px-5 py-3 text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#9A9088] border-b border-[#E5E0D8]">
            <span>Creator</span><span>Brand</span><span>Type</span><span>Value</span><span>Exclusivity</span><span>Expires</span><span>Status</span>
          </div>
          {agencyContracts.map(c => {
            const s = statusStyles[c.status];
            return (
              <div key={c.id} onClick={() => setSelected(c)} className={`grid grid-cols-7 gap-4 px-5 py-3.5 items-center border-b border-[#E5E0D8] last:border-b-0 cursor-pointer hover:bg-[#F7F4EF]/50 ${c.status === "expired" ? "opacity-60" : ""}`}>
                <span className="text-[13px] font-sans font-500 text-[#1C1714]">{c.creator}</span>
                <span className="text-[13px] font-sans text-[#1C1714]">{c.brand}</span>
                <span className="text-[12px] font-sans text-[#9A9088]">{c.type}</span>
                <span className="text-[14px] font-serif text-[#1C1714]">{formatCurrency(c.value)}</span>
                <span className="text-[12px] font-sans text-[#9A9088]">{c.exclusivityCategory ? `${c.exclusivityCategory} ${c.exclusivityDays}d` : "—"}</span>
                <span className="text-[11px] font-mono text-[#9A9088]">{formatDate(c.expiryDate)}</span>
                <span className={`text-[10px] font-sans font-500 uppercase tracking-[1.5px] px-2 py-0.5 rounded-full w-fit ${s.bg} ${s.text}`}>{s.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {view === "exclusivity" && (
        <div>
          <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#9A9088] mb-4">ACTIVE EXCLUSIVITIES</p>
          <div className="bg-white border border-[#E5E0D8] rounded-[10px] overflow-hidden">
            <div className="grid grid-cols-5 gap-4 px-5 py-3 text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#9A9088] border-b border-[#E5E0D8]">
              <span>Creator</span><span>Category</span><span>Brand</span><span>Start</span><span>End</span>
            </div>
            {exclusivityMap.map((ex, i) => (
              <div key={i} className="grid grid-cols-5 gap-4 px-5 py-3.5 items-center border-b border-[#E5E0D8] last:border-b-0">
                <span className="text-[13px] font-sans font-500 text-[#1C1714]">{ex.creator}</span>
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${categoryColors[ex.category] || "bg-[#9A9088]"}`} />
                  <span className="text-[12px] font-sans text-[#1C1714]">{ex.category}</span>
                </div>
                <span className="text-[13px] font-sans text-[#9A9088]">{ex.brand}</span>
                <span className="text-[11px] font-mono text-[#9A9088]">{formatDate(ex.start)}</span>
                <span className="text-[11px] font-mono text-[#9A9088]">{formatDate(ex.end)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selected && <ContractPanel contract={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
