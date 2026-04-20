"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, X, CheckCheck } from "lucide-react";
import { useSupabaseQuery } from "@/lib/hooks";
import { timeAgo } from "@/lib/utils";

type NotificationType = "info" | "success" | "urgent";

// Note: read status is tracked locally via readIds (table has no 'read' column)
interface Notification {
  id: string;
  type?: NotificationType;
  message: string;
  created_at: string;
}

const dotColors: Record<NotificationType, string> = {
  info: "bg-[#7BAFC8]",
  success: "bg-[#3D7A58]",
  urgent: "bg-[#A03D3D]",
};

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { data: notifications } = useSupabaseQuery<Notification>(
    "agency_activity_log",
    { order: { column: "created_at", ascending: false }, limit: 50 }
  );

  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const markAllRead = useCallback(() => {
    setReadIds(new Set(notifications.map((n) => n.id)));
  }, [notifications]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const isRead = (n: Notification) => readIds.has(n.id);

  return (
    <div
      ref={panelRef}
      className="absolute top-full right-0 mt-2 w-[360px] max-h-[400px] bg-white border border-[#D8E8EE] rounded-[12px] overflow-hidden z-[80] flex flex-col"
      style={{
        boxShadow: "0 12px 36px rgba(30,63,82,.12)",
        animation: "npSlideDown 200ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <style>{`
        @keyframes npSlideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#D8E8EE]">
        <h3
          className="font-serif text-[15px] text-[#1E3F52]"
          style={{ fontWeight: 600 }}
        >
          Notifications
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllRead}
            className="font-sans text-[12px] text-[#7BAFC8] hover:text-[#1E3F52] flex items-center gap-1 transition-colors"
            style={{ fontWeight: 500 }}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
          <button
            onClick={onClose}
            className="text-[#8AAABB] hover:text-[#1A2C38] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4">
            <Bell className="h-8 w-8 text-[#D8E8EE] mb-2" />
            <p
              className="font-sans text-[13px] text-[#8AAABB]"
              style={{ fontWeight: 500 }}
            >
              You're all caught up
            </p>
          </div>
        ) : (
          notifications.map((n) => {
            const read = isRead(n);
            const type: NotificationType =
              n.type === "success" || n.type === "urgent" || n.type === "info"
                ? n.type
                : "info";
            return (
              <div
                key={n.id}
                className={`flex items-start gap-3 px-4 py-3 border-b border-[#D8E8EE]/40 last:border-0 transition-colors ${
                  read ? "bg-white" : "bg-[#F2F8FB]"
                }`}
              >
                <div
                  className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${dotColors[type]}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[13px] text-[#1A2C38] leading-snug">
                    {n.message}
                  </p>
                  <span className="font-mono text-[11px] text-[#8AAABB] mt-0.5 block">
                    {timeAgo(n.created_at)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: notifications } = useSupabaseQuery<Notification>(
    "agency_activity_log",
    { order: { column: "created_at", ascending: false }, limit: 50 }
  );

  // No persisted `read` flag on agency_activity_log; treat every row as
  // a notification. Read-state is tracked in-session inside NotificationPanel.
  const unreadCount = notifications.length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex items-center justify-center h-9 w-9 rounded-[8px] border border-[#D8E8EE] bg-[#FAF8F4] hover:bg-[#EDF5F8] transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-[18px] w-[18px] text-[#1E3F52]" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 h-[18px] min-w-[18px] px-1 flex items-center justify-center rounded-full bg-[#A03D3D] font-mono text-[10px] text-white"
            style={{ fontWeight: 600 }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <NotificationPanel open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
