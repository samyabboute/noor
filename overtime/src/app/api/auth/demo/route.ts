import { NextResponse } from "next/server";
import { isDemoMode, sessionSecret } from "@/server/config";
import { repo } from "@/server/store";
import { HOME_FOR_ROLE, SESSION_COOKIE, SESSION_TTL, signSession } from "@/lib/session-token";
import { body, route } from "@/server/http";
import { ValidationError } from "@/server/store";

/** DEMO MODE ONLY — sign in as a seeded persona. Disabled whenever Entra ID is active. */
export const POST = route(async (req) => {
  if (!isDemoMode()) return NextResponse.json({ error: "Demo sign-in is disabled in production mode." }, { status: 404 });
  const { userId } = await body<{ userId?: string }>(req);
  const user = userId ? repo().user(userId) : undefined;
  if (!user || !user.active) throw new ValidationError("Unknown demo persona.");
  if (user.role === "agent") repo().markDemoAgentActive(user.id);
  const token = await signSession({ uid: user.id, role: user.role, exp: Math.floor(Date.now() / 1000) + SESSION_TTL }, sessionSecret());
  const res = NextResponse.json({ redirect: HOME_FOR_ROLE[user.role] });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL,
  });
  return res;
});
