import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth";
import { route } from "@/server/http";

/**
 * Microsoft Graph send — the plug-in point for later.
 * Implementation sketch once Entra delegated access (Mail.Send) is approved:
 *   1. read the user's access token from the NextAuth JWT (never stored client-side)
 *   2. POST https://graph.microsoft.com/v1.0/me/sendMail with { message, saveToSentItems: true }
 * Until then this endpoint answers honestly instead of pretending to send.
 */
export const POST = route(async () => {
  await requireUser("agent", "monitoring");
  return NextResponse.json(
    { error: "Sending through Microsoft Graph isn't enabled for this workspace yet. Use Open in Outlook instead." },
    { status: 501 },
  );
});
