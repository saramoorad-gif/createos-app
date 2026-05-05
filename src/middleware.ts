import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  "/login", "/signup", "/checkout", "/onboarding", "/kit", "/pricing",
  "/for-creators", "/for-agencies", "/features", "/faq",
  "/help", "/contact", "/privacy", "/terms", "/team-onboarding",
  "/forgot-password", "/reset-password",
  "/affiliate-agreement", "/referral-program", "/creators",
  "/docs", // public API documentation
  "/r",    // public brand report viewer (/r/[token])
  "/admin", // /admin has its own auth check inside the page
];

// Match a public route with exact path-segment boundary so a route like "/r"
// doesn't accidentally match "/rate-calculator" or "/referrals". A route
// matches if the pathname equals it exactly OR starts with it followed by "/".
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

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

  // Allow public routes (exact segment match — prevents "/r" matching "/referrals")
  if (isPublicRoute(pathname)) return response;

  // Allow static files and API routes ("/api/" with trailing slash so "/api-keys"
  // app page is not accidentally treated as an API route and skipped)
  if (pathname.startsWith("/_next") || pathname.startsWith("/api/") || pathname.includes(".")) {
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
    // Previously this had a same-origin referer escape hatch so users
    // navigating from within the app could rely on localStorage auth.
    // That was unsafe — any same-origin XSS (or just `fetch` with a
    // Referer header) bypassed the cookie check. Both /login and
    // /signup now set the auth cookie explicitly on success, so the
    // legitimate "I just signed in but cookie wasn't ready" race is
    // gone. Always require the cookie.
    const loginUrl = new URL("/login", request.url);
    // Validate pathname is a safe internal redirect target before
    // forwarding it. Anything that smells like a protocol-relative or
    // absolute URL is dropped (open-redirect protection).
    const safeRedirect =
      pathname.startsWith("/") &&
      !pathname.startsWith("//") &&
      !/^\/[^/]*:/.test(pathname)
        ? pathname
        : "/dashboard";
    loginUrl.searchParams.set("redirect", safeRedirect);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
