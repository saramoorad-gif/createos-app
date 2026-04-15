"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useSupabaseQuery, useSupabaseMutation } from "@/lib/hooks";
import { useAuth } from "@/contexts/auth-context";
import { timeAgo } from "@/lib/utils";
import { useToast } from "@/components/global/toast";
import { TableSkeleton } from "@/components/global/skeleton";
import { Send, Paperclip, Flag, CheckCircle2, Mail, MessageSquare, ListTodo, Megaphone, FileText, RefreshCw, ExternalLink, Sparkles, Plus, DollarSign, ArrowRight, Zap } from "lucide-react";

interface MessageThread {
  id: string;
  agencyId: string;
  creatorId: string | null;
  creatorName: string | null;
  creatorAvatar: string | null;
  topic: string;
  threadType: "creator_facing" | "internal" | "brand_log";
  lastMessageAt: string;
  unreadAgency: number;
  unreadCreator: number;
}

interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderType: "creator" | "agency_user";
  body: string;
  attachments: { name: string; type: string }[];
  linkedObjectType: "deal" | "invoice" | "contract" | "campaign" | null;
  linkedObjectName: string | null;
  isInternal: boolean;
  isUrgent: boolean;
  readAt: string | null;
  createdAt: string;
}

interface GmailEmail {
  id: string;
  from: string;
  subject: string;
  date: string;
  snippet: string;
}

interface DetectedDeal {
  brand_name: string;
  estimated_value: number;
  deliverables: string;
  platform: "tiktok" | "instagram" | "youtube" | null;
  notes: string;
  email_id: string;
  email_subject: string;
  email_from: string;
  confidence: "high" | "medium" | "low";
}

const confidenceColors = {
  high: "bg-[#E8F4EE] text-[#3D7A58]",
  medium: "bg-[#FFF8E8] text-[#A07830]",
  low: "bg-[#F2F8FB] text-[#8AAABB]",
};

function parseEmailFrom(from: string): { name: string; email: string } {
  const match = from.match(/^"?([^"<]*)"?\s*<?([^>]*)>?$/);
  if (match) return { name: match[1].trim() || match[2], email: match[2] || from };
  return { name: from, email: from };
}

function formatEmailDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return d.toLocaleDateString("en-US", { weekday: "short" });
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

export default function CreatorInboxPage() {
  const { user, profile } = useAuth();
  const { insert: insertMessage } = useSupabaseMutation("messages");
  const { data: allThreads, loading: threadsLoading } = useSupabaseQuery<MessageThread>("message_threads");
  const { data: allMessages, loading: messagesLoading } = useSupabaseQuery<Message>("messages");
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [view, setView] = useState<"messages" | "gmail" | "tasks" | "announcements">("messages");

  // Gmail state
  const [emails, setEmails] = useState<GmailEmail[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<GmailEmail | null>(null);
  const [gmailError, setGmailError] = useState<string | null>(null);

  // AI Deal Scanner state
  const [detectedDeals, setDetectedDeals] = useState<DetectedDeal[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [creatingDeal, setCreatingDeal] = useState<string | null>(null);
  const [createdDeals, setCreatedDeals] = useState<Set<string>>(new Set());

  // Deal review modal state
  const [reviewDeal, setReviewDeal] = useState<DetectedDeal | null>(null);
  const [formBrand, setFormBrand] = useState("");
  const [formValue, setFormValue] = useState("");
  const [formDeliverables, setFormDeliverables] = useState("");
  const [formPlatform, setFormPlatform] = useState("");
  const [formStage, setFormStage] = useState("lead");
  const [formNotes, setFormNotes] = useState("");

  const { toast } = useToast();
  const loading = threadsLoading || messagesLoading;

  const isGmailConnected = !!(profile as any)?.google_connected;

  // Auto-switch to gmail tab if connected and no internal messages
  useEffect(() => {
    if (isGmailConnected && !loading && allThreads.filter(t => t.threadType === "creator_facing").length === 0) {
      setView("gmail");
    }
  }, [isGmailConnected, loading, allThreads]);

  // Fetch Gmail emails
  async function fetchGmail() {
    if (!user) return;
    setEmailsLoading(true);
    setGmailError(null);
    try {
      const res = await fetch(`/api/gmail?userId=${user.id}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch emails");
      }
      const data = await res.json();
      setEmails(data);
    } catch (err: any) {
      setGmailError(err.message);
      console.error("Gmail fetch error:", err);
    } finally {
      setEmailsLoading(false);
    }
  }

  // AI scan emails for deals
  async function scanForDeals() {
    if (!user) return;
    setScanning(true);
    setScanComplete(false);
    try {
      const res = await fetch("/api/gmail/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!res.ok) throw new Error("Scan failed");
      const data = await res.json();
      setDetectedDeals(data.deals || []);
      setScanComplete(true);
      if (data.deals?.length > 0) {
        toast("success", `Found ${data.deals.length} potential deal${data.deals.length > 1 ? "s" : ""} in your emails`);
      } else {
        toast("info", "No deal opportunities detected in recent emails");
      }
    } catch (err) {
      console.error("Scan error:", err);
      toast("error", "Failed to scan emails");
    } finally {
      setScanning(false);
    }
  }

  // Open review modal with AI-detected data pre-filled
  function openDealReview(deal: DetectedDeal) {
    setReviewDeal(deal);
    setFormBrand(deal.brand_name || "");
    setFormValue(deal.estimated_value ? String(deal.estimated_value) : "");
    setFormDeliverables(deal.deliverables || "");
    setFormPlatform(deal.platform || "");
    setFormStage("lead");
    setFormNotes(deal.notes || "");
  }

  // Create deal after user reviews/edits
  async function submitDeal() {
    if (!user || !reviewDeal) return;
    if (!formBrand.trim()) { toast("error", "Brand name is required"); return; }

    setCreatingDeal(reviewDeal.email_id);
    try {
      const res = await fetch("/api/gmail/create-deal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          brand_name: formBrand.trim(),
          estimated_value: parseFloat(formValue) || 0,
          deliverables: formDeliverables.trim(),
          platform: formPlatform || null,
          stage: formStage,
          notes: formNotes.trim(),
          email_subject: reviewDeal.email_subject,
          email_from: reviewDeal.email_from,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        console.error("Create deal failed:", result);
        throw new Error(result.error || "Failed to create deal");
      }
      setCreatedDeals(prev => new Set(prev).add(reviewDeal.email_id));
      toast("success", `Deal "${formBrand.trim()}" added to your pipeline`);
      setReviewDeal(null);
    } catch (err: any) {
      console.error("Create deal error:", err);
      toast("error", err.message || "Failed to create deal");
    } finally {
      setCreatingDeal(null);
    }
  }

  // Load Gmail on tab switch
  useEffect(() => {
    if (view === "gmail" && isGmailConnected && emails.length === 0 && !emailsLoading) {
      fetchGmail();
    }
  }, [view, isGmailConnected]);

  if (loading) return <TableSkeleton rows={5} cols={3} />;

  const myThreads = allThreads.filter((t) => t.threadType === "creator_facing");
  const unreadCount = myThreads.reduce((s, t) => s + t.unreadCreator, 0);

  const threadMessages = activeThread
    ? allMessages.filter((m) => m.threadId === activeThread && !m.isInternal)
    : [];

  async function handleSendMessage() {
    if (!newMessage.trim() || !activeThread || !user) return;
    try {
      await insertMessage({
        thread_id: activeThread,
        sender_id: user.id,
        sender_type: "creator",
        body: newMessage.trim(),
        is_internal: false,
      });
      setNewMessage("");
      toast("success", "Message sent");
    } catch (e) {
      console.error("Failed to send message:", e);
    }
  }

  const viewTabs = [
    { key: "messages" as const, label: "Messages", icon: MessageSquare, count: unreadCount },
    { key: "gmail" as const, label: "Gmail", icon: Mail, count: emails.length },
    { key: "tasks" as const, label: "Tasks", icon: ListTodo },
    { key: "announcements" as const, label: "Updates", icon: Megaphone },
  ];

  return (
    <div>
      <PageHeader
        headline={<>Your <em className="italic text-[#7BAFC8]">inbox</em></>}
        subheading="Messages, emails, and updates in one place."
        stats={[
          { value: String(unreadCount), label: "Unread" },
          { value: String(myThreads.length + emails.length), label: "Total" },
        ]}
      />

      {/* View toggle */}
      <div className="flex items-center gap-1 mb-6">
        {viewTabs.map((v) => (
          <button
            key={v.key}
            onClick={() => { setView(v.key); setActiveThread(null); setSelectedEmail(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-sans uppercase tracking-[1.5px] rounded-full transition-colors ${
              view === v.key ? "bg-[#1A2C38] text-[#FAF8F4]" : "text-[#8AAABB] hover:bg-[#F2F8FB]"
            }`}
            style={{ fontWeight: 500 }}
          >
            <v.icon className="h-3 w-3" />
            {v.label}
            {v.count && v.count > 0 ? (
              <span className={`ml-0.5 inline-flex items-center justify-center h-[14px] min-w-[14px] rounded-full text-[9px] px-1 ${
                view === v.key ? "bg-[#FAF8F4]/20 text-[#FAF8F4]" : "bg-[#7BAFC8]/10 text-[#7BAFC8]"
              }`} style={{ fontWeight: 600 }}>{v.count}</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* ─── Gmail View ─────────────────────────────────── */}
      {view === "gmail" && (
        <>
          {!isGmailConnected ? (
            <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-12 text-center">
              <div className="h-14 w-14 rounded-full bg-[#F2F8FB] border border-[#D8E8EE] mx-auto mb-4 flex items-center justify-center">
                <Mail className="h-6 w-6 text-[#7BAFC8]" />
              </div>
              <h3 className="text-[18px] font-serif text-[#1A2C38] mb-2">Connect Gmail</h3>
              <p className="text-[13px] font-sans text-[#8AAABB] mb-5 max-w-sm mx-auto">
                See your latest emails right here — detect brand inquiries, follow up on deals, and never miss an opportunity.
              </p>
              <a
                href="/integrations"
                className="inline-flex items-center gap-2 bg-[#1E3F52] text-white rounded-[8px] px-5 py-2.5 text-[13px] font-sans hover:bg-[#2a5269] transition-colors"
                style={{ fontWeight: 600 }}
              >
                <Mail className="h-4 w-4" /> Connect Gmail
              </a>
            </div>
          ) : emailsLoading ? (
            <TableSkeleton rows={6} cols={3} />
          ) : gmailError ? (
            <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-12 text-center">
              <p className="text-[14px] font-sans text-[#A03D3D] mb-3">Failed to load emails: {gmailError}</p>
              <button onClick={fetchGmail} className="text-[13px] font-sans text-[#7BAFC8] hover:underline" style={{ fontWeight: 500 }}>Try again →</button>
            </div>
          ) : emails.length === 0 ? (
            <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-12 text-center">
              <p className="text-[16px] font-serif italic text-[#8AAABB]">Your inbox is empty</p>
            </div>
          ) : (<>
            {/* AI Deal Scanner Banner */}
            <div className="mb-4 bg-gradient-to-r from-[#1E3F52] to-[#2a5269] rounded-[10px] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center">
                  <Sparkles className="h-4.5 w-4.5 text-[#7BAFC8]" />
                </div>
                <div>
                  <p className="text-[13px] font-sans text-white" style={{ fontWeight: 600 }}>AI Deal Scanner</p>
                  <p className="text-[11px] font-sans text-white/60">
                    {scanComplete
                      ? `${detectedDeals.length} deal${detectedDeals.length !== 1 ? "s" : ""} detected in ${emails.length} emails`
                      : "Scan your emails to automatically detect brand deal opportunities"}
                  </p>
                </div>
              </div>
              <button
                onClick={scanForDeals}
                disabled={scanning}
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white rounded-[8px] px-4 py-2 text-[12px] font-sans transition-colors disabled:opacity-50"
                style={{ fontWeight: 600 }}
              >
                {scanning ? (
                  <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Scanning...</>
                ) : scanComplete ? (
                  <><RefreshCw className="h-3.5 w-3.5" /> Scan again</>
                ) : (
                  <><Zap className="h-3.5 w-3.5" /> Scan for deals</>
                )}
              </button>
            </div>

            {/* Detected Deals */}
            {detectedDeals.length > 0 && (
              <div className="mb-4 space-y-2">
                <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-2" style={{ fontWeight: 600 }}>
                  DETECTED OPPORTUNITIES
                </p>
                {detectedDeals.map((deal) => {
                  const isCreated = createdDeals.has(deal.email_id);
                  const isCreating = creatingDeal === deal.email_id;
                  return (
                    <div key={deal.email_id} className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-4 flex items-center gap-4 hover:border-[#7BAFC8] transition-colors">
                      <div className="h-10 w-10 rounded-full bg-[#F2F8FB] border border-[#D8E8EE] flex items-center justify-center flex-shrink-0">
                        <span className="text-[14px] font-serif text-[#7BAFC8]">{deal.brand_name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[14px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>{deal.brand_name}</span>
                          <span className={`text-[9px] font-sans uppercase tracking-[1.5px] px-1.5 py-0.5 rounded-full ${confidenceColors[deal.confidence]}`} style={{ fontWeight: 600 }}>
                            {deal.confidence}
                          </span>
                          {deal.platform && (
                            <span className="text-[9px] font-mono text-[#8AAABB] border border-[#D8E8EE] rounded px-1.5 py-0.5">{deal.platform}</span>
                          )}
                        </div>
                        <p className="text-[12px] font-sans text-[#4A6070] truncate">{deal.notes || deal.email_subject}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {deal.estimated_value > 0 && (
                            <span className="flex items-center gap-1 text-[11px] font-mono text-[#3D7A58]">
                              <DollarSign className="h-3 w-3" />{deal.estimated_value.toLocaleString()}
                            </span>
                          )}
                          {deal.deliverables && (
                            <span className="text-[11px] font-sans text-[#8AAABB]">{deal.deliverables}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {isCreated ? (
                          <span className="flex items-center gap-1.5 text-[12px] font-sans text-[#3D7A58]" style={{ fontWeight: 500 }}>
                            <CheckCircle2 className="h-4 w-4" /> In pipeline
                          </span>
                        ) : (
                          <button
                            onClick={() => openDealReview(deal)}
                            className="flex items-center gap-1.5 bg-[#1E3F52] text-white rounded-[8px] px-3 py-2 text-[12px] font-sans hover:bg-[#2a5269] transition-colors"
                            style={{ fontWeight: 600 }}
                          >
                            <Plus className="h-3.5 w-3.5" /> Add to pipeline
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] overflow-hidden" style={{ height: "560px" }}>
              <div className="flex h-full">
                {/* Email list */}
                <div className="w-[380px] border-r border-[#D8E8EE] flex flex-col">
                  <div className="px-4 py-2.5 border-b border-[#D8E8EE] flex items-center justify-between bg-[#FDFBF9]">
                    <span className="text-[11px] font-sans text-[#8AAABB] uppercase tracking-[1.5px]" style={{ fontWeight: 600 }}>
                      {emails.length} emails
                    </span>
                    <button onClick={fetchGmail} className="text-[#8AAABB] hover:text-[#1A2C38] transition-colors" title="Refresh">
                      <RefreshCw className={`h-3.5 w-3.5 ${emailsLoading ? "animate-spin" : ""}`} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {emails.map((email) => {
                      const { name } = parseEmailFrom(email.from);
                      const isSelected = selectedEmail?.id === email.id;
                      return (
                        <button
                          key={email.id}
                          onClick={() => setSelectedEmail(email)}
                          className={`w-full text-left px-4 py-3 border-b border-[#D8E8EE] transition-colors ${
                            isSelected ? "bg-[#F2F8FB]" : "hover:bg-[#FAF8F4]/50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[13px] font-sans text-[#1A2C38] truncate max-w-[240px]" style={{ fontWeight: 600 }}>
                              {name}
                            </span>
                            <span className="text-[10px] font-mono text-[#8AAABB] flex-shrink-0 ml-2">
                              {formatEmailDate(email.date)}
                            </span>
                          </div>
                          <p className="text-[12px] font-sans text-[#1A2C38] truncate" style={{ fontWeight: 500 }}>
                            {email.subject || "(no subject)"}
                          </p>
                          <p className="text-[11px] font-sans text-[#8AAABB] truncate mt-0.5">
                            {email.snippet}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Email detail */}
                <div className="flex-1 flex flex-col">
                  {selectedEmail ? (
                    <>
                      <div className="px-6 py-4 border-b border-[#D8E8EE]">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-[16px] font-serif text-[#1A2C38]">
                            {selectedEmail.subject || "(no subject)"}
                          </h3>
                          <a
                            href={`https://mail.google.com/mail/u/0/#inbox/${selectedEmail.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] font-sans text-[#7BAFC8] hover:underline"
                            style={{ fontWeight: 500 }}
                          >
                            Open in Gmail <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-[#F2F8FB] border border-[#D8E8EE] flex items-center justify-center text-[11px] font-sans text-[#7BAFC8]" style={{ fontWeight: 600 }}>
                            {parseEmailFrom(selectedEmail.from).name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>
                              {parseEmailFrom(selectedEmail.from).name}
                            </p>
                            <p className="text-[11px] font-mono text-[#8AAABB]">
                              {parseEmailFrom(selectedEmail.from).email}
                            </p>
                          </div>
                          <span className="ml-auto text-[11px] font-mono text-[#8AAABB]">
                            {formatEmailDate(selectedEmail.date)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto px-6 py-5">
                        <p className="text-[14px] font-sans text-[#1A2C38] leading-relaxed whitespace-pre-wrap">
                          {selectedEmail.snippet}
                        </p>
                        <div className="mt-6 pt-4 border-t border-[#D8E8EE]">
                          <a
                            href={`https://mail.google.com/mail/u/0/#inbox/${selectedEmail.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-[#1E3F52] text-white rounded-[8px] px-4 py-2 text-[12px] font-sans hover:bg-[#2a5269] transition-colors"
                            style={{ fontWeight: 600 }}
                          >
                            <Send className="h-3.5 w-3.5" /> Reply in Gmail
                          </a>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <Mail className="h-8 w-8 text-[#D8E8EE] mx-auto mb-3" />
                        <p className="text-[14px] font-serif italic text-[#8AAABB]">Select an email to read</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>)}
        </>
      )}

      {/* ─── Messages View ──────────────────────────────── */}
      {view === "messages" && (
        <>
          {myThreads.length === 0 ? (
            <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-12 text-center">
              <div className="h-14 w-14 rounded-full bg-[#F2F8FB] border border-[#D8E8EE] mx-auto mb-4 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-[#7BAFC8]" />
              </div>
              <p className="text-[18px] font-serif text-[#1A2C38] mb-2">No messages yet</p>
              <p className="text-[13px] font-sans text-[#8AAABB] max-w-sm mx-auto">
                {isGmailConnected
                  ? "No agency messages — check the Gmail tab for your latest emails."
                  : "Connect Gmail to see your emails, or wait for your agency to reach out."}
              </p>
              {!isGmailConnected && (
                <a href="/integrations" className="mt-4 text-[13px] font-sans text-[#7BAFC8] hover:underline inline-block" style={{ fontWeight: 500 }}>Connect Gmail →</a>
              )}
              {isGmailConnected && (
                <button onClick={() => setView("gmail")} className="mt-4 text-[13px] font-sans text-[#7BAFC8] hover:underline inline-block" style={{ fontWeight: 500 }}>Go to Gmail →</button>
              )}
            </div>
          ) : (
            <div className="bg-white border border-[#D8E8EE] rounded-[10px] overflow-hidden" style={{ height: "520px" }}>
              <div className="flex h-full">
                {/* Thread list */}
                <div className="w-[300px] border-r border-[#D8E8EE] overflow-y-auto">
                  {myThreads.map((thread) => {
                    const lastMsg = allMessages
                      .filter((m) => m.threadId === thread.id && !m.isInternal)
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                    return (
                      <button
                        key={thread.id}
                        onClick={() => setActiveThread(thread.id)}
                        className={`w-full text-left px-4 py-3.5 border-b border-[#D8E8EE] transition-colors ${
                          activeThread === thread.id ? "bg-[#FAF8F4]" : "hover:bg-[#FAF8F4]/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={`text-[13px] font-sans ${thread.unreadCreator > 0 ? "font-600 text-[#1A2C38]" : "font-500 text-[#1A2C38]"}`}>
                            {thread.topic}
                          </span>
                          {thread.unreadCreator > 0 && <span className="h-2 w-2 rounded-full bg-[#7BAFC8]" />}
                        </div>
                        {lastMsg && (
                          <>
                            <p className="text-[12px] font-sans text-[#8AAABB] truncate">{lastMsg.body}</p>
                            <p className="text-[10px] font-mono text-[#8AAABB] mt-0.5">{timeAgo(lastMsg.createdAt)}</p>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Thread content */}
                <div className="flex-1 flex flex-col">
                  {activeThread ? (
                    <>
                      <div className="px-5 py-3 border-b border-[#D8E8EE]">
                        <p className="text-[14px] font-sans font-600 text-[#1A2C38]">
                          {myThreads.find((t) => t.id === activeThread)?.topic}
                        </p>
                      </div>

                      <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        {threadMessages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.senderType === "creator" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[75%] rounded-[10px] p-3 ${msg.senderType === "creator" ? "bg-[#7BAFC8]/10" : "bg-[#FAF8F4]"}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[11px] font-sans font-500 text-[#1A2C38]">{msg.senderName}</span>
                                <span className="text-[10px] font-sans text-[#8AAABB]">{msg.senderRole}</span>
                                {msg.isUrgent && <Flag className="h-3 w-3 text-[#A03D3D]" />}
                              </div>
                              <p className="text-[13px] font-sans text-[#1A2C38] leading-relaxed">{msg.body}</p>
                              {msg.attachments.length > 0 && (
                                <div className="flex items-center gap-1.5 mt-2 text-[11px] font-sans text-[#7BAFC8]">
                                  <Paperclip className="h-3 w-3" /> {msg.attachments[0].name}
                                </div>
                              )}
                              {msg.linkedObjectName && (
                                <div className="mt-2 bg-white border border-[#D8E8EE] rounded-lg p-2 flex items-center gap-2">
                                  <FileText className="h-3.5 w-3.5 text-[#7BAFC8]" />
                                  <span className="text-[11px] font-sans font-500 text-[#7BAFC8]">{msg.linkedObjectName}</span>
                                </div>
                              )}
                              <p className="text-[10px] font-mono text-[#8AAABB] mt-1.5">{timeAgo(msg.createdAt)}</p>
                              {msg.readAt && msg.senderType === "creator" && (
                                <p className="text-[10px] font-sans text-[#3D7A58] flex items-center gap-1 mt-0.5">
                                  <CheckCircle2 className="h-2.5 w-2.5" /> Read
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-[#D8E8EE] p-3">
                        <div className="flex items-center gap-2">
                          <button className="text-[#8AAABB] hover:text-[#1A2C38]" onClick={() => toast("info", "File attachments coming soon")}><Paperclip className="h-4 w-4" /></button>
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Reply..."
                            className="flex-1 rounded-[8px] border-[1.5px] border-[#D8E8EE] px-3 py-2 text-[13px] font-sans focus:outline-none focus:border-[#7BAFC8]"
                            onKeyDown={(e) => { if (e.key === "Enter" && newMessage.trim()) { handleSendMessage(); } }}
                          />
                          <button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            className="bg-[#1E3F52] text-white rounded-[8px] p-2 hover:bg-[#2a5269] disabled:opacity-50"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-[14px] font-serif italic text-[#8AAABB]">Select a conversation</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Tasks view */}
      {view === "tasks" && (
        <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-12 text-center">
          <ListTodo className="h-8 w-8 text-[#D8E8EE] mx-auto mb-3" />
          <p className="text-[16px] font-serif italic text-[#8AAABB]">No tasks assigned</p>
          <p className="text-[13px] font-sans text-[#8AAABB] mt-1">Tasks from your agency will appear here.</p>
        </div>
      )}

      {/* Announcements view */}
      {view === "announcements" && (
        <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-12 text-center">
          <Megaphone className="h-8 w-8 text-[#D8E8EE] mx-auto mb-3" />
          <p className="text-[16px] font-serif italic text-[#8AAABB]">No announcements yet</p>
          <p className="text-[13px] font-sans text-[#8AAABB] mt-1">Updates from your agency will appear here.</p>
        </div>
      )}

      {/* ─── Deal Review Modal ──────────────────────────── */}
      {reviewDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(26,44,56,.4)", backdropFilter: "blur(4px)" }}>
          <div className="relative bg-white rounded-[10px] border-[1.5px] border-[#D8E8EE] w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#1E3F52] to-[#2a5269] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#7BAFC8]" />
                <h2 className="text-[18px] font-serif text-white">Review deal</h2>
              </div>
              <button onClick={() => setReviewDeal(null)} className="text-white/60 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            {/* Source info */}
            <div className="px-6 py-3 bg-[#F2F8FB] border-b border-[#D8E8EE]">
              <p className="text-[11px] font-sans text-[#8AAABB] uppercase tracking-[1.5px] mb-1" style={{ fontWeight: 600 }}>Detected from email</p>
              <p className="text-[12px] font-sans text-[#4A6070] truncate">{reviewDeal.email_subject}</p>
              <p className="text-[11px] font-mono text-[#8AAABB] truncate">{reviewDeal.email_from}</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-[11px] font-sans text-[#8AAABB] uppercase tracking-[1.5px] block mb-1.5" style={{ fontWeight: 600 }}>Brand name *</label>
                <input
                  type="text"
                  value={formBrand}
                  onChange={e => setFormBrand(e.target.value)}
                  placeholder="e.g., Glow Recipe"
                  className="w-full rounded-[8px] border-[1.5px] border-[#D8E8EE] px-3 py-2.5 text-[14px] font-sans text-[#1A2C38] bg-white focus:outline-none focus:border-[#7BAFC8]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-sans text-[#8AAABB] uppercase tracking-[1.5px] block mb-1.5" style={{ fontWeight: 600 }}>Deal value ($)</label>
                  <input
                    type="number"
                    value={formValue}
                    onChange={e => setFormValue(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-[8px] border-[1.5px] border-[#D8E8EE] px-3 py-2.5 text-[14px] font-sans text-[#1A2C38] bg-white focus:outline-none focus:border-[#7BAFC8]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-sans text-[#8AAABB] uppercase tracking-[1.5px] block mb-1.5" style={{ fontWeight: 600 }}>Platform</label>
                  <select
                    value={formPlatform}
                    onChange={e => setFormPlatform(e.target.value)}
                    className="w-full rounded-[8px] border-[1.5px] border-[#D8E8EE] px-3 py-2.5 text-[14px] font-sans text-[#1A2C38] bg-white focus:outline-none focus:border-[#7BAFC8]"
                  >
                    <option value="">Not specified</option>
                    <option value="tiktok">TikTok</option>
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-sans text-[#8AAABB] uppercase tracking-[1.5px] block mb-1.5" style={{ fontWeight: 600 }}>Deliverables</label>
                <input
                  type="text"
                  value={formDeliverables}
                  onChange={e => setFormDeliverables(e.target.value)}
                  placeholder="e.g., 2 TikTok videos + 1 Instagram reel"
                  className="w-full rounded-[8px] border-[1.5px] border-[#D8E8EE] px-3 py-2.5 text-[14px] font-sans text-[#1A2C38] bg-white focus:outline-none focus:border-[#7BAFC8]"
                />
              </div>
              <div>
                <label className="text-[11px] font-sans text-[#8AAABB] uppercase tracking-[1.5px] block mb-1.5" style={{ fontWeight: 600 }}>Stage</label>
                <select
                  value={formStage}
                  onChange={e => setFormStage(e.target.value)}
                  className="w-full rounded-[8px] border-[1.5px] border-[#D8E8EE] px-3 py-2.5 text-[14px] font-sans text-[#1A2C38] bg-white focus:outline-none focus:border-[#7BAFC8]"
                >
                  <option value="lead">Lead</option>
                  <option value="negotiating">Negotiating</option>
                  <option value="contracted">Contracted</option>
                  <option value="in_progress">In Progress</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-sans text-[#8AAABB] uppercase tracking-[1.5px] block mb-1.5" style={{ fontWeight: 600 }}>Notes</label>
                <textarea
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  rows={2}
                  placeholder="Additional details..."
                  className="w-full rounded-[8px] border-[1.5px] border-[#D8E8EE] px-3 py-2.5 text-[14px] font-sans text-[#1A2C38] bg-white focus:outline-none focus:border-[#7BAFC8] resize-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setReviewDeal(null)}
                  className="flex-1 border-[1.5px] border-[#D8E8EE] rounded-[8px] px-4 py-2.5 text-[13px] font-sans text-[#1A2C38]"
                  style={{ fontWeight: 500 }}
                >
                  Cancel
                </button>
                <button
                  onClick={submitDeal}
                  disabled={creatingDeal === reviewDeal.email_id}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#1E3F52] text-white rounded-[8px] px-4 py-2.5 text-[13px] font-sans hover:bg-[#2a5269] transition-colors disabled:opacity-50"
                  style={{ fontWeight: 600 }}
                >
                  {creatingDeal === reviewDeal.email_id ? (
                    <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Adding...</>
                  ) : (
                    <><Plus className="h-3.5 w-3.5" /> Add to pipeline</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
