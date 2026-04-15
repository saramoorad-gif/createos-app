import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, stage, contract_type, brand_name, value } = body;

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );

  try {
    const { data, error } = await sb
      .from("contracts")
      .insert({
        stage: stage || "draft",
        contract_type: contract_type || null,
        brand_name: brand_name || null,
        value: value || 0,
        uploaded_by: userId,
        uploaded_by_type: "agency",
      })
      .select()
      .single();

    if (error) {
      console.error("Contract insert error:", JSON.stringify(error));
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    return NextResponse.json({ contract: data });
  } catch (err: any) {
    console.error("Create contract error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
