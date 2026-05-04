// HMAC-signed OAuth state tokens.
//
// Why this exists: the Google OAuth callback used to read the
// `state` query parameter as a raw userId and immediately update that
// row's tokens. An attacker with their own valid OAuth code could
// craft a callback URL with the victim's userId in `state` to link
// the attacker's Google account to the victim — full
// integration takeover.
//
// We now wrap the userId in an HMAC-signed envelope. The callback
// verifies the signature against a server secret before it does
// anything. Tokens also carry a timestamp so we can reject stale
// states (10-minute window — long enough for OAuth roundtrips,
// short enough to bound replay risk).

import crypto from "crypto";

const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function getSigningSecret(): string {
  // Prefer a dedicated secret. Fall back to SUPABASE_SERVICE_ROLE_KEY
  // because it's the one server-only secret guaranteed to exist on
  // this project — keeps things working without a new env var, while
  // letting ops rotate to OAUTH_STATE_SECRET when convenient.
  const secret =
    (process.env.OAUTH_STATE_SECRET || "").trim() ||
    (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!secret) {
    throw new Error("OAUTH_STATE_SECRET (or SUPABASE_SERVICE_ROLE_KEY) is required to sign OAuth state");
  }
  return secret;
}

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function fromB64url(s: string): Buffer {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return Buffer.from(s, "base64");
}

export function signOAuthState(userId: string): string {
  const payload = { uid: userId, ts: Date.now(), nonce: b64url(crypto.randomBytes(8)) };
  const body = b64url(Buffer.from(JSON.stringify(payload), "utf8"));
  const sig = b64url(
    crypto.createHmac("sha256", getSigningSecret()).update(body).digest()
  );
  return `${body}.${sig}`;
}

export function verifyOAuthState(state: string | null | undefined): { ok: true; userId: string } | { ok: false; reason: string } {
  if (!state || typeof state !== "string" || !state.includes(".")) {
    return { ok: false, reason: "missing_or_malformed" };
  }
  const [body, sig] = state.split(".");
  if (!body || !sig) return { ok: false, reason: "missing_or_malformed" };

  let secret: string;
  try {
    secret = getSigningSecret();
  } catch {
    return { ok: false, reason: "server_misconfigured" };
  }

  const expected = b64url(crypto.createHmac("sha256", secret).update(body).digest());
  // Constant-time compare to defeat timing side-channels.
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, reason: "bad_signature" };
  }

  let payload: any;
  try {
    payload = JSON.parse(fromB64url(body).toString("utf8"));
  } catch {
    return { ok: false, reason: "bad_payload" };
  }

  if (!payload?.uid || typeof payload.uid !== "string") {
    return { ok: false, reason: "no_uid" };
  }
  if (typeof payload.ts !== "number" || Date.now() - payload.ts > STATE_TTL_MS) {
    return { ok: false, reason: "expired" };
  }

  return { ok: true, userId: payload.uid };
}
