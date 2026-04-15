import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, userEmail, level, source, message, stack, metadata, userAgent, url } = body;

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    await sb.from("error_logs").insert({
      user_id: userId || null,
      user_email: userEmail || null,
      level: level || "error",
      source: source || "unknown",
      message: message || "Unknown error",
      stack: stack || null,
      metadata: metadata || {},
      user_agent: userAgent || null,
      url: url || null,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Log error endpoint failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
