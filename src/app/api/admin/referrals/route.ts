import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminRequest } from "@/lib/admin-auth";

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
    const { data: referrals } = await sb
      .from("referrals")
      .select("*")
      .order("created_at", { ascending: false });

    const referrerCounts: Record<string, { count: number; converted: number }> = {};
    (referrals || []).forEach((r: any) => {
      if (!referrerCounts[r.referrer_id]) {
        referrerCounts[r.referrer_id] = { count: 0, converted: 0 };
      }
      referrerCounts[r.referrer_id].count++;
      if (r.status === "converted") referrerCounts[r.referrer_id].converted++;
    });

    const topReferrerIds = Object.keys(referrerCounts);
    const { data: topReferrerProfiles } = topReferrerIds.length > 0
      ? await sb.from("profiles").select("id, full_name, email").in("id", topReferrerIds)
      : { data: [] };

    const topReferrers = (topReferrerProfiles || [])
      .map((p: any) => ({
        ...p,
        signups: referrerCounts[p.id]?.count || 0,
        conversions: referrerCounts[p.id]?.converted || 0,
      }))
      .sort((a, b) => b.signups - a.signups);

    return NextResponse.json({ referrals, topReferrers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
