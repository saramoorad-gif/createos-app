"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

type AccountType = "free" | "ugc" | "ugc_influencer" | "agency";
type Step = "credentials" | "tier";

const tierCards: {
  key: AccountType;
  name: string;
  tagline: string;
  price: string;
  features: string[];
}[] = [
  {
    key: "ugc",
    name: "UGC Creator",
    tagline: "I create content for brands",
    price: "$27/mo",
    features: ["Unlimited deal pipeline", "AI contract analysis", "Rate calculator + brand radar"],
  },
  {
    key: "ugc_influencer",
    name: "UGC + Influencer",
    tagline: "I create content and grow my own audience",
    price: "$39/mo",
    features: ["Everything in UGC Creator", "Audience analytics + engagement", "Campaign recaps"],
  },
  {
    key: "agency",
    name: "Agency",
    tagline: "I manage a roster of creators",
    price: "$149/mo",
    features: ["Roster dashboard", "Commission tracking", "Manage deals on behalf of creators"],
  },
  {
    key: "free",
    name: "Free",
    tagline: "I want to try first",
    price: "$0",
    features: ["3 active deals", "Basic invoicing", "Inbound form"],
  },
];

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [agencyName, setAgencyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputClass =
    "w-full rounded-[10px] border border-[#E5E0D8] px-3 py-2.5 text-[13px] font-sans text-[#1C1714] bg-white focus:outline-none focus:ring-2 focus:ring-[#C4714A]/20 focus:border-[#C4714A]";

  function handleCredentialsNext(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Passwords don't match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setStep("tier");
  }

  async function handleSignUp() {
    if (!accountType) return;
    setError("");

    if (!isSupabaseConfigured()) {
      router.push(accountType === "agency" ? "/onboarding?flow=agency" : "/onboarding");
      return;
    }

    setLoading(true);
    const sb = getSupabase();
    const { data, error: signUpError } = await sb.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, account_type: accountType } },
    });

    if (signUpError) { setError(signUpError.message); setLoading(false); return; }

    if (data.user) {
      await sb.from("profiles").insert({
        id: data.user.id,
        full_name: fullName,
        email,
        account_type: accountType,
        agency_name: accountType === "agency" ? agencyName : null,
      });
    }

    setLoading(false);
    router.push(accountType === "agency" ? "/onboarding?flow=agency" : "/onboarding");
  }

  return (
    <div className="min-h-screen bg-[#F7F4EF] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-serif text-[#1C1714]">
            create<em className="italic text-[#C4714A]">OS</em>
          </h1>
          <p className="text-[13px] font-sans text-[#9A9088] mt-1">
            {step === "credentials" ? "Create your account" : "Choose your plan"}
          </p>
        </div>

        {/* Step 1 — Credentials */}
        {step === "credentials" && (
          <div className="max-w-md mx-auto">
            <div className="bg-white border border-[#E5E0D8] rounded-[10px] p-6">
              <form onSubmit={handleCredentialsNext} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5">
                    <span className="text-red-500 text-sm">&#9888;</span>
                    <p className="text-[13px] font-sans text-red-700">{error}</p>
                  </div>
                )}
                <div>
                  <label className="text-[12px] font-sans font-medium text-[#1C1714] block mb-1.5">Full name</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Brianna Cole" required className={inputClass} />
                </div>
                <div>
                  <label className="text-[12px] font-sans font-medium text-[#1C1714] block mb-1.5">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="brianna@example.com" required className={inputClass} />
                </div>
                <div>
                  <label className="text-[12px] font-sans font-medium text-[#1C1714] block mb-1.5">Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" required className={inputClass} />
                </div>
                <div>
                  <label className="text-[12px] font-sans font-medium text-[#1C1714] block mb-1.5">Confirm password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm your password" required className={inputClass} />
                </div>
                <button className="w-full bg-[#C4714A] text-white font-sans font-medium text-[13px] py-2.5 rounded-[10px] hover:bg-[#B5633E] transition-colors" type="submit">
                  Continue &rarr;
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Step 2 — Tier selection cards */}
        {step === "tier" && (
          <div>
            {error && (
              <div className="flex items-center gap-2 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5 mb-4 max-w-md mx-auto">
                <span className="text-red-500 text-sm">&#9888;</span>
                <p className="text-[13px] font-sans text-red-700">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tierCards.map((tier) => (
                <button
                  key={tier.key}
                  onClick={() => setAccountType(tier.key)}
                  className={`text-left bg-white border rounded-[10px] p-5 transition-colors ${
                    accountType === tier.key
                      ? "border-[#C4714A] ring-1 ring-[#C4714A]/20"
                      : "border-[#E5E0D8] hover:border-[#1C1714]/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[14px] font-sans font-600 text-[#1C1714]">{tier.name}</span>
                    <span className="text-[18px] font-serif text-[#C4714A]">{tier.price}</span>
                  </div>
                  <p className="text-[12px] font-sans text-[#9A9088] mb-3">{tier.tagline}</p>
                  <div className="space-y-1.5">
                    {tier.features.map((f) => (
                      <div key={f} className="flex items-start gap-2">
                        <span className="text-[#4A9060] text-xs mt-0.5">&#10003;</span>
                        <span className="text-[11px] font-sans text-[#1C1714]">{f}</span>
                      </div>
                    ))}
                  </div>
                  {accountType === tier.key && (
                    <div className="mt-3 text-[#C4714A] text-sm">&#10003; Selected</div>
                  )}
                </button>
              ))}
            </div>

            {/* Agency name — conditional */}
            {accountType === "agency" && (
              <div className="max-w-md mx-auto mt-4">
                <label className="text-[12px] font-sans font-medium text-[#1C1714] block mb-1.5">Agency / Company name</label>
                <input type="text" value={agencyName} onChange={e => setAgencyName(e.target.value)} placeholder="Bright Talent Mgmt" className={inputClass} />
              </div>
            )}

            <div className="max-w-md mx-auto mt-5 flex gap-2">
              <button onClick={() => setStep("credentials")} className="flex-1 border border-[#E5E0D8] rounded-[10px] px-4 py-2.5 text-[13px] font-sans font-500 hover:bg-[#F7F4EF]">
                &larr; Back
              </button>
              <button
                onClick={handleSignUp}
                disabled={!accountType || loading}
                className="flex-1 bg-[#C4714A] text-white font-sans font-medium text-[13px] py-2.5 rounded-[10px] hover:bg-[#B5633E] transition-colors disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </div>
          </div>
        )}

        <p className="text-[13px] text-center font-sans text-[#9A9088] mt-4">
          Already have an account? <Link href="/login" className="text-[#C4714A] hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
