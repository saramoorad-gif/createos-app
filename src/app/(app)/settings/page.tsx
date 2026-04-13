"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { agencyLink, agencyPermissions, activityLog } from "@/lib/placeholder-data";
import { timeAgo } from "@/lib/utils";
import { Shield, Check, X as XIcon, Unlink, Clock } from "lucide-react";

const actionIcons: Record<string, string> = {
  created_deal: "bg-[#4A9060]",
  updated_deal: "bg-[#D4A030]",
  uploaded_contract: "bg-[#C4714A]",
  created_invoice: "bg-[#4A9060]",
  added_note: "bg-[#9A9088]",
  moved_stage: "bg-[#D4A030]",
};

export default function SettingsPage() {
  const [disconnecting, setDisconnecting] = useState(false);

  return (
    <div>
      <PageHeader
        headline={<><em className="italic text-[#C4714A]">Settings</em></>}
        subheading="Manage your account, agency access, and preferences."
      />

      <div className="space-y-8 max-w-3xl">
        {/* Agency Access Section */}
        <div>
          <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#9A9088] mb-4">
            AGENCY ACCESS
          </p>

          <div className="bg-white border border-[#E5E0D8] rounded-[10px] overflow-hidden">
            {/* Agency info bar */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-[#E5E0D8]">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[#F2EEE8] flex items-center justify-center">
                  <Shield className="h-4 w-4 text-[#9A9088]" />
                </div>
                <div>
                  <p className="text-[14px] font-sans font-600 text-[#1C1714]">{agencyLink.agency_name}</p>
                  <p className="text-[11px] font-sans text-[#9A9088]">
                    Connected since {new Date(agencyLink.linked_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })} · {agencyLink.commission_rate}% commission
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-sans font-500 uppercase tracking-[1.5px] px-2 py-0.5 rounded-full bg-[#EBF5EB] text-[#4A9060]">
                  Active
                </span>
                <button
                  onClick={() => setDisconnecting(true)}
                  className="flex items-center gap-1.5 text-[12px] font-sans font-500 text-[#E05C3A] hover:underline ml-3"
                >
                  <Unlink className="h-3.5 w-3.5" /> Disconnect
                </button>
              </div>
            </div>

            {/* Permissions */}
            <div className="grid grid-cols-2 divide-x divide-[#E5E0D8]">
              {/* Can do */}
              <div className="p-5">
                <p className="text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#4A9060] mb-3">
                  CAN DO
                </p>
                <div className="space-y-2">
                  {agencyPermissions.canDo.map((p) => (
                    <div key={p} className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-[#4A9060] mt-0.5 flex-shrink-0" />
                      <span className="text-[12px] font-sans text-[#1C1714]">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Cannot do */}
              <div className="p-5">
                <p className="text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#E05C3A] mb-3">
                  CANNOT DO
                </p>
                <div className="space-y-2">
                  {agencyPermissions.cannotDo.map((p) => (
                    <div key={p} className="flex items-start gap-2">
                      <XIcon className="h-3.5 w-3.5 text-[#E05C3A] mt-0.5 flex-shrink-0" />
                      <span className="text-[12px] font-sans text-[#1C1714]">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agency Activity Log */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#9A9088]">
              AGENCY ACTIVITY
            </p>
            <span className="text-[11px] font-sans text-[#9A9088]">
              Last 30 actions
            </span>
          </div>

          <div className="bg-white border border-[#E5E0D8] rounded-[10px] overflow-hidden">
            {activityLog.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 px-5 py-3 border-b border-[#E5E0D8] last:border-b-0"
              >
                <div className={`h-2 w-2 rounded-full flex-shrink-0 ${actionIcons[entry.action] || "bg-[#9A9088]"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-sans text-[#1C1714]">
                    <span className="font-500">{entry.actor_name}</span>
                    <span className="text-[#9A9088]"> {entry.action_label.toLowerCase()} </span>
                    <span className="font-500">{entry.target_name}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Clock className="h-3 w-3 text-[#9A9088]" />
                  <span className="text-[11px] font-mono text-[#9A9088]">
                    {timeAgo(entry.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disconnect Confirmation */}
        {disconnecting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/20" onClick={() => setDisconnecting(false)} />
            <div className="relative bg-white rounded-[10px] border border-[#E5E0D8] w-full max-w-sm p-6">
              <h3 className="text-[18px] font-serif text-[#1C1714] mb-2">Disconnect agency?</h3>
              <p className="text-[13px] font-sans text-[#9A9088] mb-5">
                {agencyLink.agency_name} will lose access to create or edit deals, invoices, and contracts on your account. Existing records will not be deleted.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setDisconnecting(false)} className="flex-1 border border-[#E5E0D8] rounded-[10px] px-4 py-2.5 text-[13px] font-sans font-500 hover:bg-[#F7F4EF]">
                  Cancel
                </button>
                <button onClick={() => setDisconnecting(false)} className="flex-1 bg-[#E05C3A] text-white rounded-[10px] px-4 py-2.5 text-[13px] font-sans font-500 hover:bg-[#D04B2A]">
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
