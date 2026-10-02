import { NextResponse } from "next/server";
import type { Role } from "@/lib/types";
import { HOME_FOR_ROLE, SESSION_COOKIE, SESSION_TTL, signSession } from "@/lib/session-token";
import { accessCodes, authMode, sessionSecret } from "@/server/config";
import { body, route } from "@/server/http";
import { codeMatches, hashPin, isBlocked, isValidPin, recordCodeFailure, verifyPin } from "@/server/pin";
import { mutate, repo, ValidationError } from "@/server/store";

/**
 * ACCESS-CODE sign-in (no SSO required).
 *   1. { step: "check", code }  → which role the code opens + who can sign in with it
 *   2. { step: "login", code, userId | newPerson, pin, pinConfirm? }
 *      First sign-in: the person chooses a 4–8 digit PIN. Afterwards the PIN is required.
 * The code is re-checked on every call; the role always comes from the code, never the client.
 */

function roleFor(code: string): Role | null {
  const c = accessCodes();
  if (codeMatches(code, c.monitoring)) return "monitoring";
  if (c.management && codeMatches(code, c.management)) return "management";
  if (codeMatches(code, c.agent)) return "agent";
  return null;
}

const clientKey = (req: Request) => (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";

export const POST = route(async (req) => {
  if (authMode() !== "code") return NextResponse.json({ error: "Access-code sign-in isn’t enabled." }, { status: 404 });
  if (isBlocked(clientKey(req))) {
    return NextResponse.json({ error: "Too many attempts. Wait a few minutes and try again." }, { status: 429 });
  }
  const b = await body<{ step?: string; code?: string; userId?: string; newPerson?: { name?: string; email?: string }; pin?: string; pinConfirm?: string }>(req);
  const role = roleFor(String(b.code || ""));
  if (!role) {
    recordCodeFailure(clientKey(req));
    await new Promise((r) => setTimeout(r, 400));
    throw new ValidationError("That access code isn’t right. Ask your Monitoring team for the current one.");
  }

  if (b.step === "check") {
    const r = await repo();
    const people = r
      .users()
      .filter((u) => u.active && u.role === role)
      .map((u) => ({ id: u.id, name: u.name, team: (u.teamId || "").toUpperCase(), hasPin: Boolean(u.pinHash) }))
      .sort((a, c) => a.name.localeCompare(c.name));
    return { role, people, canRegister: role !== "agent", firstRun: role === "monitoring" && r.dls().length === 0 };
  }

  if (!isValidPin(b.pin)) throw new ValidationError("Your PIN is 4 to 8 digits.");
  const pin = b.pin;

  const result = await mutate((r) => {
    let user = b.userId ? r.user(b.userId) : undefined;
    if (!user && b.newPerson && role !== "agent") {
      user = r.addStaff("system", { name: String(b.newPerson.name || ""), email: String(b.newPerson.email || ""), role });
    }
    if (!user || !user.active || user.role !== role) throw new ValidationError("Pick your name from the list.");
    if (user.pinLockedUntil && new Date(user.pinLockedUntil).getTime() > Date.now()) {
      throw new ValidationError("Too many wrong PINs. Try again in 15 minutes, or ask Monitoring to reset it.");
    }
    if (user.pinHash) {
      if (!verifyPin(pin, user.pinHash)) {
        r.recordPinFailure(user.id);
        return { ok: false as const };
      }
      r.clearPinFailures(user.id);
    } else {
      if (b.pinConfirm !== pin) throw new ValidationError("The two PINs don’t match.");
      r.setPin(user.id, hashPin(pin));
    }
    r.logSignIn(user.id);
    return { ok: true as const, id: user.id, role: user.role };
  });
  if (!result.ok) throw new ValidationError("Wrong PIN. After 5 tries it locks for 15 minutes.");

  const token = await signSession({ uid: result.id, role: result.role, exp: Math.floor(Date.now() / 1000) + SESSION_TTL }, sessionSecret());
  const res = NextResponse.json({ redirect: HOME_FOR_ROLE[result.role] });
  res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_TTL });
  return res;
});
