import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const { userId, type } = await req.json();

  if (!userId || !type) {
    return NextResponse.json({ error: "Missing userId or type" }, { status: 400 });
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );

  try {
    if (type === "google") {
      await sb.from("profiles").update({
        google_connected: false,
        google_access_token: null,
        google_refresh_token: null,
      }).eq("id", userId);
    } else if (type === "docusign") {
      await sb.from("profiles").update({
        docusign_connected: false,
        docusign_access_token: null,
        docusign_refresh_token: null,
      }).eq("id", userId);
    } else {
      return NextResponse.json({ error: "Unknown integration type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Disconnect error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
