import { NextRequest, NextResponse } from "next/server";
import { exchangeDocuSignCode } from "@/lib/docusign";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state"); // userId
  const error = req.nextUrl.searchParams.get("error");

  if (error || !code || !state) {
    return NextResponse.redirect(new URL("/integrations?error=docusign_denied", req.url));
  }

  try {
    const tokens = await exchangeDocuSignCode(code);

    if (!tokens.access_token) {
      return NextResponse.redirect(new URL("/integrations?error=docusign_failed", req.url));
    }

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    await sb.from("profiles").update({
      docusign_access_token: tokens.access_token,
      docusign_refresh_token: tokens.refresh_token,
      docusign_connected: true,
    }).eq("id", state);

    return NextResponse.redirect(new URL("/integrations?connected=docusign", req.url));
  } catch {
    return NextResponse.redirect(new URL("/integrations?error=docusign_error", req.url));
  }
}
