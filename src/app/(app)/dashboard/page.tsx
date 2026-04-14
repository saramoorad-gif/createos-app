"use client";

import { useAuth } from "@/contexts/auth-context";
import { AgencyDashboard } from "@/components/agency/agency-dashboard";
import { PageHeader } from "@/components/layout/page-header";
import { useSupabaseQuery } from "@/lib/hooks";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

interface Deal {
  id: string;
  brand_name: string;
  stage: string;
  value: number;
  deliverables: string;
  due_date: string | null;
  deal_type: string;
  notes: string;
}

const stageLabels: Record<string, string> = {
  lead: "Lead", pitched: "Pitched", negotiating: "Negotiating", contracted: "Contracted",
  in_progress: "In Progress", delivered: "Delivered", paid: "Paid",
};

export default function TodayPage() {
  const { profile } = useAuth();

  if (profile?.account_type === "agency") {
    return <AgencyDashboard />;
  }

  const { data: deals, loading } = useSupabaseQuery<Deal>("deals", {
    order: { column: "created_at", ascending: false },
  });

  const activeDeals = deals.filter(d => ["contracted", "in_progress", "delivered"].includes(d.stage));
  const totalPipeline = deals.reduce((s, d) => s + (d.value || 0), 0);

  if (loading) {
    return (
      <div className="pt-20 text-center">
        <p className="text-[14px] font-sans text-[#8AAABB]">Loading your dashboard...</p>
      </div>
    );
  }

  // Empty state for new users
  if (deals.length === 0) {
    return (
      <div>
        <PageHeader
          headline={<>Welcome to Create<em className="italic text-[#7BAFC8]">OS</em></>}
          subheading="Your creator business starts here."
        />
        <div className="text-center py-16">
          <p className="text-[22px] font-serif italic text-[#8AAABB] mb-3">No deals yet</p>
          <p className="text-[14px] font-sans text-[#4A6070] mb-6 max-w-md mx-auto">
            Log your first brand deal to start tracking your pipeline, invoices, and earnings.
          </p>
          <Link href="/deals" className="bg-[#1E3F52] text-white rounded-btn px-6 py-3 text-[14px] font-sans inline-block" style={{ fontWeight: 600 }}>
            Create your first deal →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        headline={<>{deals.filter(d => d.due_date).length} items need your <em className="italic text-[#7BAFC8]">attention</em></>}
        subheading="Your creator business at a glance."
        stats={[
          { value: formatCurrency(totalPipeline), label: "Pipeline value" },
          { value: String(activeDeals.length), label: "Active deals" },
          { value: String(deals.length), label: "Total deals" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        {/* Deals with upcoming deadlines */}
        <div>
          <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-4" style={{ fontWeight: 600 }}>
            UPCOMING DEADLINES
          </p>
          <div className="divide-y divide-[#EEE8E0]">
            {deals.filter(d => d.due_date).slice(0, 5).map((deal) => (
              <div key={deal.id} className="flex items-center gap-4 py-4 first:pt-0">
                <div className="w-[3px] h-10 rounded-full bg-[#7BAFC8]" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>
                    {deal.brand_name} — {deal.deliverables || "Deal deadline"}
                  </p>
                  <p className="text-[12px] font-sans text-[#8AAABB] mt-0.5">
                    {stageLabels[deal.stage] || deal.stage}
                  </p>
                </div>
                <p className="text-[11px] font-mono text-[#8AAABB] flex-shrink-0">
                  {deal.due_date ? formatDate(deal.due_date) : ""}
                </p>
                <span className="text-[14px] font-serif text-[#3D6E8A]">
                  {deal.value > 0 ? formatCurrency(deal.value) : ""}
                </span>
              </div>
            ))}
            {deals.filter(d => d.due_date).length === 0 && (
              <p className="text-[14px] font-serif italic text-[#8AAABB] py-6 text-center">No upcoming deadlines</p>
            )}
          </div>

          {/* Active deals */}
          {activeDeals.length > 0 && (
            <>
              <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mt-10 mb-4" style={{ fontWeight: 600 }}>
                ACTIVE DEALS
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeDeals.slice(0, 4).map((deal) => (
                  <div key={deal.id} className="bg-white border-[1.5px] border-[#D8E8EE] rounded-card p-5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[14px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>{deal.brand_name}</p>
                      <p className="text-[18px] font-serif text-[#3D6E8A]">{formatCurrency(deal.value)}</p>
                    </div>
                    <p className="text-[12px] font-sans text-[#8AAABB] mb-2">{deal.deliverables}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-sans uppercase tracking-[1.5px] text-[#8AAABB]" style={{ fontWeight: 500 }}>
                        {stageLabels[deal.stage]}
                      </span>
                      {deal.due_date && <span className="text-[11px] font-mono text-[#8AAABB]">{formatDate(deal.due_date)}</span>}
                    </div>
                  </div>
                ))}
              </div>
              {activeDeals.length > 4 && (
                <Link href="/deals" className="text-[13px] font-sans text-[#7BAFC8] hover:underline mt-4 inline-block" style={{ fontWeight: 500 }}>
                  View all {activeDeals.length} deals →
                </Link>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside>
          <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-4" style={{ fontWeight: 600 }}>
            QUICK ACTIONS
          </p>
          <div className="space-y-2">
            <Link href="/deals" className="block bg-white border-[1.5px] border-[#D8E8EE] rounded-card px-4 py-3 text-[13px] font-sans text-[#1A2C38] hover:border-[#7BAFC8] transition-colors" style={{ fontWeight: 500 }}>
              + New deal
            </Link>
            <Link href="/invoices" className="block bg-white border-[1.5px] border-[#D8E8EE] rounded-card px-4 py-3 text-[13px] font-sans text-[#1A2C38] hover:border-[#7BAFC8] transition-colors" style={{ fontWeight: 500 }}>
              + New invoice
            </Link>
            <Link href="/brand-radar" className="block bg-white border-[1.5px] border-[#D8E8EE] rounded-card px-4 py-3 text-[13px] font-sans text-[#1A2C38] hover:border-[#7BAFC8] transition-colors" style={{ fontWeight: 500 }}>
              Browse brands
            </Link>
            <Link href="/rate-calculator" className="block bg-white border-[1.5px] border-[#D8E8EE] rounded-card px-4 py-3 text-[13px] font-sans text-[#1A2C38] hover:border-[#7BAFC8] transition-colors" style={{ fontWeight: 500 }}>
              Calculate rates
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
