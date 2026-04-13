"use client";

import { useState } from "react";
import {
  mediaKitData,
  platformStats,
  currentUser,
  totalFollowers,
} from "@/lib/placeholder-data";
import { Send, CheckCircle2 } from "lucide-react";

function InquiryForm({ onSubmit }: { onSubmit: () => void }) {
  return (
    <div className="space-y-4">
      <h3 className="text-[20px] font-serif text-center text-[#1C1714]">
        Work with <em className="italic text-[#C4714A]">{currentUser.full_name.split(" ")[0]}</em>
      </h3>
      <p className="text-[13px] font-sans text-[#9A9088] text-center">
        Fill out this form and Brianna will respond within 24 hours.
      </p>
      {[
        { label: "Your Name", placeholder: "Jane Smith", type: "text" },
        { label: "Brand / Company", placeholder: "Your brand name", type: "text" },
        { label: "Email", placeholder: "you@brand.com", type: "email" },
      ].map((field) => (
        <div key={field.label}>
          <label className="text-[12px] font-sans font-500 text-[#1C1714] block mb-1.5">{field.label}</label>
          <input type={field.type} placeholder={field.placeholder} className="w-full rounded-[10px] border border-[#E5E0D8] px-3 py-2.5 text-[13px] font-sans focus:outline-none focus:border-[#C4714A]" />
        </div>
      ))}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[12px] font-sans font-500 text-[#1C1714] block mb-1.5">Budget</label>
          <select className="w-full rounded-[10px] border border-[#E5E0D8] px-3 py-2.5 text-[13px] font-sans bg-white focus:outline-none focus:border-[#C4714A]">
            <option>Under $1,000</option><option>$1,000 – $2,500</option><option>$2,500 – $5,000</option><option>$5,000+</option>
          </select>
        </div>
        <div>
          <label className="text-[12px] font-sans font-500 text-[#1C1714] block mb-1.5">Platform</label>
          <select className="w-full rounded-[10px] border border-[#E5E0D8] px-3 py-2.5 text-[13px] font-sans bg-white focus:outline-none focus:border-[#C4714A]">
            <option>TikTok</option><option>Instagram</option><option>YouTube</option><option>Multiple</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-[12px] font-sans font-500 text-[#1C1714] block mb-1.5">Message</label>
        <textarea rows={4} placeholder="Tell Brianna about your campaign..." className="w-full rounded-[10px] border border-[#E5E0D8] px-3 py-2.5 text-[13px] font-sans resize-none focus:outline-none focus:border-[#C4714A]" />
      </div>
      <button onClick={onSubmit} className="w-full flex items-center justify-center gap-2 bg-[#C4714A] text-white rounded-[10px] px-4 py-2.5 text-[13px] font-sans font-500 hover:bg-[#B05C38] transition-colors">
        <Send className="h-4 w-4" /> Send inquiry
      </button>
    </div>
  );
}

export default function PublicMediaKitPage() {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F4EF]">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="bg-white border border-[#E5E0D8] rounded-[10px] overflow-hidden">
          {/* Header */}
          <div className="bg-[#F7F4EF] px-8 py-10 text-center border-b border-[#E5E0D8]">
            <div className="h-20 w-20 rounded-full bg-[#F2EEE8] mx-auto mb-4 flex items-center justify-center text-[22px] font-serif text-[#9A9088]">BC</div>
            <h1 className="text-[28px] font-serif text-[#1C1714]">{currentUser.full_name}</h1>
            <p className="text-[13px] font-sans text-[#9A9088] mt-2 max-w-md mx-auto">{mediaKitData.bio}</p>
            <div className="flex justify-center gap-2 mt-4 flex-wrap">
              {mediaKitData.niche_tags.map((t) => (
                <span key={t} className="text-[10px] font-sans px-2.5 py-1 rounded-full border border-[#E5E0D8] text-[#9A9088]">{t}</span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 divide-x divide-[#E5E0D8] border-b border-[#E5E0D8]">
            {Object.entries(platformStats).map(([p, s]) => (
              <div key={p} className="py-5 text-center">
                <p className="text-[10px] font-sans uppercase tracking-[1.5px] text-[#9A9088] capitalize">{p}</p>
                <p className="text-[22px] font-serif text-[#1C1714] mt-1">{(s.followers / 1000).toFixed(0)}K</p>
                <p className="text-[11px] font-sans text-[#4A9060] mt-0.5">{s.engagementRate}% eng.</p>
              </div>
            ))}
          </div>

          {/* Rates */}
          <div className="px-8 py-5 border-b border-[#E5E0D8]">
            <p className="text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#9A9088] mb-3">Rate Ranges</p>
            {Object.entries(mediaKitData.rate_ranges).map(([type, range]) => (
              <div key={type} className="flex justify-between py-1.5">
                <span className="text-[12px] font-sans text-[#9A9088] capitalize">{type.replace(/_/g, " ")}</span>
                <span className="text-[12px] font-sans font-500 text-[#C4714A]">{range}</span>
              </div>
            ))}
          </div>

          {/* Brands */}
          <div className="px-8 py-5 border-b border-[#E5E0D8]">
            <p className="text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#9A9088] mb-3">Brands Worked With</p>
            <div className="flex flex-wrap gap-2">
              {mediaKitData.brands_worked_with.map((b) => (
                <span key={b} className="text-[11px] font-sans px-3 py-1.5 rounded-full bg-[#F2EEE8] text-[#1C1714]">{b}</span>
              ))}
            </div>
          </div>

          {/* CTA / Form */}
          <div className="px-8 py-8">
            {!showForm && !submitted && (
              <div className="text-center">
                <button onClick={() => setShowForm(true)} className="bg-[#C4714A] text-white rounded-[10px] px-8 py-3 text-[14px] font-sans font-500 hover:bg-[#B05C38] transition-colors">
                  Work with me
                </button>
              </div>
            )}
            {showForm && !submitted && <InquiryForm onSubmit={() => setSubmitted(true)} />}
            {submitted && (
              <div className="text-center py-4">
                <CheckCircle2 className="h-10 w-10 text-[#4A9060] mx-auto mb-3" />
                <h3 className="text-[20px] font-serif text-[#1C1714]">Inquiry sent!</h3>
                <p className="text-[13px] font-sans text-[#9A9088] mt-1">Brianna will respond within 24 hours.</p>
              </div>
            )}
          </div>
        </div>

        <p className="text-center mt-6 text-[11px] font-sans text-[#9A9088]">
          Powered by <span className="font-serif italic text-[#C4714A]">CreateOS</span>
        </p>
      </div>
    </div>
  );
}
