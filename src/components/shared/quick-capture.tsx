"use client";

import { useState } from "react";
import {
  Plus,
  X,
  Mail,
  Sparkles,
  Handshake,
  FileUp,
} from "lucide-react";

const actions = [
  { icon: Mail, label: "Forward email", color: "bg-blue-500" },
  { icon: Sparkles, label: "AI scan brief", color: "bg-amber-500" },
  { icon: Handshake, label: "New deal", color: "bg-terra-500" },
  { icon: FileUp, label: "Upload contract", color: "bg-purple-500" },
];

export function QuickCapture() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {open && (
        <div
          className="absolute bottom-16 right-0 w-48 rounded-xl border border-border bg-white shadow-lg overflow-hidden mb-2 animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          {actions.map((action) => (
            <button
              key={action.label}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-foreground hover:bg-warm-100 transition-colors"
              onClick={() => setOpen(false)}
            >
              <div className={`${action.color} rounded-md p-1`}>
                <action.icon className="h-3.5 w-3.5 text-white" />
              </div>
              {action.label}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-150 ${
          open
            ? "bg-foreground text-white rotate-45"
            : "bg-terra-500 text-white hover:bg-terra-600 hover:scale-105 active:scale-95"
        }`}
      >
        {open ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
      </button>
    </div>
  );
}
