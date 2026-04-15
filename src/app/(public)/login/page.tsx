"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase, isSupabaseConfigured, setAuthCookie } from "@/lib/supabase";
import { logError } from "@/lib/error-logger";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [mode, setMode] = useState<"password" | "magic">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const inputClass =
    "w-full rounded-[10px] border border-[#D8E8EE] px-3 py-2.5 text-[13px] font-sans text-[#1A2C38] bg-white focus:outline-none focus:ring-2 focus:ring-[#7BAFC8]/20 focus:border-[#7BAFC8]";

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!isSupabaseConfigured()) {
      router.push(redirect);
      return;
    }

    setLoading(true);

    const sb = getSupabase();
    const { data: signInData, error: signInError } = await sb.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      // Log non-credential errors (credentials errors are user mistakes, not bugs)
      if (!signInError.message.includes("Invalid login credentials") && !signInError.message.includes("Email not confirmed")) {
        logError({
          source: "login.handlePasswordLogin",
          message: signInError.message,
          metadata: { email },
        });
      }
      if (signInError.message.includes("Invalid login credentials")) {
        setError("Wrong email or password. Please try again.");
      } else if (signInError.message.includes("Email not confirmed")) {
        setError(
          "Your email hasn't been verified yet. Check your inbox for a confirmation link."
        );
      } else {
        setError(signInError.message);
      }
      return;
    }

    // Set cookie so middleware allows access
    if (signInData.session?.access_token) {
      setAuthCookie(signInData.session.access_token);
    }

    router.push(redirect);
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!isSupabaseConfigured()) {
      setMagicLinkSent(true);
      return;
    }

    setLoading(true);

    const sb = getSupabase();
    const { error: magicError } = await sb.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}${redirect}`,
      },
    });

    setLoading(false);

    if (magicError) {
      setError(magicError.message);
      return;
    }

    setMagicLinkSent(true);
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-serif text-[#1A2C38]">
            create<em className="italic text-[#7BAFC8]">Suite</em>
          </h1>
          <p className="text-[13px] font-sans text-[#8AAABB] mt-1">
            Sign in to your creator dashboard
          </p>
        </div>

        <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-6">
          {/* Magic link sent state */}
          {magicLinkSent ? (
            <div className="text-center py-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-3">
                <span className="text-emerald-600 text-lg">&#10003;</span>
              </div>
              <h3 className="text-[18px] font-serif text-[#1A2C38]">
                Check your email
              </h3>
              <p className="text-[13px] font-sans text-[#8AAABB] mt-1">
                We sent a magic link to{" "}
                <span className="font-medium text-[#1A2C38]">{email}</span>
              </p>
              <button
                onClick={() => {
                  setMagicLinkSent(false);
                  setMode("password");
                }}
                className="text-[13px] font-sans text-[#7BAFC8] hover:underline font-medium mt-4"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              {/* Mode toggle */}
              <div className="flex rounded-[10px] bg-[#FAF8F4] p-1 mb-5">
                <button
                  onClick={() => {
                    setMode("password");
                    setError("");
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[13px] font-sans font-medium transition-colors ${
                    mode === "password"
                      ? "bg-white text-[#1A2C38] shadow-sm border border-[#D8E8EE]"
                      : "text-[#8AAABB]"
                  }`}
                >
                  Password
                </button>
                <button
                  onClick={() => {
                    setMode("magic");
                    setError("");
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[13px] font-sans font-medium transition-colors ${
                    mode === "magic"
                      ? "bg-white text-[#1A2C38] shadow-sm border border-[#D8E8EE]"
                      : "text-[#8AAABB]"
                  }`}
                >
                  Magic link
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5 mb-4">
                  <span className="text-red-500 flex-shrink-0 text-sm">&#9888;</span>
                  <p className="text-[13px] font-sans text-red-700">{error}</p>
                </div>
              )}

              {/* Password mode */}
              {mode === "password" && (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div>
                    <label className="text-[12px] font-sans font-medium text-[#1A2C38] block mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="text-[12px] font-sans font-medium text-[#1A2C38] block mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Your password"
                      required
                      className={inputClass}
                    />
                  </div>

                  <button
                    className="w-full bg-[#7BAFC8] text-white font-sans font-medium text-[13px] py-2.5 rounded-[10px] hover:bg-[#6AA0BB] transition-colors disabled:opacity-50"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign in"}
                  </button>
                </form>
              )}

              {/* Magic link mode */}
              {mode === "magic" && (
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div>
                    <label className="text-[12px] font-sans font-medium text-[#1A2C38] block mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className={inputClass}
                    />
                  </div>

                  <button
                    className="w-full bg-[#7BAFC8] text-white font-sans font-medium text-[13px] py-2.5 rounded-[10px] hover:bg-[#6AA0BB] transition-colors disabled:opacity-50"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Email me a login link"}
                  </button>

                  <p className="text-[11px] text-center font-sans text-[#8AAABB]">
                    No password needed — we&apos;ll send you a secure login link.
                  </p>
                </form>
              )}
            </>
          )}
        </div>

        <p className="text-[13px] text-center font-sans text-[#8AAABB] mt-4">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-[#7BAFC8] hover:underline font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
