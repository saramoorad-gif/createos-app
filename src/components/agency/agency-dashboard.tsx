"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { deals, dealStageLabels, type DealStage } from "@/lib/placeholder-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { X, Plus, ChevronRight, FileText, Upload, Save } from "lucide-react";

type Tab = "pipeline" | "roster" | "commission";

const pipelineDeals = [
  { creator: "Brianna Cole", creatorId: "usr_brianna_001", ...deals.find(d => d.brand_name === "Mejuri")!, commission: 480 },
  { creator: "Brianna Cole", creatorId: "usr_brianna_001", ...deals.find(d => d.brand_name === "Aritzia")!, commission: 675 },
  { creator: "Maya Chen", creatorId: "usr_maya_001", brand_name: "Glossier", deal_type: "influencer" as const, stage: "contracted" as DealStage, value: 2800, deliverables: "2 TikTok + 1 Reel", platform: "tiktok" as const, due_date: "2026-04-28", exclusivity_days: null, exclusivity_category: null, notes: "Clean girl campaign", created_by_agency: true, agency_id: "agency_001", agency_name: "Bright Talent Mgmt", id: "d_m1", user_id: "usr_maya_001", brand_logo: null, created_at: "2026-03-20T10:00:00Z", updated_at: "2026-04-05T10:00:00Z", commission: 420 },
  { creator: "Jordan Ellis", creatorId: "usr_jordan_001", brand_name: "Oatly", deal_type: "ugc" as const, stage: "in_progress" as DealStage, value: 1500, deliverables: "2 TikTok videos", platform: "tiktok" as const, due_date: "2026-05-01", exclusivity_days: null, exclusivity_category: null, notes: "Morning routine vibe", created_by_agency: true, agency_id: "agency_001", agency_name: "Bright Talent Mgmt", id: "d_j1", user_id: "usr_jordan_001", brand_logo: null, created_at: "2026-03-15T10:00:00Z", updated_at: "2026-04-08T10:00:00Z", commission: 225 },
];

const roster = [
  { name: "Brianna Cole", tier: "Influencer", activeDeals: 3, health: "green", earnings: 8240 },
  { name: "Maya Chen", tier: "UGC Creator", activeDeals: 2, health: "green", earnings: 4600 },
  { name: "Jordan Ellis", tier: "Influencer", activeDeals: 2, health: "amber", earnings: 3700 },
  { name: "Tara Washington", tier: "UGC Creator", activeDeals: 0, health: "red", earnings: 0 },
];

const urgencyMap: Record<string, string> = {
  pitched: "bg-[#9A9088]", negotiating: "bg-[#D4A030]", contracted: "bg-[#4A9060]",
  in_progress: "bg-[#C4714A]", delivered: "bg-[#4A9060]", paid: "bg-[#4A9060]",
};
const healthColors: Record<string, string> = { green: "bg-[#4A9060]", amber: "bg-[#D4A030]", red: "bg-[#E05C3A]" };

const stageOptions: DealStage[] = ["pitched", "negotiating", "contracted", "in_progress", "delivered", "paid"];

const inputClass = "w-full rounded-[10px] border border-[#E5E0D8] px-3 py-2.5 text-[13px] font-sans text-[#1C1714] bg-white focus:outline-none focus:border-[#C4714A]";

// ─── Edit Deal Slide-over ────────────────────────────────────────

function EditDealPanel({ deal, onClose }: { deal: typeof pipelineDeals[0]; onClose: () => void }) {
  const [stage, setStage] = useState(deal.stage);
  const [value, setValue] = useState(deal.value);
  const [dueDate, setDueDate] = useState(deal.due_date || "");
  const [notes, setNotes] = useState(deal.notes);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-full max-w-[480px] bg-white border-l border-[#E5E0D8] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[#E5E0D8] px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-[20px] font-serif text-[#1C1714]">Edit Deal</h2>
          <button onClick={onClose} className="text-[#9A9088] hover:text-[#1C1714]"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-[#F7F4EF] rounded-[10px] p-3 flex items-center justify-between">
            <span className="text-[12px] font-sans text-[#9A9088]">Editing on behalf of</span>
            <span className="text-[13px] font-sans font-600 text-[#1C1714]">{deal.creator}</span>
          </div>

          <div>
            <label className="text-[12px] font-sans font-500 text-[#1C1714] block mb-1.5">Brand Name</label>
            <input type="text" defaultValue={deal.brand_name} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-sans font-500 text-[#1C1714] block mb-1.5">Deal Type</label>
              <select defaultValue={deal.deal_type} className={inputClass}>
                <option value="ugc">UGC</option>
                <option value="influencer">Influencer</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <label className="text-[12px] font-sans font-500 text-[#1C1714] block mb-1.5">Value</label>
              <input type="number" value={value} onChange={e => setValue(Number(e.target.value))} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="text-[12px] font-sans font-500 text-[#1C1714] block mb-1.5">Stage</label>
            <div className="grid grid-cols-3 gap-1.5">
              {stageOptions.map(s => (
                <button key={s} onClick={() => setStage(s)} className={`px-2 py-1.5 rounded-lg text-[11px] font-sans font-500 uppercase tracking-[1px] transition-colors ${
                  stage === s ? "bg-[#C4714A] text-white" : "bg-[#F2EEE8] text-[#9A9088] hover:bg-[#E5E0D8]"
                }`}>{dealStageLabels[s]}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[12px] font-sans font-500 text-[#1C1714] block mb-1.5">Due Date</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="text-[12px] font-sans font-500 text-[#1C1714] block mb-1.5">Deliverables</label>
            <input type="text" defaultValue={deal.deliverables} className={inputClass} />
          </div>

          <div>
            <label className="text-[12px] font-sans font-500 text-[#1C1714] block mb-1.5">Contract PDF</label>
            <div className="border border-dashed border-[#E5E0D8] rounded-[10px] p-4 text-center cursor-pointer hover:border-[#C4714A]/40 transition-colors">
              <Upload className="h-5 w-5 text-[#9A9088] mx-auto mb-1.5" />
              <p className="text-[12px] font-sans text-[#9A9088]">Drop PDF here or click to upload</p>
              <p className="text-[10px] font-sans text-[#9A9088]/60 mt-0.5">Auto-analyzed by AI on upload</p>
            </div>
          </div>

          <div>
            <label className="text-[12px] font-sans font-500 text-[#1C1714] block mb-1.5">Notes</label>
            <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} className={`${inputClass} resize-none`} />
          </div>

          <button onClick={onClose} className="w-full flex items-center justify-center gap-2 bg-[#C4714A] text-white rounded-[10px] px-4 py-2.5 text-[13px] font-sans font-500 hover:bg-[#B05C38] transition-colors">
            <Save className="h-4 w-4" /> Save on behalf of {deal.creator}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-1.5 border border-[#E5E0D8] rounded-[10px] px-3 py-2 text-[12px] font-sans font-500 text-[#1C1714] hover:bg-[#F7F4EF]">
              <FileText className="h-3.5 w-3.5" /> Create Invoice
            </button>
            <button className="flex items-center justify-center gap-1.5 border border-[#E5E0D8] rounded-[10px] px-3 py-2 text-[12px] font-sans font-500 text-[#1C1714] hover:bg-[#F7F4EF]">
              <ChevronRight className="h-3.5 w-3.5" /> Next Stage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── New Deal Modal ──────────────────────────────────────────────

function NewDealModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative bg-white rounded-[10px] border border-[#E5E0D8] w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[20px] font-serif text-[#1C1714]">New Deal</h2>
          <button onClick={onClose} className="text-[#9A9088] hover:text-[#1C1714]"><X className="h-5 w-5" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[12px] font-sans font-500 text-[#1C1714] block mb-1.5">Creator</label>
            <select className={inputClass}>
              <option value="">Select from roster...</option>
              {roster.map(c => <option key={c.name} value={c.name}>{c.name} — {c.tier}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[12px] font-sans font-500 text-[#1C1714] block mb-1.5">Brand Name</label>
            <input type="text" placeholder="e.g., Nike" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-sans font-500 text-[#1C1714] block mb-1.5">Deal Type</label>
              <select className={inputClass}><option value="ugc">UGC</option><option value="influencer">Influencer</option><option value="both">Both</option></select>
            </div>
            <div>
              <label className="text-[12px] font-sans font-500 text-[#1C1714] block mb-1.5">Deal Value</label>
              <input type="number" placeholder="$0" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-sans font-500 text-[#1C1714] block mb-1.5">Commission Rate</label>
              <input type="text" defaultValue="15%" className={inputClass} />
            </div>
            <div>
              <label className="text-[12px] font-sans font-500 text-[#1C1714] block mb-1.5">Due Date</label>
              <input type="date" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-sans font-500 text-[#1C1714] block mb-1.5">Exclusivity Category</label>
              <input type="text" placeholder="e.g., Beauty" className={inputClass} />
            </div>
            <div>
              <label className="text-[12px] font-sans font-500 text-[#1C1714] block mb-1.5">Exclusivity End</label>
              <input type="date" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="text-[12px] font-sans font-500 text-[#1C1714] block mb-1.5">Notes</label>
            <textarea rows={2} placeholder="Campaign details..." className={`${inputClass} resize-none`} />
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 border border-[#E5E0D8] rounded-[10px] px-4 py-2.5 text-[13px] font-sans font-500 hover:bg-[#F7F4EF]">Cancel</button>
            <button onClick={onClose} className="flex-1 bg-[#C4714A] text-white rounded-[10px] px-4 py-2.5 text-[13px] font-sans font-500 hover:bg-[#B05C38]">Create Deal</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────

export function AgencyDashboard() {
  const [tab, setTab] = useState<Tab>("pipeline");
  const [editDeal, setEditDeal] = useState<typeof pipelineDeals[0] | null>(null);
  const [showNewDeal, setShowNewDeal] = useState(false);

  const totalPipeline = pipelineDeals.reduce((s, d) => s + d.value, 0);
  const totalCommission = pipelineDeals.reduce((s, d) => s + d.commission, 0);

  const tabs: { key: Tab; label: string }[] = [
    { key: "pipeline", label: "Pipeline" },
    { key: "roster", label: "Roster" },
    { key: "commission", label: "Commission" },
  ];

  return (
    <div>
      <PageHeader
        headline={<>Agency <em className="italic text-[#C4714A]">overview</em></>}
        subheading="All active deals across your roster of creators."
        stats={[
          { value: String(pipelineDeals.length), label: "Active deals" },
          { value: String(roster.length), label: "Creators" },
          { value: formatCurrency(totalPipeline), label: "Pipeline value" },
          { value: formatCurrency(totalCommission), label: "Commission" },
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 py-1 text-[10px] font-sans font-500 uppercase tracking-[1.5px] rounded-full transition-colors ${
              tab === t.key ? "bg-[#1C1714] text-[#F7F4EF]" : "text-[#9A9088] hover:text-[#1C1714] hover:bg-[#F2EEE8]"
            }`}>{t.label}</button>
          ))}
        </div>
        {tab === "pipeline" && (
          <button onClick={() => setShowNewDeal(true)} className="flex items-center gap-1.5 bg-[#C4714A] text-white rounded-[10px] px-3.5 py-2 text-[12px] font-sans font-500 hover:bg-[#B05C38] transition-colors">
            <Plus className="h-3.5 w-3.5" /> New Deal
          </button>
        )}
      </div>

      {/* Pipeline Tab */}
      {tab === "pipeline" && (
        <div className="bg-white border border-[#E5E0D8] rounded-[10px] overflow-hidden">
          <div className="grid grid-cols-7 gap-4 px-5 py-3 text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#9A9088] border-b border-[#E5E0D8]">
            <span>Creator</span><span>Brand</span><span>Value</span><span>Stage</span><span>Due</span><span className="text-right">Commission</span><span className="text-right">Action</span>
          </div>
          {pipelineDeals.map((deal, i) => (
            <div key={i} className="grid grid-cols-7 gap-4 px-5 py-3.5 items-center border-b border-[#E5E0D8] last:border-b-0 hover:bg-[#F7F4EF]/50 transition-colors">
              <div className="flex items-center gap-2">
                <div className={`w-[3px] h-8 rounded-full ${urgencyMap[deal.stage] || "bg-[#9A9088]"}`} />
                <span className="text-[13px] font-sans font-500 text-[#1C1714]">{deal.creator}</span>
              </div>
              <span className="text-[13px] font-sans text-[#1C1714]">{deal.brand_name}</span>
              <span className="text-[14px] font-serif text-[#1C1714]">{formatCurrency(deal.value)}</span>
              <span className="text-[10px] font-sans font-500 uppercase tracking-[1.5px] text-[#9A9088]">{dealStageLabels[deal.stage]}</span>
              <span className="text-[11px] font-mono text-[#9A9088]">{deal.due_date ? formatDate(deal.due_date) : "—"}</span>
              <span className="text-[13px] font-sans font-500 text-[#4A9060] text-right">{formatCurrency(deal.commission)}</span>
              <div className="text-right">
                <button onClick={() => setEditDeal(deal)} className="text-[12px] font-sans font-500 text-[#C4714A] hover:underline">Edit →</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Roster Tab */}
      {tab === "roster" && (
        <div className="bg-white border border-[#E5E0D8] rounded-[10px] overflow-hidden">
          <div className="grid grid-cols-6 gap-4 px-5 py-3 text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#9A9088] border-b border-[#E5E0D8]">
            <span>Creator</span><span>Tier</span><span>Active Deals</span><span>Health</span><span>Earnings</span><span className="text-right">Action</span>
          </div>
          {roster.map((c, i) => (
            <div key={i} className="grid grid-cols-6 gap-4 px-5 py-3.5 items-center border-b border-[#E5E0D8] last:border-b-0">
              <span className="text-[13px] font-sans font-500 text-[#1C1714]">{c.name}</span>
              <span className="text-[10px] font-sans font-500 uppercase tracking-[1.5px] px-2 py-0.5 rounded-full bg-[#F2EEE8] text-[#9A9088] w-fit">{c.tier}</span>
              <span className="text-[13px] font-sans text-[#1C1714]">{c.activeDeals}</span>
              <div className="flex items-center gap-2"><div className={`h-2 w-2 rounded-full ${healthColors[c.health]}`} /></div>
              <span className="text-[14px] font-serif text-[#1C1714]">{formatCurrency(c.earnings)}</span>
              <div className="text-right"><button className="text-[12px] font-sans font-500 text-[#C4714A] hover:underline">View →</button></div>
            </div>
          ))}
        </div>
      )}

      {/* Commission Tab */}
      {tab === "commission" && (
        <div className="bg-white border border-[#E5E0D8] rounded-[10px] overflow-hidden">
          <div className="grid grid-cols-5 gap-4 px-5 py-3 text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#9A9088] border-b border-[#E5E0D8]">
            <span>Deal</span><span>Creator</span><span>Deal Value</span><span>Rate</span><span className="text-right">Commission</span>
          </div>
          {pipelineDeals.map((deal, i) => (
            <div key={i} className="grid grid-cols-5 gap-4 px-5 py-3.5 items-center border-b border-[#E5E0D8] last:border-b-0">
              <span className="text-[13px] font-sans font-500 text-[#1C1714]">{deal.brand_name}</span>
              <span className="text-[13px] font-sans text-[#9A9088]">{deal.creator}</span>
              <span className="text-[14px] font-serif text-[#1C1714]">{formatCurrency(deal.value)}</span>
              <span className="text-[12px] font-sans text-[#9A9088]">15%</span>
              <span className="text-[14px] font-serif text-[#4A9060] text-right">{formatCurrency(deal.commission)}</span>
            </div>
          ))}
          <div className="grid grid-cols-5 gap-4 px-5 py-3 bg-[#F7F4EF] border-t border-[#E5E0D8]">
            <span className="text-[12px] font-sans font-600 text-[#1C1714] col-span-4">Total</span>
            <span className="text-[16px] font-serif text-[#4A9060] text-right">{formatCurrency(totalCommission)}</span>
          </div>
        </div>
      )}

      {editDeal && <EditDealPanel deal={editDeal} onClose={() => setEditDeal(null)} />}
      {showNewDeal && <NewDealModal onClose={() => setShowNewDeal(false)} />}
    </div>
  );
}
