import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Note: like /api/deals, this route is mostly unused — the frontend uses
// useSupabaseQuery/useSupabaseMutation directly, which go through RLS.
// This route exists as a fallback. We still require auth and set user_id
// on inserts for defense-in-depth.

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
  const { data, error } = await sb.from("invoices").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const sb = getSupabaseServer(req);
  if (!sb) return unauthorized();

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();

  const body = await req.json();
  // Whitelist fields and force user_id to the authenticated user.
  const cleanData: Record<string, any> = {
    user_id: user.id,
    creator_id: user.id,
    brand_name: typeof body.brand_name === "string" ? body.brand_name.trim() : "",
    amount: typeof body.amount === "number" && body.amount >= 0 ? body.amount : 0,
    status: ["draft", "sent", "paid", "overdue"].includes(body.status) ? body.status : "draft",
    due_date: body.due_date || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
  };
  if (body.deal_id) cleanData.deal_id = body.deal_id;
  if (body.invoice_number) cleanData.invoice_number = String(body.invoice_number).trim();
  if (!cleanData.brand_name) {
    return NextResponse.json({ error: "Missing brand_name" }, { status: 400 });
  }

  const { data, error } = await sb.from("invoices").insert(cleanData).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// Defense-in-depth ownership check before mutating an invoice. RLS
// already blocks cross-user writes; this just stops IDOR cold at the
// route level if a policy regresses.
async function userOwnsInvoice(sb: any, invoiceId: string, userId: string): Promise<boolean> {
  const { data } = await sb
    .from("invoices")
    .select("user_id, creator_id")
    .eq("id", invoiceId)
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
  if (!id) return NextResponse.json({ error: "Missing invoice ID" }, { status: 400 });

  if (!(await userOwnsInvoice(sb, id, user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Strip ownership fields from updates.
  delete updates.user_id;
  delete updates.creator_id;
  delete updates.agency_id;

  const { data, error } = await sb.from("invoices").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
