"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useToast } from "@/components/global/toast";
import { formatCurrency } from "@/lib/utils";
import { Sparkles, Users, Video, Camera, Globe, Bell, Lock } from "lucide-react";

interface PreviewCampaign {
  id: string;
  brand: string;
  campaign: string;
  budgetMin: number;
  budgetMax: number;
  contentType: string;
  creatorSlots: number;
  icon: React.ReactNode;
  tags: string[];
}

const previewCampaigns: PreviewCampaign[] = [
  {
    id: "1",
    brand: "Glow Recipe",
    campaign: "Summer Skincare Campaign",
    budgetMin: 2000,
    budgetMax: 4000,
    contentType: "Skincare review",
    creatorSlots: 5,
    icon: <Sparkles className="h-5 w-5" />,
    tags: ["Instagram", "TikTok", "Skincare"],
  },
  {
    id: "2",
    brand: "Canva",
    campaign: "Back to School",
    budgetMin: 1500,
    budgetMax: 3000,
    contentType: "UGC video",
    creatorSlots: 8,
    icon: <Video className="h-5 w-5" />,
    tags: ["TikTok", "UGC", "Education"],
  },
  {
    id: "3",
    brand: "Aritzia",
    campaign: "Fall Fashion",
    budgetMin: 3000,
    budgetMax: 6000,
    contentType: "Influencer",
    creatorSlots: 3,
    icon: <Camera className="h-5 w-5" />,
    tags: ["Instagram", "YouTube", "Fashion"],
  },
  {
    id: "4",
    brand: "Calm",
    campaign: "Wellness Week",
    budgetMin: 2000,
    budgetMax: 5000,
    contentType: "Multi-platform",
    creatorSlots: 6,
    icon: <Globe className="h-5 w-5" />,
    tags: ["TikTok", "Instagram", "YouTube", "Wellness"],
  },
];

export default function MarketplacePage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  function handleNotify() {
    if (!email.trim() || !email.includes("@")) {
      toast("error", "Please enter a valid email address");
      return;
    }
    setSubmitted(true);
    toast("success", "You'll be notified when the marketplace launches!");
  }

  return (
    <div>
      <PageHeader
        headline={<>Deal <em className="italic text-[#7BAFC8]">marketplace</em></>}
        subheading="Browse open brand campaigns and apply."
      />

      {/* Hero section */}
      <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-8 mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-[#FDF3E4] text-[#A07830] rounded-full px-4 py-1.5 text-[11px] font-sans uppercase tracking-[2px] mb-5" style={{ fontWeight: 600 }}>
          <Sparkles className="h-3.5 w-3.5" /> Coming Soon
        </div>
        <h2 className="text-[28px] font-serif text-[#1A2C38] mb-3">A marketplace built for creators</h2>
        <p className="text-[15px] font-sans text-[#4A6070] max-w-xl mx-auto leading-relaxed mb-2">
          Browse open campaigns from brands, apply directly, and land deals on your terms.
          No middlemen, no hidden fees for creators.
        </p>
        <p className="text-[13px] font-sans text-[#8AAABB] max-w-lg mx-auto">
          Brands will be able to post campaigns. Creators apply. You keep 100% of your rate — we charge brands a 10% platform fee.
        </p>
      </div>

      {/* Preview campaign cards */}
      <h3 className="text-[11px] font-sans uppercase tracking-[2px] text-[#8AAABB] mb-4" style={{ fontWeight: 600 }}>Preview of upcoming campaigns</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {previewCampaigns.map(campaign => (
          <div key={campaign.id} className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5 relative opacity-90">
            {/* Brand and campaign info */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F2F8FB] border-[1.5px] border-[#D8E8EE] flex items-center justify-center text-[#7BAFC8]">
                  {campaign.icon}
                </div>
                <div>
                  <p className="text-[13px] font-sans text-[#8AAABB]">{campaign.brand}</p>
                  <p className="text-[15px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>{campaign.campaign}</p>
                </div>
              </div>
            </div>

            {/* Budget and details */}
            <div className="flex items-center gap-4 mb-3">
              <div>
                <span className="text-[18px] font-serif text-[#1E3F52]">
                  {formatCurrency(campaign.budgetMin)}–{formatCurrency(campaign.budgetMax)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4 text-[12px] font-sans text-[#8AAABB]">
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {campaign.creatorSlots} creators</span>
              <span>{campaign.contentType}</span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {campaign.tags.map(tag => (
                <span key={tag} className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-[#F2F8FB] text-[#7BAFC8] uppercase tracking-[1px]" style={{ fontWeight: 500 }}>
                  {tag}
                </span>
              ))}
            </div>

            {/* Apply button (disabled) */}
            <div className="relative group">
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 bg-[#D8E8EE] text-[#8AAABB] rounded-[8px] px-4 py-2.5 text-[13px] font-sans cursor-not-allowed"
                style={{ fontWeight: 600 }}
              >
                <Lock className="h-3.5 w-3.5" /> Apply
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#1A2C38] text-white text-[11px] font-sans rounded-[6px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Coming soon — marketplace is not yet live
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Notification signup */}
      <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-8 text-center">
        <Bell className="h-8 w-8 text-[#7BAFC8] mx-auto mb-3" />
        <h3 className="text-[20px] font-serif text-[#1A2C38] mb-2">Get notified when marketplace launches</h3>
        <p className="text-[13px] font-sans text-[#8AAABB] mb-5">Be the first to browse campaigns and apply to brand deals.</p>

        {submitted ? (
          <div className="bg-[#E6F2EB] rounded-[8px] p-4 max-w-md mx-auto">
            <p className="text-[14px] font-sans text-[#3D7A58]" style={{ fontWeight: 500 }}>
              You&apos;re on the list! We&apos;ll notify you at {email} when the marketplace goes live.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              onKeyDown={e => e.key === "Enter" && handleNotify()}
              className="flex-1 rounded-[8px] border-[1.5px] border-[#D8E8EE] px-4 py-2.5 text-[14px] font-sans text-[#1A2C38] bg-white focus:outline-none focus:border-[#7BAFC8]"
            />
            <button
              onClick={handleNotify}
              className="bg-[#1E3F52] text-white rounded-[8px] px-5 py-2.5 text-[13px] font-sans whitespace-nowrap"
              style={{ fontWeight: 600 }}
            >
              Notify me
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
