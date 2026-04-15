import { NextRequest, NextResponse } from "next/server";
import { exchangeGoogleCode } from "@/lib/google";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state"); // userId
  const error = req.nextUrl.searchParams.get("error");

  if (error || !code || !state) {
    console.error("[Google Callback] Missing params:", { error, hasCode: !!code, hasState: !!state });
    return NextResponse.redirect(new URL("/integrations?error=google_denied", req.url));
  }

  try {
    // Exchange code for tokens
    console.log("[Google Callback] Exchanging code for tokens...");
    const tokens = await exchangeGoogleCode(code);

    if (!tokens.access_token) {
      console.error("[Google Callback] Token exchange failed. Error code:", tokens.error);
      return NextResponse.redirect(new URL("/integrations?error=google_failed", req.url));
    }

    // Store tokens in Supabase
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    const { error: dbError } = await sb.from("profiles").update({
      google_access_token: tokens.access_token,
      google_refresh_token: tokens.refresh_token,
      google_connected: true,
    }).eq("id", state);

    if (dbError) {
      console.error("[Google Callback] DB update error:", dbError);
      return NextResponse.redirect(new URL("/integrations?error=google_db_error", req.url));
    }

    console.log("[Google Callback] Success! Tokens saved for user.");
    return NextResponse.redirect(new URL("/integrations?connected=google", req.url));
  } catch (err) {
    console.error("[Google Callback] Exception:", err);
    return NextResponse.redirect(new URL("/integrations?error=google_error", req.url));
  }
}
