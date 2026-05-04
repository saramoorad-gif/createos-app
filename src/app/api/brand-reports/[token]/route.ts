import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/brand-reports/<token>
 *
 * Public read — fetches a saved brand report by its share_token. No
 * auth required so an agency can paste the link in an email to a
 * brand partner. The token is 24 random bytes (192 bits), so guessing
 * one is infeasible. Anyone with the link can read; revoking access
 * means deleting the report (or rotating tokens, which we can add
 * later if anyone asks).
 */
export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const token = params?.token;
  if (!token || typeof token !== "string" || token.length < 24) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const sb = createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
    (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim()
  );

  const { data } = await sb
    .from("brand_reports")
    .select("title, kind, body, created_at")
    .eq("share_token", token)
    .single();

  if (!data) return NextResponse.json({ error: "Report not found" }, { status: 404 });
  return NextResponse.json({ report: data });
}
