import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Note: this route is currently unused — the frontend uses useSupabaseQuery
// directly, which already goes through row-level security. It's kept as a
// defense-in-depth fallback. RLS on public.deals enforces that only the row
// owner (user_id or creator_id) can read/write, so even without auth checks
// here a malicious caller cannot impersonate another user. We still require
// an Authorization header so the endpoint fails fast with 401 instead of
// silently returning zero rows.

function getSupabaseServer(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  // Reject obviously malformed tokens before hitting Supabase — a valid
  // Supabase JWT always has exactly 3 dot-separated parts.
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (token.split(".").length !== 3) return null;
  return createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim(),
    { global: { headers: { Authorization: authHeader } } }
  );
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(req: NextRequest) {
  const sb = getSupabaseServer(req);
  if (!sb) return unauthorized();
  const { data, error } = await sb.from("deals").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const sb = getSupabaseServer(req);
  if (!sb) return unauthorized();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();

  const body = await req.json();
  // Whitelist fields the client is allowed to set. user_id is forced to the
  // authenticated user — client cannot impersonate another user.
  const cleanData: Record<string, any> = {
    user_id: user.id,
    brand_name: typeof body.brand_name === "string" ? body.brand_name.trim() : "",
    stage: ["lead", "pitched", "negotiating", "contracted", "in_progress", "delivered", "paid"].includes(body.stage)
      ? body.stage
      : "lead",
    value: typeof body.value === "number" && body.value >= 0 ? body.value : 0,
    deliverables: body.deliverables ? String(body.deliverables).trim() : null,
    platform: body.platform || null,
    due_date: body.due_date || null,
    notes: body.notes ? String(body.notes).trim() : null,
    exclusivity_days: body.exclusivity_days ? Math.max(0, parseInt(String(body.exclusivity_days)) || 0) : null,
    exclusivity_category: body.exclusivity_category ? String(body.exclusivity_category).trim() : null,
  };
  if (!cleanData.brand_name) {
    return NextResponse.json({ error: "Missing brand_name" }, { status: 400 });
  }

  const { data, error } = await sb.from("deals").insert(cleanData).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// Defense in depth: explicitly verify the caller owns the row before
// PATCH/DELETE. RLS already blocks cross-user mutations, but if a
// policy regresses (we've shipped policy churn before), this stops
// IDOR at the route level.
async function userOwnsDeal(sb: any, dealId: string, userId: string): Promise<boolean> {
  const { data } = await sb
    .from("deals")
    .select("user_id, creator_id")
    .eq("id", dealId)
    .single();
  if (!data) return false;
  return data.user_id === userId || data.creator_id === userId;
}

export async function PATCH(req: NextRequest) {
  const sb = getSupabaseServer(req);
  if (!sb) return unauthorized();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();

  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing deal ID" }, { status: 400 });

  if (!(await userOwnsDeal(sb, id, user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Strip any field that could be used to re-assign ownership.
  delete updates.user_id;
  delete updates.creator_id;
  delete updates.agency_id;
  delete updates.created_by_agency;

  const { data, error } = await sb.from("deals").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const sb = getSupabaseServer(req);
  if (!sb) return unauthorized();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing deal ID" }, { status: 400 });

  if (!(await userOwnsDeal(sb, id, user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error } = await sb.from("deals").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}
