"use client";

import { useState } from "react";

type Tier = "ugc_creator" | "influencer";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [niche, setNiche] = useState("");
  const [tier, setTier] = useState<Tier | null>(null);

  const inputClass =
    "w-full rounded-[10px] border border-[#E5E0D8] px-3 py-2.5 text-[13px] font-sans text-[#1C1714] bg-white focus:outline-none focus:ring-2 focus:ring-[#C4714A]/20 focus:border-[#C4714A]";

  return (
    <div className="min-h-screen bg-[#F7F4EF] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-[22px] font-serif text-[#1C1714]">
            create<em className="italic text-[#C4714A]">OS</em>
          </h1>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                s <= step ? "bg-[#C4714A]" : "bg-[#E5E0D8]"
              }`}
            />
          ))}
        </div>

        <div className="bg-white border border-[#E5E0D8] rounded-[10px] p-6">
          {/* Step 1: Name + Handles */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-[18px] font-serif text-[#1C1714]">Welcome! Let&apos;s set up your profile</h2>
                <p className="text-[13px] font-sans text-[#9A9088] mt-1">Tell us about yourself.</p>
              </div>

              <div>
                <label className="text-[12px] font-sans font-medium text-[#1C1714] block mb-1.5">Full Name</label>
                <input
                  type="text"
                  className={inputClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Brianna Cole"
                />
              </div>

              <div>
                <label className="text-[12px] font-sans font-medium text-[#1C1714] block mb-1.5">TikTok Handle</label>
                <input
                  type="text"
                  className={inputClass}
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                  placeholder="@briannacole"
                />
              </div>

              <div>
                <label className="text-[12px] font-sans font-medium text-[#1C1714] block mb-1.5">Instagram Handle</label>
                <input
                  type="text"
                  className={inputClass}
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@brianna.cole"
                />
              </div>

              <div>
                <label className="text-[12px] font-sans font-medium text-[#1C1714] block mb-1.5">YouTube Channel</label>
                <input
                  type="text"
                  className={inputClass}
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="@BriannaColeCreates"
                />
              </div>

              <button
                className="w-full bg-[#C4714A] text-white font-sans font-medium text-[13px] py-2.5 rounded-[10px] hover:bg-[#B5633E] transition-colors"
                onClick={() => setStep(2)}
              >
                Continue &rarr;
              </button>
            </div>
          )}

          {/* Step 2: Niche */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-[18px] font-serif text-[#1C1714]">What&apos;s your primary niche?</h2>
                <p className="text-[13px] font-sans text-[#9A9088] mt-1">This helps us match you with brands.</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {["Lifestyle", "Beauty", "Skincare", "Fashion", "Fitness", "Food", "Tech", "Travel", "Wellness", "Parenting"].map((n) => (
                  <button
                    key={n}
                    onClick={() => setNiche(n)}
                    className={`rounded-[10px] border px-3 py-2.5 text-[13px] font-sans font-medium transition-colors ${
                      niche === n
                        ? "border-[#C4714A] bg-[#C4714A]/5 text-[#C4714A]"
                        : "border-[#E5E0D8] bg-white text-[#9A9088] hover:border-[#1C1714]/20"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <button
                className="w-full bg-[#C4714A] text-white font-sans font-medium text-[13px] py-2.5 rounded-[10px] hover:bg-[#B5633E] transition-colors"
                onClick={() => setStep(3)}
              >
                Continue &rarr;
              </button>
            </div>
          )}

          {/* Step 3: Choose Tier */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-[18px] font-serif text-[#1C1714]">Choose your plan</h2>
                <p className="text-[13px] font-sans text-[#9A9088] mt-1">You can change this anytime.</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setTier("ugc_creator")}
                  className={`w-full rounded-[10px] border p-4 text-left transition-colors ${
                    tier === "ugc_creator"
                      ? "border-[#C4714A] bg-[#C4714A]/5"
                      : "border-[#E5E0D8] bg-white hover:border-[#1C1714]/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[14px] font-sans font-semibold text-[#1C1714]">UGC Creator</span>
                    <span className="text-[18px] font-serif text-[#C4714A]">$27/mo</span>
                  </div>
                  <p className="text-[12px] font-sans text-[#9A9088]">
                    Deal pipeline, invoicing, inbox, inbound, brand radar, rate calculator
                  </p>
                  {tier === "ugc_creator" && (
                    <div className="mt-2 text-[#C4714A] text-sm">&#10003;</div>
                  )}
                </button>

                <button
                  onClick={() => setTier("influencer")}
                  className={`w-full rounded-[10px] border p-4 text-left transition-colors ${
                    tier === "influencer"
                      ? "border-[#C4714A] bg-[#C4714A]/5"
                      : "border-[#E5E0D8] bg-white hover:border-[#1C1714]/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-sans font-semibold text-[#1C1714]">Influencer</span>
                      <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#C4714A] bg-[#C4714A]/10 rounded px-1.5 py-0.5">Popular</span>
                    </div>
                    <span className="text-[18px] font-serif text-[#C4714A]">$39/mo</span>
                  </div>
                  <p className="text-[12px] font-sans text-[#9A9088]">
                    Everything in UGC + audience analytics, sponsor tolerance, exclusivity tracker, media kit, automations
                  </p>
                  {tier === "influencer" && (
                    <div className="mt-2 text-[#C4714A] text-sm">&#10003;</div>
                  )}
                </button>
              </div>

              <button
                className="w-full bg-[#C4714A] text-white font-sans font-medium text-[13px] py-2.5 rounded-[10px] hover:bg-[#B5633E] transition-colors disabled:opacity-50"
                disabled={!tier}
                onClick={() => {
                  window.location.href = "/dashboard";
                }}
              >
                Launch my createOS
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
