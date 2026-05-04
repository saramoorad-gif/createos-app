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
    // Explicit whitelist — never return stripe_customer_id,
    // stripe_subscription_id, google_access_token, google_refresh_token,
    // or other secrets to the admin client.
    const { data: users, error } = await sb
      .from("profiles")
      .select(
        "id, email, full_name, account_type, agency_name, agency_plan, " +
          "agency_role, has_agency, linked_agency_id, subscription_status, " +
          "referral_code, referred_by_code, referral_applied, " +
          "google_connected, " +
          "tiktok_handle, instagram_handle, youtube_handle, " +
          "primary_niche, location, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(50_000);

    if (error) throw error;
    return NextResponse.json({ users });
  } catch (err: any) {
    console.error("Admin users error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
