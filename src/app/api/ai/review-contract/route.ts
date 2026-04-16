import { NextRequest, NextResponse } from "next/server";

// AI-powered contract review — analyzes contract text and flags issues

export async function POST(req: NextRequest) {
  const { contractText, creatorName } = await req.json();
  if (!contractText) return NextResponse.json({ error: "No contract text" }, { status: 400 });

  const apiKey = (process.env.ANTHROPIC_API_KEY || "").trim();
  if (!apiKey) {
    return NextResponse.json({ analysis: getFallbackAnalysis() });
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: `You are a contract analyst AI for Create Suite, a platform for UGC creators and influencers. Analyze contracts from the CREATOR'S perspective. Your job is to protect the creator.

Return a JSON object with:
{
  "overall_score": "Favorable" | "Neutral" | "Needs Negotiation" | "Creator Unfavorable",
  "summary": "1-2 sentence summary of the deal",
  "payment": { "amount": "$X", "terms": "description", "flag": "green|yellow|red", "note": "explanation" },
  "usage_rights": { "scope": "description", "duration": "X months/perpetual", "flag": "green|yellow|red", "note": "explanation" },
  "exclusivity": { "exists": true/false, "category": "category or N/A", "duration": "X days/months or N/A", "flag": "green|yellow|red", "note": "explanation" },
  "red_flags": ["list of serious concerns"],
  "yellow_flags": ["list of minor concerns"],
  "green_flags": ["list of creator-friendly terms"],
  "missing_clauses": ["important clauses that should be added"],
  "negotiation_tips": ["specific suggestions to improve the deal"],
  "kill_fee": { "exists": true/false, "amount": "$X or N/A", "flag": "green|yellow|red" },
  "revision_limit": { "exists": true/false, "count": "X or unlimited", "flag": "green|yellow|red" },
  "estimated_value": "fair market assessment"
}

Return ONLY valid JSON.`,
        messages: [{ role: "user", content: `Review this contract for creator ${creatorName || "the creator"}:\n\n${contractText}` }],
      }),
    });

    if (!res.ok) return NextResponse.json({ analysis: getFallbackAnalysis() });

    const data = await res.json();
    const text = data.content?.[0]?.text || "";

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ analysis });
      }
    } catch {}

    return NextResponse.json({ analysis: getFallbackAnalysis() });
  } catch {
    return NextResponse.json({ analysis: getFallbackAnalysis() });
  }
}

function getFallbackAnalysis() {
  return {
    overall_score: "Neutral",
    summary: "AI analysis requires an API key. Please add ANTHROPIC_API_KEY to enable contract review.",
    payment: { amount: "Unknown", terms: "Review manually", flag: "yellow", note: "Could not analyze" },
    usage_rights: { scope: "Unknown", duration: "Unknown", flag: "yellow", note: "Review manually" },
    exclusivity: { exists: false, category: "N/A", duration: "N/A", flag: "green", note: "None detected" },
    red_flags: ["Unable to perform AI analysis — review manually"],
    yellow_flags: [],
    green_flags: [],
    missing_clauses: ["Kill fee clause", "Revision limit", "Content approval timeline"],
    negotiation_tips: ["Always negotiate payment terms NET-30 or less", "Request usage rights time limit"],
    kill_fee: { exists: false, amount: "N/A", flag: "yellow" },
    revision_limit: { exists: false, count: "Unknown", flag: "yellow" },
    estimated_value: "Unable to estimate",
  };
}
