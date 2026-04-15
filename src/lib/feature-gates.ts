// Feature gates based on account tier
// Free: 3 deals max, limited features
// UGC ($27/mo): core creator tools
// Influencer ($39/mo): everything in UGC + advanced analytics, forecasting, tax export, brand radar

export type AccountTier = "free" | "ugc" | "ugc_influencer" | "agency";

export interface FeatureGate {
  id: string;
  name: string;
  requiredTier: AccountTier[];
  description: string;
}

// Free tier limits
export const FREE_TIER_DEAL_LIMIT = 3;

// Features blocked from free tier
const FREE_BLOCKED_FEATURES = ["tasks", "content-calendar", "audience", "forecast", "tax-export", "brand-radar", "ai-features"];

// Check if a paid user's subscription is actually active
export function isSubscriptionActive(profile: { account_type?: string; subscription_status?: string | null } | null | undefined): boolean {
  if (!profile) return false;
  // Free tier is always "active" (no subscription needed)
  if (profile.account_type === "free") return true;
  // Paid tiers need active or trialing subscription
  return profile.subscription_status === "active" || profile.subscription_status === "trialing";
}

// Check if paid tier needs to go through checkout
export function needsCheckout(profile: { account_type?: string; subscription_status?: string | null } | null | undefined): boolean {
  if (!profile) return false;
  if (profile.account_type === "free") return false;
  // Paid tier without active subscription
  return profile.subscription_status !== "active" && profile.subscription_status !== "trialing";
}

// Features available to all creator tiers (free, ugc, ugc_influencer)
const CORE_FEATURES = ["deals", "tasks", "contracts", "invoices", "income", "inbox", "content-calendar", "rate-calculator", "media-kit", "integrations", "settings", "help-center", "inbound"];

// Features only available to Influencer tier and above
const INFLUENCER_FEATURES = ["audience", "forecast", "tax-export", "brand-radar"];

export function hasFeatureAccess(accountType: string | undefined, feature: string): boolean {
  if (!accountType) return false;

  // Agency has access to everything (they use their own dashboard)
  if (accountType === "agency") return true;

  // Free tier is blocked from many features
  if (accountType === "free") {
    if (FREE_BLOCKED_FEATURES.includes(feature)) return false;
  }

  // Core features available to all creator tiers
  if (CORE_FEATURES.includes(feature)) return true;

  // Influencer-only features
  if (INFLUENCER_FEATURES.includes(feature)) {
    return accountType === "ugc_influencer";
  }

  // Default: allow
  return true;
}

export function getUpgradeMessage(feature: string): string {
  const messages: Record<string, string> = {
    "audience": "Audience Analytics is available on the Influencer plan. Upgrade to see demographics, engagement trends, and audience insights.",
    "forecast": "Revenue Forecasting is available on the Influencer plan. Upgrade to project future income based on your pipeline.",
    "tax-export": "Tax Export is available on the Influencer plan. Upgrade to generate tax-ready income reports.",
    "brand-radar": "Brand Radar is available on the Influencer plan. Upgrade to discover brands hiring creators in your niche.",
    "tasks": "Task Management is available on the UGC plan. Upgrade to track deliverables, deadlines, and action items.",
    "content-calendar": "Content Calendar is available on the UGC plan. Upgrade to plan your content and track sponsor tolerance.",
    "ai-features": "AI features are available on the UGC plan. Upgrade to unlock AI contract review, deal scanner, and negotiation coach.",
  };
  return messages[feature] || "This feature requires an upgraded plan.";
}

// Nav links for creator accounts, filtered by tier
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

  // Free tier: show blocked features as nav links too (they'll see upgrade prompts when clicking)
  if (accountType === "free") {
    return allLinks.filter(link => ["dashboard", "deals", "invoices", "income", "inbox", "rate-calculator", "contracts"].includes(link.feature));
  }

  return allLinks.filter(link => hasFeatureAccess(accountType, link.feature));
}
