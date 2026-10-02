import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { HOME_FOR_ROLE, SESSION_COOKIE, canAccess, verifySession } from "@/lib/session-token";
import type { Role } from "@/lib/types";

/**
 * Role gate for every page. Agents can't reach Monitoring or Insights, and
 * vice versa. API routes re-check on the server (see server/auth.ts).
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const entra =
    process.env.AUTH_MODE === "entra" ||
    (!process.env.AUTH_MODE && !!process.env.AZURE_AD_CLIENT_ID && !!process.env.AZURE_AD_CLIENT_SECRET && !!process.env.AZURE_AD_TENANT_ID);

  let role: Role | undefined;
  if (entra) {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET });
    role = (token as { role?: Role } | null)?.role;
  } else {
    // Demo and access-code sessions share the signed cookie. Outside demo, AUTH_SECRET is mandatory.
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || (process.env.ACCESS_CODE_AGENT ? "" : "overtime-demo-only-secret-change-me");
    role = secret ? (await verifySession(req.cookies.get(SESSION_COOKIE)?.value, secret))?.role : undefined;
  }

  if (pathname === "/" || pathname === "/login") {
    const switching = pathname === "/login" && req.nextUrl.searchParams.has("switch");
    if (role && !switching) return NextResponse.redirect(new URL(HOME_FOR_ROLE[role], req.url));
    if (pathname === "/") return NextResponse.redirect(new URL("/login", req.url));
    return NextResponse.next();
  }
  if (!role) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (!canAccess(pathname, role)) return NextResponse.redirect(new URL(HOME_FOR_ROLE[role], req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/agent/:path*", "/monitoring/:path*", "/insights/:path*"],
};
