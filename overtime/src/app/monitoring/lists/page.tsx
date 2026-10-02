import type { Metadata } from "next";
import { requirePageUser } from "@/server/auth";
import { repo } from "@/server/store";
import { monitoringDirectory } from "@/server/views";
import { ListsView } from "@/components/monitoring/lists-view";

export const metadata: Metadata = { title: "Distribution lists" };
export const dynamic = "force-dynamic";

export default async function ListsPage() {
  const me = await requirePageUser("monitoring");
  const dir = await monitoringDirectory();
  const r = await repo();
  const groups = r.groups().map((g) => ({ id: g.id, name: g.name, memberIds: g.memberIds, createdBy: r.user(g.createdBy)?.name || "—", createdAt: g.createdAt }));
  const staff = r
    .users()
    .filter((u) => u.active && (u.role === "monitoring" || u.role === "management"))
    .map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role as "monitoring" | "management" }))
    .sort((a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name));
  return <ListsView agents={dir.agents} lists={dir.lists} groups={groups} staff={staff} meId={me.id} />;
}
