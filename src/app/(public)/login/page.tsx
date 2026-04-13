"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  Sparkles,
  LogIn,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Mail,
  KeyRound,
} from "lucide-react";

export default function LoginPage() {
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
    "w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 bg-white";

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!isSupabaseConfigured()) {
      router.push(redirect);
      return;
    }

    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
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

    const { error: magicError } = await supabase.auth.signInWithOtp({
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
    <div className="min-h-screen bg-warm-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
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
            Sign in to your creator dashboard
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            {/* Magic link sent state */}
            {magicLinkSent ? (
              <div className="text-center py-4">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-serif font-semibold">
                  Check your email
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  We sent a magic link to{" "}
                  <span className="font-medium text-foreground">{email}</span>
                </p>
                <button
                  onClick={() => {
                    setMagicLinkSent(false);
                    setMode("password");
                  }}
                  className="text-sm text-terra-500 hover:text-terra-700 font-medium mt-4"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <>
                {/* Mode toggle */}
                <div className="flex rounded-lg bg-muted p-1 mb-5">
                  <button
                    onClick={() => {
                      setMode("password");
                      setError("");
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      mode === "password"
                        ? "bg-white text-foreground shadow-sm"
                        : "text-muted-foreground"
                    }`}
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    Password
                  </button>
                  <button
                    onClick={() => {
                      setMode("magic");
                      setError("");
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      mode === "magic"
                        ? "bg-white text-foreground shadow-sm"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Magic link
                  </button>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 mb-4">
                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Password mode */}
                {mode === "password" && (
                  <form onSubmit={handlePasswordLogin} className="space-y-4">
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

                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1.5">
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

                    <Button
                      className="w-full gap-2"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Signing
                          in...
                        </>
                      ) : (
                        <>
                          <LogIn className="h-4 w-4" /> Sign in
                        </>
                      )}
                    </Button>
                  </form>
                )}

                {/* Magic link mode */}
                {mode === "magic" && (
                  <form onSubmit={handleMagicLink} className="space-y-4">
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

                    <Button
                      className="w-full gap-2"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />{" "}
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" /> Email me a login link
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      No password needed — we&apos;ll send you a secure login
                      link.
                    </p>
                  </form>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-sm text-center text-muted-foreground mt-4">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-terra-500 hover:text-terra-700 font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
