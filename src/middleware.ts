import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  "/login", "/signup", "/checkout", "/onboarding", "/kit", "/pricing",
  "/for-creators", "/for-agencies", "/features", "/faq",
  "/help", "/contact", "/privacy", "/terms", "/team-onboarding",
  "/forgot-password", "/reset-password",
  "/affiliate-agreement", "/referral-program", "/creators",
  "/admin", // /admin has its own auth check inside the page
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ─── Affiliate attribution cookie ─────────────────────────────────
  // If ?ref=CODE is in the URL, persist it as a 30-day cookie so the
  // signup/checkout pages can read it later for attribution. This runs
  // for ALL routes (including marketing pages) before any auth check.
  const ref = request.nextUrl.searchParams.get("ref");
  if (ref && /^[A-Z0-9]{4,20}$/i.test(ref)) {
    response.cookies.set("cs_ref", ref.toUpperCase(), {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: false, // client-side JS needs to read this
    });
  }

  // Homepage is always public
  if (pathname === "/") return response;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) return response;

  // Allow static files and API routes
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) {
    return response;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Demo mode — no Supabase configured
  if (!supabaseUrl || !supabaseAnonKey) return response;

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
      return response;
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
