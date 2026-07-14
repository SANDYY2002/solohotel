/**
 * Password hashing using Web Crypto's PBKDF2 — deliberately not bcrypt,
 * since bcrypt needs native bindings that don't run in Next.js's Edge
 * runtime (middleware.ts). This keeps one implementation working
 * unchanged in both Node (API routes) and Edge (middleware), matching
 * the same reasoning already used for session tokens in admin-auth.ts.
 *
 * 210,000 iterations follows OWASP's 2023+ PBKDF2-SHA256 recommendation.
 */

const ITERATIONS = 210_000;
const KEY_LENGTH_BITS = 256;

function toHex(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString("hex");
}

function fromHex(hex: string): Uint8Array {
  return new Uint8Array(Buffer.from(hex, "hex"));
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const derivedBits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    KEY_LENGTH_BITS
  );
  return `${ITERATIONS}:${toHex(salt.buffer as ArrayBuffer)}:${toHex(derivedBits)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(":");
  if (parts.length !== 3) return false;
  const iterationsStr = parts[0];
  const saltHex = parts[1];
  const hashHex = parts[2];
  if (!iterationsStr || !saltHex || !hashHex) return false;
  const iterations = Number(iterationsStr);
  if (!Number.isFinite(iterations)) return false;

  const salt = fromHex(saltHex);
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const derivedBits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    KEY_LENGTH_BITS
  );
  const candidateHex = toHex(derivedBits);

  if (candidateHex.length !== hashHex.length) return false;
  let diff = 0;
  for (let i = 0; i < candidateHex.length; i++) {
    diff |= candidateHex.charCodeAt(i) ^ hashHex.charCodeAt(i);
  }
  return diff === 0;
}
