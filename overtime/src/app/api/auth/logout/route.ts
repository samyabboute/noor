import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-token";
import { route } from "@/server/http";

export const POST = route(async () => {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
});
