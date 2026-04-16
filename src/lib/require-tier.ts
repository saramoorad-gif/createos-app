import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hasFeatureAccess, isSubscriptionActive } from "@/lib/feature-gates";

export type TierCheckResult =
  | { ok: true; userId: string; accountType: string }
  | { ok: false; status: number; error: string; hint?: string };

/**
 * Server-side guard: call from an API route to verify the caller is
 * authenticated AND has access to a given feature (based on their
 * account_type AND subscription_status).
 *
 * Usage:
 *   const check = await requireFeature(req, "ai-features");
 *   if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
 */
export async function requireFeature(
  req: NextRequest,
  feature: string
): Promise<TierCheckResult> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const sb = createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim(),
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: authErr } = await sb.auth.getUser();
  if (authErr || !user) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const { data: profile, error: profileErr } = await sb
    .from("profiles")
    .select("account_type, subscription_status")
    .eq("id", user.id)
    .single();

  if (profileErr || !profile) {
    return { ok: false, status: 404, error: "Profile not found" };
  }

  // Check subscription is active for paid tiers
  if (!isSubscriptionActive(profile)) {
    return {
      ok: false,
      status: 402,
      error: "Subscription inactive",
      hint: "Please complete checkout before using this feature.",
    };
  }

  // Check feature gate
  if (!hasFeatureAccess(profile.account_type, feature)) {
    return {
      ok: false,
      status: 403,
      error: "Feature not available on your plan",
      hint: "Upgrade your plan at /pricing to unlock this feature.",
    };
  }

  return { ok: true, userId: user.id, accountType: profile.account_type };
}
