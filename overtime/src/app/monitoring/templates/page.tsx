import type { Metadata } from "next";
import { requirePageUser } from "@/server/auth";
import { repo } from "@/server/store";
import { TemplatesView } from "@/components/monitoring/templates-view";

export const metadata: Metadata = { title: "Templates" };
export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const user = await requirePageUser("monitoring");
  const r = repo();
  const templates = r.templates().map((t) => ({ ...t, updatedByName: r.user(t.updatedBy)?.name || "—" }));
  return <TemplatesView templates={templates} me={user.name} />;
}
