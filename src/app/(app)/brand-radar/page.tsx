"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { brandRadarData, brandRadarCategories, type BrandRadar } from "@/lib/placeholder-data";
import { formatCurrency } from "@/lib/utils";
import { Star, Clock, Sparkles, X, Loader2 } from "lucide-react";

const paySpeedStyles = {
  fast: { label: "Fast", color: "text-[#3D7A58]" },
  average: { label: "Avg", color: "text-[#A07830]" },
  slow: { label: "Slow", color: "text-[#A03D3D]" },
};

function PitchModal({ brand, onClose }: { brand: BrandRadar; onClose: () => void }) {
  const [ready, setReady] = useState(false);
  useState(() => { setTimeout(() => setReady(true), 1500) as unknown as void; });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative bg-white rounded-[10px] border border-[#D8E8EE] w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
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
          <div className="bg-[#FAF8F4] rounded-[10px] p-4">
            <p className="text-[13px] font-sans text-[#1A2C38] leading-relaxed whitespace-pre-wrap">
{`Hi ${brand.brand_name} team,

I'm Brianna Cole — a lifestyle and wellness creator with 142K followers across TikTok, Instagram, and YouTube. My engagement rate sits at 6.4%, and my audience is primarily 18-34 women interested in skincare, morning routines, and authentic product recommendations.

I'd love to discuss a ${brand.category.toLowerCase()} collaboration. My UGC rates start at ${formatCurrency(brand.ugc_rate_low)} and influencer partnerships from ${formatCurrency(brand.influencer_rate_low)}.

Looking forward to connecting!
Brianna`}
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

  const filtered = category === "All" ? brandRadarData : brandRadarData.filter(b => b.category === category);

  return (
    <div>
      <PageHeader
        headline={<>Brand <em className="italic text-[#7BAFC8]">radar</em></>}
        subheading="AI-matched brands based on your niche, engagement, and content style."
        stats={[
          { value: String(brandRadarData.length), label: "Brands tracked" },
          { value: String(brandRadarData.filter(b => b.fit === "great").length), label: "Great fits" },
        ]}
      />

      {/* Category filters */}
      <div className="flex items-center gap-1 mb-6 flex-wrap">
        {brandRadarCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 text-[10px] font-sans font-500 uppercase tracking-[1.5px] rounded-full transition-colors ${
              category === cat ? "bg-[#1A2C38] text-[#FAF8F4]" : "text-[#8AAABB] hover:text-[#1A2C38] hover:bg-[#F2F8FB]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Brand grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.slice(0, 12).map((brand) => (
          <div key={brand.id} className="bg-white border border-[#D8E8EE] rounded-[10px] p-5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-[15px] font-sans font-600 text-[#1A2C38]">{brand.brand_name}</p>
                <p className="text-[11px] font-sans text-[#8AAABB] mt-0.5">{brand.category}</p>
              </div>
              <span className={`text-[10px] font-sans font-500 uppercase tracking-[1.5px] px-2 py-0.5 rounded-full ${
                brand.fit === "great" ? "bg-[#E8F4EE] text-[#3D7A58]" : "bg-[#F4EEE0] text-[#A07830]"
              }`}>
                {brand.fit === "great" ? "Great fit" : "Good fit"}
              </span>
            </div>

            <p className="text-[12px] font-sans text-[#8AAABB] leading-relaxed mb-4 line-clamp-2">{brand.description}</p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-[#FAF8F4] rounded-lg p-2.5">
                <p className="text-[10px] font-sans uppercase tracking-[1.5px] text-[#8AAABB] mb-0.5">UGC</p>
                <p className="text-[12px] font-sans font-500 text-[#1A2C38]">{formatCurrency(brand.ugc_rate_low)}–{formatCurrency(brand.ugc_rate_high)}</p>
              </div>
              <div className="bg-[#FAF8F4] rounded-lg p-2.5">
                <p className="text-[10px] font-sans uppercase tracking-[1.5px] text-[#8AAABB] mb-0.5">Influencer</p>
                <p className="text-[12px] font-sans font-500 text-[#1A2C38]">{formatCurrency(brand.influencer_rate_low)}–{formatCurrency(brand.influencer_rate_high)}</p>
              </div>
              <div className="bg-[#FAF8F4] rounded-lg p-2.5 flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-[#8AAABB]" />
                <span className={`text-[12px] font-sans font-500 ${paySpeedStyles[brand.pay_speed].color}`}>{paySpeedStyles[brand.pay_speed].label} ({brand.pay_speed_days}d)</span>
              </div>
              <div className="bg-[#FAF8F4] rounded-lg p-2.5 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3 w-3 ${i < brand.creator_ease ? "text-[#A07830] fill-[#A07830]" : "text-[#D8E8EE]"}`} />
                ))}
              </div>
            </div>

            <button
              onClick={() => setPitchBrand(brand)}
              className="w-full flex items-center justify-center gap-1.5 border border-[#D8E8EE] rounded-[10px] px-3 py-2 text-[12px] font-sans font-500 text-[#7BAFC8] hover:bg-[#F2F8FB] hover:border-[#7BAFC8]/30 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" /> Generate personalized pitch
            </button>
          </div>
        ))}
      </div>

      {filtered.length > 12 && (
        <p className="text-[13px] font-sans font-500 text-[#7BAFC8] hover:underline mt-4 cursor-pointer">View all {filtered.length} brands →</p>
      )}

      {pitchBrand && <PitchModal brand={pitchBrand} onClose={() => setPitchBrand(null)} />}
    </div>
  );
}
