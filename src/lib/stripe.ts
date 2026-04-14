import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion,
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
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
