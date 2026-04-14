"use client";

import { useAuth } from "@/contexts/auth-context";
import { AgencyDashboard } from "@/components/agency/agency-dashboard";
import { PageHeader } from "@/components/layout/page-header";
import { useSupabaseQuery } from "@/lib/hooks";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/global/toast";
import { DashboardSkeleton } from "@/components/global/skeleton";
import Link from "next/link";
import { ArrowRight, Plus, TrendingUp, FileText, Briefcase, Star } from "lucide-react";

interface Deal {
  id: string;
  brand_name: string;
  stage: string;
  value: number;
  deliverables: string;
  due_date: string | null;
  deal_type: string;
  notes: string;
  created_at: string;
}

interface Invoice {
  id: string;
  brand_name: string;
  amount: number;
  status: string;
  due_date: string;
}

const stageLabels: Record<string, string> = {
  lead: "Lead", pitched: "Pitched", negotiating: "Negotiating", contracted: "Contracted",
  in_progress: "In Progress", delivered: "Delivered", paid: "Paid",
};

export default function DashboardPage() {
  const { profile, loading: authLoading } = useAuth();

  if (authLoading) {
    return <DashboardSkeleton />;
  }

  if (!profile) {
    return <div className="pt-20 text-center"><p className="text-[14px] font-sans text-[#8AAABB]">Please sign in to access your dashboard.</p></div>;
  }

  if (profile.account_type === "agency") {
    return <AgencyDashboard />;
  }

  return <CreatorDashboard />;
}

function CreatorDashboard() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const displayName = profile?.full_name?.split(" ")[0] || "there";

  const { data: deals, loading: dealsLoading } = useSupabaseQuery<Deal>("deals", { order: { column: "created_at", ascending: false } });
  const { data: invoices } = useSupabaseQuery<Invoice>("invoices");

  const activeDeals = deals.filter(d => ["contracted", "in_progress", "negotiating"].includes(d.stage));
  const completedDeals = deals.filter(d => ["delivered", "paid"].includes(d.stage));
  const totalEarned = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalPipeline = deals.reduce((s, d) => s + (d.value || 0), 0);
  const overdueInvoices = invoices.filter(i => i.status === "overdue");

  // Upcoming deadlines
  const now = new Date();
  const upcomingDeals = deals
    .filter(d => d.due_date && new Date(d.due_date) >= now)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 5);

  if (dealsLoading) {
    return <DashboardSkeleton />;
  }

  // New user — no deals yet
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
            { icon: Briefcase, title: "Set up your media kit", desc: "Create a shareable profile that attracts brands", href: "/media-kit", cta: "Build media kit" },
            { icon: TrendingUp, title: "Calculate your rates", desc: "Find out what you should be charging based on your stats", href: "/rate-calculator", cta: "Check rates" },
            { icon: FileText, title: "Import existing data", desc: "Upload deals and invoices from Google Sheets or Excel", href: "/import", cta: "Import CSV" },
            { icon: Star, title: "Browse brand radar", desc: "Discover brands hiring creators in your niche", href: "/brand-radar", cta: "Explore brands" },
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

  // Active user dashboard
  return (
    <div>
      <PageHeader
        headline={<>Good morning, <em className="italic text-[#7BAFC8]">{displayName}</em></>}
        subheading="Here's your creator business at a glance."
        stats={[
          { value: formatCurrency(totalEarned), label: "Total earned" },
          { value: String(activeDeals.length), label: "Active deals" },
          { value: formatCurrency(totalPipeline), label: "Pipeline" },
          { value: String(completedDeals.length), label: "Completed" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        {/* Main content */}
        <div className="space-y-8">
          {/* Alerts */}
          {overdueInvoices.length > 0 && (
            <div className="bg-[#F4EAEA] border-[1.5px] border-[#A03D3D]/20 rounded-card p-4 flex items-center gap-3">
              <div className="w-[3px] h-8 rounded-full bg-[#A03D3D]" />
              <div className="flex-1">
                <p className="text-[13px] font-sans text-[#A03D3D]" style={{ fontWeight: 500 }}>{overdueInvoices.length} overdue invoice{overdueInvoices.length > 1 ? "s" : ""}</p>
                <p className="text-[12px] font-sans text-[#A03D3D]/70">{formatCurrency(overdueInvoices.reduce((s, i) => s + i.amount, 0))} outstanding</p>
              </div>
              <Link href="/invoices" className="text-[12px] font-sans text-[#A03D3D] hover:underline" style={{ fontWeight: 500 }}>View →</Link>
            </div>
          )}

          {/* Upcoming deadlines */}
          {upcomingDeals.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB]" style={{ fontWeight: 600 }}>UPCOMING DEADLINES</p>
                <Link href="/deals" className="text-[12px] font-sans text-[#7BAFC8] hover:underline" style={{ fontWeight: 500 }}>View all →</Link>
              </div>
              <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-card overflow-hidden">
                {upcomingDeals.map(deal => (
                  <Link key={deal.id} href="/deals" className="flex items-center justify-between px-4 py-3 border-b border-[#EEE8E0] last:border-b-0 hover:bg-[#F7F4F0] transition-colors">
                    <div>
                      <p className="text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>{deal.brand_name}</p>
                      <p className="text-[12px] font-sans text-[#8AAABB]">{deal.deliverables}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[14px] font-serif text-[#3D6E8A]">{formatCurrency(deal.value)}</p>
                      <p className="text-[11px] font-mono text-[#8AAABB]">{formatDate(deal.due_date!)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Active deals */}
          {activeDeals.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB]" style={{ fontWeight: 600 }}>ACTIVE DEALS</p>
                <Link href="/deals" className="text-[12px] font-sans text-[#7BAFC8] hover:underline" style={{ fontWeight: 500 }}>View all →</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeDeals.slice(0, 4).map(deal => (
                  <Link key={deal.id} href="/deals" className="bg-white border-[1.5px] border-[#D8E8EE] rounded-card p-4 hover:border-[#7BAFC8] hover:shadow-card transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[14px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>{deal.brand_name}</p>
                      <p className="text-[16px] font-serif text-[#3D6E8A]">{formatCurrency(deal.value)}</p>
                    </div>
                    <p className="text-[12px] font-sans text-[#8AAABB] mb-2">{deal.deliverables}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-sans uppercase tracking-[4px] px-2 py-0.5 rounded bg-[#F2F8FB] text-[#3D6E8A]" style={{ fontWeight: 700 }}>{stageLabels[deal.stage]}</span>
                      {deal.due_date && <span className="text-[11px] font-mono text-[#8AAABB]">{formatDate(deal.due_date)}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div>
            <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-4" style={{ fontWeight: 600 }}>QUICK ACTIONS</p>
            <div className="space-y-2">
              {[
                { label: "+ New deal", href: "/deals" },
                { label: "+ New invoice", href: "/invoices" },
                { label: "Track income", href: "/income" },
                { label: "Calculate rates", href: "/rate-calculator" },
                { label: "Browse brands", href: "/brand-radar" },
                { label: "Edit media kit", href: "/media-kit" },
              ].map(a => (
                <Link key={a.label} href={a.href} onClick={() => toast("info", `Navigating to ${a.label.replace("+ ", "")}`)} className="block bg-white border-[1.5px] border-[#D8E8EE] rounded-card px-4 py-3 text-[13px] font-sans text-[#1A2C38] hover:border-[#7BAFC8] hover:shadow-card transition-all" style={{ fontWeight: 500 }}>
                  {a.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Recent invoices */}
          {invoices.length > 0 && (
            <div>
              <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-4" style={{ fontWeight: 600 }}>RECENT INVOICES</p>
              <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-card overflow-hidden">
                {invoices.slice(0, 3).map(inv => (
                  <div key={inv.id} className="flex items-center justify-between px-4 py-3 border-b border-[#EEE8E0] last:border-b-0">
                    <div>
                      <p className="text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>{inv.brand_name}</p>
                      <span className={`text-[9px] font-sans uppercase tracking-[4px] px-2 py-0.5 rounded ${
                        inv.status === "paid" ? "bg-[#E8F4EE] text-[#3D7A58]" :
                        inv.status === "overdue" ? "bg-[#F4EAEA] text-[#A03D3D]" :
                        "bg-[#F2F8FB] text-[#3D6E8A]"
                      }`} style={{ fontWeight: 700 }}>{inv.status}</span>
                    </div>
                    <p className="text-[14px] font-serif text-[#1A2C38]">{formatCurrency(inv.amount)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
