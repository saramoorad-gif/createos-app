import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authenticateApiKey } from "@/lib/api-keys";

/**
 * GET /api/v1/deals
 *
 * Returns deals owned by the API-key holder. Pagination is via
 * ?cursor=<created_at_iso>&limit=<n>. Default limit 100, max 500.
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

  const limitRaw = parseInt(req.nextUrl.searchParams.get("limit") || "100", 10);
  const limit = Math.min(Math.max(1, isNaN(limitRaw) ? 100 : limitRaw), 500);
  const cursor = req.nextUrl.searchParams.get("cursor");

  const sb = createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
    (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim()
  );

  let query = sb
    .from("deals")
    .select("id, brand_name, stage, value, deliverables, platform, due_date, created_at, notes")
    .or(`user_id.eq.${auth.ownerId},creator_id.eq.${auth.ownerId},agency_id.eq.${auth.ownerId}`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) query = query.lt("created_at", cursor);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const next_cursor = data && data.length === limit ? (data[data.length - 1] as any).created_at : null;
  return NextResponse.json({ data, next_cursor });
}
