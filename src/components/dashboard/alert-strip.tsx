"use client";

import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

export function AlertStrip() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
      <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
      <p className="flex-1 text-sm text-red-800">
        <span className="font-semibold">Exclusivity conflict:</span>{" "}
        Aritzia deal has a 90-day fashion exclusivity clause that overlaps with your Mejuri jewelry campaign. Review before signing.
      </p>
      <button
        onClick={() => setVisible(false)}
        className="text-red-400 hover:text-red-600 flex-shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
