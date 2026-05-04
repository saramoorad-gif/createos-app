"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

const SEQUENCE_TIMEOUT = 500;

interface ShortcutEntry {
  keys: string[];
  description: string;
}

interface ShortcutSection {
  title: string;
  shortcuts: ShortcutEntry[];
}

const shortcutSections: ShortcutSection[] = [
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["g", "d"], description: "Go to Deals" },
      { keys: ["g", "t"], description: "Go to Tasks" },
      { keys: ["g", "c"], description: "Go to Contracts" },
      { keys: ["g", "i"], description: "Go to Inbox" },
      { keys: ["g", "s"], description: "Go to Settings" },
    ],
  },
  {
    title: "Actions",
    shortcuts: [
      { keys: ["?"], description: "Open shortcut help" },
      { keys: ["Esc"], description: "Close any modal" },
    ],
  },
  {
    title: "Tables",
    shortcuts: [
      { keys: ["j"], description: "Move down" },
      { keys: ["k"], description: "Move up" },
      { keys: ["Enter"], description: "Open selected" },
    ],
  },
];

const navSequences: Record<string, string> = {
  d: "/deals",
  t: "/tasks",
  c: "/contracts",
  i: "/inbox",
  s: "/settings",
};

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pendingKeyRef = useRef<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeModal = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      if (isInput) return;

      // Escape — close modals
      if (e.key === "Escape") {
        setOpen(false);
        window.dispatchEvent(new CustomEvent("close-modal"));
        return;
      }

      // ? — open help
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }

      // g-sequence navigation
      if (e.key === "g" && !e.ctrlKey && !e.metaKey) {
        pendingKeyRef.current = "g";
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          pendingKeyRef.current = null;
        }, SEQUENCE_TIMEOUT);
        return;
      }

      if (pendingKeyRef.current === "g") {
        pendingKeyRef.current = null;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        const route = navSequences[e.key];
        if (route) {
          e.preventDefault();
          router.push(route);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [router]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/30"
        onClick={closeModal}
        style={{ animation: "kbFadeIn 150ms ease-out" }}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-[101] flex items-center justify-center p-4"
        onClick={closeModal}
      >
        <div
          className="bg-white w-full max-w-[560px] rounded-[16px] border border-[#D8E8EE] p-6"
          style={{
            boxShadow: "0 16px 48px rgba(30,63,82,.15)",
            animation: "kbScaleIn 200ms cubic-bezier(0.16,1,0.3,1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <style>{`
            @keyframes kbFadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes kbScaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
          `}</style>

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2
              className="font-serif text-[18px] text-[#1E3F52]"
              style={{ fontWeight: 600 }}
            >
              Keyboard Shortcuts
            </h2>
            <button
              onClick={closeModal}
              className="text-[#8AAABB] hover:text-[#1A2C38] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Sections */}
          <div className="flex flex-col gap-5">
            {shortcutSections.map((section) => (
              <div key={section.title}>
                <h3
                  className="font-sans text-[11px] uppercase tracking-wider text-[#8AAABB] mb-2"
                  style={{ fontWeight: 600 }}
                >
                  {section.title}
                </h3>
                <div className="flex flex-col">
                  {section.shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.description}
                      className="flex items-center justify-between py-2 border-b border-[#D8E8EE]/50 last:border-0"
                    >
                      <span className="font-sans text-[13px] text-[#1A2C38]">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, i) => (
                          <span key={i}>
                            {i > 0 && (
                              <span className="font-sans text-[11px] text-[#8AAABB] mx-0.5">
                                then
                              </span>
                            )}
                            <kbd
                              className="font-mono text-[12px] text-[#1E3F52] bg-[#FAF8F4] border border-[#D8E8EE] rounded-[4px] px-1.5 py-0.5 min-w-[24px] text-center inline-block"
                              style={{ fontWeight: 500 }}
                            >
                              {key}
                            </kbd>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
