import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireFeature } from "@/lib/require-tier";

/**
 * Scheduled Custom Reports — Growth-only.
 *
 *   GET    /api/scheduled-reports              list mine
 *   POST   /api/scheduled-reports              create { kind, recipients[], cadence, label }
 *   DELETE /api/scheduled-reports?id=…       delete
 *
 * The actual sender is the daily cron at /api/cron/affiliate-payouts
 * (which already runs at 09:00 UTC) — it picks up due rows, emails the
 * report HTML, and bumps next_run_at.
 */
const VALID_CADENCES = new Set(["weekly", "monthly"]);
const VALID_KINDS = new Set(["overview", "pnl", "commission", "annual"]);

function nextRunAt(cadence: "weekly" | "monthly"): string {
  const d = new Date();
  if (cadence === "weekly") d.setDate(d.getDate() + 7);
  else d.setMonth(d.getMonth() + 1);
  d.setUTCHours(9, 0, 0, 0);
  return d.toISOString();
}

export async function GET(req: NextRequest) {
  const tier = await requireFeature(req, "custom-reporting");
  if (!tier.ok) return NextResponse.json({ error: tier.error, hint: (tier as any).hint }, { status: tier.status });

  const sb = createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
    (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim()
  );
  const { data, error } = await sb
    .from("scheduled_reports")
    .select("id, label, kind, cadence, recipients, next_run_at, last_run_at, paused")
    .eq("owner_id", tier.userId)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reports: data });
}

export async function POST(req: NextRequest) {
  const tier = await requireFeature(req, "custom-reporting");
  if (!tier.ok) return NextResponse.json({ error: tier.error, hint: (tier as any).hint }, { status: tier.status });

  const { kind, cadence, recipients, label } = await req.json().catch(() => ({}));
  if (!VALID_KINDS.has(kind)) return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  if (!VALID_CADENCES.has(cadence)) return NextResponse.json({ error: "Invalid cadence" }, { status: 400 });
  if (!Array.isArray(recipients) || recipients.length === 0 || recipients.length > 10) {
    return NextResponse.json({ error: "1–10 recipients required" }, { status: 400 });
  }
  for (const r of recipients) {
    if (typeof r !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r)) {
      return NextResponse.json({ error: `Invalid recipient: ${r}` }, { status: 400 });
    }
  }
  if (typeof label !== "string" || !label.trim()) {
    return NextResponse.json({ error: "Label is required" }, { status: 400 });
  }

  const sb = createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
    (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim()
  );

  const { data, error } = await sb
    .from("scheduled_reports")
    .insert({
      owner_id: tier.userId,
      label: label.trim().slice(0, 120),
      kind,
      cadence,
      recipients,
      next_run_at: nextRunAt(cadence as "weekly" | "monthly"),
    })
    .select("id, label, kind, cadence, recipients, next_run_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ report: data }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const tier = await requireFeature(req, "custom-reporting");
  if (!tier.ok) return NextResponse.json({ error: tier.error, hint: (tier as any).hint }, { status: tier.status });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const sb = createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
    (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim()
  );
  const { error } = await sb.from("scheduled_reports").delete().eq("id", id).eq("owner_id", tier.userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}
