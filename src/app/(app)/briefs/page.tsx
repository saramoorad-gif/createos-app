"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useSupabaseQuery, useSupabaseMutation } from "@/lib/hooks";
import { useAuth } from "@/contexts/auth-context";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/global/toast";
import { UpgradeGate } from "@/components/global/upgrade-gate";
import { X, Plus, ChevronLeft, Check, Clock, Send, AlertCircle, FileText } from "lucide-react";

interface Brief {
  id: string;
  brand_name: string;
  campaign_name: string;
  status: "received" | "in_progress" | "submitted" | "approved" | "revision_requested";
  due_date: string;
  deliverables: string[];
  brief_text: string;
  assigned_creator: string;
  created_at: string;
}

interface Submission {
  id: string;
  brief_id: string;
  notes: string;
  status: "submitted" | "approved" | "revision_requested";
  reviewer_notes: string;
  submitted_at: string;
}

const statusConfig: Record<Brief["status"], { label: string; bg: string; text: string }> = {
  received: { label: "Received", bg: "#E8F4FA", text: "#7BAFC8" },
  in_progress: { label: "In Progress", bg: "#FDF3E4", text: "#A07830" },
  submitted: { label: "Submitted", bg: "#E8F4FA", text: "#7BAFC8" },
  approved: { label: "Approved", bg: "#E6F2EB", text: "#3D7A58" },
  revision_requested: { label: "Revision Requested", bg: "#FDEAEA", text: "#C0392B" },
};

const statusIcons: Record<Brief["status"], React.ReactNode> = {
  received: <FileText className="h-3.5 w-3.5" />,
  in_progress: <Clock className="h-3.5 w-3.5" />,
  submitted: <Send className="h-3.5 w-3.5" />,
  approved: <Check className="h-3.5 w-3.5" />,
  revision_requested: <AlertCircle className="h-3.5 w-3.5" />,
};

const seededBriefs: Brief[] = [
  {
    id: "seed-1",
    brand_name: "Glow Recipe",
    campaign_name: "Summer Glow Series",
    status: "in_progress",
    due_date: "2026-04-25",
    deliverables: ["1 Instagram Reel (60s)", "3 Instagram Stories", "1 TikTok video"],
    brief_text: "We want you to showcase our new Watermelon Glow Niacinamide Sunscreen SPF 50. Focus on the lightweight texture and how it fits into a summer morning routine. Please film in natural daylight and keep the vibe fresh and effortless. Include a clear CTA to shop via the link in your bio.",
    assigned_creator: "",
    created_at: "2026-04-05T10:00:00Z",
  },
  {
    id: "seed-2",
    brand_name: "Canva",
    campaign_name: "Create Anything Campaign",
    status: "received",
    due_date: "2026-04-30",
    deliverables: ["1 TikTok video (30-60s)", "1 Instagram Reel (30s)"],
    brief_text: "Show your audience how you use Canva to create content for your brand. Walk through a real workflow like designing a thumbnail, media kit, or pitch deck. Keep it authentic and educational. Must mention Canva Pro features.",
    assigned_creator: "",
    created_at: "2026-04-10T14:00:00Z",
  },
  {
    id: "seed-3",
    brand_name: "Aritzia",
    campaign_name: "Spring Transition Edit",
    status: "revision_requested",
    due_date: "2026-04-18",
    deliverables: ["2 Instagram Reels", "1 TikTok GRWM"],
    brief_text: "Create a spring transitional outfit GRWM featuring at least 3 Aritzia pieces. The content should feel aspirational yet relatable. Please include the product names and tag @aritzia in all posts.",
    assigned_creator: "",
    created_at: "2026-04-01T09:00:00Z",
  },
  {
    id: "seed-4",
    brand_name: "Calm",
    campaign_name: "Mindful Mornings",
    status: "approved",
    due_date: "2026-04-12",
    deliverables: ["1 YouTube Short", "1 Instagram Reel"],
    brief_text: "Share your morning routine and how you incorporate Calm into your daily mindfulness practice. Highlight the Daily Calm feature and sleep stories. Tone should be peaceful and genuine.",
    assigned_creator: "",
    created_at: "2026-03-28T12:00:00Z",
  },
];

const seededSubmissions: Submission[] = [
  {
    id: "sub-1",
    brief_id: "seed-3",
    notes: "Filmed the GRWM with the Babaton Contour bodysuit, TNA butter zip-up, and Wilfred Free pants. Used soft natural lighting. Let me know if you need any edits!",
    status: "revision_requested",
    reviewer_notes: "Love the styling! Can you re-film the intro with a hook that grabs attention in the first 2 seconds? Also, please add the product names as text overlays.",
    submitted_at: "2026-04-10T16:00:00Z",
  },
  {
    id: "sub-2",
    brief_id: "seed-4",
    notes: "Recorded my full morning routine with Calm. Highlighted Daily Calm and the sleep stories feature. Kept it peaceful and authentic.",
    status: "approved",
    reviewer_notes: "Perfect! This is exactly what we were looking for. Approved for posting. Please publish by April 15.",
    submitted_at: "2026-04-08T11:00:00Z",
  },
];

export default function BriefsPage() {
  return (
    <UpgradeGate feature="briefs">
      <BriefsPageContent />
    </UpgradeGate>
  );
}

function BriefsPageContent() {
  const { user } = useAuth();
  const { data: dbBriefs, loading } = useSupabaseQuery<Brief>("briefs", { order: { column: "created_at", ascending: false } });
  const { insert: insertBrief } = useSupabaseMutation("briefs");
  const { toast } = useToast();

  const [localBriefs, setLocalBriefs] = useState<Brief[]>(seededBriefs);
  const [localSubmissions, setLocalSubmissions] = useState<Submission[]>(seededSubmissions);
  const [selectedBrief, setSelectedBrief] = useState<Brief | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [draftNotes, setDraftNotes] = useState("");

  // Form state for creating a brief
  const [formBrand, setFormBrand] = useState("");
  const [formCampaign, setFormCampaign] = useState("");
  const [formBriefText, setFormBriefText] = useState("");
  const [formDeliverables, setFormDeliverables] = useState("");
  const [formDueDate, setFormDueDate] = useState("");
  const [formAssigned, setFormAssigned] = useState("");

  const briefs = dbBriefs.length > 0 ? dbBriefs : localBriefs;

  const receivedCount = briefs.filter(b => b.status === "received").length;
  const inProgressCount = briefs.filter(b => b.status === "in_progress" || b.status === "revision_requested").length;
  const completedCount = briefs.filter(b => b.status === "approved").length;

  function handleStatusChange(briefId: string, newStatus: Brief["status"]) {
    setLocalBriefs(prev => prev.map(b => b.id === briefId ? { ...b, status: newStatus } : b));
    toast("success", `Brief marked as ${statusConfig[newStatus].label}`);
    if (selectedBrief?.id === briefId) {
      setSelectedBrief(prev => prev ? { ...prev, status: newStatus } : null);
    }
  }

  function handleSubmitDraft() {
    if (!selectedBrief) return;
    if (!draftNotes.trim()) { toast("error", "Please add notes with your submission"); return; }

    const submission: Submission = {
      id: Date.now().toString(),
      brief_id: selectedBrief.id,
      notes: draftNotes,
      status: "submitted",
      reviewer_notes: "",
      submitted_at: new Date().toISOString(),
    };
    setLocalSubmissions(prev => [...prev, submission]);
    handleStatusChange(selectedBrief.id, "submitted");
    setDraftNotes("");
    toast("success", "Draft submitted for review");
  }

  async function handleCreateBrief() {
    if (!formBrand.trim() || !formCampaign.trim()) { toast("error", "Brand and campaign name are required"); return; }

    const deliverables = formDeliverables.split(",").map(d => d.trim()).filter(Boolean);
    const due_date = formDueDate || new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];

    // Payload for Supabase (matches the public.briefs schema in features-migration.sql)
    const payload: Record<string, unknown> = {
      creator_id: user?.id,
      brand_name: formBrand,
      campaign_name: formCampaign,
      brief_text: formBriefText,
      deliverables,
      due_date,
      status: "received",
    };

    let created: any = null;
    try {
      created = await insertBrief(payload);
    } catch {
      // Supabase not configured — use local state
    }

    // Local copy for optimistic UI. Use DB id if we got one back, else a temp id.
    const localCopy: Brief = {
      id: created?.id || Date.now().toString(),
      brand_name: formBrand,
      campaign_name: formCampaign,
      status: "received",
      due_date,
      deliverables,
      brief_text: formBriefText,
      assigned_creator: formAssigned,
      created_at: created?.created_at || new Date().toISOString(),
    };

    setLocalBriefs(prev => [localCopy, ...prev]);
    toast("success", "Brief created for " + formBrand);
    setShowCreateForm(false);
    setFormBrand(""); setFormCampaign(""); setFormBriefText(""); setFormDeliverables(""); setFormDueDate(""); setFormAssigned("");
  }

  const briefSubmissions = selectedBrief ? localSubmissions.filter(s => s.brief_id === selectedBrief.id) : [];

  const inputClass = "w-full rounded-[8px] border-[1.5px] border-[#D8E8EE] px-3 py-2.5 text-[14px] font-sans text-[#1A2C38] bg-white focus:outline-none focus:border-[#7BAFC8]";
  const labelClass = "text-[11px] font-sans text-[#8AAABB] uppercase tracking-[1.5px] block mb-1.5";

  return (
    <div>
      <PageHeader
        headline={<>Content <em className="italic text-[#7BAFC8]">briefs</em></>}
        subheading="Receive briefs from brands, submit drafts for review."
        stats={[
          { value: String(receivedCount), label: "New briefs" },
          { value: String(inProgressCount), label: "In progress" },
          { value: String(completedCount), label: "Approved" },
        ]}
      />

      {/* Actions bar */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-[13px] font-sans text-[#8AAABB]">{briefs.length} brief{briefs.length !== 1 ? "s" : ""}</p>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-1.5 bg-[#1E3F52] text-white rounded-[8px] px-4 py-2 text-[12px] font-sans"
          style={{ fontWeight: 600 }}
        >
          <Plus className="h-3.5 w-3.5" /> Create brief
        </button>
      </div>

      {/* Brief list */}
      {briefs.length === 0 && !loading ? (
        <div className="text-center py-16">
          <p className="text-[22px] font-serif italic text-[#8AAABB] mb-3">No briefs yet</p>
          <p className="text-[14px] font-sans text-[#4A6070] mb-6">Briefs from your agency or brands will appear here.</p>
          <button onClick={() => setShowCreateForm(true)} className="bg-[#1E3F52] text-white rounded-[8px] px-6 py-3 text-[14px] font-sans" style={{ fontWeight: 600 }}>Create your first brief</button>
        </div>
      ) : (
        <div className="space-y-3">
          {briefs.map(brief => {
            const sc = statusConfig[brief.status];
            const isOverdue = new Date(brief.due_date) < new Date() && brief.status !== "approved";
            return (
              <button
                key={brief.id}
                onClick={() => { setSelectedBrief(brief); setDraftNotes(""); }}
                className="w-full text-left bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5 hover:border-[#7BAFC8] hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <p className="text-[15px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>{brief.brand_name}</p>
                    <span className="text-[13px] font-sans text-[#4A6070]">{brief.campaign_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOverdue && (
                      <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-[#FDEAEA] text-[#C0392B]" style={{ fontWeight: 600 }}>Overdue</span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[10px] font-sans uppercase tracking-[1.5px] px-2.5 py-1 rounded-full" style={{ background: sc.bg, color: sc.text, fontWeight: 600 }}>
                      {statusIcons[brief.status]} {sc.label}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[12px] font-sans text-[#8AAABB]">Due {formatDate(brief.due_date)}</span>
                  <span className="text-[12px] font-sans text-[#8AAABB]">{brief.deliverables?.length || 0} deliverable{(brief.deliverables?.length || 0) !== 1 ? "s" : ""}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Brief detail panel */}
      {selectedBrief && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0" style={{ background: "rgba(26,44,56,.4)", backdropFilter: "blur(4px)" }} onClick={() => setSelectedBrief(null)} />
          <div className="relative w-full max-w-[560px] bg-white border-l border-[#D8E8EE] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-[#F2F8FB] border-b border-[#D8E8EE] px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <button onClick={() => setSelectedBrief(null)} className="flex items-center gap-1 text-[12px] font-sans text-[#8AAABB] hover:text-[#1A2C38]">
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                <button onClick={() => setSelectedBrief(null)} className="text-[#8AAABB] hover:text-[#1A2C38]"><X className="h-5 w-5" /></button>
              </div>
              <h2 className="text-[20px] font-serif text-[#1A2C38] mt-2">{selectedBrief.campaign_name}</h2>
              <p className="text-[13px] font-sans text-[#8AAABB]">by {selectedBrief.brand_name}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Status and due date */}
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 text-[10px] font-sans uppercase tracking-[1.5px] px-2.5 py-1 rounded-full" style={{ background: statusConfig[selectedBrief.status].bg, color: statusConfig[selectedBrief.status].text, fontWeight: 600 }}>
                  {statusIcons[selectedBrief.status]} {statusConfig[selectedBrief.status].label}
                </span>
                <span className="text-[12px] font-sans text-[#8AAABB]">Due {formatDate(selectedBrief.due_date)}</span>
              </div>

              {/* Brief text */}
              <div>
                <h3 className="text-[11px] font-sans uppercase tracking-[2px] text-[#8AAABB] mb-2" style={{ fontWeight: 600 }}>Creative brief</h3>
                <div className="bg-[#FAF8F4] rounded-[8px] p-4">
                  <p className="text-[13px] font-sans text-[#1A2C38] leading-relaxed">{selectedBrief.brief_text}</p>
                </div>
              </div>

              {/* Deliverables checklist */}
              <div>
                <h3 className="text-[11px] font-sans uppercase tracking-[2px] text-[#8AAABB] mb-2" style={{ fontWeight: 600 }}>Deliverables</h3>
                <div className="space-y-2">
                  {selectedBrief.deliverables?.map((d, i) => (
                    <label key={i} className="flex items-center gap-3 text-[13px] font-sans text-[#1A2C38] cursor-pointer">
                      <input type="checkbox" className="rounded border-[#D8E8EE] text-[#7BAFC8] focus:ring-[#7BAFC8]" defaultChecked={selectedBrief.status === "approved"} />
                      {d}
                    </label>
                  ))}
                </div>
              </div>

              {/* Status actions */}
              {selectedBrief.status === "received" && (
                <button
                  onClick={() => handleStatusChange(selectedBrief.id, "in_progress")}
                  className="w-full bg-[#1E3F52] text-white rounded-[8px] px-4 py-2.5 text-[13px] font-sans"
                  style={{ fontWeight: 600 }}
                >
                  Start working on this brief
                </button>
              )}

              {/* Submit draft section */}
              {(selectedBrief.status === "in_progress" || selectedBrief.status === "revision_requested") && (
                <div>
                  <h3 className="text-[11px] font-sans uppercase tracking-[2px] text-[#8AAABB] mb-2" style={{ fontWeight: 600 }}>Submit draft</h3>
                  <textarea
                    value={draftNotes}
                    onChange={e => setDraftNotes(e.target.value)}
                    rows={4}
                    placeholder="Add notes about your draft, links to preview content, or anything the brand should know..."
                    className={`${inputClass} resize-none mb-3`}
                  />
                  <button
                    onClick={handleSubmitDraft}
                    className="w-full flex items-center justify-center gap-2 bg-[#1E3F52] text-white rounded-[8px] px-4 py-2.5 text-[13px] font-sans"
                    style={{ fontWeight: 600 }}
                  >
                    <Send className="h-4 w-4" /> Submit for review
                  </button>
                </div>
              )}

              {/* Revision history */}
              {briefSubmissions.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-sans uppercase tracking-[2px] text-[#8AAABB] mb-3" style={{ fontWeight: 600 }}>Revision history</h3>
                  <div className="space-y-3">
                    {briefSubmissions.map((sub, idx) => {
                      const subStatus = statusConfig[sub.status as Brief["status"]];
                      return (
                        <div key={sub.id} className="border-[1.5px] border-[#D8E8EE] rounded-[8px] p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[12px] font-sans text-[#8AAABB]">Submission {briefSubmissions.length - idx}</span>
                            <span className="text-[10px] font-sans uppercase tracking-[1px] px-2 py-0.5 rounded-full" style={{ background: subStatus?.bg, color: subStatus?.text, fontWeight: 600 }}>
                              {subStatus?.label}
                            </span>
                          </div>
                          <p className="text-[13px] font-sans text-[#1A2C38] mb-2">{sub.notes}</p>
                          <p className="text-[11px] font-sans text-[#8AAABB]">{formatDate(sub.submitted_at)}</p>
                          {sub.reviewer_notes && (
                            <div className="mt-3 bg-[#FAF8F4] rounded-[6px] p-3">
                              <p className="text-[10px] font-sans uppercase tracking-[1px] text-[#8AAABB] mb-1" style={{ fontWeight: 600 }}>Reviewer feedback</p>
                              <p className="text-[13px] font-sans text-[#1A2C38]">{sub.reviewer_notes}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create brief modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(26,44,56,.4)", backdropFilter: "blur(4px)" }}>
          <div className="relative bg-white rounded-[10px] border-[1.5px] border-[#D8E8EE] w-full max-w-lg overflow-hidden">
            <div className="bg-[#F2F8FB] px-6 py-4 border-b border-[#D8E8EE] flex items-center justify-between">
              <h2 className="text-[18px] font-serif text-[#1A2C38]">Create brief</h2>
              <button onClick={() => setShowCreateForm(false)} className="text-[#8AAABB] hover:text-[#1A2C38]"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass} style={{ fontWeight: 600 }}>Brand</label>
                  <input type="text" value={formBrand} onChange={e => setFormBrand(e.target.value)} placeholder="e.g., Nike" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass} style={{ fontWeight: 600 }}>Campaign name</label>
                  <input type="text" value={formCampaign} onChange={e => setFormCampaign(e.target.value)} placeholder="e.g., Summer Launch" className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass} style={{ fontWeight: 600 }}>Creative brief</label>
                <textarea value={formBriefText} onChange={e => setFormBriefText(e.target.value)} rows={4} placeholder="Creative direction, goals, tone, requirements..." className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label className={labelClass} style={{ fontWeight: 600 }}>Deliverables (comma-separated)</label>
                <input type="text" value={formDeliverables} onChange={e => setFormDeliverables(e.target.value)} placeholder="e.g., 1 TikTok video, 2 Instagram Reels" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass} style={{ fontWeight: 600 }}>Due date</label>
                  <input type="date" value={formDueDate} onChange={e => setFormDueDate(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass} style={{ fontWeight: 600 }}>Assigned creator</label>
                  <input type="text" value={formAssigned} onChange={e => setFormAssigned(e.target.value)} placeholder="Creator name" className={inputClass} />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowCreateForm(false)} className="flex-1 border-[1.5px] border-[#D8E8EE] rounded-[8px] px-4 py-2.5 text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>Cancel</button>
                <button onClick={handleCreateBrief} className="flex-1 bg-[#1E3F52] text-white rounded-[8px] px-4 py-2.5 text-[13px] font-sans" style={{ fontWeight: 600 }}>Create brief</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
