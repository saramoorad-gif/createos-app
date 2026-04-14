"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useSupabaseQuery } from "@/lib/hooks";
import { formatCurrency } from "@/lib/utils";
import { CardGridSkeleton } from "@/components/global/skeleton";
import { Star, Clock, Sparkles, X, Loader2, Plus } from "lucide-react";

interface BrandRadar {
  id: string;
  brand_name: string;
  category: string;
  fit: "great" | "good";
  ugc_rate_low: number;
  ugc_rate_high: number;
  influencer_rate_low: number;
  influencer_rate_high: number;
  pay_speed: "fast" | "average" | "slow";
  pay_speed_days: number;
  creator_ease: number;
  description: string;
}

const categories = ["All", "Skincare", "Beauty", "Fashion", "Food", "Wellness", "Lifestyle"];

const paySpeedStyles: Record<string, { label: string; color: string }> = {
  fast: { label: "Fast", color: "text-[#3D7A58]" },
  average: { label: "Avg", color: "text-[#A07830]" },
  slow: { label: "Slow", color: "text-[#A03D3D]" },
};

function PitchModal({ brand, onClose }: { brand: BrandRadar; onClose: () => void }) {
  const [ready, setReady] = useState(false);

  useState(() => {
    const t = setTimeout(() => setReady(true), 1500);
    return () => clearTimeout(t);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(26,44,56,.4)", backdropFilter: "blur(4px)" }}>
      <div className="relative bg-white rounded-panel border-[1.5px] border-[#D8E8EE] w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-serif text-[#1A2C38]">Pitch for <em className="italic text-[#7BAFC8]">{brand.brand_name}</em></h2>
          <button onClick={onClose} className="text-[#8AAABB] hover:text-[#1A2C38]"><X className="h-5 w-5" /></button>
        </div>
        {!ready ? (
          <div className="flex flex-col items-center py-12">
            <Loader2 className="h-6 w-6 text-[#7BAFC8] animate-spin mb-3" />
            <p className="text-[13px] font-sans text-[#8AAABB]">Generating personalized pitch...</p>
          </div>
        ) : (
          <div className="bg-[#FAF8F4] rounded-card p-4">
            <p className="text-[13px] font-sans text-[#1A2C38] leading-relaxed whitespace-pre-wrap">
{`Hi ${brand.brand_name} team,

I'd love to discuss a ${brand.category.toLowerCase()} collaboration. My UGC rates start at ${formatCurrency(brand.ugc_rate_low)} and influencer partnerships from ${formatCurrency(brand.influencer_rate_low)}.

Looking forward to connecting!`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BrandsPage() {
  const [category, setCategory] = useState("All");
  const [pitchBrand, setPitchBrand] = useState<BrandRadar | null>(null);

  const { data: brands, loading } = useSupabaseQuery<BrandRadar>("brand_radar", {
    order: { column: "brand_name", ascending: true },
  });

  const filtered = category === "All" ? brands : brands.filter(b => b.category === category);

  if (loading) {
    return <CardGridSkeleton count={6} />;
  }

  return (
    <div>
      <PageHeader
        headline={<>Brand <em className="italic text-[#7BAFC8]">radar</em></>}
        subheading="Discover brands hiring creators in your niche."
        stats={brands.length > 0 ? [
          { value: String(brands.length), label: "Brands tracked" },
          { value: String(brands.filter(b => b.fit === "great").length), label: "Great fits" },
        ] : undefined}
      />

      {/* Empty state */}
      {brands.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[22px] font-serif italic text-[#8AAABB] mb-3">No brands available yet</p>
          <p className="text-[14px] font-sans text-[#4A6070] mb-6 max-w-md mx-auto">
            Brand Radar data is populated as brands join the platform. Check back soon for AI-matched brand opportunities.
          </p>
        </div>
      ) : (
        <>
          {/* Category filters */}
          <div className="flex items-center gap-1 mb-6 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 text-[10px] font-sans uppercase tracking-[1.5px] rounded-full transition-colors ${
                  category === cat ? "bg-[#1E3F52] text-white" : "text-[#8AAABB] hover:text-[#1A2C38] hover:bg-[#F2F8FB]"
                }`}
                style={{ fontWeight: 500 }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Brand grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(brand => (
              <div key={brand.id} className="bg-white border-[1.5px] border-[#D8E8EE] rounded-card p-5 hover:border-[#7BAFC8] hover:shadow-card transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-[15px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>{brand.brand_name}</p>
                    <p className="text-[11px] font-sans text-[#8AAABB] mt-0.5">{brand.category}</p>
                  </div>
                  <span className={`text-[9px] font-sans uppercase tracking-[4px] px-2 py-0.5 rounded ${
                    brand.fit === "great" ? "bg-[#E8F4EE] text-[#3D7A58]" : "bg-[#F4EEE0] text-[#A07830]"
                  }`} style={{ fontWeight: 700 }}>
                    {brand.fit === "great" ? "Great fit" : "Good fit"}
                  </span>
                </div>

                <p className="text-[12px] font-sans text-[#4A6070] leading-relaxed mb-4 line-clamp-2">{brand.description}</p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-[#FAF8F4] rounded-lg p-2.5">
                    <p className="text-[10px] font-sans uppercase tracking-[1.5px] text-[#8AAABB] mb-0.5">UGC</p>
                    <p className="text-[12px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>{formatCurrency(brand.ugc_rate_low)}–{formatCurrency(brand.ugc_rate_high)}</p>
                  </div>
                  <div className="bg-[#FAF8F4] rounded-lg p-2.5">
                    <p className="text-[10px] font-sans uppercase tracking-[1.5px] text-[#8AAABB] mb-0.5">Influencer</p>
                    <p className="text-[12px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>{formatCurrency(brand.influencer_rate_low)}–{formatCurrency(brand.influencer_rate_high)}</p>
                  </div>
                  <div className="bg-[#FAF8F4] rounded-lg p-2.5 flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-[#8AAABB]" />
                    <span className={`text-[12px] font-sans ${paySpeedStyles[brand.pay_speed]?.color || "text-[#8AAABB]"}`} style={{ fontWeight: 500 }}>
                      {paySpeedStyles[brand.pay_speed]?.label || brand.pay_speed} ({brand.pay_speed_days}d)
                    </span>
                  </div>
                  <div className="bg-[#FAF8F4] rounded-lg p-2.5 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < brand.creator_ease ? "text-[#A07830] fill-[#A07830]" : "text-[#D8E8EE]"}`} />
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setPitchBrand(brand)}
                  className="w-full flex items-center justify-center gap-1.5 border-[1.5px] border-[#D8E8EE] rounded-btn px-3 py-2 text-[12px] font-sans text-[#7BAFC8] hover:bg-[#F2F8FB] hover:border-[#7BAFC8] transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  <Sparkles className="h-3.5 w-3.5" /> Generate personalized pitch
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {pitchBrand && <PitchModal brand={pitchBrand} onClose={() => setPitchBrand(null)} />}
    </div>
  );
}
