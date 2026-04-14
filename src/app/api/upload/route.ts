import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const folder = formData.get("folder") as string || "contracts";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );

  const fileName = `${folder}/${Date.now()}-${file.name}`;
  const buffer = await file.arrayBuffer();

  const { data, error } = await sb.storage
    .from("uploads")
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get public URL
  const { data: urlData } = sb.storage.from("uploads").getPublicUrl(fileName);

  return NextResponse.json({
    url: urlData.publicUrl,
    path: data.path,
    name: file.name,
  });
}
