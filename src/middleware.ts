import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  "/login", "/signup", "/checkout", "/onboarding", "/kit", "/pricing",
  "/for-creators", "/for-agencies", "/features", "/faq",
  "/help", "/contact", "/privacy", "/terms", "/team-onboarding",
  "/admin", // /admin has its own auth check inside the page
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Homepage is always public
  if (pathname === "/") return NextResponse.next();

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) return NextResponse.next();

  // Allow static files and API routes
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Demo mode — no Supabase configured
  if (!supabaseUrl || !supabaseAnonKey) return NextResponse.next();

  // Check for ANY auth-related cookie
  const cookies = request.cookies.getAll();
  const hasAuth = cookies.some(c =>
    c.name === "sb-auth-token" ||
    c.name.includes("auth-token") ||
    c.name.startsWith("sb-") ||
    c.name.includes("supabase")
  );

  if (!hasAuth) {
    // Don't redirect if coming from within the app (has referer from same origin)
    const referer = request.headers.get("referer");
    if (referer && referer.includes(request.nextUrl.origin)) {
      // User is navigating within the app — they might have localStorage auth
      // Let the client-side auth context handle the redirect instead
      return NextResponse.next();
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
