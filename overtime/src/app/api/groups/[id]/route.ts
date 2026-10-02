import { requireUser } from "@/server/auth";
import { route } from "@/server/http";
import { repo } from "@/server/store";

type Ctx = { params: { id: string } };

export const DELETE = route<Ctx>(async (_req, { params }) => {
  const user = await requireUser("monitoring");
  repo().deleteGroup(user.id, params.id);
  return { ok: true };
});
