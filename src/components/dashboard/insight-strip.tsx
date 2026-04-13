"use client";

import { Sparkles, X } from "lucide-react";
import { useState } from "react";

export function InsightStrip() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50/70 px-4 py-3">
      <Sparkles className="h-4 w-4 text-amber-600 flex-shrink-0" />
      <p className="flex-1 text-sm text-amber-900">
        <span className="font-semibold">AI Insight:</span>{" "}
        Your audience&apos;s sponsor tolerance is at 72% — you can comfortably add 1 more sponsored post this month without engagement drop-off.
      </p>
      <button
        onClick={() => setVisible(false)}
        className="text-amber-400 hover:text-amber-600 flex-shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
