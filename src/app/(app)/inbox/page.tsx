"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useSupabaseQuery } from "@/lib/hooks";
import { timeAgo } from "@/lib/utils";
import { Send, Paperclip, Flag, CheckCircle2, Megaphone, FileText } from "lucide-react";

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

interface CreatorTask {
  id: string;
  creatorId: string;
  title: string;
  dueDate: string | null;
  completed: boolean;
  fromMessage: string | null;
  createdAt: string;
}

interface Announcement {
  id: string;
  body: string;
  sentTo: "all" | "selected";
  sentAt: string;
}

export default function CreatorInboxPage() {
  const { data: allThreads, loading: threadsLoading } = useSupabaseQuery<MessageThread>("message_threads");
  const { data: allMessages, loading: messagesLoading } = useSupabaseQuery<Message>("messages");
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [view, setView] = useState<"messages" | "tasks" | "announcements">("messages");

  const loading = threadsLoading || messagesLoading;

  if (loading) return <div className="pt-20 text-center"><p className="text-[14px] font-sans text-[#8AAABB]">Loading...</p></div>;

  // Filter to creator-facing threads
  const myThreads = allThreads.filter(
    (t) => t.threadType === "creator_facing"
  );
  const unreadCount = myThreads.reduce((s, t) => s + t.unreadCreator, 0);

  if (myThreads.length === 0 && view === "messages") {
    return (
      <div>
        <PageHeader
          headline={<>Your <em className="italic text-[#7BAFC8]">inbox</em></>}
          subheading="Messages from your agency team."
        />
        <div className="text-center py-16">
          <p className="text-[20px] font-serif italic text-[#8AAABB]">No messages yet — connect Gmail or wait for your agency to reach out.</p>
          <button className="mt-4 text-[13px] font-sans font-500 text-[#7BAFC8] hover:underline">Connect Gmail →</button>
        </div>
      </div>
    );
  }

  const threadMessages = activeThread
    ? allMessages.filter((m) => m.threadId === activeThread && !m.isInternal)
    : [];

  return (
    <div>
      <PageHeader
        headline={<>Your <em className="italic text-[#7BAFC8]">inbox</em></>}
        subheading="Messages from your agency team."
        stats={[
          { value: String(unreadCount), label: "Unread" },
          { value: String(myThreads.length), label: "Conversations" },
        ]}
      />

      {/* View toggle */}
      <div className="flex items-center gap-1 mb-6">
        {(["messages", "tasks", "announcements"] as const).map((v) => (
          <button
            key={v}
            onClick={() => { setView(v); setActiveThread(null); }}
            className={`px-3 py-1 text-[10px] font-sans font-500 uppercase tracking-[1.5px] rounded-full ${
              view === v ? "bg-[#1A2C38] text-[#FAF8F4]" : "text-[#8AAABB] hover:bg-[#F2F8FB]"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Messages view */}
      {view === "messages" && (
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
                    <p className="text-[11px] font-sans text-[#8AAABB]">with Bright Talent Mgmt</p>
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
                      <button className="text-[#8AAABB] hover:text-[#1A2C38]"><Paperclip className="h-4 w-4" /></button>
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Reply..."
                        className="flex-1 rounded-lg border border-[#D8E8EE] px-3 py-2 text-[13px] font-sans focus:outline-none focus:border-[#7BAFC8]"
                      />
                      <button className="bg-[#7BAFC8] text-white rounded-lg p-2 hover:bg-[#6AA0BB]">
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

      {/* Tasks view */}
      {view === "tasks" && (
        <div className="text-center py-12">
          <p className="text-[14px] font-serif italic text-[#8AAABB]">No tasks assigned</p>
        </div>
      )}

      {/* Announcements view */}
      {view === "announcements" && (
        <div className="text-center py-12">
          <p className="text-[14px] font-serif italic text-[#8AAABB]">No announcements yet</p>
        </div>
      )}
    </div>
  );
}
