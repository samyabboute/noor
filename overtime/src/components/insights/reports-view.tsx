"use client";

import { useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import type { Analytics } from "@/server/analytics";
import { formatDateLong, formatDuration, formatSeconds } from "@/lib/time";
import { SectionTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/select";

const csvCell = (v: string | number) => {
  const s = String(v);
  // Neutralise spreadsheet formula injection and quote safely.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return /[",\n;]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

function download(name: string, rows: (string | number)[][]) {
  const blob = new Blob(["﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function ReportsView({ week, month, quarter }: { week: Analytics; month: Analytics; quarter: Analytics }) {
  const [range, setRange] = useState<"7" | "30" | "90">("7");
  const a = range === "7" ? week : range === "30" ? month : quarter;
  const k = a.kpis;
  const best = [...a.byTeam].sort((x, y) => y.rate - x.rate)[0];

  const reports = [
    { name: "Daily coverage", desc: "Requests, reach, confirmations and extra time per day.", rows: () => [["Date", "Requests", "Agents reached", "Confirmed", "Declined", "Confirmation rate", "Additional minutes", "Avg response (s)"], ...a.series.map((d) => [d.date, d.requests, d.recipients, d.confirmed, d.declined, (d.rate * 100).toFixed(1), d.minutes, Math.round(d.avgResponseSec)])] },
    { name: "Team summary", desc: "Confirmation rate, extra time and response speed by team.", rows: () => [["Team", "Agents reached", "Confirmed", "Confirmation rate", "Additional minutes", "Avg response (s)"], ...a.byTeam.map((t) => [t.code, t.recipients, t.confirmed, (t.rate * 100).toFixed(1), t.minutes, Math.round(t.avgResponseSec)])] },
    { name: "Distribution lists", desc: "How each DL responds when asked.", rows: () => [["List", "Agents reached", "Confirmed", "Confirmation rate", "Additional minutes"], ...a.byDl.map((d) => [d.name, d.recipients, d.confirmed, (d.rate * 100).toFixed(1), d.minutes])] },
    { name: "Participation", desc: "Additional time per agent — for recognition, not ranking.", rows: () => [["Agent", "Team", "Asked", "Confirmed", "Additional minutes"], ...a.participation.map((p) => [p.name, p.teamCode, p.recipients, p.confirmed, p.minutes])] },
  ];

  return (
    <div>
      <SectionTitle eyebrow="Reports" title="The week, in one paragraph." description="A summary you can paste into the ops review — and the raw numbers behind it." />
      <div className="mt-10">
        <Segmented label="Report period" value={range} onChange={setRange} options={[{ value: "7", label: "Last 7 days" }, { value: "30", label: "Last 30 days" }, { value: "90", label: "Last 90 days" }]} />
      </div>
      <section className="on-dark grain relative mt-4 overflow-hidden rounded-2xl bg-ink-900 p-7 text-white sm:p-10" aria-label="Summary">
        <p className="text-[11px] font-medium uppercase tracking-eyebrow text-white/40">
          {formatDateLong(a.from)} — {formatDateLong(a.to)}
        </p>
        <p className="mt-5 max-w-3xl text-[1.5rem] font-medium leading-snug tracking-[-0.02em] sm:text-[1.875rem]">
          Monitoring sent <b className="font-semibold">{k.requests.value} overtime requests</b>, reaching {k.recipients} agents.{" "}
          <b className="font-semibold">{Math.round(k.confirmationRate.value * 100)}%</b> said yes, adding <b className="font-semibold">{formatDuration(k.minutes.value)}</b> of coverage. Agents answered in{" "}
          <b className="font-semibold">{formatSeconds(k.avgResponseSec.value)}</b> on average{best ? <>; {best.code} led with {Math.round(best.rate * 100)}%.</> : "."}
        </p>
      </section>
      <ul className="mt-3 grid gap-3 md:grid-cols-2">
        {reports.map((r) => (
          <li key={r.name} className="surface flex items-start gap-4 p-5 sm:p-6">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink-50 text-ink-500">
              <FileSpreadsheet size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold">{r.name}</p>
              <p className="mt-1 text-[13px] text-ink-500">{r.desc}</p>
            </div>
            <Button size="sm" variant="secondary" icon={<Download size={14} />} onClick={() => download(`overtime-${r.name.toLowerCase().replace(/\s+/g, "-")}-${a.from}-${a.to}.csv`, r.rows())}>
              CSV
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
