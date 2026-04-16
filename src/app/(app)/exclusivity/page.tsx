"use client";

import { useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { useSupabaseQuery } from "@/lib/hooks";
import { UpgradeGate } from "@/components/global/upgrade-gate";
import { TableSkeleton } from "@/components/global/skeleton";
import { formatDate, formatCurrency } from "@/lib/utils";
import { AlertTriangle, Shield, Calendar, CheckCircle2, Clock } from "lucide-react";

interface Deal {
  id: string;
  brand_name: string;
  stage: string;
  value: number;
  due_date: string | null;
  exclusivity_days: number | null;
  exclusivity_category: string | null;
  created_at: string;
}

export default function ExclusivityPage() {
  return (
    <UpgradeGate feature="exclusivity">
      <ExclusivityContent />
    </UpgradeGate>
  );
}

function ExclusivityContent() {
  const { data: deals, loading } = useSupabaseQuery<Deal>("deals", {
    order: { column: "created_at", ascending: false },
  });

  const now = new Date();

  // An exclusivity is "active" when the deal is contracted/in_progress/delivered/paid
  // AND exclusivity_days is set AND end date hasn't passed yet.
  const exclusivities = useMemo(() => {
    return deals
      .filter(
        (d) =>
          d.exclusivity_days &&
          d.exclusivity_days > 0 &&
          d.exclusivity_category &&
          ["contracted", "in_progress", "delivered", "paid"].includes(d.stage)
      )
      .map((d) => {
        // If there's a due_date, use that as the start of the exclusivity window.
        // Otherwise approximate from the deal's created_at.
        const start = d.due_date ? new Date(d.due_date) : new Date(d.created_at);
        const end = new Date(start.getTime() + (d.exclusivity_days || 0) * 86400000);
        const totalMs = end.getTime() - start.getTime();
        const elapsedMs = Math.min(Math.max(now.getTime() - start.getTime(), 0), totalMs);
        const progressPct = totalMs > 0 ? (elapsedMs / totalMs) * 100 : 0;
        const daysRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000));
        const isActive = now < end;
        const isExpiringSoon = isActive && daysRemaining <= 14;

        return {
          ...d,
          start,
          end,
          progressPct,
          daysRemaining,
          isActive,
          isExpiringSoon,
        };
      })
      .sort((a, b) => a.end.getTime() - b.end.getTime());
  }, [deals, now]);

  const active = exclusivities.filter((e) => e.isActive);
  const expired = exclusivities.filter((e) => !e.isActive);
  const expiringSoon = active.filter((e) => e.isExpiringSoon);

  // Group active exclusivities by category for the conflict-checker sidebar
  const blockedCategories = useMemo(() => {
    const map = new Map<string, { count: number; brands: string[]; earliestEnd: Date }>();
    active.forEach((e) => {
      if (!e.exclusivity_category) return;
      const cat = e.exclusivity_category;
      const existing = map.get(cat);
      if (existing) {
        existing.count += 1;
        existing.brands.push(e.brand_name);
        if (e.end < existing.earliestEnd) existing.earliestEnd = e.end;
      } else {
        map.set(cat, { count: 1, brands: [e.brand_name], earliestEnd: e.end });
      }
    });
    return Array.from(map.entries()).map(([category, info]) => ({
      category,
      ...info,
    }));
  }, [active]);

  if (loading) return <TableSkeleton rows={4} cols={4} />;

  return (
    <div>
      <PageHeader
        headline={
          <>
            Exclusivity <em className="italic text-[#7BAFC8]">tracker</em>
          </>
        }
        subheading="Track active exclusivity clauses and avoid conflicts before signing new deals."
        stats={[
          { value: String(active.length), label: "Active clauses" },
          { value: String(expiringSoon.length), label: "Expiring in 14 days" },
          { value: String(blockedCategories.length), label: "Blocked categories" },
        ]}
      />

      {/* Expiring-soon warning banner */}
      {expiringSoon.length > 0 && (
        <div className="mb-6 bg-[#FFF4EC] border-[1.5px] border-[#A07830]/20 rounded-[10px] p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-[#A07830] flex-shrink-0" />
          <div className="flex-1">
            <p className="text-[13px] font-sans text-[#A07830]" style={{ fontWeight: 600 }}>
              {expiringSoon.length} exclusivity clause{expiringSoon.length === 1 ? "" : "s"} expiring within 14 days
            </p>
            <p className="text-[12px] font-sans text-[#A07830]/80">
              Once these expire you&apos;ll be free to work with competitors in the same category again.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Active + expired exclusivities list */}
        <div className="space-y-6">
          {/* Active clauses */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-[#7BAFC8]" />
              <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB]" style={{ fontWeight: 600 }}>
                ACTIVE CLAUSES
              </p>
            </div>

            {active.length === 0 ? (
              <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-8 text-center">
                <CheckCircle2 className="h-8 w-8 text-[#3D7A58] mx-auto mb-3" />
                <p className="text-[14px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>
                  No active exclusivities
                </p>
                <p className="text-[12px] font-sans text-[#8AAABB] mt-1">
                  You&apos;re free to pitch any brand. Add exclusivity terms on a deal&apos;s detail page.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {active.map((e) => (
                  <div
                    key={e.id}
                    className={`bg-white border-[1.5px] rounded-[10px] p-5 ${
                      e.isExpiringSoon ? "border-[#A07830]/40" : "border-[#D8E8EE]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="min-w-0">
                        <h3 className="text-[16px] font-serif text-[#1A2C38]">{e.brand_name}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[11px] font-sans uppercase tracking-[1.5px] px-2 py-0.5 rounded-full bg-[#F2F8FB] text-[#3D6E8A]" style={{ fontWeight: 600 }}>
                            {e.exclusivity_category}
                          </span>
                          {e.value > 0 && (
                            <span className="text-[12px] font-sans text-[#8AAABB]">{formatCurrency(e.value)}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p
                          className={`text-[18px] font-serif ${
                            e.isExpiringSoon ? "text-[#A07830]" : "text-[#1A2C38]"
                          }`}
                        >
                          {e.daysRemaining} days
                        </p>
                        <p className="text-[11px] font-sans text-[#8AAABB]">remaining</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 bg-[#F2F8FB] rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full transition-all ${
                          e.isExpiringSoon ? "bg-[#A07830]" : "bg-[#7BAFC8]"
                        }`}
                        style={{ width: `${Math.min(100, e.progressPct)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-sans text-[#8AAABB]">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Started {formatDate(e.start.toISOString())}
                      </span>
                      <span>Expires {formatDate(e.end.toISOString())}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expired clauses */}
          {expired.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-[#8AAABB]" />
                <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB]" style={{ fontWeight: 600 }}>
                  EXPIRED ({expired.length})
                </p>
              </div>
              <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] overflow-hidden">
                {expired.slice(0, 5).map((e, i) => (
                  <div
                    key={e.id}
                    className={`flex items-center justify-between px-5 py-3 ${
                      i < 4 ? "border-b border-[#EEE8E0]" : ""
                    }`}
                  >
                    <div>
                      <p className="text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>
                        {e.brand_name}
                      </p>
                      <p className="text-[11px] font-sans text-[#8AAABB]">
                        {e.exclusivity_category} — expired {formatDate(e.end.toISOString())}
                      </p>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-[#3D7A58]" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Conflict-checker sidebar */}
        <aside className="space-y-4">
          <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5">
            <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-3" style={{ fontWeight: 600 }}>
              BLOCKED CATEGORIES
            </p>
            {blockedCategories.length === 0 ? (
              <p className="text-[12px] font-sans text-[#8AAABB] italic">
                No categories blocked. You can pitch any brand.
              </p>
            ) : (
              <>
                <p className="text-[12px] font-sans text-[#4A6070] mb-3 leading-relaxed">
                  Before pitching a new brand, check if their category conflicts:
                </p>
                <div className="space-y-2.5">
                  {blockedCategories.map(({ category, count, brands, earliestEnd }) => {
                    const daysUntilFree = Math.max(
                      0,
                      Math.ceil((earliestEnd.getTime() - now.getTime()) / 86400000)
                    );
                    return (
                      <div key={category} className="border-l-2 border-[#A03D3D] pl-3">
                        <p className="text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>
                          {category}
                        </p>
                        <p className="text-[11px] font-sans text-[#8AAABB]">
                          {brands.slice(0, 2).join(", ")}
                          {brands.length > 2 && ` +${brands.length - 2} more`}
                        </p>
                        <p className="text-[11px] font-sans text-[#A03D3D]" style={{ fontWeight: 500 }}>
                          Free in {daysUntilFree} day{daysUntilFree === 1 ? "" : "s"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="bg-[#F2F8FB] border-[1.5px] border-[#D8E8EE] rounded-[10px] p-4">
            <p className="text-[12px] font-sans text-[#1A2C38] leading-relaxed" style={{ fontWeight: 500 }}>
              Tip: always try to negotiate exclusivity down
            </p>
            <p className="text-[11px] font-sans text-[#8AAABB] mt-1 leading-relaxed">
              Brands usually ask for 6–12 months of category exclusivity. Counter with 30–90 days — it&apos;s often accepted and keeps your pipeline flexible.
            </p>
          </div>

          <Link
            href="/deals"
            className="block text-center text-[12px] font-sans text-[#7BAFC8] hover:underline"
          >
            Edit exclusivities on deals →
          </Link>
        </aside>
      </div>
    </div>
  );
}
