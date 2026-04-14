import { NextRequest, NextResponse } from "next/server";
import { exchangeGoogleCode } from "@/lib/google";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state"); // userId
  const error = req.nextUrl.searchParams.get("error");

  if (error || !code || !state) {
    return NextResponse.redirect(new URL("/integrations?error=google_denied", req.url));
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeGoogleCode(code);

    if (!tokens.access_token) {
      return NextResponse.redirect(new URL("/integrations?error=google_failed", req.url));
    }

    // Store tokens in Supabase (using service role to bypass RLS)
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    await sb.from("profiles").update({
      google_access_token: tokens.access_token,
      google_refresh_token: tokens.refresh_token,
      google_connected: true,
    }).eq("id", state);

    return NextResponse.redirect(new URL("/integrations?connected=google", req.url));
  } catch {
    return NextResponse.redirect(new URL("/integrations?error=google_error", req.url));
  }
}
