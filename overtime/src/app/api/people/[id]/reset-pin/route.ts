import { requireUser } from "@/server/auth";
import { route } from "@/server/http";
import { mutate } from "@/server/store";

type Ctx = { params: { id: string } };

/** The person chooses a new PIN at their next sign-in. */
export const POST = route<Ctx>(async (_req, { params }) => {
  const user = await requireUser("monitoring");
  await mutate((r) => r.resetPin(user.id, params.id));
  return { ok: true };
});
