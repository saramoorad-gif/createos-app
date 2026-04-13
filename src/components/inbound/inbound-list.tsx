"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  inboundInquiries,
  type InboundInquiry,
} from "@/lib/placeholder-data";
import { timeAgo } from "@/lib/utils";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  Eye,
  Sparkles,
  DollarSign,
  MessageSquareText,
  Copy,
  Check,
  Briefcase,
  Clock,
  Tag,
} from "lucide-react";

const statusConfig: Record<
  string,
  { label: string; variant: "success" | "warning" | "muted" | "destructive" | "brand" }
> = {
  new: { label: "New", variant: "brand" },
  reviewed: { label: "Reviewed", variant: "warning" },
  added_to_pipeline: { label: "In Pipeline", variant: "success" },
  declined: { label: "Declined", variant: "muted" },
};

const platformLabels: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
};

function InquiryCard({ inquiry }: { inquiry: InboundInquiry }) {
  const [status, setStatus] = useState(inquiry.status);
  const config = statusConfig[status];

  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden shadow-sm">
      {/* Gradient top border */}
      <div className="h-1 bg-gradient-to-r from-terra-500 to-amber-500" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="text-base font-serif font-semibold">
              {inquiry.brand_name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Via Work with me form · {timeAgo(inquiry.created_at)}
            </p>
          </div>
          <Badge variant={config.variant} className="text-xs">
            {status === "new" ? "New" : status === "reviewed" ? "Recent" : config.label}
          </Badge>
        </div>

        {/* Detail Pills */}
        <div className="flex flex-wrap items-center gap-1.5 my-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            <Briefcase className="h-3 w-3" />
            {inquiry.platforms_requested.length > 1 ? "Multi-platform" : platformLabels[inquiry.platforms_requested[0]]}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            <DollarSign className="h-3 w-3" />
            {inquiry.budget_range}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            <Tag className="h-3 w-3" />
            Lifestyle
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Flexible
          </span>
        </div>

        {/* Message */}
        <p className="text-sm text-foreground/80 italic leading-relaxed mb-4">
          &ldquo;{inquiry.message}&rdquo;
        </p>

        {/* Contact */}
        <p className="text-xs text-muted-foreground mb-4">
          {inquiry.contact_name} · {inquiry.contact_email}
        </p>

        {/* Actions */}
        {status === "new" && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setStatus("added_to_pipeline")}
            >
              <ArrowRight className="h-3.5 w-3.5" />
              Accept — create deal card
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5"
              onClick={() => {}}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Draft response
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => setStatus("declined")}
            >
              <XCircle className="h-3.5 w-3.5" />
              Decline
            </Button>
          </div>
        )}

        {status === "reviewed" && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setStatus("added_to_pipeline")}
            >
              <ArrowRight className="h-3.5 w-3.5" />
              Accept — create deal card
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Draft response
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => setStatus("declined")}
            >
              <XCircle className="h-3.5 w-3.5" />
              Decline
            </Button>
          </div>
        )}

        {status === "added_to_pipeline" && (
          <div className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium bg-emerald-50 rounded-lg px-3 py-2">
            <CheckCircle2 className="h-4 w-4" />
            Deal card created in pipeline — {inquiry.brand_name} added as Lead
          </div>
        )}

        {status === "declined" && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted rounded-lg px-3 py-2">
            <XCircle className="h-4 w-4" />
            Inquiry declined
          </div>
        )}
      </div>
    </div>
  );
}

function CaptureLink() {
  const [copied, setCopied] = useState(false);
  const url = "createos.co/work-with/briannacole";

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-terra-50">
              <MessageSquareText className="h-4 w-4 text-terra-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Your capture link</p>
              <p className="text-xs text-muted-foreground">
                Share this on your bio, email signature, or media kit
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <code className="rounded-md bg-muted px-3 py-1.5 text-xs font-mono text-foreground">
              {url}
            </code>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5"
              onClick={() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function InboundList() {
  const newCount = inboundInquiries.filter((i) => i.status === "new").length;

  return (
    <div className="space-y-4">
      {/* Success Banner */}
      <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
        <Eye className="h-4 w-4 text-emerald-600 flex-shrink-0" />
        <p className="text-sm text-emerald-800">
          <span className="font-semibold">Your media kit was viewed 24 times this week</span>{" "}
          — {inboundInquiries.length} inquiries received
        </p>
      </div>

      {/* Capture Link */}
      <CaptureLink />

      {/* Inquiry Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {inboundInquiries.map((inquiry) => (
          <InquiryCard key={inquiry.id} inquiry={inquiry} />
        ))}
      </div>
    </div>
  );
}
