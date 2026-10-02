import { requireUser } from "@/server/auth";
import { body, route } from "@/server/http";
import { mutate } from "@/server/store";

type Ctx = { params: { id: string } };

/** Audit: the user opened a prepared message in their mail client. */
export const POST = route<Ctx>(async (req, { params }) => {
  const user = await requireUser("agent", "monitoring");
  const { kind } = await body<{ kind?: string }>(req);
  const k = ["confirmation", "announcement", "nudge"].includes(kind || "") ? kind! : "confirmation";
  await mutate((r) => (user.role === "agent" ? r.markEmailPrepared(user.id, params.id, k) : r.logEmailOpenedByMonitoring(user.id, params.id, k)));
  return { ok: true };
});
