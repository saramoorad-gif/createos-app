"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="text-[12px] font-sans text-[#3D6E8A] underline underline-offset-2 print:hidden"
    >
      Print / Save as PDF
    </button>
  );
}
