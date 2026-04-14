"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/contexts/auth-context";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Download } from "lucide-react";

type ImportType = "deals" | "invoices";

const templates = {
  deals: "brand_name,value,deliverables,platform,stage,due_date,deal_type,notes\nGlossier,2800,2 TikTok + 1 Reel,tiktok,contracted,2026-05-01,influencer,Spring campaign",
  invoices: "brand_name,amount,status,due_date\nGlossier,2800,sent,2026-05-15",
};

export default function ImportPage() {
  const { user } = useAuth();
  const [importType, setImportType] = useState<ImportType>("deals");
  const [csvText, setCsvText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; count?: number; error?: string } | null>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const text = await f.text();
    setCsvText(text);
    setResult(null);
  }

  async function handleImport() {
    if (!csvText.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: csvText, type: importType }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ success: true, count: data.imported });
        setCsvText("");
        setFile(null);
      } else {
        setResult({ success: false, error: data.error });
      }
    } catch {
      setResult({ success: false, error: "Import failed. Please check your file format." });
    }
    setLoading(false);
  }

  function downloadTemplate() {
    const blob = new Blob([templates[importType]], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `createsuite-${importType}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const inputClass = "w-full rounded-btn border-[1.5px] border-[#D8E8EE] px-3 py-2.5 text-[14px] font-sans text-[#1A2C38] bg-white focus:outline-none focus:border-[#7BAFC8]";

  return (
    <div>
      <PageHeader
        headline={<>Import your <em className="italic text-[#7BAFC8]">data</em></>}
        subheading="Upload a CSV or paste data from Google Sheets or Excel to import your existing deals and invoices."
      />

      <div className="max-w-2xl">
        {/* Import type selector */}
        <div className="flex items-center gap-2 mb-6">
          {(["deals", "invoices"] as ImportType[]).map(t => (
            <button key={t} onClick={() => { setImportType(t); setResult(null); setCsvText(""); }} className={`px-4 py-2 text-[12px] font-sans uppercase tracking-[1.5px] rounded-full transition-colors ${importType === t ? "bg-[#1E3F52] text-white" : "text-[#8AAABB] hover:bg-[#F2F8FB]"}`} style={{ fontWeight: 500 }}>
              {t}
            </button>
          ))}
        </div>

        {/* Template download */}
        <div className="bg-[#F2F8FB] border-[1.5px] border-[#D8E8EE] rounded-card p-4 flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-5 w-5 text-[#7BAFC8]" />
            <div>
              <p className="text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>Download CSV template</p>
              <p className="text-[12px] font-sans text-[#8AAABB]">Use this template to format your {importType} data correctly</p>
            </div>
          </div>
          <button onClick={downloadTemplate} className="flex items-center gap-1.5 border-[1.5px] border-[#D8E8EE] rounded-btn px-3 py-2 text-[12px] font-sans text-[#1A2C38] hover:bg-white" style={{ fontWeight: 500 }}>
            <Download className="h-3.5 w-3.5" /> Download
          </button>
        </div>

        {/* File upload */}
        <div className="mb-4">
          <p className="text-[11px] font-sans text-[#8AAABB] uppercase tracking-[1.5px] mb-2" style={{ fontWeight: 600 }}>UPLOAD CSV FILE</p>
          <label className="block border-[1.5px] border-dashed border-[#D8E8EE] rounded-card p-8 text-center cursor-pointer hover:border-[#7BAFC8] transition-colors">
            <Upload className="h-6 w-6 text-[#8AAABB] mx-auto mb-2" />
            <p className="text-[13px] font-sans text-[#4A6070]">
              {file ? file.name : "Drop your CSV here or click to browse"}
            </p>
            <p className="text-[11px] font-sans text-[#8AAABB] mt-1">Supports .csv files exported from Google Sheets or Excel</p>
            <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* Or paste */}
        <div className="mb-4">
          <p className="text-[11px] font-sans text-[#8AAABB] uppercase tracking-[1.5px] mb-2" style={{ fontWeight: 600 }}>OR PASTE CSV DATA</p>
          <textarea value={csvText} onChange={e => { setCsvText(e.target.value); setResult(null); }} rows={6} placeholder={`Paste your CSV data here...\n\nExample:\n${templates[importType]}`} className={`${inputClass} resize-none font-mono text-[12px]`} />
        </div>

        {/* Result */}
        {result && (
          <div className={`flex items-center gap-2 rounded-card border-[1.5px] px-4 py-3 mb-4 ${result.success ? "border-[#3D7A58]/20 bg-[#E8F4EE]" : "border-[#A03D3D]/20 bg-[#F4EAEA]"}`}>
            {result.success ? (
              <><CheckCircle2 className="h-4 w-4 text-[#3D7A58]" /><p className="text-[13px] font-sans text-[#3D7A58]" style={{ fontWeight: 500 }}>Successfully imported {result.count} {importType}!</p></>
            ) : (
              <><AlertCircle className="h-4 w-4 text-[#A03D3D]" /><p className="text-[13px] font-sans text-[#A03D3D]" style={{ fontWeight: 500 }}>{result.error}</p></>
            )}
          </div>
        )}

        {/* Import button */}
        <button onClick={handleImport} disabled={!csvText.trim() || loading} className="w-full bg-[#1E3F52] text-white rounded-btn px-4 py-3 text-[14px] font-sans disabled:opacity-50 hover:bg-[#2a5269] transition-colors" style={{ fontWeight: 600 }}>
          {loading ? "Importing..." : `Import ${importType}`}
        </button>

        {/* Expected columns */}
        <div className="mt-8">
          <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-3" style={{ fontWeight: 600 }}>EXPECTED COLUMNS</p>
          <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-card p-4">
            {importType === "deals" ? (
              <div className="grid grid-cols-2 gap-2 text-[12px] font-sans">
                {[["brand_name", "Required — brand or client name"], ["value", "Deal amount in dollars"], ["deliverables", "What you're creating"], ["platform", "tiktok, instagram, or youtube"], ["stage", "lead, pitched, negotiating, contracted, in_progress, delivered, paid"], ["due_date", "YYYY-MM-DD format"], ["deal_type", "ugc, influencer, or both"], ["notes", "Optional notes"]].map(([col, desc]) => (
                  <div key={col} className="py-1.5 border-b border-[#EEE8E0] last:border-0">
                    <code className="text-[11px] font-mono text-[#7BAFC8]">{col}</code>
                    <p className="text-[#4A6070] mt-0.5">{desc}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-[12px] font-sans">
                {[["brand_name", "Required — brand or client name"], ["amount", "Invoice amount in dollars"], ["status", "draft, sent, paid, or overdue"], ["due_date", "YYYY-MM-DD format"]].map(([col, desc]) => (
                  <div key={col} className="py-1.5 border-b border-[#EEE8E0] last:border-0">
                    <code className="text-[11px] font-mono text-[#7BAFC8]">{col}</code>
                    <p className="text-[#4A6070] mt-0.5">{desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
