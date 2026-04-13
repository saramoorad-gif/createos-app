"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { agencyMessages, type AgencyMessage } from "@/lib/placeholder-data";
import { timeAgo } from "@/lib/utils";
import { Send, Paperclip, MessageSquare } from "lucide-react";

type Section = "creator" | "brand" | "internal";

const sections: { key: Section; label: string }[] = [
  { key: "creator", label: "Creators" },
  { key: "brand", label: "Brands" },
  { key: "internal", label: "Internal" },
];

// Group messages by thread
function getThreads(type: Section) {
  const msgs = agencyMessages.filter(m => m.threadType === type);
  const threads: Record<string, AgencyMessage[]> = {};
  msgs.forEach(m => {
    if (!threads[m.thread]) threads[m.thread] = [];
    threads[m.thread].push(m);
  });
  return Object.entries(threads).map(([id, messages]) => ({
    id,
    name: messages[0].threadName,
    messages: messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    lastMessage: messages[messages.length - 1],
    unread: messages.some(m => !m.read),
  }));
}

export function InboxTab() {
  const [section, setSection] = useState<Section>("creator");
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const threads = getThreads(section);
  const activeMessages = activeThread ? threads.find(t => t.id === activeThread)?.messages || [] : [];
  const unreadCreator = agencyMessages.filter(m => m.threadType === "creator" && !m.read).length;
  const unreadBrand = agencyMessages.filter(m => m.threadType === "brand" && !m.read).length;

  return (
    <div>
      <PageHeader
        headline={<>Team <em className="italic text-[#C4714A]">inbox</em></>}
        subheading="Messages with creators, brands, and internal team notes."
        stats={[
          { value: String(unreadCreator), label: "Unread (creators)" },
          { value: String(unreadBrand), label: "Unread (brands)" },
          { value: String(agencyMessages.length), label: "Total messages" },
        ]}
      />

      <div className="bg-white border border-[#E5E0D8] rounded-[10px] overflow-hidden" style={{ height: "520px" }}>
        <div className="flex h-full">
          {/* Left sidebar — sections + threads */}
          <div className="w-[280px] border-r border-[#E5E0D8] flex flex-col">
            {/* Section tabs */}
            <div className="flex border-b border-[#E5E0D8]">
              {sections.map(s => (
                <button
                  key={s.key}
                  onClick={() => { setSection(s.key); setActiveThread(null); }}
                  className={`flex-1 py-2.5 text-[10px] font-sans font-500 uppercase tracking-[1.5px] transition-colors ${section === s.key ? "text-[#C4714A] border-b-2 border-[#C4714A]" : "text-[#9A9088]"}`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Thread list */}
            <div className="flex-1 overflow-y-auto">
              {threads.map(thread => (
                <button
                  key={thread.id}
                  onClick={() => setActiveThread(thread.id)}
                  className={`w-full text-left px-4 py-3 border-b border-[#E5E0D8] transition-colors ${activeThread === thread.id ? "bg-[#F7F4EF]" : "hover:bg-[#F7F4EF]/50"}`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-[13px] font-sans ${thread.unread ? "font-600 text-[#1C1714]" : "font-500 text-[#1C1714]"}`}>
                      {thread.name}
                    </span>
                    {thread.unread && <span className="h-2 w-2 rounded-full bg-[#C4714A]" />}
                  </div>
                  <p className="text-[12px] font-sans text-[#9A9088] truncate">{thread.lastMessage.body}</p>
                  <p className="text-[10px] font-mono text-[#9A9088] mt-0.5">{timeAgo(thread.lastMessage.createdAt)}</p>
                </button>
              ))}
              {threads.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-[14px] font-serif italic text-[#9A9088]">No messages yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Right — message thread */}
          <div className="flex-1 flex flex-col">
            {activeThread ? (
              <>
                {/* Thread header */}
                <div className="px-5 py-3 border-b border-[#E5E0D8]">
                  <p className="text-[14px] font-sans font-600 text-[#1C1714]">
                    {threads.find(t => t.id === activeThread)?.name}
                  </p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {activeMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.senderType === "agency" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] ${msg.senderType === "agency" ? "bg-[#C4714A]/10" : "bg-[#F7F4EF]"} rounded-[10px] p-3`}>
                        <p className="text-[11px] font-sans font-500 text-[#9A9088] mb-1">{msg.sender}</p>
                        <p className="text-[13px] font-sans text-[#1C1714] leading-relaxed">{msg.body}</p>
                        {msg.attachmentName && (
                          <div className="flex items-center gap-1.5 mt-2 text-[11px] font-sans text-[#C4714A]">
                            <Paperclip className="h-3 w-3" /> {msg.attachmentName}
                          </div>
                        )}
                        {msg.linkedDeal && (
                          <p className="text-[10px] font-sans text-[#9A9088] mt-1.5">Linked: {msg.linkedDeal}</p>
                        )}
                        <p className="text-[10px] font-mono text-[#9A9088] mt-1">{timeAgo(msg.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Compose */}
                <div className="border-t border-[#E5E0D8] p-3">
                  <div className="flex items-center gap-2">
                    <button className="text-[#9A9088] hover:text-[#1C1714]"><Paperclip className="h-4 w-4" /></button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 rounded-lg border border-[#E5E0D8] px-3 py-2 text-[13px] font-sans focus:outline-none focus:border-[#C4714A]"
                    />
                    <button className="bg-[#C4714A] text-white rounded-lg p-2 hover:bg-[#B05C38]"><Send className="h-4 w-4" /></button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-8 w-8 text-[#E5E0D8] mx-auto mb-2" />
                  <p className="text-[14px] font-serif italic text-[#9A9088]">Select a conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
