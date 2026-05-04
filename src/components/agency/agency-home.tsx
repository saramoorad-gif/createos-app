"use client";

import { useSupabaseQuery } from "@/lib/hooks";
import { useAuth } from "@/contexts/auth-context";
import { formatCurrency, formatDate, timeAgo } from "@/lib/utils";
import { CheckCircle2, ArrowRight, Briefcase, Users, Plus, Target, BarChart3 } from "lucide-react";
import { DashboardSkeleton } from "@/components/global/skeleton";

interface Deal {
  id: string;
  brand_name: string;
  stage: string;
  value: number;
  due_date: string | null;
  deliverables: string;
  creator_id: string;
  created_at: string;
  updated_at: string;
}

interface Invoice {
  id: string;
  brand_name: string;
  amount: number;
  status: string;
  due_date: string;
}

interface Contract {
  id: string;
  brand_name: string;
  stage: string;
  expiry_date: string;
  creator_id: string;
}

interface ActivityEntry {
  id: string;
  actor_id: string;
  action_type: string;
  target_type: string;
  metadata: Record<string, string>;
  created_at: string;
}

interface CreatorLink {
  id: string;
  creator_id: string;
  commission_rate: number;
  status: string;
}

const priorityToAlert: Record<string, "danger" | "warn" | "info"> = {
  urgent: "danger",
  warning: "warn",
  info: "info",
  success: "info",
};

export function AgencyHome({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { profile } = useAuth();
  const displayName = profile?.full_name?.split(" ")[0] || "there";

  const { data: deals, loading: dealsLoading } = useSupabaseQuery<Deal>("deals", { order: { column: "created_at", ascending: false } });
  const { data: invoices } = useSupabaseQuery<Invoice>("invoices");
  const { data: contracts } = useSupabaseQuery<Contract>("contracts");
  const { data: activity } = useSupabaseQuery<ActivityEntry>("agency_activity_log", { order: { column: "created_at", ascending: false }, limit: 10 });
  const { data: creatorLinks } = useSupabaseQuery<CreatorLink>("agency_creator_links");

  const activeDeals = deals.filter(d => ["contracted", "in_progress", "negotiating"].includes(d.stage));
  const overdueInvoices = invoices.filter(i => i.status === "overdue");
  const unsignedContracts = contracts.filter(c => c.stage === "draft" || c.stage === "sent_to_brand" || c.stage === "redlined");
  const totalPipeline = deals.reduce((s, d) => s + (d.value || 0), 0);
  const activeCreators = creatorLinks.filter(l => l.status === "active").length;

  // Upcoming deadlines (next 7 days)
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 86400000);
  const upcomingDeadlines = deals
    .filter(d => d.due_date && new Date(d.due_date) <= weekFromNow && new Date(d.due_date) >= now)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());

  // Stale deals (no activity in 14+ days)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000);
  const staleDeals = deals.filter(d =>
    ["pitched", "negotiating", "contracted"].includes(d.stage) &&
    new Date(d.updated_at || d.created_at) < twoWeeksAgo
  );

  // Action items
  const actionItems: { priority: string; text: string; detail: string; action: string; tab: string }[] = [];

  overdueInvoices.forEach(inv => {
    actionItems.push({ priority: "urgent", text: `${inv.brand_name} invoice is overdue`, detail: `$${inv.amount} was due ${formatDate(inv.due_date)}`, action: "View invoices", tab: "pipeline" });
  });

  unsignedContracts.forEach(con => {
    actionItems.push({ priority: "warning", text: `${con.brand_name} contract needs attention`, detail: `Status: ${con.stage.replace(/_/g, " ")}`, action: "View contracts", tab: "contracts" });
  });

  staleDeals.forEach(deal => {
    actionItems.push({ priority: "info", text: `${deal.brand_name} deal is stale`, detail: `No activity in 14+ days — ${deal.stage.replace(/_/g, " ")}`, action: "View pipeline", tab: "pipeline" });
  });

  upcomingDeadlines.forEach(deal => {
    actionItems.push({ priority: "warning", text: `${deal.brand_name} deadline approaching`, detail: `Due ${formatDate(deal.due_date!)}`, action: "View deal", tab: "pipeline" });
  });

  if (dealsLoading) {
    return <DashboardSkeleton />;
  }

  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="app-page">
      <div className="wrap-app">
        <div className="page-head">
          <div className="left">
            <h1>{greeting}, <em>{displayName}</em></h1>
            <div className="meta">Here&apos;s what&apos;s happening across your roster today.</div>
          </div>
        </div>

        {/* KPI row */}
        <div className="kpi-row">
          <div className="kpi">
            <span className="l">Pipeline value</span>
            <span className="v">{formatCurrency(totalPipeline)}</span>
          </div>
          <div className="kpi">
            <span className="l">Active deals</span>
            <span className="v">{activeDeals.length}</span>
          </div>
          <div className="kpi">
            <span className="l">Creators</span>
            <span className="v">{activeCreators}</span>
          </div>
          <div className="kpi">
            <span className="l">Overdue</span>
            <span className="v">{overdueInvoices.length}</span>
          </div>
        </div>

        <div className="dash-split">
          {/* Main content */}
          <div>
            {/* Action items */}
            {actionItems.length > 0 && (
              <div className="block">
                <div className="section-label-row">
                  <span className="lbl">Needs attention ({actionItems.length})</span>
                </div>
                <div className="flex flex-col gap-2">
                  {actionItems.slice(0, 6).map((item, i) => (
                    <button
                      key={i}
                      onClick={() => onNavigate(item.tab)}
                      className={`app-alert ${priorityToAlert[item.priority] || "info"} text-left`}
                      style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 12 }}
                    >
                      <div>
                        <span className="al-head">{item.text}</span>
                        <span className="al-sub" style={{ display: "block", marginTop: 4, textTransform: "none", letterSpacing: 0, fontFamily: "inherit", fontSize: 12 }}>
                          {item.detail}
                        </span>
                      </div>
                      <span className="text-[12px] font-sans font-medium text-[#3D6E8A] whitespace-nowrap">
                        {item.action} <ArrowRight className="h-3 w-3 inline" />
                      </span>
                    </button>
                  ))}
                  {actionItems.length > 6 && (
                    <p className="text-[12px] font-sans font-medium text-[#3D6E8A] mt-1">
                      +{actionItems.length - 6} more items
                    </p>
                  )}
                </div>
              </div>
            )}

            {actionItems.length === 0 && (
              <div className="block">
                <div className="app-alert info" style={{ background: "var(--success-bg)", borderColor: "color-mix(in oklab, var(--success) 20%, white)" }}>
                  <span className="al-head" style={{ color: "var(--success)" }}>
                    <CheckCircle2 className="h-4 w-4 inline mr-1" /> All clear
                  </span>
                  <span className="al-sub" style={{ color: "var(--success)", opacity: 0.9 }}>No urgent items right now.</span>
                </div>
              </div>
            )}

            {/* Pipeline snapshot */}
            <div className="block">
              <div className="section-label-row">
                <span className="lbl">Pipeline snapshot</span>
                <a onClick={() => onNavigate("pipeline")}>View all →</a>
              </div>
              {activeDeals.length > 0 ? (
                <div className="active-deals">
                  {activeDeals.slice(0, 4).map(deal => (
                    <button key={deal.id} onClick={() => onNavigate("pipeline")} className="deal-card text-left">
                      <div className="top">
                        <span className="logo">{deal.brand_name.slice(0, 2).toUpperCase()}</span>
                        <span className="val">{formatCurrency(deal.value)}</span>
                      </div>
                      <div className="brand">{deal.brand_name}</div>
                      <div className="deliv">{deal.deliverables}</div>
                      <div className="foot">
                        <span className={`stage-pill-full ${deal.stage}`}>{deal.stage.replace(/_/g, " ")}</span>
                        {deal.due_date && <span className="due">{formatDate(deal.due_date)}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="panel panel-padded text-center py-8">
                  <p className="font-serif italic text-[#8AAABB]">No active deals</p>
                  <button onClick={() => onNavigate("pipeline")} className="text-[13px] font-sans font-medium text-[#3D6E8A] hover:underline mt-2">Create a deal →</button>
                </div>
              )}
            </div>

            {/* Recent activity */}
            <div className="block">
              <div className="section-label-row">
                <span className="lbl">Recent activity</span>
                <a onClick={() => onNavigate("team")}>View all →</a>
              </div>
              {activity.length > 0 ? (
                <div className="panel deadlines-list">
                  {activity.slice(0, 5).map(entry => (
                    <div key={entry.id} className="item">
                      <span className="ic"><BarChart3 className="h-4 w-4" /></span>
                      <div>
                        <div className="t">{entry.action_type.replace(/_/g, " ")}</div>
                      </div>
                      <span className="val" />
                      <span className="days">{timeAgo(entry.created_at)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[14px] font-serif italic text-[#8AAABB] text-center py-6">No recent activity</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="side-block space-y-6">
            {/* Quick actions */}
            <div className="block">
              <div className="section-label-row"><span className="lbl">Quick actions</span></div>
              <div className="quick-actions">
                {[
                  { label: "New deal", tab: "pipeline", icon: Plus },
                  { label: "New campaign", tab: "campaigns", icon: Plus },
                  { label: "View roster", tab: "roster", icon: Users },
                  { label: "Check conflicts", tab: "conflicts", icon: Target },
                  { label: "View reports", tab: "reports", icon: BarChart3 },
                ].map(a => (
                  <button key={a.label} onClick={() => onNavigate(a.tab)} className="quick-action text-left">
                    <a.icon className="qi h-4 w-4" />
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pipeline health — reuses funnel */}
            <div className="block">
              <div className="section-label-row"><span className="lbl">Pipeline health</span></div>
              <div className="panel panel-padded funnel">
                {[
                  { label: "On track", count: deals.filter(d => d.due_date && new Date(d.due_date) > now).length, max: deals.length },
                  { label: "Due this week", count: upcomingDeadlines.length, max: deals.length },
                  { label: "Overdue", count: deals.filter(d => d.due_date && new Date(d.due_date) < now && !["paid", "delivered"].includes(d.stage)).length, max: deals.length },
                  { label: "Stale (14d+)", count: staleDeals.length, max: deals.length },
                ].map(item => {
                  const pct = item.max > 0 ? (item.count / item.max) * 100 : 0;
                  return (
                    <div key={item.label} className="row">
                      <span className="name">{item.label}</span>
                      <span className="bar"><i style={{ width: `${pct}%` }} /></span>
                      <span className="count">{item.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Revenue this month */}
            <div className="block">
              <div className="section-label-row"><span className="lbl">This month</span></div>
              <div className="panel panel-padded space-y-3">
                <div className="flex justify-between">
                  <span className="text-[12px] font-mono uppercase tracking-wider text-[#8AAABB]">Pipeline</span>
                  <span className="text-[16px] font-serif text-[#0F1E28]">{formatCurrency(totalPipeline)}</span>
                </div>
                <div className="flex justify-between border-t border-[#D8E8EE] pt-3">
                  <span className="text-[12px] font-mono uppercase tracking-wider text-[#8AAABB]">Paid</span>
                  <span className="text-[16px] font-serif text-[#3D7A58]">{formatCurrency(invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0))}</span>
                </div>
                <div className="flex justify-between border-t border-[#D8E8EE] pt-3">
                  <span className="text-[12px] font-mono uppercase tracking-wider text-[#8AAABB]">Outstanding</span>
                  <span className="text-[16px] font-serif text-[#A07830]">{formatCurrency(invoices.filter(i => i.status !== "paid").reduce((s, i) => s + i.amount, 0))}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
