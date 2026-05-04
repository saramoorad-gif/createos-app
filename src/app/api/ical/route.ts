import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/ical
 *
 * Returns the caller's deal calendar as .ics. Requires a Supabase
 * bearer token. The previous version had no auth at all and relied
 * entirely on RLS — if RLS regressed on `deals`, every user's
 * calendar leaked anonymously.
 *
 * In-app the integrations page fetches this with the user's bearer
 * token and triggers a blob download. Subscribe-from-Google-Calendar
 * style usage isn't supported until we add a per-user revocable
 * feed token (TODO).
 */

function escapeICalText(text: string): string {
  return text.replace(/[\\;,\n]/g, (match) => {
    if (match === "\n") return "\\n";
    return "\\" + match;
  });
}

async function resolveUserId(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const sb = createClient(
      (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim(),
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await sb.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const userId = await resolveUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
    (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim()
  );

  // Scope to the caller. Don't trust RLS as the only guard — we want
  // explicit ownership filtering here so a misconfigured policy can't
  // ever leak someone else's deals through this feed.
  const { data: deals } = await sb
    .from("deals")
    .select("*")
    .or(`user_id.eq.${userId},creator_id.eq.${userId}`)
    .not("due_date", "is", null)
    .order("due_date", { ascending: true });

  const events = (deals || []).map((deal: any) => {
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

