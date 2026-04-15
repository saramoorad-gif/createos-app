"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { AgencyDashboard } from "@/components/agency/agency-dashboard";
import { PageHeader } from "@/components/layout/page-header";
import { useSupabaseQuery } from "@/lib/hooks";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/global/toast";
import { DashboardSkeleton } from "@/components/global/skeleton";
import Link from "next/link";
import {
  ArrowRight, Plus, TrendingUp, FileText, Briefcase, Star,
  CheckCircle2, Clock, AlertTriangle, Mail, Calendar, DollarSign,
  Sparkles, RefreshCw, Zap, Target, BarChart3, ListTodo,
} from "lucide-react";

interface Deal {
  id: string;
  brand_name: string;
  stage: string;
  value: number;
  deliverables: string;
  due_date: string | null;
  deal_type: string;
  notes: string;
  exclusivity_days: number | null;
  exclusivity_category: string | null;
  platform: string | null;
  created_at: string;
}

interface Invoice {
  id: string;
  brand_name: string;
  amount: number;
  status: string;
  due_date: string;
}

interface Task {
  id: string;
  title: string;
  brand_name: string | null;
  due_date: string | null;
  priority: string;
  status: string;
}

const stageLabels: Record<string, string> = {
  lead: "Lead", pitched: "Pitched", negotiating: "Negotiating", contracted: "Contracted",
  in_progress: "In Progress", delivered: "Delivered", paid: "Paid",
};

const stageColors: Record<string, string> = {
  lead: "bg-[#F2F8FB] text-[#3D6E8A]", negotiating: "bg-[#FFF8E8] text-[#A07830]",
  contracted: "bg-[#E6F2EB] text-[#3D7A58]", in_progress: "bg-[#F2F8FB] text-[#7BAFC8]",
  delivered: "bg-[#E8F4EE] text-[#3D7A58]", paid: "bg-[#E8F4EE] text-[#3D7A58]",
};

export default function DashboardPage() {
  const { profile, loading: authLoading } = useAuth();

  if (authLoading) return <DashboardSkeleton />;
  if (!profile) return <div className="pt-20 text-center"><p className="text-[14px] font-sans text-[#8AAABB]">Please sign in to access your dashboard.</p></div>;
  if (profile.account_type === "agency") return <AgencyDashboard />;
  return <CreatorDashboard />;
}

function CreatorDashboard() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const displayName = profile?.full_name?.split(" ")[0] || "there";

  const { data: deals, loading: dealsLoading } = useSupabaseQuery<Deal>("deals", { order: { column: "created_at", ascending: false } });
  const { data: invoices } = useSupabaseQuery<Invoice>("invoices");
  const { data: tasks } = useSupabaseQuery<Task>("creator_tasks", { order: { column: "created_at", ascending: false } });

  const [aiInsight, setAiInsight] = useState<string>("");
  const [insightLoading, setInsightLoading] = useState(false);

  const activeDeals = deals.filter(d => ["contracted", "in_progress", "negotiating"].includes(d.stage));
  const completedDeals = deals.filter(d => ["delivered", "paid"].includes(d.stage));
  const totalEarned = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalPipeline = deals.reduce((s, d) => s + (d.value || 0), 0);
  const overdueInvoices = invoices.filter(i => i.status === "overdue");
  const pendingTasks = tasks.filter(t => t.status !== "done");
  const overdueTasks = tasks.filter(t => t.status !== "done" && t.due_date && new Date(t.due_date) < new Date());

  // Upcoming deadlines (deals + tasks combined)
  const now = new Date();
  const upcomingDeals = deals
    .filter(d => d.due_date && new Date(d.due_date) >= now && ["contracted", "in_progress", "negotiating"].includes(d.stage))
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 5);

  const upcomingTasks = tasks
    .filter(t => t.due_date && new Date(t.due_date) >= now && t.status !== "done")
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 3);

  // Monthly income breakdown
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonth = now.getMonth();
  const monthlyIncome = Array.from({ length: 6 }, (_, i) => {
    const month = (currentMonth - 5 + i + 12) % 12;
    const monthInvoices = invoices.filter(inv => {
      if (inv.status !== "paid") return false;
      const d = new Date(inv.due_date);
      return d.getMonth() === month;
    });
    return { month: monthNames[month], total: monthInvoices.reduce((s, inv) => s + inv.amount, 0) };
  });
  const maxIncome = Math.max(...monthlyIncome.map(m => m.total), 1);

  // Active exclusivities
  const activeExclusivities = deals.filter(d =>
    d.exclusivity_days && d.exclusivity_days > 0 && d.exclusivity_category &&
    ["contracted", "in_progress", "delivered"].includes(d.stage)
  );

  // AI insight
  async function fetchInsight() {
    if (!user) return;
    setInsightLoading(true);
    try {
      const context = {
        activeDeals: activeDeals.length,
        totalPipeline: totalPipeline,
        totalEarned: totalEarned,
        overdueInvoices: overdueInvoices.length,
        pendingTasks: pendingTasks.length,
        upcomingDeadlines: upcomingDeals.length,
        completedDeals: completedDeals.length,
        dealBrands: activeDeals.map(d => d.brand_name).join(", "),
      };
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "dashboard_insight",
          context: { message: `Creator dashboard stats: ${JSON.stringify(context)}. Give a brief (2-3 sentence) personalized daily insight with one actionable tip. Be specific about their numbers. Keep it motivational but practical.` },
        }),
      });
      const data = await res.json();
      setAiInsight(data.result || "Focus on your highest-value deals today.");
    } catch {
      setAiInsight("Focus on your highest-value active deals and follow up on any overdue invoices.");
    } finally { setInsightLoading(false); }
  }

  useEffect(() => {
    if (!dealsLoading && deals.length > 0) fetchInsight();
  }, [dealsLoading]);

  // Greeting based on time
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (dealsLoading) return <DashboardSkeleton />;

  // New user
  if (deals.length === 0 && invoices.length === 0) {
    return (
      <div>
        <PageHeader
          headline={<>Welcome to Create<em className="italic text-[#7BAFC8]">Suite</em>, {displayName}</>}
          subheading="Your creator business starts here. Let's get you set up."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Plus, title: "Log your first deal", desc: "Track a brand partnership from pitch to payment", href: "/deals", cta: "Add a deal" },
            { icon: ListTodo, title: "Create a task", desc: "Track deliverables, deadlines, and follow-ups", href: "/tasks", cta: "New task" },
            { icon: Briefcase, title: "Set up your media kit", desc: "Create a shareable profile that attracts brands", href: "/media-kit", cta: "Build media kit" },
            { icon: TrendingUp, title: "Calculate your rates", desc: "Find out what you should be charging", href: "/rate-calculator", cta: "Check rates" },
            { icon: FileText, title: "Review a contract", desc: "Upload a contract for AI-powered analysis", href: "/contracts", cta: "AI review" },
            { icon: Mail, title: "Connect Gmail", desc: "Auto-detect deals from your email inbox", href: "/integrations", cta: "Connect" },
          ].map(item => (
            <Link key={item.title} href={item.href} className="bg-white border-[1.5px] border-[#D8E8EE] rounded-card p-5 hover:border-[#7BAFC8] hover:shadow-card transition-all group">
              <div className="h-10 w-10 rounded-[10px] bg-[#F2F8FB] flex items-center justify-center mb-3 group-hover:bg-[#7BAFC8]/10 transition-colors">
                <item.icon className="h-5 w-5 text-[#7BAFC8]" />
              </div>
              <h3 className="text-[14px] font-sans text-[#1A2C38] mb-1" style={{ fontWeight: 600 }}>{item.title}</h3>
              <p className="text-[12px] font-sans text-[#8AAABB] mb-3">{item.desc}</p>
              <span className="text-[12px] font-sans text-[#7BAFC8]" style={{ fontWeight: 500 }}>{item.cta} <ArrowRight className="h-3 w-3 inline" /></span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        headline={<>{greeting}, <em className="italic text-[#7BAFC8]">{displayName}</em></>}
        subheading={now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        stats={[
          { value: formatCurrency(totalEarned), label: "Total earned" },
          { value: String(activeDeals.length), label: "Active deals" },
          { value: formatCurrency(totalPipeline), label: "Pipeline" },
          { value: String(pendingTasks.length), label: "Open tasks" },
        ]}
      />

      {/* AI Insight Banner */}
      {(aiInsight || insightLoading) && (
        <div className="mb-6 bg-gradient-to-r from-[#1E3F52] to-[#2a5269] rounded-[10px] p-4 flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="h-4 w-4 text-[#7BAFC8]" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-sans uppercase tracking-[2px] text-white/50 mb-1" style={{ fontWeight: 600 }}>AI DAILY INSIGHT</p>
            {insightLoading ? (
              <p className="text-[13px] font-sans text-white/60">Analyzing your business...</p>
            ) : (
              <p className="text-[13px] font-sans text-white/90 leading-relaxed">{aiInsight}</p>
            )}
          </div>
          <button onClick={fetchInsight} className="text-white/40 hover:text-white/80 flex-shrink-0">
            <RefreshCw className={`h-3.5 w-3.5 ${insightLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        {/* Main content */}
        <div className="space-y-6">
          {/* Alerts row */}
          {(overdueInvoices.length > 0 || overdueTasks.length > 0 || activeExclusivities.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {overdueInvoices.length > 0 && (
                <Link href="/invoices" className="bg-[#F4EAEA] border-[1.5px] border-[#A03D3D]/20 rounded-[10px] p-4 hover:border-[#A03D3D]/40 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-[#A03D3D]" />
                    <span className="text-[11px] font-sans uppercase tracking-[1px] text-[#A03D3D]" style={{ fontWeight: 600 }}>Overdue</span>
                  </div>
                  <p className="text-[18px] font-serif text-[#A03D3D]">{formatCurrency(overdueInvoices.reduce((s, i) => s + i.amount, 0))}</p>
                  <p className="text-[11px] font-sans text-[#A03D3D]/70">{overdueInvoices.length} invoice{overdueInvoices.length > 1 ? "s" : ""}</p>
                </Link>
              )}
              {overdueTasks.length > 0 && (
                <Link href="/tasks" className="bg-[#FFF8E8] border-[1.5px] border-[#A07830]/20 rounded-[10px] p-4 hover:border-[#A07830]/40 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-[#A07830]" />
                    <span className="text-[11px] font-sans uppercase tracking-[1px] text-[#A07830]" style={{ fontWeight: 600 }}>Overdue tasks</span>
                  </div>
                  <p className="text-[18px] font-serif text-[#A07830]">{overdueTasks.length}</p>
                  <p className="text-[11px] font-sans text-[#A07830]/70">need attention</p>
                </Link>
              )}
              {activeExclusivities.length > 0 && (
                <Link href="/contracts" className="bg-[#F2F8FB] border-[1.5px] border-[#7BAFC8]/20 rounded-[10px] p-4 hover:border-[#7BAFC8]/40 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-4 w-4 text-[#3D6E8A]" />
                    <span className="text-[11px] font-sans uppercase tracking-[1px] text-[#3D6E8A]" style={{ fontWeight: 600 }}>Exclusivities</span>
                  </div>
                  <p className="text-[18px] font-serif text-[#3D6E8A]">{activeExclusivities.length}</p>
                  <p className="text-[11px] font-sans text-[#3D6E8A]/70">{[...new Set(activeExclusivities.map(d => d.exclusivity_category))].join(", ")}</p>
                </Link>
              )}
            </div>
          )}

          {/* Upcoming deadlines */}
          {(upcomingDeals.length > 0 || upcomingTasks.length > 0) && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB]" style={{ fontWeight: 600 }}>COMING UP</p>
              </div>
              <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] overflow-hidden">
                {upcomingDeals.map(deal => {
                  const dueDate = new Date(deal.due_date!);
                  const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / 86400000);
                  return (
                    <Link key={deal.id} href="/deals" className="flex items-center justify-between px-4 py-3 border-b border-[#D8E8EE] last:border-b-0 hover:bg-[#FAF8F4] transition-colors">
                      <div className="flex items-center gap-3">
                        <Briefcase className="h-4 w-4 text-[#7BAFC8]" />
                        <div>
                          <p className="text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>{deal.brand_name}</p>
                          <p className="text-[11px] font-sans text-[#8AAABB]">{deal.deliverables}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[14px] font-serif text-[#3D6E8A]">{formatCurrency(deal.value)}</p>
                        <p className={`text-[11px] font-mono ${daysUntil <= 3 ? "text-[#A07830]" : "text-[#8AAABB]"}`}>
                          {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil}d`}
                        </p>
                      </div>
                    </Link>
                  );
                })}
                {upcomingTasks.map(task => (
                  <Link key={task.id} href="/tasks" className="flex items-center justify-between px-4 py-3 border-b border-[#D8E8EE] last:border-b-0 hover:bg-[#FAF8F4] transition-colors">
                    <div className="flex items-center gap-3">
                      <ListTodo className="h-4 w-4 text-[#A07830]" />
                      <div>
                        <p className="text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>{task.title}</p>
                        {task.brand_name && <p className="text-[11px] font-sans text-[#8AAABB]">{task.brand_name}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[9px] font-sans uppercase tracking-[1.5px] px-1.5 py-0.5 rounded-full ${
                        task.priority === "high" ? "bg-[#F4EAEA] text-[#A03D3D]" : "bg-[#F2F8FB] text-[#8AAABB]"
                      }`} style={{ fontWeight: 600 }}>{task.priority}</span>
                      {task.due_date && <p className="text-[11px] font-mono text-[#8AAABB] mt-0.5">{formatDate(task.due_date)}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Active deals */}
          {activeDeals.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB]" style={{ fontWeight: 600 }}>ACTIVE DEALS</p>
                <Link href="/deals" className="text-[12px] font-sans text-[#7BAFC8] hover:underline" style={{ fontWeight: 500 }}>View all →</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeDeals.slice(0, 4).map(deal => (
                  <Link key={deal.id} href="/deals" className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-4 hover:border-[#7BAFC8] hover:shadow-card transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[14px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>{deal.brand_name}</p>
                      <p className="text-[16px] font-serif text-[#3D6E8A]">{formatCurrency(deal.value)}</p>
                    </div>
                    <p className="text-[12px] font-sans text-[#8AAABB] mb-2 truncate">{deal.deliverables}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-sans uppercase tracking-[1.5px] px-2 py-0.5 rounded-full ${stageColors[deal.stage] || "bg-[#F2F8FB] text-[#8AAABB]"}`} style={{ fontWeight: 700 }}>
                        {stageLabels[deal.stage] || deal.stage}
                      </span>
                      {deal.due_date && <span className="text-[11px] font-mono text-[#8AAABB]">{formatDate(deal.due_date)}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Income chart */}
          {invoices.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB]" style={{ fontWeight: 600 }}>INCOME (6 MONTHS)</p>
                <Link href="/income" className="text-[12px] font-sans text-[#7BAFC8] hover:underline" style={{ fontWeight: 500 }}>Details →</Link>
              </div>
              <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5">
                <div className="flex items-end justify-between gap-2" style={{ height: "120px" }}>
                  {monthlyIncome.map((m, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] font-mono text-[#8AAABB]">{m.total > 0 ? `$${Math.round(m.total / 1000)}k` : ""}</span>
                      <div className="w-full flex justify-center">
                        <div
                          className="w-8 rounded-t-[4px] bg-[#7BAFC8] transition-all hover:bg-[#6AA0BB]"
                          style={{ height: `${Math.max(4, (m.total / maxIncome) * 90)}px` }}
                        />
                      </div>
                      <span className="text-[10px] font-sans text-[#8AAABB]">{m.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Quick actions */}
          <div>
            <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-3" style={{ fontWeight: 600 }}>QUICK ACTIONS</p>
            <div className="space-y-2">
              {[
                { label: "New deal", href: "/deals", icon: Plus },
                { label: "New task", href: "/tasks", icon: ListTodo },
                { label: "New invoice", href: "/invoices", icon: FileText },
                { label: "AI contract review", href: "/contracts", icon: Sparkles },
                { label: "Calculate rates", href: "/rate-calculator", icon: TrendingUp },
                { label: "Edit media kit", href: "/media-kit", icon: Star },
              ].map(a => (
                <Link key={a.label} href={a.href} className="flex items-center gap-3 bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] px-4 py-3 text-[13px] font-sans text-[#1A2C38] hover:border-[#7BAFC8] transition-all" style={{ fontWeight: 500 }}>
                  <a.icon className="h-4 w-4 text-[#7BAFC8]" />
                  {a.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Tasks snapshot */}
          {pendingTasks.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB]" style={{ fontWeight: 600 }}>TASKS</p>
                <Link href="/tasks" className="text-[11px] font-sans text-[#7BAFC8] hover:underline" style={{ fontWeight: 500 }}>All →</Link>
              </div>
              <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] overflow-hidden">
                {pendingTasks.slice(0, 4).map(task => (
                  <Link key={task.id} href="/tasks" className="flex items-center gap-3 px-4 py-3 border-b border-[#D8E8EE] last:border-b-0 hover:bg-[#FAF8F4] transition-colors">
                    <div className={`h-4 w-4 rounded-full border-2 flex-shrink-0 ${
                      task.status === "in_progress" ? "border-[#7BAFC8] bg-[#7BAFC8]/20" : "border-[#D8E8EE]"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-sans text-[#1A2C38] truncate" style={{ fontWeight: 500 }}>{task.title}</p>
                      {task.brand_name && <p className="text-[10px] font-sans text-[#8AAABB]">{task.brand_name}</p>}
                    </div>
                    {task.priority === "high" && <AlertTriangle className="h-3 w-3 text-[#A03D3D] flex-shrink-0" />}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent invoices */}
          {invoices.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB]" style={{ fontWeight: 600 }}>INVOICES</p>
                <Link href="/invoices" className="text-[11px] font-sans text-[#7BAFC8] hover:underline" style={{ fontWeight: 500 }}>All →</Link>
              </div>
              <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] overflow-hidden">
                {invoices.slice(0, 3).map(inv => (
                  <div key={inv.id} className="flex items-center justify-between px-4 py-3 border-b border-[#D8E8EE] last:border-b-0">
                    <div>
                      <p className="text-[12px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>{inv.brand_name}</p>
                      <span className={`text-[9px] font-sans uppercase tracking-[1.5px] px-1.5 py-0.5 rounded-full ${
                        inv.status === "paid" ? "bg-[#E8F4EE] text-[#3D7A58]" :
                        inv.status === "overdue" ? "bg-[#F4EAEA] text-[#A03D3D]" :
                        "bg-[#F2F8FB] text-[#3D6E8A]"
                      }`} style={{ fontWeight: 600 }}>{inv.status}</span>
                    </div>
                    <p className="text-[14px] font-serif text-[#1A2C38]">{formatCurrency(inv.amount)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deal stages funnel */}
          {deals.length > 0 && (
            <div>
              <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-3" style={{ fontWeight: 600 }}>PIPELINE</p>
              <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-4 space-y-2">
                {["lead", "negotiating", "contracted", "in_progress", "delivered", "paid"].map(stage => {
                  const count = deals.filter(d => d.stage === stage).length;
                  if (count === 0) return null;
                  const pct = (count / deals.length) * 100;
                  return (
                    <div key={stage} className="flex items-center gap-2">
                      <span className="text-[10px] font-sans text-[#8AAABB] w-20 text-right" style={{ fontWeight: 500 }}>{stageLabels[stage]}</span>
                      <div className="flex-1 h-[6px] bg-[#D8E8EE] rounded-full overflow-hidden">
                        <div className="h-full bg-[#7BAFC8] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] font-mono text-[#8AAABB] w-6">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
