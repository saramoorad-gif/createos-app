import { NextRequest, NextResponse } from "next/server";
import { requireFeature } from "@/lib/require-tier";

// AI features powered by Anthropic Claude API
// Set ANTHROPIC_API_KEY in Vercel env vars

export async function POST(req: NextRequest) {
  // Gate: AI features are UGC-and-up only.
  const check = await requireFeature(req, "ai-features");
  if (!check.ok) {
    return NextResponse.json({ error: check.error, hint: check.hint }, { status: check.status });
  }

  const { type, context } = await req.json();
  const apiKey = (process.env.ANTHROPIC_API_KEY || "").trim();

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
    case "dashboard_insight":
      return "You are a business advisor for content creators. Give a brief (2-3 sentence) personalized daily insight based on their stats. Include one specific, actionable tip. Be motivational but practical. Reference their actual numbers.";
    case "brand_match":
      return `You are a creator-economy matchmaker. Given a creator's niche, platforms, follower counts, and recent brand history, suggest 10 real brands they should pitch. For each brand return JSON only — no prose:
{
  "matches": [
    {
      "brand": "Brand Name",
      "category": "Beauty | Fashion | Tech | Food | Fitness | Lifestyle | Travel | Finance | Health | Other",
      "match_score": 1-100,
      "why": "One sentence on why this brand fits this creator.",
      "pitch_angle": "One sentence on how to open the pitch."
    }
  ]
}
Pick brands that actively partner with creators at the creator's size, spread across categories relevant to their niche, and avoid brands they already have deals with. Never invent brands that don't exist.`;
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
    case "brand_match":
      return `Creator profile:\n- Niche: ${context.niche || "general lifestyle"}\n- Content style: ${context.content_style || "unspecified"}\n- TikTok: ${context.tiktok_followers || "0"} followers (${context.tiktok_handle || "none"})\n- Instagram: ${context.instagram_followers || "0"} followers (${context.instagram_handle || "none"})\n- YouTube: ${context.youtube_followers || "0"} followers (${context.youtube_handle || "none"})\n- Engagement rate: ${context.engagement_rate || "unknown"}%\n- Brands they've worked with recently: ${context.recent_brands || "none"}\n\nReturn the JSON match list now.`;
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
    case "dashboard_insight":
      return { result: "Your creator business is growing! Focus on following up with active deals this week, and check your invoices for any overdue payments. Consistency is key — keep delivering great work and the pipeline will grow." };
    case "brand_match":
      // Fallback brand suggestions if the Anthropic API is unreachable.
      return {
        result: JSON.stringify({
          matches: [
            { brand: "Glossier", category: "Beauty", match_score: 82, why: "Active on TikTok and Instagram with creator-first campaigns.", pitch_angle: "Lead with a product you already use and love." },
            { brand: "Gymshark", category: "Fitness", match_score: 76, why: "Runs a large creator program with flexible commission tiers.", pitch_angle: "Share a specific fitness goal you're working toward." },
            { brand: "Glow Recipe", category: "Beauty", match_score: 78, why: "Routinely partners with micro-influencers in the skincare space.", pitch_angle: "Demonstrate the product in a 'get ready with me' format." },
            { brand: "Vuori", category: "Fashion", match_score: 71, why: "Strong UGC program with lifestyle and activewear creators.", pitch_angle: "Showcase how the clothing fits into your daily routine." },
            { brand: "Athletic Greens (AG1)", category: "Health", match_score: 68, why: "High-paying creator deals, often long-term.", pitch_angle: "Talk about your morning routine and wellness habits." },
            { brand: "Notion", category: "Tech", match_score: 65, why: "Creator-focused workflow tools with generous partnership programs.", pitch_angle: "Show a template that solves a real problem for your audience." },
            { brand: "Fenty Beauty", category: "Beauty", match_score: 74, why: "Inclusive creator roster, active UGC partnerships.", pitch_angle: "Focus on shade-range storytelling in your content." },
            { brand: "Alo Yoga", category: "Fitness", match_score: 69, why: "Consistent influencer program across tiers.", pitch_angle: "Highlight the studio-to-street wearability of their pieces." },
            { brand: "HelloFresh", category: "Food", match_score: 62, why: "Runs extensive creator acquisition campaigns with clear CPA.", pitch_angle: "Pitch a specific week-of-meals format your audience would enjoy." },
            { brand: "Rare Beauty", category: "Beauty", match_score: 75, why: "Selena Gomez brand with a strong creator economy focus.", pitch_angle: "Tie in mental-health or self-care messaging." },
          ],
        }),
      };
    default:
      return { result: "AI feature is available when ANTHROPIC_API_KEY is configured." };
  }
}
