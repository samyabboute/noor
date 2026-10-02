import type { Metadata } from "next";
import { requirePageUser } from "@/server/auth";
import { repo } from "@/server/store";
import { requestCard } from "@/server/views";
import { RequestsList } from "@/components/monitoring/requests-list";

export const metadata: Metadata = { title: "Requests" };
export const dynamic = "force-dynamic";

export default async function RequestsPage({ searchParams }: { searchParams: { tab?: string } }) {
  await requirePageUser("monitoring");
  const r = await repo();
  const cards = r
    .requests()
    .filter((q) => q.status !== "cancelled")
    .map((q) => requestCard(r, q))
    .sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime));
  const tab = searchParams.tab === "draft" || searchParams.tab === "completed" ? searchParams.tab : "live";
  return <RequestsList cards={cards} initialTab={tab} />;
}
