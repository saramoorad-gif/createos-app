// Single source of truth for plan pricing used in non-Stripe contexts
// (admin MRR calc, signup tier cards, marketing pages).
//
// IMPORTANT: actual billing prices are configured in Stripe. These
// numbers are *display* / *reporting* only — keep them in sync with
// the Stripe price objects. If you change a Stripe price, change here
// too. (We don't fetch from Stripe live because the admin dashboard
// would otherwise need a Stripe round-trip on every page load.)

export const PLAN_PRICING_MONTHLY: Record<string, number> = {
  ugc: 27,
  ugc_influencer: 39,
  agency: 149,
  agency_starter: 149,
  agency_growth: 299,
};

export const PLAN_PRICING_ANNUAL_PER_MONTH: Record<string, number> = {
  ugc: 21,
  ugc_influencer: 31,
  agency: 119,
  agency_starter: 119,
  agency_growth: 239,
};

export function getMonthlyPrice(accountType: string | null | undefined): number {
  if (!accountType) return 0;
  return PLAN_PRICING_MONTHLY[accountType] ?? 0;
}
