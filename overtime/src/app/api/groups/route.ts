import { requireUser } from "@/server/auth";
import { body, route } from "@/server/http";
import { repo } from "@/server/store";

type Ctx = { params: Record<string, string> };

export const POST = route<Ctx>(async (req) => {
  const user = await requireUser("monitoring");
  const { name, memberIds } = await body<{ name?: string; memberIds?: string[] }>(req);
  return { group: repo().createGroup(user.id, String(name || ""), Array.isArray(memberIds) ? memberIds.map(String) : []) };
});
