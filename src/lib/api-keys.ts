import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

/**
 * API key model.
 *
 * Goals:
 *   • Tokens are 32 random bytes encoded as base64url (43 chars).
 *   • Stored hashed (sha256) — we never persist plaintext, so a DB
 *     leak doesn't hand out usable keys.
 *   • Keyed off owner_id so rotating an agency owner keeps an audit
 *     trail per key.
 *   • Each key has a `prefix` (first 8 chars of the base64url string)
 *     stored alongside the hash. The prefix is what we display in
 *     the management UI ("cs_live_pAxmZk2T…") so the user can pick
 *     out the key they want to revoke.
 *
 * Lifetime: keys live until revoked. last_used_at is touched on each
 * authenticated v1 call so we can spot dormant keys to prune.
 */

const API_KEY_PREFIX = "cs_live_";

export function generateApiKey(): { plaintext: string; prefix: string; hash: string } {
  // 32 random bytes → 43 base64url chars. Add the cs_live_ marker so
  // a leaked key in a screenshot is instantly identifiable.
  const random = crypto.randomBytes(32).toString("base64url");
  const plaintext = `${API_KEY_PREFIX}${random}`;
  const prefix = plaintext.slice(0, 16); // cs_live_ + 8 chars
  const hash = crypto.createHash("sha256").update(plaintext).digest("hex");
  return { plaintext, prefix, hash };
}

export function hashApiKey(plaintext: string): string {
  return crypto.createHash("sha256").update(plaintext).digest("hex");
}

/**
 * Verifies an API key from an Authorization header. Returns the
 * key's owner profile + key id, or null if invalid/revoked.
 *
 * Updates last_used_at fire-and-forget — we don't block the request
 * on the write.
 */
export async function authenticateApiKey(authHeader: string | null): Promise<
  | { ok: true; ownerId: string; keyId: string; accountType: string; agencyPlan: string | null }
  | { ok: false; reason: "missing" | "malformed" | "invalid" | "revoked" | "tier" }
> {
  if (!authHeader) return { ok: false, reason: "missing" };
  if (!authHeader.startsWith("Bearer ")) return { ok: false, reason: "malformed" };
  const token = authHeader.slice(7).trim();
  if (!token.startsWith(API_KEY_PREFIX)) return { ok: false, reason: "malformed" };

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!supabaseUrl || !serviceKey) return { ok: false, reason: "invalid" };

  const sb = createClient(supabaseUrl, serviceKey);
  const hash = hashApiKey(token);

  const { data: key } = await sb
    .from("api_keys")
    .select("id, owner_id, revoked_at")
    .eq("token_hash", hash)
    .single();

  if (!key) return { ok: false, reason: "invalid" };
  if ((key as any).revoked_at) return { ok: false, reason: "revoked" };

  const { data: profile } = await sb
    .from("profiles")
    .select("account_type, agency_plan")
    .eq("id", (key as any).owner_id)
    .single();

  // API access is a Growth-only feature; reject any other tier.
  if (
    !profile ||
    (profile as any).account_type !== "agency" ||
    (profile as any).agency_plan !== "growth"
  ) {
    return { ok: false, reason: "tier" };
  }

  // Touch last_used_at, ignore failures.
  void sb
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", (key as any).id);

  return {
    ok: true,
    ownerId: (key as any).owner_id,
    keyId: (key as any).id,
    accountType: (profile as any).account_type,
    agencyPlan: (profile as any).agency_plan,
  };
}
