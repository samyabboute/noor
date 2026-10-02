import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePageUser } from "@/server/auth";
import { monitoringDirectory, pendingNudgeDraft, requestDetail } from "@/server/views";
import { RequestDetailView } from "@/components/monitoring/request-detail";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  return { title: params.id };
}

export default async function RequestPage({ params, searchParams }: { params: { id: string }; searchParams: { launched?: string } }) {
  await requirePageUser("monitoring");
  const detail = requestDetail(params.id);
  if (!detail) notFound();
  const dir = monitoringDirectory();
  return (
    <RequestDetailView
      detail={detail}
      nudge={pendingNudgeDraft(params.id)}
      directory={{ agents: dir.agents, lists: dir.lists, groups: dir.groups }}
      launched={searchParams.launched === "1" && detail.card.status === "live"}
    />
  );
}
