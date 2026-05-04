"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase, isSupabaseConfigured, setAuthCookie } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import { logError } from "@/lib/error-logger";
import { useAuth } from "@/contexts/auth-context";

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
  const { refreshProfile } = useAuth();
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
  const [confirmationSentTo, setConfirmationSentTo] = useState<string | null>(null);
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showGiftCodeField, setShowGiftCodeField] = useState(searchParams.get("gift") === "1");
  const [giftCode, setGiftCode] = useState("");
  const [giftCheck, setGiftCheck] = useState<
    | { status: "idle" }
    | { status: "checking" }
    | { status: "valid"; planTier: string; durationMonths: number | null }
    | { status: "invalid"; message: string }
  >({ status: "idle" });

  async function validateGiftCode() {
    const code = giftCode.trim();
    if (!code) return;
    setGiftCheck({ status: "checking" });
    try {
      const res = await fetch("/api/gift-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.ok) {
        setGiftCheck({
          status: "valid",
          planTier: data.plan_tier,
          durationMonths: data.duration_months ?? null,
        });
      } else {
        const reasonMap: Record<string, string> = {
          invalid_code: "That gift code doesn't exist.",
          deactivated: "That gift code has been deactivated.",
          code_expired: "That gift code has expired.",
          max_uses_reached: "That gift code has reached its redemption limit.",
        };
        setGiftCheck({
          status: "invalid",
          message: reasonMap[data?.reason || ""] || "We couldn't validate that code.",
        });
      }
    } catch {
      setGiftCheck({ status: "invalid", message: "Network error — try again." });
    }
  }

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
    "w-full h-[44px] rounded-[8px] border border-[#D8E8EE] px-3.5 text-[14.5px] font-sans text-[#1A2C38] bg-white focus:outline-none focus:ring-[3px] focus:ring-[#7BAFC8]/20 focus:border-[#7BAFC8] transition-all";

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
      options: {
        data: { full_name: fullName, account_type: accountType },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          accountType === "free" || accountType === "agency" ? "/onboarding" : `/checkout?plan=${accountType}${refCode ? `&ref=${refCode}` : ""}`
        )}`,
      },
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
      // Create the profile via a server-side endpoint that uses the
      // service role. This bypasses the RLS issue where Supabase
      // email confirmation = ON prevents the client from having a
      // session at this moment, which would silently reject the
      // direct .insert() we used to do here.
      //
      // If the user entered a gift code, pass it along — the endpoint
      // redeems it in the same call, so we don't need a client session
      // for that either.
      const createRes = await fetch("/api/signup/create-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: data.user.id,
          email,
          fullName,
          accountType,
          agencyName: accountType === "agency" ? agencyName : null,
          refCode: refCode || null,
          giftCode: giftCode.trim() || null,
        }),
      });

      if (!createRes.ok) {
        const createData = await createRes.json().catch(() => ({}));
        logError({
          source: "signup.create-profile",
          message: createData.error || "Profile creation failed",
          metadata: { userId: data.user.id, email, accountType },
        });
        setError(
          "Your account was created, but we hit a snag setting up your profile. " +
          "Try signing in — if the issue persists, email hello@createsuite.co."
        );
        setLoading(false);
        return;
      }

      // Check gift code result from the create-profile response.
      const createData = await createRes.json().catch(() => ({}));
      // If the user entered a gift code, we MUST resolve it before
      // proceeding. If the server didn't return a gift result at all,
      // treat that as a failure — otherwise the paid-tier fallthrough
      // below will silently route the user to Stripe checkout, which
      // is exactly what bit Bri's friend.
      if (giftCode.trim()) {
        const gift = createData.gift;
        if (gift && gift.ok) {
          // Profile is already upgraded — skip Stripe checkout.
          // Refresh auth context so /onboarding sees the upgraded profile.
          await refreshProfile?.();
          setLoading(false);
          router.push("/onboarding?gift=1");
          return;
        }
        const reasonMap: Record<string, string> = {
          invalid_code: "That gift code doesn't exist.",
          deactivated: "That gift code has been deactivated.",
          code_expired: "That gift code has expired.",
          max_uses_reached: "That gift code has reached its redemption limit.",
          already_redeemed: "You've already redeemed this code.",
          upgrade_failed: "Something went wrong applying the code. Please try again.",
          profile_create_failed: "We couldn't set up your profile. Please try again or email hello@createsuite.co.",
        };
        setError(
          reasonMap[gift?.reason || ""] ||
          "We couldn't apply that gift code. Double-check it, or remove it to continue."
        );
        setLoading(false);
        return;
      }

      // Track the referral if one was used. Don't block signup if
      // the track endpoint errors, but do log so we can catch it in
      // the admin error dashboard — otherwise a broken referrals row
      // is invisible until the Stripe webhook tries to fire on it.
      if (refCode && data.session?.access_token) {
        try {
          const trackRes = await fetch("/api/referrals/track", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.session.access_token}`,
            },
            body: JSON.stringify({
              referralCode: refCode.toUpperCase(),
            }),
          });
          if (!trackRes.ok) {
            const body = await trackRes.text().catch(() => "");
            logError({
              source: "signup.track-referral",
              message: `Track referral returned ${trackRes.status}`,
              metadata: { referredId: data.user.id, refCode, body: body.slice(0, 200) },
            });
          }
        } catch (e) {
          logError({
            source: "signup.track-referral",
            message: e instanceof Error ? e.message : "Unknown error",
            metadata: { referredId: data.user.id, refCode },
          });
        }
      }
    }

    // Gift code redemption now happens inside /api/signup/create-profile
    // (server-side, using the service role) — no client session required.
    // The result was already checked above and the client routed to
    // /onboarding?gift=1 on success, or surfaced the error and stopped.

    // If email confirmation is enabled on the Supabase project, signUp()
    // returns a user but NO session. Middleware-protected pages (like
    // /onboarding and /checkout) would then bounce the user to /login,
    // where login() fails with "Email not confirmed" — exactly the
    // broken loop Bri's friend hit. Detect that case and show a clear
    // "check your inbox" state instead of routing into the app.
    if (!data.session) {
      setLoading(false);
      setConfirmationSentTo(email);
      return;
    }

    // Session exists (auto-confirm is ON) — set the cookie explicitly
    // so middleware on the very next navigation sees an authed user.
    // Without this we'd race: router.push may fire before the auth
    // state change listener in the context sets the cookie, and the
    // user lands on /login unexpectedly.
    if (data.session.access_token) {
      setAuthCookie(data.session.access_token);
    }

    // Make sure auth context picks up the new profile row before we
    // route — otherwise the destination page runs with profile=null
    // and can bounce the user back to /login or show a skeleton forever.
    const refreshed = await refreshProfile?.();
    setLoading(false);

    // Route based on the ACTUAL profile tier (not the selected one).
    // If something upstream upgraded the profile (gift code, admin
    // grant, etc.) we must not send the user to Stripe checkout.
    const actualTier: AccountType =
      (refreshed?.account_type as AccountType | undefined) || accountType;
    const activeSub = refreshed?.subscription_status === "active";

    if (actualTier === "free" || activeSub || isAdmin(email)) {
      router.push("/onboarding");
    } else {
      // Paid tiers → go to checkout first. Always forward the
      // referral code (if any) so the discount banner renders and
      // the ref reaches Stripe metadata regardless of plan.
      const checkoutUrl = refCode
        ? `/checkout?plan=${actualTier}&ref=${refCode.toUpperCase()}`
        : `/checkout?plan=${actualTier}`;
      router.push(checkoutUrl);
    }
  }

  const labelClass =
    "font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#8AAABB] block mb-1.5";

  return (
    <div className="min-h-screen bg-[#FAF8F4] grid grid-cols-1 lg:grid-cols-2">
      {/* ─── LEFT: FORM ─── */}
      <div className="px-6 lg:px-16 py-12 lg:py-20 flex flex-col gap-7 justify-center max-w-[560px] w-full lg:ml-auto">
        {/* Brand */}
        <div className="font-serif text-[22px] tracking-[-0.01em] text-[#0F1E28]">
          Create<em className="italic text-[#3D6E8A]">Suite.</em>
        </div>

        {/* Referral banner (preserved) */}
        {refCode && (
          <div className="bg-gradient-to-r from-[#0F1E28] to-[#1b2f3a] rounded-[10px] p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <span className="text-[16px]">🎁</span>
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-sans text-white font-semibold">
                {referrerName ? `${referrerName} invited you!` : "You've been invited!"}
              </p>
              <p className="text-[11px] font-sans text-white/70">
                Get your first month of <strong>UGC + Influencer ($39/mo)</strong> for just $27 when you sign up.
              </p>
            </div>
          </div>
        )}

        <div className="section-num">
          <span>{step === "credentials" ? "Create your workspace" : "Pick a plan"}</span>
          <span className="line" />
        </div>

        {/* Headline — changes per step */}
        <h1
          className="font-serif font-normal text-[38px] sm:text-[50px] lg:text-[60px] leading-none tracking-[-0.02em] text-[#0F1E28] m-0"
          style={{ textWrap: "balance" as any }}
        >
          {step === "credentials" ? (
            <>
              Welcome to the
              <br />
              <em className="italic text-[#3D6E8A]">serious</em> part.
            </>
          ) : (
            <>
              Choose a <em className="italic text-[#3D6E8A]">plan</em>.
            </>
          )}
        </h1>

        {step === "credentials" && (
          <p className="text-[15px] text-[#4A6070] m-0 max-w-[40ch] leading-[1.5]">
            Two minutes, no card. Gmail stays read-only. You stay in control.
          </p>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5">
            <span className="text-red-500 text-sm">⚠</span>
            <p className="text-[13px] font-sans text-red-700 m-0">{error}</p>
          </div>
        )}

        {confirmationSentTo && (
          <div className="rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-4">
            <p className="text-[13px] font-sans text-emerald-900 m-0" style={{ fontWeight: 600 }}>
              Check your inbox
            </p>
            <p className="text-[12px] font-sans text-emerald-800 mt-1">
              We sent a confirmation link to <strong>{confirmationSentTo}</strong>. Click it to finish signing in — we&apos;ll drop you right into your workspace.
            </p>
          </div>
        )}

        {/* STEP 1 — CREDENTIALS */}
        {step === "credentials" && (
          <form onSubmit={handleCredentialsNext} className="flex flex-col gap-4">
            <div>
              <label className={labelClass}>Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Brianna Cole"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6+ characters"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Confirm</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  required
                  className={inputClass}
                />
              </div>
            </div>
            <label className="flex items-start gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-[1.5px] border-[#D8E8EE] text-[#7BAFC8] focus:ring-[#7BAFC8]/30"
              />
              <span className="text-[12px] font-sans text-[#4A6070] leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" target="_blank" className="text-[#3D6E8A] underline underline-offset-2">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" target="_blank" className="text-[#3D6E8A] underline underline-offset-2">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            <button
              type="submit"
              disabled={!agreedToTerms}
              className="inline-flex items-center justify-center gap-2 bg-[#0F1E28] text-white font-sans font-medium text-[14px] h-[48px] rounded-[8px] hover:bg-[#1b2f3a] transition-colors disabled:opacity-40 mt-2"
            >
              Continue →
            </button>
          </form>
        )}

        {/* STEP 2 — TIER PICKER */}
        {step === "tier" && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tierCards.map((tier) => (
                <button
                  key={tier.key}
                  onClick={() => setAccountType(tier.key)}
                  className={`text-left bg-white border rounded-[10px] p-5 transition-all ${
                    accountType === tier.key
                      ? "border-[#0F1E28] ring-[3px] ring-[#0F1E28]/10"
                      : "border-[#D8E8EE] hover:border-[#0F1E28]/30"
                  }`}
                >
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#8AAABB]">
                      {tier.name}
                    </span>
                    <span className="font-serif text-[22px] text-[#0F1E28] tracking-[-0.02em]">
                      {tier.price}
                    </span>
                  </div>
                  <p className="text-[13px] font-sans text-[#1A2C38] m-0 mb-3 font-medium">
                    {tier.tagline}
                  </p>
                  <div className="flex flex-col gap-1">
                    {tier.features.map((f) => (
                      <div key={f} className="flex items-start gap-1.5">
                        <span className="text-[#7BAFC8] text-xs">✓</span>
                        <span className="text-[11px] font-sans text-[#4A6070]">{f}</span>
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {/* Agency name — conditional */}
            {accountType === "agency" && (
              <div>
                <label className={labelClass}>Agency / Company name</label>
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="Bright Talent Mgmt"
                  className={inputClass}
                />
              </div>
            )}

            {/* Gift code */}
            {accountType && accountType !== "free" && (
              <div>
                {!showGiftCodeField ? (
                  <button
                    type="button"
                    onClick={() => setShowGiftCodeField(true)}
                    className="text-[12px] font-sans text-[#3D6E8A] underline underline-offset-2 hover:text-[#0F1E28]"
                  >
                    Have a gift code?
                  </button>
                ) : (
                  <div>
                    <label className={labelClass}>Gift code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={giftCode}
                        onChange={(e) => {
                          setGiftCode(e.target.value.toUpperCase().replace(/\s+/g, ""));
                          if (giftCheck.status !== "idle") setGiftCheck({ status: "idle" });
                        }}
                        placeholder="BRI-FREE"
                        className={`${inputClass} font-mono tracking-wider flex-1`}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={validateGiftCode}
                        disabled={!giftCode.trim() || giftCheck.status === "checking"}
                        className="px-4 h-[44px] rounded-[8px] bg-[#0F1E28] text-white text-[12.5px] font-sans font-medium hover:bg-[#1b2f3a] disabled:opacity-40"
                      >
                        {giftCheck.status === "checking" ? "Checking..." : "Check"}
                      </button>
                    </div>
                    {giftCheck.status === "valid" && (
                      <p className="text-[12px] font-sans text-emerald-700 mt-1.5">
                        ✓ Valid code — unlocks <strong>{giftCheck.planTier}</strong>
                        {giftCheck.durationMonths
                          ? ` for ${giftCheck.durationMonths} month${giftCheck.durationMonths === 1 ? "" : "s"}`
                          : " (lifetime)"}
                        . You&apos;ll skip checkout.
                      </p>
                    )}
                    {giftCheck.status === "invalid" && (
                      <p className="text-[12px] font-sans text-red-700 mt-1.5">⚠ {giftCheck.message}</p>
                    )}
                    <p className="text-[11px] font-sans text-[#8AAABB] mt-1.5">
                      Gift codes give you free access for a set period. You&apos;ll skip the payment step.{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setShowGiftCodeField(false);
                          setGiftCode("");
                          setGiftCheck({ status: "idle" });
                        }}
                        className="text-[#3D6E8A] underline underline-offset-2 hover:text-[#0F1E28]"
                      >
                        Remove
                      </button>
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setStep("credentials")}
                className="flex-1 bg-white text-[#1A2C38] border border-[#D8E8EE] h-[48px] rounded-[8px] text-[13.5px] font-sans font-medium hover:border-[#0F1E28]"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleSignUp}
                disabled={!accountType || loading}
                className="flex-[2] inline-flex items-center justify-center gap-2 bg-[#0F1E28] text-white font-sans font-medium text-[14px] h-[48px] rounded-[8px] hover:bg-[#1b2f3a] transition-colors disabled:opacity-40"
              >
                {loading ? "Creating account..." : "Create workspace →"}
              </button>
            </div>
          </div>
        )}

        <p className="text-[13px] font-sans text-[#8AAABB]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#3D6E8A] underline underline-offset-2 font-medium hover:text-[#0F1E28]">
            Sign in
          </Link>
        </p>
      </div>

      {/* ─── RIGHT: TESTIMONIAL (beige + radial gradient) ─── */}
      <div
        className="hidden lg:flex bg-[#F0EAE0] border-l border-[#E3DED2] px-16 py-20 flex-col gap-6 justify-center relative overflow-hidden"
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(60% 60% at 80% 20%, color-mix(in oklab, #7BAFC8 20%, transparent), transparent 70%)",
          }}
        />
        <div className="relative max-w-[480px]">
          <div className="signup-quote">
            Flagged a <em>perpetual IP</em> clause I would have signed without reading. That one catch paid for the tool for <em>three years</em>.
          </div>
        </div>
        <div className="relative flex items-center gap-3.5">
          <span
            className="inline-flex items-center justify-center w-11 h-11 rounded-full text-white text-[13px] font-medium"
            style={{ background: "linear-gradient(135deg, #7BAFC8, #3D6E8A)" }}
          >
            MH
          </span>
          <div>
            <div className="text-[14px] font-semibold text-[#1A2C38]">Maya Hayes</div>
            <div className="text-[12px] text-[#4A6070] font-mono tracking-wider mt-0.5">
              Beauty creator · 410K
            </div>
          </div>
        </div>
        <div className="signup-proof">
          <div>
            <div className="v">Unlimited</div>
            <div className="l">Deal pipeline</div>
          </div>
          <div>
            <div className="v">9 sec</div>
            <div className="l">Contract review</div>
          </div>
          <div>
            <div className="v">Read-only</div>
            <div className="l">Gmail access</div>
          </div>
        </div>
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
