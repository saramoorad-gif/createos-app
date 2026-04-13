"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import {
  messageThreads,
  messageData,
  creatorTasks,
  announcements,
  type MessageThread,
  type Message,
} from "@/lib/placeholder-data";
import { timeAgo } from "@/lib/utils";
import { Send, Paperclip, Flag, CheckCircle2, Megaphone, FileText } from "lucide-react";

// Filter to creator-facing threads only (Brianna's perspective)
const creatorId = "usr_brianna_001";
const myThreads = messageThreads.filter(
  (t) => t.creatorId === creatorId && t.threadType === "creator_facing"
);
const myTasks = creatorTasks.filter((t) => t.creatorId === creatorId);
const unreadCount = myThreads.reduce((s, t) => s + t.unreadCreator, 0);

export default function CreatorInboxPage() {
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [view, setView] = useState<"messages" | "tasks" | "announcements">("messages");

  const threadMessages = activeThread
    ? messageData.filter((m) => m.threadId === activeThread && !m.isInternal)
    : [];

  return (
    <div>
      <PageHeader
        headline={<>Your <em className="italic text-[#C4714A]">inbox</em></>}
        subheading="Messages from your agency team."
        stats={[
          { value: String(unreadCount), label: "Unread" },
          { value: String(myThreads.length), label: "Conversations" },
          { value: String(myTasks.filter((t) => !t.completed).length), label: "Open tasks" },
        ]}
      />

      {/* View toggle */}
      <div className="flex items-center gap-1 mb-6">
        {(["messages", "tasks", "announcements"] as const).map((v) => (
          <button
            key={v}
            onClick={() => { setView(v); setActiveThread(null); }}
            className={`px-3 py-1 text-[10px] font-sans font-500 uppercase tracking-[1.5px] rounded-full ${
              view === v ? "bg-[#1C1714] text-[#F7F4EF]" : "text-[#9A9088] hover:bg-[#F2EEE8]"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Messages view */}
      {view === "messages" && (
        <div className="bg-white border border-[#E5E0D8] rounded-[10px] overflow-hidden" style={{ height: "520px" }}>
          <div className="flex h-full">
            {/* Thread list */}
            <div className="w-[300px] border-r border-[#E5E0D8] overflow-y-auto">
              {myThreads.map((thread) => {
                const lastMsg = messageData
                  .filter((m) => m.threadId === thread.id && !m.isInternal)
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                return (
                  <button
                    key={thread.id}
                    onClick={() => setActiveThread(thread.id)}
                    className={`w-full text-left px-4 py-3.5 border-b border-[#E5E0D8] transition-colors ${
                      activeThread === thread.id ? "bg-[#F7F4EF]" : "hover:bg-[#F7F4EF]/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-[13px] font-sans ${thread.unreadCreator > 0 ? "font-600 text-[#1C1714]" : "font-500 text-[#1C1714]"}`}>
                        {thread.topic}
                      </span>
                      {thread.unreadCreator > 0 && <span className="h-2 w-2 rounded-full bg-[#C4714A]" />}
                    </div>
                    {lastMsg && (
                      <>
                        <p className="text-[12px] font-sans text-[#9A9088] truncate">{lastMsg.body}</p>
                        <p className="text-[10px] font-mono text-[#9A9088] mt-0.5">{timeAgo(lastMsg.createdAt)}</p>
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
                  <div className="px-5 py-3 border-b border-[#E5E0D8]">
                    <p className="text-[14px] font-sans font-600 text-[#1C1714]">
                      {myThreads.find((t) => t.id === activeThread)?.topic}
                    </p>
                    <p className="text-[11px] font-sans text-[#9A9088]">with Bright Talent Mgmt</p>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {threadMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.senderType === "creator" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-[10px] p-3 ${msg.senderType === "creator" ? "bg-[#C4714A]/10" : "bg-[#F7F4EF]"}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[11px] font-sans font-500 text-[#1C1714]">{msg.senderName}</span>
                            <span className="text-[10px] font-sans text-[#9A9088]">{msg.senderRole}</span>
                            {msg.isUrgent && <Flag className="h-3 w-3 text-[#E05C3A]" />}
                          </div>
                          <p className="text-[13px] font-sans text-[#1C1714] leading-relaxed">{msg.body}</p>
                          {msg.attachments.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-sans text-[#C4714A]">
                              <Paperclip className="h-3 w-3" /> {msg.attachments[0].name}
                            </div>
                          )}
                          {msg.linkedObjectName && (
                            <div className="mt-2 bg-white border border-[#E5E0D8] rounded-lg p-2 flex items-center gap-2">
                              <FileText className="h-3.5 w-3.5 text-[#C4714A]" />
                              <span className="text-[11px] font-sans font-500 text-[#C4714A]">{msg.linkedObjectName}</span>
                            </div>
                          )}
                          <p className="text-[10px] font-mono text-[#9A9088] mt-1.5">{timeAgo(msg.createdAt)}</p>
                          {msg.readAt && msg.senderType === "creator" && (
                            <p className="text-[10px] font-sans text-[#4A9060] flex items-center gap-1 mt-0.5">
                              <CheckCircle2 className="h-2.5 w-2.5" /> Read
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#E5E0D8] p-3">
                    <div className="flex items-center gap-2">
                      <button className="text-[#9A9088] hover:text-[#1C1714]"><Paperclip className="h-4 w-4" /></button>
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Reply..."
                        className="flex-1 rounded-lg border border-[#E5E0D8] px-3 py-2 text-[13px] font-sans focus:outline-none focus:border-[#C4714A]"
                      />
                      <button className="bg-[#C4714A] text-white rounded-lg p-2 hover:bg-[#B05C38]">
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-[14px] font-serif italic text-[#9A9088]">Select a conversation</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tasks view */}
      {view === "tasks" && (
        <div className="space-y-2">
          {myTasks.map((task) => (
            <div key={task.id} className="bg-white border border-[#E5E0D8] rounded-[10px] p-4 flex items-center gap-3">
              <input type="checkbox" defaultChecked={task.completed} className="rounded border-[#E5E0D8]" />
              <div className="flex-1">
                <p className={`text-[13px] font-sans font-500 ${task.completed ? "line-through text-[#9A9088]" : "text-[#1C1714]"}`}>{task.title}</p>
                {task.fromMessage && <p className="text-[11px] font-sans text-[#9A9088] mt-0.5">Assigned by Bright Talent Mgmt</p>}
              </div>
              {task.dueDate && <span className="text-[11px] font-mono text-[#9A9088]">{task.dueDate}</span>}
            </div>
          ))}
          {myTasks.length === 0 && (
            <div className="text-center py-12"><p className="text-[14px] font-serif italic text-[#9A9088]">No tasks assigned</p></div>
          )}
        </div>
      )}

      {/* Announcements view */}
      {view === "announcements" && (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <div key={ann.id} className="bg-white border border-[#E5E0D8] rounded-[10px] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Megaphone className="h-3.5 w-3.5 text-[#C4714A]" />
                <span className="text-[10px] font-sans font-500 uppercase tracking-[1.5px] text-[#C4714A]">Announcement</span>
                <span className="text-[10px] font-mono text-[#9A9088]">{timeAgo(ann.sentAt)}</span>
              </div>
              <p className="text-[13px] font-sans text-[#1C1714]">{ann.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
