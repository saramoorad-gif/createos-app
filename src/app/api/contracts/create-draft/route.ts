import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/contracts/create-draft
 *
 * Creates a draft contract owned by the authenticated user.
 *
 * Previously this trusted `userId` from the request body, which let any
 * authenticated user attribute a contract to anyone else just by
 * forging the payload. The userId is now derived from the auth token
 * server-side; the body field is ignored.
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!supabaseUrl || !anonKey || !serviceKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // Verify the bearer token resolves to a real user before doing anything.
  const sbAuth = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authErr } = await sbAuth.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { stage, contract_type, brand_name, value } = body;

  // Service role for the insert so the FK + RLS surface is consistent
  // with the gift-code/referral flow. uploaded_by is forced to the
  // verified session user — never trust the body for ownership.
  const sb = createClient(supabaseUrl, serviceKey);

  try {
    const { data, error } = await sb
      .from("contracts")
      .insert({
        stage: stage || "draft",
        contract_type: contract_type || null,
        brand_name: brand_name || null,
        value: value || 0,
        uploaded_by: user.id,
        uploaded_by_type: "agency",
      })
      .select()
      .single();

    if (error) {
      console.error("Contract insert error:", JSON.stringify(error));
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    return NextResponse.json({ contract: data });
  } catch (err: any) {
    console.error("Create contract error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
