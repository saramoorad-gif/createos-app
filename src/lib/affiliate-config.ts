/**
 * Affiliate program configuration — single source of truth.
 *
 * Change these values here, not scattered across API routes.
 * Referenced by: webhook commission logic, cron payout job,
 * checkout discount, dashboard UI, marketing pages.
 */

export const AFFILIATE_CONFIG = {
  /** Commission rate as a decimal (0.15 = 15%) */
  COMMISSION_PERCENT: 0.15,

  /** How many months commissions are paid per referral */
  COMMISSION_DURATION_MONTHS: 12,

  /** Days to hold a commission before it becomes payable (refund window) */
  REFUND_HOLD_DAYS: 30,

  /** Minimum payout in cents ($50.00) */
  MIN_PAYOUT_CENTS: 5000,

  /** Day of month payouts are processed (1-28) */
  PAYOUT_DAY_OF_MONTH: 15,

  /** Discount for referred users on their first month, in cents ($12.00) */
  FOLLOWER_DISCOUNT_CENTS: 1200,

  /** Attribution cookie name */
  COOKIE_NAME: "cs_ref",

  /** Attribution cookie lifetime in days */
  COOKIE_WINDOW_DAYS: 30,

  /** Stripe coupon ID for the $12 month-1 discount */
  STRIPE_COUPON_ID: "creator-referral-12off",

  /** Which plan tiers are eligible for affiliate commissions */
  ELIGIBLE_TIERS: ["ugc_influencer"] as readonly string[],

  /** Which Stripe price keys earn commissions */
  ELIGIBLE_PRICE_KEYS: [
    "ugc_influencer_monthly",
    "ugc_influencer_annual",
  ] as readonly string[],

  /** Promo code format: 4-20 chars, uppercase alphanumeric */
  PROMO_CODE_REGEX: /^[A-Z0-9]{4,20}$/,

  /** Full monthly price of the eligible tier, in cents (for earnings estimates) */
  PROMO_PLAN_PRICE_CENTS: 3900,

  /** First-month price after discount, in cents */
  PROMO_FIRST_MONTH_PRICE_CENTS: 2700,
} as const;

/** Estimated year-1 earnings per subscriber (for marketing copy) */
export const ESTIMATED_YEAR1_EARNINGS_CENTS = Math.round(
  AFFILIATE_CONFIG.PROMO_FIRST_MONTH_PRICE_CENTS * AFFILIATE_CONFIG.COMMISSION_PERCENT +
  AFFILIATE_CONFIG.PROMO_PLAN_PRICE_CENTS * AFFILIATE_CONFIG.COMMISSION_PERCENT * 11
); // ≈ $68.40 → 6840 cents
