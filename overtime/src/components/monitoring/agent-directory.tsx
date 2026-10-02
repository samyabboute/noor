"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { Search } from "lucide-react";
import { formatDuration, relativeTime } from "@/lib/time";
import { SectionTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";

interface Agent {
  id: string;
  name: string;
  email: string;
  teamCode: string;
  language: string;
  active: boolean;
  shiftEnd: string;
  lists: string[];
  asked: number;
  confirmed: number;
  minutes: number;
  rate: number;
  lastResponse: string | null;
  hasPin: boolean;
}

export function AgentDirectory({ agents, pins }: { agents: Agent[]; pins: boolean }) {
  const [q, setQ] = useState("");
  const [team, setTeam] = useState("all");
  const router = useRouter();
  const { toast } = useToast();
  const teams = useMemo(() => [...new Set(agents.map((a) => a.teamCode).filter(Boolean))].sort(), [agents]);

  async function resetPin(a: Agent) {
    try {
      await api(`/api/people/${a.id}/reset-pin`, { method: "POST" });
      toast({ title: `PIN reset for ${a.name}`, description: "They choose a new one at their next sign-in." });
      router.refresh();
    } catch (e) {
      toast({ tone: "error", title: "Couldn’t reset the PIN", description: (e as Error).message });
    }
  }
  const rows = useMemo(
    () => agents.filter((a) => (team === "all" || a.teamCode === team) && (a.name + " " + a.email).toLowerCase().includes(q.trim().toLowerCase())),
    [agents, q, team],
  );

  const columns: Column<Agent>[] = [
    {
      key: "name",
      header: "Agent",
      sort: (a) => a.name,
      cell: (a) => (
        <span className="flex items-center gap-3">
          <Avatar name={a.name} size={30} />
          <span className="min-w-0">
            <span className="flex items-center gap-2 font-medium text-ink-900">
              {a.name} {!a.active && <Badge tone="muted">On leave</Badge>}
            </span>
            <span className="block truncate text-[12px] text-ink-400">{a.email}</span>
          </span>
        </span>
      ),
    },
    { key: "team", header: "Team", sort: (a) => a.teamCode, cell: (a) => <span className="text-ink-600">{a.teamCode}</span> },
    { key: "lists", header: "Distribution lists", cell: (a) => <span className="flex flex-wrap gap-1">{a.lists.map((l) => <Badge key={l}>{l}</Badge>)}</span> },
    { key: "shift", header: "Usual logout", sort: (a) => a.shiftEnd, cell: (a) => <span className="tnum text-ink-600">{a.shiftEnd}</span> },
    {
      key: "rate",
      header: "Yes rate · 30d",
      sort: (a) => a.rate,
      cell: (a) => (
        <span className="flex min-w-[130px] items-center gap-3">
          <ProgressBar value={a.rate} tone="covered" className="w-16" label={`${a.name} yes rate`} />
          <span className="tnum text-ink-700">
            {a.confirmed}/{a.asked}
          </span>
        </span>
      ),
    },
    { key: "min", header: "Extra time", sort: (a) => a.minutes, cell: (a) => <span className="tnum text-ink-600">{a.minutes ? `+${formatDuration(a.minutes)}` : "—"}</span> },
    { key: "last", header: "Last answer", sort: (a) => a.lastResponse || "", cell: (a) => <span className="text-ink-400" suppressHydrationWarning>{a.lastResponse ? relativeTime(a.lastResponse) : "—"}</span> },
    ...(pins
      ? [
          {
            key: "pin",
            header: "PIN",
            align: "right" as const,
            cell: (a: Agent) =>
              a.hasPin ? (
                <button onClick={() => resetPin(a)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[12.5px] font-medium text-ink-500 hover:bg-ink-50 hover:text-ink-900">
                  <KeyRound size={13} /> Reset
                </button>
              ) : (
                <span className="text-[12.5px] text-ink-300">Not signed in yet</span>
              ),
          },
        ]
      : []),
  ];

  return (
    <div>
      <SectionTitle eyebrow="Recipients" title="Everyone you can reach." description={`${agents.filter((a) => a.active).length} active agents across ${new Set(agents.map((a) => a.teamCode)).size} teams. Participation is shown for the last 30 days.`} />
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search agent…" aria-label="Search agents" className="field pl-10" />
        </div>
        <Select label="Team" value={team} onChange={setTeam} options={["all", ...teams].map((t) => ({ value: t, label: t === "all" ? "All teams" : t }))} className="w-40" />
      </div>
      <div className="surface mt-4 overflow-hidden">
        <DataTable
          caption="Agents"
          rows={rows}
          rowKey={(a) => a.id}
          columns={columns}
          empty={<EmptyState compact art="people" title={agents.length ? "No agents match." : "No agents yet."} description={agents.length ? "Try a different name or team." : "Import your distribution lists to bring your agents in."} />}
          mobile={(a) => (
            <div className="flex items-center gap-3">
              <Avatar name={a.name} size={34} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium">{a.name}</p>
                <p className="truncate text-[12.5px] text-ink-400">
                  {a.teamCode} · {a.confirmed}/{a.asked} yes · {a.minutes ? `+${formatDuration(a.minutes)}` : "no extra time"}
                </p>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}
