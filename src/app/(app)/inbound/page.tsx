"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useSupabaseQuery, useSupabaseMutation } from "@/lib/hooks";
import { useToast } from "@/components/global/toast";
import { CardGridSkeleton } from "@/components/global/skeleton";

interface InboundInquiry {
  id: string;
  brand_name: string;
  contact_name: string;
  contact_email: string;
  message: string;
  budget_range: string;
  platforms_requested: string[];
  status: "new" | "reviewed" | "added_to_pipeline" | "declined";
  created_at: string;
}

const statusLabels: Record<string, string> = {
  new: "New",
  reviewed: "Reviewed",
  added_to_pipeline: "In Pipeline",
  declined: "Declined",
};

const statusColors: Record<string, string> = {
  new: "bg-[#7BAFC8]/10 text-[#7BAFC8]",
  reviewed: "bg-[#D8E8EE] text-[#1A2C38]",
  added_to_pipeline: "bg-emerald-50 text-emerald-700",
  declined: "bg-red-50 text-red-600",
};

const platformLabel: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
};

export default function InboundPage() {
  const { data: inboundInquiries, loading, setData: setInquiries } = useSupabaseQuery<InboundInquiry>("inbound_inquiries", {
    order: { column: "created_at", ascending: false },
  });
  const { update } = useSupabaseMutation("inbound_inquiries");
  const { insert: insertDeal } = useSupabaseMutation("deals");
  const [selectedInquiry, setSelectedInquiry] = useState<string | null>(null);
  const { toast } = useToast();

  async function handleAddToPipeline(inq: InboundInquiry) {
    try {
      // Create a new deal from the inquiry
      await insertDeal({
        brand_name: inq.brand_name,
        stage: "lead",
        notes: `From inbound inquiry: ${inq.message}`,
        platform: inq.platforms_requested[0] || null,
      });

      // Mark the inquiry as added
      await update(inq.id, { status: "added_to_pipeline" });
      setInquiries(prev => prev.map(i => i.id === inq.id ? { ...i, status: "added_to_pipeline" } : i));
      toast("success", `${inq.brand_name} added to pipeline`);
      setSelectedInquiry(null);
    } catch (e) {
      console.error("Failed to add inquiry to pipeline:", e);
      toast("error", "Failed to add to pipeline");
    }
  }

  async function handleDecline(inq: InboundInquiry) {
    try {
      await update(inq.id, { status: "declined" });
      setInquiries(prev => prev.map(i => i.id === inq.id ? { ...i, status: "declined" } : i));
      toast("info", `${inq.brand_name} declined`);
      setSelectedInquiry(null);
    } catch (e) {
      console.error("Failed to decline inquiry:", e);
      toast("error", "Failed to decline");
    }
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  if (loading) return <CardGridSkeleton count={4} />;

  if (inboundInquiries.length === 0) {
    return (
      <div>
        <PageHeader
          headline={<>Inbound <em className="italic text-[#7BAFC8]">inquiries</em></>}
          subheading="Work With Me inquiries — review and add to your deal pipeline."
        />
        <div className="text-center py-16">
          <p className="text-[20px] font-serif italic text-[#8AAABB]">No inquiries yet — share your media kit link to start receiving brand inquiries.</p>
          <button onClick={() => { navigator.clipboard.writeText(`https://createsuite.co/kit/`); toast("success", "Media kit link copied!"); }} className="mt-4 text-[13px] font-sans font-500 text-[#7BAFC8] hover:underline">Copy media kit link →</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        headline={<>Inbound <em className="italic text-[#7BAFC8]">inquiries</em></>}
        subheading="Work With Me inquiries — review and add to your deal pipeline."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {inboundInquiries.map((inq) => (
          <div
            key={inq.id}
            className="bg-white border border-[#D8E8EE] rounded-[10px] overflow-hidden"
          >
            {/* Terra gradient top border */}
            <div className="h-1 bg-gradient-to-r from-[#7BAFC8] to-[#D4956F]" />

            <div className="px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[15px] font-sans font-semibold text-[#1A2C38]">
                  {inq.brand_name}
                </h3>
                <span className={`text-[10px] font-sans font-semibold uppercase tracking-wider rounded px-2 py-0.5 ${statusColors[inq.status]}`}>
                  {statusLabels[inq.status]}
                </span>
              </div>

              <p className="text-[13px] font-sans text-[#8AAABB] leading-relaxed line-clamp-2 mb-3">
                {inq.message}
              </p>

              <div className="flex items-center gap-3 text-[11px] font-mono text-[#8AAABB]">
                <span>{inq.contact_name}</span>
                <span className="text-[#D8E8EE]">|</span>
                <span>{inq.budget_range}</span>
                <span className="text-[#D8E8EE]">|</span>
                <span>{inq.platforms_requested.map((p) => platformLabel[p] || p).join(", ")}</span>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#D8E8EE]">
                <span className="text-[11px] font-mono text-[#8AAABB]">
                  {formatDate(inq.created_at)}
                </span>
                <button onClick={() => setSelectedInquiry(selectedInquiry === inq.id ? null : inq.id)} className="text-[12px] font-sans font-medium text-[#7BAFC8] hover:underline">
                  {selectedInquiry === inq.id ? "Close ←" : "Review →"}
                </button>
              </div>

              {selectedInquiry === inq.id && (
                <div className="mt-3 pt-3 border-t border-[#D8E8EE] space-y-3">
                  <div>
                    <p className="text-[11px] font-sans text-[#8AAABB] uppercase tracking-wider mb-1" style={{ fontWeight: 600 }}>Full Message</p>
                    <p className="text-[13px] font-sans text-[#1A2C38] leading-relaxed">{inq.message}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-sans text-[#8AAABB]">Contact:</p>
                    <a href={`mailto:${inq.contact_email}`} className="text-[12px] font-mono text-[#7BAFC8] hover:underline">{inq.contact_email}</a>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleAddToPipeline(inq)} className="flex-1 bg-[#1E3F52] text-white rounded-btn px-3 py-2 text-[12px] font-sans hover:bg-[#2a5269] transition-colors" style={{ fontWeight: 600 }}>Add to pipeline</button>
                    <button onClick={() => handleDecline(inq)} className="flex-1 border-[1.5px] border-[#D8E8EE] text-[#8AAABB] rounded-btn px-3 py-2 text-[12px] font-sans hover:border-[#7BAFC8] transition-colors" style={{ fontWeight: 500 }}>Decline</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
