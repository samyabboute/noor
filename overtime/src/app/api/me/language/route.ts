import type { Language } from "@/lib/types";
import { requireUser } from "@/server/auth";
import { body, route } from "@/server/http";
import { mutate } from "@/server/store";

type Ctx = { params: Record<string, string> };

/** Agents choose the language of their confirmation email. */
export const POST = route<Ctx>(async (req) => {
  const user = await requireUser("agent", "monitoring", "management");
  const { language } = await body<{ language?: Language }>(req);
  await mutate((r) => r.setLanguage(user.id, language as Language));
  return { ok: true };
});
