// Server-side admin auth check
// Verifies the request is from an authenticated admin user
// Uses the Supabase auth token from the Authorization header, NOT a query param

import { createClient } from "@supabase/supabase-js";
import { isAdmin } from "./admin";

export async function verifyAdminRequest(req: Request): Promise<{ authorized: boolean; email?: string; error?: string }> {
  try {
    // Extract the bearer token from the Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { authorized: false, error: "Missing authorization header" };
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify the token using Supabase
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    const { data: { user }, error } = await sb.auth.getUser(token);

    if (error || !user) {
      return { authorized: false, error: "Invalid token" };
    }

    if (!user.email) {
      return { authorized: false, error: "No email on user" };
    }

    // Check if user email is in admin list
    if (!isAdmin(user.email)) {
      return { authorized: false, error: "Not an admin" };
    }

    return { authorized: true, email: user.email };
  } catch (err) {
    return { authorized: false, error: "Auth check failed" };
  }
}
