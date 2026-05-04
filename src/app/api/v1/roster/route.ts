import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authenticateApiKey } from "@/lib/api-keys";

/**
 * GET /api/v1/roster
 *
 * Returns the agency's roster — one row per linked creator with
 * their commission rate and basic profile fields.
 *
 * Auth: Bearer <cs_live_…> API key (Growth-only).
 */
export async function GET(req: NextRequest) {
  const auth = await authenticateApiKey(req.headers.get("authorization"));
  if (!auth.ok) {
    const status = auth.reason === "tier" ? 403 : 401;
    return NextResponse.json(
      { error: auth.reason === "tier" ? "API access requires Agency Growth" : "Invalid or revoked API key" },
      { status }
    );
  }

  const sb = createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
    (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim()
  );

  const { data, error } = await sb
    .from("agency_creator_links")
    .select("creator_id, commission_rate, status, joined_at")
    .eq("agency_id", auth.ownerId)
    .order("joined_at", { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
