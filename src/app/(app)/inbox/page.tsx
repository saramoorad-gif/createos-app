import { PageHeader } from "@/components/layout/page-header";
import { inboxEmails } from "@/lib/placeholder-data";

export default function InboxPage() {
  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return (
    <div>
      <PageHeader
        headline={<>Your <em className="italic text-[#C4714A]">inbox</em></>}
        subheading="Unified view of Gmail & Outlook — brand deals auto-tagged."
      />

      <div className="bg-white border border-[#E5E0D8] rounded-[10px] overflow-hidden">
        {inboxEmails.map((email, i) => (
          <div
            key={email.id}
            className={`px-5 py-4 flex items-start gap-4 ${
              i < inboxEmails.length - 1 ? "border-b border-[#E5E0D8]" : ""
            } ${!email.is_read ? "bg-[#FDFCFA]" : ""}`}
          >
            {/* Unread dot */}
            <div className="pt-1.5 flex-shrink-0 w-2">
              {!email.is_read && (
                <div className="h-2 w-2 rounded-full bg-[#C4714A]" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-[14px] font-sans ${!email.is_read ? "font-semibold text-[#1C1714]" : "font-medium text-[#1C1714]"}`}>
                  {email.from_name}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#9A9088] bg-[#F7F4EF] border border-[#E5E0D8] rounded px-1.5 py-0.5">
                  {email.provider}
                </span>
                {email.is_brand_deal && (
                  <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#C4714A] bg-[#C4714A]/10 rounded px-1.5 py-0.5">
                    Brand Deal
                  </span>
                )}
                {email.is_starred && (
                  <span className="text-[12px] text-[#C4714A]">&#9733;</span>
                )}
              </div>
              <p className={`text-[13px] font-sans ${!email.is_read ? "text-[#1C1714]" : "text-[#9A9088]"} truncate`}>
                {email.subject}
              </p>
              <p className="text-[12px] font-sans text-[#9A9088] mt-0.5 truncate">
                {email.preview}
              </p>
            </div>

            <span className="text-[12px] font-mono text-[#9A9088] flex-shrink-0 pt-0.5">
              {formatDate(email.received_at)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
