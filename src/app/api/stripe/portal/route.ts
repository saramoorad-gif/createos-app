import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { stripe, isStripeConfigured } from "@/lib/stripe";

/**
 * POST /api/stripe/portal
 *
 * Opens a Stripe billing-portal session for the authenticated user.
 *
 * Security: previously the route accepted `customerId` from the
 * request body and would create a portal session for whatever ID was
 * supplied — letting any signed-in user open another user's billing
 * portal. The customer ID is now derived from the authenticated
 * profile; the body field is ignored.
 */
export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const sb = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error: authErr } = await sb.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Look up the user's own stripe_customer_id (RLS guarantees they
  // can only read their own profile).
  const { data: profile } = await sb
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  const customerId = (profile as any)?.stripe_customer_id as string | null;
  if (!customerId) {
    return NextResponse.json(
      { error: "No Stripe customer on this account. Subscribe first to manage billing." },
      { status: 400 }
    );
  }

  try {
    const { returnUrl } = await req.json().catch(() => ({}));
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${req.nextUrl.origin}/settings`,
    });
    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
