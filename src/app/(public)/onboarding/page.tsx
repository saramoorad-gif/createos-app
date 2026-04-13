"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, Check } from "lucide-react";

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
    "w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500";

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-serif font-bold text-foreground">
            create<span className="italic text-terra-500">OS</span>
          </h1>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                s <= step ? "bg-terra-500" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            {/* Step 1: Name + Handles */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-serif font-semibold">Welcome! Let&apos;s set up your profile</h2>
                  <p className="text-sm text-muted-foreground mt-1">Tell us about yourself.</p>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1.5">Full Name</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Brianna Cole"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1.5">TikTok Handle</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={tiktok}
                    onChange={(e) => setTiktok(e.target.value)}
                    placeholder="@briannacole"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1.5">Instagram Handle</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@brianna.cole"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1.5">YouTube Channel</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                    placeholder="@BriannaColeCreates"
                  />
                </div>

                <Button className="w-full gap-2" onClick={() => setStep(2)}>
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Step 2: Niche */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-serif font-semibold">What&apos;s your primary niche?</h2>
                  <p className="text-sm text-muted-foreground mt-1">This helps us match you with brands.</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {["Lifestyle", "Beauty", "Skincare", "Fashion", "Fitness", "Food", "Tech", "Travel", "Wellness", "Parenting"].map((n) => (
                    <button
                      key={n}
                      onClick={() => setNiche(n)}
                      className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                        niche === n
                          ? "border-terra-500 bg-terra-50 text-terra-700"
                          : "border-border bg-white text-muted-foreground hover:border-foreground/20"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                <Button className="w-full gap-2" onClick={() => setStep(3)}>
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Step 3: Choose Tier */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-serif font-semibold">Choose your plan</h2>
                  <p className="text-sm text-muted-foreground mt-1">You can change this anytime.</p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setTier("ugc_creator")}
                    className={`w-full rounded-lg border p-4 text-left transition-colors ${
                      tier === "ugc_creator"
                        ? "border-terra-500 bg-terra-50"
                        : "border-border bg-white hover:border-foreground/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold">UGC Creator</span>
                      <span className="text-lg font-serif font-bold text-terra-600">$27/mo</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Deal pipeline, invoicing, inbox, inbound, brand radar, rate calculator
                    </p>
                    {tier === "ugc_creator" && (
                      <div className="mt-2">
                        <Check className="h-4 w-4 text-terra-500" />
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => setTier("influencer")}
                    className={`w-full rounded-lg border p-4 text-left transition-colors ${
                      tier === "influencer"
                        ? "border-amber-500 bg-amber-50"
                        : "border-border bg-white hover:border-foreground/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">Influencer</span>
                        <Badge variant="secondary" className="text-[10px]">Popular</Badge>
                      </div>
                      <span className="text-lg font-serif font-bold text-amber-700">$39/mo</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Everything in UGC + audience analytics, sponsor tolerance, exclusivity tracker, media kit, automations
                    </p>
                    {tier === "influencer" && (
                      <div className="mt-2">
                        <Check className="h-4 w-4 text-amber-600" />
                      </div>
                    )}
                  </button>
                </div>

                <Button
                  className="w-full gap-2"
                  disabled={!tier}
                  onClick={() => {
                    // Would redirect to /dashboard after Supabase user creation
                    window.location.href = "/dashboard";
                  }}
                >
                  <Sparkles className="h-4 w-4" />
                  Launch my createOS
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
