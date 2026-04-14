import { NextRequest, NextResponse } from "next/server";

// AI features powered by Anthropic Claude API
// Set ANTHROPIC_API_KEY in Vercel env vars

export async function POST(req: NextRequest) {
  const { type, context } = await req.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    // Fallback: return pre-built responses when no API key
    return NextResponse.json(getFallbackResponse(type, context));
  }

  try {
    const systemPrompt = getSystemPrompt(type);
    const userMessage = getUserMessage(type, context);

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!res.ok) {
      return NextResponse.json(getFallbackResponse(type, context));
    }

    const data = await res.json();
    const text = data.content?.[0]?.text || "";
    return NextResponse.json({ result: text });
  } catch {
    return NextResponse.json(getFallbackResponse(type, context));
  }
}

function getSystemPrompt(type: string): string {
  switch (type) {
    case "negotiate":
      return "You are an expert creator economy negotiation coach. Analyze brand offers and provide specific, actionable counter-offer advice. Include exact dollar amounts, specific language to use, and what leverage points the creator has. Be direct and practical.";
    case "rate_suggestion":
      return "You are a creator rate consultant. Based on platform stats, suggest specific rates for different content types. Explain your reasoning briefly. Be specific with dollar amounts.";
    case "contract_review":
      return "You are a contract analyst for creator deals. Identify red flags, unfavorable terms, and suggest specific counter-clauses. Be practical and specific.";
    case "pitch":
      return "You are a brand outreach specialist for content creators. Write a personalized, compelling pitch email to a brand. Keep it under 150 words, professional but warm.";
    default:
      return "You are a helpful assistant for content creators and their agencies.";
  }
}

function getUserMessage(type: string, context: Record<string, string>): string {
  switch (type) {
    case "negotiate":
      return `A creator with ${context.followers || "unknown"} followers and ${context.engagement || "unknown"}% engagement received this brand offer:\n\n${context.offer}\n\nThe creator's usual rate is ${context.usual_rate || "unknown"}. Analyze this offer and provide:\n1. Is this offer fair? (above/below/at market)\n2. Specific counter-offer with exact numbers\n3. Script they can copy-paste to respond\n4. What leverage they have`;
    case "rate_suggestion":
      return `Creator stats:\n- Platform: ${context.platform}\n- Followers: ${context.followers}\n- Engagement rate: ${context.engagement}%\n- Niche: ${context.niche}\n- Content type: ${context.content_type}\n\nSuggest a specific rate range and explain why.`;
    case "pitch":
      return `Write a pitch email from a creator to ${context.brand}.\nCreator: ${context.creator_name}, ${context.followers} followers, ${context.niche} niche.\nWhat they want: ${context.goal}`;
    default:
      return context.message || "";
  }
}

function getFallbackResponse(type: string, context: Record<string, string>) {
  switch (type) {
    case "negotiate":
      return {
        result: `**Offer Analysis**\n\nBased on industry benchmarks, this offer appears to be slightly below market rate for a creator with your engagement level.\n\n**Recommended Counter:**\nIncrease the base rate by 25-40%. If they're offering $${context.offer_amount || "X"}, counter with $${Math.round((parseInt(context.offer_amount) || 1000) * 1.35)}.\n\n**Script:**\n"Thank you for this opportunity! I'm excited about working with [brand]. Based on my current rates and the deliverables requested, I'd like to propose $${Math.round((parseInt(context.offer_amount) || 1000) * 1.35)} for this package. This reflects the value of my engaged audience and the production quality I deliver. I'm happy to discuss the details — looking forward to making this work!"\n\n**Your leverage:**\n• Your engagement rate is above average\n• The brand reached out to you (they want you specifically)\n• Multi-platform content has higher value`,
      };
    case "rate_suggestion":
      return {
        result: `Based on ${context.followers || "your"} followers with ${context.engagement || "average"}% engagement on ${context.platform || "social media"}, your recommended rate range is:\n\n• UGC Video: $${Math.round((parseInt(context.followers) || 50000) * 0.008)}-$${Math.round((parseInt(context.followers) || 50000) * 0.015)}\n• Instagram Reel: $${Math.round((parseInt(context.followers) || 50000) * 0.012)}-$${Math.round((parseInt(context.followers) || 50000) * 0.022)}\n• TikTok: $${Math.round((parseInt(context.followers) || 50000) * 0.01)}-$${Math.round((parseInt(context.followers) || 50000) * 0.018)}\n\nYour engagement is a key differentiator — brands pay a premium for engaged audiences.`,
      };
    default:
      return { result: "AI feature is available when ANTHROPIC_API_KEY is configured." };
  }
}
