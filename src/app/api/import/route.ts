import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireFeature } from "@/lib/require-tier";

function getSupabaseServer(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    { global: { headers: authHeader ? { Authorization: authHeader } : {} } }
  );
}

// Parse CSV text into array of objects
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_"));
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map(v => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, j) => { row[h] = values[j] || ""; });
    rows.push(row);
  }
  return rows;
}

// Map CSV columns to Supabase deal columns
function mapToDeal(row: Record<string, string>) {
  return {
    brand_name: row.brand_name || row.brand || row.client || "",
    value: parseFloat(row.value || row.amount || row.rate || "0") || 0,
    deliverables: row.deliverables || row.content || row.description || "",
    platform: (row.platform || "").toLowerCase() || null,
    stage: mapStage(row.stage || row.status || ""),
    due_date: parseDate(row.due_date || row.deadline || row.date) || null,
    deal_type: (row.deal_type || row.type || "ugc").toLowerCase(),
    notes: row.notes || "",
  };
}

function mapStage(s: string): string {
  const lower = s.toLowerCase();
  if (lower.includes("paid") || lower.includes("complete")) return "paid";
  if (lower.includes("deliver")) return "delivered";
  if (lower.includes("progress") || lower.includes("active")) return "in_progress";
  if (lower.includes("contract") || lower.includes("signed")) return "contracted";
  if (lower.includes("negoti")) return "negotiating";
  if (lower.includes("pitch")) return "pitched";
  return "lead";
}

function parseDate(d: string | undefined): string | null {
  if (!d) return null;
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split("T")[0];
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  // CSV import is a paid-tier feature (per feature-gates.ts). Without
  // this gate a free user can hit /api/import directly to bypass the
  // FREE_TIER_DEAL_LIMIT and load unlimited deals.
  const tier = await requireFeature(req, "import");
  if (!tier.ok) {
    return NextResponse.json({ error: tier.error, hint: (tier as any).hint }, { status: tier.status });
  }

  const sb = getSupabaseServer(req);
  if (!sb) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Extract the authenticated user so we can set user_id / creator_id on
  // every imported row. RLS requires auth.uid() = user_id.
  const { data: { user }, error: authError } = await sb.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { csv, type } = await req.json();

  if (!csv || !type) {
    return NextResponse.json({ error: "Missing csv or type" }, { status: 400 });
  }

  const rows = parseCSV(csv);
  if (rows.length === 0) {
    return NextResponse.json({ error: "No data found in CSV" }, { status: 400 });
  }

  try {
    if (type === "deals") {
      const deals = rows
        .map(mapToDeal)
        .filter(d => d.brand_name)
        .map(d => ({ ...d, user_id: user.id, creator_id: user.id }));
      const { data, error } = await sb.from("deals").insert(deals).select();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ imported: data?.length || 0 });
    }

    if (type === "invoices") {
      const invoices = rows.map(row => ({
        brand_name: row.brand_name || row.brand || row.client || "",
        amount: parseFloat(row.amount || row.value || "0") || 0,
        status: (row.status || "draft").toLowerCase(),
        due_date: parseDate(row.due_date || row.date) || new Date().toISOString().split("T")[0],
        user_id: user.id,
        creator_id: user.id,
      })).filter(i => i.brand_name);
      const { data, error } = await sb.from("invoices").insert(invoices).select();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ imported: data?.length || 0 });
    }

    return NextResponse.json({ error: "Unknown import type" }, { status: 400 });
  } catch (err: any) {
    console.error("[Import] Error:", err);
    return NextResponse.json({ error: err.message || "Import failed" }, { status: 500 });
  }
}
