import { PageHeader } from "@/components/layout/page-header";
import { inboundInquiries } from "@/lib/placeholder-data";

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
  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
                <span>{inq.platforms_requested.map((p) => platformLabel[p]).join(", ")}</span>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#D8E8EE]">
                <span className="text-[11px] font-mono text-[#8AAABB]">
                  {formatDate(inq.created_at)}
                </span>
                <button className="text-[12px] font-sans font-medium text-[#7BAFC8] hover:underline">
                  Review →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
