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

function formatICalDate(date: string): string {
  const d = new Date(date);
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeICalText(text: string): string {
  return text.replace(/[\\;,\n]/g, (match) => {
    if (match === "\n") return "\\n";
    return "\\" + match;
  });
}

export async function GET(req: NextRequest) {
  const sb = getSupabaseServer(req);

  // Get deals with due dates
  const { data: deals } = await sb
    .from("deals")
    .select("*")
    .not("due_date", "is", null)
    .order("due_date", { ascending: true });

  const events = (deals || []).map((deal) => {
    const dueDate = deal.due_date;
    const summary = `${deal.brand_name} — ${deal.deliverables || "Deal deadline"}`;
    const description = [
      `Brand: ${deal.brand_name}`,
      `Value: $${deal.value}`,
      `Stage: ${deal.stage}`,
      deal.notes ? `Notes: ${deal.notes}` : "",
    ]
      .filter(Boolean)
      .join("\\n");

    return [
      "BEGIN:VEVENT",
      `DTSTART;VALUE=DATE:${dueDate.replace(/-/g, "")}`,
      `DTEND;VALUE=DATE:${dueDate.replace(/-/g, "")}`,
      `SUMMARY:${escapeICalText(summary)}`,
      `DESCRIPTION:${escapeICalText(description)}`,
      `UID:${deal.id}@createsuite.co`,
      "STATUS:CONFIRMED",
      `CATEGORIES:CreateSuite`,
      "END:VEVENT",
    ].join("\r\n");
  });

  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Create Suite//Deal Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Create Suite Deals",
    "X-WR-TIMEZONE:America/New_York",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(calendar, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": "attachment; filename=createsuite-deals.ics",
    },
  });
}
