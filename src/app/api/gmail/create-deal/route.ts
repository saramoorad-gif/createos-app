import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Creates a deal in the pipeline from an AI-detected email opportunity

const VALID_PLATFORMS = ["tiktok", "instagram", "youtube"];

export async function POST(req: NextRequest) {
  const { userId, brand_name, estimated_value, deliverables, platform, notes, email_subject, email_from } = await req.json();

  if (!userId || !brand_name) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );

  // Clean platform — must match check constraint or be null
  const cleanPlatform = platform && VALID_PLATFORMS.includes(platform.toLowerCase())
    ? platform.toLowerCase()
    : null;

  // Clean value — must be a number
  const cleanValue = typeof estimated_value === "number" && estimated_value > 0
    ? estimated_value
    : 0;

  // Build notes
  const noteLines = ["[AI Detected from Gmail]"];
  if (notes) noteLines.push(notes);
  if (email_from) noteLines.push(`From: ${email_from}`);
  if (email_subject) noteLines.push(`Subject: ${email_subject}`);

  try {
    const insertData: Record<string, any> = {
      user_id: userId,
      brand_name: brand_name.trim(),
      stage: "lead",
      value: cleanValue,
      notes: noteLines.join("\n"),
    };

    // Only include optional fields if they have valid values
    if (deliverables) insertData.deliverables = deliverables;
    if (cleanPlatform) insertData.platform = cleanPlatform;

    const { data, error } = await sb
      .from("deals")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", JSON.stringify(error));
      return NextResponse.json({ error: error.message || "Database insert failed", details: error }, { status: 500 });
    }

    return NextResponse.json({ deal: data });
  } catch (err: any) {
    console.error("Create deal error:", err);
    return NextResponse.json({ error: err.message || "Failed to create deal" }, { status: 500 });
  }
}
