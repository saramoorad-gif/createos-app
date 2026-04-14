"use client";

import { PageHeader } from "@/components/layout/page-header";
import { useSupabaseQuery } from "@/lib/hooks";
import { useAuth } from "@/contexts/auth-context";
import { formatCurrency, formatDate, timeAgo } from "@/lib/utils";
import Link from "next/link";
import { AlertTriangle, Clock, FileText, Users, TrendingUp, CheckCircle2, ArrowRight } from "lucide-react";

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

const priorityColors: Record<string, string> = {
  urgent: "bg-[#A03D3D]",
  warning: "bg-[#A07830]",
  info: "bg-[#7BAFC8]",
  success: "bg-[#3D7A58]",
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
    return <div className="pt-20 text-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[#D8E8EE] border-t-[#7BAFC8] mx-auto" /></div>;
  }

  return (
    <div>
      <PageHeader
        headline={<>Good morning, <em className="italic text-[#7BAFC8]">{displayName}</em></>}
        subheading="Here's what's happening across your roster today."
        stats={[
          { value: formatCurrency(totalPipeline), label: "Pipeline value" },
          { value: String(activeDeals.length), label: "Active deals" },
          { value: String(activeCreators), label: "Creators" },
          { value: overdueInvoices.length > 0 ? String(overdueInvoices.length) : "0", label: "Overdue" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        {/* Main content */}
        <div className="space-y-8">
          {/* Action items */}
          {actionItems.length > 0 && (
            <div>
              <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-4" style={{ fontWeight: 600 }}>
                NEEDS ATTENTION ({actionItems.length})
              </p>
              <div className="space-y-2">
                {actionItems.slice(0, 6).map((item, i) => (
                  <button
                    key={i}
                    onClick={() => onNavigate(item.tab)}
                    className="w-full text-left bg-white border-[1.5px] border-[#D8E8EE] rounded-card p-4 hover:border-[#7BAFC8] hover:shadow-card transition-all flex items-center gap-3"
                  >
                    <div className={`w-[3px] h-10 rounded-full ${priorityColors[item.priority]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>{item.text}</p>
                      <p className="text-[12px] font-sans text-[#8AAABB] mt-0.5">{item.detail}</p>
                    </div>
                    <span className="text-[12px] font-sans text-[#7BAFC8] flex-shrink-0" style={{ fontWeight: 500 }}>
                      {item.action} <ArrowRight className="h-3 w-3 inline" />
                    </span>
                  </button>
                ))}
                {actionItems.length > 6 && (
                  <p className="text-[12px] font-sans text-[#7BAFC8] mt-2" style={{ fontWeight: 500 }}>
                    +{actionItems.length - 6} more items
                  </p>
                )}
              </div>
            </div>
          )}

          {actionItems.length === 0 && (
            <div className="bg-[#E8F4EE] border-[1.5px] border-[#3D7A58]/20 rounded-card p-4 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#3D7A58] flex-shrink-0" />
              <p className="text-[13px] font-sans text-[#3D7A58]" style={{ fontWeight: 500 }}>All clear — no urgent items right now.</p>
            </div>
          )}

          {/* Pipeline snapshot */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB]" style={{ fontWeight: 600 }}>PIPELINE SNAPSHOT</p>
              <button onClick={() => onNavigate("pipeline")} className="text-[12px] font-sans text-[#7BAFC8] hover:underline" style={{ fontWeight: 500 }}>View all →</button>
            </div>
            {activeDeals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeDeals.slice(0, 4).map(deal => (
                  <div key={deal.id} className="bg-white border-[1.5px] border-[#D8E8EE] rounded-card p-4 hover:border-[#7BAFC8] transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[14px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>{deal.brand_name}</p>
                      <p className="text-[16px] font-serif text-[#3D6E8A]">{formatCurrency(deal.value)}</p>
                    </div>
                    <p className="text-[12px] font-sans text-[#8AAABB] mb-2">{deal.deliverables}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-sans uppercase tracking-[4px] px-2 py-0.5 rounded bg-[#F2F8FB] text-[#3D6E8A]" style={{ fontWeight: 700 }}>
                        {deal.stage.replace(/_/g, " ")}
                      </span>
                      {deal.due_date && <span className="text-[11px] font-mono text-[#8AAABB]">{formatDate(deal.due_date)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white border-[1.5px] border-[#D8E8EE] rounded-card">
                <p className="text-[14px] font-serif italic text-[#8AAABB]">No active deals</p>
                <button onClick={() => onNavigate("pipeline")} className="text-[13px] font-sans text-[#7BAFC8] hover:underline mt-2" style={{ fontWeight: 500 }}>Create a deal →</button>
              </div>
            )}
          </div>

          {/* Recent activity */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB]" style={{ fontWeight: 600 }}>RECENT ACTIVITY</p>
              <button onClick={() => onNavigate("team")} className="text-[12px] font-sans text-[#7BAFC8] hover:underline" style={{ fontWeight: 500 }}>View all →</button>
            </div>
            {activity.length > 0 ? (
              <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-card overflow-hidden">
                {activity.slice(0, 5).map(entry => (
                  <div key={entry.id} className="flex items-center gap-3 px-4 py-3 border-b border-[#EEE8E0] last:border-b-0 hover:bg-[#F7F4F0] transition-colors">
                    <div className="h-2 w-2 rounded-full bg-[#7BAFC8] flex-shrink-0" />
                    <p className="text-[13px] font-sans text-[#1A2C38] flex-1">{entry.action_type.replace(/_/g, " ")}</p>
                    <span className="text-[11px] font-mono text-[#8AAABB]">{timeAgo(entry.created_at)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[14px] font-serif italic text-[#8AAABB] text-center py-6">No recent activity</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Quick actions */}
          <div>
            <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-4" style={{ fontWeight: 600 }}>QUICK ACTIONS</p>
            <div className="space-y-2">
              {[
                { label: "+ New deal", tab: "pipeline" },
                { label: "+ New campaign", tab: "campaigns" },
                { label: "View roster", tab: "roster" },
                { label: "Check conflicts", tab: "conflicts" },
                { label: "View reports", tab: "reports" },
              ].map(a => (
                <button key={a.label} onClick={() => onNavigate(a.tab)} className="w-full text-left bg-white border-[1.5px] border-[#D8E8EE] rounded-card px-4 py-3 text-[13px] font-sans text-[#1A2C38] hover:border-[#7BAFC8] hover:shadow-card transition-all" style={{ fontWeight: 500 }}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pipeline health */}
          <div>
            <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-4" style={{ fontWeight: 600 }}>PIPELINE HEALTH</p>
            <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-card p-4 space-y-3">
              {[
                { label: "On track", count: deals.filter(d => d.due_date && new Date(d.due_date) > now).length, color: "bg-[#3D7A58]" },
                { label: "Due this week", count: upcomingDeadlines.length, color: "bg-[#A07830]" },
                { label: "Overdue", count: deals.filter(d => d.due_date && new Date(d.due_date) < now && !["paid", "delivered"].includes(d.stage)).length, color: "bg-[#A03D3D]" },
                { label: "Stale (14d+)", count: staleDeals.length, color: "bg-[#8AAABB]" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                    <span className="text-[13px] font-sans text-[#1A2C38]">{item.label}</span>
                  </div>
                  <span className="text-[14px] font-serif text-[#1A2C38]">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue this month */}
          <div>
            <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-4" style={{ fontWeight: 600 }}>THIS MONTH</p>
            <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-card p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-[12px] font-sans text-[#8AAABB]">Pipeline value</span>
                <span className="text-[14px] font-serif text-[#1A2C38]">{formatCurrency(totalPipeline)}</span>
              </div>
              <div className="flex justify-between border-t border-[#D8E8EE] pt-3">
                <span className="text-[12px] font-sans text-[#8AAABB]">Invoices paid</span>
                <span className="text-[14px] font-serif text-[#3D7A58]">{formatCurrency(invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0))}</span>
              </div>
              <div className="flex justify-between border-t border-[#D8E8EE] pt-3">
                <span className="text-[12px] font-sans text-[#8AAABB]">Outstanding</span>
                <span className="text-[14px] font-serif text-[#A07830]">{formatCurrency(invoices.filter(i => i.status !== "paid").reduce((s, i) => s + i.amount, 0))}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
