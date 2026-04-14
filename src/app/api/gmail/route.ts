import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { refreshGoogleToken } from "@/lib/google";

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
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const tokens = await getGoogleTokens(userId);
  if (!tokens?.google_access_token) {
    return NextResponse.json({ error: "Gmail not connected" }, { status: 401 });
  }

  try {
    // Fetch recent emails
    let accessToken = tokens.google_access_token;

    let res = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&q=is:inbox",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    // If token expired, refresh and retry
    if (res.status === 401 && tokens.google_refresh_token) {
      const newTokens = await refreshGoogleToken(tokens.google_refresh_token);
      accessToken = newTokens.access_token;

      // Update stored token
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.SUPABASE_SERVICE_ROLE_KEY || ""
      );
      await sb.from("profiles").update({ google_access_token: accessToken }).eq("id", userId);

      res = await fetch(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&q=is:inbox",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    }

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 });
    }

    const data = await res.json();
    const messageIds = (data.messages || []).slice(0, 10);

    // Fetch full message details
    const emails = await Promise.all(
      messageIds.map(async (msg: { id: string }) => {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!msgRes.ok) return null;
        const msgData = await msgRes.json();
        const headers = msgData.payload?.headers || [];
        return {
          id: msgData.id,
          from: headers.find((h: { name: string }) => h.name === "From")?.value || "",
          subject: headers.find((h: { name: string }) => h.name === "Subject")?.value || "",
          date: headers.find((h: { name: string }) => h.name === "Date")?.value || "",
          snippet: msgData.snippet || "",
        };
      })
    );

    return NextResponse.json(emails.filter(Boolean));
  } catch {
    return NextResponse.json({ error: "Gmail fetch failed" }, { status: 500 });
  }
}
