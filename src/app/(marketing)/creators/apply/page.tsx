"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getSupabase } from "@/lib/supabase";
import { AFFILIATE_CONFIG } from "@/lib/affiliate-config";
import { CheckCircle2, Sparkles } from "lucide-react";

const followerTiers = [
  { value: "10k-50k", label: "10K – 50K followers" },
  { value: "50k-150k", label: "50K – 150K followers" },
  { value: "150k-500k", label: "150K – 500K followers" },
  { value: "500k+", label: "500K+ followers" },
];

export default function AffiliateApplyPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [promoCode, setPromoCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [instagram, setInstagram] = useState("");
  const [followerTier, setFollowerTier] = useState("");
  const [motivation, setMotivation] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const codeValid = AFFILIATE_CONFIG.PROMO_CODE_REGEX.test(promoCode.toUpperCase());

  const inputClass =
    "w-full rounded-[10px] border border-[#D8E8EE] px-3 py-2.5 text-[13px] font-sans text-[#1A2C38] bg-white focus:outline-none focus:ring-2 focus:ring-[#7BAFC8]/20 focus:border-[#7BAFC8]";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!user) {
      router.push("/login?redirect=/creators/apply");
      return;
    }

    if (!promoCode || !codeValid) {
      setError("Please enter a valid promo code (4-20 characters, letters and numbers only).");
      return;
    }
    if (!displayName.trim()) {
      setError("Please enter your display name.");
      return;
    }
    if (!agreedToTerms) {
      setError("You must agree to the Affiliate Program Agreement.");
      return;
    }

    setLoading(true);
    try {
      const sb = getSupabase();
      const { data: { session } } = await sb.auth.getSession();
      if (!session?.access_token) {
        router.push("/login?redirect=/creators/apply");
        return;
      }

      const res = await fetch("/api/affiliates/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          promo_code: promoCode.toUpperCase(),
          display_name: displayName.trim(),
          instagram_handle: instagram.trim(),
          follower_tier: followerTier,
          motivation: motivation.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Application failed. Please try again.");
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    }
    setLoading(false);
  }

  if (submitted) {
    return (
      <section className="min-h-screen bg-[#FAF8F4] flex items-center justify-center px-4 py-12">
        <div className="max-w-md text-center">
          <div className="h-16 w-16 rounded-full bg-[#E8F4EE] border border-[#3D7A58]/20 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="h-8 w-8 text-[#3D7A58]" />
          </div>
          <h1 className="text-[28px] font-serif text-[#1A2C38] mb-3">
            Application <em className="italic text-[#7BAFC8]">received</em>
          </h1>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed mb-2">
            We&apos;ll review your application within 5 business days.
          </p>
          <p className="text-[13px] font-sans text-[#8AAABB] mb-8">
            Your promo code <strong className="text-[#1A2C38]">{promoCode.toUpperCase()}</strong> is
            reserved and will be activated once you&apos;re approved.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-[#1E3F52] text-white rounded-[10px] px-6 py-3 text-[14px] font-sans hover:bg-[#2a5269] transition-colors"
            style={{ fontWeight: 600 }}
          >
            Back to dashboard
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#FAF8F4] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-full bg-[#F2F8FB] border border-[#D8E8EE] flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-6 w-6 text-[#7BAFC8]" />
          </div>
          <h1 className="text-[28px] font-serif text-[#1A2C38]">
            Apply to the Creator <em className="italic text-[#7BAFC8]">Program</em>
          </h1>
          <p className="text-[15px] font-sans text-[#4A6070] mt-2 max-w-md mx-auto leading-relaxed">
            Earn 15% recurring commission for 12 months on every paying subscriber you refer.
            Your followers save $12 on month one.
          </p>
        </div>

        <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5">
                <span className="text-red-500 text-sm">&#9888;</span>
                <p className="text-[13px] font-sans text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label className="text-[12px] font-sans font-medium text-[#1A2C38] block mb-1.5">
                Your name (displayed to referred users)
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Brianna Cole"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-[12px] font-sans font-medium text-[#1A2C38] block mb-1.5">
                Instagram handle
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@briannacole"
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-[12px] font-sans font-medium text-[#1A2C38] block mb-1.5">
                Follower count
              </label>
              <select
                value={followerTier}
                onChange={(e) => setFollowerTier(e.target.value)}
                className={inputClass}
              >
                <option value="">Select range...</option>
                {followerTiers.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[12px] font-sans font-medium text-[#1A2C38] block mb-1.5">
                Preferred promo code
              </label>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                placeholder="BRIANNA"
                required
                maxLength={20}
                className={inputClass}
              />
              <p className="text-[11px] font-sans text-[#8AAABB] mt-1">
                {promoCode.length > 0 && !codeValid
                  ? "Must be 4-20 characters, letters and numbers only"
                  : promoCode.length >= 4
                    ? "Looks good! We'll check availability when you submit."
                    : "4-20 characters, letters and numbers only"}
              </p>
            </div>

            <div>
              <label className="text-[12px] font-sans font-medium text-[#1A2C38] block mb-1.5">
                Why do you want to promote CreateSuite? (optional)
              </label>
              <textarea
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                rows={3}
                placeholder="Tell us a bit about your audience and how you'd share CreateSuite..."
                className={`${inputClass} resize-none`}
              />
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border border-[#D8E8EE] text-[#7BAFC8] focus:ring-[#7BAFC8]/30"
              />
              <span className="text-[12px] font-sans text-[#4A6070] leading-relaxed">
                I agree to the{" "}
                <Link
                  href="/affiliate-agreement"
                  target="_blank"
                  className="text-[#7BAFC8] hover:underline"
                >
                  Affiliate Program Agreement
                </Link>
              </span>
            </label>

            {!user && !authLoading && (
              <div className="bg-[#FFF8E8] border border-[#A07830]/20 rounded-[8px] p-3">
                <p className="text-[12px] font-sans text-[#A07830]">
                  You need a CreateSuite account to apply.{" "}
                  <Link href="/signup" className="underline">
                    Sign up
                  </Link>{" "}
                  or{" "}
                  <Link href="/login?redirect=/creators/apply" className="underline">
                    log in
                  </Link>{" "}
                  first.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !agreedToTerms || (!user && !authLoading)}
              className="w-full bg-[#1E3F52] text-white font-sans text-[14px] py-3 rounded-[10px] hover:bg-[#2a5269] transition-colors disabled:opacity-50"
              style={{ fontWeight: 600 }}
            >
              {loading ? "Submitting..." : "Submit application"}
            </button>
          </form>
        </div>

        <p className="text-[13px] text-center font-sans text-[#8AAABB] mt-4">
          <Link href="/referral-program" className="text-[#7BAFC8] hover:underline">
            &larr; Back to program details
          </Link>
        </p>
      </div>
    </section>
  );
}
