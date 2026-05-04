"use client";

import { useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { useSupabaseQuery } from "@/lib/hooks";
import { UpgradeGate } from "@/components/global/upgrade-gate";
import { TableSkeleton } from "@/components/global/skeleton";
import { formatDate, formatCurrency } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, TrendingUp, Zap } from "lucide-react";

interface Deal {
  id: string;
  brand_name: string;
  stage: string;
  value: number;
  due_date: string | null;
  created_at: string;
}

// A brand is "high tolerance" if the creator has done many deals with them
// in a short window — their audience may be fatigued on that brand.
const HIGH_TOLERANCE_THRESHOLD = 3; // 3+ deals in 90 days = fatigue risk
const WINDOW_DAYS = 90;

export default function SponsorTolerancePage() {
  return (
    <UpgradeGate feature="sponsor-tolerance">
      <SponsorToleranceContent />
    </UpgradeGate>
  );
}

function SponsorToleranceContent() {
  const { data: deals, loading } = useSupabaseQuery<Deal>("deals", {
    order: { column: "created_at", ascending: false },
  });

  const now = new Date();
  const windowStart = new Date(now.getTime() - WINDOW_DAYS * 86400000);

  // Group all deals (pitched through paid — anything that represents a
  // real or intended partnership) by brand, then compute recent count.
  const brandStats = useMemo(() => {
    const completedStages = new Set(["contracted", "in_progress", "delivered", "paid"]);
    const byBrand = new Map<
      string,
      {
        name: string;
        totalDeals: number;
        recentDeals: number;
        totalValue: number;
        lastDealDate: Date | null;
        stages: string[];
      }
    >();

    deals.forEach((d) => {
      if (!d.brand_name) return;
      const name = d.brand_name.trim();
      if (!name) return;

      const dealDate = new Date(d.due_date || d.created_at);
      const existing = byBrand.get(name);

      if (existing) {
        existing.totalDeals += 1;
        if (completedStages.has(d.stage) && dealDate >= windowStart) {
          existing.recentDeals += 1;
        }
        existing.totalValue += d.value || 0;
        if (!existing.lastDealDate || dealDate > existing.lastDealDate) {
          existing.lastDealDate = dealDate;
        }
        existing.stages.push(d.stage);
      } else {
        byBrand.set(name, {
          name,
          totalDeals: 1,
          recentDeals: completedStages.has(d.stage) && dealDate >= windowStart ? 1 : 0,
          totalValue: d.value || 0,
          lastDealDate: dealDate,
          stages: [d.stage],
        });
      }
    });

    return Array.from(byBrand.values())
      .map((b) => {
        let fatigueLevel: "low" | "moderate" | "high";
        if (b.recentDeals >= HIGH_TOLERANCE_THRESHOLD) fatigueLevel = "high";
        else if (b.recentDeals === 2) fatigueLevel = "moderate";
        else fatigueLevel = "low";
        return { ...b, fatigueLevel };
      })
      .sort((a, b) => b.recentDeals - a.recentDeals || b.totalDeals - a.totalDeals);
  }, [deals, windowStart]);

  const highFatigue = brandStats.filter((b) => b.fatigueLevel === "high");
  const moderateFatigue = brandStats.filter((b) => b.fatigueLevel === "moderate");
  const healthy = brandStats.filter((b) => b.fatigueLevel === "low" && b.totalDeals > 0);

  if (loading) return <TableSkeleton rows={5} cols={4} />;

  return (
    <div>
      <PageHeader
        headline={
          <>
            Sponsor <em className="italic text-[#7BAFC8]">tolerance</em>
          </>
        }
        subheading={`How often you're working with each brand — audience fatigue tracker (last ${WINDOW_DAYS} days).`}
        stats={[
          { value: String(brandStats.length), label: "Brands in pipeline" },
          { value: String(highFatigue.length), label: "High fatigue" },
          { value: String(healthy.length), label: "Fresh relationships" },
        ]}
      />

      {highFatigue.length > 0 && (
        <div className="mb-6 bg-[#F4EAEA] border-[1.5px] border-[#A03D3D]/20 rounded-[10px] p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-[#A03D3D] flex-shrink-0" />
          <div className="flex-1">
            <p className="text-[13px] font-sans text-[#A03D3D]" style={{ fontWeight: 600 }}>
              {highFatigue.length} brand{highFatigue.length === 1 ? "" : "s"} your audience may be tired of
            </p>
            <p className="text-[12px] font-sans text-[#A03D3D]/80">
              You&apos;ve done {HIGH_TOLERANCE_THRESHOLD}+ deals with each in the last {WINDOW_DAYS} days. Consider rotating to new brands or spacing content further apart.
            </p>
          </div>
        </div>
      )}

      {brandStats.length === 0 ? (
        <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-12 text-center">
          <Zap className="h-8 w-8 text-[#7BAFC8] mx-auto mb-3" />
          <p className="text-[16px] font-serif italic text-[#8AAABB]">
            No deals yet — tolerance tracking kicks in after your first brand partnership
          </p>
          <Link
            href="/deals"
            className="inline-block mt-4 text-[13px] font-sans font-medium text-[#7BAFC8] hover:underline"
          >
            Add your first deal →
          </Link>
        </div>
      ) : (
        <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_140px] gap-4 px-5 py-3 bg-[#F0EAE0] text-[10px] font-sans uppercase tracking-[2px] text-[#8AAABB] border-b border-[#D8E8EE]" style={{ fontWeight: 600 }}>
            <span>Brand</span>
            <span>Total deals</span>
            <span>Last {WINDOW_DAYS} days</span>
            <span>Total value</span>
            <span>Fatigue level</span>
          </div>
          {brandStats.map((b) => (
            <div
              key={b.name}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_140px] gap-4 px-5 py-3.5 border-b border-[#EEE8E0] last:border-b-0 items-center"
            >
              <div>
                <p className="text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>
                  {b.name}
                </p>
                {b.lastDealDate && (
                  <p className="text-[11px] font-sans text-[#8AAABB]">
                    Last: {formatDate(b.lastDealDate.toISOString())}
                  </p>
                )}
              </div>
              <span className="text-[13px] font-sans text-[#4A6070]">{b.totalDeals}</span>
              <span
                className={`text-[13px] font-sans ${
                  b.recentDeals >= HIGH_TOLERANCE_THRESHOLD
                    ? "text-[#A03D3D]"
                    : b.recentDeals === 2
                      ? "text-[#A07830]"
                      : "text-[#4A6070]"
                }`}
                style={{ fontWeight: b.recentDeals >= 2 ? 600 : 400 }}
              >
                {b.recentDeals}
              </span>
              <span className="text-[13px] font-sans text-[#1A2C38]">
                {formatCurrency(b.totalValue)}
              </span>
              <FatigueBadge level={b.fatigueLevel} />
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-[#3D7A58]" />
            <p className="text-[12px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>
              Low fatigue
            </p>
          </div>
          <p className="text-[11px] font-sans text-[#8AAABB] leading-relaxed">
            0–1 deals in the last {WINDOW_DAYS} days. Safe to pitch again or renew.
          </p>
        </div>
        <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-[#A07830]" />
            <p className="text-[12px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>
              Moderate fatigue
            </p>
          </div>
          <p className="text-[11px] font-sans text-[#8AAABB] leading-relaxed">
            2 deals in the last {WINDOW_DAYS} days. Space posts at least 3–4 weeks apart.
          </p>
        </div>
        <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-[#A03D3D]" />
            <p className="text-[12px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>
              High fatigue
            </p>
          </div>
          <p className="text-[11px] font-sans text-[#8AAABB] leading-relaxed">
            {HIGH_TOLERANCE_THRESHOLD}+ deals in the last {WINDOW_DAYS} days. Pause new deals for this brand and pitch a competitor instead.
          </p>
        </div>
      </div>
    </div>
  );
}

function FatigueBadge({ level }: { level: "low" | "moderate" | "high" }) {
  const styles = {
    low: "bg-[#E8F4EE] text-[#3D7A58] border-[#B8DEC4]",
    moderate: "bg-[#F4EEE0] text-[#A07830] border-[#E8D5B8]",
    high: "bg-[#F4EAEA] text-[#A03D3D] border-[#E8C4C4]",
  };
  const labels = { low: "Low", moderate: "Moderate", high: "High" };
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-sans text-center ${styles[level]}`}
      style={{ fontWeight: 500 }}
    >
      {labels[level]}
    </span>
  );
}
