"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Copy, Check, Users, DollarSign, X } from "lucide-react";

export function FoundingBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 via-amber-50/50 to-terra-50 px-5 py-4 overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-200/20 to-transparent rounded-bl-full" />
      <div className="flex items-center justify-between relative">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
            <Sparkles className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-amber-900">
                You&apos;re a founding creator
              </h3>
              <Badge className="bg-amber-200 text-amber-800 text-[10px]">
                #47 of 100
              </Badge>
            </div>
            <p className="text-sm text-amber-800 mt-0.5">
              <span className="font-serif font-bold text-amber-700">$27/mo</span> locked forever
              <span className="text-amber-600"> — you save $144/yr</span>
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-400 hover:text-amber-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function ReferralCard() {
  const [copied, setCopied] = useState(false);
  const referralCode = "BRIANNA-CREATE";

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-semibold">Refer & Earn</h3>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <code className="flex-1 rounded-md bg-muted px-3 py-1.5 text-xs font-mono text-foreground">
            {referralCode}
          </code>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 flex-shrink-0"
            onClick={() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-warm-100 p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Referred</span>
            </div>
            <p className="text-lg font-serif font-bold text-foreground">3</p>
          </div>
          <div className="rounded-lg bg-warm-100 p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <DollarSign className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Earned</span>
            </div>
            <p className="text-lg font-serif font-bold text-emerald-600">$45</p>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground mt-3">
          Share your code — referred creators get founding pricing if under 100 users.
          You earn $15 per referral.
        </p>
      </CardContent>
    </Card>
  );
}
