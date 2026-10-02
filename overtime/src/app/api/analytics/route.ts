import { requireUser } from "@/server/auth";
import { analytics, parseFilters } from "@/server/analytics";
import { route } from "@/server/http";

type Ctx = { params: Record<string, string> };

/** Read-only aggregates for Management (and Monitoring's analytics view). Agents get 403. */
export const GET = route<Ctx>(async (req) => {
  await requireUser("management", "monitoring");
  return analytics(parseFilters(new URL(req.url).searchParams));
});

export const dynamic = "force-dynamic";
