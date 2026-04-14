"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import {
  messageThreads,
  messageData,
  type MessageThread,
} from "@/lib/placeholder-data";
import { timeAgo } from "@/lib/utils";
import { Send, Paperclip, MessageSquare, Flag, CheckCircle2, Pin, Plus, Megaphone, FileText, Clock } from "lucide-react";

type Section = "creators" | "internal" | "brand_log";

const sectionMap: Record<Section, MessageThread["threadType"]> = {
  creators: "creator_facing",
  internal: "internal",
  brand_log: "brand_log",
};

function getThreads(type: Section) {
  return messageThreads
    .filter((t) => t.threadType === sectionMap[type])
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
}

function getMessages(threadId: string) {
  return messageData
    .filter((m) => m.threadId === threadId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function InboxTab() {
  const [section, setSection] = useState<Section>("creators");
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  const threads = getThreads(section);
  const messages = activeThread ? getMessages(activeThread) : [];
  const activeThreadData = messageThreads.find((t) => t.id === activeThread);

  const totalUnread = messageThreads.reduce((s, t) => s + t.unreadAgency, 0);
  const creatorUnread = messageThreads.filter(t => t.threadType === "creator_facing").reduce((s, t) => s + t.unreadAgency, 0);

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
          { value: String(messageThreads.filter(t => t.threadType === "creator_facing").length), label: "Creator threads" },
          { value: String(messageThreads.filter(t => t.threadType === "internal").length), label: "Internal" },
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
          <textarea rows={2} placeholder="Write an announcement..." className="w-full rounded-lg border border-[#D8E8EE] px-3 py-2 text-[13px] font-sans resize-none focus:outline-none focus:border-[#7BAFC8] mb-2" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAnnouncement(false)} className="text-[12px] font-sans font-500 text-[#8AAABB] hover:text-[#1A2C38]">Cancel</button>
            <button onClick={() => setShowAnnouncement(false)} className="bg-[#7BAFC8] text-white rounded-lg px-3 py-1.5 text-[12px] font-sans font-500">Send to all</button>
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
                  .filter((m) => m.threadId === thread.id)
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                return (
                  <button
                    key={thread.id}
                    onClick={() => setActiveThread(thread.id)}
                    className={`w-full text-left px-4 py-3.5 border-b border-[#D8E8EE] transition-colors ${
                      activeThread === thread.id ? "bg-[#FAF8F4]" : "hover:bg-[#FAF8F4]/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-0.5">
                      {thread.creatorAvatar && (
                        <div className="h-7 w-7 rounded-full bg-[#F2F8FB] flex items-center justify-center text-[10px] font-sans font-500 text-[#8AAABB] flex-shrink-0">
                          {thread.creatorAvatar}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-[13px] font-sans truncate ${thread.unreadAgency > 0 ? "font-600 text-[#1A2C38]" : "font-500 text-[#1A2C38]"}`}>
                            {thread.creatorName || thread.topic}
                          </span>
                          {thread.unreadAgency > 0 && <span className="h-2 w-2 rounded-full bg-[#7BAFC8] flex-shrink-0 ml-1" />}
                        </div>
                        <p className="text-[11px] font-sans text-[#8AAABB] truncate">{thread.topic}</p>
                      </div>
                    </div>
                    {lastMsg && (
                      <p className="text-[10px] font-mono text-[#8AAABB] mt-1 ml-9">{timeAgo(lastMsg.createdAt)}</p>
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
              <button className="w-full flex items-center justify-center gap-1.5 py-2 text-[12px] font-sans font-500 text-[#7BAFC8] hover:bg-[#F2F8FB] rounded-lg">
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
                    {activeThreadData.creatorName && (
                      <p className="text-[11px] font-sans text-[#8AAABB]">{activeThreadData.creatorName}</p>
                    )}
                  </div>
                  {section === "creators" && (
                    <div className="flex items-center gap-2">
                      <button className="text-[11px] font-sans font-500 text-[#8AAABB] hover:text-[#1A2C38] flex items-center gap-1"><Clock className="h-3 w-3" /> Schedule</button>
                      <button className="text-[11px] font-sans font-500 text-[#8AAABB] hover:text-[#A03D3D] flex items-center gap-1"><Flag className="h-3 w-3" /> Urgent</button>
                    </div>
                  )}
                  {section === "internal" && (
                    <button className="text-[11px] font-sans font-500 text-[#8AAABB] hover:text-[#1A2C38] flex items-center gap-1"><Pin className="h-3 w-3" /> Pin</button>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.senderType === "agency_user" && !msg.isInternal ? "justify-end" : msg.senderType === "creator" ? "justify-start" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-[10px] p-3 ${
                        msg.isInternal ? "bg-[#F2F8FB] border border-[#D8E8EE]" :
                        msg.senderType === "agency_user" ? "bg-[#7BAFC8]/10" : "bg-[#FAF8F4]"
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-sans font-500 text-[#1A2C38]">{msg.senderName}</span>
                          <span className="text-[10px] font-sans text-[#8AAABB]">{msg.senderRole}</span>
                          {msg.isUrgent && <Flag className="h-3 w-3 text-[#A03D3D]" />}
                          {msg.isInternal && <span className="text-[9px] font-sans font-500 uppercase tracking-[1px] text-[#8AAABB] bg-[#D8E8EE] rounded px-1 py-0.5">Internal</span>}
                        </div>
                        <p className="text-[13px] font-sans text-[#1A2C38] leading-relaxed">{msg.body}</p>
                        {msg.attachments.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-2 text-[11px] font-sans text-[#7BAFC8]">
                            <Paperclip className="h-3 w-3" /> {msg.attachments[0].name}
                          </div>
                        )}
                        {msg.linkedObjectName && (
                          <div className="mt-2 bg-white border border-[#D8E8EE] rounded-lg p-2 flex items-center gap-2 cursor-pointer hover:border-[#7BAFC8]/30">
                            <FileText className="h-3.5 w-3.5 text-[#7BAFC8]" />
                            <span className="text-[11px] font-sans font-500 text-[#7BAFC8]">{msg.linkedObjectName}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-mono text-[#8AAABB]">{timeAgo(msg.createdAt)}</span>
                          {msg.readAt && section === "creators" && msg.senderType === "agency_user" && (
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
                    <button className="text-[#8AAABB] hover:text-[#1A2C38]"><Paperclip className="h-4 w-4" /></button>
                    <button className="text-[#8AAABB] hover:text-[#1A2C38]"><FileText className="h-4 w-4" /></button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={section === "internal" ? "Add internal note..." : "Type a message..."}
                      className="flex-1 rounded-lg border border-[#D8E8EE] px-3 py-2 text-[13px] font-sans focus:outline-none focus:border-[#7BAFC8]"
                    />
                    <button className="bg-[#7BAFC8] text-white rounded-lg p-2 hover:bg-[#6AA0BB]"><Send className="h-4 w-4" /></button>
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
