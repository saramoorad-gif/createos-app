// Server-side helper to verify the authenticated user matches a requested userId
// Prevents attackers from passing arbitrary userIds to API endpoints

import { createClient } from "@supabase/supabase-js";

export async function verifyUserRequest(req: Request, requestedUserId: string): Promise<{ authorized: boolean; userId?: string; error?: string }> {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { authorized: false, error: "Missing authorization header" };
    }

    const token = authHeader.replace("Bearer ", "");

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    const { data: { user }, error } = await sb.auth.getUser(token);

    if (error || !user) {
      return { authorized: false, error: "Invalid token" };
    }

    if (user.id !== requestedUserId) {
      return { authorized: false, error: "User ID mismatch" };
    }

    return { authorized: true, userId: user.id };
  } catch (err) {
    return { authorized: false, error: "Auth check failed" };
  }
}

// Verify the request is from an authenticated user (but don't check specific userId)
// Returns the authenticated user ID
export async function getAuthenticatedUserId(req: Request): Promise<{ userId: string | null; error?: string }> {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { userId: null, error: "Missing authorization header" };
    }

    const token = authHeader.replace("Bearer ", "");

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    const { data: { user }, error } = await sb.auth.getUser(token);

    if (error || !user) {
      return { userId: null, error: "Invalid token" };
    }

    return { userId: user.id };
  } catch (err) {
    return { userId: null, error: "Auth check failed" };
  }
}
