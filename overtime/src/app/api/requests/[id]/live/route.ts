import { requireUser } from "@/server/auth";
import { route } from "@/server/http";
import { NotFoundError, repo } from "@/server/store";
import { activity, requestCard } from "@/server/views";

type Ctx = { params: { id: string } };

/** Lightweight live feed for the mission screen (polled every few seconds). */
export const GET = route<Ctx>(async (_req, { params }) => {
  await requireUser("monitoring");
  const r = await repo();
  const req = r.request(params.id);
  if (!req) throw new NotFoundError("Request not found.");
  const feed = activity(r, r.audit().filter((a) => a.requestId === req.id && (a.action === "AGENT_CONFIRMED" || a.action === "AGENT_DECLINED")).slice(-6).reverse());
  return { card: requestCard(r, req), feed };
});

export const dynamic = "force-dynamic";
