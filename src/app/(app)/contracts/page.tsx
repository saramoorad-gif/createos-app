"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useSupabaseQuery } from "@/lib/hooks";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/global/toast";
import { TableSkeleton } from "@/components/global/skeleton";
import {
  Upload, FileText, Shield, AlertTriangle, CheckCircle2, XCircle,
  Sparkles, RefreshCw, X, DollarSign, Clock, Lock, Eye, ChevronRight,
} from "lucide-react";

interface ContractAnalysis {
  overall_score: string;
  summary: string;
  payment: { amount: string; terms: string; flag: string; note: string };
  usage_rights: { scope: string; duration: string; flag: string; note: string };
  exclusivity: { exists: boolean; category: string; duration: string; flag: string; note: string };
  red_flags: string[];
  yellow_flags: string[];
  green_flags: string[];
  missing_clauses: string[];
  negotiation_tips: string[];
  kill_fee: { exists: boolean; amount: string; flag: string };
  revision_limit: { exists: boolean; count: string; flag: string };
  estimated_value: string;
}

const scoreColors: Record<string, { bg: string; text: string; icon: any }> = {
  "Favorable": { bg: "bg-[#E8F4EE]", text: "text-[#3D7A58]", icon: CheckCircle2 },
  "Neutral": { bg: "bg-[#F2F8FB]", text: "text-[#3D6E8A]", icon: Shield },
  "Needs Negotiation": { bg: "bg-[#FFF8E8]", text: "text-[#A07830]", icon: AlertTriangle },
  "Creator Unfavorable": { bg: "bg-[#F4EAEA]", text: "text-[#A03D3D]", icon: XCircle },
};

const flagIcon = (flag: string) => {
  if (flag === "green") return <CheckCircle2 className="h-3.5 w-3.5 text-[#3D7A58]" />;
  if (flag === "yellow") return <AlertTriangle className="h-3.5 w-3.5 text-[#A07830]" />;
  return <XCircle className="h-3.5 w-3.5 text-[#A03D3D]" />;
};

export default function ContractsPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { data: deals } = useSupabaseQuery<any>("deals");

  const [contractText, setContractText] = useState("");
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [fileName, setFileName] = useState("");

  // Exclusivity conflicts
  const activeExclusivities = deals.filter((d: any) =>
    d.exclusivity_days && d.exclusivity_days > 0 && d.exclusivity_category &&
    ["contracted", "in_progress", "delivered"].includes(d.stage)
  );

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      const text = await file.text();
      setContractText(text);
      toast("success", `Loaded ${file.name}`);
    } else {
      // For PDF/DOC, we can't parse client-side — show paste option
      toast("info", "For best results, paste the contract text below");
    }
  }

  async function analyzeContract() {
    if (!contractText.trim()) {
      toast("error", "Please paste or upload contract text first");
      return;
    }
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const res = await fetch("/api/ai/review-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractText: contractText.trim(),
          creatorName: profile?.full_name || "Creator",
        }),
      });
      const data = await res.json();
      setAnalysis(data.analysis);
      toast("success", "Contract analysis complete");
    } catch (err) {
      console.error("Analysis failed:", err);
      toast("error", "Failed to analyze contract");
    } finally {
      setAnalyzing(false);
    }
  }

  const scoreStyle = analysis ? (scoreColors[analysis.overall_score] || scoreColors["Neutral"]) : null;

  return (
    <div>
      <PageHeader
        headline={<>Contract <em className="italic text-[#7BAFC8]">review</em></>}
        subheading="Upload or paste a contract for AI-powered analysis."
        stats={[
          { value: String(activeExclusivities.length), label: "Active exclusivities" },
          { value: String(deals.length), label: "Total deals" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        {/* Main area */}
        <div className="space-y-6">
          {/* Upload / Paste */}
          <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] overflow-hidden">
            <div className="px-5 py-3 border-b border-[#D8E8EE] flex items-center justify-between bg-[#FDFBF9]">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#7BAFC8]" />
                <span className="text-[12px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>
                  {fileName || "Paste or upload contract"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 border border-[#D8E8EE] rounded-[6px] px-3 py-1.5 text-[11px] font-sans text-[#4A6070] hover:border-[#7BAFC8] cursor-pointer transition-colors" style={{ fontWeight: 500 }}>
                  <Upload className="h-3 w-3" /> Upload file
                  <input type="file" accept=".txt,.pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
                </label>
                <button
                  onClick={analyzeContract}
                  disabled={analyzing || !contractText.trim()}
                  className="flex items-center gap-1.5 bg-[#1E3F52] text-white rounded-[6px] px-3 py-1.5 text-[11px] font-sans hover:bg-[#2a5269] transition-colors disabled:opacity-50"
                  style={{ fontWeight: 600 }}
                >
                  {analyzing ? (
                    <><RefreshCw className="h-3 w-3 animate-spin" /> Analyzing...</>
                  ) : (
                    <><Sparkles className="h-3 w-3" /> AI Review</>
                  )}
                </button>
              </div>
            </div>
            <textarea
              value={contractText}
              onChange={e => setContractText(e.target.value)}
              rows={14}
              placeholder="Paste the full contract text here...

The AI will analyze payment terms, usage rights, exclusivity clauses, red flags, and give you specific negotiation tips."
              className="w-full px-5 py-4 text-[13px] font-sans text-[#1A2C38] leading-relaxed focus:outline-none resize-none placeholder:text-[#8AAABB]/50"
            />
          </div>

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-4">
              {/* Score */}
              <div className={`${scoreStyle?.bg} border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5`}>
                <div className="flex items-center gap-3 mb-2">
                  {scoreStyle?.icon && <scoreStyle.icon className={`h-6 w-6 ${scoreStyle.text}`} />}
                  <h3 className={`text-[20px] font-serif ${scoreStyle?.text}`}>{analysis.overall_score}</h3>
                </div>
                <p className="text-[14px] font-sans text-[#1A2C38]">{analysis.summary}</p>
                {analysis.estimated_value && (
                  <p className="text-[12px] font-sans text-[#8AAABB] mt-2">Estimated fair value: {analysis.estimated_value}</p>
                )}
              </div>

              {/* Key Terms */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-[#7BAFC8]" />
                    <span className="text-[11px] font-sans uppercase tracking-[1.5px] text-[#8AAABB]" style={{ fontWeight: 600 }}>Payment</span>
                    {flagIcon(analysis.payment.flag)}
                  </div>
                  <p className="text-[16px] font-serif text-[#1A2C38]">{analysis.payment.amount}</p>
                  <p className="text-[12px] font-sans text-[#8AAABB] mt-1">{analysis.payment.terms}</p>
                  <p className="text-[11px] font-sans text-[#4A6070] mt-2">{analysis.payment.note}</p>
                </div>
                <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4 text-[#7BAFC8]" />
                    <span className="text-[11px] font-sans uppercase tracking-[1.5px] text-[#8AAABB]" style={{ fontWeight: 600 }}>Usage Rights</span>
                    {flagIcon(analysis.usage_rights.flag)}
                  </div>
                  <p className="text-[14px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>{analysis.usage_rights.duration}</p>
                  <p className="text-[12px] font-sans text-[#8AAABB] mt-1">{analysis.usage_rights.scope}</p>
                  <p className="text-[11px] font-sans text-[#4A6070] mt-2">{analysis.usage_rights.note}</p>
                </div>
                <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-4 w-4 text-[#7BAFC8]" />
                    <span className="text-[11px] font-sans uppercase tracking-[1.5px] text-[#8AAABB]" style={{ fontWeight: 600 }}>Exclusivity</span>
                    {flagIcon(analysis.exclusivity.flag)}
                  </div>
                  <p className="text-[14px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>
                    {analysis.exclusivity.exists ? analysis.exclusivity.duration : "None"}
                  </p>
                  <p className="text-[12px] font-sans text-[#8AAABB] mt-1">{analysis.exclusivity.category}</p>
                  <p className="text-[11px] font-sans text-[#4A6070] mt-2">{analysis.exclusivity.note}</p>
                </div>
              </div>

              {/* Flags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.red_flags.length > 0 && (
                  <div className="bg-[#F4EAEA] border-[1.5px] border-[#A03D3D]/20 rounded-[10px] p-4">
                    <p className="text-[11px] font-sans uppercase tracking-[1.5px] text-[#A03D3D] mb-3" style={{ fontWeight: 600 }}>RED FLAGS</p>
                    <ul className="space-y-2">
                      {analysis.red_flags.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12px] font-sans text-[#A03D3D]">
                          <XCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.yellow_flags.length > 0 && (
                  <div className="bg-[#FFF8E8] border-[1.5px] border-[#A07830]/20 rounded-[10px] p-4">
                    <p className="text-[11px] font-sans uppercase tracking-[1.5px] text-[#A07830] mb-3" style={{ fontWeight: 600 }}>WATCH OUT</p>
                    <ul className="space-y-2">
                      {analysis.yellow_flags.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12px] font-sans text-[#A07830]">
                          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.green_flags.length > 0 && (
                  <div className="bg-[#E8F4EE] border-[1.5px] border-[#3D7A58]/20 rounded-[10px] p-4">
                    <p className="text-[11px] font-sans uppercase tracking-[1.5px] text-[#3D7A58] mb-3" style={{ fontWeight: 600 }}>CREATOR FRIENDLY</p>
                    <ul className="space-y-2">
                      {analysis.green_flags.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12px] font-sans text-[#3D7A58]">
                          <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.missing_clauses.length > 0 && (
                  <div className="bg-[#F2F8FB] border-[1.5px] border-[#7BAFC8]/20 rounded-[10px] p-4">
                    <p className="text-[11px] font-sans uppercase tracking-[1.5px] text-[#3D6E8A] mb-3" style={{ fontWeight: 600 }}>MISSING CLAUSES</p>
                    <ul className="space-y-2">
                      {analysis.missing_clauses.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12px] font-sans text-[#3D6E8A]">
                          <ChevronRight className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Negotiation tips */}
              {analysis.negotiation_tips.length > 0 && (
                <div className="bg-gradient-to-r from-[#1E3F52] to-[#2a5269] rounded-[10px] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-[#7BAFC8]" />
                    <p className="text-[11px] font-sans uppercase tracking-[1.5px] text-white/80" style={{ fontWeight: 600 }}>AI NEGOTIATION TIPS</p>
                  </div>
                  <ul className="space-y-2">
                    {analysis.negotiation_tips.map((tip, i) => (
                      <li key={i} className="text-[13px] font-sans text-white/90 flex items-start gap-2">
                        <span className="text-[#7BAFC8] font-mono text-[11px] mt-0.5">{i + 1}.</span> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar — Exclusivity Conflicts */}
        <aside className="space-y-6">
          <div>
            <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-4" style={{ fontWeight: 600 }}>ACTIVE EXCLUSIVITIES</p>
            {activeExclusivities.length === 0 ? (
              <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5 text-center">
                <Lock className="h-6 w-6 text-[#D8E8EE] mx-auto mb-2" />
                <p className="text-[13px] font-serif italic text-[#8AAABB]">No active exclusivities</p>
                <p className="text-[11px] font-sans text-[#8AAABB] mt-1">When you have deals with exclusivity clauses, conflicts will be detected here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeExclusivities.map((deal: any) => {
                  const startDate = new Date(deal.created_at);
                  const endDate = new Date(startDate.getTime() + (deal.exclusivity_days * 86400000));
                  const now = new Date();
                  const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / 86400000);
                  const progress = Math.min(100, Math.max(0, ((deal.exclusivity_days - daysLeft) / deal.exclusivity_days) * 100));
                  const isExpiring = daysLeft <= 7;

                  return (
                    <div key={deal.id} className={`bg-white border-[1.5px] rounded-[10px] p-4 ${isExpiring ? "border-[#A07830]" : "border-[#D8E8EE]"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>{deal.brand_name}</span>
                        <span className={`text-[10px] font-mono ${isExpiring ? "text-[#A07830]" : "text-[#8AAABB]"}`}>
                          {daysLeft > 0 ? `${daysLeft}d left` : "Expired"}
                        </span>
                      </div>
                      <span className="text-[10px] font-sans uppercase tracking-[1.5px] px-1.5 py-0.5 rounded bg-[#F4EAEA] text-[#A03D3D]" style={{ fontWeight: 600 }}>
                        {deal.exclusivity_category}
                      </span>
                      <div className="mt-3 h-[4px] w-full bg-[#D8E8EE] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{
                          width: `${progress}%`,
                          background: isExpiring ? "#A07830" : "#7BAFC8",
                        }} />
                      </div>
                      <p className="text-[10px] font-mono text-[#8AAABB] mt-1">
                        {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Conflict checker */}
          {activeExclusivities.length > 0 && (
            <div className="bg-[#FFF8E8] border-[1.5px] border-[#A07830]/20 rounded-[10px] p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-[#A07830]" />
                <p className="text-[11px] font-sans uppercase tracking-[1.5px] text-[#A07830]" style={{ fontWeight: 600 }}>CONFLICT CHECK</p>
              </div>
              <p className="text-[12px] font-sans text-[#A07830]">
                Before signing a new deal, check if the brand&apos;s category conflicts with your active exclusivities above.
              </p>
              <div className="mt-3 space-y-1">
                <p className="text-[10px] font-sans text-[#8AAABB] uppercase tracking-[1px]" style={{ fontWeight: 600 }}>Blocked categories:</p>
                <div className="flex flex-wrap gap-1.5">
                  {[...new Set(activeExclusivities.map((d: any) => d.exclusivity_category))].map((cat: string) => (
                    <span key={cat} className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-[#A03D3D]/10 text-[#A03D3D]" style={{ fontWeight: 500 }}>{cat}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick tips */}
          <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-4">
            <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-3" style={{ fontWeight: 600 }}>CONTRACT TIPS</p>
            <ul className="space-y-2.5">
              {[
                "Always get payment terms in writing (NET-30 or less)",
                "Limit usage rights to 12 months unless paid extra",
                "Negotiate a kill fee of at least 50%",
                "Cap revisions at 2 rounds",
                "Keep content ownership — license, don't sell",
                "Require approval timeline (3-5 business days)",
              ].map((tip, i) => (
                <li key={i} className="text-[12px] font-sans text-[#4A6070] flex items-start gap-2">
                  <CheckCircle2 className="h-3 w-3 text-[#7BAFC8] mt-0.5 flex-shrink-0" /> {tip}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
