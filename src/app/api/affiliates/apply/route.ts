import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { AFFILIATE_CONFIG } from "@/lib/affiliate-config";

/**
 * POST /api/affiliates/apply
 *
 * Creates an affiliate application. Requires authenticated user.
 * Body: { promo_code, display_name, instagram_handle, follower_tier, motivation }
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim(),
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: authErr } = await sb.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { promo_code, display_name, instagram_handle, follower_tier, motivation } = body;

  // Validate promo code format
  if (!promo_code || !AFFILIATE_CONFIG.PROMO_CODE_REGEX.test(promo_code.toUpperCase())) {
    return NextResponse.json(
      { error: "Promo code must be 4-20 characters, letters and numbers only" },
      { status: 400 }
    );
  }

  if (!display_name || typeof display_name !== "string" || !display_name.trim()) {
    return NextResponse.json({ error: "Display name is required" }, { status: 400 });
  }

  // Use service role for the insert so we can bypass RLS (the user is
  // creating a row for themselves, which the RLS policy allows, but we
  // also need to check for code uniqueness across all affiliates).
  const sbAdmin = createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
    (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim()
  );

  // Check if user already has an affiliate application
  const { data: existing } = await sbAdmin
    .from("affiliates")
    .select("id, status")
    .eq("user_id", user.id)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: `You already have an affiliate application (status: ${existing.status})` },
      { status: 409 }
    );
  }

  // Check promo code availability
  const { data: codeTaken } = await sbAdmin
    .from("affiliates")
    .select("id")
    .eq("promo_code", promo_code.toUpperCase())
    .single();

  if (codeTaken) {
    return NextResponse.json(
      { error: "That promo code is already taken. Please choose another." },
      { status: 409 }
    );
  }

  // Create the application
  const { data: affiliate, error: insertErr } = await sbAdmin
    .from("affiliates")
    .insert({
      user_id: user.id,
      promo_code: promo_code.toUpperCase(),
      display_name: display_name.trim(),
      instagram_handle: (instagram_handle || "").trim() || null,
      follower_tier: follower_tier || null,
      motivation: (motivation || "").trim() || null,
      status: "pending",
    })
    .select("id, promo_code, status")
    .single();

  if (insertErr) {
    console.error("[affiliate-apply] Insert error:", insertErr);
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ affiliate }, { status: 201 });
}
