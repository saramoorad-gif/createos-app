"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useSupabaseQuery, useSupabaseMutation } from "@/lib/hooks";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/global/toast";
import { TableSkeleton } from "@/components/global/skeleton";
import { ContextMenu } from "@/components/global/context-menu";
import { X, ChevronRight, FileText, Eye, Plus, Edit3, Trash2, Save } from "lucide-react";

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

export default function DealsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [editDeal, setEditDeal] = useState<Deal | null>(null);
  const [showNew, setShowNew] = useState(false);
  const { toast } = useToast();

  const { data: deals, loading, setData: setDeals } = useSupabaseQuery<Deal>("deals", { order: { column: "created_at", ascending: false } });
  const { insert, update, remove } = useSupabaseMutation("deals");
  const { insert: insertInvoice } = useSupabaseMutation("invoices");

  // Form state (shared between new + edit)
  const [fBrand, setFBrand] = useState("");
  const [fValue, setFValue] = useState("");
  const [fDeliv, setFDeliv] = useState("");
  const [fPlat, setFPlat] = useState("tiktok");
  const [fType, setFType] = useState("ugc");
  const [fDue, setFDue] = useState("");
  const [fStage, setFStage] = useState("lead");
  const [fNotes, setFNotes] = useState("");
  const [fExclDays, setFExclDays] = useState("");
  const [fExclCat, setFExclCat] = useState("");

  function openNew() {
    setEditDeal(null);
    setFBrand(""); setFValue(""); setFDeliv(""); setFPlat("tiktok"); setFType("ugc");
    setFDue(""); setFStage("lead"); setFNotes(""); setFExclDays(""); setFExclCat("");
    setShowNew(true);
  }

  function openEdit(deal: Deal) {
    setEditDeal(deal);
    setFBrand(deal.brand_name || "");
    setFValue(deal.value ? String(deal.value) : "");
    setFDeliv(deal.deliverables || "");
    setFPlat(deal.platform || "tiktok");
    setFType(deal.deal_type || "ugc");
    setFDue(deal.due_date || "");
    setFStage(deal.stage || "lead");
    setFNotes(deal.notes || "");
    setFExclDays(deal.exclusivity_days ? String(deal.exclusivity_days) : "");
    setFExclCat(deal.exclusivity_category || "");
    setShowNew(true);
  }

  async function handleSave() {
    if (!fBrand.trim()) { toast("error", "Brand name is required"); return; }
    const payload: Record<string, any> = {
      brand_name: fBrand.trim(),
      deal_type: fType,
      platform: fPlat,
      value: parseFloat(fValue) || 0,
      deliverables: fDeliv.trim(),
      due_date: fDue || null,
      stage: fStage,
      notes: fNotes.trim(),
      exclusivity_days: parseInt(fExclDays) || null,
      exclusivity_category: fExclCat.trim() || null,
    };

    try {
      if (editDeal) {
        await update(editDeal.id, payload);
        setDeals(prev => prev.map(d => d.id === editDeal.id ? { ...d, ...payload } : d));
        toast("success", `${fBrand} updated`);
      } else {
        const d = await insert(payload);
        if (d) setDeals(prev => [d as Deal, ...prev]);
        toast("success", `${fBrand} added to pipeline`);
      }
      setShowNew(false);
      setEditDeal(null);
    } catch (e) {
      console.error("Failed to save deal:", e);
      toast("error", "Failed to save deal");
    }
  }

  async function handleDelete() {
    if (!editDeal) return;
    try {
      await remove(editDeal.id);
      setDeals(prev => prev.filter(d => d.id !== editDeal.id));
      toast("success", `${editDeal.brand_name} removed`);
      setShowNew(false);
      setEditDeal(null);
    } catch { toast("error", "Failed to delete deal"); }
  }

  async function handleMoveStage(dealId: string, newStage: string) {
    try {
      await update(dealId, { stage: newStage });
      setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: newStage } : d));
      toast("success", "Moved to " + stageLabels[newStage]);
    } catch { toast("error", "Failed to move stage"); }
  }

  async function handleCreateInvoice(deal: Deal) {
    try {
      await insertInvoice({ brand_name: deal.brand_name, amount: deal.value, status: "draft", due_date: deal.due_date || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0], deal_id: deal.id });
      toast("success", "Invoice created for " + deal.brand_name);
    } catch { toast("error", "Failed to create invoice"); }
  }

  const filtered = deals.filter(filterMap[filter]);
  const totalValue = deals.reduce((s, d) => s + (d.value || 0), 0);
  const activeCount = deals.filter(d => ["contracted", "in_progress"].includes(d.stage)).length;
  const filters: { key: Filter; label: string }[] = [{ key: "all", label: `All (${deals.length})` }, { key: "active", label: "Active" }, { key: "pending", label: "Pending" }, { key: "complete", label: "Complete" }];

  const inputClass = "w-full rounded-[8px] border-[1.5px] border-[#D8E8EE] px-3 py-2.5 text-[14px] font-sans text-[#1A2C38] bg-white focus:outline-none focus:border-[#7BAFC8]";
  const labelClass = "text-[11px] font-sans text-[#8AAABB] uppercase tracking-[1.5px] block mb-1.5";

  if (loading) return <TableSkeleton rows={6} cols={5} />;

  return (
    <div>
      <PageHeader headline={<>Your deal <em className="italic text-[#7BAFC8]">pipeline</em></>} subheading="Track every brand partnership from pitch to payment." stats={[{ value: String(deals.length), label: "Total deals" }, { value: String(activeCount), label: "Active" }, { value: formatCurrency(totalValue), label: "Pipeline value" }]} />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1">
          {filters.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`px-3 py-1.5 text-[10px] font-sans uppercase tracking-[1.5px] rounded-full transition-colors ${filter === f.key ? "bg-[#1E3F52] text-white" : "text-[#8AAABB] hover:text-[#1A2C38] hover:bg-[#F2F8FB]"}`} style={{ fontWeight: 500 }}>{f.label}</button>
          ))}
        </div>
        <button onClick={openNew} className="flex items-center gap-1.5 bg-[#1E3F52] text-white rounded-[8px] px-4 py-2 text-[12px] font-sans hover:bg-[#2a5269] transition-colors" style={{ fontWeight: 600 }}><Plus className="h-3.5 w-3.5" /> New deal</button>
      </div>

      {deals.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[22px] font-serif italic text-[#8AAABB] mb-3">No deals yet</p>
          <p className="text-[14px] font-sans text-[#4A6070] mb-6">Create your first deal to start tracking your pipeline.</p>
          <button onClick={openNew} className="bg-[#1E3F52] text-white rounded-[8px] px-6 py-3 text-[14px] font-sans hover:bg-[#2a5269]" style={{ fontWeight: 600 }}>Create your first deal →</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(deal => {
            const currentIdx = stageOrder.indexOf(deal.stage);
            const nextStage = currentIdx < stageOrder.length - 1 ? stageOrder[currentIdx + 1] : null;
            return (
              <ContextMenu key={deal.id} items={[
                { label: "Edit deal", onClick: () => openEdit(deal) },
                ...(nextStage ? [{ label: "Move to " + stageLabels[nextStage], onClick: () => handleMoveStage(deal.id, nextStage) }] : []),
                { label: "Create invoice", onClick: () => handleCreateInvoice(deal) },
              ]}>
                <button onClick={() => openEdit(deal)} className="w-full text-left bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5 hover:border-[#7BAFC8] hover:shadow-card transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>{deal.brand_name}</p>
                      {deal.deal_type && <span className="text-[9px] font-sans uppercase tracking-[1.5px] px-2 py-0.5 rounded-full bg-[#F2F8FB] text-[#7BAFC8]" style={{ fontWeight: 700 }}>{deal.deal_type}</span>}
                      {deal.platform && <span className="text-[9px] font-mono text-[#8AAABB] border border-[#D8E8EE] rounded px-1.5 py-0.5">{deal.platform}</span>}
                      {deal.created_by_agency && <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-[#F0EAE0] text-[#8AAABB]">Agency</span>}
                    </div>
                    <p className="text-[20px] font-serif text-[#3D6E8A]">{deal.value > 0 ? formatCurrency(deal.value) : "TBD"}</p>
                  </div>
                  <div className="h-[3px] w-full bg-[#D8E8EE] rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-[#7BAFC8] rounded-full transition-all" style={{ width: `${stageProgress[deal.stage] || 0}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-sans uppercase tracking-[1.5px] text-[#8AAABB]" style={{ fontWeight: 500 }}>{stageLabels[deal.stage]}</span>
                      {deal.deliverables && <span className="text-[12px] font-sans text-[#8AAABB] truncate max-w-[300px]">{deal.deliverables}</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      {deal.exclusivity_category && (
                        <span className="text-[10px] font-sans px-1.5 py-0.5 rounded-full bg-[#F4EAEA] text-[#A03D3D]" style={{ fontWeight: 500 }}>
                          {deal.exclusivity_category} · {deal.exclusivity_days}d
                        </span>
                      )}
                      {deal.due_date && <span className="text-[11px] font-mono text-[#8AAABB]">Due {formatDate(deal.due_date)}</span>}
                      <Edit3 className="h-3.5 w-3.5 text-[#D8E8EE]" />
                    </div>
                  </div>
                </button>
              </ContextMenu>
            );
          })}
        </div>
      )}

      {/* ─── New / Edit Deal Modal ──────────────────────── */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(26,44,56,.4)", backdropFilter: "blur(4px)" }}>
          <div className="relative bg-white rounded-[10px] border-[1.5px] border-[#D8E8EE] w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#F2F8FB] px-6 py-4 border-b border-[#D8E8EE] flex items-center justify-between z-10">
              <h2 className="text-[18px] font-serif text-[#1A2C38]">{editDeal ? "Edit Deal" : "New Deal"}</h2>
              <button onClick={() => { setShowNew(false); setEditDeal(null); }} className="text-[#8AAABB] hover:text-[#1A2C38]"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass} style={{ fontWeight: 600 }}>Brand Name *</label>
                <input type="text" value={fBrand} onChange={e => setFBrand(e.target.value)} placeholder="e.g., Nike, Glow Recipe" className={inputClass} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelClass} style={{ fontWeight: 600 }}>Deal Type</label>
                  <select value={fType} onChange={e => setFType(e.target.value)} className={inputClass}>
                    <option value="ugc">UGC</option>
                    <option value="influencer">Influencer</option>
                    <option value="both">Both</option>
                    <option value="ambassador">Ambassador</option>
                    <option value="affiliate">Affiliate</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass} style={{ fontWeight: 600 }}>Platform</label>
                  <select value={fPlat} onChange={e => setFPlat(e.target.value)} className={inputClass}>
                    <option value="tiktok">TikTok</option>
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="">Multi-platform</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass} style={{ fontWeight: 600 }}>Stage</label>
                  <select value={fStage} onChange={e => setFStage(e.target.value)} className={inputClass}>
                    {stageOrder.map(s => <option key={s} value={s}>{stageLabels[s]}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass} style={{ fontWeight: 600 }}>Deal Value ($)</label>
                  <input type="number" value={fValue} onChange={e => setFValue(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass} style={{ fontWeight: 600 }}>Due Date</label>
                  <input type="date" value={fDue} onChange={e => setFDue(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass} style={{ fontWeight: 600 }}>Deliverables</label>
                <input type="text" value={fDeliv} onChange={e => setFDeliv(e.target.value)} placeholder="e.g., 2 TikTok videos + 1 Instagram reel" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass} style={{ fontWeight: 600 }}>Exclusivity (days)</label>
                  <input type="number" value={fExclDays} onChange={e => setFExclDays(e.target.value)} placeholder="e.g., 90" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass} style={{ fontWeight: 600 }}>Exclusivity Category</label>
                  <input type="text" value={fExclCat} onChange={e => setFExclCat(e.target.value)} placeholder="e.g., Skincare, Fashion" className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass} style={{ fontWeight: 600 }}>Notes</label>
                <textarea value={fNotes} onChange={e => setFNotes(e.target.value)} rows={3} placeholder="Campaign details, contact info, special requirements..." className={`${inputClass} resize-none`} />
              </div>
              <div className="flex gap-2 pt-2">
                {editDeal && (
                  <button onClick={handleDelete} className="flex items-center gap-1.5 border-[1.5px] border-[#C0392B] text-[#C0392B] rounded-[8px] px-4 py-2.5 text-[13px] font-sans hover:bg-red-50 transition-colors" style={{ fontWeight: 500 }}>
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                )}
                <button onClick={() => { setShowNew(false); setEditDeal(null); }} className="flex-1 border-[1.5px] border-[#D8E8EE] rounded-[8px] px-4 py-2.5 text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>Cancel</button>
                <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-1.5 bg-[#1E3F52] text-white rounded-[8px] px-4 py-2.5 text-[13px] font-sans hover:bg-[#2a5269] transition-colors" style={{ fontWeight: 600 }}>
                  <Save className="h-3.5 w-3.5" /> {editDeal ? "Save Changes" : "Create Deal"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
