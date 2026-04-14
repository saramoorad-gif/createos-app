"use client";

import { useAuth } from "@/contexts/auth-context";
import { AgencyDashboard } from "@/components/agency/agency-dashboard";
import { PageHeader } from "@/components/layout/page-header";
import {
  deals,
  revenueStats,
  totalFollowers,
  dealStageLabels,
  type Deal,
} from "@/lib/placeholder-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

const priorityColors: Record<string, string> = {
  high: "bg-[#A03D3D]",
  medium: "bg-[#A07830]",
  low: "bg-[#3D7A58]",
};

const tagStyles: Record<string, string> = {
  Contract: "bg-[#F2F8FB] text-[#8AAABB]",
  Deliverable: "bg-[#F2F8FB] text-[#7BAFC8]",
  Invoice: "bg-[#F4EAEA] text-[#A03D3D]",
  Exclusivity: "bg-[#F5ECD4] text-[#A87C3A]",
};

const actionItems = [
  { priority: "high", task: "Aritzia contract needs signature", detail: "90-day fashion exclusivity clause — review before signing", due: "Tuesday, April 15, 2026 · 5:00 PM EST", tag: "Contract" },
  { priority: "high", task: "Mejuri Reel #2 due tomorrow", detail: "Gold Drop Collection — second reel in the series", due: "Tuesday, April 15, 2026 · 11:59 PM EST", tag: "Deliverable" },
  { priority: "medium", task: "Glossier invoice is 14 days overdue", detail: "$1,200 remaining balance — consider sending follow-up", due: "Sunday, March 30, 2026 · 12:00 PM EST", tag: "Invoice" },
  { priority: "low", task: "Oatly shoot prep — scripts approved", detail: "2 TikTok videos, casual morning routine vibe", due: "Friday, May 1, 2026 · 11:59 PM EST", tag: "Deliverable" },
  { priority: "low", task: "Glossier exclusivity expires in 5 days", detail: "Beauty category — you can pitch competing brands after Apr 19", due: "Saturday, April 19, 2026 · 11:59 PM EST", tag: "Exclusivity" },
];

const calendarDays = [
  { day: "Monday, April 14, 2026", items: ["9:00 AM – 11:00 AM EST · Mejuri Reel #2 filming", "2:00 PM – 2:30 PM EST · Aritzia contract review call"] },
  { day: "Tuesday, April 15, 2026", items: ["5:00 PM EST · Aritzia contract signing deadline", "11:59 PM EST · Mejuri Reel #2 final delivery due"] },
  { day: "Wednesday, April 16, 2026", items: ["11:00 AM – 11:45 AM EST · Oatly creative direction call"] },
  { day: "Thursday, April 17, 2026", items: ["No events scheduled"] },
  { day: "Friday, April 18, 2026", items: ["10:00 AM – 10:30 AM EST · Weekly digest review", "1:00 PM – 5:00 PM EST · Content batch day (blocked)"] },
];

const stageProgress: Record<string, number> = {
  pitched: 10,
  negotiating: 25,
  contracted: 40,
  in_progress: 65,
  delivered: 85,
  paid: 100,
};

function DealCard({ deal }: { deal: Deal }) {
  return (
    <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[14px] font-sans font-600 text-[#1A2C38]">{deal.brand_name}</p>
          <p className="text-[12px] font-sans text-[#8AAABB] mt-0.5">{deal.deliverables}</p>
        </div>
        <p className="text-[20px] font-serif text-[#1A2C38]">
          {deal.value > 0 ? formatCurrency(deal.value) : "TBD"}
        </p>
      </div>
      {/* Progress bar */}
      <div className="flex items-center gap-0 mb-2">
        {["Contract", "Brief", "Creation", "Review", "Paid"].map((stage, i) => (
          <div key={stage} className="flex-1 flex flex-col items-center">
            <div className={`h-[3px] w-full ${i === 0 ? "rounded-l-full" : ""} ${i === 4 ? "rounded-r-full" : ""} ${
              i <= Math.floor((stageProgress[deal.stage] || 0) / 25) ? "bg-[#7BAFC8]" : "bg-[#D8E8EE]"
            }`} />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-sans uppercase tracking-[1.5px] text-[#8AAABB]">
          {dealStageLabels[deal.stage]}
        </p>
        {deal.due_date && (
          <p className="text-[11px] font-mono text-[#8AAABB]">{formatDate(deal.due_date)}</p>
        )}
      </div>
    </div>
  );
}

export default function TodayPage() {
  const { profile } = useAuth();

  // Agency users see a different dashboard
  if (profile?.account_type === "agency") {
    return <AgencyDashboard />;
  }

  const activeDeals = deals.filter(
    (d) => d.stage === "contracted" || d.stage === "in_progress" || d.stage === "delivered"
  );

  return (
    <div>
      <PageHeader
        headline={
          <>
            {actionItems.length} items need your <em className="italic text-[#7BAFC8]">attention</em> today.
          </>
        }
        subheading="Your creator business at a glance — focus on what matters."
        stats={[
          { value: formatCurrency(revenueStats.thisMonth), label: "April earned", change: "+12%" },
          { value: `${(totalFollowers / 1000).toFixed(0)}K`, label: "Followers", change: "+2.1%" },
          { value: `${deals.filter(d => d.stage !== "paid").length}`, label: "Active deals" },
          { value: formatCurrency(revenueStats.invoicesOverdue), label: "Overdue" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        {/* Main content */}
        <div>
          {/* Action items */}
          <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#8AAABB] mb-4">
            ACTION ITEMS
          </p>
          <div className="divide-y divide-[#D8E8EE]">
            {actionItems.map((item, i) => (
              <div key={i} className="flex items-center gap-4 py-4 first:pt-0">
                <div className={`w-[3px] h-10 rounded-full ${priorityColors[item.priority]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-sans font-500 text-[#1A2C38]">
                    {item.task}
                  </p>
                  <p className="text-[12px] font-sans text-[#8AAABB] mt-0.5 truncate">
                    {item.detail}
                  </p>
                </div>
                <p className="text-[11px] font-mono text-[#8AAABB] flex-shrink-0">
                  {item.due}
                </p>
                <span className={`text-[10px] font-sans font-500 uppercase tracking-[1px] px-2 py-0.5 rounded-full ${tagStyles[item.tag]}`}>
                  {item.tag}
                </span>
              </div>
            ))}
          </div>

          {/* Active deals */}
          <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#8AAABB] mt-10 mb-4">
            ACTIVE DEALS
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeDeals.slice(0, 4).map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
          {activeDeals.length > 4 && (
            <Link
              href="/deals"
              className="text-[13px] font-sans font-500 text-[#7BAFC8] hover:underline mt-4 inline-block"
            >
              View all {activeDeals.length} deals →
            </Link>
          )}
        </div>

        {/* Aside — Calendar */}
        <aside>
          <p className="text-[10px] font-sans font-600 uppercase tracking-[3px] text-[#8AAABB] mb-4">
            THIS WEEK
          </p>
          <div className="space-y-5">
            {calendarDays.map((day) => (
              <div key={day.day}>
                <p className="text-[12px] font-sans font-600 text-[#1A2C38] mb-1.5">
                  {day.day}
                </p>
                <div className="space-y-1">
                  {day.items.map((item, i) => (
                    <p key={i} className="text-[12px] font-sans text-[#8AAABB] pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[7px] before:h-[4px] before:w-[4px] before:rounded-full before:bg-[#D8E8EE]">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
