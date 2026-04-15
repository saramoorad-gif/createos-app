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
  Copy, Download,
} from "lucide-react";

interface CreatorTemplate {
  id: string;
  name: string;
  description: string;
  variables: string[];
  body: string;
}

const creatorTemplates: CreatorTemplate[] = [
  {
    id: "ct_1", name: "UGC Content Agreement", description: "Standard UGC agreement — use when a brand sends you a deal with no contract.",
    variables: ["creator_name", "brand_name", "deliverables", "payment_amount", "payment_terms", "usage_rights", "revision_limit", "content_deadline"],
    body: `CONTENT CREATION AGREEMENT

This Content Creation Agreement ("Agreement") is entered into as of the date of last signature below.

CREATOR: {{creator_name}}
BRAND/CLIENT: {{brand_name}}

1. SCOPE OF WORK
Creator agrees to produce the following deliverables: {{deliverables}}
All content must be delivered by: {{content_deadline}}

2. COMPENSATION
Brand agrees to pay Creator {{payment_amount}} under the following terms: {{payment_terms}}
Payment is due within 30 days of content delivery unless otherwise specified above.

3. USAGE RIGHTS
Brand is granted the following usage rights: {{usage_rights}}
All usage rights begin upon full payment. Creator retains ownership of all original content.

4. REVISIONS
Creator will provide up to {{revision_limit}} rounds of revisions at no additional cost. Additional revisions will be billed at Creator's standard hourly rate.

5. CONTENT APPROVAL
Brand must approve or request revisions within 5 business days of delivery. Failure to respond constitutes approval.

6. CANCELLATION
If Brand cancels after signing, a kill fee of 50% of the total compensation is due. If Creator has begun work, full compensation is due.

7. CONFIDENTIALITY
Both parties agree to keep the terms of this agreement confidential unless mutually agreed otherwise.

8. INDEPENDENT CONTRACTOR
Creator is an independent contractor and not an employee of Brand.

SIGNATURES:
Creator: _____________________ Date: _________
Brand:   _____________________ Date: _________`,
  },
  {
    id: "ct_2", name: "Influencer Partnership", description: "Full influencer campaign agreement with exclusivity and kill fee protections.",
    variables: ["creator_name", "brand_name", "deliverables", "payment_amount", "exclusivity_category", "exclusivity_duration", "kill_fee", "content_deadline"],
    body: `INFLUENCER PARTNERSHIP AGREEMENT

This Influencer Partnership Agreement ("Agreement") is entered into as of the date of last signature.

INFLUENCER: {{creator_name}}
BRAND: {{brand_name}}

1. CAMPAIGN DELIVERABLES
Influencer agrees to create and publish the following: {{deliverables}}
Content delivery deadline: {{content_deadline}}

2. COMPENSATION
Brand shall pay Influencer {{payment_amount}} within 30 days of campaign completion.

3. EXCLUSIVITY
Influencer agrees to an exclusivity period of {{exclusivity_duration}} in the {{exclusivity_category}} category. During this period, Influencer will not promote competing brands in this category.

4. KILL FEE
If Brand cancels this agreement after execution, Brand shall pay Influencer a kill fee of {{kill_fee}}.

5. CONTENT OWNERSHIP & LICENSING
Influencer retains ownership of all content created. Brand receives a license to repost, reshare, and use content on Brand's owned channels for 12 months unless otherwise negotiated.

6. WHITELISTING / PAID AMPLIFICATION
Any paid amplification (whitelisting, dark posting, boosting) of Influencer's content by Brand requires separate written approval and additional compensation.

7. FTC COMPLIANCE
Influencer agrees to comply with all FTC disclosure guidelines, including proper use of #ad or #sponsored tags.

8. APPROVAL PROCESS
Brand must approve all content within 3 business days of submission. Silence constitutes approval.

SIGNATURES:
Influencer: _____________________ Date: _________
Brand:      _____________________ Date: _________`,
  },
  {
    id: "ct_3", name: "Usage Rights Extension", description: "Extend usage rights on existing content — use when a brand wants to keep using your content longer.",
    variables: ["creator_name", "brand_name", "original_agreement_date", "extension_duration", "payment_amount", "usage_rights"],
    body: `USAGE RIGHTS EXTENSION AGREEMENT

CREATOR: {{creator_name}}
BRAND: {{brand_name}}
ORIGINAL AGREEMENT DATE: {{original_agreement_date}}

1. EXTENSION OF RIGHTS
The usage rights granted in the original agreement are hereby extended for an additional period of {{extension_duration}}.

2. EXTENDED RIGHTS SCOPE
The following usage rights are granted for the extension period: {{usage_rights}}

3. COMPENSATION
Brand agrees to pay Creator {{payment_amount}} for this extension. Payment is due within 15 days of signing.

4. ALL OTHER TERMS
All other terms and conditions of the original agreement remain in full force and effect.

SIGNATURES:
Creator: _____________________ Date: _________
Brand:   _____________________ Date: _________`,
  },
];

function variableLabel(v: string): string {
  return v.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

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

  const [view, setView] = useState<"review" | "templates">("templates");
  const [contractText, setContractText] = useState("");
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [fileName, setFileName] = useState("");
  const [activeTemplate, setActiveTemplate] = useState<CreatorTemplate | null>(null);
  const [templateValues, setTemplateValues] = useState<Record<string, string>>({});

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

  function openTemplate(tpl: CreatorTemplate) {
    setActiveTemplate(tpl);
    setTemplateValues(Object.fromEntries(tpl.variables.map(v => [v, ""])));
  }

  function getFilledTemplate(): string {
    if (!activeTemplate) return "";
    return activeTemplate.body.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return templateValues[key] || `[${variableLabel(key)}]`;
    });
  }

  function copyTemplate() {
    const text = getFilledTemplate();
    navigator.clipboard.writeText(text);
    toast("success", "Contract copied to clipboard");
  }

  function sendToReview() {
    const text = getFilledTemplate();
    setContractText(text);
    setActiveTemplate(null);
    setView("review");
    toast("info", "Template loaded — click AI Review to analyze");
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
        headline={<>Your <em className="italic text-[#7BAFC8]">contracts</em></>}
        subheading="Templates, AI review, and exclusivity tracking."
        stats={[
          { value: String(creatorTemplates.length), label: "Templates" },
          { value: String(activeExclusivities.length), label: "Exclusivities" },
          { value: String(deals.length), label: "Total deals" },
        ]}
      />

      {/* View toggle */}
      <div className="flex items-center gap-1 mb-6">
        {([
          { key: "templates" as const, label: "Templates", icon: FileText },
          { key: "review" as const, label: "AI Review", icon: Sparkles },
        ]).map(v => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-sans uppercase tracking-[1.5px] rounded-full transition-colors ${
              view === v.key ? "bg-[#1A2C38] text-[#FAF8F4]" : "text-[#8AAABB] hover:bg-[#F2F8FB]"
            }`}
            style={{ fontWeight: 500 }}
          >
            <v.icon className="h-3 w-3" />
            {v.label}
          </button>
        ))}
      </div>

      {/* ─── Templates View ──────────────────────────── */}
      {view === "templates" && !activeTemplate && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {creatorTemplates.map(tpl => (
            <div key={tpl.id} className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5 flex flex-col hover:border-[#7BAFC8] transition-colors">
              <div className="flex items-start gap-3 mb-3">
                <div className="h-10 w-10 rounded-[10px] bg-[#F2F8FB] flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-[#7BAFC8]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>{tpl.name}</h3>
                  <p className="text-[12px] font-sans text-[#8AAABB] mt-0.5">{tpl.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {tpl.variables.slice(0, 5).map(v => (
                  <span key={v} className="text-[10px] font-mono text-[#8AAABB] bg-[#FAF8F4] rounded px-1.5 py-0.5">{variableLabel(v)}</span>
                ))}
                {tpl.variables.length > 5 && <span className="text-[10px] font-mono text-[#8AAABB]">+{tpl.variables.length - 5}</span>}
              </div>
              <button
                onClick={() => openTemplate(tpl)}
                className="mt-auto w-full flex items-center justify-center gap-1.5 bg-[#1E3F52] text-white rounded-[8px] px-3 py-2.5 text-[12px] font-sans hover:bg-[#2a5269] transition-colors"
                style={{ fontWeight: 600 }}
              >
                <Copy className="h-3.5 w-3.5" /> Use Template
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ─── Template Editor ─────────────────────────── */}
      {view === "templates" && activeTemplate && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveTemplate(null)} className="text-[12px] font-sans text-[#7BAFC8] hover:underline" style={{ fontWeight: 500 }}>← Back to templates</button>
              <span className="text-[#D8E8EE]">|</span>
              <h3 className="text-[16px] font-serif text-[#1A2C38]">{activeTemplate.name}</h3>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={copyTemplate} className="flex items-center gap-1.5 border-[1.5px] border-[#D8E8EE] rounded-[8px] px-3 py-2 text-[11px] font-sans text-[#4A6070] hover:border-[#7BAFC8] transition-colors" style={{ fontWeight: 500 }}>
                <Copy className="h-3 w-3" /> Copy
              </button>
              <button onClick={sendToReview} className="flex items-center gap-1.5 bg-[#1E3F52] text-white rounded-[8px] px-3 py-2 text-[11px] font-sans hover:bg-[#2a5269] transition-colors" style={{ fontWeight: 600 }}>
                <Sparkles className="h-3 w-3" /> Send to AI Review
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
            {/* Variables form */}
            <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5">
              <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-4" style={{ fontWeight: 600 }}>FILL IN DETAILS</p>
              <div className="space-y-3">
                {activeTemplate.variables.map(v => (
                  <div key={v}>
                    <label className="text-[10px] font-sans uppercase tracking-[1.5px] text-[#8AAABB] mb-1 block" style={{ fontWeight: 600 }}>{variableLabel(v)}</label>
                    <input
                      type="text"
                      value={templateValues[v] || ""}
                      onChange={e => setTemplateValues(prev => ({ ...prev, [v]: e.target.value }))}
                      placeholder={variableLabel(v)}
                      className="w-full border-[1.5px] border-[#D8E8EE] rounded-[8px] px-3 py-2 text-[13px] font-sans text-[#1A2C38] placeholder:text-[#8AAABB]/40 focus:outline-none focus:border-[#7BAFC8]"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Live preview */}
            <div className="bg-[#FDFBF9] border-[1.5px] border-[#D8E8EE] rounded-[10px] p-6 overflow-y-auto" style={{ maxHeight: "600px" }}>
              <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-4" style={{ fontWeight: 600 }}>LIVE PREVIEW</p>
              <div className="bg-white border border-[#D8E8EE] rounded-[8px] p-6">
                <pre className="text-[12px] font-sans text-[#1A2C38] whitespace-pre-wrap leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {getFilledTemplate()}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── AI Review View ──────────────────────────── */}
      {view === "review" && (
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
                  {Array.from(new Set(activeExclusivities.map((d: any) => d.exclusivity_category))).filter(Boolean).map((cat: any) => (
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
      )}
    </div>
  );
}
