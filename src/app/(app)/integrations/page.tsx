"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Mail, CreditCard, Video, Camera, Calendar, FileText } from "lucide-react";

const integrations = [
  {
    name: "Stripe",
    description: "Process payments and manage subscriptions",
    icon: CreditCard,
    status: "available" as const,
    category: "Payments",
    connectUrl: "/api/stripe/checkout",
  },
  {
    name: "Gmail",
    description: "Import brand emails and detect deal opportunities",
    icon: Mail,
    status: "coming_soon" as const,
    category: "Email",
    connectUrl: null,
  },
  {
    name: "Outlook",
    description: "Import brand emails from your Outlook inbox",
    icon: Mail,
    status: "coming_soon" as const,
    category: "Email",
    connectUrl: null,
  },
  {
    name: "TikTok",
    description: "Pull follower counts and engagement data automatically",
    icon: Video,
    status: "coming_soon" as const,
    category: "Social",
    connectUrl: null,
  },
  {
    name: "Instagram",
    description: "Sync your Instagram stats to your media kit",
    icon: Camera,
    status: "coming_soon" as const,
    category: "Social",
    connectUrl: null,
  },
  {
    name: "YouTube",
    description: "Import subscriber count and video analytics",
    icon: Video,
    status: "coming_soon" as const,
    category: "Social",
    connectUrl: null,
  },
  {
    name: "Google Calendar",
    description: "Sync deal deadlines and campaign timelines",
    icon: Calendar,
    status: "coming_soon" as const,
    category: "Productivity",
    connectUrl: null,
  },
  {
    name: "DocuSign",
    description: "Send contracts for e-signature directly from Create Suite",
    icon: FileText,
    status: "coming_soon" as const,
    category: "Contracts",
    connectUrl: null,
  },
];

export default function IntegrationsPage() {
  return (
    <div>
      <PageHeader
        headline={<><em className="italic text-[#7BAFC8]">Integrations</em></>}
        subheading="Connect your tools to power your Create Suite workflow."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((int) => (
          <div key={int.name} className="bg-white border-[1.5px] border-[#D8E8EE] rounded-card p-5 flex items-start gap-4 hover:border-[#7BAFC8] hover:shadow-card transition-all">
            <div className="h-10 w-10 rounded-[10px] bg-[#F2F8FB] flex items-center justify-center flex-shrink-0">
              <int.icon className="h-5 w-5 text-[#7BAFC8]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-[15px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>{int.name}</h3>
                <span className={`text-[9px] font-sans uppercase tracking-[4px] px-2 py-0.5 rounded ${
                  int.status === "available" ? "bg-[#E8F4EE] text-[#3D7A58]" : "bg-[#F2F8FB] text-[#8AAABB]"
                }`} style={{ fontWeight: 700 }}>
                  {int.status === "available" ? "Available" : "Coming Soon"}
                </span>
              </div>
              <p className="text-[13px] font-sans text-[#4A6070] mb-3">{int.description}</p>
              {int.status === "available" ? (
                <button className="bg-[#1E3F52] text-white rounded-btn px-4 py-2 text-[12px] font-sans" style={{ fontWeight: 600, letterSpacing: "0.3px" }}>
                  Connect
                </button>
              ) : (
                <button className="border-[1.5px] border-[#D8E8EE] text-[#8AAABB] rounded-btn px-4 py-2 text-[12px] font-sans cursor-not-allowed" style={{ fontWeight: 500 }}>
                  Notify me
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
