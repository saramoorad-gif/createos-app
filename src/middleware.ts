import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/login", "/signup", "/onboarding", "/kit", "/pricing"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Demo mode
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  // Check for our auth cookie (set by auth-context on login)
  const authCookie = request.cookies.get("sb-auth-token");

  // Also check for Supabase's own cookie format (sb-<ref>-auth-token)
  const cookies = request.cookies.getAll();
  const hasSupabaseCookie = cookies.some(
    (c) => c.name === "sb-auth-token" || (c.name.startsWith("sb-") && c.name.endsWith("-auth-token"))
  );

  if (!authCookie && !hasSupabaseCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
