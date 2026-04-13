"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Send, CheckCircle2, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate magic link send
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1500);
  };

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
            The operating system for creators
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="brianna@example.com"
                    required
                    className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500"
                  />
                </div>

                <Button className="w-full gap-2" type="submit" disabled={loading}>
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="h-4 w-4" /> Send magic link</>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  No password needed — we&apos;ll send you a secure login link.
                </p>
              </form>
            ) : (
              <div className="text-center py-4">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-serif font-semibold">Check your email</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  We sent a magic link to <span className="font-medium text-foreground">{email}</span>
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="text-sm text-terra-500 hover:text-terra-700 font-medium mt-4"
                >
                  Use a different email
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tiers */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-white p-3 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">UGC Creator</p>
            <p className="text-lg font-serif font-bold text-terra-600 mt-0.5">$27<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center">
            <p className="text-xs text-amber-700 uppercase tracking-wider font-medium">Influencer</p>
            <p className="text-lg font-serif font-bold text-amber-700 mt-0.5">$39<span className="text-xs font-normal text-amber-600">/mo</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
