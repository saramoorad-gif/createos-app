"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useToast } from "@/components/global/toast";
import { useAuth } from "@/contexts/auth-context";
import { Shimmer } from "@/components/global/skeleton";
import { Copy, Sparkles, Send } from "lucide-react";

export default function AINegotiatorPage() {
  const { profile } = useAuth();
  const { toast } = useToast();

  // Negotiator state
  const [offer, setOffer] = useState("");
  const [followers, setFollowers] = useState("");
  const [engagement, setEngagement] = useState("");
  const [usualRate, setUsualRate] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    analysis: string;
    counter: string;
    script: string;
    leverage: string;
  } | null>(null);

  // Quick pitch state
  const [pitchBrand, setPitchBrand] = useState("");
  const [pitchLoading, setPitchLoading] = useState(false);
  const [pitchResult, setPitchResult] = useState<string | null>(null);

  const inputClass =
    "w-full rounded-[8px] border-[1.5px] border-[#D8E8EE] px-3 py-2.5 text-[14px] font-sans text-[#1A2C38] bg-white focus:outline-none focus:border-[#7BAFC8]";
  const labelClass =
    "text-[11px] font-sans text-[#8AAABB] uppercase tracking-[1.5px] block mb-1.5";

  async function handleAnalyze() {
    if (!offer.trim()) {
      toast("warning", "Paste the brand offer first.");
      return;
    }
    setAnalyzing(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "negotiate",
          context: {
            offer: offer.trim(),
            followers,
            engagement,
            usual_rate: usualRate,
            offer_amount: "",
          },
        }),
      });
      const data = await res.json();
      const text: string = data.result || data.message || "";
      // Parse sections from the AI response
      const getSection = (heading: string): string => {
        const regex = new RegExp(
          `(?:^|\\n)#+?\\s*${heading}[:\\s]*\\n([\\s\\S]*?)(?=\\n#+|$)`,
          "i"
        );
        const match = text.match(regex);
        return match ? match[1].trim() : "";
      };
      setResult({
        analysis: getSection("Offer Analysis") || text,
        counter: getSection("Recommended Counter"),
        script: getSection("Copy-Paste Script") || getSection("Script"),
        leverage: getSection("Your Leverage") || getSection("Leverage"),
      });
    } catch {
      toast("error", "Failed to analyze offer. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handlePitch() {
    if (!pitchBrand.trim()) {
      toast("warning", "Enter a brand name first.");
      return;
    }
    setPitchLoading(true);
    setPitchResult(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "pitch",
          context: {
            brand: pitchBrand.trim(),
            niche: profile?.niche || "",
          },
        }),
      });
      const data = await res.json();
      setPitchResult(data.result || data.message || "");
    } catch {
      toast("error", "Failed to generate pitch.");
    } finally {
      setPitchLoading(false);
    }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast("success", `${label} copied to clipboard`);
  }

  return (
    <div>
      <PageHeader
        headline={
          <>
            Deal <em className="italic text-[#7BAFC8]">negotiator</em>
          </>
        }
        subheading="Paste a brand offer and get AI-powered counter-offer advice."
      />

      {/* ── Offer Textarea ── */}
      <div className="mb-6">
        <label className={labelClass} style={{ fontWeight: 600 }}>
          Paste the brand&apos;s offer, email, or DM here
        </label>
        <textarea
          rows={8}
          value={offer}
          onChange={(e) => setOffer(e.target.value)}
          placeholder="e.g. Hi! We'd love to partner with you for a 3-post campaign. We can offer $500 for 3 Instagram Reels..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* ── Context Fields ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className={labelClass} style={{ fontWeight: 600 }}>
            Your followers
          </label>
          <input
            type="text"
            value={followers}
            onChange={(e) => setFollowers(e.target.value)}
            placeholder="e.g. 50,000"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} style={{ fontWeight: 600 }}>
            Your engagement rate
          </label>
          <input
            type="text"
            value={engagement}
            onChange={(e) => setEngagement(e.target.value)}
            placeholder="e.g. 4.5%"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} style={{ fontWeight: 600 }}>
            Your usual rate for this type
          </label>
          <input
            type="text"
            value={usualRate}
            onChange={(e) => setUsualRate(e.target.value)}
            placeholder="e.g. $1,200"
            className={inputClass}
          />
        </div>
      </div>

      {/* ── Analyze Button ── */}
      <button
        onClick={handleAnalyze}
        disabled={analyzing}
        className="flex items-center gap-2 bg-[#1E3F52] text-white rounded-[8px] px-6 py-3 text-[14px] font-sans disabled:opacity-50"
        style={{ fontWeight: 600 }}
      >
        <Sparkles className="h-4 w-4" />
        {analyzing ? "Analyzing..." : "Analyze offer"}
      </button>

      {/* ── Loading Shimmer ── */}
      {analyzing && (
        <div className="mt-8 space-y-4">
          <Shimmer className="h-6 w-48" />
          <Shimmer className="h-4 w-full" />
          <Shimmer className="h-4 w-full" />
          <Shimmer className="h-4 w-3/4" />
          <Shimmer className="h-6 w-40 mt-4" />
          <Shimmer className="h-4 w-full" />
          <Shimmer className="h-4 w-5/6" />
        </div>
      )}

      {/* ── Result Card ── */}
      {result && !analyzing && (
        <div className="mt-8 bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] overflow-hidden">
          {/* Offer Analysis */}
          {result.analysis && (
            <div className="p-6 border-b border-[#D8E8EE]">
              <h3 className="text-[13px] font-serif italic text-[#7BAFC8] mb-3">
                Offer Analysis
              </h3>
              <p className="text-[14px] font-sans text-[#1A2C38] leading-relaxed whitespace-pre-wrap">
                {result.analysis}
              </p>
            </div>
          )}

          {/* Recommended Counter */}
          {result.counter && (
            <div className="p-6 border-b border-[#D8E8EE]">
              <h3 className="text-[13px] font-serif italic text-[#7BAFC8] mb-3">
                Recommended Counter
              </h3>
              <p className="text-[14px] font-sans text-[#1A2C38] leading-relaxed whitespace-pre-wrap">
                {result.counter}
              </p>
            </div>
          )}

          {/* Copy-Paste Script */}
          {result.script && (
            <div className="p-6 border-b border-[#D8E8EE] bg-[#FAF8F4]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-serif italic text-[#7BAFC8]">
                  Copy-Paste Script
                </h3>
                <button
                  onClick={() => copyToClipboard(result.script, "Script")}
                  className="flex items-center gap-1.5 text-[12px] font-sans text-[#7BAFC8] hover:text-[#1E3F52]"
                  style={{ fontWeight: 500 }}
                >
                  <Copy className="h-3.5 w-3.5" /> Copy script
                </button>
              </div>
              <p className="text-[14px] font-sans text-[#1A2C38] leading-relaxed whitespace-pre-wrap">
                {result.script}
              </p>
            </div>
          )}

          {/* Your Leverage */}
          {result.leverage && (
            <div className="p-6">
              <h3 className="text-[13px] font-serif italic text-[#7BAFC8] mb-3">
                Your Leverage
              </h3>
              <p className="text-[14px] font-sans text-[#1A2C38] leading-relaxed whitespace-pre-wrap">
                {result.leverage}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Quick Pitch Section ── */}
      <div className="mt-12 pt-8 border-t border-[#D8E8EE]">
        <h2 className="text-[22px] font-serif text-[#1A2C38] mb-1">
          Quick <em className="italic text-[#7BAFC8]">pitch</em>
        </h2>
        <p className="text-[14px] font-sans text-[#4A6070] mb-6">
          Generate a ready-to-send outreach pitch for any brand.
        </p>

        <div className="flex gap-3 items-end mb-6">
          <div className="flex-1">
            <label className={labelClass} style={{ fontWeight: 600 }}>
              Brand name
            </label>
            <input
              type="text"
              value={pitchBrand}
              onChange={(e) => setPitchBrand(e.target.value)}
              placeholder="e.g. Glossier"
              className={inputClass}
            />
          </div>
          <button
            onClick={handlePitch}
            disabled={pitchLoading}
            className="flex items-center gap-2 bg-[#1E3F52] text-white rounded-[8px] px-5 py-2.5 text-[13px] font-sans disabled:opacity-50"
            style={{ fontWeight: 600 }}
          >
            <Send className="h-3.5 w-3.5" />
            {pitchLoading ? "Generating..." : "Generate pitch"}
          </button>
        </div>

        {pitchLoading && (
          <div className="space-y-3">
            <Shimmer className="h-4 w-full" />
            <Shimmer className="h-4 w-full" />
            <Shimmer className="h-4 w-2/3" />
          </div>
        )}

        {pitchResult && !pitchLoading && (
          <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-serif italic text-[#7BAFC8]">
                Your pitch
              </h3>
              <button
                onClick={() => copyToClipboard(pitchResult, "Pitch")}
                className="flex items-center gap-1.5 text-[12px] font-sans text-[#7BAFC8] hover:text-[#1E3F52]"
                style={{ fontWeight: 500 }}
              >
                <Copy className="h-3.5 w-3.5" /> Copy pitch
              </button>
            </div>
            <p className="text-[14px] font-sans text-[#1A2C38] leading-relaxed whitespace-pre-wrap">
              {pitchResult}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
