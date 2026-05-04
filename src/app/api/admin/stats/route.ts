import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { PLAN_PRICING_MONTHLY, getMonthlyPrice } from "@/lib/plan-pricing";

// Returns aggregated stats for the admin overview page
// Requires valid Supabase auth token in Authorization header

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );

  try {
    // Cap each fetch so a runaway error_logs table or a 100K-user
    // future state can't OOM the serverless function. The numbers
    // here are roomy — well above realistic stats-page needs — and
    // can be raised when we paginate the admin dashboard properly.
    const HARD_CAP = 50_000;
    const [profilesRes, dealsRes, invoicesRes, referralsRes, errorsRes] = await Promise.all([
      sb.from("profiles").select("id, email, full_name, account_type, subscription_status, created_at, referral_code, referred_by_code").limit(HARD_CAP),
      sb.from("deals").select("id, user_id, value, stage, created_at").limit(HARD_CAP),
      sb.from("invoices").select("id, user_id, amount, status, due_date, created_at").limit(HARD_CAP),
      sb.from("referrals").select("id, referrer_id, referred_id, status, created_at").limit(HARD_CAP),
      sb.from("error_logs").select("id, level, resolved, created_at").eq("resolved", false).limit(5_000),
    ]);

    const profiles = profilesRes.data || [];
    const deals = dealsRes.data || [];
    const invoices = invoicesRes.data || [];
    const referrals = referralsRes.data || [];
    const errors = errorsRes.data || [];

    // MRR uses the shared plan-pricing source so it stays in sync with
    // signup, checkout, and marketing pages. If Stripe prices change,
    // update src/lib/plan-pricing.ts in one place.
    const planPricing = PLAN_PRICING_MONTHLY;

    const activeSubscriptions = profiles.filter(p =>
      p.subscription_status === "active" || p.subscription_status === "trialing"
    );

    const mrr = activeSubscriptions.reduce(
      (sum, p) => sum + getMonthlyPrice(p.account_type),
      0
    );

    const userBreakdown = {
      total: profiles.length,
      free: profiles.filter(p => p.account_type === "free").length,
      ugc: profiles.filter(p => p.account_type === "ugc" && p.subscription_status === "active").length,
      ugc_influencer: profiles.filter(p => p.account_type === "ugc_influencer" && p.subscription_status === "active").length,
      agency: profiles.filter(p => p.account_type === "agency" && p.subscription_status === "active").length,
      past_due: profiles.filter(p => p.subscription_status === "past_due").length,
      cancelled: profiles.filter(p => p.subscription_status === "cancelled").length,
    };

    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const newSignups30d = profiles.filter(p => new Date(p.created_at) >= thirtyDaysAgo).length;
    const newSignups7d = profiles.filter(p => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
      return new Date(p.created_at) >= sevenDaysAgo;
    }).length;

    const totalRevenue = invoices
      .filter(i => i.status === "paid")
      .reduce((sum, i) => sum + Number(i.amount || 0), 0);

    const pendingRevenue = invoices
      .filter(i => i.status === "sent" || i.status === "overdue")
      .reduce((sum, i) => sum + Number(i.amount || 0), 0);

    const referralSignups = referrals.length;
    const referralConversions = referrals.filter(r => r.status === "converted").length;

    const signupsByDay: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const day = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
      signupsByDay[day] = 0;
    }
    profiles.forEach(p => {
      if (!p.created_at) return;
      const day = new Date(p.created_at).toISOString().split("T")[0];
      // Only count if within our 30-day window
      if (day in signupsByDay) {
        signupsByDay[day] = (signupsByDay[day] || 0) + 1;
      }
    });

    return NextResponse.json({
      overview: {
        mrr,
        totalUsers: profiles.length,
        activeSubscriptions: activeSubscriptions.length,
        newSignups30d,
        newSignups7d,
        totalDeals: deals.length,
        totalRevenue,
        pendingRevenue,
        unresolvedErrors: errors.length,
        referralSignups,
        referralConversions,
      },
      userBreakdown,
      signupsByDay,
      planPricing,
    });
  } catch (err: any) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
