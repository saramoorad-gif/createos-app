"use client";

import { useState, useMemo } from "react";
import { ArrowLeft, Search, Pin, ChevronRight } from "lucide-react";
import { agencyRoster, type CreatorProfile } from "@/lib/placeholder-data";
import { formatCurrency } from "@/lib/utils";

type ProfileSubTab = "overview" | "deals" | "brands" | "performance" | "rates" | "growth" | "notes";

const subTabs: { key: ProfileSubTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "deals", label: "Deal History" },
  { key: "brands", label: "Brands" },
  { key: "performance", label: "Performance" },
  { key: "rates", label: "Rates" },
  { key: "growth", label: "Growth" },
  { key: "notes", label: "Notes" },
];

function healthColor(score: number) {
  if (score >= 80) return { dot: "bg-emerald-500", text: "text-emerald-700", ring: "border-emerald-400" };
  if (score >= 60) return { dot: "bg-amber-500", text: "text-amber-700", ring: "border-amber-400" };
  return { dot: "bg-red-500", text: "text-red-700", ring: "border-red-400" };
}

function outcomeStyle(outcome: string) {
  switch (outcome) {
    case "completed": return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "active": return "bg-amber-50 text-amber-700 border border-amber-200";
    case "cancelled": return "bg-red-50 text-red-700 border border-red-200";
    default: return "bg-[#F2F8FB] text-[#8AAABB]";
  }
}

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return n.toString();
}

/* ─── List View ───────────────────────────────────────────────── */

function RosterList({
  creators,
  search,
  setSearch,
  onSelect,
}: {
  creators: CreatorProfile[];
  search: string;
  setSearch: (s: string) => void;
  onSelect: (c: CreatorProfile) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8AAABB]" />
        <input
          type="text"
          placeholder="Search creators..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D8E8EE] rounded-[10px] text-sm font-sans text-[#1A2C38] placeholder:text-[#8AAABB] focus:outline-none focus:border-[#7BAFC8] transition-colors"
        />
      </div>

      {/* Header Row */}
      <div className="hidden md:grid grid-cols-[1fr_120px_140px_80px_80px_100px_80px_60px] gap-3 px-4 py-2">
        <span className="text-[10px] font-sans font-semibold uppercase tracking-[3px] text-[#8AAABB]">Creator</span>
        <span className="text-[10px] font-sans font-semibold uppercase tracking-[3px] text-[#8AAABB]">Tier</span>
        <span className="text-[10px] font-sans font-semibold uppercase tracking-[3px] text-[#8AAABB]">Followers</span>
        <span className="text-[10px] font-sans font-semibold uppercase tracking-[3px] text-[#8AAABB]">Health</span>
        <span className="text-[10px] font-sans font-semibold uppercase tracking-[3px] text-[#8AAABB]">Active</span>
        <span className="text-[10px] font-sans font-semibold uppercase tracking-[3px] text-[#8AAABB]">Earned</span>
        <span className="text-[10px] font-sans font-semibold uppercase tracking-[3px] text-[#8AAABB]">Comm.</span>
        <span />
      </div>

      {/* Creator Rows */}
      {creators.length === 0 && (
        <div className="text-center py-12 text-[#8AAABB] text-sm font-sans">No creators match your search.</div>
      )}
      {creators.map((c) => {
        const hc = healthColor(c.healthScore);
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c)}
            className="w-full bg-white border border-[#D8E8EE] rounded-[10px] px-4 py-3 md:grid md:grid-cols-[1fr_120px_140px_80px_80px_100px_80px_60px] md:gap-3 md:items-center flex flex-col gap-2 text-left hover:border-[#7BAFC8]/40 transition-colors group"
          >
            {/* Creator info */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#F2F8FB] flex items-center justify-center text-xs font-sans font-semibold text-[#1A2C38] shrink-0">
                {c.avatar}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-sans font-medium text-[#1A2C38] truncate">{c.name}</p>
                <p className="text-xs font-sans text-[#8AAABB] truncate">{c.handle}</p>
              </div>
            </div>

            {/* Tier */}
            <div>
              <span className="inline-block px-2.5 py-0.5 text-[10px] font-sans font-semibold uppercase tracking-[1px] rounded-full bg-[#F2F8FB] text-[#1A2C38]">
                {c.tier}
              </span>
            </div>

            {/* Followers */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {c.platforms.map((p) => (
                <span key={p.name} className="text-xs font-mono text-[#8AAABB]">
                  {p.name.slice(0, 2).toUpperCase()} {formatFollowers(p.followers)}
                </span>
              ))}
            </div>

            {/* Health */}
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${hc.dot}`} />
              <span className={`text-sm font-mono font-medium ${hc.text}`}>{c.healthScore}</span>
            </div>

            {/* Active Deals */}
            <span className="text-sm font-mono text-[#1A2C38]">{c.dealsActive}</span>

            {/* Total Earned */}
            <span className="text-sm font-serif font-medium text-[#1A2C38]">{formatCurrency(c.totalEarned)}</span>

            {/* Commission */}
            <span className="text-sm font-mono text-[#8AAABB]">{c.commissionRate}%</span>

            {/* View */}
            <div className="flex justify-end">
              <ChevronRight className="w-4 h-4 text-[#8AAABB] group-hover:text-[#7BAFC8] transition-colors" />
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Creator Profile ─────────────────────────────────────────── */

function CreatorProfileView({
  creator,
  onBack,
}: {
  creator: CreatorProfile;
  onBack: () => void;
}) {
  const [activeSubTab, setActiveSubTab] = useState<ProfileSubTab>("overview");
  const hc = healthColor(creator.healthScore);

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-sans text-[#8AAABB] hover:text-[#1A2C38] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to roster
      </button>

      {/* Hero Card */}
      <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Avatar + Basic Info */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-14 h-14 rounded-full bg-[#F2F8FB] flex items-center justify-center text-lg font-sans font-semibold text-[#1A2C38] shrink-0">
              {creator.avatar}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-serif font-semibold text-[#1A2C38]">{creator.name}</h2>
              <p className="text-sm font-sans text-[#8AAABB]">{creator.handle}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="inline-block px-2.5 py-0.5 text-[10px] font-sans font-semibold uppercase tracking-[1px] rounded-full bg-[#F2F8FB] text-[#1A2C38]">
                  {creator.tier}
                </span>
                {creator.platforms.map((p) => (
                  <span key={p.name} className="text-xs font-sans text-[#8AAABB]">
                    {p.name} <span className="font-mono">{formatFollowers(p.followers)}</span>{" "}
                    <span className="text-[10px]">({p.engagement}%)</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Health + Commission + Joined */}
          <div className="flex items-center gap-6 shrink-0">
            {/* Health Score Circle */}
            <div className="flex flex-col items-center gap-1">
              <div className={`w-14 h-14 rounded-full border-[3px] ${hc.ring} flex items-center justify-center`}>
                <span className={`text-lg font-serif font-bold ${hc.text}`}>{creator.healthScore}</span>
              </div>
              <span className="text-[10px] font-sans font-semibold uppercase tracking-[2px] text-[#8AAABB]">Health</span>
            </div>

            {/* Commission */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-14 h-14 rounded-full border-[3px] border-[#D8E8EE] flex items-center justify-center">
                <span className="text-lg font-serif font-bold text-[#1A2C38]">{creator.commissionRate}%</span>
              </div>
              <span className="text-[10px] font-sans font-semibold uppercase tracking-[2px] text-[#8AAABB]">Comm.</span>
            </div>

            {/* Joined */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-mono text-[#1A2C38]">{creator.joinedDate}</span>
              <span className="text-[10px] font-sans font-semibold uppercase tracking-[2px] text-[#8AAABB]">Joined</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {subTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveSubTab(t.key)}
            className={`px-3 py-1.5 text-[10px] font-sans font-semibold uppercase tracking-[1.5px] rounded-full whitespace-nowrap transition-colors ${
              activeSubTab === t.key
                ? "bg-[#1A2C38] text-[#FAF8F4]"
                : "text-[#8AAABB] hover:text-[#1A2C38] hover:bg-[#F2F8FB]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Sub Tab Content */}
      {activeSubTab === "overview" && <OverviewTab creator={creator} />}
      {activeSubTab === "deals" && <DealHistoryTab creator={creator} />}
      {activeSubTab === "brands" && <BrandsTab creator={creator} />}
      {activeSubTab === "performance" && <PerformanceTab creator={creator} />}
      {activeSubTab === "rates" && <RatesTab creator={creator} />}
      {activeSubTab === "growth" && <GrowthTab creator={creator} />}
      {activeSubTab === "notes" && <NotesTab creator={creator} />}
    </div>
  );
}

/* ─── Overview Sub-Tab ────────────────────────────────────────── */

function OverviewTab({ creator }: { creator: CreatorProfile }) {
  const maxEarning = Math.max(...creator.monthlyEarnings.map((m) => m.amount), 1);
  const activeDealsList = creator.dealHistory.filter((d) => d.outcome === "active");

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Earned", value: formatCurrency(creator.totalEarned), serif: true },
          { label: "Avg Deal", value: formatCurrency(creator.avgDealValue), serif: true },
          { label: "Completed", value: creator.dealsCompleted.toString() },
          { label: "Active", value: creator.dealsActive.toString() },
          { label: "Brands", value: creator.brandsWorkedWith.toString() },
          { label: "Repeat Rate", value: `${creator.repeatBrandRate}%` },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-[#D8E8EE] rounded-[10px] p-4">
            <p className="text-[10px] font-sans font-semibold uppercase tracking-[3px] text-[#8AAABB] mb-1">{s.label}</p>
            <p className={`text-lg font-medium text-[#1A2C38] ${s.serif ? "font-serif" : "font-mono"}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Monthly Earnings Chart */}
      <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-5">
        <p className="text-[10px] font-sans font-semibold uppercase tracking-[3px] text-[#8AAABB] mb-4">Monthly Earnings</p>
        <div className="flex items-end gap-2 h-32">
          {creator.monthlyEarnings.slice(-6).map((m) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-mono text-[#8AAABB]">{formatCurrency(m.amount)}</span>
              <div
                className="w-full bg-[#7BAFC8]/20 rounded-t-sm relative group"
                style={{ height: `${(m.amount / maxEarning) * 100}%`, minHeight: m.amount > 0 ? "4px" : "0px" }}
              >
                <div
                  className="absolute bottom-0 left-0 right-0 bg-[#7BAFC8] rounded-t-sm transition-all"
                  style={{ height: "100%" }}
                />
              </div>
              <span className="text-[10px] font-sans text-[#8AAABB]">{m.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rate Card + Active Deals side by side */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Rate Card */}
        <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-5">
          <p className="text-[10px] font-sans font-semibold uppercase tracking-[3px] text-[#8AAABB] mb-3">Rate Card</p>
          <div className="space-y-2">
            {creator.rateCard.map((r) => (
              <div key={r.type} className="flex items-center justify-between py-1.5 border-b border-[#F2F8FB] last:border-0">
                <span className="text-sm font-sans text-[#1A2C38]">{r.type}</span>
                <span className="text-sm font-mono text-[#8AAABB]">{r.rate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Deals */}
        <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-5">
          <p className="text-[10px] font-sans font-semibold uppercase tracking-[3px] text-[#8AAABB] mb-3">Active Deals</p>
          {activeDealsList.length === 0 ? (
            <p className="text-sm text-[#8AAABB] font-sans">No active deals.</p>
          ) : (
            <div className="space-y-2">
              {activeDealsList.map((d, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#F2F8FB] last:border-0">
                  <div>
                    <p className="text-sm font-sans font-medium text-[#1A2C38]">{d.brand}</p>
                    <p className="text-xs font-sans text-[#8AAABB]">{d.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-serif font-medium text-[#1A2C38]">{formatCurrency(d.value)}</p>
                    <p className="text-[10px] font-mono text-[#8AAABB]">{d.stage}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Deal History Sub-Tab ────────────────────────────────────── */

function DealHistoryTab({ creator }: { creator: CreatorProfile }) {
  if (creator.dealHistory.length === 0) {
    return <EmptyState message="No deal history yet." />;
  }

  return (
    <div className="bg-white border border-[#D8E8EE] rounded-[10px] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#D8E8EE]">
              {["Brand", "Type", "Value", "Date", "Stage", "Commission", "Outcome"].map((h) => (
                <th key={h} className="px-4 py-3 text-[10px] font-sans font-semibold uppercase tracking-[3px] text-[#8AAABB]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {creator.dealHistory.map((d, i) => (
              <tr key={i} className="border-b border-[#F2F8FB] last:border-0">
                <td className="px-4 py-3 text-sm font-sans font-medium text-[#1A2C38]">{d.brand}</td>
                <td className="px-4 py-3 text-sm font-sans text-[#8AAABB]">{d.type}</td>
                <td className="px-4 py-3 text-sm font-serif font-medium text-[#1A2C38]">{formatCurrency(d.value)}</td>
                <td className="px-4 py-3 text-sm font-mono text-[#8AAABB]">{d.date}</td>
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-0.5 text-[10px] font-sans font-semibold uppercase tracking-[1px] rounded-full bg-[#F2F8FB] text-[#8AAABB]">
                    {d.stage}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-mono text-[#8AAABB]">{formatCurrency(d.commission)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-sans font-semibold uppercase tracking-[1px] rounded-full ${outcomeStyle(d.outcome)}`}>
                    {d.outcome}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Brands Sub-Tab ──────────────────────────────────────────── */

function BrandsTab({ creator }: { creator: CreatorProfile }) {
  if (creator.brandRelationships.length === 0) {
    return <EmptyState message="No brand relationships yet." />;
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {creator.brandRelationships.map((b) => (
        <div key={b.brand} className="bg-white border border-[#D8E8EE] rounded-[10px] p-5">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-base font-serif font-semibold text-[#1A2C38]">{b.brand}</h3>
            <div className="flex items-center gap-1.5">
              {b.exclusivity && (
                <span className="inline-block px-2 py-0.5 text-[10px] font-sans font-semibold uppercase tracking-[1px] rounded-full bg-[#7BAFC8]/10 text-[#7BAFC8] border border-[#7BAFC8]/20">
                  Exclusive
                </span>
              )}
              {b.repeat && (
                <span className="inline-block px-2 py-0.5 text-[10px] font-sans font-semibold uppercase tracking-[1px] rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Repeat
                </span>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs font-sans text-[#8AAABB]">Deals</span>
              <span className="text-sm font-mono text-[#1A2C38]">{b.deals}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-sans text-[#8AAABB]">Total Value</span>
              <span className="text-sm font-serif font-medium text-[#1A2C38]">{formatCurrency(b.totalValue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-sans text-[#8AAABB]">Avg Deal</span>
              <span className="text-sm font-serif text-[#1A2C38]">{formatCurrency(b.avgDeal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-sans text-[#8AAABB]">Last Deal</span>
              <span className="text-sm font-mono text-[#8AAABB]">{b.lastDeal}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Performance Sub-Tab ─────────────────────────────────────── */

function PerformanceTab({ creator }: { creator: CreatorProfile }) {
  if (creator.contentPerformance.length === 0) {
    return <EmptyState message="No performance data yet." />;
  }

  return (
    <div className="bg-white border border-[#D8E8EE] rounded-[10px] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#D8E8EE]">
              {["Deal", "Views", "Saves", "Shares", "Engagement", "Date"].map((h) => (
                <th key={h} className="px-4 py-3 text-[10px] font-sans font-semibold uppercase tracking-[3px] text-[#8AAABB]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {creator.contentPerformance.map((p, i) => (
              <tr key={i} className="border-b border-[#F2F8FB] last:border-0">
                <td className="px-4 py-3 text-sm font-sans font-medium text-[#1A2C38]">{p.deal}</td>
                <td className="px-4 py-3 text-sm font-mono text-[#1A2C38]">{p.views.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm font-mono text-[#8AAABB]">{p.saves.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm font-mono text-[#8AAABB]">{p.shares.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm font-mono font-medium text-[#7BAFC8]">{p.engagement}%</td>
                <td className="px-4 py-3 text-sm font-mono text-[#8AAABB]">{p.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Rates Sub-Tab ───────────────────────────────────────────── */

function RatesTab({ creator }: { creator: CreatorProfile }) {
  return (
    <div className="space-y-6">
      {/* Rate History */}
      <div className="bg-white border border-[#D8E8EE] rounded-[10px] overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <p className="text-[10px] font-sans font-semibold uppercase tracking-[3px] text-[#8AAABB]">Rate History</p>
        </div>
        {creator.rateHistory.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-[#8AAABB] font-sans">No rate history.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#D8E8EE]">
                  {["Date", "Type", "Rate"].map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] font-sans font-semibold uppercase tracking-[3px] text-[#8AAABB]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {creator.rateHistory.map((r, i) => {
                  const prev = i > 0 ? creator.rateHistory[i - 1].rate : null;
                  const diff = prev !== null ? r.rate - prev : 0;
                  return (
                    <tr key={i} className="border-b border-[#F2F8FB] last:border-0">
                      <td className="px-4 py-3 text-sm font-mono text-[#8AAABB]">{r.date}</td>
                      <td className="px-4 py-3 text-sm font-sans text-[#1A2C38]">{r.type}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-serif font-medium text-[#1A2C38]">{formatCurrency(r.rate)}</span>
                        {diff !== 0 && (
                          <span className={`ml-2 text-xs font-mono ${diff > 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {diff > 0 ? "+" : ""}{formatCurrency(diff)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Current Rate Card */}
      <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-5">
        <p className="text-[10px] font-sans font-semibold uppercase tracking-[3px] text-[#8AAABB] mb-3">Current Rate Card</p>
        <div className="space-y-2">
          {creator.rateCard.map((r) => (
            <div key={r.type} className="flex items-center justify-between py-1.5 border-b border-[#F2F8FB] last:border-0">
              <span className="text-sm font-sans text-[#1A2C38]">{r.type}</span>
              <span className="text-sm font-mono text-[#8AAABB]">{r.rate}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Growth Sub-Tab ──────────────────────────────────────────── */

function GrowthTab({ creator }: { creator: CreatorProfile }) {
  if (creator.followerGrowth.length === 0) {
    return <EmptyState message="No growth data yet." />;
  }

  // Group by platform to calculate growth %
  const platforms = new Map<string, { first: number; last: number; entries: typeof creator.followerGrowth }>();
  creator.followerGrowth.forEach((g) => {
    const existing = platforms.get(g.platform);
    if (!existing) {
      platforms.set(g.platform, { first: g.count, last: g.count, entries: [g] });
    } else {
      existing.last = g.count;
      existing.entries.push(g);
    }
  });

  return (
    <div className="space-y-6">
      {/* Growth Summary Cards */}
      <div className="grid md:grid-cols-3 gap-3">
        {Array.from(platforms.entries()).map(([platform, data]) => {
          const pctChange = data.first > 0 ? ((data.last - data.first) / data.first) * 100 : 0;
          return (
            <div key={platform} className="bg-white border border-[#D8E8EE] rounded-[10px] p-4">
              <p className="text-[10px] font-sans font-semibold uppercase tracking-[3px] text-[#8AAABB] mb-1">{platform}</p>
              <p className="text-lg font-serif font-medium text-[#1A2C38]">{formatFollowers(data.last)}</p>
              <p className={`text-sm font-mono ${pctChange >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {pctChange >= 0 ? "+" : ""}{pctChange.toFixed(1)}% growth
              </p>
            </div>
          );
        })}
      </div>

      {/* Full Table */}
      <div className="bg-white border border-[#D8E8EE] rounded-[10px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#D8E8EE]">
                {["Date", "Platform", "Count"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-sans font-semibold uppercase tracking-[3px] text-[#8AAABB]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {creator.followerGrowth.map((g, i) => (
                <tr key={i} className="border-b border-[#F2F8FB] last:border-0">
                  <td className="px-4 py-3 text-sm font-mono text-[#8AAABB]">{g.date}</td>
                  <td className="px-4 py-3 text-sm font-sans text-[#1A2C38]">{g.platform}</td>
                  <td className="px-4 py-3 text-sm font-mono text-[#1A2C38]">{g.count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Notes Sub-Tab ───────────────────────────────────────────── */

function NotesTab({ creator }: { creator: CreatorProfile }) {
  const pinned = creator.notes.filter((n) => n.pinned);
  const regular = creator.notes.filter((n) => !n.pinned);

  if (creator.notes.length === 0) {
    return <EmptyState message="No notes yet." />;
  }

  return (
    <div className="space-y-4">
      {/* Pinned Notes */}
      {pinned.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-sans font-semibold uppercase tracking-[3px] text-[#8AAABB]">Pinned</p>
          {pinned.map((n) => (
            <div key={n.id} className="bg-[#F2F8FB] border border-[#7BAFC8]/20 rounded-[10px] p-4">
              <div className="flex items-start gap-2">
                <Pin className="w-3.5 h-3.5 text-[#7BAFC8] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-sans text-[#1A2C38] leading-relaxed">{n.body}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-block px-2 py-0.5 text-[10px] font-sans font-semibold uppercase tracking-[1px] rounded-full bg-[#7BAFC8]/10 text-[#7BAFC8]">
                      #{n.tag}
                    </span>
                    <span className="text-[10px] font-mono text-[#8AAABB]">{n.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Regular Notes */}
      {regular.length > 0 && (
        <div className="space-y-3">
          {pinned.length > 0 && (
            <p className="text-[10px] font-sans font-semibold uppercase tracking-[3px] text-[#8AAABB]">Notes</p>
          )}
          {regular.map((n) => (
            <div key={n.id} className="bg-white border border-[#D8E8EE] rounded-[10px] p-4">
              <p className="text-sm font-sans text-[#1A2C38] leading-relaxed">{n.body}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-block px-2 py-0.5 text-[10px] font-sans font-semibold uppercase tracking-[1px] rounded-full bg-[#F2F8FB] text-[#8AAABB]">
                  #{n.tag}
                </span>
                <span className="text-[10px] font-mono text-[#8AAABB]">{n.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Empty State ─────────────────────────────────────────────── */

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-12 text-center">
      <p className="text-sm font-sans text-[#8AAABB]">{message}</p>
    </div>
  );
}

/* ─── Main Export ─────────────────────────────────────────────── */

export function RosterTab() {
  const [search, setSearch] = useState("");
  const [selectedCreator, setSelectedCreator] = useState<CreatorProfile | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return agencyRoster;
    const q = search.toLowerCase();
    return agencyRoster.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.handle.toLowerCase().includes(q) ||
        c.tier.toLowerCase().includes(q)
    );
  }, [search]);

  if (selectedCreator) {
    return (
      <CreatorProfileView
        creator={selectedCreator}
        onBack={() => setSelectedCreator(null)}
      />
    );
  }

  return (
    <RosterList
      creators={filtered}
      search={search}
      setSearch={setSearch}
      onSelect={setSelectedCreator}
    />
  );
}
