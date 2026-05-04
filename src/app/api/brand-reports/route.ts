import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

/**
 * Brand Reports — saved snapshots an agency can share with brand partners.
 *
 * GET    /api/brand-reports        list reports owned by caller
 * POST   /api/brand-reports        save a new snapshot { title, body, kind }
 * DELETE /api/brand-reports?id=… delete a report (owner only)
 *
 * Each row has a long random `share_token` so the agency can hand out a
 * read-only public URL (`/r/<token>`) without exposing internal IDs or
 * forcing brand partners to authenticate. Tokens are server-generated;
 * they're not derived from the row id, so guessing one is infeasible.
 */

function getSb(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim(),
    { global: { headers: { Authorization: authHeader } } }
  );
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(req: NextRequest) {
  const sb = getSb(req);
  if (!sb) return unauthorized();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();

  const { data, error } = await sb
    .from("brand_reports")
    .select("id, title, kind, created_at, share_token")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reports: data });
}

export async function POST(req: NextRequest) {
  const sb = getSb(req);
  if (!sb) return unauthorized();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();

  // Confirm caller is on agency tier — brand reports are an agency feature.
  const { data: profile } = await sb
    .from("profiles")
    .select("account_type")
    .eq("id", user.id)
    .single();
  if (!profile || (profile as any).account_type !== "agency") {
    return NextResponse.json({ error: "Brand reports are an agency feature." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { title, kind, body: reportBody } = body || {};
  if (typeof title !== "string" || title.length === 0 || title.length > 200) {
    return NextResponse.json({ error: "title is required (≤200 chars)" }, { status: 400 });
  }
  if (typeof kind !== "string" || kind.length > 80) {
    return NextResponse.json({ error: "kind is required" }, { status: 400 });
  }
  if (!reportBody || typeof reportBody !== "object") {
    return NextResponse.json({ error: "body is required (JSON)" }, { status: 400 });
  }

  const shareToken = crypto.randomBytes(24).toString("base64url");
  const { data, error } = await sb
    .from("brand_reports")
    .insert({
      owner_id: user.id,
      title: title.slice(0, 200),
      kind: kind.slice(0, 80),
      body: reportBody,
      share_token: shareToken,
    })
    .select("id, title, kind, created_at, share_token")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ report: data }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const sb = getSb(req);
  if (!sb) return unauthorized();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { error } = await sb
    .from("brand_reports")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}
