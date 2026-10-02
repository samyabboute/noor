/**
 * Signed session token (HMAC-SHA256 via Web Crypto) — works in the Edge
 * middleware and in Node route handlers alike. Used for DEMO sessions only;
 * Entra sessions are NextAuth JWTs.
 */
import type { Role } from "./types";

export interface SessionPayload {
  uid: string;
  role: Role;
  exp: number; // epoch seconds
}

export const SESSION_COOKIE = "ot_session";
export const SESSION_TTL = 60 * 60 * 12; // one shift

const te = new TextEncoder();

function b64url(bytes: ArrayBuffer | Uint8Array) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = "";
  for (const b of arr) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string) {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function key(secret: string) {
  return crypto.subtle.importKey("raw", te.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function signSession(payload: SessionPayload, secret: string) {
  const body = b64url(te.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign("HMAC", await key(secret), te.encode(body));
  return `${body}.${b64url(sig)}`;
}

export async function verifySession(token: string | undefined, secret: string): Promise<SessionPayload | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await key(secret), fromB64url(sig), te.encode(body));
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromB64url(body))) as SessionPayload;
    if (!payload.uid || !payload.role || payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export const HOME_FOR_ROLE: Record<Role, string> = {
  agent: "/agent",
  monitoring: "/monitoring",
  management: "/insights",
};

/** Which roles may open which area. Analytics is shared read-only with Monitoring. */
export function canAccess(pathname: string, role: Role) {
  if (pathname.startsWith("/agent")) return role === "agent";
  if (pathname.startsWith("/monitoring")) return role === "monitoring";
  if (pathname.startsWith("/insights")) return role === "management";
  return true;
}
