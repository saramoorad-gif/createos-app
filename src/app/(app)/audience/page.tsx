"use client";

import { useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/contexts/auth-context";
import { useSupabaseQuery } from "@/lib/hooks";
import { UpgradeGate } from "@/components/global/upgrade-gate";
import { TableSkeleton } from "@/components/global/skeleton";
import { formatCurrency } from "@/lib/utils";
import { Users, TrendingUp, Target, Video, Image as ImageIcon, Film } from "lucide-react";

interface Deal {
  id: string;
  brand_name: string;
  stage: string;
  value: number;
  platform: string | null;
}

export default function AudiencePage() {
  return (
    <UpgradeGate feature="audience">
      <AudienceContent />
    </UpgradeGate>
  );
}

function AudienceContent() {
  const { profile, loading: profileLoading } = useAuth();
  const { data: deals, loading: dealsLoading } = useSupabaseQuery<Deal>("deals");

  const loading = profileLoading || dealsLoading;

  const platforms = useMemo(() => {
    const p = profile as any;
    return [
      {
        name: "TikTok",
        icon: Video,
        handle: p?.tiktok_handle || null,
        followers: p?.tiktok_followers || 0,
        color: "#000000",
      },
      {
        name: "Instagram",
        icon: ImageIcon,
        handle: p?.instagram_handle || null,
        followers: p?.instagram_followers || 0,
        color: "#E4405F",
      },
      {
        name: "YouTube",
        icon: Film,
        handle: p?.youtube_handle || null,
        followers: p?.youtube_followers || 0,
        color: "#FF0000",
      },
    ].filter((pl) => pl.followers > 0 || pl.handle);
  }, [profile]);

  const totalReach = platforms.reduce((s, p) => s + (p.followers || 0), 0);
  const engagementRate = Number((profile as any)?.engagement_rate) || 0;

  // Revenue by platform — gives a rough picture of which platform monetizes best
  const revenueByPlatform = useMemo(() => {
    const map = new Map<string, { count: number; value: number }>();
    deals
      .filter((d) => ["delivered", "paid"].includes(d.stage))
      .forEach((d) => {
        const key = (d.platform || "other").toLowerCase();
        const existing = map.get(key);
        if (existing) {
          existing.count += 1;
          existing.value += d.value || 0;
        } else {
          map.set(key, { count: 1, value: d.value || 0 });
        }
      });
    return Array.from(map.entries()).sort((a, b) => b[1].value - a[1].value);
  }, [deals]);

  // CPM = cost per 1000 followers per deal. Shows how each platform
  // monetizes relative to audience size.
  function cpmFor(platform: string): number | null {
    const key = platform.toLowerCase();
    const platformData = platforms.find((p) => p.name.toLowerCase() === key);
    const revenueData = revenueByPlatform.find(([k]) => k === key);
    if (!platformData || !platformData.followers || !revenueData) return null;
    const [, r] = revenueData;
    if (r.count === 0) return null;
    return Math.round((r.value / r.count / platformData.followers) * 1000);
  }

  if (loading) return <TableSkeleton rows={3} cols={4} />;

  const hasAnyData = platforms.length > 0 || deals.length > 0;

  if (!hasAnyData) {
    return (
      <div>
        <PageHeader
          headline={
            <>
              Audience <em className="italic text-[#7BAFC8]">analytics</em>
            </>
          }
          subheading="Understand your reach and how each platform monetizes for you."
        />
        <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-12 text-center">
          <Users className="h-8 w-8 text-[#7BAFC8] mx-auto mb-3" />
          <p className="text-[16px] font-serif italic text-[#8AAABB]">
            Connect your social handles to see audience analytics
          </p>
          <p className="text-[13px] font-sans text-[#8AAABB] mt-2 mb-4">
            Add your follower counts and engagement rate in Settings to unlock reach and CPM insights.
          </p>
          <Link
            href="/settings"
            className="inline-block text-[13px] font-sans font-medium text-[#7BAFC8] hover:underline"
          >
            Go to Settings →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        headline={
          <>
            Audience <em className="italic text-[#7BAFC8]">analytics</em>
          </>
        }
        subheading="Your combined reach, engagement, and how each platform monetizes."
        stats={[
          { value: formatFollowers(totalReach), label: "Total reach" },
          { value: engagementRate > 0 ? `${engagementRate}%` : "—", label: "Engagement" },
          { value: String(platforms.length), label: "Platforms" },
          { value: String(deals.filter((d) => ["delivered", "paid"].includes(d.stage)).length), label: "Completed campaigns" },
        ]}
      />

      {platforms.length > 0 && (
        <div className="mb-8">
          <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-3" style={{ fontWeight: 600 }}>
            REACH BY PLATFORM
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {platforms.map((p) => {
              const cpm = cpmFor(p.name);
              const reachPct = totalReach > 0 ? (p.followers / totalReach) * 100 : 0;
              return (
                <div key={p.name} className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <p.icon className="h-4 w-4" style={{ color: p.color }} />
                    <span className="text-[14px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>
                      {p.name}
                    </span>
                  </div>
                  <p className="text-[24px] font-serif text-[#1A2C38]">{formatFollowers(p.followers)}</p>
                  <p className="text-[11px] font-sans text-[#8AAABB]">
                    {p.handle || "no handle set"}
                  </p>
                  <div className="mt-3 pt-3 border-t border-[#EEE8E0] space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-sans">
                      <span className="text-[#8AAABB]">Share of reach</span>
                      <span className="text-[#4A6070]" style={{ fontWeight: 500 }}>
                        {reachPct.toFixed(0)}%
                      </span>
                    </div>
                    {cpm !== null && (
                      <div className="flex items-center justify-between text-[11px] font-sans">
                        <span className="text-[#8AAABB]">Avg CPM</span>
                        <span className="text-[#4A6070]" style={{ fontWeight: 500 }}>
                          {formatCurrency(cpm)} / 1k
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {revenueByPlatform.length > 0 && (
        <div className="mb-8">
          <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-3" style={{ fontWeight: 600 }}>
            REVENUE BY PLATFORM (COMPLETED CAMPAIGNS)
          </p>
          <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] overflow-hidden">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-5 py-3 bg-[#F0EAE0] text-[10px] font-sans uppercase tracking-[2px] text-[#8AAABB] border-b border-[#D8E8EE]" style={{ fontWeight: 600 }}>
              <span>Platform</span>
              <span>Campaigns</span>
              <span>Total revenue</span>
              <span>Avg deal value</span>
            </div>
            {revenueByPlatform.map(([platform, data]) => (
              <div
                key={platform}
                className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-[#EEE8E0] last:border-b-0 items-center"
              >
                <span className="text-[13px] font-sans text-[#1A2C38] capitalize" style={{ fontWeight: 500 }}>
                  {platform}
                </span>
                <span className="text-[13px] font-sans text-[#4A6070]">{data.count}</span>
                <span className="text-[13px] font-sans text-[#1A2C38]">
                  {formatCurrency(data.value)}
                </span>
                <span className="text-[13px] font-sans text-[#4A6070]">
                  {formatCurrency(data.count > 0 ? Math.round(data.value / data.count) : 0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-[#7BAFC8]" />
            <p className="text-[12px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>
              What CPM tells you
            </p>
          </div>
          <p className="text-[12px] font-sans text-[#4A6070] leading-relaxed">
            CPM (cost per thousand followers per deal) shows how each platform monetizes. A higher CPM means brands pay more relative to your audience size — often a sign your engagement is strong there.
          </p>
        </div>
        <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-[#7BAFC8]" />
            <p className="text-[12px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>
              Keep stats updated
            </p>
          </div>
          <p className="text-[12px] font-sans text-[#4A6070] leading-relaxed">
            These numbers come from what you entered in Settings. Refresh them monthly so your rate calculator and media kit stay accurate.{" "}
            <Link href="/settings" className="text-[#7BAFC8] hover:underline">
              Update now →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return String(n);
}
