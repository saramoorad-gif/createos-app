"use client";

import { useState, useRef, useEffect } from "react";

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  type?: "text" | "number" | "date";
}

export function InlineEdit({ value, onSave, className = "", inputClassName = "", placeholder = "", type = "text" }: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  function handleSave() {
    if (draft !== value) {
      onSave(draft);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") { setDraft(value); setEditing(false); }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`rounded-[6px] border-[1.5px] border-[#7BAFC8] px-2 py-1 text-[14px] font-sans text-[#1A2C38] bg-white outline-none ${inputClassName}`}
        style={{ animation: "fadeIn 120ms ease-out" }}
      />
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      className={`cursor-pointer rounded-[4px] px-1 py-0.5 transition-colors hover:bg-[#F2F8FB] inline-flex items-center gap-1 ${className}`}
      title="Click to edit"
    >
      {value || <span className="text-[#8AAABB] italic">{placeholder || "Click to edit"}</span>}
      {saved && <span className="text-[#3D7A58] text-[11px]">✓</span>}
    </span>
  );
}

interface InlineSelectProps {
  value: string;
  options: { value: string; label: string; color?: string }[];
  onSave: (value: string) => void;
  className?: string;
}

export function InlineSelect({ value, options, onSave, className = "" }: InlineSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = options.find(o => o.value === value);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className={`text-[10px] font-sans uppercase tracking-[2px] px-2.5 py-1 rounded-full cursor-pointer transition-colors hover:opacity-80 ${current?.color || "bg-[#F2F8FB] text-[#3D6E8A]"} ${className}`}
        style={{ fontWeight: 700 }}
      >
        {current?.label || value}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-[#D8E8EE] rounded-[8px] shadow-lg z-50 min-w-[140px] py-1" style={{ animation: "fadeIn 150ms ease-out" }}>
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onSave(opt.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-[12px] font-sans hover:bg-[#F2F8FB] transition-colors ${value === opt.value ? "text-[#7BAFC8] font-medium" : "text-[#1A2C38]"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}
