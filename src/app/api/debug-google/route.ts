import { NextResponse } from "next/server";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } from "@/lib/google";

export async function GET() {
  // Test the actual token exchange with a dummy code to see Google's error
  const testBody = new URLSearchParams({
    code: "test_dummy_code",
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: GOOGLE_REDIRECT_URI,
    grant_type: "authorization_code",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: testBody,
  });
  const googleResponse = await res.json();

  return NextResponse.json({
    clientIdPrefix: GOOGLE_CLIENT_ID.substring(0, 20) + "...",
    clientIdFull: GOOGLE_CLIENT_ID,
    secretPrefix: GOOGLE_CLIENT_SECRET.substring(0, 12) + "...",
    secretLength: GOOGLE_CLIENT_SECRET.length,
    redirectUri: GOOGLE_REDIRECT_URI,
    googleTestResponse: googleResponse,
  });
}
