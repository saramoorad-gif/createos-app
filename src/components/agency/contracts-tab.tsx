"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import {
  agencyContracts, contractTemplates, exclusivityMap,
  contractStageLabels, contractStageColors,
  type AgencyContract, type ContractStage, type ContractTemplate
} from "@/lib/placeholder-data";
import { formatCurrency, formatDate, timeAgo } from "@/lib/utils";
import {
  X, Upload, FileText, AlertTriangle, CheckCircle2, Clock,
  Send, Shield, ChevronRight, Search, Copy, Eye
} from "lucide-react";


const scoreColors: Record<string, { bg: string; text: string }> = {
  Favorable: { bg: "bg-[#EBF5EB]", text: "text-[#4A9060]" },
  Neutral: { bg: "bg-[#FBF5EC]", text: "text-[#D4A030]" },
  "Needs Negotiation": { bg: "bg-[#FEF0EB]", text: "text-[#E05C3A]" },
  "Creator Unfavorable": { bg: "bg-[#FEF0EB]", text: "text-[#E05C3A]" },
};

const severityColors: Record<string, string> = {
  red: "bg-[#E05C3A]",
  amber: "bg-[#D4A030]",
  green: "bg-[#4A9060]",
};

const alertTypeLabels: Record<string, { label: string; bg: string; text: string }> = {
  expiring_soon: { label: "Expiring Soon", bg: "bg-[#FBF5EC]", text: "text-[#D4A030]" },
  usage_rights_expiring: { label: "Usage Rights", bg: "bg-[#FEF0EB]", text: "text-[#E05C3A]" },
  payment_due: { label: "Payment Due", bg: "bg-[#FBF5EC]", text: "text-[#D4A030]" },
  exclusivity_ending: { label: "Exclusivity", bg: "bg-[#F2EEE8]", text: "text-[#9A9088]" },
};

const categoryColors: Record<string, string> = {
  Fashion: "bg-[#C4714A]", Jewelry: "bg-[#D4A030]", Beauty: "bg-[#E05C3A]", Grocery: "bg-[#4A9060]",
};

type StageFilter = "all" | "draft" | "under_review" | "redlined" | "fully_executed" | "archived";
type ViewTab = "contracts" | "templates" | "exclusivity" | "alerts";

const stageFilterMap: Record<StageFilter, ContractStage[]> = {
  all: [],
  draft: ["draft", "sent_to_brand"],
  under_review: ["under_review"],
  redlined: ["redlined", "countersigned"],
  fully_executed: ["fully_executed"],
  archived: ["archived"],
};

/* ─── Helpers ───────────────────────────────────────────────────── */
function variableLabel(v: string): string {
  return v.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function allAlerts() {
  return agencyContracts.flatMap(c =>
    c.alerts.map(a => ({ ...a, contractBrand: c.brand, contractCreator: c.creator }))
  );
}

/* ─── Contract Detail Slide-over ────────────────────────────────── */
function ContractPanel({ contract, onClose }: { contract: AgencyContract; onClose: () => void }) {
  const stageStyle = contractStageColors[contract.stage];
  const analysis = contract.aiAnalysis;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-full max-w-[520px] bg-white border-l border-[#E5E0D8] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E5E0D8] px-6 py-4 z-10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[22px] font-serif text-[#1C1714]">{contract.brand}</h2>
            <button onClick={onClose} className="text-[#9A9088] hover:text-[#1C1714]"><X className="h-5 w-5" /></button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-sans text-[#9A9088]">{contract.type}</span>
            <span className={`text-[10px] font-sans font-500 uppercase tracking-[1.5px] px-2 py-0.5 rounded-full ${stageStyle.bg} ${stageStyle.text}`}>
              {contractStageLabels[contract.stage]}
            </span>
            {analysis && (
              <span className={`text-[10px] font-sans font-500 uppercase tracking-[1.5px] px-2 py-0.5 rounded-full ${scoreColors[analysis.overallScore]?.bg || "bg-[#F2EEE8]"} ${scoreColors[analysis.overallScore]?.text || "text-[#9A9088]"}`}>
                {analysis.overallScore}
              </span>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Value + dates bar */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#9A9088] mb-1">Value</p>
              <p className="text-[18px] font-serif text-[#1C1714]">{formatCurrency(contract.value)}</p>
            </div>
            <div>
              <p className="text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#9A9088] mb-1">Signed</p>
              <p className="text-[13px] font-mono text-[#1C1714]">{contract.signedDate ? formatDate(contract.signedDate) : "Not yet"}</p>
            </div>
            <div>
              <p className="text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#9A9088] mb-1">Expires</p>
              <p className="text-[13px] font-mono text-[#1C1714]">{formatDate(contract.expiryDate)}</p>
            </div>
          </div>

          <div className="border-t border-[#E5E0D8]" />

          {/* AI Analysis */}
          {analysis && (
            <>
              <div>
                <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#9A9088] mb-4">AI Analysis</p>

                {/* Payment Terms */}
                <div className="mb-4">
                  <p className="text-[11px] font-sans font-600 text-[#1C1714] mb-2">Payment Terms</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between"><span className="text-[12px] font-sans text-[#9A9088]">Amount</span><span className="text-[13px] font-sans font-500 text-[#1C1714]">{analysis.paymentAmount}</span></div>
                    <div className="flex justify-between"><span className="text-[12px] font-sans text-[#9A9088]">Schedule</span><span className="text-[13px] font-sans font-500 text-[#1C1714]">{analysis.paymentSchedule}</span></div>
                    <div className="flex justify-between"><span className="text-[12px] font-sans text-[#9A9088]">Late Clause</span><span className="text-[13px] font-sans font-500 text-[#1C1714]">{analysis.latePaymentClause}</span></div>
                    <div className="flex justify-between"><span className="text-[12px] font-sans text-[#9A9088]">Kill Fee</span><span className="text-[13px] font-sans font-500 text-[#1C1714]">{analysis.killFee}</span></div>
                  </div>
                </div>

                {/* Deliverables */}
                <div className="mb-4">
                  <p className="text-[11px] font-sans font-600 text-[#1C1714] mb-2">Deliverables</p>
                  <div className="space-y-1.5">
                    <div>
                      <span className="text-[12px] font-sans text-[#9A9088]">Items</span>
                      <ul className="mt-1 space-y-0.5">
                        {analysis.deliverablesList.map((d, i) => (
                          <li key={i} className="text-[13px] font-sans text-[#1C1714] pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[8px] before:h-[4px] before:w-[4px] before:rounded-full before:bg-[#9A9088]">{d}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex justify-between"><span className="text-[12px] font-sans text-[#9A9088]">Format</span><span className="text-[13px] font-sans font-500 text-[#1C1714]">{analysis.formatRequirements}</span></div>
                    <div className="flex justify-between"><span className="text-[12px] font-sans text-[#9A9088]">Revisions</span><span className="text-[13px] font-sans font-500 text-[#1C1714]">{analysis.revisionLimit}</span></div>
                    <div className="flex justify-between"><span className="text-[12px] font-sans text-[#9A9088]">Approval</span><span className="text-[13px] font-sans font-500 text-[#1C1714]">{analysis.approvalProcess}</span></div>
                    <div className="flex justify-between"><span className="text-[12px] font-sans text-[#9A9088]">Deadline</span><span className="text-[13px] font-sans font-500 text-[#1C1714]">{analysis.deadline}</span></div>
                  </div>
                </div>

                {/* Rights & Exclusivity */}
                <div className="mb-4">
                  <p className="text-[11px] font-sans font-600 text-[#1C1714] mb-2">Rights &amp; Exclusivity</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between"><span className="text-[12px] font-sans text-[#9A9088]">Usage Rights</span><span className="text-[13px] font-sans font-500 text-[#1C1714] text-right max-w-[260px]">{analysis.usageRights}</span></div>
                    <div className="flex justify-between"><span className="text-[12px] font-sans text-[#9A9088]">Category</span><span className="text-[13px] font-sans font-500 text-[#1C1714]">{analysis.exclusivityCategory}</span></div>
                    <div className="flex justify-between"><span className="text-[12px] font-sans text-[#9A9088]">Duration</span><span className="text-[13px] font-sans font-500 text-[#1C1714]">{analysis.exclusivityDuration}</span></div>
                    <div className="flex justify-between"><span className="text-[12px] font-sans text-[#9A9088]">Geographic</span><span className="text-[13px] font-sans font-500 text-[#1C1714]">{analysis.geographicRestrictions}</span></div>
                    <div className="flex justify-between"><span className="text-[12px] font-sans text-[#9A9088]">Platforms</span><span className="text-[13px] font-sans font-500 text-[#1C1714]">{analysis.platformRestrictions}</span></div>
                  </div>
                </div>

                {/* Risk Flags */}
                <div>
                  <p className="text-[11px] font-sans font-600 text-[#1C1714] mb-2">Risk Flags</p>
                  <div className="space-y-2">
                    {analysis.redFlags.map((flag, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className={`h-[8px] w-[8px] rounded-full mt-[5px] flex-shrink-0 ${severityColors[flag.severity]}`} />
                        <p className="text-[13px] font-sans text-[#1C1714] leading-[1.4]">{flag.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-[#E5E0D8]" />

              {/* Negotiation Suggestions */}
              {analysis.negotiationSuggestions.length > 0 && (
                <>
                  <div>
                    <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#9A9088] mb-3">Negotiation Suggestions</p>
                    <div className="space-y-2.5">
                      {analysis.negotiationSuggestions.map((s, i) => (
                        <div key={i} className="bg-[#F7F4EF] rounded-[10px] p-3.5">
                          <p className="text-[11px] font-sans font-600 text-[#C4714A] mb-1">{s.flag}</p>
                          <p className="text-[13px] font-sans text-[#1C1714] leading-[1.4]">{s.suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-[#E5E0D8]" />
                </>
              )}
            </>
          )}

          {/* Version History */}
          <div>
            <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#9A9088] mb-3">Version History</p>
            <div className="space-y-0">
              {contract.versions.map((v, i) => (
                <div key={v.id} className="relative pl-5 pb-4 last:pb-0">
                  {/* Timeline line */}
                  {i < contract.versions.length - 1 && (
                    <div className="absolute left-[7px] top-[14px] bottom-0 w-px bg-[#E5E0D8]" />
                  )}
                  {/* Timeline dot */}
                  <div className={`absolute left-0 top-[5px] h-[14px] w-[14px] rounded-full border-2 ${v.isFinal ? "border-[#4A9060] bg-[#EBF5EB]" : "border-[#E5E0D8] bg-white"}`} />
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[12px] font-sans font-600 text-[#1C1714]">v{v.versionNumber}</span>
                      {v.isFinal && <span className="text-[9px] font-sans font-600 uppercase tracking-[1.5px] text-[#4A9060] bg-[#EBF5EB] px-1.5 py-0.5 rounded-full">Final</span>}
                    </div>
                    <p className="text-[12px] font-mono text-[#9A9088] mb-0.5">{v.fileName}</p>
                    <p className="text-[13px] font-sans text-[#1C1714] leading-[1.4] mb-0.5">{v.notes}</p>
                    <p className="text-[11px] font-sans text-[#9A9088]">{timeAgo(v.uploadedAt)} by {v.uploadedBy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[#E5E0D8]" />

          {/* Signatures */}
          <div>
            <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#9A9088] mb-3">Signatures</p>
            <div className="space-y-2.5">
              {contract.signatures.map(sig => (
                <div key={sig.id} className="flex items-center justify-between bg-[#F7F4EF] rounded-[10px] p-3">
                  <div className="flex items-center gap-2.5">
                    {sig.status === "signed" ? (
                      <CheckCircle2 className="h-4 w-4 text-[#4A9060]" />
                    ) : (
                      <Clock className="h-4 w-4 text-[#D4A030]" />
                    )}
                    <div>
                      <p className="text-[13px] font-sans font-500 text-[#1C1714]">{sig.signerName}</p>
                      <p className="text-[11px] font-sans text-[#9A9088] capitalize">{sig.signerType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {sig.method && (
                      <span className="text-[9px] font-mono font-500 uppercase tracking-[1px] text-[#9A9088] border border-[#E5E0D8] rounded px-1.5 py-0.5">
                        {sig.method === "in_app" ? "In-App" : "DocuSign"}
                      </span>
                    )}
                    {sig.status === "signed" && sig.signedAt ? (
                      <span className="text-[11px] font-mono text-[#4A9060]">{formatDate(sig.signedAt)}</span>
                    ) : (
                      <button className="flex items-center gap-1 text-[11px] font-sans font-500 text-[#C4714A] hover:text-[#B05C38]">
                        <Send className="h-3 w-3" /> Send
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          {contract.alerts.filter(a => !a.dismissed).length > 0 && (
            <>
              <div className="border-t border-[#E5E0D8]" />
              <div>
                <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#9A9088] mb-3">Alerts</p>
                <div className="space-y-2">
                  {contract.alerts.filter(a => !a.dismissed).map(a => {
                    const aStyle = alertTypeLabels[a.alertType] || alertTypeLabels.expiring_soon;
                    return (
                      <div key={a.id} className="flex items-start gap-2.5 bg-[#F7F4EF] rounded-[10px] p-3">
                        <AlertTriangle className="h-3.5 w-3.5 text-[#D4A030] mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-[9px] font-sans font-600 uppercase tracking-[1.5px] px-1.5 py-0.5 rounded-full ${aStyle.bg} ${aStyle.text}`}>{aStyle.label}</span>
                            <span className="text-[11px] font-mono text-[#9A9088]">{formatDate(a.triggerDate)}</span>
                          </div>
                          <p className="text-[13px] font-sans text-[#1C1714]">{a.message}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <div className="border-t border-[#E5E0D8]" />

          {/* Actions */}
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 bg-[#C4714A] text-white rounded-[10px] px-3 py-2.5 text-[12px] font-sans font-500 hover:bg-[#B05C38]">
              <Send className="h-3.5 w-3.5" /> Send for Signature
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 border border-[#E5E0D8] text-[#1C1714] rounded-[10px] px-3 py-2.5 text-[12px] font-sans font-500 hover:bg-[#F7F4EF]">
              <Upload className="h-3.5 w-3.5" /> Upload Version
            </button>
          </div>
          <button className="w-full flex items-center justify-center gap-1.5 border border-[#E5E0D8] text-[#1C1714] rounded-[10px] px-3 py-2.5 text-[12px] font-sans font-500 hover:bg-[#F7F4EF]">
            <ChevronRight className="h-3.5 w-3.5" /> Move to Next Stage
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Template Editor Modal ─────────────────────────────────────── */
function TemplateEditorModal({ template, onClose }: { template: ContractTemplate; onClose: () => void }) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(template.variables.map(v => [v, ""]))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative bg-white rounded-[10px] border border-[#E5E0D8] w-full max-w-[480px] max-h-[80vh] overflow-y-auto shadow-lg">
        <div className="sticky top-0 bg-white border-b border-[#E5E0D8] px-6 py-4 flex items-center justify-between rounded-t-[10px]">
          <h2 className="text-[18px] font-serif text-[#1C1714]">{template.name}</h2>
          <button onClick={onClose} className="text-[#9A9088] hover:text-[#1C1714]"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-[13px] font-sans text-[#9A9088]">{template.description}</p>
          <div className="space-y-3">
            {template.variables.map(v => (
              <div key={v}>
                <label className="text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#9A9088] mb-1 block">{variableLabel(v)}</label>
                <input
                  type="text"
                  value={values[v]}
                  onChange={e => setValues(prev => ({ ...prev, [v]: e.target.value }))}
                  placeholder={variableLabel(v)}
                  className="w-full border border-[#E5E0D8] rounded-[8px] px-3 py-2 text-[13px] font-sans text-[#1C1714] placeholder:text-[#9A9088]/50 focus:outline-none focus:border-[#C4714A] bg-white"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 bg-[#C4714A] text-white rounded-[10px] px-3 py-2.5 text-[12px] font-sans font-500 hover:bg-[#B05C38]">
              <Eye className="h-3.5 w-3.5" /> Preview Contract
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 border border-[#E5E0D8] text-[#1C1714] rounded-[10px] px-3 py-2.5 text-[12px] font-sans font-500 hover:bg-[#F7F4EF]">
              <FileText className="h-3.5 w-3.5" /> Export PDF
            </button>
          </div>
          <button onClick={onClose} className="w-full text-center text-[12px] font-sans font-500 text-[#9A9088] hover:text-[#1C1714] py-1">Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────── */
export function ContractsTab() {
  const [selected, setSelected] = useState<AgencyContract | null>(null);
  const [view, setView] = useState<ViewTab>("contracts");
  const [stageFilter, setStageFilter] = useState<StageFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTemplate, setEditingTemplate] = useState<ContractTemplate | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const pending = agencyContracts.filter(c => c.status === "pending_signature").length;
  const active = agencyContracts.filter(c => c.status === "active").length;
  const totalAlerts = agencyContracts.reduce((acc, c) => acc + c.alerts.filter(a => !a.dismissed).length, 0);

  const filteredContracts = useMemo(() => {
    let list = agencyContracts;
    if (stageFilter !== "all") {
      const stages = stageFilterMap[stageFilter];
      list = list.filter(c => stages.includes(c.stage));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        c.creator.toLowerCase().includes(q) ||
        c.brand.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q)
      );
    }
    return list;
  }, [stageFilter, searchQuery]);

  const alerts = useMemo(() => {
    return allAlerts().filter(a => !a.dismissed && !dismissedAlerts.has(a.id));
  }, [dismissedAlerts]);

  const filterPills: { key: StageFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "draft", label: "Draft" },
    { key: "under_review", label: "Under Review" },
    { key: "redlined", label: "Redlined" },
    { key: "fully_executed", label: "Executed" },
    { key: "archived", label: "Archived" },
  ];

  const viewTabs: { key: ViewTab; label: string }[] = [
    { key: "contracts", label: "All Contracts" },
    { key: "templates", label: "Templates" },
    { key: "exclusivity", label: "Exclusivity Map" },
    { key: "alerts", label: "Alerts" },
  ];

  return (
    <div>
      <PageHeader
        headline={<>Contract <em className="italic text-[#C4714A]">manager</em></>}
        subheading="Central contract management across all creators and brands."
        stats={[
          { value: String(agencyContracts.length), label: "Total contracts" },
          { value: String(pending), label: "Pending signature" },
          { value: String(active), label: "Active" },
          { value: String(totalAlerts), label: "Alerts" },
        ]}
      />

      {/* View toggle tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1">
          {viewTabs.map(t => (
            <button key={t.key} onClick={() => setView(t.key)} className={`px-3 py-1.5 text-[10px] font-sans font-500 uppercase tracking-[1.5px] rounded-full transition-colors ${view === t.key ? "bg-[#1C1714] text-[#F7F4EF]" : "text-[#9A9088] hover:bg-[#F2EEE8]"}`}>
              {t.label}
              {t.key === "alerts" && totalAlerts > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center h-[16px] min-w-[16px] rounded-full bg-[#E05C3A] text-white text-[9px] font-600 px-1">{totalAlerts}</span>
              )}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1.5 bg-[#C4714A] text-white rounded-[10px] px-3.5 py-2 text-[12px] font-sans font-500 hover:bg-[#B05C38]">
          <Upload className="h-3.5 w-3.5" /> Upload Contract
        </button>
      </div>

      {/* ─── Contracts View ─────────────────────────────────────────── */}
      {view === "contracts" && (
        <>
          {/* Filters + search */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1">
              {filterPills.map(f => (
                <button key={f.key} onClick={() => setStageFilter(f.key)} className={`px-2.5 py-1 text-[10px] font-sans font-500 uppercase tracking-[1.5px] rounded-full transition-colors ${stageFilter === f.key ? "bg-[#1C1714] text-[#F7F4EF]" : "text-[#9A9088] hover:bg-[#F2EEE8]"}`}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9A9088]" />
              <input
                type="text"
                placeholder="Search contracts..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-[#E5E0D8] rounded-[8px] text-[12px] font-sans text-[#1C1714] placeholder:text-[#9A9088]/50 focus:outline-none focus:border-[#C4714A] w-[200px] bg-white"
              />
            </div>
          </div>

          {/* Contract table */}
          <div className="bg-white border border-[#E5E0D8] rounded-[10px] overflow-hidden">
            <div className="grid grid-cols-8 gap-3 px-5 py-3 text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#9A9088] border-b border-[#E5E0D8]">
              <span>Creator</span>
              <span>Brand</span>
              <span>Type</span>
              <span>Value</span>
              <span>Stage</span>
              <span>Expiry</span>
              <span>Signatures</span>
              <span className="text-right">Actions</span>
            </div>
            {filteredContracts.length === 0 ? (
              <div className="px-5 py-10 text-center text-[13px] font-sans text-[#9A9088]">No contracts match your filters.</div>
            ) : (
              filteredContracts.map(c => {
                const stg = contractStageColors[c.stage];
                const signed = c.signatures.filter(s => s.status === "signed").length;
                const total = c.signatures.length;
                return (
                  <div key={c.id} className={`grid grid-cols-8 gap-3 px-5 py-3.5 items-center border-b border-[#E5E0D8] last:border-b-0 hover:bg-[#F7F4EF]/50 ${c.status === "expired" ? "opacity-60" : ""}`}>
                    <span className="text-[13px] font-sans font-500 text-[#1C1714] truncate">{c.creator}</span>
                    <span className="text-[13px] font-sans text-[#1C1714] truncate">{c.brand}</span>
                    <span className="text-[12px] font-sans text-[#9A9088]">{c.type}</span>
                    <span className="text-[14px] font-serif text-[#1C1714]">{formatCurrency(c.value)}</span>
                    <span className={`text-[10px] font-sans font-500 uppercase tracking-[1.5px] px-2 py-0.5 rounded-full w-fit ${stg.bg} ${stg.text}`}>
                      {contractStageLabels[c.stage]}
                    </span>
                    <span className="text-[11px] font-mono text-[#9A9088]">{formatDate(c.expiryDate)}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[12px] font-sans text-[#4A9060]">{signed}</span>
                      <span className="text-[10px] font-sans text-[#9A9088]">/</span>
                      <span className="text-[12px] font-sans text-[#9A9088]">{total}</span>
                      {total - signed > 0 && (
                        <span className="text-[10px] font-sans text-[#D4A030] ml-1">({total - signed} pending)</span>
                      )}
                    </div>
                    <div className="text-right">
                      <button onClick={() => setSelected(c)} className="flex items-center gap-1 text-[11px] font-sans font-500 text-[#C4714A] hover:text-[#B05C38] ml-auto">
                        <Eye className="h-3 w-3" /> View
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* ─── Templates View ─────────────────────────────────────────── */}
      {view === "templates" && (
        <div>
          <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#9A9088] mb-4">CONTRACT TEMPLATES</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contractTemplates.map(tpl => (
              <div key={tpl.id} className="bg-white border border-[#E5E0D8] rounded-[10px] p-5 flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-9 w-9 rounded-[8px] bg-[#F7F4EF] flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-[#C4714A]" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-serif text-[#1C1714] leading-[1.2] mb-0.5">{tpl.name}</h3>
                    <span className="text-[10px] font-sans font-500 uppercase tracking-[1.5px] text-[#9A9088]">{tpl.type}</span>
                  </div>
                </div>
                <p className="text-[13px] font-sans text-[#9A9088] mb-3 leading-[1.4]">{tpl.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {tpl.variables.map(v => (
                    <span key={v} className="text-[10px] font-mono text-[#9A9088] bg-[#F7F4EF] rounded px-1.5 py-0.5">{variableLabel(v)}</span>
                  ))}
                </div>
                <div className="mt-auto">
                  <button onClick={() => setEditingTemplate(tpl)} className="w-full flex items-center justify-center gap-1.5 border border-[#E5E0D8] text-[#1C1714] rounded-[8px] px-3 py-2 text-[12px] font-sans font-500 hover:bg-[#F7F4EF]">
                    <Copy className="h-3.5 w-3.5" /> Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Exclusivity Map View ───────────────────────────────────── */}
      {view === "exclusivity" && (
        <div>
          <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#9A9088] mb-4">ACTIVE EXCLUSIVITIES</p>
          <div className="bg-white border border-[#E5E0D8] rounded-[10px] overflow-hidden">
            <div className="grid grid-cols-6 gap-4 px-5 py-3 text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#9A9088] border-b border-[#E5E0D8]">
              <span>Creator</span><span>Category</span><span>Brand</span><span>Start</span><span>End</span><span>Progress</span>
            </div>
            {exclusivityMap.map((ex, i) => {
              const startMs = new Date(ex.start).getTime();
              const endMs = new Date(ex.end).getTime();
              const nowMs = Date.now();
              const total = endMs - startMs;
              const elapsed = Math.max(0, Math.min(nowMs - startMs, total));
              const pct = total > 0 ? Math.round((elapsed / total) * 100) : 0;

              return (
                <div key={i} className="grid grid-cols-6 gap-4 px-5 py-3.5 items-center border-b border-[#E5E0D8] last:border-b-0">
                  <span className="text-[13px] font-sans font-500 text-[#1C1714]">{ex.creator}</span>
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${categoryColors[ex.category] || "bg-[#9A9088]"}`} />
                    <span className="text-[12px] font-sans text-[#1C1714]">{ex.category}</span>
                  </div>
                  <span className="text-[13px] font-sans text-[#9A9088]">{ex.brand}</span>
                  <span className="text-[11px] font-mono text-[#9A9088]">{formatDate(ex.start)}</span>
                  <span className="text-[11px] font-mono text-[#9A9088]">{formatDate(ex.end)}</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-[6px] bg-[#F2EEE8] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${pct >= 90 ? "bg-[#E05C3A]" : pct >= 70 ? "bg-[#D4A030]" : "bg-[#4A9060]"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-[#9A9088] w-[32px] text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Alerts View ────────────────────────────────────────────── */}
      {view === "alerts" && (
        <div>
          <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#9A9088] mb-4">ALL ALERTS</p>
          {alerts.length === 0 ? (
            <div className="bg-white border border-[#E5E0D8] rounded-[10px] px-5 py-10 text-center">
              <Shield className="h-8 w-8 text-[#4A9060] mx-auto mb-2" />
              <p className="text-[13px] font-sans text-[#9A9088]">No active alerts. All contracts are in good standing.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map(a => {
                const aStyle = alertTypeLabels[a.alertType] || alertTypeLabels.expiring_soon;
                return (
                  <div key={a.id} className="bg-white border border-[#E5E0D8] rounded-[10px] px-5 py-3.5 flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-[#D4A030] mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[13px] font-sans font-500 text-[#1C1714]">{a.contractBrand}</span>
                        <span className="text-[11px] font-sans text-[#9A9088]">{a.contractCreator}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-sans font-600 uppercase tracking-[1.5px] px-1.5 py-0.5 rounded-full ${aStyle.bg} ${aStyle.text}`}>{aStyle.label}</span>
                        <span className="text-[11px] font-mono text-[#9A9088]">{formatDate(a.triggerDate)}</span>
                      </div>
                      <p className="text-[13px] font-sans text-[#1C1714] leading-[1.4]">{a.message}</p>
                    </div>
                    <button
                      onClick={() => setDismissedAlerts(prev => new Set([...prev, a.id]))}
                      className="text-[#9A9088] hover:text-[#1C1714] flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── Modals / Panels ────────────────────────────────────────── */}
      {selected && <ContractPanel contract={selected} onClose={() => setSelected(null)} />}
      {editingTemplate && <TemplateEditorModal template={editingTemplate} onClose={() => setEditingTemplate(null)} />}
    </div>
  );
}
