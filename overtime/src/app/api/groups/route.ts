import { requireUser } from "@/server/auth";
import { body, route } from "@/server/http";
import { mutate } from "@/server/store";

type Ctx = { params: Record<string, string> };

export const POST = route<Ctx>(async (req) => {
  const user = await requireUser("monitoring");
  const { name, memberIds } = await body<{ name?: string; memberIds?: string[] }>(req);
  return { group: await mutate((r) => r.createGroup(user.id, String(name || ""), Array.isArray(memberIds) ? memberIds.map(String) : [])) };
});
