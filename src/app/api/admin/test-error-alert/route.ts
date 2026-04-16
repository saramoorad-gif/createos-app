import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminRequest } from "@/lib/admin-auth";

/**
 * Admin-only endpoint that inserts a fake row into public.error_logs so we
 * can end-to-end test the error-alert pipeline (error_logs insert →
 * Supabase webhook → /api/admin/error-alert → Resend → email).
 *
 * Called by the "Send test error alert" button on the admin /errors tab.
 */
export async function POST(req: NextRequest) {
  // Only admins can trigger a test.
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: "Server is missing Supabase service role key" },
      { status: 500 }
    );
  }

  const sb = createClient(supabaseUrl, serviceKey);

  // Insert a marked test row. If the Supabase webhook is wired up correctly,
  // this insert will fire the webhook → email within a few seconds.
  const { data, error } = await sb
    .from("error_logs")
    .insert({
      level: "info",
      source: "admin-test-alert",
      message: `Test alert fired from admin panel at ${new Date().toISOString()}. If you received this as an email, the webhook pipeline is working.`,
      metadata: { triggered_by: "admin-test-button" },
      user_agent: req.headers.get("user-agent") || null,
      url: "/admin (test button)",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      {
        error: "Failed to insert test row",
        detail: error.message,
        hint: "Does the error_logs table exist? Run supabase/admin-migration.sql if not.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    inserted_id: data?.id,
    next: "Check your admin email inbox within 10 seconds. If it doesn't arrive, check Supabase → Database → Webhooks → Recent deliveries for the error_logs webhook.",
  });
}
