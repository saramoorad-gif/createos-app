"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import { logError } from "@/lib/error-logger";

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

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref");
  // Allow pre-selecting a plan via ?plan=free|ugc|ugc_influencer|agency (from /pricing CTAs).
  // "agency_starter" and "agency_growth" both map to "agency" for signup tier selection.
  const planParam = searchParams.get("plan");
  const initialAccountType: AccountType | null = (() => {
    if (planParam === "free") return "free";
    if (planParam === "ugc") return "ugc";
    if (planParam === "ugc_influencer") return "ugc_influencer";
    if (planParam === "agency" || planParam === "agency_starter" || planParam === "agency_growth") return "agency";
    return null;
  })();
  const [step, setStep] = useState<Step>("credentials");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType | null>(initialAccountType);
  const [agencyName, setAgencyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showGiftCodeField, setShowGiftCodeField] = useState(false);
  const [giftCode, setGiftCode] = useState("");

  // Clear any existing session on mount so a pre-signed-in user (e.g. admin)
  // doesn't accidentally hijack the new account creation flow. Supabase's
  // signUp() does NOT replace an existing session when email confirmation is
  // enabled — so if we don't sign out first, the browser keeps the old auth
  // token and the newly created account gets treated as whoever was signed in.
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    (async () => {
      const sb = getSupabase();
      const { data: { session } } = await sb.auth.getSession();
      if (session) {
        await sb.auth.signOut();
      }
    })();
  }, []);

  // Look up referrer name if ref code is present
  useEffect(() => {
    async function lookupReferrer() {
      if (!refCode || !isSupabaseConfigured()) return;
      const sb = getSupabase();
      const { data } = await sb
        .from("profiles")
        .select("full_name")
        .eq("referral_code", refCode.toUpperCase())
        .single();
      if (data?.full_name) {
        setReferrerName(data.full_name);
      }
    }
    lookupReferrer();
  }, [refCode]);

  const inputClass =
    "w-full rounded-[10px] border border-[#D8E8EE] px-3 py-2.5 text-[13px] font-sans text-[#1A2C38] bg-white focus:outline-none focus:ring-2 focus:ring-[#7BAFC8]/20 focus:border-[#7BAFC8]";

  function handleCredentialsNext(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!agreedToTerms) { setError("Please agree to the Terms of Service and Privacy Policy."); return; }
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

    if (signUpError) {
      logError({
        source: "signup.auth.signUp",
        message: signUpError.message,
        metadata: { email, accountType },
      });
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Generate a unique referral code for this user (8-char uppercase)
      const myReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

      // Everyone starts as "free" in the database.
      // Paid tiers get upgraded by Stripe webhook after successful checkout.
      await sb.from("profiles").insert({
        id: data.user.id,
        full_name: fullName,
        email,
        account_type: "free",
        agency_name: accountType === "agency" ? agencyName : null,
        referral_code: myReferralCode,
        referred_by_code: refCode ? refCode.toUpperCase() : null,
      });

      // Track the referral if one was used
      if (refCode) {
        try {
          await fetch("/api/referrals/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              referredId: data.user.id,
              referralCode: refCode.toUpperCase(),
            }),
          });
        } catch (e) {
          console.error("Failed to track referral:", e);
        }
      }
    }

    // ─── Gift code redemption (bypasses Stripe checkout) ─────
    // If they entered a gift code, try to redeem it. On success, skip
    // the /checkout redirect and send them to /onboarding with a paid tier.
    if (giftCode.trim()) {
      try {
        // Get an auth token — signUp returns a session when email confirmation
        // is off, but if it's on (Supabase default for new projects), data.session
        // is null and we need to establish a session another way. Fall back to
        // getSession() (which reads from the Supabase JS client's in-memory state)
        // and as a final fallback, try signing the user in with the password they
        // just typed.
        let accessToken = data.session?.access_token;

        if (!accessToken) {
          const { data: currentSession } = await sb.auth.getSession();
          accessToken = currentSession.session?.access_token;
        }

        if (!accessToken) {
          const { data: signInData, error: signInError } = await sb.auth.signInWithPassword({
            email,
            password,
          });
          if (signInError) {
            // Email confirmation is required. Tell the user clearly.
            setError(
              "Your account was created, but we couldn't apply the gift code automatically. " +
              "Please check your email to confirm your account, then log in and enter the code in Settings."
            );
            setLoading(false);
            return;
          }
          accessToken = signInData.session?.access_token;
        }

        if (!accessToken) {
          setError("Could not apply gift code. Try logging in and redeeming it from Settings.");
          setLoading(false);
          return;
        }

        const redeemRes = await fetch("/api/gift-codes/redeem", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ code: giftCode.trim().toUpperCase() }),
        });
        const redeemData = await redeemRes.json();
        if (redeemRes.ok && redeemData.ok) {
          // Profile is already upgraded server-side — skip checkout.
          setLoading(false);
          router.push("/onboarding?gift=1");
          return;
        } else {
          setError(redeemData.error || "Invalid gift code. Please check and try again, or remove the code to continue.");
          setLoading(false);
          return;
        }
      } catch (e) {
        setError("Failed to redeem gift code. Please try again.");
        setLoading(false);
        return;
      }
    }

    setLoading(false);

    // Route based on tier selection
    // Admin emails bypass checkout entirely
    if (accountType === "free" || isAdmin(email)) {
      router.push("/onboarding");
    } else {
      // Paid tiers → go to checkout first
      // If they came from a referral and picked ugc_influencer, include the ref in checkout URL
      const checkoutUrl = refCode && accountType === "ugc_influencer"
        ? `/checkout?plan=${accountType}&ref=${refCode.toUpperCase()}`
        : `/checkout?plan=${accountType}`;
      router.push(checkoutUrl);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Referral banner */}
        {refCode && (
          <div className="mb-6 bg-gradient-to-r from-[#1E3F52] to-[#2a5269] rounded-[10px] p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <span className="text-[16px]">🎁</span>
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-sans text-white" style={{ fontWeight: 600 }}>
                {referrerName ? `${referrerName} invited you!` : "You've been invited!"}
              </p>
              <p className="text-[11px] font-sans text-white/70">
                Get your first month of <strong>UGC + Influencer ($39/mo)</strong> for just $27 when you sign up.
              </p>
            </div>
          </div>
        )}

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-serif text-[#1A2C38]">
            create<em className="italic text-[#7BAFC8]">Suite</em>
          </h1>
          <p className="text-[13px] font-sans text-[#8AAABB] mt-1">
            {step === "credentials" ? "Create your account" : "Choose your plan"}
          </p>
        </div>

        {/* Step 1 — Credentials */}
        {step === "credentials" && (
          <div className="max-w-md mx-auto">
            <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-6">
              <form onSubmit={handleCredentialsNext} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5">
                    <span className="text-red-500 text-sm">&#9888;</span>
                    <p className="text-[13px] font-sans text-red-700">{error}</p>
                  </div>
                )}
                <div>
                  <label className="text-[12px] font-sans font-medium text-[#1A2C38] block mb-1.5">Full name</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Brianna Cole" required className={inputClass} />
                </div>
                <div>
                  <label className="text-[12px] font-sans font-medium text-[#1A2C38] block mb-1.5">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className={inputClass} />
                </div>
                <div>
                  <label className="text-[12px] font-sans font-medium text-[#1A2C38] block mb-1.5">Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" required className={inputClass} />
                </div>
                <div>
                  <label className="text-[12px] font-sans font-medium text-[#1A2C38] block mb-1.5">Confirm password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm your password" required className={inputClass} />
                </div>
                <label className="flex items-start gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[1.5px] border-[#D8E8EE] text-[#7BAFC8] focus:ring-[#7BAFC8]/30"
                  />
                  <span className="text-[12px] font-sans text-[#4A6070] leading-relaxed">
                    I agree to the{" "}
                    <Link href="/terms" target="_blank" className="text-[#7BAFC8] hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" target="_blank" className="text-[#7BAFC8] hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
                <button
                  className="w-full bg-[#7BAFC8] text-white font-sans font-medium text-[13px] py-2.5 rounded-[10px] hover:bg-[#6AA0BB] transition-colors disabled:opacity-50"
                  type="submit"
                  disabled={!agreedToTerms}
                >
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
                      ? "border-[#7BAFC8] ring-1 ring-[#7BAFC8]/20"
                      : "border-[#D8E8EE] hover:border-[#1A2C38]/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[14px] font-sans font-600 text-[#1A2C38]">{tier.name}</span>
                    <span className="text-[18px] font-serif text-[#7BAFC8]">{tier.price}</span>
                  </div>
                  <p className="text-[12px] font-sans text-[#8AAABB] mb-3">{tier.tagline}</p>
                  <div className="space-y-1.5">
                    {tier.features.map((f) => (
                      <div key={f} className="flex items-start gap-2">
                        <span className="text-[#3D7A58] text-xs mt-0.5">&#10003;</span>
                        <span className="text-[11px] font-sans text-[#1A2C38]">{f}</span>
                      </div>
                    ))}
                  </div>
                  {accountType === tier.key && (
                    <div className="mt-3 text-[#7BAFC8] text-sm">&#10003; Selected</div>
                  )}
                </button>
              ))}
            </div>

            {/* Agency name — conditional */}
            {accountType === "agency" && (
              <div className="max-w-md mx-auto mt-4">
                <label className="text-[12px] font-sans font-medium text-[#1A2C38] block mb-1.5">Agency / Company name</label>
                <input type="text" value={agencyName} onChange={e => setAgencyName(e.target.value)} placeholder="Bright Talent Mgmt" className={inputClass} />
              </div>
            )}

            {/* Gift code — skip checkout for comped accounts */}
            {accountType && accountType !== "free" && (
              <div className="max-w-md mx-auto mt-4">
                {!showGiftCodeField ? (
                  <button
                    type="button"
                    onClick={() => setShowGiftCodeField(true)}
                    className="text-[12px] font-sans text-[#7BAFC8] hover:underline"
                  >
                    Have a gift code?
                  </button>
                ) : (
                  <div>
                    <label className="text-[12px] font-sans font-medium text-[#1A2C38] block mb-1.5">
                      Gift code
                    </label>
                    <input
                      type="text"
                      value={giftCode}
                      onChange={(e) => setGiftCode(e.target.value.toUpperCase().replace(/\s+/g, ""))}
                      placeholder="BRI-FREE"
                      className={inputClass}
                      autoFocus
                    />
                    <p className="text-[11px] font-sans text-[#8AAABB] mt-1">
                      Gift codes give you free access for a set period. You&apos;ll skip the payment step and can cancel anytime.{" "}
                      <button
                        type="button"
                        onClick={() => { setShowGiftCodeField(false); setGiftCode(""); }}
                        className="text-[#7BAFC8] hover:underline"
                      >
                        Remove
                      </button>
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="max-w-md mx-auto mt-5 flex gap-2">
              <button onClick={() => setStep("credentials")} className="flex-1 border border-[#D8E8EE] rounded-[10px] px-4 py-2.5 text-[13px] font-sans font-500 hover:bg-[#FAF8F4]">
                &larr; Back
              </button>
              <button
                onClick={handleSignUp}
                disabled={!accountType || loading}
                className="flex-1 bg-[#7BAFC8] text-white font-sans font-medium text-[13px] py-2.5 rounded-[10px] hover:bg-[#6AA0BB] transition-colors disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </div>
          </div>
        )}

        <p className="text-[13px] text-center font-sans text-[#8AAABB] mt-4">
          Already have an account? <Link href="/login" className="text-[#7BAFC8] hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center"><p className="text-[14px] font-sans text-[#8AAABB]">Loading...</p></div>}>
      <SignUpContent />
    </Suspense>
  );
}
