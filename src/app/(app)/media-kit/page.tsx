"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useSupabaseQuery } from "@/lib/hooks";
import { Copy, Check, ExternalLink } from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  niche_tags: string[];
  brands_worked_with: string[];
  rate_ranges: Record<string, string>;
  platforms: { platform: string; handle: string; followers: number; engagement_rate?: number }[];
}

export default function MediaKitPage() {
  const { data: profiles, loading } = useSupabaseQuery<Profile>("profiles", { limit: 1 });
  const [copied, setCopied] = useState(false);

  if (loading) return <div className="pt-20 text-center"><p className="text-[14px] font-sans text-[#8AAABB]">Loading...</p></div>;

  const profile = profiles[0];

  if (!profile) {
    return (
      <div>
        <PageHeader
          headline={<>Your media <em className="italic text-[#7BAFC8]">kit</em></>}
          subheading="Edit and share your public-facing creator profile."
        />
        <div className="text-center py-16">
          <p className="text-[20px] font-serif italic text-[#8AAABB]">Set up your media kit to start attracting brand deals.</p>
          <button className="mt-4 text-[13px] font-sans font-500 text-[#7BAFC8] hover:underline">Set up media kit →</button>
        </div>
      </div>
    );
  }

  const bio = profile.bio || "";
  const nicheTags = profile.niche_tags || [];
  const brandsWorkedWith = profile.brands_worked_with || [];
  const rateRanges = profile.rate_ranges || {};
  const platforms = profile.platforms || [];

  const inputClass = "w-full rounded-[10px] border border-[#D8E8EE] px-3 py-2.5 text-[13px] font-sans focus:outline-none focus:border-[#7BAFC8] bg-white";

  return (
    <div>
      <PageHeader
        headline={<>Your media <em className="italic text-[#7BAFC8]">kit</em></>}
        subheading="Edit and share your public-facing creator profile."
      />

      {/* Share bar */}
      <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-4 flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <ExternalLink className="h-4 w-4 text-[#8AAABB]" />
          <code className="text-[12px] font-mono text-[#8AAABB]">createos.co/kit/{profile.full_name?.toLowerCase().replace(/\s+/g, "")}</code>
        </div>
        <button
          onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="flex items-center gap-1.5 text-[12px] font-sans font-500 text-[#7BAFC8] hover:underline"
        >
          {copied ? <><Check className="h-3.5 w-3.5" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy link</>}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Editor */}
        <div className="space-y-5">
          <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#8AAABB]">EDITOR</p>

          <div>
            <label className="text-[12px] font-sans font-500 text-[#1A2C38] block mb-1.5">Bio</label>
            <textarea className={`${inputClass} resize-none`} rows={3} defaultValue={bio} />
          </div>

          <div>
            <label className="text-[12px] font-sans font-500 text-[#1A2C38] block mb-1.5">Niche Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {nicheTags.map(tag => (
                <span key={tag} className="text-[11px] font-sans px-2.5 py-1 rounded-full bg-[#F2F8FB] text-[#8AAABB]">{tag}</span>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[12px] font-sans font-500 text-[#1A2C38] block mb-1.5">Brands Worked With</label>
            <div className="flex flex-wrap gap-1.5">
              {brandsWorkedWith.map(b => (
                <span key={b} className="text-[11px] font-sans px-2.5 py-1 rounded-full bg-[#F2F8FB] text-[#1A2C38]">{b}</span>
              ))}
            </div>
          </div>

          <button className="w-full bg-[#7BAFC8] text-white rounded-[10px] px-4 py-2.5 text-[13px] font-sans font-500 hover:bg-[#6AA0BB] transition-colors">
            Save changes
          </button>
        </div>

        {/* Live Preview */}
        <div>
          <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#8AAABB] mb-4">PREVIEW</p>
          <div className="bg-white border border-[#D8E8EE] rounded-[10px] overflow-hidden">
            <div className="bg-[#FAF8F4] px-6 py-8 text-center border-b border-[#D8E8EE]">
              <div className="h-16 w-16 rounded-full bg-[#F2F8FB] mx-auto mb-3 flex items-center justify-center text-[18px] font-serif text-[#8AAABB]">
                {profile.full_name?.split(" ").map(n => n[0]).join("") || "?"}
              </div>
              <h3 className="text-[20px] font-serif text-[#1A2C38]">{profile.full_name}</h3>
              <p className="text-[13px] font-sans text-[#8AAABB] mt-1 max-w-sm mx-auto">{bio}</p>
              <div className="flex justify-center gap-2 mt-3">
                {nicheTags.map(t => (
                  <span key={t} className="text-[10px] font-sans px-2 py-0.5 rounded-full border border-[#D8E8EE] text-[#8AAABB]">{t}</span>
                ))}
              </div>
            </div>

            {platforms.length > 0 && (
              <div className={`grid grid-cols-${Math.min(platforms.length, 3)} divide-x divide-[#D8E8EE] border-b border-[#D8E8EE]`}>
                {platforms.map((p) => (
                  <div key={p.platform} className="py-4 text-center">
                    <p className="text-[10px] font-sans uppercase tracking-[1.5px] text-[#8AAABB] capitalize">{p.platform}</p>
                    <p className="text-[18px] font-serif text-[#1A2C38] mt-0.5">{(p.followers / 1000).toFixed(0)}K</p>
                    {p.engagement_rate && <p className="text-[11px] font-sans text-[#3D7A58]">{p.engagement_rate}%</p>}
                  </div>
                ))}
              </div>
            )}

            {Object.keys(rateRanges).length > 0 && (
              <div className="px-6 py-4 border-b border-[#D8E8EE]">
                <p className="text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#8AAABB] mb-2">Rates</p>
                {Object.entries(rateRanges).map(([type, range]) => (
                  <div key={type} className="flex justify-between py-1">
                    <span className="text-[12px] font-sans text-[#8AAABB] capitalize">{type.replace(/_/g, " ")}</span>
                    <span className="text-[12px] font-sans font-500 text-[#7BAFC8]">{range}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="px-6 py-5 text-center">
              <button className="bg-[#7BAFC8] text-white rounded-[10px] px-6 py-2.5 text-[13px] font-sans font-500">Work with me</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
