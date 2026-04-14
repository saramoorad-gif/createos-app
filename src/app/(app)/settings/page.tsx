"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { agencyLink, activityLog } from "@/lib/placeholder-data";
import { timeAgo } from "@/lib/utils";
import { Shield, Check, Lock, Unlink, Clock } from "lucide-react";

const actionDots: Record<string, string> = {
  created_deal: "bg-[#3D7A58]",
  updated_deal: "bg-[#7BAFC8]",
  uploaded_contract: "bg-[#3D6E8A]",
  created_invoice: "bg-[#3D7A58]",
  added_note: "bg-[#8AAABB]",
  moved_stage: "bg-[#A07830]",
};

const canDo = [
  "Create and edit deals on your behalf",
  "Create and send invoices for your deals",
  "Upload and review contracts",
  "Add notes and comments to deals",
  "Move deals between pipeline stages",
  "Message you directly inside the platform",
];

const alwaysYours = [
  "Your profile and bio",
  "Your media kit and photos",
  "Your rate card",
  "Your subscription and billing",
  "Your email inbox access",
  "Your Stripe/Helcim payment details",
];

export default function SettingsPage() {
  const [disconnecting, setDisconnecting] = useState(false);

  return (
    <div>
      <PageHeader
        headline={<><em className="italic text-[#7BAFC8]">Settings</em></>}
        subheading="Manage your account, agency access, and preferences."
      />

      <div className="space-y-8 max-w-3xl">
        {/* Agency Access */}
        <div>
          <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-4" style={{ fontWeight: 600 }}>
            AGENCY ACCESS
          </p>

          <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-card overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-[#D8E8EE]">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[#F2F8FB] flex items-center justify-center">
                  <Shield className="h-4 w-4 text-[#7BAFC8]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>{agencyLink.agency_name}</p>
                    <span className="text-[9px] font-sans uppercase tracking-[4px] px-2 py-0.5 rounded bg-[#E8F4EE] text-[#3D7A58]" style={{ fontWeight: 700 }}>Active</span>
                  </div>
                  <p className="text-[12px] font-sans text-[#8AAABB]">
                    Connected since {new Date(agencyLink.linked_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })} · {agencyLink.commission_rate}% commission
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDisconnecting(true)}
                className="flex items-center gap-1.5 text-[12px] font-sans text-[#A03D3D]/60 hover:text-[#A03D3D] transition-colors" style={{ fontWeight: 500 }}
              >
                <Unlink className="h-3.5 w-3.5" /> Disconnect
              </button>
            </div>

            {/* Reassurance line */}
            <div className="px-5 py-3 border-b border-[#D8E8EE]">
              <p className="text-[14px] font-sans italic text-[#4A6070]">
                Your agency can help manage your deals — but your profile, rates, and media kit always stay yours.
              </p>
            </div>

            {/* Two columns */}
            <div className="grid grid-cols-2 divide-x divide-[#D8E8EE]">
              {/* Can do */}
              <div className="p-5 bg-[#F2F8FB]">
                <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#7BAFC8] mb-3" style={{ fontWeight: 600 }}>
                  WHAT THEY CAN DO
                </p>
                <div className="space-y-2.5">
                  {canDo.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-[#7BAFC8] mt-0.5 flex-shrink-0" />
                      <span className="text-[12px] font-sans text-[#1A2C38]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Always yours */}
              <div className="p-5 bg-[#F0EAE0]">
                <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-3" style={{ fontWeight: 600 }}>
                  ALWAYS YOURS 🔒
                </p>
                <div className="space-y-2.5">
                  {alwaysYours.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <Lock className="h-3.5 w-3.5 text-[#6A5040] mt-0.5 flex-shrink-0" />
                      <span className="text-[12px] font-sans text-[#6A5040]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB]" style={{ fontWeight: 600 }}>AGENCY ACTIVITY</p>
            <span className="text-[11px] font-sans text-[#8AAABB]">Last 30 actions</span>
          </div>

          <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-card overflow-hidden">
            {activityLog.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 px-5 py-3 border-b border-[#EEE8E0] last:border-b-0 hover:bg-[#F7F4F0] transition-colors">
                <div className={`h-2 w-2 rounded-full flex-shrink-0 ${actionDots[entry.action] || "bg-[#8AAABB]"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-sans text-[#1A2C38]">
                    <span style={{ fontWeight: 500 }}>{entry.actor_name}</span>
                    <span className="text-[#8AAABB]"> {entry.action_label.toLowerCase()} </span>
                    <span style={{ fontWeight: 500 }}>{entry.target_name}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Clock className="h-3 w-3 text-[#8AAABB]" />
                  <span className="text-[11px] font-mono text-[#8AAABB]">{timeAgo(entry.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disconnect Modal */}
        {disconnecting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(26,44,56,.4)", backdropFilter: "blur(4px)" }}>
            <div className="relative bg-white rounded-panel border-[1.5px] border-[#D8E8EE] w-full max-w-sm overflow-hidden">
              <div className="bg-[#F2F8FB] px-6 py-4 border-b border-[#D8E8EE]">
                <h3 className="text-[18px] font-serif text-[#1A2C38]">Disconnect agency?</h3>
              </div>
              <div className="p-6">
                <p className="text-[13px] font-sans text-[#4A6070] mb-5">
                  {agencyLink.agency_name} will lose access to create or edit deals, invoices, and contracts on your account. Existing records will not be deleted.
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setDisconnecting(false)} className="flex-1 border-[1.5px] border-[#D8E8EE] rounded-btn px-4 py-2.5 text-[13px] font-sans text-[#1A2C38] hover:bg-[#FAF8F4]" style={{ fontWeight: 500 }}>Cancel</button>
                  <button onClick={() => setDisconnecting(false)} className="flex-1 bg-[#A03D3D] text-white rounded-btn px-4 py-2.5 text-[13px] font-sans" style={{ fontWeight: 600 }}>Disconnect</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
