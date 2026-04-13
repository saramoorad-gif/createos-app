"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  X,
  Users,
  Calendar,
  DollarSign,
  FileText,
  BarChart3,
  ClipboardList,
  CheckCircle2,
  Clock,
  Circle,
  Eye,
  Download,
} from "lucide-react";
import { campaigns, agencyRoster, type Campaign } from "@/lib/placeholder-data";
import { formatCurrency, formatDate } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Status pill
// ---------------------------------------------------------------------------
function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    in_progress: "bg-emerald-50 text-emerald-700 border-emerald-200",
    planning: "bg-amber-50 text-amber-700 border-amber-200",
    not_started: "bg-amber-50 text-amber-700 border-amber-200",
    completed: "bg-[#F2EEE8] text-[#9A9088] border-[#E5E0D8]",
    delivered: "bg-[#F2EEE8] text-[#9A9088] border-[#E5E0D8]",
    paused: "bg-red-50 text-red-600 border-red-200",
    contracted: "bg-blue-50 text-blue-700 border-blue-200",
  };
  const label = status.replace(/_/g, " ");
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[10px] font-sans font-600 uppercase tracking-[1px] rounded-full border ${map[status] ?? "bg-gray-50 text-gray-500 border-gray-200"}`}
    >
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Section label
// ---------------------------------------------------------------------------
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#9A9088] mb-3">
      {children}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Sub-tab button
// ---------------------------------------------------------------------------
function SubTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-[11px] font-sans font-500 rounded-full transition-colors whitespace-nowrap ${
        active
          ? "bg-[#1C1714] text-[#F7F4EF]"
          : "text-[#9A9088] hover:text-[#1C1714] hover:bg-[#F2EEE8]"
      }`}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Hardcoded deliverables for kanban
// ---------------------------------------------------------------------------
const kanbanCards: {
  id: string;
  creator: string;
  type: string;
  dueDate: string;
  column: "not_started" | "in_progress" | "in_review" | "approved";
}[] = [
  { id: "d1", creator: "Brianna Cole", type: "IG Reel", dueDate: "2026-04-18", column: "in_progress" },
  { id: "d2", creator: "Maya Chen", type: "TikTok", dueDate: "2026-04-22", column: "not_started" },
  { id: "d3", creator: "Jade Park", type: "TikTok", dueDate: "2026-04-25", column: "not_started" },
  { id: "d4", creator: "Brianna Cole", type: "TikTok", dueDate: "2026-04-20", column: "in_review" },
  { id: "d5", creator: "Maya Chen", type: "IG Reel", dueDate: "2026-04-28", column: "in_progress" },
  { id: "d6", creator: "Jade Park", type: "IG Reel", dueDate: "2026-04-30", column: "not_started" },
  { id: "d7", creator: "Brianna Cole", type: "Stories", dueDate: "2026-04-15", column: "approved" },
  { id: "d8", creator: "Maya Chen", type: "TikTok", dueDate: "2026-04-19", column: "approved" },
];

const columnMeta: Record<string, { label: string; icon: React.ReactNode }> = {
  not_started: { label: "Not Started", icon: <Circle size={12} className="text-[#9A9088]" /> },
  in_progress: { label: "In Progress", icon: <Clock size={12} className="text-amber-500" /> },
  in_review: { label: "In Review", icon: <Eye size={12} className="text-blue-500" /> },
  approved: { label: "Approved", icon: <CheckCircle2 size={12} className="text-emerald-500" /> },
};

// ---------------------------------------------------------------------------
// Create Campaign Modal
// ---------------------------------------------------------------------------
function CreateCampaignModal({ onClose }: { onClose: () => void }) {
  const [selectedCreators, setSelectedCreators] = useState<string[]>([]);

  function toggleCreator(id: string) {
    setSelectedCreators((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-[10px] border border-[#E5E0D8] w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-[#E5E0D8]">
          <h2 className="font-serif text-lg text-[#1C1714]">New Campaign</h2>
          <button onClick={onClose} className="text-[#9A9088] hover:text-[#1C1714] transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <SectionLabel>Campaign name</SectionLabel>
            <input
              type="text"
              placeholder="e.g. Summer Glow Launch"
              className="w-full px-3 py-2 text-sm font-sans text-[#1C1714] bg-[#F7F4EF] border border-[#E5E0D8] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C4714A] placeholder:text-[#9A9088]"
            />
          </div>

          <div>
            <SectionLabel>Brand</SectionLabel>
            <input
              type="text"
              placeholder="e.g. Glossier"
              className="w-full px-3 py-2 text-sm font-sans text-[#1C1714] bg-[#F7F4EF] border border-[#E5E0D8] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C4714A] placeholder:text-[#9A9088]"
            />
          </div>

          <div>
            <SectionLabel>Brief</SectionLabel>
            <textarea
              rows={3}
              placeholder="Describe the campaign objectives..."
              className="w-full px-3 py-2 text-sm font-sans text-[#1C1714] bg-[#F7F4EF] border border-[#E5E0D8] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C4714A] placeholder:text-[#9A9088] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <SectionLabel>Budget</SectionLabel>
              <input
                type="number"
                placeholder="10000"
                className="w-full px-3 py-2 text-sm font-sans text-[#1C1714] bg-[#F7F4EF] border border-[#E5E0D8] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C4714A] placeholder:text-[#9A9088]"
              />
            </div>
            <div>
              <SectionLabel>Commission %</SectionLabel>
              <input
                type="number"
                placeholder="15"
                className="w-full px-3 py-2 text-sm font-sans text-[#1C1714] bg-[#F7F4EF] border border-[#E5E0D8] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C4714A] placeholder:text-[#9A9088]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <SectionLabel>Start date</SectionLabel>
              <input
                type="date"
                className="w-full px-3 py-2 text-sm font-mono text-[#1C1714] bg-[#F7F4EF] border border-[#E5E0D8] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C4714A]"
              />
            </div>
            <div>
              <SectionLabel>End date</SectionLabel>
              <input
                type="date"
                className="w-full px-3 py-2 text-sm font-mono text-[#1C1714] bg-[#F7F4EF] border border-[#E5E0D8] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C4714A]"
              />
            </div>
          </div>

          <div>
            <SectionLabel>Assign creators</SectionLabel>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {agencyRoster.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#F7F4EF] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedCreators.includes(c.id)}
                    onChange={() => toggleCreator(c.id)}
                    className="accent-[#C4714A] w-4 h-4"
                  />
                  <div className="w-7 h-7 rounded-full bg-[#F2EEE8] flex items-center justify-center text-[10px] font-sans font-600 text-[#9A9088]">
                    {c.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-sans text-[#1C1714]">{c.name}</p>
                    <p className="text-[11px] font-sans text-[#9A9088]">{c.handle}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-[#E5E0D8]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-sans text-[#9A9088] hover:text-[#1C1714] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-sans font-600 bg-[#1C1714] text-[#F7F4EF] rounded-lg hover:bg-[#2a2420] transition-colors"
          >
            Create Campaign
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Overview sub-tab
// ---------------------------------------------------------------------------
function OverviewSubTab({ campaign }: { campaign: Campaign }) {
  const totalDeliverables = campaign.creators.reduce(
    (sum, c) => sum + c.deliverables.length,
    0
  );

  // Timeline calculations
  const start = new Date(campaign.startDate).getTime();
  const end = new Date(campaign.endDate).getTime();
  const now = Date.now();
  const totalDuration = end - start;
  const elapsed = Math.min(Math.max(now - start, 0), totalDuration);
  const progressPct = totalDuration > 0 ? (elapsed / totalDuration) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Brief */}
      <div className="bg-white rounded-[10px] border border-[#E5E0D8] p-5">
        <SectionLabel>Campaign brief</SectionLabel>
        <p className="text-sm font-sans text-[#1C1714] leading-relaxed">{campaign.brief}</p>
      </div>

      {/* Brand contact */}
      <div className="bg-white rounded-[10px] border border-[#E5E0D8] p-5">
        <SectionLabel>Brand contact</SectionLabel>
        <p className="text-sm font-sans text-[#1C1714]">{campaign.brandContact}</p>
      </div>

      {/* Timeline bar */}
      <div className="bg-white rounded-[10px] border border-[#E5E0D8] p-5">
        <SectionLabel>Timeline</SectionLabel>
        <div className="flex items-center justify-between text-[11px] font-mono text-[#9A9088] mb-2">
          <span>{formatDate(campaign.startDate)}</span>
          <span>{formatDate(campaign.endDate)}</span>
        </div>
        <div className="relative h-3 bg-[#F2EEE8] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#C4714A]/30 rounded-full"
            style={{ width: `${Math.min(progressPct, 100)}%` }}
          />
          {progressPct > 0 && progressPct < 100 && (
            <div
              className="absolute top-0 w-0.5 h-full bg-[#C4714A]"
              style={{ left: `${progressPct}%` }}
            />
          )}
        </div>
        <p className="text-[10px] font-sans text-[#9A9088] mt-1.5">
          Today marker shown at {Math.round(progressPct)}% through campaign
        </p>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total budget", value: formatCurrency(campaign.budget) },
          { label: "Agency commission", value: formatCurrency(campaign.agencyCommission) },
          { label: "Creators", value: campaign.creators.length.toString() },
          { label: "Deliverables", value: totalDeliverables.toString() },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-[10px] border border-[#E5E0D8] p-4">
            <SectionLabel>{s.label}</SectionLabel>
            <p className="text-xl font-serif text-[#1C1714]">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Creators sub-tab
// ---------------------------------------------------------------------------
function CreatorsSubTab({ campaign }: { campaign: Campaign }) {
  const approvalMap: Record<string, { label: string; cls: string }> = {
    in_progress: { label: "Approved", cls: "text-emerald-600" },
    delivered: { label: "Approved", cls: "text-emerald-600" },
    contracted: { label: "Pending", cls: "text-amber-600" },
    not_started: { label: "Pending", cls: "text-amber-600" },
  };

  return (
    <div className="space-y-3">
      {campaign.creators.map((c) => {
        const roster = agencyRoster.find((r) => r.id === c.creatorId);
        const approval = approvalMap[c.status] ?? { label: "Pending", cls: "text-amber-600" };

        return (
          <div
            key={c.creatorId}
            className="bg-white rounded-[10px] border border-[#E5E0D8] p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#F2EEE8] flex items-center justify-center text-xs font-sans font-600 text-[#9A9088]">
                  {roster?.avatar ?? c.name.split(" ").map((w) => w[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-sans font-600 text-[#1C1714]">{c.name}</p>
                  <p className="text-[11px] font-sans text-[#9A9088]">
                    {roster?.handle ?? ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status={c.status} />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm mb-3">
              <div>
                <SectionLabel>Allocation</SectionLabel>
                <p className="font-serif text-[#1C1714]">{formatCurrency(c.allocation)}</p>
              </div>
              <div className="text-right">
                <SectionLabel>Approval</SectionLabel>
                <p className={`font-sans font-600 text-sm ${approval.cls}`}>{approval.label}</p>
              </div>
            </div>

            <SectionLabel>Deliverables</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {c.deliverables.map((d) => (
                <span
                  key={d}
                  className="px-2 py-0.5 text-[11px] font-sans text-[#1C1714] bg-[#F7F4EF] border border-[#E5E0D8] rounded-full"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Deliverables sub-tab (Kanban)
// ---------------------------------------------------------------------------
function DeliverablesSubTab() {
  const columns: ("not_started" | "in_progress" | "in_review" | "approved")[] = [
    "not_started",
    "in_progress",
    "in_review",
    "approved",
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((col) => {
        const cards = kanbanCards.filter((c) => c.column === col);
        const meta = columnMeta[col];
        return (
          <div key={col}>
            <div className="flex items-center gap-1.5 mb-3">
              {meta.icon}
              <SectionLabel>{meta.label}</SectionLabel>
              <span className="ml-auto text-[10px] font-mono text-[#9A9088]">{cards.length}</span>
            </div>
            <div className="space-y-2">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded-[10px] border border-[#E5E0D8] p-3"
                >
                  <p className="text-[11px] font-sans font-600 text-[#1C1714] mb-1">
                    {card.creator}
                  </p>
                  <p className="text-xs font-sans text-[#9A9088] mb-2">{card.type}</p>
                  <p className="text-[10px] font-mono text-[#9A9088]">
                    Due {formatDate(card.dueDate)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Budget sub-tab
// ---------------------------------------------------------------------------
function BudgetSubTab({ campaign }: { campaign: Campaign }) {
  // Simulate invoiced / paid data
  const rows = campaign.creators.map((c, i) => {
    const invoiced = Math.round(c.allocation * (0.3 + i * 0.2));
    const paid = Math.round(invoiced * (i === 0 ? 0.8 : 0.5));
    return { ...c, invoiced, paid, remaining: c.allocation - paid };
  });

  const totalAllocation = rows.reduce((s, r) => s + r.allocation, 0);
  const totalInvoiced = rows.reduce((s, r) => s + r.invoiced, 0);
  const totalPaid = rows.reduce((s, r) => s + r.paid, 0);
  const totalRemaining = rows.reduce((s, r) => s + r.remaining, 0);

  return (
    <div className="bg-white rounded-[10px] border border-[#E5E0D8] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-sans">
          <thead>
            <tr className="border-b border-[#E5E0D8]">
              {["Creator", "Allocation", "Invoiced", "Paid", "Remaining"].map((h) => (
                <th
                  key={h}
                  className="text-left px-5 py-3 text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#9A9088]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.creatorId} className="border-b border-[#E5E0D8] last:border-0">
                <td className="px-5 py-3 text-[#1C1714]">{r.name}</td>
                <td className="px-5 py-3 font-mono text-[#1C1714]">
                  {formatCurrency(r.allocation)}
                </td>
                <td className="px-5 py-3 font-mono text-[#1C1714]">
                  {formatCurrency(r.invoiced)}
                </td>
                <td className="px-5 py-3 font-mono text-emerald-600">
                  {formatCurrency(r.paid)}
                </td>
                <td className="px-5 py-3 font-mono text-[#9A9088]">
                  {formatCurrency(r.remaining)}
                </td>
              </tr>
            ))}

            {/* Agency commission row */}
            <tr className="border-b border-[#E5E0D8] bg-[#F7F4EF]/50">
              <td className="px-5 py-3 text-[#9A9088] italic">Agency commission</td>
              <td className="px-5 py-3 font-mono text-[#9A9088]">
                {formatCurrency(campaign.agencyCommission)}
              </td>
              <td className="px-5 py-3 font-mono text-[#9A9088]">
                {formatCurrency(Math.round(campaign.agencyCommission * 0.5))}
              </td>
              <td className="px-5 py-3 font-mono text-[#9A9088]">
                {formatCurrency(Math.round(campaign.agencyCommission * 0.3))}
              </td>
              <td className="px-5 py-3 font-mono text-[#9A9088]">
                {formatCurrency(
                  campaign.agencyCommission -
                    Math.round(campaign.agencyCommission * 0.3)
                )}
              </td>
            </tr>

            {/* Total row */}
            <tr className="bg-[#1C1714] text-[#F7F4EF]">
              <td className="px-5 py-3 font-600">Total</td>
              <td className="px-5 py-3 font-mono font-600">
                {formatCurrency(totalAllocation + campaign.agencyCommission)}
              </td>
              <td className="px-5 py-3 font-mono font-600">
                {formatCurrency(
                  totalInvoiced + Math.round(campaign.agencyCommission * 0.5)
                )}
              </td>
              <td className="px-5 py-3 font-mono font-600">
                {formatCurrency(
                  totalPaid + Math.round(campaign.agencyCommission * 0.3)
                )}
              </td>
              <td className="px-5 py-3 font-mono font-600">
                {formatCurrency(
                  totalRemaining +
                    campaign.agencyCommission -
                    Math.round(campaign.agencyCommission * 0.3)
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Report sub-tab
// ---------------------------------------------------------------------------
function ReportSubTab({ campaign }: { campaign: Campaign }) {
  const [generated, setGenerated] = useState(false);

  const totalReach = campaign.creators.length * 185000; // simulated
  const deliverablesCompleted = Math.round(
    campaign.creators.reduce((s, c) => s + c.deliverables.length, 0) *
      (campaign.completionPct / 100)
  );
  const totalDeliverables = campaign.creators.reduce(
    (s, c) => s + c.deliverables.length,
    0
  );

  return (
    <div className="space-y-4">
      {!generated && (
        <div className="bg-white rounded-[10px] border border-[#E5E0D8] p-8 text-center">
          <BarChart3 size={32} className="mx-auto text-[#9A9088] mb-3" />
          <p className="text-sm font-sans text-[#9A9088] mb-4">
            Generate a summary report for {campaign.brand}
          </p>
          <button
            onClick={() => setGenerated(true)}
            className="px-5 py-2 text-sm font-sans font-600 bg-[#1C1714] text-[#F7F4EF] rounded-lg hover:bg-[#2a2420] transition-colors"
          >
            Generate Brand Report
          </button>
        </div>
      )}

      {generated && (
        <div className="space-y-4">
          <div className="bg-white rounded-[10px] border border-[#E5E0D8] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg text-[#1C1714]">
                Campaign Report: {campaign.name}
              </h3>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-sans font-600 text-[#9A9088] border border-[#E5E0D8] rounded-lg hover:text-[#1C1714] hover:border-[#1C1714] transition-colors">
                <Download size={12} />
                Export PDF
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {[
                { label: "Total reach", value: (totalReach / 1000).toFixed(0) + "K" },
                {
                  label: "Deliverables done",
                  value: `${deliverablesCompleted}/${totalDeliverables}`,
                },
                { label: "Budget spent", value: formatCurrency(Math.round(campaign.budget * (campaign.completionPct / 100))) },
                { label: "Completion", value: `${campaign.completionPct}%` },
              ].map((s) => (
                <div key={s.label} className="bg-[#F7F4EF] rounded-lg p-3">
                  <p className="text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#9A9088] mb-1">
                    {s.label}
                  </p>
                  <p className="text-lg font-serif text-[#1C1714]">{s.value}</p>
                </div>
              ))}
            </div>

            <SectionLabel>Per-creator performance</SectionLabel>
            <div className="space-y-2 mb-5">
              {campaign.creators.map((c) => {
                const reach = Math.round(185000 * (c.allocation / campaign.budget));
                return (
                  <div
                    key={c.creatorId}
                    className="flex items-center justify-between py-2 border-b border-[#E5E0D8] last:border-0"
                  >
                    <div>
                      <p className="text-sm font-sans font-600 text-[#1C1714]">{c.name}</p>
                      <p className="text-[11px] font-sans text-[#9A9088]">
                        {c.deliverables.length} deliverables
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono text-[#1C1714]">
                        {(reach / 1000).toFixed(0)}K reach
                      </p>
                      <p className="text-[11px] font-mono text-[#9A9088]">
                        {formatCurrency(c.allocation)} allocated
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <SectionLabel>Spend summary</SectionLabel>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#F7F4EF] rounded-lg p-3">
                <p className="text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#9A9088] mb-1">
                  Creator payouts
                </p>
                <p className="text-sm font-mono text-[#1C1714]">
                  {formatCurrency(campaign.budget - campaign.agencyCommission)}
                </p>
              </div>
              <div className="bg-[#F7F4EF] rounded-lg p-3">
                <p className="text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#9A9088] mb-1">
                  Agency fee
                </p>
                <p className="text-sm font-mono text-[#1C1714]">
                  {formatCurrency(campaign.agencyCommission)}
                </p>
              </div>
              <div className="bg-[#F7F4EF] rounded-lg p-3">
                <p className="text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#9A9088] mb-1">
                  Total
                </p>
                <p className="text-sm font-mono text-[#1C1714]">
                  {formatCurrency(campaign.budget)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Campaign Detail view
// ---------------------------------------------------------------------------
type DetailTab = "overview" | "creators" | "deliverables" | "budget" | "report";

function CampaignDetail({
  campaign,
  onBack,
}: {
  campaign: Campaign;
  onBack: () => void;
}) {
  const [subTab, setSubTab] = useState<DetailTab>("overview");

  const detailTabs: { key: DetailTab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <FileText size={13} /> },
    { key: "creators", label: "Creators", icon: <Users size={13} /> },
    { key: "deliverables", label: "Deliverables", icon: <ClipboardList size={13} /> },
    { key: "budget", label: "Budget", icon: <DollarSign size={13} /> },
    { key: "report", label: "Report", icon: <BarChart3 size={13} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-sans text-[#9A9088] hover:text-[#1C1714] transition-colors"
      >
        <ArrowLeft size={14} />
        Back to campaigns
      </button>

      {/* Header */}
      <div className="bg-white rounded-[10px] border border-[#E5E0D8] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div>
            <h2 className="font-serif text-xl text-[#1C1714]">{campaign.name}</h2>
            <p className="text-sm font-sans text-[#9A9088]">{campaign.brand}</p>
          </div>
          <StatusPill status={campaign.status} />
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm font-sans text-[#9A9088]">
          <span className="flex items-center gap-1">
            <Calendar size={13} />
            <span className="font-mono text-[12px]">
              {formatDate(campaign.startDate)} &mdash; {formatDate(campaign.endDate)}
            </span>
          </span>
          <span className="flex items-center gap-1">
            <DollarSign size={13} />
            <span className="font-serif text-[#1C1714]">
              {formatCurrency(campaign.budget)}
            </span>
          </span>
          <span className="text-[11px]">
            Commission: {formatCurrency(campaign.agencyCommission)}
          </span>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {detailTabs.map((t) => (
          <SubTab
            key={t.key}
            active={subTab === t.key}
            onClick={() => setSubTab(t.key)}
          >
            <span className="flex items-center gap-1.5">
              {t.icon}
              {t.label}
            </span>
          </SubTab>
        ))}
      </div>

      {/* Sub-tab content */}
      {subTab === "overview" && <OverviewSubTab campaign={campaign} />}
      {subTab === "creators" && <CreatorsSubTab campaign={campaign} />}
      {subTab === "deliverables" && <DeliverablesSubTab />}
      {subTab === "budget" && <BudgetSubTab campaign={campaign} />}
      {subTab === "report" && <ReportSubTab campaign={campaign} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export function CampaignsTab() {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const activeCampaigns = campaigns.filter((c) => c.status === "active");
  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);

  // Detail view
  if (selectedCampaign) {
    return (
      <CampaignDetail
        campaign={selectedCampaign}
        onBack={() => setSelectedCampaign(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Create modal */}
      {showCreateModal && (
        <CreateCampaignModal onClose={() => setShowCreateModal(false)} />
      )}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-[#1C1714] mb-1">
            Campaign <em>manager</em>
          </h1>
          <div className="flex items-center gap-4 text-sm font-sans text-[#9A9088]">
            <span>
              <span className="font-serif text-[#1C1714]">{campaigns.length}</span> campaigns
            </span>
            <span>
              <span className="font-serif text-[#1C1714]">{activeCampaigns.length}</span> active
            </span>
            <span>
              <span className="font-serif text-[#1C1714]">{formatCurrency(totalBudget)}</span>{" "}
              total budget
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-sans font-600 bg-[#1C1714] text-[#F7F4EF] rounded-lg hover:bg-[#2a2420] transition-colors self-start sm:self-auto"
        >
          <Plus size={14} />
          New Campaign
        </button>
      </div>

      {/* Campaign cards */}
      <div className="grid gap-3">
        {campaigns.map((camp) => {
          const creatorCount = camp.creators.length;
          return (
            <button
              key={camp.id}
              onClick={() => setSelectedCampaign(camp)}
              className="w-full text-left bg-white rounded-[10px] border border-[#E5E0D8] p-5 hover:border-[#C4714A]/40 transition-colors group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <h3 className="font-serif text-base text-[#1C1714] group-hover:text-[#C4714A] transition-colors truncate">
                    {camp.name}
                  </h3>
                  <p className="text-[11px] font-sans text-[#9A9088] mt-0.5">
                    {camp.brand}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusPill status={camp.status} />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm mb-3">
                <span className="flex items-center gap-1 text-[#9A9088]">
                  <Users size={13} />
                  <span className="font-sans">{creatorCount} creator{creatorCount !== 1 ? "s" : ""}</span>
                </span>
                <span className="font-serif text-[#1C1714]">
                  {formatCurrency(camp.budget)}
                </span>
                <span className="font-mono text-[11px] text-[#9A9088]">
                  {formatDate(camp.startDate)} &mdash; {formatDate(camp.endDate)}
                </span>
              </div>

              {/* Completion bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-[#F2EEE8] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${camp.completionPct}%`,
                      backgroundColor:
                        camp.status === "completed"
                          ? "#9A9088"
                          : camp.completionPct > 50
                            ? "#4ade80"
                            : "#C4714A",
                    }}
                  />
                </div>
                <span className="text-[11px] font-mono text-[#9A9088] w-8 text-right">
                  {camp.completionPct}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
