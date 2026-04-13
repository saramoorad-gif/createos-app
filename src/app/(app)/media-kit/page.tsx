"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { mediaKitData, platformStats, currentUser } from "@/lib/placeholder-data";
import { Copy, Check, ExternalLink } from "lucide-react";

export default function MediaKitPage() {
  const [bio, setBio] = useState(mediaKitData.bio);
  const [copied, setCopied] = useState(false);

  const inputClass = "w-full rounded-[10px] border border-[#E5E0D8] px-3 py-2.5 text-[13px] font-sans focus:outline-none focus:border-[#C4714A] bg-white";

  return (
    <div>
      <PageHeader
        headline={<>Your media <em className="italic text-[#C4714A]">kit</em></>}
        subheading="Edit and share your public-facing creator profile."
      />

      {/* Share bar */}
      <div className="bg-white border border-[#E5E0D8] rounded-[10px] p-4 flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <ExternalLink className="h-4 w-4 text-[#9A9088]" />
          <code className="text-[12px] font-mono text-[#9A9088]">createos.co/kit/briannacole</code>
        </div>
        <button
          onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="flex items-center gap-1.5 text-[12px] font-sans font-500 text-[#C4714A] hover:underline"
        >
          {copied ? <><Check className="h-3.5 w-3.5" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy link</>}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Editor */}
        <div className="space-y-5">
          <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#9A9088]">EDITOR</p>

          <div>
            <label className="text-[12px] font-sans font-500 text-[#1C1714] block mb-1.5">Bio</label>
            <textarea className={`${inputClass} resize-none`} rows={3} value={bio} onChange={e => setBio(e.target.value)} />
          </div>

          <div>
            <label className="text-[12px] font-sans font-500 text-[#1C1714] block mb-1.5">Niche Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {mediaKitData.niche_tags.map(tag => (
                <span key={tag} className="text-[11px] font-sans px-2.5 py-1 rounded-full bg-[#F2EEE8] text-[#9A9088]">{tag}</span>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[12px] font-sans font-500 text-[#1C1714] block mb-1.5">Brands Worked With</label>
            <div className="flex flex-wrap gap-1.5">
              {mediaKitData.brands_worked_with.map(b => (
                <span key={b} className="text-[11px] font-sans px-2.5 py-1 rounded-full bg-[#F2EEE8] text-[#1C1714]">{b}</span>
              ))}
            </div>
          </div>

          <button className="w-full bg-[#C4714A] text-white rounded-[10px] px-4 py-2.5 text-[13px] font-sans font-500 hover:bg-[#B05C38] transition-colors">
            Save changes
          </button>
        </div>

        {/* Live Preview */}
        <div>
          <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#9A9088] mb-4">PREVIEW</p>
          <div className="bg-white border border-[#E5E0D8] rounded-[10px] overflow-hidden">
            <div className="bg-[#F7F4EF] px-6 py-8 text-center border-b border-[#E5E0D8]">
              <div className="h-16 w-16 rounded-full bg-[#F2EEE8] mx-auto mb-3 flex items-center justify-center text-[18px] font-serif text-[#9A9088]">BC</div>
              <h3 className="text-[20px] font-serif text-[#1C1714]">{currentUser.full_name}</h3>
              <p className="text-[13px] font-sans text-[#9A9088] mt-1 max-w-sm mx-auto">{bio}</p>
              <div className="flex justify-center gap-2 mt-3">
                {mediaKitData.niche_tags.map(t => (
                  <span key={t} className="text-[10px] font-sans px-2 py-0.5 rounded-full border border-[#E5E0D8] text-[#9A9088]">{t}</span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-[#E5E0D8] border-b border-[#E5E0D8]">
              {Object.entries(platformStats).map(([p, s]) => (
                <div key={p} className="py-4 text-center">
                  <p className="text-[10px] font-sans uppercase tracking-[1.5px] text-[#9A9088] capitalize">{p}</p>
                  <p className="text-[18px] font-serif text-[#1C1714] mt-0.5">{(s.followers / 1000).toFixed(0)}K</p>
                  <p className="text-[11px] font-sans text-[#4A9060]">{s.engagementRate}%</p>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-b border-[#E5E0D8]">
              <p className="text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#9A9088] mb-2">Rates</p>
              {Object.entries(mediaKitData.rate_ranges).map(([type, range]) => (
                <div key={type} className="flex justify-between py-1">
                  <span className="text-[12px] font-sans text-[#9A9088] capitalize">{type.replace(/_/g, " ")}</span>
                  <span className="text-[12px] font-sans font-500 text-[#C4714A]">{range}</span>
                </div>
              ))}
            </div>

            <div className="px-6 py-5 text-center">
              <button className="bg-[#C4714A] text-white rounded-[10px] px-6 py-2.5 text-[13px] font-sans font-500">Work with me</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
