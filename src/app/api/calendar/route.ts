import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { refreshGoogleToken } from "@/lib/google";

/**
 * Google Calendar proxy.
 *
 * Both GET (list events) and POST (create event) used to read
 * `userId` from a query/body param without verifying it matched the
 * caller. That let any authenticated user pull or write to anyone
 * else's Google Calendar by just substituting the target userId.
 *
 * The userId now comes from the verified bearer token; the body /
 * query param is ignored.
 */

async function resolveCallerUserId(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
  if (!supabaseUrl || !anonKey) return null;
  try {
    const sb = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await sb.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

async function getGoogleTokens(userId: string) {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
  const { data } = await sb
    .from("profiles")
    .select("google_access_token, google_refresh_token")
    .eq("id", userId)
    .single();
  return data;
}

export async function GET(req: NextRequest) {
  const userId = await resolveCallerUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tokens = await getGoogleTokens(userId);
  if (!tokens?.google_access_token) {
    return NextResponse.json({ error: "Google Calendar not connected" }, { status: 401 });
  }

  try {
    let accessToken = tokens.google_access_token;
    const now = new Date().toISOString();
    const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    let res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&timeMax=${maxDate}&maxResults=20&singleEvents=true&orderBy=startTime`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (res.status === 401 && tokens.google_refresh_token) {
      const newTokens = await refreshGoogleToken(tokens.google_refresh_token);
      accessToken = newTokens.access_token;
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.SUPABASE_SERVICE_ROLE_KEY || ""
      );
      await sb.from("profiles").update({ google_access_token: accessToken }).eq("id", userId);
      res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&timeMax=${maxDate}&maxResults=20&singleEvents=true&orderBy=startTime`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    }

    if (!res.ok) return NextResponse.json({ error: "Failed to fetch calendar" }, { status: 500 });
    const data = await res.json();

    return NextResponse.json(
      (data.items || []).map((event: Record<string, unknown>) => ({
        id: event.id,
        summary: event.summary,
        start: (event.start as Record<string, string>)?.dateTime || (event.start as Record<string, string>)?.date,
        end: (event.end as Record<string, string>)?.dateTime || (event.end as Record<string, string>)?.date,
        location: event.location,
      }))
    );
  } catch {
    return NextResponse.json({ error: "Calendar fetch failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userId = await resolveCallerUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { summary, date, description } = await req.json().catch(() => ({} as any));

  const tokens = await getGoogleTokens(userId);
  if (!tokens?.google_access_token) {
    return NextResponse.json({ error: "Google Calendar not connected" }, { status: 401 });
  }

  const event = {
    summary,
    description,
    start: { date },
    end: { date },
    reminders: { useDefault: false, overrides: [{ method: "popup", minutes: 1440 }] },
  };

  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokens.google_access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  if (!res.ok) return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  return NextResponse.json(await res.json(), { status: 201 });
}
