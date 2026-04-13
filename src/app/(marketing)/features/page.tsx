"use client";

import { useState } from "react";
import Link from "next/link";

type Tab = "all" | "creator" | "agency";
type Audience = "creator" | "agency" | "both";

interface Feature {
  name: string;
  description: string;
  audience: Audience;
  tier: string;
  section: string;
}

const features: Feature[] = [
  // Deal Management
  { name: "Deal Pipeline", description: "Track every brand deal from first DM to final payment. Kanban board with stages for outreach, negotiation, contracted, in-progress, and paid.", audience: "both", tier: "Free (3 deals) / Paid (unlimited)", section: "Deal Management" },
  { name: "Campaign Builder", description: "Create multi-creator campaigns with shared deliverable boards and brand-facing timelines. Assign creators, set deadlines, and track completion in real time.", audience: "agency", tier: "Agency Starter", section: "Deal Management" },
  { name: "Deliverable Tracking", description: "Break each deal into deliverables with due dates, revision counts, and approval status. Never miss a deadline or lose track of what you owe a brand.", audience: "both", tier: "UGC Creator", section: "Deal Management" },

  // Financial
  { name: "Invoicing", description: "Create, send, and track professional invoices with automatic payment reminders. Supports custom branding, multiple currencies, and partial payments.", audience: "both", tier: "Free (basic) / Paid (full)", section: "Financial" },
  { name: "Rate Calculator", description: "Get market-benchmarked rate recommendations based on your niche, follower count, engagement rate, and deliverable type. Stop undercharging for your work.", audience: "creator", tier: "UGC Creator", section: "Financial" },
  { name: "Commission Tracking", description: "Auto-calculated commissions per deal with payout tracking, monthly exports, and creator-facing transparency reports. Supports tiered commission structures.", audience: "agency", tier: "Agency Starter", section: "Financial" },

  // Contracts & Legal
  { name: "AI Contract Analysis", description: "Upload any brand contract and get instant analysis of red flags, unfair terms, and missing clauses. Receive AI-generated counter-language suggestions.", audience: "both", tier: "UGC Creator", section: "Contracts & Legal" },
  { name: "Contract Templates", description: "Start from pre-built, lawyer-reviewed contract templates for common deal types. Customize terms, add clauses, and save your own templates for reuse.", audience: "agency", tier: "Agency Starter", section: "Contracts & Legal" },
  { name: "E-Signature", description: "Send contracts for electronic signature directly from Create Suite. Track signature status, send reminders, and store fully executed copies automatically.", audience: "agency", tier: "Agency Starter", section: "Contracts & Legal" },
  { name: "Exclusivity Tracking", description: "Manage exclusivity windows across all your deals. Get real-time alerts when a new deal could conflict with an existing exclusivity clause.", audience: "both", tier: "UGC + Influencer", section: "Contracts & Legal" },

  // Brand & Growth
  { name: "Brand Radar", description: "Discover brands actively hiring creators in your niche right now. Filter by category, budget range, and content type to find your next opportunity.", audience: "creator", tier: "UGC Creator", section: "Brand & Growth" },
  { name: "Media Kit Builder", description: "Auto-generated media kit with live audience stats, past brand collaborations, and a shareable public link. Updates automatically as your numbers grow.", audience: "creator", tier: "UGC Creator", section: "Brand & Growth" },
  { name: "Campaign Recaps", description: "Generate professional post-campaign reports with performance metrics, screenshots, and ROI analysis. Share branded PDFs with brands or your team.", audience: "both", tier: "UGC + Influencer", section: "Brand & Growth" },
  { name: "Creator Health Score", description: "A single score combining deal velocity, payment reliability, audience growth, and engagement trends. Identify areas for improvement at a glance.", audience: "both", tier: "UGC Creator", section: "Brand & Growth" },

  // Agency Tools
  { name: "Roster Dashboard", description: "See every creator on your roster with their health score, active deals, total earnings, and upcoming deliverables. Filter, sort, and drill into any creator.", audience: "agency", tier: "Agency Starter", section: "Agency Tools" },
  { name: "Conflict Detection", description: "Real-time exclusivity scanning catches conflicts before they happen. Get alerts when assigning a creator to a brand that competes with an existing deal.", audience: "agency", tier: "Agency Starter", section: "Agency Tools" },
  { name: "Internal Messaging", description: "Replace Slack for creator communication. Threaded messaging with task assignment, brand communication logs, and file sharing built in.", audience: "agency", tier: "Agency Starter", section: "Agency Tools" },
  { name: "Brand Reports", description: "Generate white-labeled reports for brand partners showing campaign performance, creator metrics, and ROI. Schedule automated monthly sends.", audience: "agency", tier: "Agency Starter", section: "Agency Tools" },
  { name: "Team Permissions", description: "Control who on your team can view, edit, or manage specific creators, deals, and financial data. Role-based access keeps sensitive information secure.", audience: "agency", tier: "Agency Growth", section: "Agency Tools" },
];

const sections = [
  "Deal Management",
  "Financial",
  "Contracts & Legal",
  "Brand & Growth",
  "Agency Tools",
];

function audienceLabel(audience: Audience) {
  if (audience === "creator") return "Creator";
  if (audience === "agency") return "Agency";
  return "Creator + Agency";
}

function audienceColor(audience: Audience) {
  if (audience === "creator") return "bg-[#F2F8FB] text-[#3D6E8A]";
  if (audience === "agency") return "bg-[#F0EAE0] text-[#4A6070]";
  return "bg-[#F2F8FB] text-[#3D6E8A]";
}

export default function FeaturesPage() {
  const [tab, setTab] = useState<Tab>("all");

  const filtered = features.filter((f) => {
    if (tab === "all") return true;
    if (tab === "creator") return f.audience === "creator" || f.audience === "both";
    return f.audience === "agency" || f.audience === "both";
  });

  const visibleSections = sections.filter((s) =>
    filtered.some((f) => f.section === s)
  );

  return (
    <div>
      {/* Hero */}
      <section className="pt-20 pb-12 px-6">
        <div className="max-w-[900px] mx-auto text-center">
          <p className="text-[12px] font-sans font-600 uppercase tracking-[3px] text-[#7BAFC8] mb-3">
            FEATURES
          </p>
          <h1 className="text-[48px] md:text-[56px] font-serif font-normal leading-[1.1] text-[#1A2C38] mb-4">
            Everything you need to{" "}
            <em className="italic text-[#3D6E8A]">grow</em>
          </h1>
          <p className="text-[17px] font-sans text-[#4A6070] max-w-[560px] mx-auto leading-relaxed">
            From deal tracking to AI contract analysis, every tool a creator or
            agency needs — in one platform.
          </p>
        </div>
      </section>

      {/* Tab bar */}
      <div className="sticky top-16 z-30 bg-[#FAF8F4]/95 backdrop-blur-sm border-b border-[#D8E8EE]">
        <div className="max-w-[900px] mx-auto flex items-center justify-center gap-1 px-6 py-3">
          {([
            { key: "all" as Tab, label: "All Features" },
            { key: "creator" as Tab, label: "For Creators" },
            { key: "agency" as Tab, label: "For Agencies" },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-[10px] text-[14px] font-sans font-500 transition-colors ${
                tab === t.key
                  ? "bg-[#1E3F52] text-white"
                  : "text-[#4A6070] hover:bg-[#F2F8FB]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feature sections */}
      <section className="py-16 px-6">
        <div className="max-w-[1000px] mx-auto space-y-16">
          {visibleSections.map((section) => {
            const sectionFeatures = filtered.filter(
              (f) => f.section === section
            );
            if (sectionFeatures.length === 0) return null;

            return (
              <div key={section}>
                <p className="text-[12px] font-sans font-600 uppercase tracking-[3px] text-[#7BAFC8] mb-6">
                  {section}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sectionFeatures.map((f) => (
                    <div
                      key={f.name}
                      className="bg-white border border-[#D8E8EE] rounded-[10px] p-5 flex flex-col"
                    >
                      {/* Icon dot + name */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-8 w-8 rounded-lg bg-[#F2F8FB] flex items-center justify-center flex-shrink-0">
                          <div className="h-3 w-3 rounded-full bg-[#7BAFC8]" />
                        </div>
                        <h3 className="text-[15px] font-sans font-600 text-[#1A2C38]">
                          {f.name}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="text-[13px] font-sans text-[#4A6070] leading-relaxed flex-1 mb-4">
                        {f.description}
                      </p>

                      {/* Tags */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span
                          className={`text-[11px] font-sans font-500 px-2.5 py-1 rounded-full ${audienceColor(
                            f.audience
                          )}`}
                        >
                          {audienceLabel(f.audience)}
                        </span>
                        <span className="text-[11px] font-sans text-[#8AAABB]">
                          Included in {f.tier}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-[#F2F8FB]">
        <div className="max-w-[600px] mx-auto text-center">
          <h2 className="text-[36px] font-serif text-[#1A2C38] mb-3">
            Ready to get <em className="italic text-[#3D6E8A]">started</em>?
          </h2>
          <p className="text-[15px] font-sans text-[#4A6070] mb-8">
            Start free and upgrade when you need more. No credit card required.
          </p>
          <div className="flex items-center justify-center gap-3">
            <a
              href="https://app.createsuite.co/signup"
              className="bg-[#1E3F52] text-white text-[15px] font-sans font-500 px-7 py-3.5 rounded-[10px] hover:bg-[#2a5269] transition-colors"
            >
              Get started free
            </a>
            <Link
              href="/pricing"
              className="border border-[#D8E8EE] text-[#3D6E8A] text-[15px] font-sans font-500 px-7 py-3.5 rounded-[10px] hover:bg-white transition-colors"
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
