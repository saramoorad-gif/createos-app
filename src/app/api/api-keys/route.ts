import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateApiKey } from "@/lib/api-keys";
import { requireFeature } from "@/lib/require-tier";

/**
 * Manage API keys for the authenticated agency owner.
 *
 *   GET    /api/api-keys           list keys (no plaintext)
 *   POST   /api/api-keys           create new key (returns plaintext ONCE)
 *   DELETE /api/api-keys?id=…    revoke a key
 *
 * Gated to agency_growth via requireFeature("api-access").
 */

export async function GET(req: NextRequest) {
  const tier = await requireFeature(req, "api-access");
  if (!tier.ok) {
    return NextResponse.json({ error: tier.error, hint: (tier as any).hint }, { status: tier.status });
  }

  const sb = createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
    (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim()
  );

  const { data, error } = await sb
    .from("api_keys")
    .select("id, label, prefix, created_at, last_used_at, revoked_at")
    .eq("owner_id", tier.userId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ keys: data });
}

export async function POST(req: NextRequest) {
  const tier = await requireFeature(req, "api-access");
  if (!tier.ok) {
    return NextResponse.json({ error: tier.error, hint: (tier as any).hint }, { status: tier.status });
  }

  const { label } = await req.json().catch(() => ({}));
  const safeLabel = typeof label === "string" && label.trim() ? label.trim().slice(0, 80) : "Untitled key";

  const sb = createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
    (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim()
  );

  // Cap at 10 active keys per owner — plenty for any legitimate use,
  // and stops a misconfigured client from creating thousands.
  const { count } = await sb
    .from("api_keys")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", tier.userId)
    .is("revoked_at", null);
  if ((count || 0) >= 10) {
    return NextResponse.json(
      { error: "API key limit reached (10 active). Revoke an unused key first." },
      { status: 409 }
    );
  }

  const { plaintext, prefix, hash } = generateApiKey();

  const { error } = await sb.from("api_keys").insert({
    owner_id: tier.userId,
    label: safeLabel,
    prefix,
    token_hash: hash,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Plaintext returned ONCE. We do not persist it.
  return NextResponse.json({ key: plaintext, prefix, label: safeLabel }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const tier = await requireFeature(req, "api-access");
  if (!tier.ok) {
    return NextResponse.json({ error: tier.error, hint: (tier as any).hint }, { status: tier.status });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const sb = createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
    (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim()
  );

  const { error } = await sb
    .from("api_keys")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id)
    .eq("owner_id", tier.userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ revoked: true });
}
