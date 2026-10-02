"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { formatDuration, relativeTime } from "@/lib/time";
import { SectionTitle } from "@/components/ui/card";
import { Segmented } from "@/components/ui/select";
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
}

export function AgentDirectory({ agents }: { agents: Agent[] }) {
  const [q, setQ] = useState("");
  const [team, setTeam] = useState("all");
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
  ];

  return (
    <div>
      <SectionTitle eyebrow="Recipients" title="Everyone you can reach." description={`${agents.filter((a) => a.active).length} active agents across ${new Set(agents.map((a) => a.teamCode)).size} teams. Participation is shown for the last 30 days.`} />
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search agent…" aria-label="Search agents" className="field pl-10" />
        </div>
        <Segmented label="Team" value={team} onChange={setTeam} options={["all", "RBC", "RSM", "BM"].map((t) => ({ value: t, label: t === "all" ? "All teams" : t }))} />
      </div>
      <div className="surface mt-4 overflow-hidden">
        <DataTable
          caption="Agents"
          rows={rows}
          rowKey={(a) => a.id}
          columns={columns}
          empty={<EmptyState compact art="people" title="No agents match." description="Try a different name or team." />}
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
