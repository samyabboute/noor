import { NextResponse } from "next/server";
import { regionForCountry } from "../../lib/regions";

export const dynamic = "force-dynamic";

/**
 * Detects the visitor's country from edge/CDN geo headers (Vercel sets
 * `x-vercel-ip-country`; a couple of common CDN fallbacks are checked too).
 * No third-party service, no API key. Returns the served region + currency.
 */
export async function GET(request: Request) {
  const h = request.headers;
  const country =
    h.get("x-vercel-ip-country") ||
    h.get("cf-ipcountry") ||
    h.get("x-country-code") ||
    "";

  const region = regionForCountry(country || undefined);
  return NextResponse.json(
    { country: region.country, currency: region.currency, name: region.name, detected: Boolean(country) },
    { headers: { "cache-control": "no-store" } },
  );
}
