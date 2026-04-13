"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  brandRadarData,
  brandRadarCategories,
  type BrandRadar,
} from "@/lib/placeholder-data";
import { formatCurrency } from "@/lib/utils";
import {
  Sparkles,
  Star,
  Clock,
  ThumbsUp,
  X,
  Loader2,
} from "lucide-react";

const paySpeedConfig = {
  fast: { label: "Fast", color: "text-emerald-600", bg: "bg-emerald-50" },
  average: { label: "Average", color: "text-amber-600", bg: "bg-amber-50" },
  slow: { label: "Slow", color: "text-red-600", bg: "bg-red-50" },
};

function PitchModal({ brand, onClose }: { brand: BrandRadar; onClose: () => void }) {
  const [generating, setGenerating] = useState(true);
  const [pitch, setPitch] = useState("");

  // Simulate AI pitch generation
  useEffect(() => {
    const timer = setTimeout(() => {
      setPitch(
        `Hi ${brand.brand_name} team,\n\nI'm Brianna Cole — a lifestyle and wellness creator with 142K followers across TikTok, Instagram, and YouTube. My audience is primarily 18-34 women interested in skincare, morning routines, and authentic product recommendations.\n\nI'd love to collaborate on a ${brand.category.toLowerCase()} campaign. My engagement rate sits at 6.4%, and my content style focuses on authentic, day-in-the-life formats that resonate deeply with my community.\n\nA few ideas:\n• A "Get Ready With Me" featuring your products\n• A morning routine integration on TikTok\n• An honest review/first impressions Reel\n\nMy UGC rates start at ${formatCurrency(brand.ugc_rate_low)} and influencer partnerships from ${formatCurrency(brand.influencer_rate_low)}. I'm flexible on deliverables and happy to discuss a package that works for your campaign goals.\n\nLooking forward to connecting!\n\nBrianna`
      );
      setGenerating(false);
    }, 1500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg border border-border p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h2 className="text-lg font-serif font-semibold">
              Pitch for {brand.brand_name}
            </h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {generating ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-terra-500 animate-spin mb-3" />
            <p className="text-sm text-muted-foreground">Generating personalized pitch...</p>
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-border bg-warm-50 p-4 mb-4">
              <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                {pitch}
              </pre>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 gap-1.5">
                Copy pitch
              </Button>
              <Button variant="outline" className="gap-1.5">
                Edit
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function BrandCard({ brand }: { brand: BrandRadar }) {
  const [showPitch, setShowPitch] = useState(false);
  const payConfig = paySpeedConfig[brand.pay_speed];

  return (
    <>
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-base font-serif font-semibold">{brand.brand_name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{brand.category}</p>
            </div>
            <Badge
              variant={brand.fit === "great" ? "success" : "warning"}
              className="text-xs"
            >
              {brand.fit === "great" ? "Great fit" : "Good fit"}
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            {brand.description}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-lg bg-warm-100 p-2.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">UGC Rate</p>
              <p className="text-sm font-semibold">
                {formatCurrency(brand.ugc_rate_low)} – {formatCurrency(brand.ugc_rate_high)}
              </p>
            </div>
            <div className="rounded-lg bg-warm-100 p-2.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Influencer Rate</p>
              <p className="text-sm font-semibold">
                {formatCurrency(brand.influencer_rate_low)} – {formatCurrency(brand.influencer_rate_high)}
              </p>
            </div>
            <div className="rounded-lg bg-warm-100 p-2.5">
              <div className="flex items-center gap-1 mb-0.5">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Pay Speed</p>
              </div>
              <p className={`text-sm font-semibold ${payConfig.color}`}>
                {payConfig.label} ({brand.pay_speed_days}d)
              </p>
            </div>
            <div className="rounded-lg bg-warm-100 p-2.5">
              <div className="flex items-center gap-1 mb-0.5">
                <ThumbsUp className="h-3 w-3 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Creator Ease</p>
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < brand.creator_ease
                        ? "text-amber-400 fill-amber-400"
                        : "text-muted-foreground/20"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            className="w-full gap-1.5 border border-border hover:bg-terra-50 hover:text-terra-700 hover:border-terra-200"
            onClick={() => setShowPitch(true)}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Generate personalized pitch
          </Button>
        </CardContent>
      </Card>

      {showPitch && (
        <PitchModal brand={brand} onClose={() => setShowPitch(false)} />
      )}
    </>
  );
}

export function BrandRadarGrid() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? brandRadarData
      : brandRadarData.filter((b) => b.category === activeCategory);

  return (
    <div className="space-y-5">
      {/* AI Insight */}
      <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50/70 px-4 py-3">
        <Sparkles className="h-4 w-4 text-amber-600 flex-shrink-0" />
        <p className="text-sm text-amber-900">
          <span className="font-semibold">AI Recommendation:</span>{" "}
          Based on your skincare and lifestyle niche with 6.4% engagement, Supergoop!, Glossier, and Athletic Greens are your top brand matches this month.
        </p>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {brandRadarCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "bg-terra-500 text-white"
                : "bg-white border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Brand Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((brand) => (
          <BrandCard key={brand.id} brand={brand} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">No brands found in this category.</p>
        </div>
      )}
    </div>
  );
}
