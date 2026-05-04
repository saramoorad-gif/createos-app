// Admin access check.
//
// Admin emails come from the ADMIN_EMAILS env var (comma-separated,
// case-insensitive). On the server it's a regular env var; on the
// client we expose a list at NEXT_PUBLIC_ADMIN_EMAILS so the signup
// page can skip the Stripe checkout for the owner. Keep this list
// short and don't put any secrets in it — the client-side copy is
// visible in the bundle.
//
// If neither env var is set, we fall back to the previous hardcoded
// owner email so production access doesn't break on a missed deploy.

const FALLBACK_ADMIN_EMAILS = ["hello@createsuite.co"];

function parseEmailList(raw: string | undefined | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function getAdminEmails(): string[] {
  // On the server, prefer the private env var. On the client only the
  // NEXT_PUBLIC_ one is available; both are checked so SSR + client
  // agree.
  const fromEnv = parseEmailList(process.env.ADMIN_EMAILS);
  if (fromEnv.length) return fromEnv;
  const fromPublic = parseEmailList(process.env.NEXT_PUBLIC_ADMIN_EMAILS);
  if (fromPublic.length) return fromPublic;
  return FALLBACK_ADMIN_EMAILS;
}

export function isAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}
