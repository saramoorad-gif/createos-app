"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useSupabaseQuery, useSupabaseMutation } from "@/lib/hooks";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/global/toast";
import { TableSkeleton } from "@/components/global/skeleton";
import { logError } from "@/lib/error-logger";
import { Plus, X, CheckCircle2, Circle, Clock, Flag, Calendar, Briefcase, ChevronDown, Filter, Trash2, Edit3 } from "lucide-react";

interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  brand_name: string | null;
  deal_id: string | null;
  due_date: string | null;
  priority: "high" | "medium" | "low";
  status: "todo" | "in_progress" | "done";
  category: "content" | "admin" | "outreach" | "delivery" | "invoicing" | "other";
  created_at: string;
}

const priorityConfig = {
  high: { color: "text-[#A03D3D]", bg: "bg-[#F4EAEA]", label: "High" },
  medium: { color: "text-[#A07830]", bg: "bg-[#FFF8E8]", label: "Medium" },
  low: { color: "text-[#8AAABB]", bg: "bg-[#F2F8FB]", label: "Low" },
};

const statusConfig = {
  todo: { icon: Circle, color: "text-[#8AAABB]", label: "To do" },
  in_progress: { icon: Clock, color: "text-[#7BAFC8]", label: "In progress" },
  done: { icon: CheckCircle2, color: "text-[#3D7A58]", label: "Done" },
};

const categoryConfig: Record<string, { label: string; color: string }> = {
  content: { label: "Content", color: "bg-[#E8F4FA] text-[#7BAFC8]" },
  admin: { label: "Admin", color: "bg-[#F0EAE0] text-[#A07830]" },
  outreach: { label: "Outreach", color: "bg-[#E6F2EB] text-[#3D7A58]" },
  delivery: { label: "Delivery", color: "bg-[#F4EAEA] text-[#A03D3D]" },
  invoicing: { label: "Invoicing", color: "bg-[#F2F8FB] text-[#3D6E8A]" },
  other: { label: "Other", color: "bg-[#F5F5F5] text-[#8AAABB]" },
};

function formatDueDate(dateStr: string | null): { text: string; overdue: boolean; soon: boolean } {
  if (!dateStr) return { text: "No due date", overdue: false, soon: false };
  const due = new Date(dateStr + "T23:59:59");
  const now = new Date();
  const diff = due.getTime() - now.getTime();
  const days = Math.ceil(diff / 86400000);

  if (days < 0) return { text: `${Math.abs(days)}d overdue`, overdue: true, soon: false };
  if (days === 0) return { text: "Due today", overdue: false, soon: true };
  if (days === 1) return { text: "Due tomorrow", overdue: false, soon: true };
  if (days <= 3) return { text: `Due in ${days} days`, overdue: false, soon: true };
  return {
    text: new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    overdue: false,
    soon: false,
  };
}

export default function TasksPage() {
  const { user } = useAuth();
  const { data: tasks, loading, setData: setTasks } = useSupabaseQuery<Task>("creator_tasks", {
    order: { column: "created_at", ascending: false },
  });
  const { insert, update, remove } = useSupabaseMutation("creator_tasks");
  const { toast } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "todo" | "in_progress" | "done">("all");
  const [filterPriority, setFilterPriority] = useState<"all" | "high" | "medium" | "low">("all");

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formBrand, setFormBrand] = useState("");
  const [formDueDate, setFormDueDate] = useState("");
  const [formPriority, setFormPriority] = useState<Task["priority"]>("medium");
  const [formStatus, setFormStatus] = useState<Task["status"]>("todo");
  const [formCategory, setFormCategory] = useState<Task["category"]>("content");

  function openAddModal() {
    setEditTask(null);
    setFormTitle(""); setFormDescription(""); setFormBrand(""); setFormDueDate("");
    setFormPriority("medium"); setFormStatus("todo"); setFormCategory("content");
    setShowModal(true);
  }

  function openEditModal(task: Task) {
    setEditTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description || "");
    setFormBrand(task.brand_name || "");
    setFormDueDate(task.due_date || "");
    setFormPriority(task.priority);
    setFormStatus(task.status);
    setFormCategory(task.category);
    setShowModal(true);
  }

  async function handleSave() {
    if (!formTitle.trim()) { toast("error", "Title is required"); return; }
    const payload = {
      title: formTitle.trim(),
      description: formDescription.trim() || null,
      brand_name: formBrand.trim() || null,
      due_date: formDueDate || null,
      priority: formPriority,
      status: formStatus,
      category: formCategory,
    };
    try {
      if (editTask) {
        await update(editTask.id, payload);
        setTasks(prev => prev.map(t => t.id === editTask.id ? { ...t, ...payload } : t));
        toast("success", "Task updated");
      } else {
        const newTask = await insert({ ...payload, user_id: user?.id });
        if (newTask) setTasks(prev => [newTask as Task, ...prev]);
        toast("success", "Task created");
      }
      setShowModal(false);
    } catch (e) {
      console.error("Failed to save task:", e);
      logError({
        source: "tasks.handleSave",
        message: e instanceof Error ? e.message : "Failed to save task",
        stack: e instanceof Error ? e.stack : undefined,
        metadata: { editingExisting: !!editTask, title: formTitle },
      });
      toast("error", "Failed to save task");
    }
  }

  async function handleDelete() {
    if (!editTask) return;
    try {
      await remove(editTask.id);
      setTasks(prev => prev.filter(t => t.id !== editTask.id));
      toast("success", "Task deleted");
      setShowModal(false);
    } catch { toast("error", "Failed to delete task"); }
  }

  async function toggleStatus(task: Task) {
    const nextStatus = task.status === "todo" ? "in_progress" : task.status === "in_progress" ? "done" : "todo";
    try {
      await update(task.id, { status: nextStatus });
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));
      if (nextStatus === "done") toast("success", `"${task.title}" completed!`);
    } catch { toast("error", "Failed to update task"); }
  }

  if (loading) return <TableSkeleton rows={6} cols={4} />;

  const filtered = tasks.filter(t => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    return true;
  });

  // Group by status
  const todoTasks = filtered.filter(t => t.status === "todo");
  const inProgressTasks = filtered.filter(t => t.status === "in_progress");
  const doneTasks = filtered.filter(t => t.status === "done");

  const totalOpen = tasks.filter(t => t.status !== "done").length;
  const overdueTasks = tasks.filter(t => t.status !== "done" && t.due_date && formatDueDate(t.due_date).overdue).length;

  const inputClass = "w-full rounded-[8px] border-[1.5px] border-[#D8E8EE] px-3 py-2.5 text-[14px] font-sans text-[#1A2C38] bg-white focus:outline-none focus:border-[#7BAFC8]";
  const labelClass = "text-[11px] font-sans text-[#8AAABB] uppercase tracking-[1.5px] block mb-1.5";

  return (
    <div>
      <PageHeader
        headline={<>Your <em className="italic text-[#7BAFC8]">tasks</em></>}
        subheading="Track deliverables, deadlines, and action items."
        stats={[
          { value: String(totalOpen), label: "Open tasks" },
          { value: String(overdueTasks), label: "Overdue" },
          { value: String(doneTasks.length), label: "Completed" },
        ]}
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-[#8AAABB]" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="text-[12px] font-sans text-[#1A2C38] border border-[#D8E8EE] rounded-[6px] px-2 py-1 focus:outline-none focus:border-[#7BAFC8]"
          >
            <option value="all">All statuses</option>
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </select>
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value as any)}
            className="text-[12px] font-sans text-[#1A2C38] border border-[#D8E8EE] rounded-[6px] px-2 py-1 focus:outline-none focus:border-[#7BAFC8]"
          >
            <option value="all">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#1E3F52] text-white rounded-[8px] px-4 py-2 text-[12px] font-sans hover:bg-[#2a5269] transition-colors"
          style={{ fontWeight: 600 }}
        >
          <Plus className="h-3.5 w-3.5" /> New task
        </button>
      </div>

      {/* Empty state */}
      {tasks.length === 0 && (
        <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-12 text-center">
          <div className="h-14 w-14 rounded-full bg-[#F2F8FB] border border-[#D8E8EE] mx-auto mb-4 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-[#7BAFC8]" />
          </div>
          <h3 className="text-[18px] font-serif text-[#1A2C38] mb-2">No tasks yet</h3>
          <p className="text-[13px] font-sans text-[#8AAABB] max-w-sm mx-auto mb-5">
            Create tasks to track deliverables, deadlines, follow-ups, and anything else on your plate.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-[#1E3F52] text-white rounded-[8px] px-5 py-2.5 text-[13px] font-sans hover:bg-[#2a5269] transition-colors"
            style={{ fontWeight: 600 }}
          >
            <Plus className="h-4 w-4" /> Create your first task
          </button>
        </div>
      )}

      {/* Task sections */}
      {tasks.length > 0 && (
        <div className="space-y-6">
          {[
            { title: "To do", tasks: todoTasks, status: "todo" },
            { title: "In progress", tasks: inProgressTasks, status: "in_progress" },
            { title: "Done", tasks: doneTasks, status: "done" },
          ].map(section => section.tasks.length > 0 && (
            <div key={section.status}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[10px] font-sans uppercase tracking-[3px] ${statusConfig[section.status as keyof typeof statusConfig].color}`} style={{ fontWeight: 600 }}>
                  {section.title}
                </span>
                <span className="text-[10px] font-mono text-[#8AAABB]">({section.tasks.length})</span>
              </div>
              <div className="space-y-2">
                {section.tasks.map(task => {
                  const StatusIcon = statusConfig[task.status].icon;
                  const due = formatDueDate(task.due_date);
                  return (
                    <div
                      key={task.id}
                      className={`bg-white border-[1.5px] rounded-[10px] p-4 flex items-start gap-3 hover:border-[#7BAFC8] transition-colors cursor-pointer ${
                        task.status === "done" ? "border-[#D8E8EE] opacity-60" : "border-[#D8E8EE]"
                      }`}
                      onClick={() => openEditModal(task)}
                    >
                      {/* Status toggle */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleStatus(task); }}
                        className={`mt-0.5 flex-shrink-0 ${statusConfig[task.status].color} hover:text-[#1A2C38] transition-colors`}
                      >
                        <StatusIcon className="h-5 w-5" />
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[14px] font-sans text-[#1A2C38] ${task.status === "done" ? "line-through" : ""}`} style={{ fontWeight: 500 }}>
                            {task.title}
                          </span>
                          <span className={`text-[9px] font-sans uppercase tracking-[1.5px] px-1.5 py-0.5 rounded-full ${priorityConfig[task.priority].bg} ${priorityConfig[task.priority].color}`} style={{ fontWeight: 600 }}>
                            {priorityConfig[task.priority].label}
                          </span>
                          <span className={`text-[9px] font-sans uppercase tracking-[1px] px-1.5 py-0.5 rounded-full ${categoryConfig[task.category].color}`} style={{ fontWeight: 500 }}>
                            {categoryConfig[task.category].label}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-[12px] font-sans text-[#8AAABB] truncate mb-1">{task.description}</p>
                        )}
                        <div className="flex items-center gap-3">
                          {task.brand_name && (
                            <span className="flex items-center gap-1 text-[11px] font-sans text-[#4A6070]">
                              <Briefcase className="h-3 w-3" /> {task.brand_name}
                            </span>
                          )}
                          {task.due_date && (
                            <span className={`flex items-center gap-1 text-[11px] font-mono ${
                              due.overdue ? "text-[#A03D3D]" : due.soon ? "text-[#A07830]" : "text-[#8AAABB]"
                            }`}>
                              <Calendar className="h-3 w-3" /> {due.text}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(26,44,56,.4)", backdropFilter: "blur(4px)" }}>
          <div className="relative bg-white rounded-[10px] border-[1.5px] border-[#D8E8EE] w-full max-w-lg overflow-hidden">
            <div className="bg-[#F2F8FB] px-6 py-4 border-b border-[#D8E8EE] flex items-center justify-between">
              <h2 className="text-[18px] font-serif text-[#1A2C38]">{editTask ? "Edit task" : "New task"}</h2>
              <button onClick={() => setShowModal(false)} className="text-[#8AAABB] hover:text-[#1A2C38]"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass} style={{ fontWeight: 600 }}>Title *</label>
                <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g., Film TikTok for Glow Recipe" className={inputClass} />
              </div>
              <div>
                <label className={labelClass} style={{ fontWeight: 600 }}>Description</label>
                <textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} rows={2} placeholder="Details, notes, requirements..." className={`${inputClass} resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass} style={{ fontWeight: 600 }}>Brand</label>
                  <input type="text" value={formBrand} onChange={e => setFormBrand(e.target.value)} placeholder="e.g., Glow Recipe" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass} style={{ fontWeight: 600 }}>Due date</label>
                  <input type="date" value={formDueDate} onChange={e => setFormDueDate(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelClass} style={{ fontWeight: 600 }}>Priority</label>
                  <select value={formPriority} onChange={e => setFormPriority(e.target.value as Task["priority"])} className={inputClass}>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass} style={{ fontWeight: 600 }}>Status</label>
                  <select value={formStatus} onChange={e => setFormStatus(e.target.value as Task["status"])} className={inputClass}>
                    <option value="todo">To do</option>
                    <option value="in_progress">In progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass} style={{ fontWeight: 600 }}>Category</label>
                  <select value={formCategory} onChange={e => setFormCategory(e.target.value as Task["category"])} className={inputClass}>
                    <option value="content">Content</option>
                    <option value="delivery">Delivery</option>
                    <option value="outreach">Outreach</option>
                    <option value="invoicing">Invoicing</option>
                    <option value="admin">Admin</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                {editTask && (
                  <button onClick={handleDelete} className="flex items-center gap-1.5 border-[1.5px] border-[#C0392B] text-[#C0392B] rounded-[8px] px-4 py-2.5 text-[13px] font-sans hover:bg-red-50" style={{ fontWeight: 500 }}>
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                )}
                <button onClick={() => setShowModal(false)} className="flex-1 border-[1.5px] border-[#D8E8EE] rounded-[8px] px-4 py-2.5 text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>Cancel</button>
                <button onClick={handleSave} className="flex-1 bg-[#1E3F52] text-white rounded-[8px] px-4 py-2.5 text-[13px] font-sans" style={{ fontWeight: 600 }}>{editTask ? "Save changes" : "Create task"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
