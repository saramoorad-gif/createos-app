"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { inboxEmails, type InboxEmail } from "@/lib/placeholder-data";
import { timeAgo } from "@/lib/utils";
import {
  Mail,
  Star,
  StarOff,
  PlusCircle,
  Check,
  Filter,
  Sparkles,
  FileSearch,
  CreditCard,
} from "lucide-react";

function EmailRow({ email }: { email: InboxEmail }) {
  const [starred, setStarred] = useState(email.is_starred);
  const [addedToPipeline, setAddedToPipeline] = useState(false);

  return (
    <div
      className={`flex items-start gap-3 p-4 hover:bg-warm-100 transition-colors cursor-pointer relative ${
        !email.is_read ? "bg-warm-100/50" : ""
      }`}
    >
      {/* Unread left border */}
      {!email.is_read && (
        <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-terra-500" />
      )}

      {/* Star */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setStarred(!starred);
        }}
        className="mt-0.5 flex-shrink-0"
      >
        {starred ? (
          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
        ) : (
          <StarOff className="h-4 w-4 text-muted-foreground/30 hover:text-amber-400" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className={`text-sm ${
              !email.is_read
                ? "font-semibold text-foreground"
                : "font-medium text-foreground"
            }`}
          >
            {email.from_name}
          </span>

          {/* Provider Badge */}
          <Badge
            variant={email.provider === "gmail" ? "warning" : "platform"}
            className="text-[10px] px-1.5 py-0 uppercase tracking-wider"
          >
            {email.provider === "gmail" ? "Gmail" : "Outlook"}
          </Badge>

          {!email.is_read && (
            <div className="h-1.5 w-1.5 rounded-full bg-terra-500 flex-shrink-0" />
          )}
        </div>

        <p
          className={`text-sm ${
            !email.is_read ? "font-medium text-foreground" : "text-foreground"
          } truncate`}
        >
          {email.subject}
        </p>

        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
          {email.preview}
        </p>

        {/* Actions row */}
        <div className="flex items-center gap-2 mt-2">
          {email.is_brand_deal && email.brand_name && (
            <>
              {!addedToPipeline ? (
                <Button
                  size="sm"
                  className="h-7 text-xs gap-1 px-2.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAddedToPipeline(true);
                  }}
                >
                  <PlusCircle className="h-3 w-3" />
                  Add to pipeline
                </Button>
              ) : (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 rounded-md px-2.5 py-1">
                  <Check className="h-3 w-3" />
                  Added
                </span>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs gap-1 px-2.5"
                onClick={(e) => e.stopPropagation()}
              >
                <Sparkles className="h-3 w-3" />
                AI scan brief
              </Button>
            </>
          )}
          {!email.is_brand_deal && email.subject.toLowerCase().includes("contract") && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs gap-1 px-2.5"
              onClick={(e) => e.stopPropagation()}
            >
              <FileSearch className="h-3 w-3" />
              Analyze contract
            </Button>
          )}
          {!email.is_brand_deal && email.subject.toLowerCase().includes("invoice") && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs gap-1 px-2.5"
              onClick={(e) => e.stopPropagation()}
            >
              <CreditCard className="h-3 w-3" />
              Mark invoice paid
            </Button>
          )}
        </div>
      </div>

      {/* Right side — timestamp + brand deal badge */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span className="text-xs text-muted-foreground">
          {timeAgo(email.received_at)}
        </span>
        {email.is_brand_deal && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
            <Sparkles className="h-2.5 w-2.5" />
            Brand deal detected
          </span>
        )}
      </div>
    </div>
  );
}

export function InboxList() {
  const allEmails = inboxEmails;
  const gmailEmails = inboxEmails.filter((e) => e.provider === "gmail");
  const outlookEmails = inboxEmails.filter((e) => e.provider === "outlook");
  const brandEmails = inboxEmails.filter((e) => e.is_brand_deal);
  const unreadCount = inboxEmails.filter((e) => !e.is_read).length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {unreadCount} unread · {brandEmails.length} brand deals detected
              </span>
            </div>
            <Button variant="outline" size="sm" className="h-8 gap-1.5">
              <Filter className="h-3.5 w-3.5" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          <Tabs defaultValue="all">
            <div className="px-6 pb-3">
              <TabsList>
                <TabsTrigger value="all">All ({allEmails.length})</TabsTrigger>
                <TabsTrigger value="gmail">Gmail ({gmailEmails.length})</TabsTrigger>
                <TabsTrigger value="outlook">Outlook ({outlookEmails.length})</TabsTrigger>
                <TabsTrigger value="pipeline">Added to Pipeline</TabsTrigger>
              </TabsList>
            </div>

            <Separator />

            <TabsContent value="all" className="m-0">
              <div className="divide-y divide-border">
                {allEmails.map((email) => (
                  <EmailRow key={email.id} email={email} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="gmail" className="m-0">
              <div className="divide-y divide-border">
                {gmailEmails.map((email) => (
                  <EmailRow key={email.id} email={email} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="outlook" className="m-0">
              <div className="divide-y divide-border">
                {outlookEmails.map((email) => (
                  <EmailRow key={email.id} email={email} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pipeline" className="m-0">
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  Emails you add to the pipeline will appear here.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* AI Insight Strip */}
      <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50/70 px-4 py-3">
        <Sparkles className="h-4 w-4 text-amber-600 flex-shrink-0" />
        <p className="text-sm text-amber-900">
          <span className="font-semibold">AI Insight:</span>{" "}
          3 brand deal emails this week — 40% above your monthly average. Consider batching responses to negotiate better rates.
        </p>
      </div>
    </div>
  );
}
