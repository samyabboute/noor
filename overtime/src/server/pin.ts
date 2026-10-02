import "server-only";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";

/** Personal PINs are stored as scrypt hashes (salted, slow). The PIN itself is never stored or logged. */
export function hashPin(pin: string) {
  const salt = randomBytes(16);
  const hash = scryptSync(pin, salt, 32, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPin(pin: string, stored: string | null | undefined) {
  if (!stored) return false;
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(pin, Buffer.from(saltHex, "hex"), expected.length, { N: 16384, r: 8, p: 1 });
  return timingSafeEqual(actual, expected);
}

export const isValidPin = (pin: unknown): pin is string => typeof pin === "string" && /^\d{4,8}$/.test(pin);

/** Constant-time comparison for the shared role access codes. */
export function codeMatches(given: string, expected: string) {
  if (!expected) return false;
  const a = createHash("sha256").update(given.trim()).digest();
  const b = createHash("sha256").update(expected.trim()).digest();
  return timingSafeEqual(a, b);
}

/**
 * Brute-force brake on WRONG access codes per client address (best effort, per server instance).
 * Only failures count: a whole office floor shares one public IP, so successful sign-ins must never add up.
 * Wrong PINs are locked per person and persisted (see store.recordPinFailure).
 */
const failures = new Map<string, { n: number; until: number }>();
const WINDOW = 10 * 60e3;
export function isBlocked(key: string, max = 25) {
  const f = failures.get(key);
  return Boolean(f && f.until > Date.now() && f.n >= max);
}
export function recordCodeFailure(key: string) {
  const now = Date.now();
  const f = failures.get(key);
  if (!f || f.until < now) failures.set(key, { n: 1, until: now + WINDOW });
  else f.n++;
}
