import { requireUser } from "@/server/auth";
import { body, route } from "@/server/http";
import { repo } from "@/server/store";

type Ctx = { params: { id: string } };

/** Audit: the user opened a prepared message in their mail client. */
export const POST = route<Ctx>(async (req, { params }) => {
  const user = await requireUser("agent", "monitoring");
  const { kind } = await body<{ kind?: string }>(req);
  const k = ["confirmation", "announcement", "nudge"].includes(kind || "") ? kind! : "confirmation";
  if (user.role === "agent") repo().markEmailPrepared(user.id, params.id, k);
  else repo().logEmailOpenedByMonitoring(user.id, params.id, k);
  return { ok: true };
});
