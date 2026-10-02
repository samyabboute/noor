import type { Role } from "@/lib/types";
import { requireUser } from "@/server/auth";
import { body, route } from "@/server/http";
import { mutate } from "@/server/store";

type Ctx = { params: Record<string, string> };

/** Add a Monitoring or Management colleague (agents come from the distribution lists). */
export const POST = route<Ctx>(async (req) => {
  const user = await requireUser("monitoring");
  const b = await body<{ name?: string; email?: string; role?: Role }>(req);
  const u = await mutate((r) => r.addStaff(user.id, { name: String(b.name || ""), email: String(b.email || ""), role: b.role === "management" ? "management" : "monitoring" }));
  return { id: u.id };
});
