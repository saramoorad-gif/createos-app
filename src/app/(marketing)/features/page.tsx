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
  // AI Features (NEW section)
  { name: "AI Deal Scanner (Gmail)", description: "Connects to your Gmail inbox and uses Claude AI to detect brand partnership opportunities automatically. Review and add to pipeline with one click — no more digging through emails.", audience: "creator", tier: "UGC Creator", section: "AI Features", isNew: true } as any,
  { name: "AI Contract Review", description: "Paste or upload any contract and get instant Claude AI analysis: payment terms, usage rights, exclusivity, red flags, missing clauses, and specific negotiation tips.", audience: "both", tier: "UGC Creator", section: "AI Features", isNew: true } as any,
  { name: "AI Daily Insights", description: "Personalized daily business insights on your dashboard. Claude analyzes your pipeline, overdue items, and earnings to tell you what to focus on today.", audience: "creator", tier: "UGC Creator", section: "AI Features", isNew: true } as any,
  { name: "AI Rate Suggestions", description: "Tell the AI your platform stats and niche, and get specific rate recommendations for UGC videos, Instagram reels, TikToks, and YouTube videos with reasoning.", audience: "creator", tier: "UGC Creator", section: "AI Features" } as any,

  // Deal Management
  { name: "Deal Pipeline", description: "Track every brand deal from first DM to final payment. Click any deal to edit brand, value, deliverables, stage, exclusivity, and more.", audience: "both", tier: "Free (3 deals) / Paid (unlimited)", section: "Deal Management" },
  { name: "Task Management", description: "Track deliverables, deadlines, and follow-ups with priorities, categories, due dates, and overdue alerts. Built specifically for creator workflows.", audience: "creator", tier: "UGC Creator", section: "Deal Management", isNew: true } as any,
  { name: "Content Calendar", description: "Plan sponsored vs organic content, track sponsor tolerance across the month, and avoid audience fatigue with visual calendar view.", audience: "creator", tier: "UGC Creator", section: "Deal Management" },
  { name: "Campaign Builder", description: "Create multi-creator campaigns with shared deliverable boards and brand-facing timelines. Assign creators, set deadlines, and track completion in real time.", audience: "agency", tier: "Agency Starter", section: "Deal Management" },
  { name: "Deliverable Tracking", description: "Break each deal into deliverables with due dates, revision counts, and approval status. Never miss a deadline or lose track of what you owe a brand.", audience: "both", tier: "UGC Creator", section: "Deal Management" },
  { name: "Gmail Inbox Integration", description: "Real Gmail emails alongside your internal agency messages in one unified inbox with refresh, search, and email details.", audience: "creator", tier: "UGC Creator", section: "Deal Management", isNew: true } as any,

  // Financial
  { name: "Invoicing", description: "Create, send, and track professional invoices with automatic payment reminders. Supports custom branding, multiple currencies, and partial payments.", audience: "both", tier: "Free (basic) / Paid (full)", section: "Financial" },
  { name: "Rate Calculator", description: "Get market-benchmarked rate recommendations based on your niche, follower count, engagement rate, and deliverable type. Stop undercharging for your work.", audience: "creator", tier: "UGC Creator", section: "Financial" },
  { name: "Revenue Forecasting", description: "See projected monthly and annual income based on your pipeline. Track whether you're on pace to hit your goals.", audience: "creator", tier: "UGC + Influencer", section: "Financial" },
  { name: "Tax Export", description: "One-click export of all income and expenses for tax season. 1099-ready CSV and PDF reports.", audience: "creator", tier: "UGC + Influencer", section: "Financial" },
  { name: "Commission Tracking", description: "Auto-calculated commissions per deal with payout tracking, monthly exports, and creator-facing transparency reports. Supports tiered commission structures.", audience: "agency", tier: "Agency Starter", section: "Financial" },

  // Contracts & Legal
  { name: "Contract Templates (5 Pro)", description: "Pre-built templates for UGC Content Agreement, Influencer Partnership, Usage Rights Extension, Ambassador Retainer, and Talent Representation. Live preview editor with variable filling.", audience: "both", tier: "UGC Creator", section: "Contracts & Legal", isNew: true } as any,
  { name: "E-Signature", description: "Send contracts for electronic signature directly from Create Suite. Track signature status, send reminders, and store fully executed copies automatically.", audience: "agency", tier: "Agency Starter", section: "Contracts & Legal" },
  { name: "Exclusivity Conflict Detection", description: "Track active exclusivity clauses with progress bars and days remaining. Get real-time conflict warnings before signing new deals in competing categories.", audience: "creator", tier: "UGC Creator", section: "Contracts & Legal", isNew: true } as any,

  // Brand & Growth
  { name: "Creator Referral Program", description: "Share your unique affiliate link with followers. Anyone who signs up gets their first month of UGC + Influencer for just $27 instead of $39. Track signups and conversions.", audience: "creator", tier: "UGC Creator", section: "Brand & Growth", isNew: true } as any,
  { name: "Brand Radar", description: "Discover brands actively hiring creators in your niche right now. Filter by category, budget range, and content type to find your next opportunity.", audience: "creator", tier: "UGC + Influencer", section: "Brand & Growth" },
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
  "AI Features",
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
                      className="bg-white border border-[#D8E8EE] rounded-[10px] p-5 flex flex-col relative"
                    >
                      {(f as any).isNew && (
                        <span className="absolute top-3 right-3 text-[9px] font-sans uppercase tracking-[1px] px-1.5 py-0.5 rounded-full bg-[#3D7A58] text-white" style={{ fontWeight: 600 }}>NEW</span>
                      )}
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
              href="/signup"
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
