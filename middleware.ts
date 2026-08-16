import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Protects the admin console. While auth is not yet configured
 * (NEXT_PUBLIC_GOOGLE_ENABLED !== "1") the console stays open as a preview.
 * Once configured, only signed-in ADMINs may enter; others go to /konto.
 */
export async function middleware(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_GOOGLE_ENABLED !== "1") {
    return NextResponse.next();
  }
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((token as any)?.role === "ADMIN") {
    return NextResponse.next();
  }
  const url = req.nextUrl.clone();
  url.pathname = "/konto";
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin/:path*"] };
