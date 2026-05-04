import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyUserRequest } from "@/lib/api-auth";

// Creates a deal in the pipeline from an AI-detected email opportunity

const VALID_PLATFORMS = ["tiktok", "instagram", "youtube"];

export async function POST(req: NextRequest) {
  const { userId, brand_name, estimated_value, deliverables, platform, stage, notes, email_subject, email_from } = await req.json();

  if (!userId || typeof userId !== "string" || !userId.trim() || !brand_name) {
    return NextResponse.json({ error: "Missing or invalid required fields" }, { status: 400 });
  }

  const auth = await verifyUserRequest(req, userId);
  if (!auth.authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Server configuration missing" }, { status: 500 });
  }

  const sb = createClient(supabaseUrl, serviceKey);

  // Clean platform
  const cleanPlatform = platform && VALID_PLATFORMS.includes(platform.toLowerCase())
    ? platform.toLowerCase()
    : null;

  // Clean value
  const cleanValue = typeof estimated_value === "number" && estimated_value > 0
    ? estimated_value
    : 0;

  // Build notes
  const noteLines = ["[AI Detected from Gmail]"];
  if (notes) noteLines.push(notes);
  if (email_from) noteLines.push(`From: ${email_from}`);
  if (email_subject) noteLines.push(`Subject: ${email_subject}`);

  try {
    // First ensure user exists in public.users (deals table has FK to public.users)
    const { data: existingUser } = await sb
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (!existingUser) {
      // Get user info from profiles to create a public.users row
      const { data: profile } = await sb
        .from("profiles")
        .select("full_name, email")
        .eq("id", userId)
        .single();

      if (profile) {
        await sb.from("users").upsert({
          id: userId,
          full_name: profile.full_name || "Creator",
          email: profile.email || "",
          tier: "ugc_creator",
        }, { onConflict: "id" });
      }
    }

    // Now insert the deal
    const validStages = ["lead", "negotiating", "contracted", "in_progress", "delivered", "paid"];
    const cleanStage = stage && validStages.includes(stage) ? stage : "lead";

    const insertData: Record<string, any> = {
      user_id: userId,
      brand_name: brand_name.trim(),
      stage: cleanStage,
      value: cleanValue,
      notes: noteLines.join("\n"),
    };

    if (deliverables) insertData.deliverables = deliverables;
    if (cleanPlatform) insertData.platform = cleanPlatform;

    const { data, error } = await sb
      .from("deals")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", JSON.stringify(error));
      return NextResponse.json({ error: error.message, code: error.code, details: error.details }, { status: 500 });
    }

    return NextResponse.json({ deal: data });
  } catch (err: any) {
    console.error("Create deal error:", err);
    return NextResponse.json({ error: err.message || "Failed to create deal" }, { status: 500 });
  }
}
