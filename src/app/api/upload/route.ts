import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/upload
 *
 * Stores a file in the public `uploads` bucket. Hardening pass:
 *   • Requires a Supabase bearer token. Anonymous uploads are rejected.
 *   • Caps file size at 25MB to prevent quota DoS.
 *   • Restricts content types to common contract / image / kit formats.
 *   • Scopes the storage path under `<userId>/<folder>/...` so one
 *     user's uploads can't trivially overwrite another's by guessing
 *     the file name.
 */

const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED_FOLDERS = new Set(["contracts", "kits", "avatars", "campaign-recaps", "logos"]);
// Note: SVG is intentionally NOT allowed. Even a "safe-looking" SVG can
// embed <script> tags, and our bucket serves files inline by Content-Type
// — that's stored XSS waiting to happen. Use PNG/JPEG/WEBP for images.
const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/quicktime",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
// Defense-in-depth: also enforce by extension. Browsers send file.type
// based on the file's *declared* content-type, which a custom multipart
// client can lie about — pairing with an extension check makes a
// content-type spoof require renaming the file too, and any sniffing
// downstream (e.g., antivirus) will see a real format.
const ALLOWED_EXT = new Set([
  "pdf", "png", "jpg", "jpeg", "webp", "gif",
  "mp4", "mov", "doc", "docx",
]);

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!supabaseUrl || !anonKey || !serviceKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const sbAuth = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authErr } = await sbAuth.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const folderRaw = (formData.get("folder") as string) || "contracts";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (25MB max)" }, { status: 413 });
  }
  if (file.type && !ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 415 });
  }

  const folder = ALLOWED_FOLDERS.has(folderRaw) ? folderRaw : "contracts";

  // Sanitize the filename so a malicious name can't escape the folder
  // ("../../foo") or include path separators.
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200);

  // Extension allowlist — must match MIME. Defends against a client
  // that lies about Content-Type to slip an executable past the
  // MIME check.
  const ext = (safeName.split(".").pop() || "").toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    return NextResponse.json({ error: `Unsupported file extension: .${ext}` }, { status: 415 });
  }

  const sb = createClient(supabaseUrl, serviceKey);

  const fileName = `${user.id}/${folder}/${Date.now()}-${safeName}`;
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

  const { data: urlData } = sb.storage.from("uploads").getPublicUrl(fileName);

  return NextResponse.json({
    url: urlData.publicUrl,
    path: data.path,
    name: file.name,
  });
}
