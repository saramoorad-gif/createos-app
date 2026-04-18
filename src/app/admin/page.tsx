"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { getSupabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import { useToast } from "@/components/global/toast";
import {
  LayoutDashboard, Users, DollarSign, AlertTriangle, Gift,
  TrendingUp, Clock, CheckCircle2, XCircle, Eye, RefreshCw,
  Search, ChevronRight, Activity, LogOut,
} from "lucide-react";

type Tab = "overview" | "users" | "revenue" | "referrals" | "errors" | "gift-codes";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatMoney(amount: number) {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

const planColors: Record<string, string> = {
  free: "bg-[#F2F8FB] text-[#8AAABB]",
  ugc: "bg-[#E8F4FA] text-[#3D6E8A]",
  ugc_influencer: "bg-[#E6F2EB] text-[#3D7A58]",
  agency: "bg-[#F0EAE0] text-[#A07830]",
};

const statusColors: Record<string, string> = {
  active: "bg-[#E8F4EE] text-[#3D7A58]",
  trialing: "bg-[#F2F8FB] text-[#3D6E8A]",
  past_due: "bg-[#FFF8E8] text-[#A07830]",
  cancelled: "bg-[#F4EAEA] text-[#A03D3D]",
};

export default function AdminPortal() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);

  // Data
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [errors, setErrors] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Auth check
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login?redirect=/admin");
      return;
    }
    if (!isAdmin(user.email)) {
      router.push("/dashboard");
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, router]);

  async function getAuthHeader() {
    const { getSupabase } = await import("@/lib/supabase");
    const sb = getSupabase();
    const { data: { session } } = await sb.auth.getSession();
    return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
  }

  async function fetchData() {
    if (!user?.email) return;
    setLoading(true);
    try {
      const authHeader = await getAuthHeader();
      const [statsRes, usersRes, errorsRes, referralsRes] = await Promise.all([
        fetch(`/api/admin/stats`, { headers: authHeader as any }).then(r => r.json()),
        fetch(`/api/admin/users`, { headers: authHeader as any }).then(r => r.json()),
        fetch(`/api/admin/errors`, { headers: authHeader as any }).then(r => r.json()),
        fetch(`/api/admin/referrals`, { headers: authHeader as any }).then(r => r.json()),
      ]);
      setStats(statsRes);
      setUsers(usersRes.users || []);
      setErrors(errorsRes.errors || []);
      setReferrals(referralsRes);
    } catch (e) {
      console.error("Failed to fetch admin data:", e);
      toast("error", "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }

  async function resolveError(errorId: string) {
    if (!user?.email) return;
    try {
      const authHeader = await getAuthHeader();
      await fetch(`/api/admin/errors`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(authHeader as any) },
        body: JSON.stringify({ errorId, resolved: true }),
      });
      setErrors(prev => prev.map(e => e.id === errorId ? { ...e, resolved: true } : e));
      toast("success", "Marked as resolved");
    } catch { toast("error", "Failed to update"); }
  }

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-[14px] font-sans text-[#8AAABB]">Loading admin portal...</p></div>;
  }

  if (!isAdmin(user.email)) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-[14px] font-sans text-[#A03D3D]">Access denied</p></div>;
  }

  const tabs = [
    { key: "overview" as Tab, label: "Overview", icon: LayoutDashboard },
    { key: "users" as Tab, label: "Users", icon: Users },
    { key: "revenue" as Tab, label: "Revenue", icon: DollarSign },
    { key: "referrals" as Tab, label: "Referrals", icon: Gift },
    { key: "gift-codes" as Tab, label: "Gift Codes", icon: Gift },
    { key: "errors" as Tab, label: "Errors", icon: AlertTriangle, badge: stats?.overview?.unresolvedErrors },
  ];

  const filteredUsers = users.filter(u =>
    !searchQuery ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1E3F52] text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#7BAFC8] mb-1" style={{ fontWeight: 600 }}>ADMIN</p>
          <h1 className="text-[20px] font-serif text-white">
            create<em className="italic text-[#7BAFC8]">Suite</em>
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {tabs.map(t => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-[13px] font-sans transition-colors ${
                  isActive ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
                style={{ fontWeight: 500 }}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1 text-left">{t.label}</span>
                {t.badge && t.badge > 0 && (
                  <span className="text-[10px] font-sans px-1.5 py-0.5 rounded-full bg-[#A03D3D] text-white" style={{ fontWeight: 600 }}>{t.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <button onClick={fetchData} className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-sans text-white/60 hover:text-white rounded-[8px] hover:bg-white/5" style={{ fontWeight: 500 }}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <Link href="/dashboard" className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-sans text-white/60 hover:text-white rounded-[8px] hover:bg-white/5" style={{ fontWeight: 500 }}>
            <Eye className="h-3.5 w-3.5" /> Back to app
          </Link>
          <button onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-sans text-white/60 hover:text-white rounded-[8px] hover:bg-white/5" style={{ fontWeight: 500 }}>
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto p-8">
          {loading && !stats ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-[14px] font-sans text-[#8AAABB]">Loading data...</p>
            </div>
          ) : (
            <>
              {tab === "overview" && <OverviewTab stats={stats} />}
              {tab === "users" && (
                <UsersTab
                  users={filteredUsers}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              )}
              {tab === "revenue" && <RevenueTab stats={stats} users={users} />}
              {tab === "referrals" && <ReferralsTab data={referrals} />}
              {tab === "gift-codes" && <GiftCodesTab getAuthHeader={getAuthHeader} />}
              {tab === "errors" && <ErrorsTab errors={errors} onResolve={resolveError} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── OVERVIEW TAB ─────────────────────────────
function OverviewTab({ stats }: { stats: any }) {
  if (!stats) return null;
  const { overview, userBreakdown, signupsByDay } = stats;

  const daysArray = Object.entries(signupsByDay || {}) as [string, number][];
  const maxSignups = Math.max(...daysArray.map(([, v]) => v), 1);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-[28px] font-serif text-[#1A2C38]">Overview</h2>
        <p className="text-[13px] font-sans text-[#8AAABB] mt-1">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "MRR", value: formatMoney(overview.mrr), icon: TrendingUp, color: "text-[#3D7A58]" },
          { label: "Total Users", value: overview.totalUsers, icon: Users, color: "text-[#3D6E8A]" },
          { label: "Active Subs", value: overview.activeSubscriptions, icon: CheckCircle2, color: "text-[#3D7A58]" },
          { label: "Unresolved Errors", value: overview.unresolvedErrors, icon: AlertTriangle, color: overview.unresolvedErrors > 0 ? "text-[#A03D3D]" : "text-[#8AAABB]" },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-sans uppercase tracking-[1.5px] text-[#8AAABB]" style={{ fontWeight: 600 }}>{stat.label}</span>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className="text-[32px] font-serif text-[#1A2C38]">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "New (7d)", value: overview.newSignups7d },
          { label: "New (30d)", value: overview.newSignups30d },
          { label: "Total Deals", value: overview.totalDeals },
          { label: "Total Revenue", value: formatMoney(overview.totalRevenue) },
        ].map(stat => (
          <div key={stat.label} className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-4">
            <p className="text-[11px] font-sans uppercase tracking-[1.5px] text-[#8AAABB] mb-1" style={{ fontWeight: 600 }}>{stat.label}</p>
            <p className="text-[20px] font-serif text-[#1A2C38]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Signups Chart */}
      <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-6 mb-8">
        <p className="text-[11px] font-sans uppercase tracking-[1.5px] text-[#8AAABB] mb-4" style={{ fontWeight: 600 }}>SIGNUPS — LAST 30 DAYS</p>
        <div className="flex items-end gap-1" style={{ height: "140px" }}>
          {daysArray.map(([day, count]) => (
            <div key={day} className="flex-1 flex flex-col items-center gap-1 group" title={`${day}: ${count}`}>
              <div
                className="w-full bg-[#7BAFC8] rounded-t-[2px] transition-all hover:bg-[#6AA0BB]"
                style={{ height: `${Math.max(2, (count / maxSignups) * 120)}px` }}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2 text-[10px] font-mono text-[#8AAABB]">
          <span>{daysArray[0]?.[0]}</span>
          <span>Today</span>
        </div>
      </div>

      {/* User Breakdown */}
      <div>
        <p className="text-[11px] font-sans uppercase tracking-[1.5px] text-[#8AAABB] mb-3" style={{ fontWeight: 600 }}>USER BREAKDOWN</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Free", value: userBreakdown.free, color: "#8AAABB" },
            { label: "UGC ($27)", value: userBreakdown.ugc, color: "#3D6E8A" },
            { label: "Influencer ($39)", value: userBreakdown.ugc_influencer, color: "#3D7A58" },
            { label: "Agency ($149)", value: userBreakdown.agency, color: "#A07830" },
          ].map(item => (
            <div key={item.label} className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                <span className="text-[11px] font-sans text-[#8AAABB]" style={{ fontWeight: 500 }}>{item.label}</span>
              </div>
              <p className="text-[24px] font-serif text-[#1A2C38]">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Warnings */}
        {(userBreakdown.past_due > 0 || userBreakdown.cancelled > 0) && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {userBreakdown.past_due > 0 && (
              <div className="bg-[#FFF8E8] border-[1.5px] border-[#A07830]/20 rounded-[10px] p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-[#A07830]" />
                  <span className="text-[11px] font-sans text-[#A07830]" style={{ fontWeight: 600 }}>PAST DUE</span>
                </div>
                <p className="text-[20px] font-serif text-[#A07830]">{userBreakdown.past_due}</p>
              </div>
            )}
            {userBreakdown.cancelled > 0 && (
              <div className="bg-[#F4EAEA] border-[1.5px] border-[#A03D3D]/20 rounded-[10px] p-4">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="h-4 w-4 text-[#A03D3D]" />
                  <span className="text-[11px] font-sans text-[#A03D3D]" style={{ fontWeight: 600 }}>CANCELLED</span>
                </div>
                <p className="text-[20px] font-serif text-[#A03D3D]">{userBreakdown.cancelled}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── USERS TAB ─────────────────────────────
function UsersTab({ users, searchQuery, setSearchQuery }: any) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[28px] font-serif text-[#1A2C38]">Users</h2>
          <p className="text-[13px] font-sans text-[#8AAABB] mt-1">{users.length} total accounts</p>
        </div>
        <div className="relative">
          <Search className="h-4 w-4 text-[#8AAABB] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 border-[1.5px] border-[#D8E8EE] rounded-[8px] text-[13px] font-sans text-[#1A2C38] bg-white focus:outline-none focus:border-[#7BAFC8] w-64"
          />
        </div>
      </div>

      <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F2F8FB] border-b border-[#D8E8EE]">
            <tr>
              <th className="text-left px-4 py-3 text-[10px] font-sans uppercase tracking-[1.5px] text-[#8AAABB]" style={{ fontWeight: 600 }}>User</th>
              <th className="text-left px-4 py-3 text-[10px] font-sans uppercase tracking-[1.5px] text-[#8AAABB]" style={{ fontWeight: 600 }}>Plan</th>
              <th className="text-left px-4 py-3 text-[10px] font-sans uppercase tracking-[1.5px] text-[#8AAABB]" style={{ fontWeight: 600 }}>Status</th>
              <th className="text-left px-4 py-3 text-[10px] font-sans uppercase tracking-[1.5px] text-[#8AAABB]" style={{ fontWeight: 600 }}>Joined</th>
              <th className="text-left px-4 py-3 text-[10px] font-sans uppercase tracking-[1.5px] text-[#8AAABB]" style={{ fontWeight: 600 }}>Stripe</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} className="border-b border-[#D8E8EE] last:border-b-0 hover:bg-[#FAF8F4]">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>{u.full_name || "—"}</p>
                    <p className="text-[11px] font-mono text-[#8AAABB]">{u.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-sans uppercase tracking-[1px] px-2 py-0.5 rounded-full ${planColors[u.account_type] || planColors.free}`} style={{ fontWeight: 600 }}>
                    {u.account_type || "free"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.subscription_status ? (
                    <span className={`text-[10px] font-sans uppercase tracking-[1px] px-2 py-0.5 rounded-full ${statusColors[u.subscription_status] || "bg-[#F2F8FB] text-[#8AAABB]"}`} style={{ fontWeight: 600 }}>
                      {u.subscription_status}
                    </span>
                  ) : (
                    <span className="text-[10px] font-sans text-[#8AAABB]">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11px] font-mono text-[#8AAABB]">{new Date(u.created_at).toLocaleDateString()}</span>
                </td>
                <td className="px-4 py-3">
                  {u.stripe_customer_id ? (
                    <CheckCircle2 className="h-4 w-4 text-[#3D7A58]" />
                  ) : (
                    <span className="text-[10px] font-sans text-[#8AAABB]">—</span>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <p className="text-[14px] font-serif italic text-[#8AAABB]">No users found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── REVENUE TAB ─────────────────────────────
function RevenueTab({ stats, users }: any) {
  if (!stats) return null;
  const { overview, userBreakdown, planPricing } = stats;

  const revenueByPlan = [
    { plan: "UGC Creator", count: userBreakdown.ugc, price: planPricing.ugc, total: userBreakdown.ugc * planPricing.ugc },
    { plan: "UGC + Influencer", count: userBreakdown.ugc_influencer, price: planPricing.ugc_influencer, total: userBreakdown.ugc_influencer * planPricing.ugc_influencer },
    { plan: "Agency", count: userBreakdown.agency, price: planPricing.agency, total: userBreakdown.agency * planPricing.agency },
  ];

  const mrrTotal = revenueByPlan.reduce((s, p) => s + p.total, 0);
  const arr = mrrTotal * 12;

  return (
    <div>
      <h2 className="text-[28px] font-serif text-[#1A2C38] mb-1">Revenue</h2>
      <p className="text-[13px] font-sans text-[#8AAABB] mb-6">Financial overview and subscription breakdown</p>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-[#3D7A58] to-[#2d5c42] text-white rounded-[10px] p-6">
          <p className="text-[11px] font-sans uppercase tracking-[1.5px] text-white/60 mb-2" style={{ fontWeight: 600 }}>MRR</p>
          <p className="text-[40px] font-serif">{formatMoney(mrrTotal)}</p>
          <p className="text-[12px] font-sans text-white/60 mt-1">{overview.activeSubscriptions} active subscriptions</p>
        </div>
        <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-6">
          <p className="text-[11px] font-sans uppercase tracking-[1.5px] text-[#8AAABB] mb-2" style={{ fontWeight: 600 }}>ARR (PROJECTED)</p>
          <p className="text-[40px] font-serif text-[#1A2C38]">{formatMoney(arr)}</p>
          <p className="text-[12px] font-sans text-[#8AAABB] mt-1">Annual run rate</p>
        </div>
        <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-6">
          <p className="text-[11px] font-sans uppercase tracking-[1.5px] text-[#8AAABB] mb-2" style={{ fontWeight: 600 }}>REVENUE LOGGED</p>
          <p className="text-[40px] font-serif text-[#1A2C38]">{formatMoney(overview.totalRevenue)}</p>
          <p className="text-[12px] font-sans text-[#8AAABB] mt-1">From paid invoices</p>
        </div>
      </div>

      {/* Revenue by plan */}
      <div className="mb-6">
        <p className="text-[11px] font-sans uppercase tracking-[1.5px] text-[#8AAABB] mb-3" style={{ fontWeight: 600 }}>MRR BY PLAN</p>
        <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#F2F8FB] border-b border-[#D8E8EE]">
              <tr>
                <th className="text-left px-4 py-3 text-[10px] font-sans uppercase tracking-[1.5px] text-[#8AAABB]" style={{ fontWeight: 600 }}>Plan</th>
                <th className="text-right px-4 py-3 text-[10px] font-sans uppercase tracking-[1.5px] text-[#8AAABB]" style={{ fontWeight: 600 }}>Subscribers</th>
                <th className="text-right px-4 py-3 text-[10px] font-sans uppercase tracking-[1.5px] text-[#8AAABB]" style={{ fontWeight: 600 }}>Price</th>
                <th className="text-right px-4 py-3 text-[10px] font-sans uppercase tracking-[1.5px] text-[#8AAABB]" style={{ fontWeight: 600 }}>MRR</th>
                <th className="text-right px-4 py-3 text-[10px] font-sans uppercase tracking-[1.5px] text-[#8AAABB]" style={{ fontWeight: 600 }}>Share</th>
              </tr>
            </thead>
            <tbody>
              {revenueByPlan.map(row => (
                <tr key={row.plan} className="border-b border-[#D8E8EE] last:border-b-0">
                  <td className="px-4 py-3 text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>{row.plan}</td>
                  <td className="px-4 py-3 text-right text-[13px] font-mono text-[#4A6070]">{row.count}</td>
                  <td className="px-4 py-3 text-right text-[13px] font-mono text-[#4A6070]">${row.price}/mo</td>
                  <td className="px-4 py-3 text-right text-[14px] font-serif text-[#3D7A58]">{formatMoney(row.total)}</td>
                  <td className="px-4 py-3 text-right text-[12px] font-mono text-[#8AAABB]">{mrrTotal > 0 ? Math.round((row.total / mrrTotal) * 100) : 0}%</td>
                </tr>
              ))}
              <tr className="bg-[#FAF8F4]">
                <td className="px-4 py-3 text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>TOTAL</td>
                <td className="px-4 py-3 text-right text-[13px] font-mono text-[#1A2C38]" style={{ fontWeight: 600 }}>{overview.activeSubscriptions}</td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3 text-right text-[16px] font-serif text-[#3D7A58]" style={{ fontWeight: 600 }}>{formatMoney(mrrTotal)}</td>
                <td className="px-4 py-3 text-right text-[12px] font-mono text-[#8AAABB]">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending revenue */}
      {overview.pendingRevenue > 0 && (
        <div className="bg-[#FFF8E8] border-[1.5px] border-[#A07830]/20 rounded-[10px] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-sans uppercase tracking-[1.5px] text-[#A07830]" style={{ fontWeight: 600 }}>PENDING INVOICE REVENUE</p>
              <p className="text-[24px] font-serif text-[#A07830] mt-1">{formatMoney(overview.pendingRevenue)}</p>
            </div>
            <Clock className="h-8 w-8 text-[#A07830]" />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── REFERRALS TAB ─────────────────────────────
function ReferralsTab({ data }: any) {
  if (!data) return null;
  const { referrals = [], topReferrers = [] } = data;
  const totalSignups = referrals.length;
  const totalConverted = referrals.filter((r: any) => r.status === "converted").length;
  const conversionRate = totalSignups > 0 ? Math.round((totalConverted / totalSignups) * 100) : 0;
  const totalDiscounts = totalConverted * 12;

  return (
    <div>
      <h2 className="text-[28px] font-serif text-[#1A2C38] mb-1">Referrals</h2>
      <p className="text-[13px] font-sans text-[#8AAABB] mb-6">Creator referral program performance</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Signups", value: totalSignups },
          { label: "Converted", value: totalConverted, color: "text-[#3D7A58]" },
          { label: "Conversion Rate", value: `${conversionRate}%` },
          { label: "Discounts Given", value: formatMoney(totalDiscounts) },
        ].map(stat => (
          <div key={stat.label} className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5">
            <p className="text-[11px] font-sans uppercase tracking-[1.5px] text-[#8AAABB] mb-2" style={{ fontWeight: 600 }}>{stat.label}</p>
            <p className={`text-[28px] font-serif ${stat.color || "text-[#1A2C38]"}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <p className="text-[11px] font-sans uppercase tracking-[1.5px] text-[#8AAABB] mb-3" style={{ fontWeight: 600 }}>TOP REFERRERS</p>
        <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#F2F8FB] border-b border-[#D8E8EE]">
              <tr>
                <th className="text-left px-4 py-3 text-[10px] font-sans uppercase tracking-[1.5px] text-[#8AAABB]" style={{ fontWeight: 600 }}>Creator</th>
                <th className="text-right px-4 py-3 text-[10px] font-sans uppercase tracking-[1.5px] text-[#8AAABB]" style={{ fontWeight: 600 }}>Signups</th>
                <th className="text-right px-4 py-3 text-[10px] font-sans uppercase tracking-[1.5px] text-[#8AAABB]" style={{ fontWeight: 600 }}>Converted</th>
                <th className="text-right px-4 py-3 text-[10px] font-sans uppercase tracking-[1.5px] text-[#8AAABB]" style={{ fontWeight: 600 }}>Rate</th>
              </tr>
            </thead>
            <tbody>
              {topReferrers.map((r: any) => (
                <tr key={r.id} className="border-b border-[#D8E8EE] last:border-b-0 hover:bg-[#FAF8F4]">
                  <td className="px-4 py-3">
                    <p className="text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>{r.full_name || "—"}</p>
                    <p className="text-[11px] font-mono text-[#8AAABB]">{r.email}</p>
                  </td>
                  <td className="px-4 py-3 text-right text-[13px] font-mono text-[#4A6070]">{r.signups}</td>
                  <td className="px-4 py-3 text-right text-[13px] font-mono text-[#3D7A58]">{r.conversions}</td>
                  <td className="px-4 py-3 text-right text-[12px] font-mono text-[#8AAABB]">
                    {r.signups > 0 ? Math.round((r.conversions / r.signups) * 100) : 0}%
                  </td>
                </tr>
              ))}
              {topReferrers.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-12 text-center"><p className="text-[14px] font-serif italic text-[#8AAABB]">No referrals yet</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── ERRORS TAB ─────────────────────────────
function ErrorsTab({ errors, onResolve }: any) {
  const unresolvedCount = errors.filter((e: any) => !e.resolved).length;
  const [testStatus, setTestStatus] = useState<"idle" | "firing" | "ok" | "error">("idle");
  const [testMessage, setTestMessage] = useState<string>("");

  async function handleTestAlert() {
    setTestStatus("firing");
    setTestMessage("");
    try {
      // Grab the user's auth token from the active Supabase session
      // so the admin endpoint can authenticate the request.
      const sb = getSupabase();
      const { data: { session } } = await sb.auth.getSession();
      const res = await fetch("/api/admin/test-error-alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
      });
      const data = await res.json();
      if (res.ok) {
        setTestStatus("ok");
        setTestMessage(data.next || "Test row inserted. Check your email inbox.");
      } else {
        setTestStatus("error");
        setTestMessage(`${data.error || "Failed"}${data.detail ? ` — ${data.detail}` : ""}${data.hint ? `\n\nHint: ${data.hint}` : ""}`);
      }
    } catch (e: any) {
      setTestStatus("error");
      setTestMessage(e?.message || "Network error");
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-serif text-[#1A2C38]">Error Logs</h2>
          <p className="text-[13px] font-sans text-[#8AAABB] mt-1">{unresolvedCount} unresolved / {errors.length} total</p>
        </div>
        <button
          onClick={handleTestAlert}
          disabled={testStatus === "firing"}
          className="shrink-0 inline-flex items-center gap-2 text-[12px] font-sans border border-[#D8E8EE] rounded-[8px] px-4 py-2 text-[#3D6E8A] hover:bg-[#F2F8FB] transition-colors disabled:opacity-50"
          style={{ fontWeight: 500 }}
        >
          {testStatus === "firing" ? "Firing..." : "🧪 Send test error alert"}
        </button>
      </div>

      {testStatus === "ok" && (
        <div className="mb-4 bg-[#E8F4EE] border-[1.5px] border-[#3D7A58]/30 rounded-[10px] p-4">
          <p className="text-[13px] font-sans text-[#3D7A58]" style={{ fontWeight: 600 }}>Test row inserted ✓</p>
          <p className="text-[12px] font-sans text-[#3D7A58]/80 mt-1">{testMessage}</p>
        </div>
      )}
      {testStatus === "error" && (
        <div className="mb-4 bg-[#F4EAEA] border-[1.5px] border-[#A03D3D]/30 rounded-[10px] p-4">
          <p className="text-[13px] font-sans text-[#A03D3D]" style={{ fontWeight: 600 }}>Test failed</p>
          <p className="text-[12px] font-sans text-[#A03D3D]/80 mt-1 whitespace-pre-wrap">{testMessage}</p>
        </div>
      )}

      <div className="space-y-3">
        {errors.map((err: any) => (
          <div key={err.id} className={`bg-white border-[1.5px] rounded-[10px] p-4 ${err.resolved ? "opacity-50 border-[#D8E8EE]" : err.level === "error" ? "border-[#A03D3D]/30" : "border-[#D8E8EE]"}`}>
            <div className="flex items-start gap-3">
              <div className={`h-8 w-8 rounded-[8px] flex items-center justify-center flex-shrink-0 ${
                err.level === "error" ? "bg-[#F4EAEA] text-[#A03D3D]" :
                err.level === "warning" ? "bg-[#FFF8E8] text-[#A07830]" :
                "bg-[#F2F8FB] text-[#3D6E8A]"
              }`}>
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] font-sans uppercase tracking-[1.5px] px-1.5 py-0.5 rounded-full ${
                    err.level === "error" ? "bg-[#F4EAEA] text-[#A03D3D]" :
                    err.level === "warning" ? "bg-[#FFF8E8] text-[#A07830]" :
                    "bg-[#F2F8FB] text-[#3D6E8A]"
                  }`} style={{ fontWeight: 600 }}>{err.level}</span>
                  <span className="text-[11px] font-mono text-[#8AAABB]">{err.source}</span>
                  <span className="text-[11px] font-mono text-[#8AAABB] ml-auto">{formatDate(err.created_at)}</span>
                </div>
                <p className="text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>{err.message}</p>
                {err.user_email && <p className="text-[11px] font-mono text-[#8AAABB] mt-1">{err.user_email}</p>}
                {err.url && <p className="text-[11px] font-mono text-[#8AAABB] mt-0.5 truncate">{err.url}</p>}
                {err.stack && (
                  <details className="mt-2">
                    <summary className="text-[11px] font-mono text-[#7BAFC8] cursor-pointer hover:underline">Show stack trace</summary>
                    <pre className="text-[10px] font-mono text-[#4A6070] mt-2 p-3 bg-[#F2F8FB] rounded overflow-x-auto">{err.stack}</pre>
                  </details>
                )}
              </div>
              {!err.resolved && (
                <button
                  onClick={() => onResolve(err.id)}
                  className="text-[11px] font-sans text-[#3D7A58] hover:underline flex-shrink-0"
                  style={{ fontWeight: 500 }}
                >
                  Mark resolved
                </button>
              )}
              {err.resolved && <CheckCircle2 className="h-4 w-4 text-[#3D7A58] flex-shrink-0" />}
            </div>
          </div>
        ))}

        {errors.length === 0 && (
          <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-12 text-center">
            <CheckCircle2 className="h-10 w-10 text-[#3D7A58] mx-auto mb-3" />
            <p className="text-[16px] font-serif text-[#1A2C38]">No errors logged</p>
            <p className="text-[13px] font-sans text-[#8AAABB] mt-1">The app is running smoothly</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── GIFT CODES TAB ─────────────────────────────

function GiftCodesTab({ getAuthHeader }: { getAuthHeader: () => Promise<Record<string, string>> }) {
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "",
    plan_tier: "ugc_influencer",
    duration_months: 3 as number | null,
    max_uses: 1 as number | null,
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => { fetchCodes(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchCodes() {
    setLoading(true);
    try {
      const headers = await getAuthHeader();
      const res = await fetch("/api/admin/gift-codes", { headers });
      const data = await res.json();
      if (res.ok) setCodes(data.codes || []);
    } catch {}
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const headers = await getAuthHeader();
      const res = await fetch("/api/admin/gift-codes", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.trim().toUpperCase(),
          plan_tier: form.plan_tier,
          duration_months: form.duration_months,
          max_uses: form.max_uses,
          notes: form.notes.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setForm({ code: "", plan_tier: "ugc_influencer", duration_months: 3, max_uses: 1, notes: "" });
        setShowForm(false);
        fetchCodes();
      } else {
        alert(data.error || "Failed to create code");
      }
    } catch (e: any) {
      alert(e.message || "Failed to create code");
    }
    setSubmitting(false);
  }

  async function toggleActive(id: string, newActive: boolean) {
    try {
      const headers = await getAuthHeader();
      await fetch("/api/admin/gift-codes", {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: newActive }),
      });
      fetchCodes();
    } catch {}
  }

  function copyCode(code: string, id: string) {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const inputClass = "w-full rounded-[8px] border-[1.5px] border-[#D8E8EE] px-3 py-2 text-[13px] font-sans text-[#1A2C38] bg-white focus:outline-none focus:border-[#7BAFC8]";

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-serif text-[#1A2C38]">Gift Codes</h2>
          <p className="text-[13px] font-sans text-[#8AAABB] mt-1">Comp codes for influencers, press, and partnerships.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="shrink-0 bg-[#1E3F52] text-white rounded-[8px] px-4 py-2 text-[13px] font-sans hover:bg-[#2a5269]"
          style={{ fontWeight: 600 }}
        >
          {showForm ? "Cancel" : "+ New code"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-sans font-600 uppercase tracking-[1.5px] text-[#8AAABB] block mb-1.5">Code</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s+/g, "") })}
                placeholder="BRI-FREE"
                required
                minLength={2}
                className={`${inputClass} font-mono`}
              />
              <p className="text-[10px] text-[#8AAABB] mt-1">Human-readable, e.g. CREATOR-NAME or PRESS-2026</p>
            </div>
            <div>
              <label className="text-[11px] font-sans font-600 uppercase tracking-[1.5px] text-[#8AAABB] block mb-1.5">Plan tier</label>
              <select
                value={form.plan_tier}
                onChange={(e) => setForm({ ...form, plan_tier: e.target.value })}
                className={inputClass}
              >
                <option value="ugc">UGC Creator ($27/mo)</option>
                <option value="ugc_influencer">UGC + Influencer ($39/mo)</option>
                <option value="agency">Agency Starter ($149/mo)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-sans font-600 uppercase tracking-[1.5px] text-[#8AAABB] block mb-1.5">Duration</label>
              <select
                value={form.duration_months === null ? "lifetime" : String(form.duration_months)}
                onChange={(e) => setForm({ ...form, duration_months: e.target.value === "lifetime" ? null : parseInt(e.target.value) })}
                className={inputClass}
              >
                <option value="1">1 month</option>
                <option value="3">3 months</option>
                <option value="6">6 months</option>
                <option value="12">12 months (1 year)</option>
                <option value="lifetime">Lifetime</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-sans font-600 uppercase tracking-[1.5px] text-[#8AAABB] block mb-1.5">Max uses</label>
              <input
                type="number"
                min="1"
                value={form.max_uses === null ? "" : form.max_uses}
                onChange={(e) => setForm({ ...form, max_uses: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="1 (leave empty for unlimited)"
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-sans font-600 uppercase tracking-[1.5px] text-[#8AAABB] block mb-1.5">Notes (internal only)</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. Gift for Brianna Cole — 3-month Influencer comp"
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !form.code}
            className="bg-[#1E3F52] text-white rounded-[8px] px-5 py-2 text-[13px] font-sans hover:bg-[#2a5269] disabled:opacity-50"
            style={{ fontWeight: 600 }}
          >
            {submitting ? "Creating..." : "Create code"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[#D8E8EE] border-t-[#7BAFC8] mx-auto" /></div>
      ) : codes.length === 0 ? (
        <div className="text-center py-12 bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px]">
          <p className="text-[14px] font-sans text-[#8AAABB]">No gift codes yet. Create your first one above.</p>
        </div>
      ) : (
        <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_100px] gap-4 px-5 py-3 bg-[#F0EAE0] text-[10px] font-sans uppercase tracking-[2px] text-[#8AAABB] border-b border-[#D8E8EE]" style={{ fontWeight: 600 }}>
            <span>Code</span>
            <span>Tier</span>
            <span>Duration</span>
            <span>Uses</span>
            <span>Status</span>
            <span></span>
          </div>
          {codes.map((c) => (
            <div key={c.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_100px] gap-4 px-5 py-3 border-b border-[#EEE8E0] last:border-b-0 items-center">
              <div>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-[13px] text-[#1A2C38]" style={{ fontWeight: 600 }}>{c.code}</code>
                  <button
                    onClick={() => copyCode(c.code, c.id)}
                    className="text-[11px] text-[#7BAFC8] hover:underline"
                  >
                    {copiedId === c.id ? "Copied!" : "Copy"}
                  </button>
                </div>
                {c.notes && <p className="text-[11px] text-[#8AAABB] mt-0.5">{c.notes}</p>}
              </div>
              <span className="text-[12px] font-sans text-[#4A6070]">
                {c.plan_tier === "ugc_influencer" ? "Influencer" : c.plan_tier === "ugc" ? "UGC" : "Agency"}
              </span>
              <span className="text-[12px] font-sans text-[#4A6070]">
                {c.duration_months ? `${c.duration_months} mo` : "Lifetime"}
              </span>
              <span className="text-[12px] font-sans text-[#4A6070]">
                {c.uses_count}{c.max_uses ? ` / ${c.max_uses}` : " / ∞"}
              </span>
              <span>
                <span className={`text-[11px] uppercase tracking-wide px-2 py-0.5 rounded-full inline-block ${c.active ? "bg-[#E8F4EE] text-[#3D7A58]" : "bg-[#F4EAEA] text-[#A03D3D]"}`} style={{ fontWeight: 600 }}>
                  {c.active ? "Active" : "Off"}
                </span>
              </span>
              <button
                onClick={() => toggleActive(c.id, !c.active)}
                className="text-[11px] font-sans text-[#4A6070] hover:text-[#1A2C38]"
              >
                {c.active ? "Deactivate" : "Activate"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
