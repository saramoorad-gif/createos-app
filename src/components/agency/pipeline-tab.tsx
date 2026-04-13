"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Flag,
  ChevronDown,
  X,
  Upload,
  Plus,
  Pencil,
  Check,
  ArrowUpDown,
  Download,
  ArrowRight,
} from "lucide-react";
import {
  agencyPipeline,
  dealStageLabels,
  type DealStage,
} from "@/lib/placeholder-data";
import { formatCurrency, formatDate } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────
type FilterMode = "all" | "creator" | "stage" | "brand";
type SortKey = "due" | "value" | "creator" | "stage";

interface EditingDeal {
  id: string;
  brand: string;
  type: string;
  value: number;
  stage: DealStage;
  due: string;
  deliverables: { text: string; done: boolean }[];
  notes: string;
  creator: string;
  creatorId: string;
}

const stages: DealStage[] = [
  "lead",
  "pitched",
  "negotiating",
  "contracted",
  "in_progress",
  "delivered",
  "paid",
];

const stageColorMap: Record<DealStage, string> = {
  lead: "bg-[#F0EFED] text-[#6B6560]",
  pitched: "bg-[#EDE8F5] text-[#6B47B8]",
  negotiating: "bg-[#FDF3E7] text-[#B8862B]",
  contracted: "bg-[#E8F0FE] text-[#3B6FC4]",
  in_progress: "bg-[#FDEEE8] text-[#C4714A]",
  delivered: "bg-[#EDE8F5] text-[#7E47B8]",
  paid: "bg-[#E6F5ED] text-[#2B8856]",
};

// ─── Activity log (hardcoded) ───────────────────────────────────────
const activityLog = [
  { id: 1, action: "Stage changed from Pitched to Negotiating", by: "Agency", date: "Apr 10, 2026 3:14 PM" },
  { id: 2, action: "Value updated from $2,400 to $3,200", by: "Agency", date: "Apr 9, 2026 11:02 AM" },
  { id: 3, action: "Deliverables modified — added 2 Stories", by: "Agency", date: "Apr 8, 2026 9:45 AM" },
  { id: 4, action: "Deal created on behalf of creator", by: "Agency", date: "Apr 5, 2026 2:30 PM" },
];

// ─── Quick-Add Modal ────────────────────────────────────────────────
function QuickAddModal({
  creator,
  onClose,
}: {
  creator: string;
  onClose: () => void;
}) {
  const [brand, setBrand] = useState("");
  const [value, setValue] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div
        ref={ref}
        className="w-full max-w-[400px] rounded-[10px] border border-[#E5E0D8] bg-white p-6 shadow-lg"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-lg text-[#1C1714]">Quick-add deal</h3>
          <button onClick={onClose} className="text-[#9A9088] hover:text-[#1C1714]">
            <X size={16} />
          </button>
        </div>
        <p className="mb-4 text-[12px] text-[#9A9088]">
          Adding for <span className="font-medium text-[#1C1714]">{creator}</span>
        </p>

        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[3px] text-[#9A9088]">
          Brand
        </label>
        <input
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="mb-4 w-full rounded-[8px] border border-[#E5E0D8] px-3 py-2 text-[13px] text-[#1C1714] outline-none focus:border-[#C4714A]"
          placeholder="Brand name"
        />

        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[3px] text-[#9A9088]">
          Value
        </label>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          type="number"
          className="mb-4 w-full rounded-[8px] border border-[#E5E0D8] px-3 py-2 text-[13px] text-[#1C1714] outline-none focus:border-[#C4714A]"
          placeholder="$0"
        />

        <button
          onClick={onClose}
          className="w-full rounded-[8px] bg-[#C4714A] px-4 py-2.5 text-[13px] font-medium text-white hover:bg-[#B5623D]"
        >
          Add deal for {creator}
        </button>
      </div>
    </div>
  );
}

// ─── Deal SlideOver ─────────────────────────────────────────────────
function DealSlideOver({
  deal,
  onClose,
  onSave,
}: {
  deal: EditingDeal;
  onClose: () => void;
  onSave: (updated: EditingDeal) => void;
}) {
  const [form, setForm] = useState<EditingDeal>(deal);

  function setField<K extends keyof EditingDeal>(key: K, val: EditingDeal[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function toggleDeliverable(idx: number) {
    setForm((prev) => ({
      ...prev,
      deliverables: prev.deliverables.map((d, i) =>
        i === idx ? { ...d, done: !d.done } : d
      ),
    }));
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full max-w-[480px] flex-col overflow-y-auto border-l border-[#E5E0D8] bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E0D8] px-6 py-4">
          <h2 className="font-serif text-xl text-[#1C1714]">{form.brand}</h2>
          <button onClick={onClose} className="text-[#9A9088] hover:text-[#1C1714]">
            <X size={18} />
          </button>
        </div>

        {/* Editing-on-behalf bar */}
        <div className="border-b border-[#E5E0D8] bg-[#FDF8F4] px-6 py-3">
          <p className="text-[12px] text-[#C4714A]">
            Editing on behalf of <span className="font-medium">{form.creator}</span>
          </p>
        </div>

        <div className="flex-1 space-y-5 px-6 py-5">
          {/* Brand */}
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[3px] text-[#9A9088]">
              Brand
            </label>
            <input
              value={form.brand}
              onChange={(e) => setField("brand", e.target.value)}
              className="w-full rounded-[8px] border border-[#E5E0D8] px-3 py-2 text-[13px] text-[#1C1714] outline-none focus:border-[#C4714A]"
            />
          </div>

          {/* Deal Type */}
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[3px] text-[#9A9088]">
              Deal Type
            </label>
            <select
              value={form.type}
              onChange={(e) => setField("type", e.target.value)}
              className="w-full rounded-[8px] border border-[#E5E0D8] px-3 py-2 text-[13px] text-[#1C1714] outline-none focus:border-[#C4714A]"
            >
              <option value="ugc">UGC</option>
              <option value="influencer">Influencer</option>
              <option value="both">Both</option>
            </select>
          </div>

          {/* Value */}
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[3px] text-[#9A9088]">
              Value
            </label>
            <input
              type="number"
              value={form.value}
              onChange={(e) => setField("value", Number(e.target.value))}
              className="w-full rounded-[8px] border border-[#E5E0D8] px-3 py-2 font-serif text-[13px] text-[#1C1714] outline-none focus:border-[#C4714A]"
            />
          </div>

          {/* Stage selector grid */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[3px] text-[#9A9088]">
              Stage
            </label>
            <div className="grid grid-cols-4 gap-2">
              {stages.map((s) => (
                <button
                  key={s}
                  onClick={() => setField("stage", s)}
                  className={`rounded-[6px] px-2 py-1.5 text-[11px] font-medium transition-colors ${
                    form.stage === s
                      ? "bg-[#1C1714] text-[#F7F4EF]"
                      : "border border-[#E5E0D8] text-[#9A9088] hover:border-[#1C1714] hover:text-[#1C1714]"
                  }`}
                >
                  {dealStageLabels[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[3px] text-[#9A9088]">
              Due Date
            </label>
            <input
              type="date"
              value={form.due}
              onChange={(e) => setField("due", e.target.value)}
              className="w-full rounded-[8px] border border-[#E5E0D8] px-3 py-2 font-mono text-[13px] text-[#1C1714] outline-none focus:border-[#C4714A]"
            />
          </div>

          {/* Deliverables checklist */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[3px] text-[#9A9088]">
              Deliverables
            </label>
            <div className="space-y-2">
              {form.deliverables.map((d, i) => (
                <label
                  key={i}
                  className="flex cursor-pointer items-center gap-2 text-[13px] text-[#1C1714]"
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      d.done
                        ? "border-[#C4714A] bg-[#C4714A] text-white"
                        : "border-[#E5E0D8]"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleDeliverable(i);
                    }}
                  >
                    {d.done && <Check size={10} />}
                  </span>
                  <span className={d.done ? "line-through opacity-50" : ""}>{d.text}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Contract upload zone */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[3px] text-[#9A9088]">
              Contract
            </label>
            <div className="flex flex-col items-center justify-center rounded-[8px] border-2 border-dashed border-[#E5E0D8] px-4 py-6 text-center">
              <Upload size={20} className="mb-2 text-[#9A9088]" />
              <p className="text-[12px] text-[#9A9088]">
                Drop contract file here or{" "}
                <span className="cursor-pointer text-[#C4714A] underline">browse</span>
              </p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[3px] text-[#9A9088]">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              rows={3}
              className="w-full resize-none rounded-[8px] border border-[#E5E0D8] px-3 py-2 text-[13px] text-[#1C1714] outline-none focus:border-[#C4714A]"
            />
          </div>

          {/* Save button */}
          <button
            onClick={() => onSave(form)}
            className="w-full rounded-[8px] bg-[#C4714A] px-4 py-2.5 text-[13px] font-medium text-white hover:bg-[#B5623D]"
          >
            Save on behalf of {form.creator}
          </button>

          {/* Activity log */}
          <div className="pt-2">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[3px] text-[#9A9088]">
              Activity Log
            </p>
            <div className="space-y-3">
              {activityLog.map((entry) => (
                <div key={entry.id} className="border-l-2 border-[#E5E0D8] pl-3">
                  <p className="text-[12px] text-[#1C1714]">{entry.action}</p>
                  <p className="text-[11px] text-[#9A9088]">
                    {entry.by} &middot; {entry.date}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main PipelineTab ───────────────────────────────────────────────
export function PipelineTab() {
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [sortKey, setSortKey] = useState<SortKey>("due");
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingDeal, setEditingDeal] = useState<EditingDeal | null>(null);
  const [quickAddCreator, setQuickAddCreator] = useState<{
    name: string;
    id: string;
  } | null>(null);
  const [deals, setDeals] = useState(agencyPipeline);
  const [openStageDropdown, setOpenStageDropdown] = useState<string | null>(null);

  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Close stage dropdown on outside click
  useEffect(() => {
    function handle() {
      setOpenStageDropdown(null);
    }
    if (openStageDropdown) {
      document.addEventListener("mousedown", handle);
      return () => document.removeEventListener("mousedown", handle);
    }
  }, [openStageDropdown]);

  // Computed
  const activeStages: DealStage[] = ["negotiating", "contracted", "in_progress"];
  const totalDeals = deals.length;
  const activeValue = deals
    .filter((d) => activeStages.includes(d.stage))
    .reduce((sum, d) => sum + d.value, 0);
  const totalCommission = deals.reduce((sum, d) => sum + d.commission, 0);

  // Sort deals
  const sortedDeals = useMemo(() => {
    const copy = [...deals];

    // Always sort urgent/priority to top first
    copy.sort((a, b) => {
      if (a.priority && !b.priority) return -1;
      if (!a.priority && b.priority) return 1;
      return 0;
    });

    // Then secondary sort
    const stableSort = (arr: typeof copy, compareFn: (a: typeof copy[0], b: typeof copy[0]) => number) => {
      return arr.sort((a, b) => {
        // Priority first
        if (a.priority && !b.priority) return -1;
        if (!a.priority && b.priority) return 1;
        return compareFn(a, b);
      });
    };

    switch (sortKey) {
      case "due":
        return stableSort(copy, (a, b) => {
          if (!a.due && !b.due) return 0;
          if (!a.due) return 1;
          if (!b.due) return -1;
          return new Date(a.due).getTime() - new Date(b.due).getTime();
        });
      case "value":
        return stableSort(copy, (a, b) => b.value - a.value);
      case "creator":
        return stableSort(copy, (a, b) => a.creator.localeCompare(b.creator));
      case "stage":
        return stableSort(copy, (a, b) => stages.indexOf(a.stage) - stages.indexOf(b.stage));
      default:
        return copy;
    }
  }, [deals, sortKey]);

  // Group helpers
  const grouped = useMemo(() => {
    if (filterMode === "creator") {
      const map = new Map<string, typeof sortedDeals>();
      sortedDeals.forEach((d) => {
        const arr = map.get(d.creator) || [];
        arr.push(d);
        map.set(d.creator, arr);
      });
      return map;
    }
    if (filterMode === "stage") {
      const map = new Map<string, typeof sortedDeals>();
      sortedDeals.forEach((d) => {
        const label = dealStageLabels[d.stage];
        const arr = map.get(label) || [];
        arr.push(d);
        map.set(label, arr);
      });
      return map;
    }
    if (filterMode === "brand") {
      const map = new Map<string, typeof sortedDeals>();
      sortedDeals.forEach((d) => {
        const arr = map.get(d.brand) || [];
        arr.push(d);
        map.set(d.brand, arr);
      });
      return map;
    }
    return null;
  }, [filterMode, sortedDeals]);

  // Toggle selection
  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === deals.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(deals.map((d) => d.id)));
    }
  }

  function togglePriority(id: string) {
    setDeals((prev) =>
      prev.map((d) => (d.id === id ? { ...d, priority: !d.priority } : d))
    );
  }

  function changeStage(id: string, stage: DealStage) {
    setDeals((prev) =>
      prev.map((d) => (d.id === id ? { ...d, stage } : d))
    );
    setOpenStageDropdown(null);
  }

  function openEdit(deal: (typeof deals)[0]) {
    setEditingDeal({
      id: deal.id,
      brand: deal.brand,
      type: deal.type,
      value: deal.value,
      stage: deal.stage,
      due: deal.due || "",
      deliverables: deal.deliverables.map((text) => ({ text, done: false })),
      notes: deal.notes,
      creator: deal.creator,
      creatorId: deal.creatorId,
    });
  }

  function handleSave(updated: EditingDeal) {
    setDeals((prev) =>
      prev.map((d) =>
        d.id === updated.id
          ? {
              ...d,
              brand: updated.brand,
              type: updated.type as typeof d.type,
              value: updated.value,
              stage: updated.stage,
              due: updated.due || null,
              deliverables: updated.deliverables.map((dl) => dl.text),
              notes: updated.notes,
            }
          : d
      )
    );
    setEditingDeal(null);
  }

  // ─── Table row renderer ───────────────────────────────────────────
  function renderRow(deal: (typeof deals)[0]) {
    return (
      <tr key={deal.id} className="border-b border-[#E5E0D8] hover:bg-[#FDFBF9]">
        {/* Checkbox */}
        <td className="py-3 pl-4 pr-2">
          <span
            onClick={() => toggleSelect(deal.id)}
            className={`flex h-4 w-4 cursor-pointer items-center justify-center rounded border ${
              selectedIds.has(deal.id)
                ? "border-[#C4714A] bg-[#C4714A] text-white"
                : "border-[#E5E0D8]"
            }`}
          >
            {selectedIds.has(deal.id) && <Check size={10} />}
          </span>
        </td>

        {/* Priority */}
        <td className="px-2 py-3">
          <button
            onClick={() => togglePriority(deal.id)}
            className={`transition-colors ${
              deal.priority ? "text-[#C4714A]" : "text-[#E5E0D8] hover:text-[#9A9088]"
            }`}
          >
            <Flag size={14} fill={deal.priority ? "#C4714A" : "none"} />
          </button>
        </td>

        {/* Creator */}
        <td className="px-3 py-3 text-[13px] text-[#1C1714]">
          <span className="flex items-center gap-1">
            {deal.creator}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setQuickAddCreator({ name: deal.creator, id: deal.creatorId });
              }}
              className="ml-0.5 rounded p-0.5 text-[#E5E0D8] hover:bg-[#F7F4EF] hover:text-[#C4714A]"
              title={`Quick-add deal for ${deal.creator}`}
            >
              <Plus size={12} />
            </button>
          </span>
        </td>

        {/* Brand */}
        <td className="px-3 py-3 text-[13px] text-[#1C1714]">{deal.brand}</td>

        {/* Value */}
        <td className="px-3 py-3 font-serif text-[13px] text-[#1C1714]">
          {formatCurrency(deal.value)}
        </td>

        {/* Stage pill */}
        <td className="relative px-3 py-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenStageDropdown(openStageDropdown === deal.id ? null : deal.id);
            }}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${stageColorMap[deal.stage]}`}
          >
            {dealStageLabels[deal.stage]}
            <ChevronDown size={10} />
          </button>
          {openStageDropdown === deal.id && (
            <div
              className="absolute left-3 top-full z-30 mt-1 min-w-[140px] rounded-[8px] border border-[#E5E0D8] bg-white py-1 shadow-lg"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {stages.map((s) => (
                <button
                  key={s}
                  onClick={() => changeStage(deal.id, s)}
                  className={`flex w-full items-center px-3 py-1.5 text-left text-[12px] hover:bg-[#F7F4EF] ${
                    deal.stage === s ? "font-medium text-[#C4714A]" : "text-[#1C1714]"
                  }`}
                >
                  {dealStageLabels[s]}
                  {deal.stage === s && <Check size={10} className="ml-auto" />}
                </button>
              ))}
            </div>
          )}
        </td>

        {/* Due */}
        <td className="px-3 py-3 font-mono text-[13px] text-[#9A9088]">
          {deal.due ? formatDate(deal.due) : "—"}
        </td>

        {/* Commission */}
        <td className="px-3 py-3 text-[13px] text-[#9A9088]">
          {formatCurrency(deal.commission)}
        </td>

        {/* Actions */}
        <td className="px-3 py-3">
          <button
            onClick={() => openEdit(deal)}
            className="inline-flex items-center gap-1 rounded-[6px] border border-[#E5E0D8] px-2.5 py-1 text-[11px] text-[#9A9088] hover:border-[#1C1714] hover:text-[#1C1714]"
          >
            <Pencil size={10} />
            Edit
          </button>
        </td>
      </tr>
    );
  }

  // ─── Table header ─────────────────────────────────────────────────
  function renderTableHeader() {
    return (
      <thead>
        <tr className="border-b border-[#E5E0D8]">
          <th className="py-2.5 pl-4 pr-2 text-left">
            <span
              onClick={toggleSelectAll}
              className={`flex h-4 w-4 cursor-pointer items-center justify-center rounded border ${
                selectedIds.size === deals.length && deals.length > 0
                  ? "border-[#C4714A] bg-[#C4714A] text-white"
                  : "border-[#E5E0D8]"
              }`}
            >
              {selectedIds.size === deals.length && deals.length > 0 && <Check size={10} />}
            </span>
          </th>
          {["", "Creator", "Brand", "Value", "Stage", "Due", "Commission", "Actions"].map(
            (col) => (
              <th
                key={col}
                className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[2px] text-[#9A9088]"
              >
                {col}
              </th>
            )
          )}
        </tr>
      </thead>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F7F4EF] pb-12">
      {/* Page header */}
      <div className="mb-6 px-1">
        <h1 className="mb-1 font-serif text-[28px] leading-tight text-[#1C1714]">
          Deal <em className="text-[#C4714A]">pipeline</em>
        </h1>
        <div className="mt-3 flex gap-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[3px] text-[#9A9088]">
              Total Deals
            </p>
            <p className="font-serif text-[22px] text-[#1C1714]">{totalDeals}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[3px] text-[#9A9088]">
              Active Value
            </p>
            <p className="font-serif text-[22px] text-[#1C1714]">
              {formatCurrency(activeValue)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[3px] text-[#9A9088]">
              Total Commission
            </p>
            <p className="font-serif text-[22px] text-[#1C1714]">
              {formatCurrency(totalCommission)}
            </p>
          </div>
        </div>
      </div>

      {/* Filter row + Sort */}
      <div className="mb-4 flex items-center justify-between px-1">
        <div className="flex gap-1.5">
          {(
            [
              ["all", "All"],
              ["creator", "By Creator"],
              ["stage", "By Stage"],
              ["brand", "By Brand"],
            ] as [FilterMode, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilterMode(key)}
              className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
                filterMode === key
                  ? "bg-[#1C1714] text-[#F7F4EF]"
                  : "text-[#9A9088] hover:text-[#1C1714]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div ref={sortRef} className="relative">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#E5E0D8] px-3 py-1.5 text-[12px] text-[#9A9088] hover:border-[#1C1714] hover:text-[#1C1714]"
          >
            <ArrowUpDown size={12} />
            Sort: {sortKey === "due" ? "Due Date" : sortKey === "value" ? "Value" : sortKey === "creator" ? "Creator" : "Stage"}
            <ChevronDown size={10} />
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 min-w-[140px] rounded-[8px] border border-[#E5E0D8] bg-white py-1 shadow-lg">
              {(
                [
                  ["due", "Due Date"],
                  ["value", "Value"],
                  ["creator", "Creator"],
                  ["stage", "Stage"],
                ] as [SortKey, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSortKey(key);
                    setSortOpen(false);
                  }}
                  className={`flex w-full items-center px-3 py-1.5 text-left text-[12px] hover:bg-[#F7F4EF] ${
                    sortKey === key ? "font-medium text-[#C4714A]" : "text-[#1C1714]"
                  }`}
                >
                  {label}
                  {sortKey === key && <Check size={10} className="ml-auto" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-[10px] border border-[#E5E0D8] bg-white px-4 py-2.5">
          <span className="text-[12px] font-medium text-[#1C1714]">
            {selectedIds.size} selected
          </span>
          <div className="h-4 w-px bg-[#E5E0D8]" />
          <button className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#E5E0D8] px-3 py-1 text-[11px] text-[#9A9088] hover:border-[#1C1714] hover:text-[#1C1714]">
            <ArrowRight size={10} />
            Move to stage
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#E5E0D8] px-3 py-1 text-[11px] text-[#9A9088] hover:border-[#1C1714] hover:text-[#1C1714]">
            <Download size={10} />
            Export
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-[10px] border border-[#E5E0D8] bg-white">
        {grouped ? (
          // Grouped view
          Array.from(grouped.entries()).map(([groupLabel, groupDeals]) => (
            <div key={groupLabel}>
              <div className="border-b border-[#E5E0D8] bg-[#FDFBF9] px-4 py-2">
                <span className="text-[10px] font-semibold uppercase tracking-[3px] text-[#9A9088]">
                  {groupLabel}
                </span>
                <span className="ml-2 text-[11px] text-[#9A9088]">
                  ({groupDeals.length})
                </span>
              </div>
              <table className="w-full">
                {renderTableHeader()}
                <tbody>{groupDeals.map(renderRow)}</tbody>
              </table>
            </div>
          ))
        ) : (
          // Flat view
          <table className="w-full">
            {renderTableHeader()}
            <tbody>{sortedDeals.map(renderRow)}</tbody>
          </table>
        )}
      </div>

      {/* SlideOver */}
      {editingDeal && (
        <DealSlideOver
          deal={editingDeal}
          onClose={() => setEditingDeal(null)}
          onSave={handleSave}
        />
      )}

      {/* Quick-add modal */}
      {quickAddCreator && (
        <QuickAddModal
          creator={quickAddCreator.name}
          onClose={() => setQuickAddCreator(null)}
        />
      )}
    </div>
  );
}
