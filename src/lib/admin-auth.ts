/**
 * Minimal signed-cookie session for the admin dashboard.
 *
 * Deliberately dependency-free (no NextAuth/iron-session) so the auth
 * surface is small and auditable: a single password gate protecting an
 * internal staff tool, not a multi-user identity system. Uses Web Crypto
 * (`crypto.subtle`) rather than Node's `crypto` module so the same code
 * runs unchanged in both `middleware.ts` (Edge runtime) and API routes
 * (Node runtime).
 *
 * Swap this for NextAuth / Clerk / Auth.js if you need multiple staff
 * accounts, roles, or audit logging.
 */

export const SESSION_COOKIE = "yukin_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET is not set. Add it to your .env file (see .env.example)."
    );
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

export async function createSessionToken(): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = String(expiresAt);
  const signature = await sign(payload);
  return `${payload}.${signature}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = await sign(payload);
  if (expected.length !== signature.length) return false;

  // Constant-time-ish compare (length already checked above)
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  if (diff !== 0) return false;

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && Date.now() < expiresAt;
}

export function checkAdminPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error("ADMIN_PASSWORD is not set. Add it to your .env file (see .env.example).");
  }
  return candidate === expected;
}

/** Checks the session cookie on an incoming API request. Use at the top of any `/api/admin/*` route. */
export async function requireAdmin(req: Request): Promise<boolean> {
  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  return verifySessionToken(match?.[1]);
}
