import type { EmailTemplate } from "@/lib/types";
import { requireUser } from "@/server/auth";
import { body, route } from "@/server/http";
import { repo } from "@/server/store";

type Ctx = { params: Record<string, string> };

export const POST = route<Ctx>(async (req) => {
  const user = await requireUser("monitoring");
  const input = await body<Partial<EmailTemplate>>(req);
  return { template: repo().saveTemplate(user.id, input) };
});
