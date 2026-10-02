import { requireUser } from "@/server/auth";
import { body, route } from "@/server/http";
import { mutate, repo, validateRequestInput } from "@/server/store";
import { requestCard } from "@/server/views";

type Ctx = { params: Record<string, string> };

export const GET = route<Ctx>(async () => {
  await requireUser("monitoring");
  const r = await repo();
  return { requests: r.requests().filter((q) => q.status !== "cancelled").map((q) => requestCard(r, q)) };
});

/** Create a request. `send: true` makes it live; otherwise it is saved as a draft. */
export const POST = route<Ctx>(async (req) => {
  const user = await requireUser("monitoring");
  const raw = await body<{ send?: boolean; draftId?: string }>(req);
  const send = raw.send === true;
  const created = await mutate((r) => {
    const input = validateRequestInput(raw, send, r);
    const req = r.createRequest(user.id, input, send, typeof raw.draftId === "string" ? raw.draftId : undefined);
    return { id: req.id, status: req.status };
  });
  return created;
});

export const dynamic = "force-dynamic";
