/**
 * Signed-cookie session for the admin dashboard, carrying which staff
 * account is logged in (not just a yes/no gate anymore — see
 * StaffAccount in schema.prisma). Still dependency-free and still uses
 * Web Crypto (`crypto.subtle`) rather than Node's `crypto` module, so the
 * same code runs unchanged in both `middleware.ts` (Edge runtime) and API
 * routes (Node runtime) — the token itself only needs a staffId + expiry,
 * so no database access is required to verify it in Edge middleware.
 */

export const SESSION_COOKIE = "yukin_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hour absolute maximum, regardless of activity

export type SessionPayload = { staffId: string; expiresAt: number };

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set. Add it to your .env file (see .env.example).");
  }
  return secret;
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Buffer.from(sigBuffer).toString("hex");
}

export async function createSessionToken(staffId: string): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = `${staffId}|${expiresAt}`;
  const signature = await sign(payload);
  return `${payload}.${signature}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return null;
  const payload = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);
  if (!payload || !signature) return null;

  const expected = await sign(payload);
  if (expected.length !== signature.length) return null;

  // Constant-time-ish compare (length already checked above)
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  if (diff !== 0) return null;

  const [staffId, expiresAtStr] = payload.split("|");
  const expiresAt = Number(expiresAtStr);
  if (!staffId || !Number.isFinite(expiresAt) || Date.now() >= expiresAt) return null;
  return { staffId, expiresAt };
}

/**
 * Bootstrap-only: the legacy single shared password, used exclusively to
 * create the very first StaffAccount on first login (see
 * src/app/api/admin/login/route.ts). Once at least one StaffAccount
 * exists, this is never checked again — every login after that is a real
 * email + password against StaffAccount.
 */
export function checkAdminPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error("ADMIN_PASSWORD is not set. Add it to your .env file (see .env.example).");
  }
  return candidate === expected;
}

/** Verifies the session cookie on an incoming API request. Use at the top of any `/api/admin/*` route. */
export async function requireAdmin(req: Request): Promise<SessionPayload | null> {
  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  if (!match?.[1]) return null;
  // Next.js's cookies() API (used in Server Components) URL-decodes cookie
  // values automatically; reading the raw Cookie header here does not, so
  // it must be decoded explicitly — otherwise a token containing "|" comes
  // through as the still-encoded "%7C" and fails to parse.
  let value: string;
  try {
    value = decodeURIComponent(match[1]);
  } catch {
    return null;
  }
  return verifySessionToken(value);
}
