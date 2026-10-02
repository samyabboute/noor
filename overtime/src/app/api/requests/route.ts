import { requireUser } from "@/server/auth";
import { body, route } from "@/server/http";
import { repo, validateRequestInput } from "@/server/store";
import { requestCard } from "@/server/views";

type Ctx = { params: Record<string, string> };

export const GET = route<Ctx>(async () => {
  await requireUser("monitoring");
  const r = repo();
  return { requests: r.requests().filter((q) => q.status !== "cancelled").map((q) => requestCard(r, q)) };
});

/** Create a request. `send: true` makes it live; otherwise it is saved as a draft. */
export const POST = route<Ctx>(async (req) => {
  const user = await requireUser("monitoring");
  const raw = await body<{ send?: boolean; draftId?: string }>(req);
  const send = raw.send === true;
  const input = validateRequestInput(raw, send);
  const created = repo().createRequest(user.id, input, send, typeof raw.draftId === "string" ? raw.draftId : undefined);
  return { id: created.id, status: created.status };
});

export const dynamic = "force-dynamic";
