"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/contexts/auth-context";
import { useSupabaseQuery } from "@/lib/hooks";
import { timeAgo } from "@/lib/utils";
import { Shield, Check, Lock, Unlink, Clock, CreditCard } from "lucide-react";

interface AgencyLink {
  id: string;
  agency_id: string;
  creator_id: string;
  commission_rate: number;
  status: string;
  linked_at: string;
}

interface ActivityEntry {
  id: string;
  actor_id: string;
  actor_type: string;
  action: string;
  target_id: string;
  target_type: string;
  metadata: Record<string, string>;
  created_at: string;
}

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
  const { profile } = useAuth();

  const { data: agencyLinks, loading: linksLoading } = useSupabaseQuery<AgencyLink>("agency_creator_links", {
    eq: profile?.id ? { column: "creator_id", value: profile.id } : undefined,
  });

  const { data: activityLog, loading: activityLoading } = useSupabaseQuery<ActivityEntry>("activity_log", {
    order: { column: "created_at", ascending: false },
    limit: 30,
  });

  const agencyLink = agencyLinks.find(l => l.status === "active");
  const hasAgency = Boolean(agencyLink);

  async function handleManageBilling() {
    const customerId = (profile as Record<string, unknown>)?.stripe_customer_id;

    // If no Stripe customer yet, redirect to pricing to subscribe
    if (!customerId) {
      window.location.href = "/pricing";
      return;
    }

    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          returnUrl: window.location.href,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        // Fallback to pricing if portal fails
        window.location.href = "/pricing";
      }
    } catch {
      window.location.href = "/pricing";
    }
  }

  return (
    <div>
      <PageHeader
        headline={<><em className="italic text-[#7BAFC8]">Settings</em></>}
        subheading="Manage your account, billing, and agency access."
      />

      <div className="space-y-8 max-w-3xl">
        {/* Account Info */}
        <div>
          <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-4" style={{ fontWeight: 600 }}>ACCOUNT</p>
          <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-card p-5 space-y-3">
            <div className="flex justify-between">
              <span className="text-[12px] font-sans text-[#8AAABB]">Name</span>
              <span className="text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>{profile?.full_name || "—"}</span>
            </div>
            <div className="flex justify-between border-t border-[#D8E8EE] pt-3">
              <span className="text-[12px] font-sans text-[#8AAABB]">Email</span>
              <span className="text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>{profile?.email || "—"}</span>
            </div>
            <div className="flex justify-between border-t border-[#D8E8EE] pt-3">
              <span className="text-[12px] font-sans text-[#8AAABB]">Plan</span>
              <span className="text-[13px] font-sans text-[#3D6E8A]" style={{ fontWeight: 500 }}>{profile?.account_type || "Free"}</span>
            </div>
          </div>
        </div>

        {/* Billing */}
        <div>
          <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-4" style={{ fontWeight: 600 }}>BILLING</p>
          <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[#F2F8FB] flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-[#7BAFC8]" />
                </div>
                <div>
                  <p className="text-[14px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>Manage subscription</p>
                  <p className="text-[12px] font-sans text-[#8AAABB]">Update payment method, view invoices, or change plan</p>
                </div>
              </div>
              <button onClick={handleManageBilling} className="bg-[#1E3F52] text-white rounded-btn px-4 py-2 text-[12px] font-sans" style={{ fontWeight: 600 }}>
                Manage billing
              </button>
            </div>
          </div>
        </div>

        {/* Agency Access — only show if connected */}
        {(hasAgency || linksLoading) && (
          <div>
            <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-4" style={{ fontWeight: 600 }}>AGENCY ACCESS</p>

            {linksLoading ? (
              <p className="text-[14px] font-sans text-[#8AAABB]">Loading agency info...</p>
            ) : hasAgency && agencyLink ? (
              <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-card overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-[#D8E8EE]">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-[#F2F8FB] flex items-center justify-center">
                      <Shield className="h-4 w-4 text-[#7BAFC8]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[14px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>Agency Connected</p>
                        <span className="text-[9px] font-sans uppercase tracking-[4px] px-2 py-0.5 rounded bg-[#E8F4EE] text-[#3D7A58]" style={{ fontWeight: 700 }}>Active</span>
                      </div>
                      <p className="text-[12px] font-sans text-[#8AAABB]">
                        Connected {timeAgo(agencyLink.linked_at)} · {agencyLink.commission_rate}% commission
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setDisconnecting(true)} className="flex items-center gap-1.5 text-[12px] font-sans text-[#A03D3D]/60 hover:text-[#A03D3D]" style={{ fontWeight: 500 }}>
                    <Unlink className="h-3.5 w-3.5" /> Disconnect
                  </button>
                </div>

                <div className="px-5 py-3 border-b border-[#D8E8EE]">
                  <p className="text-[14px] font-sans italic text-[#4A6070]">
                    Your agency can help manage your deals — but your profile, rates, and media kit always stay yours.
                  </p>
                </div>

                <div className="grid grid-cols-2 divide-x divide-[#D8E8EE]">
                  <div className="p-5 bg-[#F2F8FB]">
                    <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#7BAFC8] mb-3" style={{ fontWeight: 600 }}>WHAT THEY CAN DO</p>
                    <div className="space-y-2.5">
                      {canDo.map(item => (
                        <div key={item} className="flex items-start gap-2">
                          <Check className="h-3.5 w-3.5 text-[#7BAFC8] mt-0.5 flex-shrink-0" />
                          <span className="text-[12px] font-sans text-[#1A2C38]">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-5 bg-[#F0EAE0]">
                    <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-3" style={{ fontWeight: 600 }}>ALWAYS YOURS 🔒</p>
                    <div className="space-y-2.5">
                      {alwaysYours.map(item => (
                        <div key={item} className="flex items-start gap-2">
                          <Lock className="h-3.5 w-3.5 text-[#6A5040] mt-0.5 flex-shrink-0" />
                          <span className="text-[12px] font-sans text-[#6A5040]">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Activity Log — only show if there's activity */}
        {activityLog.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB]" style={{ fontWeight: 600 }}>RECENT ACTIVITY</p>
            </div>
            <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-card overflow-hidden">
              {activityLog.slice(0, 10).map(entry => (
                <div key={entry.id} className="flex items-center gap-3 px-5 py-3 border-b border-[#EEE8E0] last:border-b-0 hover:bg-[#F7F4F0] transition-colors">
                  <div className={`h-2 w-2 rounded-full flex-shrink-0 ${actionDots[entry.action] || "bg-[#8AAABB]"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-sans text-[#1A2C38]">
                      <span style={{ fontWeight: 500 }}>{entry.actor_type}</span>
                      <span className="text-[#8AAABB]"> {entry.action.replace(/_/g, " ")} </span>
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
        )}

        {/* Disconnect Modal */}
        {disconnecting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(26,44,56,.4)", backdropFilter: "blur(4px)" }}>
            <div className="relative bg-white rounded-panel border-[1.5px] border-[#D8E8EE] w-full max-w-sm overflow-hidden">
              <div className="bg-[#F2F8FB] px-6 py-4 border-b border-[#D8E8EE]">
                <h3 className="text-[18px] font-serif text-[#1A2C38]">Disconnect agency?</h3>
              </div>
              <div className="p-6">
                <p className="text-[13px] font-sans text-[#4A6070] mb-5">
                  Your agency will lose access to create or edit deals, invoices, and contracts on your account. Existing records will not be deleted.
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
