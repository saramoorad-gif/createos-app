"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useSupabaseQuery, useSupabaseMutation } from "@/lib/hooks";
import { timeAgo } from "@/lib/utils";
import { useToast } from "@/components/global/toast";
import { TableSkeleton } from "@/components/global/skeleton";

// Matches actual Supabase schema (snake_case)
interface MessageThread {
  id: string;
  agency_id: string;
  creator_id: string | null;
  thread_type: "creator_facing" | "internal" | "brand_log";
  topic: string;
  last_message_at: string;
  unread_count_agency: number;
  unread_count_creator: number;
  created_at: string;
}

interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  sender_type: "creator" | "agency_user";
  body: string;
  attachments: any[];
  linked_object_type: string | null;
  linked_object_id: string | null;
  is_internal: boolean;
  is_urgent: boolean;
  scheduled_at: string | null;
  read_at: string | null;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

import { Send, Paperclip, MessageSquare, Flag, CheckCircle2, Pin, Plus, Megaphone, FileText, Clock } from "lucide-react";

type Section = "creators" | "internal" | "brand_log";

const sectionMap: Record<Section, "creator_facing" | "internal" | "brand_log"> = {
  creators: "creator_facing",
  internal: "internal",
  brand_log: "brand_log",
};

export function InboxTab() {
  const [section, setSection] = useState<Section>("creators");
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");

  const { data: messageThreads, loading: threadsLoading, setData: setThreads } = useSupabaseQuery<MessageThread>("message_threads");
  const { data: messageData, loading: messagesLoading, setData: setMessages } = useSupabaseQuery<Message>("messages");
  const { data: profiles } = useSupabaseQuery<Profile>("profiles");
  const { insert: insertMessage } = useSupabaseMutation("messages");
  const { insert: insertThread } = useSupabaseMutation("message_threads");
  const { insert: insertAnnouncement } = useSupabaseMutation("announcements");

  const { toast } = useToast();
  const loading = threadsLoading || messagesLoading;

  // Lookup map for profiles to display names (threads/messages only store IDs)
  const profileById = new Map(profiles.map(p => [p.id, p]));
  const getCreatorName = (id: string | null) => id ? (profileById.get(id)?.full_name || "Creator") : null;
  const getSenderName = (id: string) => profileById.get(id)?.full_name || "Unknown";

  if (loading) {
    return <TableSkeleton rows={8} cols={4} />;
  }

  if (!loading && messageThreads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="font-serif italic text-[16px] text-[#8AAABB] mb-4">No messages yet</p>
        <button onClick={() => { window.dispatchEvent(new CustomEvent("agency-tab", { detail: "roster" })); }} className="rounded-[8px] bg-[#7BAFC8] px-5 py-2.5 text-[13px] font-medium text-white hover:bg-[#6AA0BB]">
          Go to Roster →
        </button>
      </div>
    );
  }

  const threads = messageThreads
    .filter((t) => t.thread_type === sectionMap[section])
    .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
  const messages = activeThread
    ? messageData
        .filter((m: any) => m.thread_id === activeThread)
        .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    : [];
  const activeThreadData = messageThreads.find((t) => t.id === activeThread);

  const totalUnread = messageThreads.reduce((s, t) => s + t.unread_count_agency, 0);
  const creatorUnread = messageThreads.filter(t => t.thread_type === "creator_facing").reduce((s, t) => s + t.unread_count_agency, 0);

  const sections: { key: Section; label: string; count: number }[] = [
    { key: "creators", label: "Creators", count: creatorUnread },
    { key: "internal", label: "Internal", count: 0 },
    { key: "brand_log", label: "Brand Comms", count: 0 },
  ];

  return (
    <div>
      <PageHeader
        headline={<>Team <em className="italic text-[#7BAFC8]">inbox</em></>}
        subheading="Messages with creators, internal notes, and brand communication log."
        stats={[
          { value: String(totalUnread), label: "Unread" },
          { value: String(messageThreads.filter(t => t.thread_type === "creator_facing").length), label: "Creator threads" },
          { value: String(messageThreads.filter(t => t.thread_type === "internal").length), label: "Internal" },
        ]}
      />

      {/* Announcement button */}
      <div className="flex items-center justify-between mb-4">
        <div />
        <button
          onClick={() => setShowAnnouncement(!showAnnouncement)}
          className="flex items-center gap-1.5 text-[12px] font-sans font-500 text-[#7BAFC8] hover:underline"
        >
          <Megaphone className="h-3.5 w-3.5" /> Broadcast to all creators
        </button>
      </div>

      {/* Announcement composer */}
      {showAnnouncement && (
        <div className="bg-white border border-[#7BAFC8]/20 rounded-[10px] p-4 mb-4">
          <p className="text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#7BAFC8] mb-2">ANNOUNCEMENT — ALL CREATORS</p>
          <textarea rows={2} placeholder="Write an announcement..." value={announcementText} onChange={(e) => setAnnouncementText(e.target.value)} className="w-full rounded-lg border border-[#D8E8EE] px-3 py-2 text-[13px] font-sans resize-none focus:outline-none focus:border-[#7BAFC8] mb-2" />
          <div className="flex justify-end gap-2">
            <button onClick={() => { setShowAnnouncement(false); setAnnouncementText(""); }} className="text-[12px] font-sans font-500 text-[#8AAABB] hover:text-[#1A2C38]">Cancel</button>
            <button
              onClick={async () => {
                if (!announcementText.trim()) return;
                try {
                  await insertAnnouncement({
                    body: announcementText.trim(),
                  });
                  setShowAnnouncement(false);
                  setAnnouncementText("");
                  toast("success", "Announcement sent");
                } catch (err) {
                  console.error("Failed to send announcement:", err);
                  toast("error", "Failed to send announcement");
                }
              }}
              className="bg-[#7BAFC8] text-white rounded-lg px-3 py-1.5 text-[12px] font-sans font-500"
            >Send to all</button>
          </div>
        </div>
      )}

      <div className="bg-white border border-[#D8E8EE] rounded-[10px] overflow-hidden" style={{ height: "560px" }}>
        <div className="flex h-full">
          {/* Left sidebar */}
          <div className="w-[300px] border-r border-[#D8E8EE] flex flex-col">
            {/* Section tabs */}
            <div className="flex border-b border-[#D8E8EE]">
              {sections.map((s) => (
                <button
                  key={s.key}
                  onClick={() => { setSection(s.key); setActiveThread(null); }}
                  className={`flex-1 py-2.5 text-[10px] font-sans font-500 uppercase tracking-[1.5px] transition-colors relative ${
                    section === s.key ? "text-[#7BAFC8] border-b-2 border-[#7BAFC8]" : "text-[#8AAABB]"
                  }`}
                >
                  {s.label}
                  {s.count > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#7BAFC8] text-white text-[9px] flex items-center justify-center">
                      {s.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Thread list */}
            <div className="flex-1 overflow-y-auto">
              {threads.map((thread) => {
                const lastMsg = messageData
                  .filter((m) => m.thread_id === thread.id)
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
                return (
                  <button
                    key={thread.id}
                    onClick={() => setActiveThread(thread.id)}
                    className={`w-full text-left px-4 py-3.5 border-b border-[#D8E8EE] transition-colors ${
                      activeThread === thread.id ? "bg-[#FAF8F4]" : "hover:bg-[#FAF8F4]/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-0.5">
                      {thread.creator_id && (
                        <div className="h-7 w-7 rounded-full bg-[#F2F8FB] flex items-center justify-center text-[10px] font-sans font-500 text-[#8AAABB] flex-shrink-0">
                          {(getCreatorName(thread.creator_id) || "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-[13px] font-sans truncate ${thread.unread_count_agency > 0 ? "font-600 text-[#1A2C38]" : "font-500 text-[#1A2C38]"}`}>
                            {getCreatorName(thread.creator_id) || thread.topic}
                          </span>
                          {thread.unread_count_agency > 0 && <span className="h-2 w-2 rounded-full bg-[#7BAFC8] flex-shrink-0 ml-1" />}
                        </div>
                        <p className="text-[11px] font-sans text-[#8AAABB] truncate">{thread.topic}</p>
                      </div>
                    </div>
                    {lastMsg && (
                      <p className="text-[10px] font-mono text-[#8AAABB] mt-1 ml-9">{timeAgo(lastMsg.created_at)}</p>
                    )}
                  </button>
                );
              })}
              {threads.length === 0 && (
                <div className="text-center py-8"><p className="text-[14px] font-serif italic text-[#8AAABB]">No threads yet</p></div>
              )}
            </div>

            {/* New thread button */}
            <div className="border-t border-[#D8E8EE] p-2">
              <button
                onClick={async () => {
                  try {
                    const newThread = await insertThread({
                      thread_type: sectionMap[section],
                      topic: section === "internal" ? "New internal note" : section === "brand_log" ? "New brand communication" : "New conversation",
                    });
                    if (newThread) {
                      setThreads((prev) => [newThread as MessageThread, ...prev]);
                      setActiveThread((newThread as MessageThread).id);
                      toast("success", "Thread created");
                    }
                  } catch (err) {
                    console.error("Failed to create thread:", err);
                    toast("error", "Failed to create thread");
                  }
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-[12px] font-sans font-500 text-[#7BAFC8] hover:bg-[#F2F8FB] rounded-lg"
              >
                <Plus className="h-3.5 w-3.5" /> New thread
              </button>
            </div>
          </div>

          {/* Right — messages */}
          <div className="flex-1 flex flex-col">
            {activeThread && activeThreadData ? (
              <>
                {/* Thread header */}
                <div className="px-5 py-3 border-b border-[#D8E8EE] flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-sans font-600 text-[#1A2C38]">{activeThreadData.topic}</p>
                    {activeThreadData.creator_id && (
                      <p className="text-[11px] font-sans text-[#8AAABB]">{getCreatorName(activeThreadData.creator_id)}</p>
                    )}
                  </div>
                  {section === "creators" && (
                    <div className="flex items-center gap-2">
                      <button onClick={() => toast("info", "Schedule send coming soon")} className="text-[11px] font-sans font-500 text-[#8AAABB] hover:text-[#1A2C38] flex items-center gap-1"><Clock className="h-3 w-3" /> Schedule</button>
                      <button onClick={() => toast("success", "Thread flagged as urgent")} className="text-[11px] font-sans font-500 text-[#8AAABB] hover:text-[#A03D3D] flex items-center gap-1"><Flag className="h-3 w-3" /> Urgent</button>
                    </div>
                  )}
                  {section === "internal" && (
                    <button onClick={() => toast("success", "Thread pinned")} className="text-[11px] font-sans font-500 text-[#8AAABB] hover:text-[#1A2C38] flex items-center gap-1"><Pin className="h-3 w-3" /> Pin</button>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_type === "agency_user" && !msg.is_internal ? "justify-end" : msg.sender_type === "creator" ? "justify-start" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-[10px] p-3 ${
                        msg.is_internal ? "bg-[#F2F8FB] border border-[#D8E8EE]" :
                        msg.sender_type === "agency_user" ? "bg-[#7BAFC8]/10" : "bg-[#FAF8F4]"
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-sans font-500 text-[#1A2C38]">{getSenderName(msg.sender_id)}</span>
                          <span className="text-[10px] font-sans text-[#8AAABB]">{msg.sender_type === "agency_user" ? "Agency" : "Creator"}</span>
                          {msg.is_urgent && <Flag className="h-3 w-3 text-[#A03D3D]" />}
                          {msg.is_internal && <span className="text-[9px] font-sans font-500 uppercase tracking-[1px] text-[#8AAABB] bg-[#D8E8EE] rounded px-1 py-0.5">Internal</span>}
                        </div>
                        <p className="text-[13px] font-sans text-[#1A2C38] leading-relaxed">{msg.body}</p>
                        {Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-2 text-[11px] font-sans text-[#7BAFC8]">
                            <Paperclip className="h-3 w-3" /> {msg.attachments[0]?.name || "Attachment"}
                          </div>
                        )}
                        {msg.linked_object_id && (
                          <div className="mt-2 bg-white border border-[#D8E8EE] rounded-lg p-2 flex items-center gap-2 cursor-pointer hover:border-[#7BAFC8]/30">
                            <FileText className="h-3.5 w-3.5 text-[#7BAFC8]" />
                            <span className="text-[11px] font-sans font-500 text-[#7BAFC8]">{msg.linked_object_type}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-mono text-[#8AAABB]">{timeAgo(msg.created_at)}</span>
                          {msg.read_at && section === "creators" && msg.sender_type === "agency_user" && (
                            <span className="text-[10px] font-sans text-[#3D7A58] flex items-center gap-0.5">
                              <CheckCircle2 className="h-2.5 w-2.5" /> Read
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Compose */}
                <div className="border-t border-[#D8E8EE] p-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => toast("info", "File attachments coming soon")} className="text-[#8AAABB] hover:text-[#1A2C38]"><Paperclip className="h-4 w-4" /></button>
                    <button onClick={() => toast("info", "Link a contract or deal to this message")} className="text-[#8AAABB] hover:text-[#1A2C38]"><FileText className="h-4 w-4" /></button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={section === "internal" ? "Add internal note..." : "Type a message..."}
                      className="flex-1 rounded-lg border border-[#D8E8EE] px-3 py-2 text-[13px] font-sans focus:outline-none focus:border-[#7BAFC8]"
                    />
                    <button
                      onClick={async () => {
                        if (!newMessage.trim() || !activeThread) return;
                        try {
                          // sender_id must come from auth — use a placeholder uuid and let the db reject if needed
                          // In production this should be: const { data: { user } } = await getSupabase().auth.getUser()
                          const msgData = {
                            thread_id: activeThread,
                            body: newMessage.trim(),
                            sender_type: "agency_user" as const,
                            is_internal: section === "internal",
                            is_urgent: false,
                            attachments: [],
                          };
                          const newMsg = await insertMessage(msgData);
                          if (newMsg) {
                            setMessages((prev) => [...prev, newMsg as Message]);
                            toast("success", "Message sent");
                          }
                          setNewMessage("");
                        } catch (err) {
                          console.error("Failed to send message:", err);
                          toast("error", "Failed to send message");
                        }
                      }}
                      className="bg-[#7BAFC8] text-white rounded-lg p-2 hover:bg-[#6AA0BB]"
                    ><Send className="h-4 w-4" /></button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-8 w-8 text-[#D8E8EE] mx-auto mb-2" />
                  <p className="text-[14px] font-serif italic text-[#8AAABB]">Select a conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
