import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Role, SessionUser } from "@/lib/types";
import { HOME_FOR_ROLE, SESSION_COOKIE, verifySession } from "@/lib/session-token";
import { authMode, sessionSecret } from "./config";
import { authOptions } from "./nextauth";
import { repo } from "./store";

export class AuthError extends Error {
  constructor(
    message: string,
    public status: 401 | 403,
  ) {
    super(message);
  }
}

/** Resolves the signed-in person against the directory. Never trusts the client. */
export async function getSessionUser(): Promise<SessionUser | null> {
  let uid: string | undefined;
  let role: Role | undefined;
  if (authMode() === "demo") {
    const payload = await verifySession(cookies().get(SESSION_COOKIE)?.value, sessionSecret());
    uid = payload?.uid;
    role = payload?.role;
  } else {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    const user = email ? repo().userByEmail(email) : undefined;
    uid = user?.id;
    role = (session?.user as { role?: Role } | undefined)?.role;
  }
  if (!uid) return null;
  const user = repo().user(uid);
  if (!user || !user.active) return null;
  // Demo: the directory decides the role, a cookie can't escalate it.
  // Entra: the role comes from the user's Entra security groups (the IdP is authoritative).
  const effective: Role = authMode() === "entra" && role ? role : user.role;
  if (authMode() === "demo" && role !== user.role) return null;
  return { id: user.id, name: user.name, email: user.email, role: effective, teamId: user.teamId, language: user.language };
}

/** For route handlers. */
export async function requireUser(...roles: Role[]) {
  const user = await getSessionUser();
  if (!user) throw new AuthError("Sign in to continue.", 401);
  if (roles.length && !roles.includes(user.role)) throw new AuthError("You don't have access to this.", 403);
  return user;
}

/** For pages: middleware already gates paths; this is defence in depth. */
export async function requirePageUser(role: Role) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== role) redirect(HOME_FOR_ROLE[user.role]);
  return user;
}
