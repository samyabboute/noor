import type { Metadata } from "next";
import { requirePageUser } from "@/server/auth";
import { repo } from "@/server/store";
import { monitoringDirectory } from "@/server/views";
import { fromMinutes, nowMinutes, todayISO } from "@/lib/time";
import { CreateRequestFlow, type DraftInit } from "@/components/monitoring/create-flow";

export const metadata: Metadata = { title: "New overtime request" };
export const dynamic = "force-dynamic";

export default async function NewRequestPage({ searchParams }: { searchParams: { draft?: string } }) {
  const user = await requirePageUser("monitoring");
  const dir = await monitoringDirectory();
  const r = await repo();
  const now = nowMinutes();
  // Suggest the usual 18:00 peak, or the next sensible slot if that has passed.
  const suggested = now < 17 * 60 ? "18:00" : fromMinutes(Math.min(23 * 60 + 30, Math.ceil((now + 60) / 15) * 15));

  let draft: DraftInit | null = null;
  const d = searchParams.draft ? r.request(searchParams.draft) : undefined;
  if (d && d.status === "draft") {
    draft = {
      id: d.id,
      title: d.title,
      date: d.date,
      startTime: d.startTime,
      durationMin: d.durationMin,
      flexible: d.flexible,
      target: d.target,
      subject: d.subject,
      body: d.body,
      confirmationTemplateId: d.confirmationTemplateId,
      selection: Object.fromEntries(r.recipientsFor(d.id).map((x) => [x.userId, x.source])),
    };
  }

  return <CreateRequestFlow me={{ id: user.id, name: user.name }} today={todayISO()} suggestedStart={suggested} directory={dir} draft={draft} />;
}
