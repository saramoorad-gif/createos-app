"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { Calculator, Copy, Check, TrendingUp, Info } from "lucide-react";

type Platform = "tiktok" | "instagram" | "youtube";
type ContentType = "ugc_video" | "reel" | "static" | "story";
type UsageRights = "none" | "paid_ads" | "extended";
type ExclusivityDays = 0 | 30 | 60 | 90;

const contentTypeLabels: Record<ContentType, string> = {
  ugc_video: "UGC Video",
  reel: "Reel / Short",
  static: "Static Post",
  story: "Story",
};

const platformLabels: Record<Platform, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
};

// ─── Rate Formula ────────────────────────────────────────────────

function calculateRate(
  platform: Platform,
  contentType: ContentType,
  followers: number,
  engagementRate: number,
  usageRights: UsageRights,
  exclusivityDays: ExclusivityDays
) {
  // Base rate per 1K followers by content type
  const baseRatePer1K: Record<ContentType, number> = {
    ugc_video: 8,
    reel: 12,
    static: 5,
    story: 3,
  };

  // Platform multiplier
  const platformMult: Record<Platform, number> = {
    tiktok: 1.0,
    instagram: 1.15,
    youtube: 1.6,
  };

  // Engagement multiplier (industry avg ~3%)
  const engMult = engagementRate > 5 ? 1.4 : engagementRate > 3 ? 1.15 : engagementRate > 1.5 ? 1.0 : 0.8;

  // Usage rights multiplier
  const usageMult = usageRights === "extended" ? 1.5 : usageRights === "paid_ads" ? 1.25 : 1.0;

  // Exclusivity premium
  const exclMult = exclusivityDays === 90 ? 1.35 : exclusivityDays === 60 ? 1.2 : exclusivityDays === 30 ? 1.1 : 1.0;

  const followersInK = followers / 1000;
  const base = baseRatePer1K[contentType] * followersInK * platformMult[platform];
  const adjusted = base * engMult * usageMult * exclMult;

  // Market range (±30%)
  const marketLow = Math.round(adjusted * 0.7);
  const marketHigh = Math.round(adjusted * 1.3);
  const yourRate = Math.round(adjusted);

  return {
    yourRate,
    marketLow,
    marketHigh,
    breakdown: {
      base: Math.round(base),
      engagementEffect: Math.round(base * (engMult - 1)),
      usageEffect: Math.round(base * engMult * (usageMult - 1)),
      exclusivityEffect: Math.round(base * engMult * usageMult * (exclMult - 1)),
    },
  };
}

function RateBar({ low, high, yours }: { low: number; high: number; yours: number }) {
  const range = high - low;
  const position = range > 0 ? ((yours - low) / range) * 100 : 50;
  const clampedPos = Math.max(5, Math.min(95, position));

  return (
    <div className="relative pt-5 pb-2">
      <div className="h-3 rounded-full bg-gradient-to-r from-amber-100 via-amber-200 to-amber-300 relative">
        <div
          className="absolute -top-5 transform -translate-x-1/2"
          style={{ left: `${clampedPos}%` }}
        >
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-terra-600 bg-terra-50 rounded-full px-2 py-0.5 border border-terra-200">
              You
            </span>
            <div className="w-0.5 h-2 bg-terra-500" />
          </div>
        </div>
        <div
          className="absolute top-0 bottom-0 w-3 h-3 rounded-full bg-terra-500 border-2 border-white shadow transform -translate-x-1/2"
          style={{ left: `${clampedPos}%` }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-muted-foreground">{formatCurrency(low)}</span>
        <span className="text-xs text-muted-foreground">{formatCurrency(high)}</span>
      </div>
    </div>
  );
}

export function RateCalculator() {
  const [platform, setPlatform] = useState<Platform>("tiktok");
  const [contentType, setContentType] = useState<ContentType>("ugc_video");
  const [followers, setFollowers] = useState(142000);
  const [engagementRate, setEngagementRate] = useState(6.4);
  const [usageRights, setUsageRights] = useState<UsageRights>("none");
  const [exclusivity, setExclusivity] = useState<ExclusivityDays>(0);
  const [calculated, setCalculated] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = calculateRate(
    platform, contentType, followers, engagementRate, usageRights, exclusivity
  );

  // Full rate card across all content types
  const rateCard = (["ugc_video", "reel", "static", "story"] as ContentType[]).map((ct) => {
    const r = calculateRate(platform, ct, followers, engagementRate, usageRights, exclusivity);
    return { type: ct, label: contentTypeLabels[ct], rate: r.yourRate };
  });

  const selectClass =
    "w-full rounded-lg border border-border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500";
  const inputClass =
    "w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Left — Calculator */}
      <div className="space-y-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4 text-terra-500" />
              Calculate Your Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium block mb-1.5">Platform</label>
                <select
                  className={selectClass}
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as Platform)}
                >
                  {Object.entries(platformLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Content Type</label>
                <select
                  className={selectClass}
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as ContentType)}
                >
                  {Object.entries(contentTypeLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium block mb-1.5">Follower Count</label>
                <input
                  type="number"
                  className={inputClass}
                  value={followers}
                  onChange={(e) => setFollowers(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Engagement Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  className={inputClass}
                  value={engagementRate}
                  onChange={(e) => setEngagementRate(Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Usage Rights</label>
              <select
                className={selectClass}
                value={usageRights}
                onChange={(e) => setUsageRights(e.target.value as UsageRights)}
              >
                <option value="none">None — organic only</option>
                <option value="paid_ads">Paid ads (+25%)</option>
                <option value="extended">Extended / whitelisting (+50%)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium block mb-1.5">Exclusivity</label>
                <select
                  className={selectClass}
                  value={exclusivity}
                  onChange={(e) => setExclusivity(Number(e.target.value) as ExclusivityDays)}
                >
                  <option value={0}>None</option>
                  <option value={30}>30 days (+10%)</option>
                  <option value={60}>60 days (+20%)</option>
                  <option value={90}>90 days (+35%)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Category</label>
                <input type="text" placeholder="e.g., Beauty" className={inputClass} />
              </div>
            </div>

            <Button
              className="w-full gap-2"
              onClick={() => setCalculated(true)}
            >
              <Calculator className="h-4 w-4" />
              Calculate Rate
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {calculated && (
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Your Rate</p>
                <p className="text-3xl font-serif font-bold text-terra-600">
                  {formatCurrency(result.yourRate)}
                </p>
              </div>

              <RateBar low={result.marketLow} high={result.marketHigh} yours={result.yourRate} />

              <Separator />

              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  Rate Breakdown
                </h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Base rate</span>
                    <span className="font-medium">{formatCurrency(result.breakdown.base)}</span>
                  </div>
                  {result.breakdown.engagementEffect !== 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Engagement bonus</span>
                      <span className="font-medium text-emerald-600">
                        +{formatCurrency(result.breakdown.engagementEffect)}
                      </span>
                    </div>
                  )}
                  {result.breakdown.usageEffect !== 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Usage rights premium</span>
                      <span className="font-medium text-amber-600">
                        +{formatCurrency(result.breakdown.usageEffect)}
                      </span>
                    </div>
                  )}
                  {result.breakdown.exclusivityEffect !== 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Exclusivity premium</span>
                      <span className="font-medium text-purple-600">
                        +{formatCurrency(result.breakdown.exclusivityEffect)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right — Rate Card */}
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-terra-500" />
              Your Rate Card
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? (
                <><Check className="h-3.5 w-3.5" /> Copied</>
              ) : (
                <><Copy className="h-3.5 w-3.5" /> Copy rate card</>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            {/* Header */}
            <div className="bg-terra-50 px-4 py-3 border-b border-border">
              <p className="text-sm font-serif font-semibold text-terra-700">
                Brianna Cole — {platformLabels[platform]}
              </p>
              <p className="text-xs text-terra-600/70">
                {(followers / 1000).toFixed(0)}K followers · {engagementRate}% engagement
              </p>
            </div>

            {/* Rate Rows */}
            <div className="divide-y divide-border">
              {rateCard.map((item) => (
                <div key={item.type} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-foreground">{item.label}</span>
                  <span className="text-sm font-serif font-bold text-terra-600">
                    {formatCurrency(item.rate)}
                  </span>
                </div>
              ))}
            </div>

            {/* Footnotes */}
            <div className="bg-warm-100 px-4 py-2.5 text-xs text-muted-foreground space-y-0.5">
              {usageRights !== "none" && (
                <p>* Includes {usageRights === "paid_ads" ? "paid ads" : "extended/whitelisting"} rights</p>
              )}
              {exclusivity > 0 && <p>* Includes {exclusivity}-day exclusivity</p>}
              <p>Rates subject to campaign scope and deliverables.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
