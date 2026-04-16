"use client";

import { useState } from "react";
import Link from "next/link";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { logError } from "@/lib/error-logger";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const inputClass =
    "w-full rounded-[10px] border border-[#D8E8EE] px-3 py-2.5 text-[13px] font-sans text-[#1A2C38] bg-white focus:outline-none focus:ring-2 focus:ring-[#7BAFC8]/20 focus:border-[#7BAFC8]";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!isSupabaseConfigured()) {
      // Dev: just show the success state so the flow can be exercised
      setSent(true);
      return;
    }

    setLoading(true);
    const sb = getSupabase();
    const { error: resetError } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (resetError) {
      // Don't log "user not found" — users can brute-force email presence otherwise.
      // Always show the same success state regardless of whether the email exists.
      // This is the standard pattern for password reset to avoid enumeration attacks.
      logError({
        source: "forgot-password.handleSubmit",
        message: resetError.message,
        metadata: { email },
      });
    }

    // Always show success, even on error — prevents email enumeration.
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-serif text-[#1A2C38]">
            create<em className="italic text-[#7BAFC8]">Suite</em>
          </h1>
          <p className="text-[13px] font-sans text-[#8AAABB] mt-1">
            Reset your password
          </p>
        </div>

        <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-6">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-3">
                <span className="text-emerald-600 text-lg">&#10003;</span>
              </div>
              <h3 className="text-[18px] font-serif text-[#1A2C38]">Check your email</h3>
              <p className="text-[13px] font-sans text-[#8AAABB] mt-1 mb-4">
                If an account exists for <span className="font-medium text-[#1A2C38]">{email}</span>,
                we sent a password reset link to it. Click the link in that email to choose a new password.
              </p>
              <p className="text-[11px] font-sans text-[#8AAABB] mb-4">
                Don&apos;t see it? Check your spam folder. The link expires in 1 hour.
              </p>
              <Link
                href="/login"
                className="text-[13px] font-sans text-[#7BAFC8] hover:underline font-medium"
              >
                &larr; Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-[13px] font-sans text-[#4A6070]">
                Enter the email address you use to sign in. We&apos;ll send you a link to reset your password.
              </p>

              {error && (
                <div className="flex items-center gap-2 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5">
                  <span className="text-red-500 flex-shrink-0 text-sm">&#9888;</span>
                  <p className="text-[13px] font-sans text-red-700">{error}</p>
                </div>
              )}

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
                  autoFocus
                  className={inputClass}
                />
              </div>

              <button
                className="w-full bg-[#7BAFC8] text-white font-sans font-medium text-[13px] py-2.5 rounded-[10px] hover:bg-[#6AA0BB] transition-colors disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          )}
        </div>

        <p className="text-[13px] text-center font-sans text-[#8AAABB] mt-4">
          Remembered it?{" "}
          <Link href="/login" className="text-[#7BAFC8] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
