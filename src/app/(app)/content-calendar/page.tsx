"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useSupabaseQuery, useSupabaseMutation } from "@/lib/hooks";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/global/toast";
import { UpgradeGate } from "@/components/global/upgrade-gate";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";

interface ContentItem {
  id: string;
  date: string;
  title: string;
  type: "sponsored" | "organic" | "collab";
  platform: string;
  brand: string;
  notes: string;
}

const typeColors: Record<ContentItem["type"], { bg: string; text: string; label: string }> = {
  sponsored: { bg: "#FDF3E4", text: "#A07830", label: "Sponsored" },
  organic: { bg: "#E8F4FA", text: "#7BAFC8", label: "Organic" },
  collab: { bg: "#E6F2EB", text: "#3D7A58", label: "Collab" },
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { day: number; inMonth: boolean; dateStr: string }[] = [];
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    cells.push({ day: d, inMonth: false, dateStr: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}` });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, inMonth: true, dateStr: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}` });
  }
  while (cells.length % 7 !== 0) {
    const d = cells.length - startOffset - daysInMonth + 1;
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    cells.push({ day: d, inMonth: false, dateStr: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}` });
  }
  return cells;
}

// No seed data — content is user-created only

export default function ContentCalendarPage() {
  return (
    <UpgradeGate feature="content-calendar">
      <ContentCalendarPageContent />
    </UpgradeGate>
  );
}

function ContentCalendarPageContent() {
  const { user } = useAuth();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const { data: items, setData: setItems } = useSupabaseQuery<ContentItem>("content_calendar");
  const { insert, update, remove } = useSupabaseMutation("content_calendar");
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [editItem, setEditItem] = useState<ContentItem | null>(null);
  const { toast } = useToast();

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState<ContentItem["type"]>("organic");
  const [formPlatform, setFormPlatform] = useState("TikTok");
  const [formBrand, setFormBrand] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString("en-US", { month: "long" });
  const cells = getMonthDays(currentYear, currentMonth);

  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  }
  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  }

  function openAddModal(dateStr: string) {
    setSelectedDate(dateStr);
    setEditItem(null);
    setFormTitle("");
    setFormType("organic");
    setFormPlatform("TikTok");
    setFormBrand("");
    setFormNotes("");
    setShowModal(true);
  }

  function openEditModal(item: ContentItem) {
    setSelectedDate(item.date);
    setEditItem(item);
    setFormTitle(item.title);
    setFormType(item.type);
    setFormPlatform(item.platform);
    setFormBrand(item.brand);
    setFormNotes(item.notes);
    setShowModal(true);
  }

  async function handleSave() {
    if (!formTitle.trim()) { toast("error", "Title is required"); return; }
    if (!user) { toast("error", "Please sign in"); return; }

    const payload = {
      title: formTitle,
      type: formType,
      platform: formPlatform,
      brand: formBrand,
      notes: formNotes,
    };

    try {
      if (editItem) {
        await update(editItem.id, payload);
        setItems(prev => prev.map(i => i.id === editItem.id ? { ...i, ...payload } : i));
        toast("success", "Content updated");
      } else {
        const newItem = await insert({ ...payload, date: selectedDate, creator_id: user.id });
        if (newItem) setItems(prev => [...prev, newItem as ContentItem]);
        toast("success", "Content added to calendar");
      }
      setShowModal(false);
    } catch (e) {
      console.error("Failed to save calendar item:", e);
      toast("error", "Failed to save. Please try again.");
    }
  }

  async function handleDelete() {
    if (!editItem) return;
    try {
      await remove(editItem.id);
      setItems(prev => prev.filter(i => i.id !== editItem.id));
      toast("success", "Content removed");
      setShowModal(false);
    } catch (e) {
      console.error("Failed to delete:", e);
      toast("error", "Failed to delete");
    }
  }

  // Sponsor tolerance
  const monthItems = items.filter(i => {
    const d = new Date(i.date);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });
  const sponsoredCount = monthItems.filter(i => i.type === "sponsored").length;
  const totalCount = monthItems.length;
  const ratio = totalCount > 0 ? sponsoredCount / totalCount : 0;
  const ratioPercent = Math.round(ratio * 100);
  const barColor = ratio < 0.3 ? "#3D7A58" : ratio < 0.5 ? "#A07830" : "#C0392B";
  const maxSafe = totalCount > 0 ? Math.floor(totalCount * 0.3) : 3;
  const roomLeft = Math.max(0, maxSafe - sponsoredCount);

  const today = new Date().toISOString().split("T")[0];

  const inputClass = "w-full rounded-[8px] border-[1.5px] border-[#D8E8EE] px-3 py-2.5 text-[14px] font-sans text-[#1A2C38] bg-white focus:outline-none focus:border-[#7BAFC8]";
  const labelClass = "text-[11px] font-sans text-[#8AAABB] uppercase tracking-[1.5px] block mb-1.5";

  return (
    <div>
      <PageHeader
        headline={<>Content <em className="italic text-[#7BAFC8]">calendar</em></>}
        subheading="Plan your content and track sponsor tolerance."
        stats={[
          { value: String(totalCount), label: "Posts this month" },
          { value: String(sponsoredCount), label: "Sponsored" },
          { value: `${ratioPercent}%`, label: "Sponsored ratio" },
        ]}
      />

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="flex items-center gap-1 text-[13px] font-sans text-[#8AAABB] hover:text-[#1A2C38] transition-colors">
          <ChevronLeft className="h-4 w-4" /> Prev
        </button>
        <h2 className="text-[22px] font-serif text-[#1A2C38]">{monthName} {currentYear}</h2>
        <button onClick={nextMonth} className="flex items-center gap-1 text-[13px] font-sans text-[#8AAABB] hover:text-[#1A2C38] transition-colors">
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] overflow-hidden mb-8">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-[#D8E8EE]">
          {WEEKDAYS.map(d => (
            <div key={d} className="px-2 py-2.5 text-center text-[10px] font-sans uppercase tracking-[2px] text-[#8AAABB]" style={{ fontWeight: 600 }}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((cell, idx) => {
            const dayItems = items.filter(i => i.date === cell.dateStr);
            const isToday = cell.dateStr === today;
            return (
              <div
                key={idx}
                onClick={() => cell.inMonth && openAddModal(cell.dateStr)}
                className={`min-h-[100px] border-b border-r border-[#D8E8EE] p-2 cursor-pointer transition-colors hover:bg-[#F2F8FB] ${!cell.inMonth ? "bg-[#FAFAFA]" : ""}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[13px] font-sans ${isToday ? "bg-[#1E3F52] text-white w-6 h-6 rounded-full flex items-center justify-center" : cell.inMonth ? "text-[#1A2C38]" : "text-[#C8D8E0]"}`} style={{ fontWeight: isToday ? 700 : 400 }}>
                    {cell.day}
                  </span>
                  {cell.inMonth && (
                    <button
                      onClick={(e) => { e.stopPropagation(); openAddModal(cell.dateStr); }}
                      className="opacity-0 group-hover:opacity-100 text-[#8AAABB] hover:text-[#7BAFC8]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="space-y-1">
                  {dayItems.slice(0, 2).map(item => (
                    <button
                      key={item.id}
                      onClick={(e) => { e.stopPropagation(); openEditModal(item); }}
                      className="w-full text-left px-1.5 py-0.5 rounded text-[10px] font-sans truncate"
                      style={{ background: typeColors[item.type].bg, color: typeColors[item.type].text, fontWeight: 500 }}
                    >
                      {item.title}
                    </button>
                  ))}
                  {dayItems.length > 2 && (
                    <span className="text-[10px] font-sans text-[#8AAABB]">+{dayItems.length - 2} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content type legend */}
      <div className="flex items-center gap-4 mb-8">
        {(["sponsored", "organic", "collab"] as const).map(t => (
          <div key={t} className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: typeColors[t].text }} />
            <span className="text-[12px] font-sans text-[#8AAABB]">{typeColors[t].label}</span>
          </div>
        ))}
      </div>

      {/* Sponsor Tolerance Section */}
      <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-6">
        <h3 className="text-[18px] font-serif text-[#1A2C38] mb-1">Sponsor tolerance score</h3>
        <p className="text-[13px] font-sans text-[#8AAABB] mb-4">
          {sponsoredCount} of {totalCount} posts are sponsored ({ratioPercent}%)
        </p>

        {/* Progress bar */}
        <div className="h-[6px] w-full bg-[#D8E8EE] rounded-full overflow-hidden mb-4">
          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(ratioPercent, 100)}%`, background: barColor }} />
        </div>

        {/* Threshold markers */}
        <div className="flex items-center justify-between text-[10px] font-sans text-[#8AAABB] mb-4">
          <span>0%</span>
          <span className="text-[#3D7A58]">30% safe</span>
          <span className="text-[#A07830]">50% caution</span>
          <span className="text-[#C0392B]">100%</span>
        </div>

        {/* Recommendation */}
        <div className="bg-[#FAF8F4] rounded-[8px] p-4">
          {ratio < 0.3 ? (
            <p className="text-[13px] font-sans text-[#3D7A58]" style={{ fontWeight: 500 }}>
              You have room for {roomLeft > 0 ? roomLeft : "a few"} more sponsored posts this month. Your audience engagement should stay healthy.
            </p>
          ) : ratio < 0.5 ? (
            <p className="text-[13px] font-sans text-[#A07830]" style={{ fontWeight: 500 }}>
              Approaching the caution zone. Consider balancing with more organic content to maintain audience trust.
            </p>
          ) : (
            <p className="text-[13px] font-sans text-[#C0392B]" style={{ fontWeight: 500 }}>
              Warning: too many sponsored posts may reduce engagement. Your audience may start to disengage. Try adding more organic or collaborative content.
            </p>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(26,44,56,.4)", backdropFilter: "blur(4px)" }}>
          <div className="relative bg-white rounded-[10px] border-[1.5px] border-[#D8E8EE] w-full max-w-lg overflow-hidden">
            <div className="bg-[#F2F8FB] px-6 py-4 border-b border-[#D8E8EE] flex items-center justify-between">
              <h2 className="text-[18px] font-serif text-[#1A2C38]">{editItem ? "Edit content" : "Add content"}</h2>
              <button onClick={() => setShowModal(false)} className="text-[#8AAABB] hover:text-[#1A2C38]"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="text-[12px] font-sans text-[#8AAABB] mb-2 block">
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <div>
                <label className={labelClass} style={{ fontWeight: 600 }}>Title</label>
                <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g., Spring skincare routine" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass} style={{ fontWeight: 600 }}>Type</label>
                  <select value={formType} onChange={e => setFormType(e.target.value as ContentItem["type"])} className={inputClass}>
                    <option value="organic">Organic</option>
                    <option value="sponsored">Sponsored</option>
                    <option value="collab">Collab</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass} style={{ fontWeight: 600 }}>Platform</label>
                  <select value={formPlatform} onChange={e => setFormPlatform(e.target.value)} className={inputClass}>
                    <option value="TikTok">TikTok</option>
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Twitter">Twitter</option>
                  </select>
                </div>
              </div>
              {formType === "sponsored" && (
                <div>
                  <label className={labelClass} style={{ fontWeight: 600 }}>Brand</label>
                  <input type="text" value={formBrand} onChange={e => setFormBrand(e.target.value)} placeholder="e.g., Glow Recipe" className={inputClass} />
                </div>
              )}
              <div>
                <label className={labelClass} style={{ fontWeight: 600 }}>Notes</label>
                <textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} rows={2} placeholder="Deliverables, campaign details..." className={`${inputClass} resize-none`} />
              </div>
              <div className="flex gap-2 pt-2">
                {editItem && (
                  <button onClick={handleDelete} className="border-[1.5px] border-[#C0392B] text-[#C0392B] rounded-[8px] px-4 py-2.5 text-[13px] font-sans hover:bg-red-50" style={{ fontWeight: 500 }}>Delete</button>
                )}
                <button onClick={() => setShowModal(false)} className="flex-1 border-[1.5px] border-[#D8E8EE] rounded-[8px] px-4 py-2.5 text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>Cancel</button>
                <button onClick={handleSave} className="flex-1 bg-[#1E3F52] text-white rounded-[8px] px-4 py-2.5 text-[13px] font-sans" style={{ fontWeight: 600 }}>{editItem ? "Save changes" : "Add to calendar"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
