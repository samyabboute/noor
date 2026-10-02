import type { Metadata } from "next";
import { requirePageUser } from "@/server/auth";
import { repo } from "@/server/store";
import { monitoringDirectory } from "@/server/views";
import { ListsView } from "@/components/monitoring/lists-view";

export const metadata: Metadata = { title: "Distribution lists" };
export const dynamic = "force-dynamic";

export default async function ListsPage() {
  await requirePageUser("monitoring");
  const dir = monitoringDirectory();
  const r = repo();
  const groups = r.groups().map((g) => ({ id: g.id, name: g.name, memberIds: g.memberIds, createdBy: r.user(g.createdBy)?.name || "—", createdAt: g.createdAt }));
  return <ListsView agents={dir.agents} lists={dir.lists} groups={groups} />;
}
