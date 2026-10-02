import "server-only";
import { NextResponse } from "next/server";
import { AuthError } from "./auth";
import { NotFoundError, ValidationError } from "./store";

/**
 * Route wrapper: same-origin check on writes (CSRF), uniform JSON errors,
 * and no internal details leaked to the client.
 */
export function route<C>(fn: (req: Request, ctx: C) => Promise<unknown>) {
  return async (req: Request, ctx: C) => {
    try {
      if (req.method !== "GET" && req.method !== "HEAD") {
        const origin = req.headers.get("origin");
        const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
        if (origin && host && new URL(origin).host !== host) {
          return NextResponse.json({ error: "Cross-site request blocked." }, { status: 403 });
        }
      }
      const data = await fn(req, ctx);
      return data instanceof Response ? data : NextResponse.json(data ?? { ok: true });
    } catch (e) {
      // Let Next.js control-flow signals (dynamic usage, redirects, notFound) through.
      if (typeof (e as { digest?: unknown })?.digest === "string") throw e;
      if (e instanceof AuthError || e instanceof ValidationError || e instanceof NotFoundError) {
        return NextResponse.json({ error: e.message }, { status: e.status });
      }
      console.error("[overtime] unexpected error", e);
      return NextResponse.json({ error: "Something went wrong on our side. Nothing was lost — please try again." }, { status: 500 });
    }
  };
}

export async function body<T = Record<string, unknown>>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new ValidationError("Malformed request.");
  }
}
