import Stripe from "stripe";

// Lazy-init so env-var issues surface inside the request handler (with useful
// error messages) instead of breaking at cold-start in an opaque way.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = (process.env.STRIPE_SECRET_KEY || "").trim();
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to your Vercel project environment variables."
    );
  }
  if (!key.startsWith("sk_")) {
    throw new Error(
      `STRIPE_SECRET_KEY looks invalid — it should start with "sk_test_" or "sk_live_". Got: ${key.slice(0, 6)}...`
    );
  }
  _stripe = new Stripe(key, {
    // @ts-expect-error — API version is valid, types may lag behind
    apiVersion: "2024-12-18.acacia",
    // Retry transient network errors before giving up, but only twice so
    // cold-start requests don't time out Vercel's 10s limit.
    maxNetworkRetries: 2,
    timeout: 20000,
  });
  return _stripe;
}

// Backwards-compat export so existing `import { stripe }` callers keep working.
// Using a Proxy defers init until first property access.
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop: string | symbol) {
    const s = getStripe() as any;
    const value = s[prop];
    return typeof value === "function" ? value.bind(s) : value;
  },
});

// Price IDs — create these in Stripe Dashboard or via API
// Set these as env vars in Vercel after creating products
export const PRICE_IDS = {
  free: null, // no Stripe price for free tier
  ugc_monthly: process.env.STRIPE_PRICE_UGC_MONTHLY || "",
  ugc_annual: process.env.STRIPE_PRICE_UGC_ANNUAL || "",
  ugc_influencer_monthly: process.env.STRIPE_PRICE_INFLUENCER_MONTHLY || "",
  ugc_influencer_annual: process.env.STRIPE_PRICE_INFLUENCER_ANNUAL || "",
  agency_starter_monthly: process.env.STRIPE_PRICE_AGENCY_STARTER_MONTHLY || "",
  agency_starter_annual: process.env.STRIPE_PRICE_AGENCY_STARTER_ANNUAL || "",
  agency_growth_monthly: process.env.STRIPE_PRICE_AGENCY_GROWTH_MONTHLY || "",
  agency_growth_annual: process.env.STRIPE_PRICE_AGENCY_GROWTH_ANNUAL || "",
};

export function isStripeConfigured(): boolean {
  const key = (process.env.STRIPE_SECRET_KEY || "").trim();
  return key.startsWith("sk_");
}
