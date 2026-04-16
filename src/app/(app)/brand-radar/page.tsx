"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/contexts/auth-context";
import { useSupabaseQuery } from "@/lib/hooks";
import { useToast } from "@/components/global/toast";
import { UpgradeGate } from "@/components/global/upgrade-gate";
import { Shimmer } from "@/components/global/skeleton";
import { Star, Sparkles, RefreshCw, Copy, Check } from "lucide-react";

interface BrandMatch {
  brand: string;
  category: string;
  match_score: number;
  why: string;
  pitch_angle: string;
}

interface Deal {
  id: string;
  brand_name: string;
  stage: string;
}

export default function BrandRadarPage() {
  return (
    <UpgradeGate feature="brand-radar">
      <BrandRadarContent />
    </UpgradeGate>
  );
}

function BrandRadarContent() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { data: deals } = useSupabaseQuery<Deal>("deals");

  const [matches, setMatches] = useState<BrandMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [copiedBrand, setCopiedBrand] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const p = profile as any;

  // Completeness check: we need at least a niche + some follower count to
  // generate useful matches. Otherwise prompt the user to fill in settings.
  const profileComplete = useMemo(() => {
    if (!p) return false;
    const hasFollowers =
      (p.tiktok_followers || 0) > 0 || (p.instagram_followers || 0) > 0 || (p.youtube_followers || 0) > 0;
    return Boolean(p.primary_niche) && hasFollowers;
  }, [p]);

  const recentBrands = deals
    .filter((d) => ["contracted", "in_progress", "delivered", "paid"].includes(d.stage))
    .map((d) => d.brand_name)
    .filter(Boolean)
    .slice(0, 10)
    .join(", ");

  async function findMatches() {
    setLoading(true);
    setHasRun(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "brand_match",
          context: {
            niche: p?.primary_niche || "",
            content_style: p?.content_style || "",
            tiktok_followers: String(p?.tiktok_followers || 0),
            tiktok_handle: p?.tiktok_handle || "",
            instagram_followers: String(p?.instagram_followers || 0),
            instagram_handle: p?.instagram_handle || "",
            youtube_followers: String(p?.youtube_followers || 0),
            youtube_handle: p?.youtube_handle || "",
            engagement_rate: String(p?.engagement_rate || ""),
            recent_brands: recentBrands || "none",
          },
        }),
      });
      const data = await res.json();
      const raw = data.result || "";
      // Claude usually returns JSON, but sometimes wraps it in ```json fences.
      // Strip fences and parse defensively.
      const cleaned = raw.replace(/^```(?:json)?\s*/m, "").replace(/```\s*$/m, "").trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed.matches)) {
        setMatches(parsed.matches);
        toast("success", `Found ${parsed.matches.length} brand matches`);
      } else {
        throw new Error("Malformed response");
      }
    } catch (e) {
      console.error("Failed to get brand matches:", e);
      toast("error", "Couldn't generate matches. Try again.");
    }
    setLoading(false);
  }

  function copyPitch(match: BrandMatch) {
    const pitch = `Hi ${match.brand} team,

I'm ${profile?.full_name || "a creator"} and I create ${p?.primary_niche || "lifestyle"} content across ${
      p?.tiktok_handle ? "TikTok" : ""
    }${p?.instagram_handle ? (p?.tiktok_handle ? ", Instagram" : "Instagram") : ""}${
      p?.youtube_handle ? " and YouTube" : ""
    }.

${match.pitch_angle}

I'd love to explore a partnership. Happy to share rates and recent work — let me know what would be most useful.

Best,
${profile?.full_name || ""}`;
    navigator.clipboard.writeText(pitch);
    setCopiedBrand(match.brand);
    setTimeout(() => setCopiedBrand(null), 2000);
    toast("success", "Pitch copied to clipboard");
  }

  const categories = useMemo(() => {
    const set = new Set(matches.map((m) => m.category));
    return Array.from(set).sort();
  }, [matches]);

  const filtered = useMemo(() => {
    if (categoryFilter === "all") return matches;
    return matches.filter((m) => m.category === categoryFilter);
  }, [matches, categoryFilter]);

  return (
    <div>
      <PageHeader
        headline={
          <>
            Brand <em className="italic text-[#7BAFC8]">Radar</em>
          </>
        }
        subheading="AI-matched brands you should pitch, based on your niche, reach, and recent deals."
        stats={[
          { value: String(matches.length), label: "Matches" },
          { value: String(categories.length), label: "Categories" },
          { value: p?.primary_niche || "—", label: "Your niche" },
        ]}
      />

      {!profileComplete ? (
        <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-12 text-center">
          <Star className="h-8 w-8 text-[#7BAFC8] mx-auto mb-3" />
          <p className="text-[16px] font-serif italic text-[#8AAABB] mb-2">
            Fill in your profile to get matched with brands
          </p>
          <p className="text-[13px] font-sans text-[#8AAABB] mb-5 max-w-md mx-auto">
            Brand Radar needs your niche and at least one platform&apos;s follower count to generate relevant matches.
          </p>
          <Link
            href="/settings"
            className="inline-block bg-[#1E3F52] text-white rounded-[8px] px-6 py-2.5 text-[13px] font-sans hover:bg-[#2a5269] transition-colors"
            style={{ fontWeight: 600 }}
          >
            Complete your profile
          </Link>
        </div>
      ) : matches.length === 0 && !loading ? (
        <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-12 text-center">
          <Sparkles className="h-8 w-8 text-[#7BAFC8] mx-auto mb-3" />
          <p className="text-[16px] font-serif italic text-[#8AAABB] mb-2">
            Ready to find brand matches
          </p>
          <p className="text-[13px] font-sans text-[#8AAABB] mb-5 max-w-md mx-auto">
            We&apos;ll use your {p?.primary_niche} niche and recent deal history to suggest 10 brands you should reach out to.
          </p>
          <button
            onClick={findMatches}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-[#1E3F52] text-white rounded-[8px] px-6 py-2.5 text-[13px] font-sans hover:bg-[#2a5269] transition-colors disabled:opacity-50"
            style={{ fontWeight: 600 }}
          >
            <Sparkles className="h-4 w-4" />
            Find my brand matches
          </button>
        </div>
      ) : (
        <>
          {/* Filter + refresh bar */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="flex gap-1.5 flex-wrap">
              <FilterPill active={categoryFilter === "all"} onClick={() => setCategoryFilter("all")}>
                All
              </FilterPill>
              {categories.map((c) => (
                <FilterPill key={c} active={categoryFilter === c} onClick={() => setCategoryFilter(c)}>
                  {c}
                </FilterPill>
              ))}
            </div>
            <button
              onClick={findMatches}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-[12px] font-sans text-[#7BAFC8] hover:text-[#6AA0BB] disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Finding matches..." : "Refresh"}
            </button>
          </div>

          {loading && matches.length === 0 ? (
            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5">
                  <Shimmer className="h-5 w-40 mb-2" />
                  <Shimmer className="h-3 w-full mb-2" />
                  <Shimmer className="h-3 w-3/4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered
                .sort((a, b) => b.match_score - a.match_score)
                .map((m) => (
                  <div
                    key={m.brand}
                    className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5 hover:border-[#7BAFC8] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-[16px] font-serif text-[#1A2C38]">{m.brand}</h3>
                          <span
                            className="text-[10px] font-sans uppercase tracking-[1.5px] px-2 py-0.5 rounded-full bg-[#F2F8FB] text-[#3D6E8A]"
                            style={{ fontWeight: 600 }}
                          >
                            {m.category}
                          </span>
                        </div>
                        <p className="text-[13px] font-sans text-[#4A6070] leading-relaxed mb-2">{m.why}</p>
                        <p className="text-[12px] font-sans text-[#8AAABB] italic">
                          <Sparkles className="h-3 w-3 inline mr-1 text-[#7BAFC8]" />
                          {m.pitch_angle}
                        </p>
                      </div>
                      <MatchScore score={m.match_score} />
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-[#EEE8E0]">
                      <button
                        onClick={() => copyPitch(m)}
                        className="inline-flex items-center gap-1.5 text-[12px] font-sans text-[#7BAFC8] hover:text-[#6AA0BB]"
                        style={{ fontWeight: 500 }}
                      >
                        {copiedBrand === m.brand ? (
                          <>
                            <Check className="h-3.5 w-3.5" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" /> Copy pitch
                          </>
                        )}
                      </button>
                      <span className="text-[11px] font-sans text-[#8AAABB]">Score: {m.match_score}/100</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FilterPill({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
        active ? "bg-[#1E3F52] text-white" : "bg-[#F2F8FB] text-[#4A6070] hover:bg-[#E4EFF4]"
      }`}
    >
      {children}
    </button>
  );
}

function MatchScore({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-emerald-100 text-emerald-700" : score >= 65 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600";
  return (
    <div className={`flex-shrink-0 h-10 w-10 rounded-full ${color} flex items-center justify-center text-[13px] font-serif`}>
      {score}
    </div>
  );
}
