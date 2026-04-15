// Feature gates based on account tier
// UGC ($27/mo): core creator tools
// Influencer ($39/mo): everything in UGC + advanced analytics, forecasting, tax export, brand radar

export type AccountTier = "free" | "ugc" | "ugc_influencer" | "agency";

export interface FeatureGate {
  id: string;
  name: string;
  requiredTier: AccountTier[];
  description: string;
}

// Features available to all creator tiers (free, ugc, ugc_influencer)
const CORE_FEATURES = ["deals", "tasks", "contracts", "invoices", "income", "inbox", "content-calendar", "rate-calculator", "media-kit", "integrations", "settings", "help-center", "inbound"];

// Features only available to Influencer tier and above
const INFLUENCER_FEATURES = ["audience", "forecast", "tax-export", "brand-radar"];

export function hasFeatureAccess(accountType: string | undefined, feature: string): boolean {
  if (!accountType) return false;

  // Agency has access to everything (they use their own dashboard)
  if (accountType === "agency") return true;

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
  };
  return messages[feature] || "This feature is available on the Influencer plan.";
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

  return allLinks.filter(link => hasFeatureAccess(accountType, link.feature));
}
