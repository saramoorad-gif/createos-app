// Feature gates based on account tier + agency plan.
//
// Plan matrix (matches /pricing):
//   Free                    — 3 deals, view-only contracts, basic invoices, inbound, settings
//   UGC ($27)               — unlimited deals, AI features, media kit, rate calculator,
//                             brand radar, tasks, content calendar, integrations
//                             (Gmail/Calendar), income tracking
//   Influencer ($39)        — everything in UGC plus exclusivity manager, audience,
//                             forecast, tax export, sponsor tolerance, campaign recaps
//   Agency Starter ($149)   — agency dashboard, roster (≤15), campaigns, commissions,
//                             conflict detection, internal messaging, contract templates,
//                             saved brand reports
//   Agency Growth ($249)    — everything in Starter plus roster (≤40), team RBAC,
//                             scheduled custom reports, public API access, SSO/SAML
//
// Agency tier checks read both `account_type` and `agency_plan`. The Stripe
// webhook is responsible for setting both — see api/stripe/webhook/route.ts.

export type AccountTier = "free" | "ugc" | "ugc_influencer" | "agency";
export type AgencyPlan = "starter" | "growth" | null | undefined;

// Free tier has a hard deal limit — see DealsPage for enforcement.
export const FREE_TIER_DEAL_LIMIT = 3;

// Roster size caps per agency plan. Enforced server-side in
// /api/agency/add-creator (see route handler).
export const AGENCY_ROSTER_LIMITS: Record<"starter" | "growth", number> = {
  starter: 15,
  growth: 40,
};

// ─── Feature sets ────────────────────────────────────────────────────────
const FREE_FEATURES = new Set([
  "dashboard",
  "deals",
  "contracts",
  "invoices",
  "inbox",
  "inbound",
  "settings",
  "help-center",
]);

const UGC_ADDITIONS = new Set([
  "tasks",
  "content-calendar",
  "media-kit",
  "rate-calculator",
  "brand-radar",
  "ai-features",
  "integrations",
  "income",
  "import",
  "automations",
  "briefs",
]);

const INFLUENCER_ADDITIONS = new Set([
  "audience",
  "forecast",
  "tax-export",
  "exclusivity",
  "campaign-recaps",
  "sponsor-tolerance",
]);

// Features that ANY agency plan unlocks. Bundled separately from creator
// features because agencies use a different dashboard.
const AGENCY_BASE_FEATURES = new Set([
  "agency-dashboard",
  "roster",
  "campaigns",
  "commissions",
  "conflicts",
  "agency-messaging",
  "contract-templates",
  "agency-reports",
  "brand-reports-saved", // saved brand-facing reports (PDF + share links)
]);

// Agency Growth ONLY. Starter does not unlock these.
const AGENCY_GROWTH_ONLY = new Set([
  "team-rbac",            // multi-seat agency team with role-based permissions
  "custom-reporting",     // scheduled email delivery of recurring reports
  "api-access",           // public REST API (api_keys + /api/v1/*)
  "sso",                  // SAML / SSO via IdP
]);

// ─── Tier checks ────────────────────────────────────────────────────────

export function minTierFor(feature: string): AccountTier | null {
  if (FREE_FEATURES.has(feature)) return null;
  if (UGC_ADDITIONS.has(feature)) return "ugc";
  if (INFLUENCER_ADDITIONS.has(feature)) return "ugc_influencer";
  if (AGENCY_BASE_FEATURES.has(feature) || AGENCY_GROWTH_ONLY.has(feature)) return "agency";
  return null;
}

/**
 * True if the account has access to a feature.
 * Agency-only features check both account_type AND agency_plan.
 */
export function hasFeatureAccess(
  accountType: string | undefined,
  feature: string,
  agencyPlan?: AgencyPlan
): boolean {
  if (!accountType) return false;

  // Agency-only features.
  if (AGENCY_GROWTH_ONLY.has(feature)) {
    // Growth-only features require agency_plan === "growth". Starter
    // accounts (and creators on a paid tier) do NOT get these.
    return accountType === "agency" && agencyPlan === "growth";
  }
  if (AGENCY_BASE_FEATURES.has(feature)) {
    return accountType === "agency";
  }

  // Creator features. Agency users get all of them too — the agency
  // dashboard is a separate UI, but if they hit a creator feature
  // (e.g., view a roster member's media kit) we don't block.
  if (accountType === "agency") return true;

  if (FREE_FEATURES.has(feature)) return true;

  if (UGC_ADDITIONS.has(feature)) {
    return accountType === "ugc" || accountType === "ugc_influencer";
  }

  if (INFLUENCER_ADDITIONS.has(feature)) {
    return accountType === "ugc_influencer";
  }

  return true;
}

export function isSubscriptionActive(
  profile: { account_type?: string; subscription_status?: string | null } | null | undefined
): boolean {
  if (!profile) return false;
  if (profile.account_type === "free") return true;
  return profile.subscription_status === "active" || profile.subscription_status === "trialing";
}

export function needsCheckout(
  profile: { account_type?: string; subscription_status?: string | null } | null | undefined
): boolean {
  if (!profile) return false;
  if (profile.account_type === "free") return false;
  return profile.subscription_status !== "active" && profile.subscription_status !== "trialing";
}

// ─── Upgrade messaging ───────────────────────────────────────────────────

export function getUpgradeTargetFor(feature: string): {
  tier: "ugc" | "ugc_influencer" | "agency_growth";
  tierName: string;
  price: string;
  planSlug: "ugc" | "ugc_influencer" | "agency_growth";
} {
  if (AGENCY_GROWTH_ONLY.has(feature)) {
    return {
      tier: "agency_growth",
      tierName: "Agency Growth",
      price: "$249/mo",
      planSlug: "agency_growth",
    };
  }
  const minTier = minTierFor(feature);
  if (minTier === "ugc_influencer") {
    return { tier: "ugc_influencer", tierName: "UGC + Influencer", price: "$39/mo", planSlug: "ugc_influencer" };
  }
  return { tier: "ugc", tierName: "UGC Creator", price: "$27/mo", planSlug: "ugc" };
}

export function getUpgradeMessage(feature: string): string {
  const messages: Record<string, string> = {
    // Influencer-only
    "audience": "Audience Analytics is available on the Influencer plan. Upgrade to see demographics, engagement trends, and audience insights.",
    "forecast": "Revenue Forecasting is available on the Influencer plan. Upgrade to project future income based on your pipeline.",
    "tax-export": "Tax Export is available on the Influencer plan. Upgrade to generate tax-ready income reports.",
    "exclusivity": "Exclusivity Manager is available on the Influencer plan. Track category-level exclusivity windows across brands.",
    "campaign-recaps": "Campaign Recaps are available on the Influencer plan. Auto-generate performance summaries after campaigns end.",
    "sponsor-tolerance": "Sponsor Tolerance is available on the Influencer plan. Track how often each brand sponsors you to avoid audience fatigue.",

    // UGC-and-above
    "tasks": "Task Management is available on the UGC plan. Upgrade to track deliverables, deadlines, and action items.",
    "content-calendar": "Content Calendar is available on the UGC plan. Upgrade to plan your content and track sponsor tolerance.",
    "ai-features": "AI features are available on the UGC plan. Upgrade to unlock AI contract review, deal scanner, and negotiation coach.",
    "media-kit": "Media Kit builder is available on the UGC plan. Upgrade to create a shareable profile that attracts brands.",
    "rate-calculator": "Rate Calculator is available on the UGC plan. Upgrade to find out what you should be charging.",
    "brand-radar": "Brand Radar is available on the UGC plan. Upgrade to discover brands hiring creators in your niche.",
    "integrations": "Integrations (Gmail, Calendar) are available on the UGC plan. Upgrade to connect your tools.",
    "income": "Income tracking (affiliate links, Stan Store) is available on the UGC plan. Upgrade to see all your revenue in one place.",
    "import": "CSV import is available on the UGC plan. Upgrade to bulk-import deals and contacts.",
    "automations": "Automations are available on the UGC plan. Upgrade to set up recurring reminders and follow-ups.",
    "briefs": "Content Briefs is available on the UGC plan. Upgrade to receive briefs from brands and submit drafts for review.",

    // Agency Growth-only
    "team-rbac": "Team Roles & Permissions are available on Agency Growth. Add managers and assistants with scoped access.",
    "custom-reporting": "Scheduled Custom Reports are available on Agency Growth. Email weekly P&L and roster summaries automatically.",
    "api-access": "API Access is available on Agency Growth. Generate keys and pull deals, commissions, and roster data programmatically.",
    "sso": "SSO / SAML is available on Agency Growth. Authenticate your team through Okta, Google Workspace, or any SAML 2.0 IdP.",
  };
  return messages[feature] || "This feature requires an upgraded plan.";
}

// ─── Navigation ──────────────────────────────────────────────────────────

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
