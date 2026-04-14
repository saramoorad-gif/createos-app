"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useSupabaseQuery, useSupabaseMutation } from "@/lib/hooks";
import { formatCurrency, formatDate } from "@/lib/utils";
import { X, ChevronRight, FileText, Eye, Plus } from "lucide-react";

interface Deal {
  id: string;
  brand_name: string;
  deal_type: string;
  stage: string;
  value: number;
  deliverables: string;
  platform: string;
  due_date: string | null;
  exclusivity_days: number | null;
  exclusivity_category: string | null;
  notes: string;
  created_by_agency: boolean;
  created_at: string;
}

type Filter = "all" | "active" | "pending" | "complete";
const filterMap: Record<Filter, (d: Deal) => boolean> = {
  all: () => true,
  active: (d) => ["contracted", "in_progress"].includes(d.stage),
  pending: (d) => ["pitched", "negotiating", "lead"].includes(d.stage),
  complete: (d) => ["delivered", "paid"].includes(d.stage),
};
const stageLabels: Record<string, string> = { lead: "Lead", pitched: "Pitched", negotiating: "Negotiating", contracted: "Contracted", in_progress: "In Progress", delivered: "Delivered", paid: "Paid" };
const stageProgress: Record<string, number> = { lead: 5, pitched: 15, negotiating: 30, contracted: 45, in_progress: 65, delivered: 85, paid: 100 };
const stageOrder = ["lead", "pitched", "negotiating", "contracted", "in_progress", "delivered", "paid"];

function DealPanel({ deal, onClose, onMoveStage, onCreateInvoice }: { deal: Deal; onClose: () => void; onMoveStage: (dealId: string, newStage: string) => void; onCreateInvoice: (deal: Deal) => void }) {
  const currentIdx = stageOrder.indexOf(deal.stage);
  const nextStage = currentIdx < stageOrder.length - 1 ? stageOrder[currentIdx + 1] : null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0" style={{ background: "rgba(26,44,56,.4)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <div className="relative w-full max-w-[480px] bg-white border-l border-[#D8E8EE] overflow-y-auto">
        <div className="sticky top-0 bg-[#F2F8FB] border-b border-[#D8E8EE] px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-[20px] font-serif text-[#1A2C38]">{deal.brand_name}</h2>
          <button onClick={onClose} className="text-[#8AAABB] hover:text-[#1A2C38]"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] font-sans uppercase tracking-[4px] px-2 py-0.5 rounded bg-[#F2F8FB] text-[#3D6E8A]" style={{ fontWeight: 700 }}>{stageLabels[deal.stage]}</span>
            {deal.deal_type && <span className="text-[9px] font-sans uppercase tracking-[4px] px-2 py-0.5 rounded bg-[#F2F8FB] text-[#7BAFC8]" style={{ fontWeight: 700 }}>{deal.deal_type}</span>}
            {deal.created_by_agency && <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-[#F0EAE0] text-[#8AAABB]">Added by agency</span>}
          </div>
          <div className="h-[3px] w-full bg-[#D8E8EE] rounded-full overflow-hidden"><div className="h-full bg-[#7BAFC8] rounded-full" style={{ width: `${stageProgress[deal.stage] || 0}%` }} /></div>
          <div className="space-y-3 divide-y divide-[#D8E8EE]">
            {([["Amount", deal.value > 0 ? formatCurrency(deal.value) : "TBD"], ["Deliverables", deal.deliverables || "—"], ["Platform", deal.platform || "—"], ["Due Date", deal.due_date ? formatDate(deal.due_date) : "—"], ["Exclusivity", deal.exclusivity_days ? `${deal.exclusivity_days}d — ${deal.exclusivity_category}` : "None"]] as [string, string][]).map(([l, v]) => (
              <div key={l} className="flex justify-between pt-3 first:pt-0"><span className="text-[12px] font-sans text-[#8AAABB]">{l}</span><span className="text-[13px] font-sans text-[#1A2C38] text-right max-w-[220px]" style={{ fontWeight: 500 }}>{v}</span></div>
            ))}
          </div>
          {deal.notes && <div className="bg-[#FAF8F4] rounded-card p-4"><p className="text-[10px] font-sans uppercase tracking-[2px] text-[#8AAABB] mb-2" style={{ fontWeight: 600 }}>Notes</p><p className="text-[13px] font-sans text-[#1A2C38] leading-relaxed">{deal.notes}</p></div>}
          {nextStage && (
            <button onClick={() => { onMoveStage(deal.id, nextStage); onClose(); }} className="w-full flex items-center justify-center gap-2 bg-[#1E3F52] text-white rounded-btn px-4 py-2.5 text-[13px] font-sans" style={{ fontWeight: 600 }}>
              <ChevronRight className="h-4 w-4" /> Move to {stageLabels[nextStage]}
            </button>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => { onCreateInvoice(deal); onClose(); }} className="flex items-center justify-center gap-1.5 border-[1.5px] border-[#D8E8EE] rounded-btn px-3 py-2 text-[12px] font-sans text-[#1A2C38] hover:bg-[#FAF8F4]" style={{ fontWeight: 500 }}><FileText className="h-3.5 w-3.5" /> Create Invoice</button>
            <button onClick={() => window.location.href = "/contracts"} className="flex items-center justify-center gap-1.5 border-[1.5px] border-[#D8E8EE] rounded-btn px-3 py-2 text-[12px] font-sans text-[#1A2C38] hover:bg-[#FAF8F4]" style={{ fontWeight: 500 }}><Eye className="h-3.5 w-3.5" /> Contracts</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DealsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [brand, setBrand] = useState(""); const [val, setVal] = useState(""); const [deliv, setDeliv] = useState(""); const [plat, setPlat] = useState("tiktok"); const [dtype, setDtype] = useState("ugc"); const [due, setDue] = useState(""); const [notes, setNotes] = useState("");

  const { data: deals, loading, setData: setDeals } = useSupabaseQuery<Deal>("deals", { order: { column: "created_at", ascending: false } });
  const { insert, update } = useSupabaseMutation("deals");
  const { insert: insertInvoice } = useSupabaseMutation("invoices");

  async function handleMoveStage(dealId: string, newStage: string) {
    try {
      await update(dealId, { stage: newStage });
      setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: newStage } : d));
    } catch (e) { console.error("Failed to move stage:", e); }
  }

  async function handleCreateInvoice(deal: Deal) {
    try {
      await insertInvoice({
        brand_name: deal.brand_name,
        amount: deal.value,
        status: "draft",
        due_date: deal.due_date || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        deal_id: deal.id,
      });
      alert(`Invoice created for ${deal.brand_name} — $${deal.value}`);
    } catch (e) { console.error("Failed to create invoice:", e); }
  }

  const filtered = deals.filter(filterMap[filter]);
  const totalValue = deals.reduce((s, d) => s + (d.value || 0), 0);
  const activeCount = deals.filter(d => ["contracted", "in_progress"].includes(d.stage)).length;
  const filters: { key: Filter; label: string }[] = [{ key: "all", label: `All (${deals.length})` }, { key: "active", label: "Active" }, { key: "pending", label: "Pending" }, { key: "complete", label: "Complete" }];
  const inputClass = "w-full rounded-btn border-[1.5px] border-[#D8E8EE] px-3 py-2.5 text-[14px] font-sans text-[#1A2C38] bg-white focus:outline-none focus:border-[#7BAFC8]";
  const labelClass = "text-[11px] font-sans text-[#8AAABB] uppercase tracking-[1.5px] block mb-1.5";

  async function handleCreate() { try { const d = await insert({ brand_name: brand, deal_type: dtype, platform: plat, value: Number(val) || 0, deliverables: deliv, due_date: due || null, notes, stage: "lead" }); if (d) setDeals(prev => [d as Deal, ...prev]); setShowNew(false); setBrand(""); setVal(""); setDeliv(""); setNotes(""); } catch (e) { console.error(e); } }

  if (loading) return <div className="pt-20 text-center"><p className="text-[14px] font-sans text-[#8AAABB]">Loading deals...</p></div>;

  return (
    <div>
      <PageHeader headline={<>Your deal <em className="italic text-[#7BAFC8]">pipeline</em></>} subheading="Track every brand partnership from pitch to payment." stats={[{ value: String(deals.length), label: "Total deals" }, { value: String(activeCount), label: "Active" }, { value: formatCurrency(totalValue), label: "Pipeline value" }]} />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1">{filters.map(f => (<button key={f.key} onClick={() => setFilter(f.key)} className={`px-3 py-1.5 text-[10px] font-sans uppercase tracking-[1.5px] rounded-full transition-colors ${filter === f.key ? "bg-[#1E3F52] text-white" : "text-[#8AAABB] hover:text-[#1A2C38] hover:bg-[#F2F8FB]"}`} style={{ fontWeight: 500 }}>{f.label}</button>))}</div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 bg-[#1E3F52] text-white rounded-btn px-4 py-2 text-[12px] font-sans" style={{ fontWeight: 600 }}><Plus className="h-3.5 w-3.5" /> New deal</button>
      </div>

      {deals.length === 0 ? (
        <div className="text-center py-16"><p className="text-[22px] font-serif italic text-[#8AAABB] mb-3">No deals yet</p><p className="text-[14px] font-sans text-[#4A6070] mb-6">Create your first deal to start tracking your pipeline.</p><button onClick={() => setShowNew(true)} className="bg-[#1E3F52] text-white rounded-btn px-6 py-3 text-[14px] font-sans" style={{ fontWeight: 600 }}>Create your first deal →</button></div>
      ) : (
        <div className="space-y-3">{filtered.map(deal => (
          <button key={deal.id} onClick={() => setSelectedDeal(deal)} className="w-full text-left bg-white border-[1.5px] border-[#D8E8EE] rounded-card p-5 hover:border-[#7BAFC8] hover:shadow-card transition-all">
            <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><p className="text-[15px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>{deal.brand_name}</p>{deal.deal_type && <span className="text-[9px] font-sans uppercase tracking-[4px] px-2 py-0.5 rounded bg-[#F2F8FB] text-[#7BAFC8]" style={{ fontWeight: 700 }}>{deal.deal_type}</span>}{deal.created_by_agency && <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-[#F0EAE0] text-[#8AAABB]">Added by agency</span>}</div><p className="text-[20px] font-serif text-[#3D6E8A]">{deal.value > 0 ? formatCurrency(deal.value) : "TBD"}</p></div>
            <div className="h-[3px] w-full bg-[#D8E8EE] rounded-full overflow-hidden mb-2"><div className="h-full bg-[#7BAFC8] rounded-full" style={{ width: `${stageProgress[deal.stage] || 0}%` }} /></div>
            <div className="flex items-center justify-between"><div className="flex items-center gap-4"><span className="text-[10px] font-sans uppercase tracking-[1.5px] text-[#8AAABB]" style={{ fontWeight: 500 }}>{stageLabels[deal.stage]}</span><span className="text-[12px] font-sans text-[#8AAABB]">{deal.deliverables}</span></div>{deal.due_date && <span className="text-[11px] font-mono text-[#8AAABB]">Due {formatDate(deal.due_date)}</span>}</div>
          </button>
        ))}</div>
      )}

      {selectedDeal && <DealPanel deal={selectedDeal} onClose={() => setSelectedDeal(null)} onMoveStage={handleMoveStage} onCreateInvoice={handleCreateInvoice} />}

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(26,44,56,.4)", backdropFilter: "blur(4px)" }}>
          <div className="relative bg-white rounded-panel border-[1.5px] border-[#D8E8EE] w-full max-w-lg overflow-hidden">
            <div className="bg-[#F2F8FB] px-6 py-4 border-b border-[#D8E8EE] flex items-center justify-between"><h2 className="text-[18px] font-serif text-[#1A2C38]">New Deal</h2><button onClick={() => setShowNew(false)} className="text-[#8AAABB] hover:text-[#1A2C38]"><X className="h-5 w-5" /></button></div>
            <div className="p-6 space-y-4">
              <div><label className={labelClass} style={{ fontWeight: 600 }}>Brand Name</label><input type="text" value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g., Nike" className={inputClass} /></div>
              <div className="grid grid-cols-2 gap-3"><div><label className={labelClass} style={{ fontWeight: 600 }}>Deal Type</label><select value={dtype} onChange={e => setDtype(e.target.value)} className={inputClass}><option value="ugc">UGC</option><option value="influencer">Influencer</option><option value="both">Both</option></select></div><div><label className={labelClass} style={{ fontWeight: 600 }}>Platform</label><select value={plat} onChange={e => setPlat(e.target.value)} className={inputClass}><option value="tiktok">TikTok</option><option value="instagram">Instagram</option><option value="youtube">YouTube</option></select></div></div>
              <div className="grid grid-cols-2 gap-3"><div><label className={labelClass} style={{ fontWeight: 600 }}>Value ($)</label><input type="number" value={val} onChange={e => setVal(e.target.value)} placeholder="0" className={inputClass} /></div><div><label className={labelClass} style={{ fontWeight: 600 }}>Due Date</label><input type="date" value={due} onChange={e => setDue(e.target.value)} className={inputClass} /></div></div>
              <div><label className={labelClass} style={{ fontWeight: 600 }}>Deliverables</label><input type="text" value={deliv} onChange={e => setDeliv(e.target.value)} placeholder="e.g., 2 TikTok videos + 1 Reel" className={inputClass} /></div>
              <div><label className={labelClass} style={{ fontWeight: 600 }}>Notes</label><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Campaign details..." className={`${inputClass} resize-none`} /></div>
              <div className="flex gap-2 pt-2"><button onClick={() => setShowNew(false)} className="flex-1 border-[1.5px] border-[#D8E8EE] rounded-btn px-4 py-2.5 text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>Cancel</button><button onClick={handleCreate} className="flex-1 bg-[#1E3F52] text-white rounded-btn px-4 py-2.5 text-[13px] font-sans" style={{ fontWeight: 600 }}>Create Deal</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
