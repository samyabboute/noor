"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { BellRing, ChevronLeft, Flag, Mail, UserPlus, X } from "lucide-react";
import type { ActivityItem, RecipientRow, RequestCard } from "@/server/views";
import type { EmailDraft } from "@/lib/email";
import { EmailPrepareError, EmailService } from "@/lib/email";
import type { RecipientStatus } from "@/lib/types";
import { formatClock, formatDateLong, formatDuration, formatSeconds } from "@/lib/time";
import { api } from "@/lib/api";
import { useLiveRefresh } from "@/lib/use-live";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { LiveDot, StatusBadge } from "@/components/ui/badge";
import { RadialProgress } from "@/components/ui/progress";
import { CountUp } from "@/components/ui/count-up";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Segmented } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { Timeline } from "@/components/ui/timeline";
import { Drawer, Modal } from "@/components/ui/overlay";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { LaunchSequence } from "./launch-sequence";
import { RecipientSelector, selectionToPayload, type AgentLite, type GroupLite, type ListLite, type Selection } from "./recipient-selector";

type Filter = "all" | "confirmed" | "pending" | "declined";

export function RequestDetailView({
  detail,
  nudge,
  directory,
  launched,
}: {
  detail: { card: RequestCard; rows: RecipientRow[]; timeline: ActivityItem[]; announcement: EmailDraft; owner: { name: string; email: string } | null; cc: { name: string }[] };
  nudge: EmailDraft | null;
  directory: { agents: AgentLite[]; lists: ListLite[]; groups: GroupLite[] };
  launched: boolean;
}) {
  const { card, rows, timeline } = detail;
  const live = card.status === "live";
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [showLaunch, setShowLaunch] = useState(launched);
  const [filter, setFilter] = useState<Filter>("all");
  const [adding, setAdding] = useState(false);
  const [addSel, setAddSel] = useState<Selection>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);
  useLiveRefresh(4000, live && !showLaunch);

  const filtered = useMemo(
    () =>
      rows.filter((r) =>
        filter === "all" ? true : filter === "pending" ? r.status === "sent" || r.status === "opened" : filter === "declined" ? r.status === "declined" || r.status === "expired" : r.status === filter,
      ),
    [rows, filter],
  );

  function openDraft(draft: EmailDraft | null, kind: "announcement" | "nudge") {
    if (!draft) return;
    try {
      try {
        EmailService.openOutlookCompose(draft, "desktop");
      } catch (e) {
        // Long BCC lists overflow mailto: fall back to Outlook on the web.
        if (e instanceof EmailPrepareError && e.reason === "too_long") EmailService.openOutlookCompose(draft, "web");
        else throw e;
      }
      api(`/api/requests/${card.id}/email`, { method: "POST", json: { kind } }).catch(() => {});
    } catch {
      toast({ tone: "error", title: "We couldn’t prepare the Outlook message.", description: "Your request is still live. Try again, or allow pop-ups for Outlook on the web." });
    }
  }

  async function removeAgent(row: RecipientRow) {
    setBusy(row.userId);
    try {
      await api(`/api/requests/${card.id}/recipients?userId=${encodeURIComponent(row.userId)}`, { method: "DELETE" });
      toast({ title: `${row.name} removed`, description: "They’ll no longer see this request." });
      router.refresh();
    } catch (e) {
      toast({ tone: "error", title: "Couldn’t remove", description: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  async function addAgents() {
    const items = selectionToPayload(addSel);
    if (!items.length) return;
    setBusy("add");
    try {
      const { added } = await api<{ added: number }>(`/api/requests/${card.id}/recipients`, { method: "POST", json: { items } });
      toast({ title: `${added} ${added === 1 ? "agent" : "agents"} added`, description: "They can answer right away." });
      setAdding(false);
      setAddSel({});
      router.refresh();
    } catch (e) {
      toast({ tone: "error", title: "Couldn’t add agents", description: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  async function closeRequest() {
    setBusy("close");
    try {
      await api(`/api/requests/${card.id}/close`, { method: "POST" });
      toast({ title: "Request closed", description: "Pending agents were marked as no reply." });
      setConfirmClose(false);
      router.refresh();
    } catch (e) {
      toast({ tone: "error", title: "Couldn’t close the request", description: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  const columns: Column<RecipientRow>[] = [
    {
      key: "name",
      header: "Agent",
      sort: (r) => r.name,
      cell: (r) => (
        <span className="flex items-center gap-3">
          <Avatar name={r.name} size={30} ring={r.status === "confirmed" ? "covered" : undefined} />
          <span className="min-w-0">
            <span className="block truncate font-medium text-ink-900">{r.name}</span>
            <span className="block truncate text-[12px] text-ink-400">{r.source}</span>
          </span>
        </span>
      ),
    },
    { key: "team", header: "Team", sort: (r) => r.teamCode, cell: (r) => <span className="text-ink-600">{r.teamCode}</span> },
    { key: "req", header: "Request", cell: (r) => <span className="tnum text-ink-600">+{r.minutes ?? card.durationMin} min</span> },
    { key: "logout", header: "Logout", sort: (r) => r.logout || "", cell: (r) => <span className="tnum font-medium text-ink-900">{r.logout || <span className="text-ink-300">—</span>}</span> },
    {
      key: "resp",
      header: "Response",
      sort: (r) => r.responseSec ?? 1e9,
      desktopOnly: true,
      cell: (r) =>
        r.respondedAt ? (
          <span className="tnum text-ink-600">
            {formatClock(r.respondedAt)} <span className="text-ink-400">· {formatSeconds(r.responseSec || 0)}</span>
          </span>
        ) : r.openedAt ? (
          <span className="text-ink-400">Seen {formatClock(r.openedAt)}</span>
        ) : (
          <span className="text-ink-300">—</span>
        ),
    },
    { key: "status", header: "Status", sort: (r) => r.status, cell: (r) => <StatusBadge status={r.status} /> },
    {
      key: "x",
      header: "",
      align: "right",
      cell: (r) =>
        live && r.status !== "confirmed" ? (
          <button
            onClick={() => removeAgent(r)}
            disabled={busy === r.userId}
            aria-label={`Remove ${r.name} from this request`}
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-300 opacity-0 transition hover:bg-ink-100 hover:text-ink-900 focus:opacity-100 group-hover:opacity-100"
          >
            <X size={15} />
          </button>
        ) : null,
    },
  ];

  const counts: Record<Filter, number> = {
    all: rows.length,
    confirmed: card.stats.confirmed,
    pending: card.stats.pending,
    declined: rows.filter((r) => r.status === "declined" || r.status === "expired").length,
  };

  return (
    <>
      <Link href="/monitoring/requests" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-400 transition hover:text-ink-900">
        <ChevronLeft size={15} /> Requests
      </Link>

      <header className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <StatusBadge status={card.status} kind="request" />
            <span className="tnum text-[13px] text-ink-400">{card.id}</span>
          </div>
          <h1 className="mt-4 text-display-md font-semibold">{card.title}</h1>
          <p className="mt-3 text-[15px] text-ink-500">
            {formatDateLong(card.date)} · <span className="tnum font-medium text-ink-900">{card.startTime} → {card.endTime}</span> · by {card.ownerName}
          </p>
        </div>
        {live && (
          <div className="flex shrink-0 flex-wrap gap-2 lg:flex-nowrap">
            <Button variant="secondary" icon={<Mail size={15} />} onClick={() => openDraft(detail.announcement, "announcement")}>
              Announce in Outlook
            </Button>
            <Button variant="secondary" icon={<UserPlus size={15} />} onClick={() => setAdding(true)}>
              Add agents
            </Button>
            <Button variant="ghost" icon={<Flag size={15} />} onClick={() => setConfirmClose(true)}>
              Close
            </Button>
          </div>
        )}
      </header>

      <section className="mt-10 grid gap-3 lg:grid-cols-[1fr_340px]" aria-label="Coverage">
        <div className="surface flex flex-col items-center gap-8 p-6 sm:flex-row sm:p-8">
          <RadialProgress value={card.stats.coverage} secondary={card.target ? card.stats.pending / card.target : 0} size={200} stroke={12} label={`${Math.round(card.stats.coverage * 100)}% of needed coverage confirmed`}>
            <div>
              <p className="tnum text-[3.25rem] font-semibold leading-none tracking-[-0.05em]">
                <CountUp value={Math.round(card.stats.coverage * 100)} />
                <span className="text-2xl text-ink-300">%</span>
              </p>
              <p className="eyebrow mt-2">Covered</p>
            </div>
          </RadialProgress>
          <div className="w-full flex-1">
            <p className="text-[22px] font-semibold leading-snug tracking-[-0.02em]">
              <span className="tnum">{card.stats.confirmed}</span> of <span className="tnum">{card.target}</span> agents confirmed.
              {live && card.stats.pending > 0 && (
                <span className="text-ink-400">
                  {" "}
                  <span className="tnum">{card.stats.pending}</span> {card.stats.pending === 1 ? "response" : "responses"} still pending.
                </span>
              )}
            </p>
            <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ["Reached", String(card.stats.recipients)],
                ["Declined", String(card.stats.declined)],
                ["Extra time", card.stats.minutes ? `+${formatDuration(card.stats.minutes)}` : "—"],
                ["Avg. reply", card.stats.avgResponseSec != null ? formatSeconds(card.stats.avgResponseSec) : "—"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="eyebrow">{k}</dt>
                  <dd className="tnum mt-1.5 text-xl font-semibold tracking-[-0.02em]">{v}</dd>
                </div>
              ))}
            </dl>
            {live && card.stats.pending > 0 && nudge && (
              <Button variant="primary" size="sm" className="mt-6" icon={<BellRing size={14} />} onClick={() => openDraft(nudge, "nudge")}>
                Nudge {card.stats.pending} pending in Outlook
              </Button>
            )}
          </div>
        </div>
        <div className="surface p-6">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Activity</p>
            {live && (
              <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-500">
                <LiveDot size="sm" /> Live
              </span>
            )}
          </div>
          <div className="mt-5 max-h-[260px] overflow-y-auto pr-1">
            <Timeline items={timeline.slice(0, 20)} />
          </div>
        </div>
      </section>

      <section className="surface mt-3 overflow-hidden" aria-labelledby="who-title">
        <div className="flex flex-col gap-4 px-5 pb-4 pt-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <h2 id="who-title" className="text-xl font-semibold tracking-[-0.02em]">
            Who’s in?
          </h2>
          <Segmented
            label="Filter recipients"
            size="sm"
            value={filter}
            onChange={setFilter}
            options={(["all", "confirmed", "pending", "declined"] as Filter[]).map((f) => ({ value: f, label: `${f[0].toUpperCase()}${f.slice(1)} ${counts[f]}` }))}
          />
        </div>
        <DataTable
          caption="Recipients and their responses"
          rows={filtered}
          rowKey={(r) => r.userId}
          columns={columns}
          empty={<EmptyState compact art="people" title={filter === "all" ? "No agents on this request." : "No responses yet."} description={filter === "all" ? "Add agents to start collecting answers." : "Answers appear here the moment agents respond."} />}
          mobile={(r) => (
            <div className="flex items-center gap-3">
              <Avatar name={r.name} size={34} ring={r.status === "confirmed" ? "covered" : undefined} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium">{r.name}</p>
                <p className="truncate text-[12.5px] text-ink-400">
                  {r.teamCode} · {r.logout ? <span className="tnum">until {r.logout}</span> : `+${card.durationMin} min`}
                </p>
              </div>
              <StatusBadge status={r.status as RecipientStatus} />
            </div>
          )}
        />
      </section>

      <Drawer
        open={adding}
        onClose={() => setAdding(false)}
        title="Add agents"
        description="They’ll see the request immediately."
        width={880}
        footer={
          <>
            <Button variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button loading={busy === "add"} disabled={!Object.keys(addSel).length} onClick={addAgents}>
              Add {Object.keys(addSel).length || ""} {Object.keys(addSel).length === 1 ? "agent" : "agents"}
            </Button>
          </>
        }
      >
        <RecipientSelector agents={directory.agents} lists={directory.lists} groups={directory.groups} value={addSel} onChange={setAddSel} exclude={rows.map((r) => r.userId)} />
      </Drawer>

      <Modal
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        size="sm"
        title="Close this request?"
        description={`${card.stats.pending} pending ${card.stats.pending === 1 ? "agent" : "agents"} will be marked as no reply. Confirmed agents keep their overtime.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmClose(false)}>
              Keep it live
            </Button>
            <Button loading={busy === "close"} onClick={closeRequest}>
              Close request
            </Button>
          </>
        }
      >
        <p className={cn("text-sm text-ink-500")}>Requests also close on their own when coverage starts at <span className="tnum font-medium text-ink-900">{card.startTime}</span>.</p>
      </Modal>

      <AnimatePresence>
        {showLaunch && (
          <LaunchSequence
            initial={card}
            onAnnounce={() => openDraft(detail.announcement, "announcement")}
            onClose={() => {
              setShowLaunch(false);
              router.replace(pathname, { scroll: false });
              router.refresh();
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
