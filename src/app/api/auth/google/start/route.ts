import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { signOAuthState } from "@/lib/oauth-state";
import { getGoogleAuthUrl, isGoogleConfigured } from "@/lib/google";

/**
 * POST /api/auth/google/start
 *
 * Issues an HMAC-signed OAuth state token and returns the Google
 * authorize URL that uses it. The client redirects to that URL.
 * Replaces the previous flow where the client built the URL itself
 * with `state = user.id` — that let any attacker craft a callback
 * link impersonating any victim.
 */
export async function POST(req: NextRequest) {
  if (!isGoogleConfigured()) {
    return NextResponse.json({ error: "Google not configured" }, { status: 500 });
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
  const { data: { user }, error } = await sb.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = signOAuthState(user.id);
  return NextResponse.json({ url: getGoogleAuthUrl(state) });
}
