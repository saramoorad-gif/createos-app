import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseServer(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    { global: { headers: authHeader ? { Authorization: authHeader } : {} } }
  );
}

export async function GET(req: NextRequest) {
  const sb = getSupabaseServer(req);
  const { data, error } = await sb.from("invoices").select("*").order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const sb = getSupabaseServer(req);
  const body = await req.json();
  const { data, error } = await sb.from("invoices").insert(body).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const sb = getSupabaseServer(req);
  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing invoice ID" }, { status: 400 });

  const { data, error } = await sb.from("invoices").update(updates).eq("id", id).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
