import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { refreshGoogleToken } from "@/lib/google";
import { verifyUserRequest } from "@/lib/api-auth";

// AI-powered email scanner: detects brand deal opportunities in Gmail
// and auto-creates deals in the pipeline

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

interface EmailData {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
}

interface DetectedDeal {
  brand_name: string;
  estimated_value: number;
  deliverables: string;
  platform: "tiktok" | "instagram" | "youtube" | null;
  notes: string;
  email_id: string;
  email_subject: string;
  email_from: string;
  confidence: "high" | "medium" | "low";
}

export async function POST(req: NextRequest) {
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const auth = await verifyUserRequest(req, userId);
  if (!auth.authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tokens = await getGoogleTokens(userId);
  if (!tokens?.google_access_token) {
    return NextResponse.json({ error: "Gmail not connected" }, { status: 401 });
  }

  try {
    let accessToken = tokens.google_access_token;

    // Fetch recent emails (last 30, broader than inbox view)
    let res = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=30&q=is:inbox newer_than:7d",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    // Refresh token if needed
    if (res.status === 401 && tokens.google_refresh_token) {
      const newTokens = await refreshGoogleToken(tokens.google_refresh_token);
      accessToken = newTokens.access_token;
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.SUPABASE_SERVICE_ROLE_KEY || ""
      );
      await sb.from("profiles").update({ google_access_token: accessToken }).eq("id", userId);
      res = await fetch(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=30&q=is:inbox newer_than:7d",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    }

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 });
    }

    const data = await res.json();
    const messageIds = (data.messages || []).slice(0, 20);

    // Fetch email details
    const emails: EmailData[] = (await Promise.all(
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
    )).filter(Boolean) as EmailData[];

    // Use AI to detect deals
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Fallback: keyword-based detection
      return NextResponse.json({ deals: keywordDetection(emails), source: "keywords" });
    }

    const emailSummaries = emails.map((e, i) =>
      `Email ${i + 1}:\nFrom: ${e.from}\nSubject: ${e.subject}\nSnippet: ${e.snippet}\n`
    ).join("\n---\n");

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: `You are a deal detection AI for a UGC creator/influencer platform called Create Suite.
Analyze emails and identify brand partnership, collaboration, or sponsorship opportunities.

For each detected deal, return a JSON array with objects containing:
- brand_name: the brand/company name
- estimated_value: estimated deal value in USD (0 if unknown, make educated guesses based on context)
- deliverables: brief description of what's being asked (e.g., "2 TikTok videos + 1 Instagram reel")
- platform: "tiktok", "instagram", "youtube", or null if unclear
- notes: 1-sentence summary of the opportunity
- email_index: which email number (1-based) this came from
- confidence: "high" (clear brand deal), "medium" (likely deal), or "low" (possible deal)

Only include actual brand/collaboration/sponsorship opportunities. Ignore:
- Personal emails, newsletters, receipts, shipping notifications
- Social media notifications
- Marketing/promotional emails not about partnerships
- Account verification or password reset emails

Return ONLY a valid JSON array. If no deals found, return [].`,
        messages: [{ role: "user", content: `Scan these emails for brand deal opportunities:\n\n${emailSummaries}` }],
      }),
    });

    if (!aiRes.ok) {
      return NextResponse.json({ deals: keywordDetection(emails), source: "keywords" });
    }

    const aiData = await aiRes.json();
    const aiText = aiData.content?.[0]?.text || "[]";

    // Parse AI response
    let detectedDeals: DetectedDeal[] = [];
    try {
      const jsonMatch = aiText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        detectedDeals = parsed.map((d: any) => ({
          brand_name: d.brand_name || "Unknown Brand",
          estimated_value: d.estimated_value || 0,
          deliverables: d.deliverables || "",
          platform: ["tiktok", "instagram", "youtube"].includes(d.platform) ? d.platform : null,
          notes: d.notes || "",
          email_id: emails[d.email_index - 1]?.id || "",
          email_subject: emails[d.email_index - 1]?.subject || "",
          email_from: emails[d.email_index - 1]?.from || "",
          confidence: d.confidence || "medium",
        }));
      }
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      return NextResponse.json({ deals: keywordDetection(emails), source: "keywords" });
    }

    return NextResponse.json({ deals: detectedDeals, source: "ai", emailsScanned: emails.length });
  } catch (err) {
    console.error("Gmail scan error:", err);
    return NextResponse.json({ error: "Scan failed" }, { status: 500 });
  }
}

// Fallback keyword-based detection when no API key
function keywordDetection(emails: EmailData[]): DetectedDeal[] {
  const dealKeywords = [
    "collaboration", "partnership", "sponsor", "campaign", "brand deal",
    "influencer", "ugc", "content creator", "paid", "compensation",
    "deliverables", "post", "reel", "video", "story", "rate", "budget",
    "collab", "gifting", "ambassador", "affiliate",
  ];

  return emails
    .filter((email) => {
      const text = `${email.subject} ${email.snippet}`.toLowerCase();
      return dealKeywords.some((kw) => text.includes(kw));
    })
    .map((email) => {
      const fromMatch = email.from.match(/^"?([^"<]*)"?\s*<?/);
      const brandName = fromMatch?.[1]?.trim() || email.from.split("@")[0] || "Unknown";
      return {
        brand_name: brandName,
        estimated_value: 0,
        deliverables: "",
        platform: null,
        notes: email.subject,
        email_id: email.id,
        email_subject: email.subject,
        email_from: email.from,
        confidence: "low" as const,
      };
    });
}
