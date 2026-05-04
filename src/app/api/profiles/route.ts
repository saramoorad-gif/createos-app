import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseServer(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    { global: { headers: authHeader ? { Authorization: authHeader } : {} } }
  );
}

// Fields a user is allowed to set on their own profile via PATCH.
// IMPORTANT: anything here is user-controlled, so it must NOT include
// account tier, subscription, billing, integration tokens, agency
// linkage, or referral attribution. Those move only through Stripe
// webhooks, /api/account/*, /api/auth/* callbacks, /api/agency/*,
// and the signup flow.
const ALLOWED_PROFILE_FIELDS = new Set<string>([
  "full_name",
  "avatar_url",
  "bio",
  "agency_name", // editable display name on the agency itself
  "agency_role",
  "roster_size",
  "tiktok_handle",
  "instagram_handle",
  "youtube_handle",
  "tiktok_followers",
  "instagram_followers",
  "youtube_followers",
  "website",
  "location",
  "date_of_birth",
  "gender",
  "primary_niche",
  "secondary_niches",
  "languages",
  "engagement_rate",
  "content_style",
  "phone",
  "pronouns",
  "rate_ugc_video",
  "rate_ig_reel",
  "rate_tiktok",
  "rate_youtube",
  "rate_ig_story",
  "brands_worked_with",
  "media_kit_published",
]);

function pickAllowed(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(input || {})) {
    if (ALLOWED_PROFILE_FIELDS.has(key)) {
      out[key] = input[key];
    }
  }
  return out;
}

export async function GET(req: NextRequest) {
  const sb = getSupabaseServer(req);
  const { data: { user } } = await sb.auth.getUser();

  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data, error } = await sb.from("profiles").select("*").eq("id", user.id).single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const sb = getSupabaseServer(req);
  const { data: { user } } = await sb.auth.getUser();

  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const raw = await req.json().catch(() => ({}));
  const updates = pickAllowed(raw || {});

  // Reject empty updates so we don't issue a no-op write.
  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No allowed fields in request" },
      { status: 400 }
    );
  }

  const { data, error } = await sb
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
