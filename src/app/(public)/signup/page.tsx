"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

type AccountType = "ugc" | "influencer" | "agency";

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("ugc");
  const [agencyName, setAgencyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputClass =
    "w-full rounded-[10px] border border-[#E5E0D8] px-3 py-2.5 text-[13px] font-sans text-[#1C1714] bg-white focus:outline-none focus:ring-2 focus:ring-[#C4714A]/20 focus:border-[#C4714A]";

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!isSupabaseConfigured()) {
      router.push("/onboarding");
      return;
    }

    setLoading(true);

    const sb = getSupabase();
    const { data, error: signUpError } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          account_type: accountType,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

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
    router.push("/onboarding");
  }

  return (
    <div className="min-h-screen bg-[#F7F4EF] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-serif text-[#1C1714]">
            create<em className="italic text-[#C4714A]">OS</em>
          </h1>
          <p className="text-[13px] font-sans text-[#9A9088] mt-1">
            Create your creator business account
          </p>
        </div>

        <div className="bg-white border border-[#E5E0D8] rounded-[10px] p-6">
          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5">
                <span className="text-red-500 flex-shrink-0 text-sm">&#9888;</span>
                <p className="text-[13px] font-sans text-red-700">{error}</p>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="text-[12px] font-sans font-medium text-[#1C1714] block mb-1.5">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Brianna Cole"
                required
                className={inputClass}
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-[12px] font-sans font-medium text-[#1C1714] block mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="brianna@example.com"
                required
                className={inputClass}
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-[12px] font-sans font-medium text-[#1C1714] block mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className={inputClass}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-[12px] font-sans font-medium text-[#1C1714] block mb-1.5">
                Confirm password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                className={inputClass}
              />
            </div>

            {/* Account Type */}
            <div>
              <label className="text-[12px] font-sans font-medium text-[#1C1714] block mb-1.5">
                I am a...
              </label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as AccountType)}
                className={inputClass}
              >
                <option value="ugc">UGC Creator</option>
                <option value="influencer">Influencer</option>
                <option value="agency">Agency</option>
              </select>
            </div>

            {/* Agency Name — conditional */}
            {accountType === "agency" && (
              <div>
                <label className="text-[12px] font-sans font-medium text-[#1C1714] block mb-1.5">
                  Agency / Company name
                </label>
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="Your agency name"
                  required
                  className={inputClass}
                />
              </div>
            )}

            <button
              className="w-full bg-[#C4714A] text-white font-sans font-medium text-[13px] py-2.5 rounded-[10px] hover:bg-[#B5633E] transition-colors disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-[13px] text-center font-sans text-[#9A9088] mt-4">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#C4714A] hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
