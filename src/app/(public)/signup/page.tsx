"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Sparkles, UserPlus, Loader2, AlertCircle } from "lucide-react";

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
    "w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 bg-white";

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
      // Demo mode — just redirect
      router.push("/onboarding");
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
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

    // Create profile record
    if (data.user) {
      await supabase.from("profiles").insert({
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
    <div className="min-h-screen bg-warm-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-terra-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground">
            create<span className="italic text-terra-500">OS</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create your creator business account
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
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
                <label className="text-sm font-medium text-foreground block mb-1.5">
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
                <label className="text-sm font-medium text-foreground block mb-1.5">
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
                <label className="text-sm font-medium text-foreground block mb-1.5">
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
                <label className="text-sm font-medium text-foreground block mb-1.5">
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
                  <label className="text-sm font-medium text-foreground block mb-1.5">
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

              <Button
                className="w-full gap-2"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Creating
                    account...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" /> Create account
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-sm text-center text-muted-foreground mt-4">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-terra-500 hover:text-terra-700 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
