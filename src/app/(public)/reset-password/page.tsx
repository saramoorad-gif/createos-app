"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { logError } from "@/lib/error-logger";

// Supabase redirects here after the user clicks the reset-password email link.
// The URL contains a recovery token in the hash fragment (#access_token=...).
// The supabase-js client automatically picks it up when the page mounts and
// calls onAuthStateChange('PASSWORD_RECOVERY'), which puts the user into a
// temporary authenticated state that lets them update their own password.

function ResetPasswordContent() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  const inputClass =
    "w-full rounded-[10px] border border-[#D8E8EE] px-3 py-2.5 text-[13px] font-sans text-[#1A2C38] bg-white focus:outline-none focus:ring-2 focus:ring-[#7BAFC8]/20 focus:border-[#7BAFC8]";

  // Wait for supabase-js to parse the recovery token out of the URL hash
  // before letting the user submit the form.
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setReady(true);
      return;
    }
    const sb = getSupabase();
    const { data: { subscription } } = sb.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });
    // Also check the current session — if the recovery token was already parsed
    // (e.g. on a fast reload), onAuthStateChange may not fire again.
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    if (!isSupabaseConfigured()) {
      setDone(true);
      return;
    }

    setLoading(true);
    const sb = getSupabase();
    const { error: updateError } = await sb.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      logError({
        source: "reset-password.handleSubmit",
        message: updateError.message,
      });
      if (updateError.message.includes("same_password")) {
        setError("That's your current password. Please choose a different one.");
      } else if (updateError.message.includes("session")) {
        setError("Your reset link has expired. Please request a new one.");
      } else {
        setError(updateError.message);
      }
      return;
    }

    setDone(true);
    // Give the user a moment to read the confirmation, then bounce to dashboard.
    setTimeout(() => router.push("/dashboard"), 2000);
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-serif text-[#1A2C38]">
            create<em className="italic text-[#7BAFC8]">Suite</em>
          </h1>
          <p className="text-[13px] font-sans text-[#8AAABB] mt-1">
            Choose a new password
          </p>
        </div>

        <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-6">
          {done ? (
            <div className="text-center py-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-3">
                <span className="text-emerald-600 text-lg">&#10003;</span>
              </div>
              <h3 className="text-[18px] font-serif text-[#1A2C38]">Password updated</h3>
              <p className="text-[13px] font-sans text-[#8AAABB] mt-1">
                Taking you to your dashboard…
              </p>
            </div>
          ) : !ready ? (
            <div className="text-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#D8E8EE] border-t-[#7BAFC8] mx-auto mb-3" />
              <p className="text-[13px] font-sans text-[#8AAABB]">
                Verifying reset link…
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5">
                  <span className="text-red-500 flex-shrink-0 text-sm">&#9888;</span>
                  <p className="text-[13px] font-sans text-red-700">{error}</p>
                </div>
              )}

              <div>
                <label className="text-[12px] font-sans font-medium text-[#1A2C38] block mb-1.5">
                  New password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  autoFocus
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-[12px] font-sans font-medium text-[#1A2C38] block mb-1.5">
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  required
                  className={inputClass}
                />
              </div>

              <button
                className="w-full bg-[#7BAFC8] text-white font-sans font-medium text-[13px] py-2.5 rounded-[10px] hover:bg-[#6AA0BB] transition-colors disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading ? "Updating…" : "Update password"}
              </button>
            </form>
          )}
        </div>

        <p className="text-[13px] text-center font-sans text-[#8AAABB] mt-4">
          <Link href="/login" className="text-[#7BAFC8] hover:underline font-medium">
            &larr; Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
          <p className="text-[14px] font-sans text-[#8AAABB]">Loading…</p>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
