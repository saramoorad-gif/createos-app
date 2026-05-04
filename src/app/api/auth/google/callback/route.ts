import { NextRequest, NextResponse } from "next/server";
import { exchangeGoogleCode } from "@/lib/google";
import { createClient } from "@supabase/supabase-js";
import { verifyOAuthState } from "@/lib/oauth-state";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");

  // FAIL CLOSED on missing/invalid state — even on Google's "error"
  // path. Without this check, an attacker could craft a callback URL
  // pointing at the victim's userId in `state` and link the
  // attacker's Google account to the victim's profile. We always
  // verify the HMAC signature first.
  const verified = verifyOAuthState(state);
  if (!verified.ok) {
    console.error("[Google Callback] Bad state:", verified.reason);
    return NextResponse.redirect(new URL("/integrations?error=google_state_invalid", req.url));
  }
  const userId = verified.userId;

  if (error || !code) {
    return NextResponse.redirect(new URL("/integrations?error=google_denied", req.url));
  }

  try {
    const tokens = await exchangeGoogleCode(code);

    if (!tokens.access_token) {
      console.error("[Google Callback] Token exchange failed. Error code:", tokens.error);
      return NextResponse.redirect(new URL("/integrations?error=google_failed", req.url));
    }

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    const { error: dbError } = await sb.from("profiles").update({
      google_access_token: tokens.access_token,
      google_refresh_token: tokens.refresh_token,
      google_connected: true,
    }).eq("id", userId);

    if (dbError) {
      console.error("[Google Callback] DB update error:", dbError);
      return NextResponse.redirect(new URL("/integrations?error=google_db_error", req.url));
    }

    return NextResponse.redirect(new URL("/integrations?connected=google", req.url));
  } catch (err) {
    console.error("[Google Callback] Exception:", err);
    return NextResponse.redirect(new URL("/integrations?error=google_error", req.url));
  }
}
