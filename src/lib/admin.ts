// Admin access check
// Only the owner can access the admin portal

const ADMIN_EMAILS = [
  "hello@createsuite.co",
  // Add more admin emails here if needed
];

export function isAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
