import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Creates a deal in the pipeline from an AI-detected email opportunity

export async function POST(req: NextRequest) {
  const { userId, brand_name, estimated_value, deliverables, platform, notes, email_subject, email_from } = await req.json();

  if (!userId || !brand_name) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );

  try {
    const { data, error } = await sb
      .from("deals")
      .insert({
        user_id: userId,
        brand_name,
        stage: "lead",
        value: estimated_value || 0,
        deliverables: deliverables || null,
        platform: platform || null,
        notes: `[AI Detected] ${notes || ""}\n\nFrom: ${email_from || ""}\nSubject: ${email_subject || ""}`.trim(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ deal: data });
  } catch (err: any) {
    console.error("Create deal error:", err);
    return NextResponse.json({ error: err.message || "Failed to create deal" }, { status: 500 });
  }
}
