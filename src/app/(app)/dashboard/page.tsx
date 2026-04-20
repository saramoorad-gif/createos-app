"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { AgencyDashboard } from "@/components/agency/agency-dashboard";
import { useSupabaseQuery } from "@/lib/hooks";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/global/toast";
import { DashboardSkeleton } from "@/components/global/skeleton";
import { hasFeatureAccess } from "@/lib/feature-gates";
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

function DashboardRouter() {
  const { profile, loading: authLoading, refreshProfile } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Show success toast after checkout completes and clean up the URL
  // Fires for both creator and agency dashboards.
  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      const plan = searchParams.get("plan") || "";
      const planLabel = planLabels[plan] || "your new plan";
      toast("success", `Subscription activated! Welcome to ${planLabel}.`);
      refreshProfile?.();
      router.replace("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (authLoading) return <DashboardSkeleton />;
  if (!profile) return <div className="pt-20 text-center"><p className="text-[14px] font-sans text-[#8AAABB]">Please sign in to access your dashboard.</p></div>;
  if (profile.account_type === "agency") return <AgencyDashboard />;
  return <CreatorDashboard />;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardRouter />
    </Suspense>
  );
}

const planLabels: Record<string, string> = {
  ugc: "UGC Creator",
  ugc_influencer: "UGC + Influencer",
  agency: "Agency Starter",
};

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

  // Monthly income breakdown — last 6 months (with correct year handling)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyIncome = Array.from({ length: 6 }, (_, i) => {
    const target = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const targetMonth = target.getMonth();
    const targetYear = target.getFullYear();
    const monthInvoices = invoices.filter(inv => {
      if (inv.status !== "paid" || !inv.due_date) return false;
      const d = new Date(inv.due_date);
      if (isNaN(d.getTime())) return false;
      return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
    });
    return { month: monthNames[targetMonth], total: monthInvoices.reduce((s, inv) => s + (inv.amount || 0), 0) };
  });
  const maxIncome = Math.max(...monthlyIncome.map(m => m.total), 1);

  // Active exclusivities
  const activeExclusivities = deals.filter(d =>
    d.exclusivity_days && d.exclusivity_days > 0 && d.exclusivity_category &&
    ["contracted", "in_progress", "delivered"].includes(d.stage)
  );

  // AI insight — gated behind the UGC tier since it hits /api/ai
  // which now returns 403 for free users. Skip entirely so there's no
  // failed network request on every dashboard render.
  const canUseAI = hasFeatureAccess(profile?.account_type, "ai-features");

  async function fetchInsight() {
    if (!user || !canUseAI) return;
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
    if (!dealsLoading && deals.length > 0 && canUseAI) fetchInsight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealsLoading, canUseAI]);

  // Greeting based on time
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (dealsLoading) return <DashboardSkeleton />;

  // New user — show onboarding cards, filtered by what the user's tier can
  // actually access so Free users don't hit a paywall on their first click.
  if (deals.length === 0 && invoices.length === 0) {
    const allCards = [
      { icon: Plus, title: "Log your first deal", desc: "Track a brand partnership from pitch to payment", href: "/deals", cta: "Add a deal", feature: "deals" },
      { icon: FileText, title: "Upload a contract", desc: "Store and review brand contracts in one place", href: "/contracts", cta: "Upload" , feature: "contracts" },
      { icon: ListTodo, title: "Create a task", desc: "Track deliverables, deadlines, and follow-ups", href: "/tasks", cta: "New task", feature: "tasks" },
      { icon: Briefcase, title: "Set up your media kit", desc: "Create a shareable profile that attracts brands", href: "/media-kit", cta: "Build media kit", feature: "media-kit" },
      { icon: TrendingUp, title: "Calculate your rates", desc: "Find out what you should be charging", href: "/rate-calculator", cta: "Check rates", feature: "rate-calculator" },
      { icon: Mail, title: "Connect Gmail", desc: "Auto-detect deals from your email inbox", href: "/integrations", cta: "Connect", feature: "integrations" },
    ];
    // Free users see the three they actually have access to, paid users see all six.
    const onboardingCards = allCards.filter((c) => hasFeatureAccess(profile?.account_type, c.feature));
    const isFree = profile?.account_type === "free";

    return (
      <div className="app-page">
        <div className="wrap-app">
        <div className="page-head">
          <div className="left">
            <h1>Welcome to Create<em>Suite</em>, {displayName}</h1>
            <div className="meta">Your creator business starts here — let&apos;s get you set up.</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {onboardingCards.map(item => (
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
        {isFree && (
          <div className="bg-gradient-to-r from-[#1E3F52] to-[#2a5269] rounded-card p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-[10px] bg-white/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-[#7BAFC8]" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-sans text-white" style={{ fontWeight: 600 }}>Unlock the full creator toolkit</p>
              <p className="text-[12px] font-sans text-white/70">
                UGC Creator ($27/mo) adds AI contract review, rate calculator, media kit, Gmail integration, tasks, and more.
              </p>
            </div>
            <Link
              href="/pricing"
              className="bg-white text-[#1E3F52] rounded-[8px] px-4 py-2 text-[12px] font-sans flex-shrink-0 hover:bg-white/90 transition-colors"
              style={{ fontWeight: 600 }}
            >
              See plans
            </Link>
          </div>
        )}
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      <div className="wrap-app">
      <div className="page-head">
        <div className="left">
          <h1>{greeting}, <em>{displayName}</em></h1>
          <div className="meta">{now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</div>
        </div>
      </div>

      {/* KPI row */}
      <div className="kpi-row">
        <div className="kpi">
          <span className="l">Total earned</span>
          <span className="v">{formatCurrency(totalEarned)}</span>
        </div>
        <div className="kpi">
          <span className="l">Active deals</span>
          <span className="v">{activeDeals.length}</span>
        </div>
        <div className="kpi">
          <span className="l">Pipeline</span>
          <span className="v">{formatCurrency(totalPipeline)}</span>
        </div>
        <div className="kpi">
          <span className="l">Open tasks</span>
          <span className="v">{pendingTasks.length}</span>
        </div>
      </div>

      {/* AI Insight Banner */}
      {(aiInsight || insightLoading) && (
        <div className="ai-banner">
          <span className="ic"><Sparkles className="h-4 w-4" /></span>
          <div>
            <div className="l">Daily insight</div>
            <div className="t">
              {insightLoading ? "Analyzing your business…" : aiInsight}
            </div>
          </div>
          <button onClick={fetchInsight} className="text-white/40 hover:text-white/80 flex-shrink-0" aria-label="Refresh insight">
            <RefreshCw className={`h-4 w-4 ${insightLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      )}

      <div className="dash-split">
        {/* Main content */}
        <div className="space-y-6">
          {/* Alerts row */}
          {(overdueInvoices.length > 0 || overdueTasks.length > 0 || activeExclusivities.length > 0) && (
            <div className="alert-row">
              {overdueInvoices.length > 0 && (
                <Link href="/invoices" className="app-alert danger">
                  <span className="al-head"><DollarSign className="h-3.5 w-3.5" /> Overdue</span>
                  <span className="al-v">{formatCurrency(overdueInvoices.reduce((s, i) => s + i.amount, 0))}</span>
                  <span className="al-sub">{overdueInvoices.length} invoice{overdueInvoices.length > 1 ? "s" : ""}</span>
                </Link>
              )}
              {overdueTasks.length > 0 && (
                <Link href="/tasks" className="app-alert warn">
                  <span className="al-head"><AlertTriangle className="h-3.5 w-3.5" /> Overdue tasks</span>
                  <span className="al-v">{overdueTasks.length}</span>
                  <span className="al-sub">need attention</span>
                </Link>
              )}
              {activeExclusivities.length > 0 && (
                <Link href="/contracts" className="app-alert info">
                  <span className="al-head"><Target className="h-3.5 w-3.5" /> Exclusivities</span>
                  <span className="al-v">{activeExclusivities.length}</span>
                  <span className="al-sub">{Array.from(new Set(activeExclusivities.map(d => d.exclusivity_category))).filter(Boolean).join(", ")}</span>
                </Link>
              )}
            </div>
          )}

          {/* Upcoming deadlines */}
          {(upcomingDeals.length > 0 || upcomingTasks.length > 0) && (
            <div className="block">
              <div className="section-label-row">
                <span className="lbl">Coming up</span>
              </div>
              <div className="panel deadlines-list">
                {upcomingDeals.map(deal => {
                  const dueDate = new Date(deal.due_date!);
                  const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / 86400000);
                  const daysCls = daysUntil === 0 ? "today" : daysUntil <= 3 ? "soon" : "";
                  return (
                    <Link key={deal.id} href="/deals" className="item">
                      <span className="ic"><Briefcase className="h-4 w-4" /></span>
                      <div>
                        <div className="t">{deal.brand_name}</div>
                        <div className="s">{deal.deliverables}</div>
                      </div>
                      <span className="val">{formatCurrency(deal.value)}</span>
                      <span className={`days ${daysCls}`}>
                        {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil}d`}
                      </span>
                    </Link>
                  );
                })}
                {upcomingTasks.map(task => (
                  <Link key={task.id} href="/tasks" className="item">
                    <span className="ic"><ListTodo className="h-4 w-4" /></span>
                    <div>
                      <div className="t">{task.title}</div>
                      {task.brand_name && <div className="s">{task.brand_name}</div>}
                    </div>
                    <span className="val">{task.priority}</span>
                    <span className={`days ${task.priority === "high" ? "today" : ""}`}>
                      {task.due_date ? formatDate(task.due_date) : "—"}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Active deals */}
          {activeDeals.length > 0 && (
            <div className="block">
              <div className="section-label-row">
                <span className="lbl">Active deals</span>
                <Link href="/deals">View all →</Link>
              </div>
              <div className="active-deals">
                {activeDeals.slice(0, 4).map(deal => (
                  <Link key={deal.id} href="/deals" className="deal-card">
                    <div className="top">
                      <span className="logo">{deal.brand_name.slice(0, 2).toUpperCase()}</span>
                      <span className="val">{formatCurrency(deal.value)}</span>
                    </div>
                    <div className="brand">{deal.brand_name}</div>
                    <div className="deliv">{deal.deliverables}</div>
                    <div className="foot">
                      <span className={`stage-pill-full ${deal.stage}`}>{stageLabels[deal.stage] || deal.stage}</span>
                      {deal.due_date && <span className="due">{formatDate(deal.due_date)}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Income chart */}
          {invoices.length > 0 && (
            <div className="block chart-panel">
              <div className="chart-head">
                <h3>Earnings · <em>last 6 months</em></h3>
                <Link href="/income" className="text-[12px] font-sans text-[#3D6E8A] hover:underline" style={{ fontWeight: 500 }}>Details →</Link>
              </div>
              <div className="chart-bars">
                {monthlyIncome.map((m, i) => (
                  <div key={i} className="barwrap">
                    <div
                      className={`bar ${m.total === maxIncome && m.total > 0 ? "highlight" : ""}`}
                      style={{ height: `${Math.max(6, (m.total / maxIncome) * 100)}%` }}
                      title={m.total > 0 ? formatCurrency(m.total) : ""}
                    />
                    <span className="font-mono text-[10px] text-[#8AAABB] mt-1.5">{m.month}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="side-block space-y-6">
          {/* Quick actions */}
          <div className="block">
            <div className="section-label-row"><span className="lbl">Quick actions</span></div>
            <div className="quick-actions">
              {[
                { label: "New deal", href: "/deals", icon: Plus },
                { label: "New task", href: "/tasks", icon: ListTodo },
                { label: "New invoice", href: "/invoices", icon: FileText },
                { label: "Contract review", href: "/contracts", icon: Sparkles },
                { label: "Calculate rates", href: "/rate-calculator", icon: TrendingUp },
                { label: "Edit media kit", href: "/media-kit", icon: Star },
              ].map(a => (
                <Link key={a.label} href={a.href} className="quick-action">
                  <a.icon className="qi h-4 w-4" />
                  {a.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Tasks snapshot */}
          {pendingTasks.length > 0 && (
            <div className="block">
              <div className="section-label-row">
                <span className="lbl">Tasks</span>
                <Link href="/tasks">All →</Link>
              </div>
              <div className="panel">
                {pendingTasks.slice(0, 4).map(task => (
                  <Link key={task.id} href="/tasks" className="item">
                    <span className={`checkbox ${task.status === "in_progress" ? "done" : ""}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] text-[#1A2C38] truncate" style={{ fontWeight: 500 }}>{task.title}</p>
                      {task.brand_name && <p className="text-[10.5px] font-mono text-[#8AAABB]">{task.brand_name}</p>}
                    </div>
                    {task.priority === "high" && <AlertTriangle className="h-3 w-3 text-[#A03D3D] flex-shrink-0" />}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent invoices */}
          {invoices.length > 0 && (
            <div className="block">
              <div className="section-label-row">
                <span className="lbl">Invoices</span>
                <Link href="/invoices">All →</Link>
              </div>
              <div className="panel">
                {invoices.slice(0, 3).map(inv => (
                  <div key={inv.id} className="item">
                    <span />
                    <div>
                      <p className="text-[12.5px] text-[#1A2C38]" style={{ fontWeight: 500 }}>{inv.brand_name}</p>
                      <span className={`text-[9.5px] font-mono uppercase tracking-[1.5px] ${
                        inv.status === "paid" ? "text-[#3D7A58]" :
                        inv.status === "overdue" ? "text-[#A03D3D]" :
                        "text-[#3D6E8A]"
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
            <div className="block">
              <div className="section-label-row"><span className="lbl">Pipeline</span></div>
              <div className="panel panel-padded funnel">
                {["lead", "negotiating", "contracted", "in_progress", "delivered", "paid"].map(stage => {
                  const count = deals.filter(d => d.stage === stage).length;
                  if (count === 0) return null;
                  const pct = (count / deals.length) * 100;
                  return (
                    <div key={stage} className="row">
                      <span className="name">{stageLabels[stage]}</span>
                      <span className="bar"><i style={{ width: `${pct}%` }} /></span>
                      <span className="count">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </div>
      </div>
    </div>
  );
}
