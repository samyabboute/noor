"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { RequestCard } from "@/server/views";
import { formatDateShort, formatDuration } from "@/lib/time";
import { useLiveRefresh } from "@/lib/use-live";
import { api } from "@/lib/api";
import { SectionTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Segmented } from "@/components/ui/select";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ProgressBar } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

type Tab = "live" | "draft" | "completed";

export function RequestsList({ cards, initialTab }: { cards: RequestCard[]; initialTab: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const router = useRouter();
  const { toast } = useToast();
  useLiveRefresh(8000, tab === "live");
  const rows = cards.filter((c) => c.status === tab);
  const count = (t: Tab) => cards.filter((c) => c.status === t).length;

  async function discard(id: string) {
    try {
      await api(`/api/requests/${id}`, { method: "DELETE" });
      toast({ title: "Draft discarded" });
      router.refresh();
    } catch (e) {
      toast({ tone: "error", title: "Couldn’t discard", description: (e as Error).message });
    }
  }

  const columns: Column<RequestCard>[] = [
    {
      key: "title",
      header: "Request",
      sort: (c) => c.title,
      cell: (c) => (
        <span>
          <span className="block font-medium text-ink-900">{c.title}</span>
          <span className="block text-[12px] text-ink-400">
            {c.id} · {c.ownerName}
          </span>
        </span>
      ),
    },
    { key: "date", header: "When", sort: (c) => c.date + c.startTime, cell: (c) => <span className="tnum text-ink-600">{formatDateShort(c.date)} · {c.startTime} → {c.endTime}</span> },
    { key: "who", header: "Reached", sort: (c) => c.stats.recipients, cell: (c) => <span className="tnum text-ink-600">{c.stats.recipients}</span> },
    {
      key: "cov",
      header: "Confirmed",
      sort: (c) => c.stats.coverage,
      cell: (c) => (
        <span className="flex min-w-[140px] items-center gap-3">
          <ProgressBar value={c.stats.coverage} tone="covered" className="w-20" label={`${c.title} coverage`} />
          <span className="tnum text-ink-700">
            {c.stats.confirmed}/{c.target}
          </span>
        </span>
      ),
    },
    { key: "min", header: "Extra time", sort: (c) => c.stats.minutes, cell: (c) => <span className="tnum text-ink-600">{c.stats.minutes ? `+${formatDuration(c.stats.minutes)}` : "—"}</span> },
    { key: "status", header: "Status", cell: (c) => <StatusBadge status={c.status} kind="request" /> },
  ];

  const draftColumns: Column<RequestCard>[] = [
    ...columns.slice(0, 3),
    {
      key: "act",
      header: "",
      align: "right",
      cell: (c) => (
        <span className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="ghost" onClick={() => discard(c.id)}>
            Discard
          </Button>
          <Button size="sm" variant="secondary" href={`/monitoring/new?draft=${c.id}`}>
            Continue
          </Button>
        </span>
      ),
    },
  ];

  return (
    <div>
      <SectionTitle
        eyebrow="Requests"
        title="Every request, one lifecycle."
        description="Draft → live → completed. Open any request to see exactly who answered, and when."
        action={
          <Button href="/monitoring/new" icon={<Plus size={16} />}>
            New request
          </Button>
        }
      />
      <div className="mt-10">
        <Segmented
          label="Request status"
          value={tab}
          onChange={setTab}
          options={[
            { value: "live", label: `Live ${count("live")}` },
            { value: "draft", label: `Drafts ${count("draft")}` },
            { value: "completed", label: `Completed ${count("completed")}` },
          ]}
        />
      </div>
      <div className="surface mt-4 overflow-hidden">
        <DataTable
          caption={`${tab} requests`}
          rows={rows}
          rowKey={(c) => c.id}
          columns={tab === "draft" ? draftColumns : columns}
          initialSort={{ key: "date", dir: "desc" }}
          onRowClick={(c) => router.push(c.status === "draft" ? `/monitoring/new?draft=${c.id}` : `/monitoring/requests/${c.id}`)}
          empty={
            <EmptyState
              art={tab === "draft" ? "inbox" : "ring"}
              title={tab === "live" ? "No active coverage request." : tab === "draft" ? "No drafts." : "No overtime requests yet."}
              description={tab === "live" ? "Launch one when queues start to build." : tab === "draft" ? "Save a request as a draft to finish it later." : "Completed requests collect here with their full response history."}
              action={tab !== "completed" ? <Button href="/monitoring/new" icon={<Plus size={16} />}>Create overtime request</Button> : undefined}
            />
          }
          mobile={(c) => (
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium">{c.title}</p>
                <p className="tnum mt-0.5 text-[12.5px] text-ink-400">
                  {formatDateShort(c.date)} · {c.startTime} → {c.endTime} · {c.stats.confirmed}/{c.target} in
                </p>
              </div>
              <StatusBadge status={c.status} kind="request" />
            </div>
          )}
        />
      </div>
    </div>
  );
}
