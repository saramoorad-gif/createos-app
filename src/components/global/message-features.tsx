"use client";

import { useState, useRef, useEffect } from "react";
import { Smile, AtSign, Reply } from "lucide-react";

// ─── Emoji Reactions ────────────────────────────────────────────

const quickEmojis = ["👍", "❤️", "🎉", "🔥", "👀", "✅"];

interface ReactionProps {
  reactions: Record<string, number>;
  onReact: (emoji: string) => void;
}

export function EmojiReactions({ reactions, onReact }: ReactionProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="flex items-center gap-1 mt-1">
      {Object.entries(reactions).filter(([, count]) => count > 0).map(([emoji, count]) => (
        <button
          key={emoji}
          onClick={() => onReact(emoji)}
          className="flex items-center gap-0.5 bg-[#F2F8FB] border border-[#D8E8EE] rounded-full px-2 py-0.5 text-[12px] hover:border-[#7BAFC8] transition-colors"
        >
          <span>{emoji}</span>
          <span className="text-[10px] text-[#4A6070]">{count}</span>
        </button>
      ))}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="h-6 w-6 rounded-full flex items-center justify-center text-[#8AAABB] hover:bg-[#F2F8FB] hover:text-[#7BAFC8] transition-colors"
        >
          <Smile className="h-3.5 w-3.5" />
        </button>
        {showPicker && (
          <div className="absolute bottom-full left-0 mb-1 bg-white border border-[#D8E8EE] rounded-[8px] shadow-lg p-2 flex gap-1 z-50" style={{ animation: "fadeIn 150ms ease-out" }}>
            {quickEmojis.map(e => (
              <button key={e} onClick={() => { onReact(e); setShowPicker(false); }} className="h-8 w-8 rounded hover:bg-[#F2F8FB] flex items-center justify-center text-[16px] transition-colors">
                {e}
              </button>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}

// ─── @Mention Input ─────────────────────────────────────────────

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  teamMembers?: { id: string; name: string }[];
  placeholder?: string;
}

export function MentionInput({ value, onChange, onSend, teamMembers = [], placeholder = "Type a message..." }: MentionInputProps) {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !showMentions) {
      e.preventDefault();
      onSend();
    }
    if (e.key === "@") {
      setShowMentions(true);
      setMentionFilter("");
    }
    if (e.key === "Escape") setShowMentions(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    onChange(val);

    // Check if user is typing after @
    const lastAt = val.lastIndexOf("@");
    if (lastAt !== -1 && lastAt === val.length - 1) {
      setShowMentions(true);
      setMentionFilter("");
    } else if (showMentions && lastAt !== -1) {
      setMentionFilter(val.slice(lastAt + 1));
    } else {
      setShowMentions(false);
    }
  }

  function insertMention(name: string) {
    const lastAt = value.lastIndexOf("@");
    const newValue = value.slice(0, lastAt) + `@${name} `;
    onChange(newValue);
    setShowMentions(false);
    inputRef.current?.focus();
  }

  const filtered = teamMembers.filter(m =>
    m.name.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  return (
    <div className="relative flex-1">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-[8px] border-[1.5px] border-[#D8E8EE] px-3 py-2 text-[13px] font-sans text-[#1A2C38] focus:outline-none focus:border-[#7BAFC8]"
      />
      {showMentions && filtered.length > 0 && (
        <div className="absolute bottom-full left-0 mb-1 bg-white border border-[#D8E8EE] rounded-[8px] shadow-lg w-48 max-h-40 overflow-y-auto z-50" style={{ animation: "fadeIn 150ms ease-out" }}>
          {filtered.map(m => (
            <button
              key={m.id}
              onClick={() => insertMention(m.name)}
              className="w-full text-left px-3 py-2 text-[13px] font-sans text-[#1A2C38] hover:bg-[#F2F8FB] transition-colors flex items-center gap-2"
            >
              <AtSign className="h-3 w-3 text-[#7BAFC8]" />
              {m.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Thread Reply Indicator ─────────────────────────────────────

interface ThreadReplyProps {
  replyCount: number;
  onClick: () => void;
}

export function ThreadReplyIndicator({ replyCount, onClick }: ThreadReplyProps) {
  if (replyCount === 0) return null;
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-[11px] font-sans text-[#7BAFC8] hover:text-[#3D6E8A] hover:underline mt-1 transition-colors"
      style={{ fontWeight: 500 }}
    >
      <Reply className="h-3 w-3" />
      {replyCount} {replyCount === 1 ? "reply" : "replies"}
    </button>
  );
}
