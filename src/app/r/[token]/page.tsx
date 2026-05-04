// Public brand-report viewer.
//
// An agency saves a report snapshot via the agency reports tab; we
// generate a 24-byte random share_token and surface a link like
// /r/<token>. Brand partners click and see a clean, read-only render
// of whatever the agency snapshotted. No auth, no signup.

import { notFound } from "next/navigation";
import { PrintButton } from "./print-button";

type ReportPayload = {
  title: string;
  kind: string;
  created_at: string;
  body: Record<string, any>;
};

async function fetchReport(token: string): Promise<ReportPayload | null> {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "https://createsuite.co";
  try {
    const res = await fetch(`${base}/api/brand-reports/${encodeURIComponent(token)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.report ?? null;
  } catch {
    return null;
  }
}

function fmt(d: string) {
  try {
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return d;
  }
}

export default async function PublicReport({ params }: { params: { token: string } }) {
  const report = await fetchReport(params.token);
  if (!report) notFound();

  const sections: Array<{ label: string; value: any }> = Object.entries(report.body || {}).map(
    ([label, value]) => ({ label, value })
  );

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <div className="max-w-3xl mx-auto px-6 py-12 print:py-4 print:px-4">
        <div className="flex items-baseline justify-between border-b border-[#E3DED2] pb-4 mb-8">
          <div className="font-serif text-[20px] tracking-[-0.01em] text-[#0F1E28]">
            Create<em className="italic text-[#3D6E8A]">Suite.</em>
          </div>
          <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#8AAABB]">
            Generated {fmt(report.created_at)}
          </div>
        </div>

        <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#8AAABB] mb-2">
          {report.kind.replace(/-/g, " ")}
        </p>
        <h1 className="font-serif text-[40px] leading-tight text-[#0F1E28] mb-8">
          {report.title}
        </h1>

        <div className="space-y-6">
          {sections.length === 0 && (
            <p className="text-[14px] font-sans text-[#8AAABB]">This report has no content.</p>
          )}
          {sections.map((s) => (
            <div key={s.label} className="bg-white border border-[#D8E8EE] rounded-[10px] p-5">
              <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#8AAABB] mb-2">
                {s.label.replace(/_/g, " ")}
              </p>
              {typeof s.value === "string" || typeof s.value === "number" ? (
                <p className="text-[18px] font-serif text-[#0F1E28]">{String(s.value)}</p>
              ) : Array.isArray(s.value) ? (
                <ul className="space-y-1 text-[14px] font-sans text-[#1A2C38]">
                  {s.value.map((row: any, i: number) => (
                    <li key={i} className="flex items-baseline justify-between border-b border-[#F0EAE0] pb-1">
                      <span>{typeof row === "object" ? row.label || JSON.stringify(row) : String(row)}</span>
                      {typeof row === "object" && row.value !== undefined && (
                        <span className="font-mono text-[#3D6E8A]">{String(row.value)}</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <pre className="text-[13px] font-mono text-[#1A2C38] overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(s.value, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-[#E3DED2] flex items-center justify-between">
          <p className="text-[11px] font-sans text-[#8AAABB]">
            Confidential — shared by your agency partner via CreateSuite.
          </p>
          <PrintButton />
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
