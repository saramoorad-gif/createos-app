"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useSupabaseQuery, useSupabaseMutation } from "@/lib/hooks";
import { useAuth } from "@/contexts/auth-context";
import { hasPermission } from "@/lib/permissions";
import { formatDate, timeAgo } from "@/lib/utils";
import { useToast } from "@/components/global/toast";
import { TableSkeleton } from "@/components/global/skeleton";
import {
  Home,
  Inbox,
  CheckSquare,
  Hash,
  Send,
  Plus,
  Pin,
  X,
  ChevronRight,
  Circle,
  MessageSquare,
  User,
  Clock,
  Filter,
  AlertCircle,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────── */

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  email: string;
}

interface Presence {
  user_id: string;
  last_seen_at: string;
}

interface ActivityEntry {
  id: string;
  actor_name: string;
  action: string;
  target: string;
  created_at: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assigned_to: string;
  assignee_name?: string;
  due_date: string;
  priority: "urgent" | "high" | "medium" | "low";
  status: "todo" | "in_progress" | "done";
  linked_deal?: string;
  linked_creator?: string;
  linked_campaign?: string;
}

interface InboxThread {
  id: string;
  creator_name: string;
  last_message_preview: string;
  status: "open" | "in_progress" | "resolved";
  assigned_to: string;
  assignee_name?: string;
  updated_at: string;
}

interface InboxMessage {
  id: string;
  thread_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  internal_note: boolean;
}

interface Channel {
  id: string;
  name: string;
  description: string;
  visibility: "all" | "managers" | "custom";
  unread_count: number;
}

interface ChannelMessage {
  id: string;
  channel_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  pinned: boolean;
  parent_id?: string;
}

type SubView = "home" | "inbox" | "tasks" | "channels";

const priorityColor: Record<string, string> = {
  urgent: "#A03D3D",
  high: "#A07830",
  medium: "#7BAFC8",
  low: "#8AAABB",
};

const statusLabel: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  todo: "To Do",
  done: "Done",
};

const statusStyle: Record<string, string> = {
  open: "bg-[#FFF4EC] text-[#A07830] border border-[#E8D5B8]",
  in_progress: "bg-[#EDF6FA] text-[#7BAFC8] border border-[#C4DDE8]",
  resolved: "bg-[#EDF8F0] text-[#3D7A58] border border-[#B8DEC4]",
  todo: "bg-[#F2F8FB] text-[#8AAABB] border border-[#D8E8EE]",
  done: "bg-[#EDF8F0] text-[#3D7A58] border border-[#B8DEC4]",
};

/* ─── Shared pieces ──────────────────────────────────────────── */

function Spinner() {
  return <TableSkeleton rows={6} cols={4} />;
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <p className="font-serif italic text-[16px] text-[#8AAABB]">{text}</p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] font-semibold mb-3">
      {children}
    </p>
  );
}

function PriorityPill({ priority }: { priority: string }) {
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium text-white capitalize"
      style={{ backgroundColor: priorityColor[priority] || "#8AAABB" }}
    >
      {priority}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${statusStyle[status] || statusStyle.todo}`}>
      {statusLabel[status] || status}
    </span>
  );
}

function isOnline(lastSeenAt: string): boolean {
  return new Date().getTime() - new Date(lastSeenAt).getTime() < 15 * 60 * 1000;
}

/* ─── SUB-VIEW 1: TEAM HOME ─────────────────────────────────── */

function TeamHome({ userId }: { userId: string }) {
  const { data: team, loading: teamLoading } = useSupabaseQuery<TeamMember>("agency_team");
  const { data: presence, loading: presenceLoading } = useSupabaseQuery<Presence>("agency_presence");
  const { data: activity, loading: activityLoading } = useSupabaseQuery<ActivityEntry>(
    "agency_activity_log",
    { order: { column: "created_at", ascending: false }, limit: 20 }
  );
  const { data: myTasks, loading: tasksLoading } = useSupabaseQuery<Task>(
    "agency_tasks",
    { eq: { column: "assigned_to", value: userId } }
  );

  const loading = teamLoading || presenceLoading || activityLoading || tasksLoading;

  if (loading) return <Spinner />;

  const presenceMap = new Map(presence.map((p) => [p.user_id, p.last_seen_at]));

  const sortedTasks = [...myTasks].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  );

  return (
    <div className="space-y-8">
      {/* Team presence strip */}
      <div>
        <SectionLabel>Team</SectionLabel>
        <div className="flex items-center gap-3 flex-wrap">
          {team.length === 0 && (
            <p className="text-[13px] text-[#8AAABB]">No team members yet.</p>
          )}
          {team.map((member) => {
            const online = presenceMap.has(member.id) && isOnline(presenceMap.get(member.id)!);
            return (
              <div key={member.id} className="relative group" title={member.name}>
                <div className="w-10 h-10 rounded-full bg-[#EDF6FA] flex items-center justify-center text-[14px] font-medium text-[#1E3F52] border border-[#D8E8EE]">
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    member.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    online ? "bg-emerald-500" : "bg-gray-300"
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity feed */}
      <div>
        <SectionLabel>Recent Activity</SectionLabel>
        <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] divide-y divide-[#EDF6FA]">
          {activity.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-[13px] text-[#8AAABB] italic">No activity yet.</p>
            </div>
          ) : (
            activity.map((entry) => (
              <div key={entry.id} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="font-medium text-[#1A2C38]">{entry.actor_name}</span>
                  <span className="text-[#4A6070]">{entry.action}</span>
                  <span className="text-[#7BAFC8] font-medium">{entry.target}</span>
                </div>
                <span className="text-[11px] font-mono text-[#8AAABB] shrink-0 ml-4">
                  {timeAgo(entry.created_at)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* My assignments */}
      <div>
        <SectionLabel>My Assignments</SectionLabel>
        {sortedTasks.length === 0 ? (
          <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] px-5 py-8 text-center">
            <p className="text-[13px] text-[#8AAABB] italic">No tasks assigned to you.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] px-5 py-3.5 flex items-center justify-between"
                style={{ borderLeftWidth: 3, borderLeftColor: priorityColor[task.priority] }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[14px] font-medium text-[#1A2C38]">{task.title}</span>
                  <PriorityPill priority={task.priority} />
                </div>
                <div className="flex items-center gap-4">
                  {(task.linked_deal || task.linked_creator) && (
                    <span className="text-[12px] text-[#7BAFC8]">
                      {task.linked_deal || task.linked_creator}
                    </span>
                  )}
                  <span className="text-[12px] font-mono text-[#8AAABB]">
                    {formatDate(task.due_date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── SUB-VIEW 2: TEAM INBOX ────────────────────────────────── */

function TeamInbox({ userId, role }: { userId: string; role: string }) {
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const { toast } = useToast();

  const { data: threads, loading: threadsLoading, setData: setThreads } =
    useSupabaseQuery<InboxThread>("agency_inbox_threads");
  const { data: messages, loading: messagesLoading, setData: setMessages } =
    useSupabaseQuery<InboxMessage>("agency_inbox_messages");
  const { data: team } = useSupabaseQuery<TeamMember>("agency_team");
  const { insert: insertMessage, loading: sending } = useSupabaseMutation("agency_inbox_messages");

  const loading = threadsLoading || messagesLoading;

  if (loading) return <Spinner />;
  if (threads.length === 0) return <EmptyState text="No creator messages yet." />;

  const threadMessages = messages.filter((m) => m.thread_id === selectedThread);
  const activeThreadData = threads.find((t) => t.id === selectedThread);

  async function handleSend() {
    if (!newMessage.trim() || !selectedThread) return;
    const msg = await insertMessage({
      thread_id: selectedThread,
      sender_name: "You",
      content: newMessage.trim(),
      internal_note: isInternal,
      created_at: new Date().toISOString(),
    });
    if (msg) {
      setMessages((prev) => [...prev, msg as InboxMessage]);
      toast("success", "Message sent");
    }
    setNewMessage("");
    setIsInternal(false);
  }

  async function handleAssign(threadId: string, memberId: string) {
    const member = team.find((t) => t.id === memberId);
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId ? { ...t, assigned_to: memberId, assignee_name: member?.name } : t
      )
    );
  }

  return (
    <div className="flex bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] overflow-hidden" style={{ height: 560 }}>
      {/* Thread sidebar */}
      <div className="w-[280px] border-r border-[#D8E8EE] overflow-y-auto shrink-0">
        <div className="px-4 py-3 border-b border-[#D8E8EE]">
          <SectionLabel>Creator Threads</SectionLabel>
        </div>
        {threads.map((thread) => (
          <button
            key={thread.id}
            onClick={() => setSelectedThread(thread.id)}
            className={`w-full text-left px-4 py-3.5 border-b border-[#EDF6FA] hover:bg-[#FAFCFD] transition-colors ${
              selectedThread === thread.id ? "bg-[#EDF6FA]" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[13px] font-medium text-[#1A2C38] truncate">{thread.creator_name}</span>
              <StatusPill status={thread.status} />
            </div>
            <p className="text-[12px] text-[#4A6070] truncate">{thread.last_message_preview}</p>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[11px] text-[#8AAABB]">{thread.assignee_name || "Unassigned"}</span>
              <span className="text-[10px] font-mono text-[#8AAABB]">{timeAgo(thread.updated_at)}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Message panel */}
      <div className="flex-1 flex flex-col">
        {!selectedThread ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[13px] text-[#8AAABB] italic">Select a thread to view messages</p>
          </div>
        ) : (
          <>
            {/* Thread header with assign */}
            <div className="px-5 py-3 border-b border-[#D8E8EE] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#7BAFC8]" />
                <span className="text-[14px] font-medium text-[#1A2C38]">
                  {activeThreadData?.creator_name}
                </span>
              </div>
              {hasPermission(role, "canAssignTasks") && (
                <select
                  className="text-[12px] border border-[#D8E8EE] rounded-md px-2 py-1 text-[#4A6070] bg-white"
                  value={activeThreadData?.assigned_to || ""}
                  onChange={(e) => handleAssign(selectedThread, e.target.value)}
                >
                  <option value="">Assign to...</option>
                  {team.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {threadMessages.length === 0 ? (
                <p className="text-[13px] text-[#8AAABB] italic text-center py-8">No messages in this thread yet.</p>
              ) : (
                threadMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-[8px] px-4 py-3 ${
                      msg.internal_note
                        ? "bg-[#FFF8E7] border border-[#E8D5B8]"
                        : "bg-[#F2F8FB] border border-[#D8E8EE]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-[#1A2C38]">{msg.sender_name}</span>
                        {msg.internal_note && (
                          <span className="text-[10px] uppercase tracking-wide font-semibold text-[#A07830] bg-[#FFF4EC] px-1.5 py-0.5 rounded">
                            Internal
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-[#8AAABB]">{timeAgo(msg.created_at)}</span>
                    </div>
                    <p className="text-[13px] text-[#4A6070] leading-relaxed">{msg.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Compose */}
            <div className="px-5 py-3 border-t border-[#D8E8EE]">
              <div className="flex items-center gap-2 mb-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded border-[#D8E8EE] text-[#7BAFC8] focus:ring-[#7BAFC8]"
                  />
                  <span className="text-[11px] text-[#4A6070]">Internal note (not visible to creator)</span>
                </label>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 border border-[#D8E8EE] rounded-[8px] px-3 py-2 text-[13px] text-[#1A2C38] placeholder:text-[#8AAABB] focus:outline-none focus:border-[#7BAFC8]"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !newMessage.trim()}
                  className="bg-[#1E3F52] text-white rounded-[8px] px-4 py-2 text-[13px] font-medium hover:bg-[#1A3648] disabled:opacity-40 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── SUB-VIEW 3: TASKS ─────────────────────────────────────── */

type TaskFilter = "mine" | "all" | "overdue";

function TasksView({ userId, role }: { userId: string; role: string }) {
  const [filter, setFilter] = useState<TaskFilter>("mine");
  const [showAddModal, setShowAddModal] = useState(false);
  const { toast } = useToast();
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assigned_to: "",
    due_date: "",
    priority: "medium" as Task["priority"],
    linked_deal: "",
    linked_creator: "",
    linked_campaign: "",
  });

  const { data: tasks, loading, setData: setTasks } = useSupabaseQuery<Task>("agency_tasks");
  const { data: team } = useSupabaseQuery<TeamMember>("agency_team");
  const { insert: insertTask, update: updateTask, loading: mutating } = useSupabaseMutation("agency_tasks");

  const now = new Date();

  const filtered = useMemo(() => {
    let list = [...tasks];
    if (filter === "mine") list = list.filter((t) => t.assigned_to === userId);
    if (filter === "overdue") list = list.filter((t) => new Date(t.due_date) < now && t.status !== "done");
    return list.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  }, [tasks, filter, userId]);

  async function handleAddTask() {
    if (!newTask.title.trim()) return;
    const result = await insertTask({
      ...newTask,
      status: "todo",
      created_at: new Date().toISOString(),
    });
    if (result) {
      setTasks((prev) => [...prev, result as Task]);
      toast("success", "Task created");
    }
    setNewTask({
      title: "",
      description: "",
      assigned_to: "",
      due_date: "",
      priority: "medium",
      linked_deal: "",
      linked_creator: "",
      linked_campaign: "",
    });
    setShowAddModal(false);
  }

  async function cycleStatus(task: Task) {
    const nextStatus: Record<string, string> = { todo: "in_progress", in_progress: "done", done: "todo" };
    const newStatus = nextStatus[task.status] || "todo";
    await updateTask(task.id, { status: newStatus });
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus as Task["status"] } : t))
    );
    toast("success", `Task moved to ${statusLabel[newStatus] || newStatus}`);
  }

  if (loading) return <Spinner />;

  const filterButtons: { key: TaskFilter; label: string }[] = [
    { key: "mine", label: "My Tasks" },
    { key: "all", label: "All Tasks" },
    { key: "overdue", label: "Overdue" },
  ];

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {filterButtons.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                filter === f.key
                  ? "bg-[#1E3F52] text-white"
                  : "bg-[#F2F8FB] text-[#4A6070] hover:bg-[#E4EFF4]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {hasPermission(role, "canAssignTasks") && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-[#7BAFC8] text-white rounded-[8px] px-4 py-2 text-[13px] font-medium hover:bg-[#6AA0BB]"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Task
          </button>
        )}
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <EmptyState text="No tasks yet — create one to keep your team on track." />
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <button
              key={task.id}
              onClick={() => cycleStatus(task)}
              className="w-full text-left bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] px-5 py-3.5 flex items-center justify-between hover:bg-[#FAFCFD] transition-colors"
              style={{ borderLeftWidth: 3, borderLeftColor: priorityColor[task.priority] }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`text-[14px] font-medium ${task.status === "done" ? "line-through text-[#8AAABB]" : "text-[#1A2C38]"}`}>
                  {task.title}
                </span>
                <StatusPill status={task.status} />
                <PriorityPill priority={task.priority} />
              </div>
              <div className="flex items-center gap-4 shrink-0 ml-4">
                {task.assignee_name && (
                  <span className="text-[12px] text-[#4A6070]">{task.assignee_name}</span>
                )}
                {(task.linked_deal || task.linked_creator) && (
                  <span className="text-[12px] text-[#7BAFC8]">{task.linked_deal || task.linked_creator}</span>
                )}
                <span className="text-[12px] font-mono text-[#8AAABB]">{formatDate(task.due_date)}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Add task modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-[#FAF8F4] border-[1.5px] border-[#D8E8EE] rounded-[10px] w-full max-w-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[18px] font-serif text-[#1A2C38]">
                New <em className="text-[#7BAFC8]">task</em>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#8AAABB] hover:text-[#4A6070]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[12px] font-medium text-[#4A6070] block mb-1">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full border border-[#D8E8EE] rounded-[8px] px-3 py-2 text-[13px] text-[#1A2C38] focus:outline-none focus:border-[#7BAFC8]"
                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#4A6070] block mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={3}
                  className="w-full border border-[#D8E8EE] rounded-[8px] px-3 py-2 text-[13px] text-[#1A2C38] focus:outline-none focus:border-[#7BAFC8] resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-medium text-[#4A6070] block mb-1">Assign to</label>
                  <select
                    value={newTask.assigned_to}
                    onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                    className="w-full border border-[#D8E8EE] rounded-[8px] px-3 py-2 text-[13px] text-[#1A2C38] bg-white focus:outline-none focus:border-[#7BAFC8]"
                  >
                    <option value="">Select member</option>
                    {team.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[12px] font-medium text-[#4A6070] block mb-1">Due date</label>
                  <input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    className="w-full border border-[#D8E8EE] rounded-[8px] px-3 py-2 text-[13px] text-[#1A2C38] focus:outline-none focus:border-[#7BAFC8]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-medium text-[#4A6070] block mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task["priority"] })}
                    className="w-full border border-[#D8E8EE] rounded-[8px] px-3 py-2 text-[13px] text-[#1A2C38] bg-white focus:outline-none focus:border-[#7BAFC8]"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-[12px] font-medium text-[#4A6070] block mb-1">Link to</label>
                  <input
                    type="text"
                    value={newTask.linked_deal || newTask.linked_creator || newTask.linked_campaign}
                    onChange={(e) => setNewTask({ ...newTask, linked_deal: e.target.value })}
                    placeholder="Deal, creator, or campaign"
                    className="w-full border border-[#D8E8EE] rounded-[8px] px-3 py-2 text-[13px] text-[#1A2C38] placeholder:text-[#8AAABB] focus:outline-none focus:border-[#7BAFC8]"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-[13px] font-medium text-[#4A6070] hover:text-[#1A2C38]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                disabled={mutating || !newTask.title.trim()}
                className="bg-[#1E3F52] text-white rounded-[8px] px-5 py-2 text-[13px] font-medium hover:bg-[#1A3648] disabled:opacity-40"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── SUB-VIEW 4: CHANNELS ──────────────────────────────────── */

function ChannelsView({ role }: { role: string }) {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [pinToggle, setPinToggle] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChannel, setNewChannel] = useState({ name: "", description: "", visibility: "all" as Channel["visibility"] });
  const { toast } = useToast();

  const { data: channels, loading: channelsLoading, setData: setChannels } =
    useSupabaseQuery<Channel>("agency_channels");
  const { data: messages, loading: messagesLoading, setData: setMessages } =
    useSupabaseQuery<ChannelMessage>("agency_channel_messages");
  const { insert: insertMessage, loading: sending } = useSupabaseMutation("agency_channel_messages");
  const { insert: insertChannel, loading: creating } = useSupabaseMutation("agency_channels");

  const loading = channelsLoading || messagesLoading;

  if (loading) return <Spinner />;

  if (channels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="font-serif italic text-[16px] text-[#8AAABB] mb-4">
          No channels yet — they'll be created automatically when your team starts using Create Suite.
        </p>
        {hasPermission(role, "canCreateChannels") && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 bg-[#7BAFC8] text-white rounded-[8px] px-4 py-2 text-[13px] font-medium hover:bg-[#6AA0BB]"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Channel
          </button>
        )}
        {showCreateModal && (
          <CreateChannelModal
            newChannel={newChannel}
            setNewChannel={setNewChannel}
            creating={creating}
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateChannel}
          />
        )}
      </div>
    );
  }

  const channelMessages = messages
    .filter((m) => m.channel_id === selectedChannel && !m.parent_id)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const replies = messages.filter((m) => m.channel_id === selectedChannel && m.parent_id);
  const activeChannel = channels.find((c) => c.id === selectedChannel);

  async function handleSend() {
    if (!newMessage.trim() || !selectedChannel) return;
    const msg = await insertMessage({
      channel_id: selectedChannel,
      sender_name: "You",
      content: newMessage.trim(),
      pinned: pinToggle,
      created_at: new Date().toISOString(),
    });
    if (msg) {
      setMessages((prev) => [...prev, msg as ChannelMessage]);
      toast("success", "Message sent");
    }
    setNewMessage("");
    setPinToggle(false);
  }

  async function handleCreateChannel() {
    if (!newChannel.name.trim()) return;
    const result = await insertChannel({
      ...newChannel,
      unread_count: 0,
      created_at: new Date().toISOString(),
    });
    if (result) {
      setChannels((prev) => [...prev, result as Channel]);
      toast("success", "Channel created");
    }
    setNewChannel({ name: "", description: "", visibility: "all" });
    setShowCreateModal(false);
  }

  return (
    <>
      <div className="flex bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] overflow-hidden" style={{ height: 560 }}>
        {/* Channel sidebar */}
        <div className="w-[240px] border-r border-[#D8E8EE] flex flex-col shrink-0">
          <div className="px-4 py-3 border-b border-[#D8E8EE]">
            <SectionLabel>Channels</SectionLabel>
          </div>
          <div className="flex-1 overflow-y-auto">
            {channels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setSelectedChannel(ch.id)}
                className={`w-full text-left px-4 py-3 border-b border-[#EDF6FA] hover:bg-[#FAFCFD] transition-colors flex items-center justify-between ${
                  selectedChannel === ch.id ? "bg-[#EDF6FA]" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5 text-[#8AAABB]" />
                  <span className="text-[13px] font-medium text-[#1A2C38]">{ch.name}</span>
                </div>
                {ch.unread_count > 0 && (
                  <span className="bg-[#7BAFC8] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {ch.unread_count}
                  </span>
                )}
              </button>
            ))}
          </div>
          {hasPermission(role, "canCreateChannels") && (
            <div className="px-4 py-3 border-t border-[#D8E8EE]">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full flex items-center justify-center gap-1.5 text-[12px] font-medium text-[#7BAFC8] hover:text-[#6AA0BB]"
              >
                <Plus className="w-3.5 h-3.5" />
                Create channel
              </button>
            </div>
          )}
        </div>

        {/* Message panel */}
        <div className="flex-1 flex flex-col">
          {!selectedChannel ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[13px] text-[#8AAABB] italic">Select a channel to view messages</p>
            </div>
          ) : (
            <>
              {/* Channel header */}
              <div className="px-5 py-3 border-b border-[#D8E8EE] flex items-center gap-2">
                <Hash className="w-4 h-4 text-[#7BAFC8]" />
                <span className="text-[14px] font-medium text-[#1A2C38]">{activeChannel?.name}</span>
                {activeChannel?.description && (
                  <span className="text-[12px] text-[#8AAABB] ml-2">{activeChannel.description}</span>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {channelMessages.length === 0 ? (
                  <p className="text-[13px] text-[#8AAABB] italic text-center py-8">No messages in this channel yet.</p>
                ) : (
                  channelMessages.map((msg) => {
                    const msgReplies = replies.filter((r) => r.parent_id === msg.id);
                    return (
                      <div key={msg.id}>
                        <div className={`rounded-[8px] px-4 py-3 ${msg.pinned ? "bg-[#FFF8E7] border border-[#E8D5B8]" : "bg-[#F2F8FB] border border-[#D8E8EE]"}`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-medium text-[#1A2C38]">{msg.sender_name}</span>
                              {msg.pinned && (
                                <Pin className="w-3 h-3 text-[#A07830]" />
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-[#8AAABB]">{timeAgo(msg.created_at)}</span>
                          </div>
                          <p className="text-[13px] text-[#4A6070] leading-relaxed">{msg.content}</p>
                        </div>
                        {/* Thread replies */}
                        {msgReplies.length > 0 && (
                          <div className="ml-6 mt-1 space-y-1.5">
                            {msgReplies.map((reply) => (
                              <div key={reply.id} className="rounded-[6px] px-3 py-2 bg-[#FAFCFD] border border-[#EDF6FA]">
                                <div className="flex items-center justify-between mb-0.5">
                                  <span className="text-[12px] font-medium text-[#1A2C38]">{reply.sender_name}</span>
                                  <span className="text-[10px] font-mono text-[#8AAABB]">{timeAgo(reply.created_at)}</span>
                                </div>
                                <p className="text-[12px] text-[#4A6070]">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Compose */}
              <div className="px-5 py-3 border-t border-[#D8E8EE]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                    placeholder={`Message #${activeChannel?.name || ""}...`}
                    className="flex-1 border border-[#D8E8EE] rounded-[8px] px-3 py-2 text-[13px] text-[#1A2C38] placeholder:text-[#8AAABB] focus:outline-none focus:border-[#7BAFC8]"
                  />
                  <button
                    onClick={() => setPinToggle(!pinToggle)}
                    className={`rounded-[8px] px-2.5 py-2 border transition-colors ${
                      pinToggle ? "bg-[#FFF8E7] border-[#E8D5B8] text-[#A07830]" : "border-[#D8E8EE] text-[#8AAABB] hover:text-[#4A6070]"
                    }`}
                    title="Pin message"
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={sending || !newMessage.trim()}
                    className="bg-[#1E3F52] text-white rounded-[8px] px-4 py-2 text-[13px] font-medium hover:bg-[#1A3648] disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create channel modal */}
      {showCreateModal && (
        <CreateChannelModal
          newChannel={newChannel}
          setNewChannel={setNewChannel}
          creating={creating}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateChannel}
        />
      )}
    </>
  );
}

function CreateChannelModal({
  newChannel,
  setNewChannel,
  creating,
  onClose,
  onCreate,
}: {
  newChannel: { name: string; description: string; visibility: Channel["visibility"] };
  setNewChannel: (v: { name: string; description: string; visibility: Channel["visibility"] }) => void;
  creating: boolean;
  onClose: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-[#FAF8F4] border-[1.5px] border-[#D8E8EE] rounded-[10px] w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[18px] font-serif text-[#1A2C38]">
            New <em className="text-[#7BAFC8]">channel</em>
          </h3>
          <button onClick={onClose} className="text-[#8AAABB] hover:text-[#4A6070]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-[12px] font-medium text-[#4A6070] block mb-1">Channel name</label>
            <input
              type="text"
              value={newChannel.name}
              onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
              placeholder="e.g. deals, contracts"
              className="w-full border border-[#D8E8EE] rounded-[8px] px-3 py-2 text-[13px] text-[#1A2C38] placeholder:text-[#8AAABB] focus:outline-none focus:border-[#7BAFC8]"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#4A6070] block mb-1">Description</label>
            <input
              type="text"
              value={newChannel.description}
              onChange={(e) => setNewChannel({ ...newChannel, description: e.target.value })}
              placeholder="What is this channel about?"
              className="w-full border border-[#D8E8EE] rounded-[8px] px-3 py-2 text-[13px] text-[#1A2C38] placeholder:text-[#8AAABB] focus:outline-none focus:border-[#7BAFC8]"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#4A6070] block mb-1">Visibility</label>
            <select
              value={newChannel.visibility}
              onChange={(e) => setNewChannel({ ...newChannel, visibility: e.target.value as Channel["visibility"] })}
              className="w-full border border-[#D8E8EE] rounded-[8px] px-3 py-2 text-[13px] text-[#1A2C38] bg-white focus:outline-none focus:border-[#7BAFC8]"
            >
              <option value="all">All team members</option>
              <option value="managers">Managers only</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-[#4A6070] hover:text-[#1A2C38]">
            Cancel
          </button>
          <button
            onClick={onCreate}
            disabled={creating || !newChannel.name.trim()}
            className="bg-[#1E3F52] text-white rounded-[8px] px-5 py-2 text-[13px] font-medium hover:bg-[#1A3648] disabled:opacity-40"
          >
            Create Channel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────── */

const navItems: { key: SubView; label: string; icon: React.ElementType }[] = [
  { key: "home", label: "Home", icon: Home },
  { key: "inbox", label: "Inbox", icon: Inbox },
  { key: "tasks", label: "Tasks", icon: CheckSquare },
  { key: "channels", label: "Channels", icon: Hash },
];

export function TeamTab() {
  const [view, setView] = useState<SubView>("home");
  const { user, profile } = useAuth();

  const userId = user?.id || "";
  // If account_type is agency, they're the owner. Otherwise check agency_role.
  const role = (profile as any)?.account_type === "agency" ? "owner" : ((profile as any)?.agency_role || "assistant");

  return (
    <div className="bg-[#FAF8F4] min-h-screen">
      <PageHeader
        headline={
          <>
            Your <em className="text-[#7BAFC8]">team</em>
          </>
        }
        subheading="Collaborate, communicate, and stay aligned."
      />

      {/* Sub-view nav pills */}
      <div className="flex gap-1.5 mb-8">
        {navItems.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
              view === key
                ? "bg-[#1E3F52] text-white"
                : "bg-white border border-[#D8E8EE] text-[#4A6070] hover:bg-[#F2F8FB]"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Active sub-view */}
      {view === "home" && <TeamHome userId={userId} />}
      {view === "inbox" && <TeamInbox userId={userId} role={role} />}
      {view === "tasks" && <TasksView userId={userId} role={role} />}
      {view === "channels" && <ChannelsView role={role} />}
    </div>
  );
}
