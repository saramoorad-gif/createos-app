// @ts-nocheck
"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useSupabaseQuery, useSupabaseMutation } from "@/lib/hooks";
import { formatCurrency, formatDate, timeAgo } from "@/lib/utils";
import { useToast } from "@/components/global/toast";
import { TableSkeleton } from "@/components/global/skeleton";
import { ContextMenu } from "@/components/global/context-menu";

// Types formerly from placeholder-data
type ContractStage = "draft" | "sent_to_brand" | "under_review" | "redlined" | "countersigned" | "fully_executed" | "archived";

const contractStageLabels: Record<ContractStage, string> = {
  draft: "Draft", sent_to_brand: "Sent to Brand", under_review: "Under Review",
  redlined: "Redlined", countersigned: "Countersigned", fully_executed: "Fully Executed", archived: "Archived",
};

const contractStageColors: Record<ContractStage, { bg: string; text: string }> = {
  draft: { bg: "bg-[#F2EEE8]", text: "text-[#9A9088]" },
  sent_to_brand: { bg: "bg-[#FBF5EC]", text: "text-[#D4A030]" },
  under_review: { bg: "bg-[#FBF5EC]", text: "text-[#D4A030]" },
  redlined: { bg: "bg-[#FEF0EB]", text: "text-[#E05C3A]" },
  countersigned: { bg: "bg-[#EBF5EB]", text: "text-[#4A9060]" },
  fully_executed: { bg: "bg-[#EBF5EB]", text: "text-[#4A9060]" },
  archived: { bg: "bg-[#F2EEE8]", text: "text-[#9A9088]" },
};

interface ContractTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  variables: string[];
}

interface AgencyContract {
  id: string;
  creator: string;
  creatorId: string;
  brand: string;
  type: string;
  value: number;
  signedDate: string | null;
  expiryDate: string;
  exclusivityCategory: string | null;
  exclusivityDays: number | null;
  stage: ContractStage;
  status: "active" | "expired" | "pending_signature" | "disputed";
  aiAnalysis: any;
  legacyAnalysis: any;
  fileName: string;
  versions: any[];
  signatures: any[];
  alerts: any[];
}
import {
  X, Upload, FileText, AlertTriangle, CheckCircle2, Clock,
  Send, Shield, ChevronRight, Search, Copy, Eye
} from "lucide-react";


const scoreColors: Record<string, { bg: string; text: string }> = {
  Favorable: { bg: "bg-[#E8F4EE]", text: "text-[#3D7A58]" },
  Neutral: { bg: "bg-[#F4EEE0]", text: "text-[#A07830]" },
  "Needs Negotiation": { bg: "bg-[#F4EAEA]", text: "text-[#A03D3D]" },
  "Creator Unfavorable": { bg: "bg-[#F4EAEA]", text: "text-[#A03D3D]" },
};

const severityColors: Record<string, string> = {
  red: "bg-[#A03D3D]",
  amber: "bg-[#A07830]",
  green: "bg-[#3D7A58]",
};

const alertTypeLabels: Record<string, { label: string; bg: string; text: string }> = {
  expiring_soon: { label: "Expiring Soon", bg: "bg-[#F4EEE0]", text: "text-[#A07830]" },
  usage_rights_expiring: { label: "Usage Rights", bg: "bg-[#F4EAEA]", text: "text-[#A03D3D]" },
  payment_due: { label: "Payment Due", bg: "bg-[#F4EEE0]", text: "text-[#A07830]" },
  exclusivity_ending: { label: "Exclusivity", bg: "bg-[#F2F8FB]", text: "text-[#8AAABB]" },
};

const categoryColors: Record<string, string> = {
  Fashion: "bg-[#7BAFC8]", Jewelry: "bg-[#A07830]", Beauty: "bg-[#A03D3D]", Grocery: "bg-[#3D7A58]",
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

function allAlerts(contracts: AgencyContract[]) {
  return contracts.flatMap(c =>
    (c.alerts || []).map((a: any) => ({ ...a, contractBrand: c.brand, contractCreator: c.creator }))
  );
}

/* ─── Contract Detail Slide-over ────────────────────────────────── */
const contractStageOrder: ContractStage[] = ["draft", "sent_to_brand", "under_review", "redlined", "countersigned", "fully_executed", "archived"];

function getNextStage(current: ContractStage): ContractStage | null {
  const idx = contractStageOrder.indexOf(current);
  if (idx === -1 || idx >= contractStageOrder.length - 1) return null;
  return contractStageOrder[idx + 1];
}

function ContractPanel({ contract, onClose, onUpdate }: { contract: AgencyContract; onClose: () => void; onUpdate: (id: string, data: Partial<AgencyContract>) => Promise<void> }) {
  const stageStyle = contractStageColors[contract.stage];
  const analysis = contract.aiAnalysis;
  const { toast } = useToast();

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-full max-w-[520px] bg-white border-l border-[#D8E8EE] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#D8E8EE] px-6 py-4 z-10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[22px] font-serif text-[#1A2C38]">{contract.brand}</h2>
            <button onClick={onClose} className="text-[#8AAABB] hover:text-[#1A2C38]"><X className="h-5 w-5" /></button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-sans text-[#8AAABB]">{contract.type}</span>
            <span className={`text-[10px] font-sans font-500 uppercase tracking-[1.5px] px-2 py-0.5 rounded-full ${stageStyle.bg} ${stageStyle.text}`}>
              {contractStageLabels[contract.stage]}
            </span>
            {analysis && (
              <span className={`text-[10px] font-sans font-500 uppercase tracking-[1.5px] px-2 py-0.5 rounded-full ${scoreColors[analysis.overallScore]?.bg || "bg-[#F2F8FB]"} ${scoreColors[analysis.overallScore]?.text || "text-[#8AAABB]"}`}>
                {analysis.overallScore}
              </span>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Value + dates bar */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#8AAABB] mb-1">Value</p>
              <p className="text-[18px] font-serif text-[#1A2C38]">{formatCurrency(contract.value)}</p>
            </div>
            <div>
              <p className="text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#8AAABB] mb-1">Signed</p>
              <p className="text-[13px] font-mono text-[#1A2C38]">{contract.signedDate ? formatDate(contract.signedDate) : "Not yet"}</p>
            </div>
            <div>
              <p className="text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#8AAABB] mb-1">Expires</p>
              <p className="text-[13px] font-mono text-[#1A2C38]">{formatDate(contract.expiryDate)}</p>
            </div>
          </div>

          <div className="border-t border-[#D8E8EE]" />

          {/* AI Analysis */}
          {analysis && (
            <>
              <div>
                <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#8AAABB] mb-4">AI Analysis</p>

                {/* Payment Terms */}
                <div className="mb-4">
                  <p className="text-[11px] font-sans font-600 text-[#1A2C38] mb-2">Payment Terms</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between"><span className="text-[12px] font-sans text-[#8AAABB]">Amount</span><span className="text-[13px] font-sans font-500 text-[#1A2C38]">{analysis.paymentAmount}</span></div>
                    <div className="flex justify-between"><span className="text-[12px] font-sans text-[#8AAABB]">Schedule</span><span className="text-[13px] font-sans font-500 text-[#1A2C38]">{analysis.paymentSchedule}</span></div>
                    <div className="flex justify-between"><span className="text-[12px] font-sans text-[#8AAABB]">Late Clause</span><span className="text-[13px] font-sans font-500 text-[#1A2C38]">{analysis.latePaymentClause}</span></div>
                    <div className="flex justify-between"><span className="text-[12px] font-sans text-[#8AAABB]">Kill Fee</span><span className="text-[13px] font-sans font-500 text-[#1A2C38]">{analysis.killFee}</span></div>
                  </div>
                </div>

                {/* Deliverables */}
                <div className="mb-4">
                  <p className="text-[11px] font-sans font-600 text-[#1A2C38] mb-2">Deliverables</p>
                  <div className="space-y-1.5">
                    <div>
                      <span className="text-[12px] font-sans text-[#8AAABB]">Items</span>
                      <ul className="mt-1 space-y-0.5">
                        {analysis.deliverablesList.map((d: string, i: number) => (
                          <li key={i} className="text-[13px] font-sans text-[#1A2C38] pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[8px] before:h-[4px] before:w-[4px] before:rounded-full before:bg-[#8AAABB]">{d}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex justify-between"><span className="text-[12px] font-sans text-[#8AAABB]">Format</span><span className="text-[13px] font-sans font-500 text-[#1A2C38]">{analysis.formatRequirements}</span></div>
                    <div className="flex justify-between"><span className="text-[12px] font-sans text-[#8AAABB]">Revisions</span><span className="text-[13px] font-sans font-500 text-[#1A2C38]">{analysis.revisionLimit}</span></div>
                    <div className="flex justify-between"><span className="text-[12px] font-sans text-[#8AAABB]">Approval</span><span className="text-[13px] font-sans font-500 text-[#1A2C38]">{analysis.approvalProcess}</span></div>
                    <div className="flex justify-between"><span className="text-[12px] font-sans text-[#8AAABB]">Deadline</span><span className="text-[13px] font-sans font-500 text-[#1A2C38]">{analysis.deadline}</span></div>
                  </div>
                </div>

                {/* Rights & Exclusivity */}
                <div className="mb-4">
                  <p className="text-[11px] font-sans font-600 text-[#1A2C38] mb-2">Rights &amp; Exclusivity</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between"><span className="text-[12px] font-sans text-[#8AAABB]">Usage Rights</span><span className="text-[13px] font-sans font-500 text-[#1A2C38] text-right max-w-[260px]">{analysis.usageRights}</span></div>
                    <div className="flex justify-between"><span className="text-[12px] font-sans text-[#8AAABB]">Category</span><span className="text-[13px] font-sans font-500 text-[#1A2C38]">{analysis.exclusivityCategory}</span></div>
                    <div className="flex justify-between"><span className="text-[12px] font-sans text-[#8AAABB]">Duration</span><span className="text-[13px] font-sans font-500 text-[#1A2C38]">{analysis.exclusivityDuration}</span></div>
                    <div className="flex justify-between"><span className="text-[12px] font-sans text-[#8AAABB]">Geographic</span><span className="text-[13px] font-sans font-500 text-[#1A2C38]">{analysis.geographicRestrictions}</span></div>
                    <div className="flex justify-between"><span className="text-[12px] font-sans text-[#8AAABB]">Platforms</span><span className="text-[13px] font-sans font-500 text-[#1A2C38]">{analysis.platformRestrictions}</span></div>
                  </div>
                </div>

                {/* Risk Flags */}
                <div>
                  <p className="text-[11px] font-sans font-600 text-[#1A2C38] mb-2">Risk Flags</p>
                  <div className="space-y-2">
                    {analysis.redFlags.map((flag: {text: string; severity: string}, i: number) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className={`h-[8px] w-[8px] rounded-full mt-[5px] flex-shrink-0 ${severityColors[flag.severity]}`} />
                        <p className="text-[13px] font-sans text-[#1A2C38] leading-[1.4]">{flag.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-[#D8E8EE]" />

              {/* Negotiation Suggestions */}
              {analysis.negotiationSuggestions.length > 0 && (
                <>
                  <div>
                    <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#8AAABB] mb-3">Negotiation Suggestions</p>
                    <div className="space-y-2.5">
                      {analysis.negotiationSuggestions.map((s: {flag: string; suggestion: string}, i: number) => (
                        <div key={i} className="bg-[#FAF8F4] rounded-[10px] p-3.5">
                          <p className="text-[11px] font-sans font-600 text-[#7BAFC8] mb-1">{s.flag}</p>
                          <p className="text-[13px] font-sans text-[#1A2C38] leading-[1.4]">{s.suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-[#D8E8EE]" />
                </>
              )}
            </>
          )}

          {/* Version History */}
          <div>
            <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#8AAABB] mb-3">Version History</p>
            <div className="space-y-0">
              {contract.versions.map((v: {id: string; versionNumber: number; fileName: string; notes: string; uploadedAt: string; uploadedBy: string; isFinal: boolean}, i: number) => (
                <div key={v.id} className="relative pl-5 pb-4 last:pb-0">
                  {/* Timeline line */}
                  {i < contract.versions.length - 1 && (
                    <div className="absolute left-[7px] top-[14px] bottom-0 w-px bg-[#D8E8EE]" />
                  )}
                  {/* Timeline dot */}
                  <div className={`absolute left-0 top-[5px] h-[14px] w-[14px] rounded-full border-2 ${v.isFinal ? "border-[#3D7A58] bg-[#E8F4EE]" : "border-[#D8E8EE] bg-white"}`} />
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[12px] font-sans font-600 text-[#1A2C38]">v{v.versionNumber}</span>
                      {v.isFinal && <span className="text-[9px] font-sans font-600 uppercase tracking-[1.5px] text-[#3D7A58] bg-[#E8F4EE] px-1.5 py-0.5 rounded-full">Final</span>}
                    </div>
                    <p className="text-[12px] font-mono text-[#8AAABB] mb-0.5">{v.fileName}</p>
                    <p className="text-[13px] font-sans text-[#1A2C38] leading-[1.4] mb-0.5">{v.notes}</p>
                    <p className="text-[11px] font-sans text-[#8AAABB]">{timeAgo(v.uploadedAt)} by {v.uploadedBy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[#D8E8EE]" />

          {/* Signatures */}
          <div>
            <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#8AAABB] mb-3">Signatures</p>
            <div className="space-y-2.5">
              {contract.signatures.map(sig => (
                <div key={sig.id} className="flex items-center justify-between bg-[#FAF8F4] rounded-[10px] p-3">
                  <div className="flex items-center gap-2.5">
                    {sig.status === "signed" ? (
                      <CheckCircle2 className="h-4 w-4 text-[#3D7A58]" />
                    ) : (
                      <Clock className="h-4 w-4 text-[#A07830]" />
                    )}
                    <div>
                      <p className="text-[13px] font-sans font-500 text-[#1A2C38]">{sig.signerName}</p>
                      <p className="text-[11px] font-sans text-[#8AAABB] capitalize">{sig.signerType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {sig.method && (
                      <span className="text-[9px] font-mono font-500 uppercase tracking-[1px] text-[#8AAABB] border border-[#D8E8EE] rounded px-1.5 py-0.5">
                        {sig.method === "in_app" ? "In-App" : "DocuSign"}
                      </span>
                    )}
                    {sig.status === "signed" && sig.signedAt ? (
                      <span className="text-[11px] font-mono text-[#3D7A58]">{formatDate(sig.signedAt)}</span>
                    ) : (
                      <button className="flex items-center gap-1 text-[11px] font-sans font-500 text-[#7BAFC8] hover:text-[#6AA0BB]">
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
              <div className="border-t border-[#D8E8EE]" />
              <div>
                <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#8AAABB] mb-3">Alerts</p>
                <div className="space-y-2">
                  {contract.alerts.filter(a => !a.dismissed).map(a => {
                    const aStyle = alertTypeLabels[a.alertType] || alertTypeLabels.expiring_soon;
                    return (
                      <div key={a.id} className="flex items-start gap-2.5 bg-[#FAF8F4] rounded-[10px] p-3">
                        <AlertTriangle className="h-3.5 w-3.5 text-[#A07830] mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-[9px] font-sans font-600 uppercase tracking-[1.5px] px-1.5 py-0.5 rounded-full ${aStyle.bg} ${aStyle.text}`}>{aStyle.label}</span>
                            <span className="text-[11px] font-mono text-[#8AAABB]">{formatDate(a.triggerDate)}</span>
                          </div>
                          <p className="text-[13px] font-sans text-[#1A2C38]">{a.message}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <div className="border-t border-[#D8E8EE]" />

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={async () => {
                try {
                  await onUpdate(contract.id, { stage: "sent_to_brand" });
                  onClose();
                } catch (err) {
                  console.error("Failed to send for signature:", err);
                }
              }}
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#7BAFC8] text-white rounded-[10px] px-3 py-2.5 text-[12px] font-sans font-500 hover:bg-[#6AA0BB]"
            >
              <Send className="h-3.5 w-3.5" /> Send for Signature
            </button>
            <button
              onClick={async () => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".pdf,.doc,.docx";
                input.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (!file) return;
                  const formData = new FormData();
                  formData.append("file", file);
                  formData.append("folder", "contracts");
                  try {
                    const res = await fetch("/api/upload", { method: "POST", body: formData });
                    const data = await res.json();
                    if (data.url) toast("success", "Contract uploaded: " + file.name);
                    else toast("error", "Upload failed — please try again");
                  } catch { toast("error", "Upload failed — please try again"); }
                };
                input.click();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 border border-[#D8E8EE] text-[#1A2C38] rounded-[10px] px-3 py-2.5 text-[12px] font-sans font-500 hover:bg-[#FAF8F4]"
            >
              <Upload className="h-3.5 w-3.5" /> Upload Version
            </button>
          </div>
          <button
            onClick={async () => {
              const next = getNextStage(contract.stage);
              if (!next) return;
              try {
                await onUpdate(contract.id, { stage: next });
                onClose();
              } catch (err) {
                console.error("Failed to move to next stage:", err);
              }
            }}
            className="w-full flex items-center justify-center gap-1.5 border border-[#D8E8EE] text-[#1A2C38] rounded-[10px] px-3 py-2.5 text-[12px] font-sans font-500 hover:bg-[#FAF8F4]"
          >
            <ChevronRight className="h-3.5 w-3.5" /> Move to Next Stage
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Template Editor Modal ─────────────────────────────────────── */
function TemplateEditorModal({ template, onClose, onCreateDraft }: { template: ContractTemplate; onClose: () => void; onCreateDraft: (data: any) => Promise<void> }) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(template.variables.map(v => [v, ""]))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative bg-white rounded-[10px] border border-[#D8E8EE] w-full max-w-[480px] max-h-[80vh] overflow-y-auto shadow-lg">
        <div className="sticky top-0 bg-white border-b border-[#D8E8EE] px-6 py-4 flex items-center justify-between rounded-t-[10px]">
          <h2 className="text-[18px] font-serif text-[#1A2C38]">{template.name}</h2>
          <button onClick={onClose} className="text-[#8AAABB] hover:text-[#1A2C38]"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-[13px] font-sans text-[#8AAABB]">{template.description}</p>
          <div className="space-y-3">
            {template.variables.map(v => (
              <div key={v}>
                <label className="text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#8AAABB] mb-1 block">{variableLabel(v)}</label>
                <input
                  type="text"
                  value={values[v]}
                  onChange={e => setValues(prev => ({ ...prev, [v]: e.target.value }))}
                  placeholder={variableLabel(v)}
                  className="w-full border border-[#D8E8EE] rounded-[8px] px-3 py-2 text-[13px] font-sans text-[#1A2C38] placeholder:text-[#8AAABB]/50 focus:outline-none focus:border-[#7BAFC8] bg-white"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={async () => {
                try {
                  await onCreateDraft({
                    stage: "draft",
                    type: template.type,
                    templateId: template.id,
                    templateValues: values,
                    creator: values.creator_name || "",
                    brand: values.brand_name || "",
                    value: Number(values.deal_value) || 0,
                    status: "pending_signature",
                  });
                  onClose();
                } catch (err) {
                  console.error("Failed to create contract draft:", err);
                }
              }}
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#7BAFC8] text-white rounded-[10px] px-3 py-2.5 text-[12px] font-sans font-500 hover:bg-[#6AA0BB]"
            >
              <Eye className="h-3.5 w-3.5" /> Create Draft
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 flex items-center justify-center gap-1.5 border border-[#D8E8EE] text-[#1A2C38] rounded-[10px] px-3 py-2.5 text-[12px] font-sans font-500 hover:bg-[#FAF8F4]"
            >
              <FileText className="h-3.5 w-3.5" /> Export PDF
            </button>
          </div>
          <button onClick={onClose} className="w-full text-center text-[12px] font-sans font-500 text-[#8AAABB] hover:text-[#1A2C38] py-1">Cancel</button>
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
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const { data: agencyContracts, loading, setData: setContracts } = useSupabaseQuery<AgencyContract>("contracts");
  const { data: dbTemplates } = useSupabaseQuery<ContractTemplate>("contract_templates");

  // Default templates shown when no custom templates exist
  const defaultTemplates: ContractTemplate[] = [
    { id: "tpl_1", name: "UGC Content Agreement", type: "ugc", description: "Standard agreement for UGC content creation with usage rights and payment terms.", variables: ["creator_name", "brand_name", "deliverables", "payment_amount", "payment_terms", "usage_rights", "revision_limit", "content_deadline"] },
    { id: "tpl_2", name: "Influencer Partnership", type: "influencer", description: "Full partnership agreement for influencer campaigns with exclusivity and kill fee.", variables: ["creator_name", "brand_name", "deliverables", "payment_amount", "exclusivity_category", "exclusivity_duration", "kill_fee", "content_deadline"] },
    { id: "tpl_3", name: "Usage Rights Extension", type: "extension", description: "Extend usage rights on existing content beyond the original agreement.", variables: ["creator_name", "brand_name", "extension_duration", "payment_amount", "usage_rights"] },
    { id: "tpl_4", name: "Ambassador Retainer", type: "ambassador", description: "Long-term brand ambassador retainer with monthly deliverables.", variables: ["creator_name", "brand_name", "monthly_retainer", "deliverables", "exclusivity_category", "term_length"] },
    { id: "tpl_5", name: "Talent Representation", type: "representation", description: "Agreement between agency and creator for talent representation.", variables: ["creator_name", "agency_name", "commission_rate", "term_length", "termination_notice"] },
  ];

  const contractTemplates = dbTemplates.length > 0 ? dbTemplates : defaultTemplates;
  const { data: exclusivityMap } = useSupabaseQuery<any>("exclusivity_map");
  const { update: updateContract, insert: insertContract } = useSupabaseMutation("contracts");
  const { toast } = useToast();

  async function handleContractUpdate(id: string, data: Partial<AgencyContract>) {
    try {
      await updateContract(id, data);
      setContracts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data } : c))
      );
      if (data.stage) {
        toast("success", "Contract stage updated");
      }
    } catch (err) {
      console.error("Failed to update contract:", err);
      throw err;
    }
  }

  async function handleCreateDraft(data: any) {
    try {
      const newContract = await insertContract(data);
      if (newContract) {
        setContracts((prev) => [...prev, newContract as AgencyContract]);
      }
    } catch (err) {
      console.error("Failed to create contract draft:", err);
      throw err;
    }
  }

  if (loading) {
    return <TableSkeleton rows={6} cols={8} />;
  }

  if (!loading && agencyContracts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="font-serif italic text-[16px] text-[#8AAABB] mb-4">No contracts yet</p>
        <div className="flex gap-3">
          <button onClick={() => setView("templates")} className="rounded-[8px] bg-[#1E3F52] px-5 py-2.5 text-[13px] font-medium text-white hover:bg-[#2a5269]">
            Create from template →
          </button>
          <button onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".pdf,.doc,.docx";
            input.onchange = async (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (!file) return;
              const formData = new FormData();
              formData.append("file", file);
              formData.append("folder", "contracts");
              try {
                const res = await fetch("/api/upload", { method: "POST", body: formData });
                const data = await res.json();
                if (data.url) toast("success", "Contract uploaded: " + file.name);
              } catch { toast("error", "Upload failed"); }
            };
            input.click();
          }} className="rounded-[8px] border-[1.5px] border-[#D8E8EE] px-5 py-2.5 text-[13px] font-medium text-[#1A2C38] hover:bg-[#F2F8FB]">
            Upload PDF
          </button>
        </div>
      </div>
    );
  }

  const pending = agencyContracts.filter(c => c.status === "pending_signature").length;
  const active = agencyContracts.filter(c => c.status === "active").length;
  const totalAlerts = agencyContracts.reduce((acc, c) => acc + (c.alerts || []).filter((a: any) => !a.dismissed).length, 0);

  const filteredContracts = (() => {
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
  })();

  const alerts = allAlerts(agencyContracts).filter(a => !a.dismissed && !dismissedAlerts.includes(a.id));

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
        headline={<>Contract <em className="italic text-[#7BAFC8]">manager</em></>}
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
            <button key={t.key} onClick={() => setView(t.key)} className={`px-3 py-1.5 text-[10px] font-sans font-500 uppercase tracking-[1.5px] rounded-full transition-colors ${view === t.key ? "bg-[#1A2C38] text-[#FAF8F4]" : "text-[#8AAABB] hover:bg-[#F2F8FB]"}`}>
              {t.label}
              {t.key === "alerts" && totalAlerts > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center h-[16px] min-w-[16px] rounded-full bg-[#A03D3D] text-white text-[9px] font-600 px-1">{totalAlerts}</span>
              )}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1.5 bg-[#7BAFC8] text-white rounded-[10px] px-3.5 py-2 text-[12px] font-sans font-500 hover:bg-[#6AA0BB]">
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
                <button key={f.key} onClick={() => setStageFilter(f.key)} className={`px-2.5 py-1 text-[10px] font-sans font-500 uppercase tracking-[1.5px] rounded-full transition-colors ${stageFilter === f.key ? "bg-[#1A2C38] text-[#FAF8F4]" : "text-[#8AAABB] hover:bg-[#F2F8FB]"}`}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8AAABB]" />
              <input
                type="text"
                placeholder="Search contracts..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-[#D8E8EE] rounded-[8px] text-[12px] font-sans text-[#1A2C38] placeholder:text-[#8AAABB]/50 focus:outline-none focus:border-[#7BAFC8] w-[200px] bg-white"
              />
            </div>
          </div>

          {/* Contract table */}
          <div className="bg-white border border-[#D8E8EE] rounded-[10px] overflow-hidden">
            <div className="grid grid-cols-8 gap-3 px-5 py-3 text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#8AAABB] border-b border-[#D8E8EE]">
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
              <div className="px-5 py-10 text-center text-[13px] font-sans text-[#8AAABB]">No contracts match your filters.</div>
            ) : (
              filteredContracts.map(c => {
                const stg = contractStageColors[c.stage];
                const signed = c.signatures.filter(s => s.status === "signed").length;
                const total = c.signatures.length;
                return (
                  <ContextMenu
                    key={c.id}
                    items={[
                      { label: "View", onClick: () => setSelected(c) },
                      { label: "Send for signature", onClick: () => handleContractUpdate(c.id, { stage: "sent_to_brand" }) },
                      { label: "Move stage", onClick: () => { const next = getNextStage(c.stage); if (next) handleContractUpdate(c.id, { stage: next }); } },
                    ]}
                  >
                  <div className={`grid grid-cols-8 gap-3 px-5 py-3.5 items-center border-b border-[#D8E8EE] last:border-b-0 hover:bg-[#FAF8F4]/50 ${c.status === "expired" ? "opacity-60" : ""}`}>
                    <span className="text-[13px] font-sans font-500 text-[#1A2C38] truncate">{c.creator}</span>
                    <span className="text-[13px] font-sans text-[#1A2C38] truncate">{c.brand}</span>
                    <span className="text-[12px] font-sans text-[#8AAABB]">{c.type}</span>
                    <span className="text-[14px] font-serif text-[#1A2C38]">{formatCurrency(c.value)}</span>
                    <span className={`text-[10px] font-sans font-500 uppercase tracking-[1.5px] px-2 py-0.5 rounded-full w-fit ${stg.bg} ${stg.text}`}>
                      {contractStageLabels[c.stage]}
                    </span>
                    <span className="text-[11px] font-mono text-[#8AAABB]">{formatDate(c.expiryDate)}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[12px] font-sans text-[#3D7A58]">{signed}</span>
                      <span className="text-[10px] font-sans text-[#8AAABB]">/</span>
                      <span className="text-[12px] font-sans text-[#8AAABB]">{total}</span>
                      {total - signed > 0 && (
                        <span className="text-[10px] font-sans text-[#A07830] ml-1">({total - signed} pending)</span>
                      )}
                    </div>
                    <div className="text-right">
                      <button onClick={() => setSelected(c)} className="flex items-center gap-1 text-[11px] font-sans font-500 text-[#7BAFC8] hover:text-[#6AA0BB] ml-auto">
                        <Eye className="h-3 w-3" /> View
                      </button>
                    </div>
                  </div>
                  </ContextMenu>
                );
              })
            )}
          </div>
        </>
      )}

      {/* ─── Templates View ─────────────────────────────────────────── */}
      {view === "templates" && (
        <div>
          <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#8AAABB] mb-4">CONTRACT TEMPLATES</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contractTemplates.map(tpl => (
              <div key={tpl.id} className="bg-white border border-[#D8E8EE] rounded-[10px] p-5 flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-9 w-9 rounded-[8px] bg-[#FAF8F4] flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-[#7BAFC8]" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-serif text-[#1A2C38] leading-[1.2] mb-0.5">{tpl.name}</h3>
                    <span className="text-[10px] font-sans font-500 uppercase tracking-[1.5px] text-[#8AAABB]">{tpl.type}</span>
                  </div>
                </div>
                <p className="text-[13px] font-sans text-[#8AAABB] mb-3 leading-[1.4]">{tpl.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {tpl.variables.map(v => (
                    <span key={v} className="text-[10px] font-mono text-[#8AAABB] bg-[#FAF8F4] rounded px-1.5 py-0.5">{variableLabel(v)}</span>
                  ))}
                </div>
                <div className="mt-auto">
                  <button onClick={() => setEditingTemplate(tpl)} className="w-full flex items-center justify-center gap-1.5 border border-[#D8E8EE] text-[#1A2C38] rounded-[8px] px-3 py-2 text-[12px] font-sans font-500 hover:bg-[#FAF8F4]">
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
          <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#8AAABB] mb-4">ACTIVE EXCLUSIVITIES</p>
          <div className="bg-white border border-[#D8E8EE] rounded-[10px] overflow-hidden">
            <div className="grid grid-cols-6 gap-4 px-5 py-3 text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#8AAABB] border-b border-[#D8E8EE]">
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
                <div key={i} className="grid grid-cols-6 gap-4 px-5 py-3.5 items-center border-b border-[#D8E8EE] last:border-b-0">
                  <span className="text-[13px] font-sans font-500 text-[#1A2C38]">{ex.creator}</span>
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${categoryColors[ex.category] || "bg-[#8AAABB]"}`} />
                    <span className="text-[12px] font-sans text-[#1A2C38]">{ex.category}</span>
                  </div>
                  <span className="text-[13px] font-sans text-[#8AAABB]">{ex.brand}</span>
                  <span className="text-[11px] font-mono text-[#8AAABB]">{formatDate(ex.start)}</span>
                  <span className="text-[11px] font-mono text-[#8AAABB]">{formatDate(ex.end)}</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-[6px] bg-[#F2F8FB] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${pct >= 90 ? "bg-[#A03D3D]" : pct >= 70 ? "bg-[#A07830]" : "bg-[#3D7A58]"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-[#8AAABB] w-[32px] text-right">{pct}%</span>
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
          <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#8AAABB] mb-4">ALL ALERTS</p>
          {alerts.length === 0 ? (
            <div className="bg-white border border-[#D8E8EE] rounded-[10px] px-5 py-10 text-center">
              <Shield className="h-8 w-8 text-[#3D7A58] mx-auto mb-2" />
              <p className="text-[13px] font-sans text-[#8AAABB]">No active alerts. All contracts are in good standing.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map(a => {
                const aStyle = alertTypeLabels[a.alertType] || alertTypeLabels.expiring_soon;
                return (
                  <div key={a.id} className="bg-white border border-[#D8E8EE] rounded-[10px] px-5 py-3.5 flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-[#A07830] mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[13px] font-sans font-500 text-[#1A2C38]">{a.contractBrand}</span>
                        <span className="text-[11px] font-sans text-[#8AAABB]">{a.contractCreator}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-sans font-600 uppercase tracking-[1.5px] px-1.5 py-0.5 rounded-full ${aStyle.bg} ${aStyle.text}`}>{aStyle.label}</span>
                        <span className="text-[11px] font-mono text-[#8AAABB]">{formatDate(a.triggerDate)}</span>
                      </div>
                      <p className="text-[13px] font-sans text-[#1A2C38] leading-[1.4]">{a.message}</p>
                    </div>
                    <button
                      onClick={() => setDismissedAlerts(prev => [...prev, a.id])}
                      className="text-[#8AAABB] hover:text-[#1A2C38] flex-shrink-0"
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
      {selected && <ContractPanel contract={selected} onClose={() => setSelected(null)} onUpdate={handleContractUpdate} />}
      {editingTemplate && <TemplateEditorModal template={editingTemplate} onClose={() => setEditingTemplate(null)} onCreateDraft={handleCreateDraft} />}
    </div>
  );
}
