import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID || "(not set)";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "(not set)";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "(not set)";

  return NextResponse.json({
    clientIdPrefix: clientId.substring(0, 15) + "...",
    clientIdLength: clientId.length,
    secretPrefix: clientSecret.substring(0, 10) + "...",
    secretLength: clientSecret.length,
    appUrl,
    expectedClientId: "62122287732-0uc...",
    expectedSecretPrefix: "GOCSPX-zsv...",
  });
}
