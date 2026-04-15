"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/global/toast";

const GOOGLE_CLIENT_ID = "854619861848-ck0ldn040uojlec0jpqkbpeoo9adhnm6.apps.googleusercontent.com";
import { Mail, CreditCard, Video, Camera, Calendar, FileText, Palette, Check, Bell, Unplug } from "lucide-react";

const integrations = [
  { name: "Gmail", description: "Import brand emails and detect deal opportunities", icon: Mail, category: "Email", oauthType: "google" as const },
  { name: "Google Calendar", description: "Sync deal deadlines and campaign timelines", icon: Calendar, category: "Calendar", oauthType: "google" as const },
  { name: "iCal Export", description: "Download all deal deadlines as an .ics file for any calendar app", icon: Calendar, category: "Calendar", oauthType: "ical" as const },
  { name: "DocuSign", description: "Send contracts for e-signature directly from Create Suite", icon: FileText, category: "Contracts", oauthType: "coming_soon" as const },
  { name: "Stripe", description: "Process payments and manage subscriptions", icon: CreditCard, category: "Payments", oauthType: "stripe" as const },
  { name: "Canva", description: "Import designs and create branded content for your media kit", icon: Palette, category: "Design", oauthType: "coming_soon" as const },
  { name: "TikTok", description: "Pull follower counts and engagement data automatically", icon: Video, category: "Social", oauthType: "coming_soon" as const },
  { name: "Instagram", description: "Sync your Instagram stats to your media kit", icon: Camera, category: "Social", oauthType: "coming_soon" as const },
  { name: "YouTube", description: "Import subscriber count and video analytics", icon: Video, category: "Social", oauthType: "coming_soon" as const },
];

export default function IntegrationsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [justConnected, setJustConnected] = useState<string | null>(null);
  const [notified, setNotified] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Check URL params for successful connection
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const connected = params.get("connected");
      if (connected) {
        setJustConnected(connected);
        refreshProfile();
        // Clean URL
        window.history.replaceState({}, "", "/integrations");
      }
    }
  }, [refreshProfile]);

  function handleConnect(oauthType: string) {
    if (!user) return;

    if (oauthType === "google") {
      // Redirect to Google OAuth
      const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: `${window.location.origin}/api/auth/google/callback`,
        response_type: "code",
        scope: "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email",
        access_type: "offline",
        prompt: "consent",
        state: user.id,
      });
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    }

    if (oauthType === "docusign") {
      const params = new URLSearchParams({
        response_type: "code",
        scope: "signature",
        client_id: process.env.NEXT_PUBLIC_DOCUSIGN_INTEGRATION_KEY || "",
        redirect_uri: `${window.location.origin}/api/auth/docusign/callback`,
        state: user.id,
      });
      window.location.href = `https://account-d.docusign.com/oauth/auth?${params}`;
    }

    if (oauthType === "ical") {
      window.open(`/api/ical?userId=${user.id}`, "_blank");
    }
  }

  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  async function handleDisconnect(oauthType: string) {
    if (!user) return;
    setDisconnecting(oauthType);
    try {
      const res = await fetch("/api/integrations/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, type: oauthType }),
      });
      if (res.ok) {
        await refreshProfile();
        toast("success", "Integration disconnected");
        setJustConnected(null);
      } else {
        toast("error", "Failed to disconnect");
      }
    } catch { toast("error", "Failed to disconnect"); }
    finally { setDisconnecting(null); }
  }

  function getStatus(oauthType: string): "connected" | "available" | "coming_soon" {
    if (oauthType === "coming_soon") return "coming_soon";
    if (oauthType === "stripe") return "connected";
    if (oauthType === "ical") return "available";
    if (oauthType === "google" && (justConnected === "google" || (profile && (profile as any).google_connected))) return "connected";
    if (oauthType === "docusign" && (justConnected === "docusign" || (profile && (profile as any).docusign_connected))) return "connected";
    return "available";
  }

  return (
    <div>
      <PageHeader
        headline={<><em className="italic text-[#7BAFC8]">Integrations</em></>}
        subheading="Connect your tools to power your Create Suite workflow."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((int) => {
          const status = getStatus(int.oauthType);
          return (
            <div key={int.name} className="bg-white border-[1.5px] border-[#D8E8EE] rounded-card p-5 flex items-start gap-4 hover:border-[#7BAFC8] hover:shadow-card transition-all">
              <div className="h-10 w-10 rounded-[10px] bg-[#F2F8FB] flex items-center justify-center flex-shrink-0">
                <int.icon className="h-5 w-5 text-[#7BAFC8]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[15px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>{int.name}</h3>
                  <span className={`text-[9px] font-sans uppercase tracking-[4px] px-2 py-0.5 rounded ${
                    status === "connected" ? "bg-[#E8F4EE] text-[#3D7A58]" :
                    status === "available" ? "bg-[#F2F8FB] text-[#3D6E8A]" :
                    "bg-[#F0EAE0] text-[#8AAABB]"
                  }`} style={{ fontWeight: 700 }}>
                    {status === "connected" ? "Connected" : status === "available" ? "Available" : "Coming Soon"}
                  </span>
                </div>
                <p className="text-[13px] font-sans text-[#4A6070] mb-3">{int.description}</p>
                {status === "connected" ? (
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-[12px] font-sans text-[#3D7A58]" style={{ fontWeight: 500 }}>
                      <Check className="h-3.5 w-3.5" /> Connected
                    </span>
                    {int.oauthType !== "stripe" && int.oauthType !== "ical" && (
                      <button
                        onClick={() => handleDisconnect(int.oauthType)}
                        disabled={disconnecting === int.oauthType}
                        className="flex items-center gap-1 text-[11px] font-sans text-[#8AAABB] hover:text-[#A03D3D] transition-colors"
                        style={{ fontWeight: 500 }}
                      >
                        <Unplug className="h-3 w-3" /> {disconnecting === int.oauthType ? "..." : "Disconnect"}
                      </button>
                    )}
                  </div>
                ) : status === "available" ? (
                  <button
                    onClick={() => handleConnect(int.oauthType)}
                    className="bg-[#1E3F52] text-white rounded-btn px-4 py-2 text-[12px] font-sans hover:bg-[#2a5269] transition-colors"
                    style={{ fontWeight: 600, letterSpacing: "0.3px" }}
                  >
                    {int.oauthType === "ical" ? "Download .ics" : "Connect"}
                  </button>
                ) : notified.has(int.name) ? (
                  <span className="flex items-center gap-1.5 text-[12px] font-sans text-[#3D7A58]" style={{ fontWeight: 500 }}>
                    <Bell className="h-3.5 w-3.5" /> You&apos;ll be notified
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      setNotified(prev => new Set(prev).add(int.name));
                      toast("success", `We'll notify you when ${int.name} is available!`);
                    }}
                    className="border-[1.5px] border-[#D8E8EE] text-[#4A6070] rounded-btn px-4 py-2 text-[12px] font-sans hover:border-[#7BAFC8] hover:text-[#1E3F52] transition-colors cursor-pointer"
                    style={{ fontWeight: 500 }}
                  >
                    Notify me
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
