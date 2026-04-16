// Feature gates based on account tier
//
// Plan matrix (matches /pricing):
//   Free        — 3 deals, view-only contracts, basic invoices, inbound form, settings
//   UGC ($27)   — unlimited deals, AI features, media kit, rate calculator, brand radar,
//                  tasks, content calendar, integrations (Gmail/Calendar/DocuSign), income tracking
//   Influencer  — everything in UGC plus exclusivity manager, audience, forecast, tax export
//   ($39)
//   Agency      — agency-only dashboard, not a creator tier

export type AccountTier = "free" | "ugc" | "ugc_influencer" | "agency";

// Free tier has a hard deal limit — see DealsPage for enforcement.
export const FREE_TIER_DEAL_LIMIT = 3;

// ─── Feature sets ────────────────────────────────────────────────────────
// Features available on Free (bare minimum — keeps the account usable but
// locks everything that makes it worth paying for).
const FREE_FEATURES = new Set([
  "dashboard",
  "deals",            // capped at 3 via FREE_TIER_DEAL_LIMIT
  "contracts",        // view/upload only — AI analysis is gated separately
  "invoices",         // basic — no auto-reminders
  "inbox",            // inbound messages
  "inbound",          // inbound form
  "settings",
  "help-center",
]);

// Features that UGC adds on top of Free.
const UGC_ADDITIONS = new Set([
  "tasks",
  "content-calendar",
  "media-kit",
  "rate-calculator",
  "brand-radar",
  "ai-features",      // ai-negotiator, contract review, Gmail deal scanner
  "integrations",     // Gmail, Google Calendar, DocuSign
  "income",           // affiliate link + Stan Store tracking
  "import",           // CSV import
  "automations",      // email automations
  "briefs",           // content brief inbox
]);

// Features that UGC+Influencer adds on top of UGC.
const INFLUENCER_ADDITIONS = new Set([
  "audience",
  "forecast",
  "tax-export",
  "exclusivity",
  "campaign-recaps",
  "sponsor-tolerance",
]);

// ─── Tier checks ────────────────────────────────────────────────────────

/**
 * Returns the minimum tier required for a given feature.
 * null means "Free has access".
 */
export function minTierFor(feature: string): AccountTier | null {
  if (FREE_FEATURES.has(feature)) return null;
  if (UGC_ADDITIONS.has(feature)) return "ugc";
  if (INFLUENCER_ADDITIONS.has(feature)) return "ugc_influencer";
  return null; // unknown feature → allow (don't break on typos)
}

/**
 * True if the account tier has access to a feature.
 * Agency users have access to everything (they use a separate dashboard).
 */
export function hasFeatureAccess(accountType: string | undefined, feature: string): boolean {
  if (!accountType) return false;
  if (accountType === "agency") return true;

  if (FREE_FEATURES.has(feature)) return true;

  if (UGC_ADDITIONS.has(feature)) {
    return accountType === "ugc" || accountType === "ugc_influencer";
  }

  if (INFLUENCER_ADDITIONS.has(feature)) {
    return accountType === "ugc_influencer";
  }

  // Unknown feature — default allow so typos don't accidentally lock users out.
  return true;
}

/**
 * Check if a paid user's subscription is actually active.
 * Free tier is always considered "active".
 */
export function isSubscriptionActive(
  profile: { account_type?: string; subscription_status?: string | null } | null | undefined
): boolean {
  if (!profile) return false;
  if (profile.account_type === "free") return true;
  return profile.subscription_status === "active" || profile.subscription_status === "trialing";
}

/**
 * Returns true if the user is on a paid tier but hasn't actually paid.
 * Used by SubscriptionGate to redirect them to /checkout.
 */
export function needsCheckout(
  profile: { account_type?: string; subscription_status?: string | null } | null | undefined
): boolean {
  if (!profile) return false;
  if (profile.account_type === "free") return false;
  return profile.subscription_status !== "active" && profile.subscription_status !== "trialing";
}

// ─── Upgrade messaging ───────────────────────────────────────────────────

/**
 * Returns display metadata for the cheapest plan that unlocks a feature,
 * used by UpgradeGate so it shows "Upgrade to UGC $27" (not "$39") when
 * that's all the user needs.
 */
export function getUpgradeTargetFor(feature: string): {
  tier: "ugc" | "ugc_influencer";
  tierName: string;
  price: string;
  planSlug: "ugc" | "ugc_influencer";
} {
  const minTier = minTierFor(feature);
  if (minTier === "ugc_influencer") {
    return {
      tier: "ugc_influencer",
      tierName: "UGC + Influencer",
      price: "$39/mo",
      planSlug: "ugc_influencer",
    };
  }
  // Default to UGC (the cheapest paid tier) for Free-locked features.
  return {
    tier: "ugc",
    tierName: "UGC Creator",
    price: "$27/mo",
    planSlug: "ugc",
  };
}

export function getUpgradeMessage(feature: string): string {
  const messages: Record<string, string> = {
    // Influencer-only features
    "audience": "Audience Analytics is available on the Influencer plan. Upgrade to see demographics, engagement trends, and audience insights.",
    "forecast": "Revenue Forecasting is available on the Influencer plan. Upgrade to project future income based on your pipeline.",
    "tax-export": "Tax Export is available on the Influencer plan. Upgrade to generate tax-ready income reports.",
    "exclusivity": "Exclusivity Manager is available on the Influencer plan. Track category-level exclusivity windows across brands.",
    "campaign-recaps": "Campaign Recaps are available on the Influencer plan. Auto-generate performance summaries after campaigns end.",
    "sponsor-tolerance": "Sponsor Tolerance is available on the Influencer plan. Track how often each brand sponsors you to avoid audience fatigue.",

    // UGC-and-above features (locked on Free)
    "tasks": "Task Management is available on the UGC plan. Upgrade to track deliverables, deadlines, and action items.",
    "content-calendar": "Content Calendar is available on the UGC plan. Upgrade to plan your content and track sponsor tolerance.",
    "ai-features": "AI features are available on the UGC plan. Upgrade to unlock AI contract review, deal scanner, and negotiation coach.",
    "media-kit": "Media Kit builder is available on the UGC plan. Upgrade to create a shareable profile that attracts brands.",
    "rate-calculator": "Rate Calculator is available on the UGC plan. Upgrade to find out what you should be charging.",
    "brand-radar": "Brand Radar is available on the UGC plan. Upgrade to discover brands hiring creators in your niche.",
    "integrations": "Integrations (Gmail, Calendar, DocuSign) are available on the UGC plan. Upgrade to connect your tools.",
    "income": "Income tracking (affiliate links, Stan Store) is available on the UGC plan. Upgrade to see all your revenue in one place.",
    "import": "CSV import is available on the UGC plan. Upgrade to bulk-import deals and contacts.",
    "automations": "Automations are available on the UGC plan. Upgrade to set up recurring reminders and follow-ups.",
    "briefs": "Content Briefs is available on the UGC plan. Upgrade to receive briefs from brands and submit drafts for review.",
  };
  return messages[feature] || "This feature requires an upgraded plan.";
}

// ─── Navigation ──────────────────────────────────────────────────────────

/**
 * Nav links for creator accounts, filtered by tier.
 * Free users see a reduced set; UGC adds the middle block; Influencer adds the top.
 */
export function getCreatorNavLinks(accountType: string | undefined) {
  const allLinks = [
    { name: "Today", href: "/dashboard", feature: "dashboard" },
    { name: "Deals", href: "/deals", feature: "deals" },
    { name: "Tasks", href: "/tasks", feature: "tasks" },
    { name: "Contracts", href: "/contracts", feature: "contracts" },
    { name: "Invoices", href: "/invoices", feature: "invoices" },
    { name: "Income", href: "/income", feature: "income" },
    { name: "Inbox", href: "/inbox", feature: "inbox" },
    { name: "Calendar", href: "/content-calendar", feature: "content-calendar" },
    { name: "Audience", href: "/audience", feature: "audience" },
    { name: "Forecast", href: "/forecast", feature: "forecast" },
    { name: "Tax Export", href: "/tax-export", feature: "tax-export" },
    { name: "Tools", href: "/rate-calculator", feature: "rate-calculator" },
  ];

  return allLinks.filter((link) => hasFeatureAccess(accountType, link.feature));
}
