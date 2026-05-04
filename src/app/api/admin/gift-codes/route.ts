import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminRequest } from "@/lib/admin-auth";

/**
 * Admin CRUD for gift codes.
 *
 * GET    — list all codes with redemption counts
 * POST   — create a new code
 * PATCH  — deactivate/reactivate (toggle active flag)
 */

function getServiceClient() {
  return createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
    (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim()
  );
}

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const sb = getServiceClient();
  const { data, error } = await sb
    .from("gift_codes")
    .select("id, code, plan_tier, duration_months, max_uses, uses_count, active, expires_at, notes, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ codes: data });
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await req.json();
  const { code, plan_tier, duration_months, max_uses, expires_at, notes } = body;

  // Validation.
  if (!code || typeof code !== "string" || code.trim().length < 2) {
    return NextResponse.json({ error: "Code must be at least 2 characters" }, { status: 400 });
  }
  if (!["ugc", "ugc_influencer", "agency"].includes(plan_tier)) {
    return NextResponse.json({ error: "Invalid plan_tier" }, { status: 400 });
  }
  if (duration_months !== null && duration_months !== undefined) {
    if (typeof duration_months !== "number" || duration_months < 1 || duration_months > 120) {
      return NextResponse.json({ error: "duration_months must be 1-120 or null for lifetime" }, { status: 400 });
    }
  }
  if (max_uses !== null && max_uses !== undefined) {
    if (typeof max_uses !== "number" || max_uses < 1) {
      return NextResponse.json({ error: "max_uses must be >= 1 or null for unlimited" }, { status: 400 });
    }
  }

  const sb = getServiceClient();

  const { data, error } = await sb
    .from("gift_codes")
    .insert({
      code: code.trim().toUpperCase(),
      plan_tier,
      duration_months: duration_months ?? null,
      max_uses: max_uses ?? null,
      expires_at: expires_at || null,
      notes: notes?.trim() || null,
      // created_by is set server-side by looking up the admin's user row.
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "That code already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ code: data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id, active } = await req.json();
  if (!id || typeof active !== "boolean") {
    return NextResponse.json({ error: "Missing id or active" }, { status: 400 });
  }

  const sb = getServiceClient();
  const { data, error } = await sb
    .from("gift_codes")
    .update({ active })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ code: data });
}
