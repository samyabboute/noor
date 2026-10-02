import { requireUser } from "@/server/auth";
import { route } from "@/server/http";
import { mutate } from "@/server/store";

type Ctx = { params: { id: string } };

export const DELETE = route<Ctx>(async (_req, { params }) => {
  const user = await requireUser("monitoring");
  await mutate((r) => r.deleteDraft(user.id, params.id));
  return { ok: true };
});
