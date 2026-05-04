import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminRequest } from "@/lib/admin-auth";

/**
 * Admin endpoint for managing affiliate applications.
 *
 * GET  — list all affiliates (with optional status filter)
 * PATCH — approve or reject an application
 */

function getServiceClient() {
  return createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
    (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim()
  );
}

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const status = req.nextUrl.searchParams.get("status"); // optional filter
  const sb = getServiceClient();

  let query = sb
    .from("affiliates")
    .select("id, user_id, promo_code, display_name, instagram_handle, follower_tier, motivation, status, stripe_connect_onboarded, created_at, approved_at")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ affiliates: data });
}

export async function PATCH(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { affiliateId, action } = await req.json();

  if (!affiliateId || !["approve", "reject", "pause", "terminate"].includes(action)) {
    return NextResponse.json({ error: "Invalid affiliateId or action" }, { status: 400 });
  }

  const sb = getServiceClient();

  const statusMap: Record<string, string> = {
    approve: "active",
    reject: "terminated",
    pause: "paused",
    terminate: "terminated",
  };

  const updates: Record<string, any> = {
    status: statusMap[action],
    updated_at: new Date().toISOString(),
  };

  if (action === "approve") {
    updates.approved_at = new Date().toISOString();
  }

  const { data, error } = await sb
    .from("affiliates")
    .update(updates)
    .eq("id", affiliateId)
    .select("id, status, promo_code, display_name")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ affiliate: data });
}
