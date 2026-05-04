"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

/**
 * Client-side CTA that routes based on auth state:
 *   not signed in → /signup (with optional ?plan=X)
 *   signed in     → /dashboard
 *
 * Used on marketing pages so a signed-in visitor clicking "Get started"
 * or "Start free" lands on their dashboard instead of the signup form.
 */
export function SmartCTA({
  className,
  children,
  plan,
  label,
  loggedInLabel,
}: {
  className?: string;
  children?: React.ReactNode;
  plan?: "ugc" | "ugc_influencer" | "agency";
  label?: string;
  loggedInLabel?: string;
}) {
  const { user, loading } = useAuth();

  // While auth is still resolving, render an href that's correct for the
  // signed-out case — the far more common marketing-page visitor state.
  // If the user turns out to be signed in, the next click will route them
  // correctly; any brief mismatch is a single extra hop to /dashboard
  // rather than a broken experience.
  const href = user
    ? "/dashboard"
    : plan
      ? `/signup?plan=${plan}`
      : "/signup";

  const displayLabel = user ? (loggedInLabel || "Go to dashboard") : (label || "Get started");

  return (
    <Link href={href} className={className} aria-disabled={loading}>
      {children || displayLabel}
    </Link>
  );
}
