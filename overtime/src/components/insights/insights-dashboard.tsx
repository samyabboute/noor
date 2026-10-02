"use client";

import { Suspense } from "react";
import type { Analytics } from "@/server/analytics";
import { formatDateShort, formatDuration, formatSeconds } from "@/lib/time";
import { SectionTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric";
import { BarChart, HBarList, LineChart } from "@/components/ui/charts";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar } from "./filter-bar";

const pct = (n: number) => `${Math.round(n * 100)}%`;
const rel = (v: number, p: number) => (p ? (v - p) / p : null);
const hours = (m: number) => {
  const h = Math.floor(m / 60);
  return `${h}h ${String(Math.round(m % 60)).padStart(2, "0")}m`;
};

/**
 * Management reads, never edits. Four numbers that matter, then a handful of
 * charts that each answer one question.
 */
export function InsightsDashboard({ data, variant, eyebrow = "Overtime insights" }: { data: Analytics; variant: "overview" | "full"; eyebrow?: string }) {
  const { kpis } = data;
  const empty = kpis.requests.value === 0;
  const spark = (f: (d: Analytics["series"][number]) => number) => data.series.map(f);
  const dayLabel = (d: string) => (data.filters.range === 7 ? new Date(`${d}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" }) : formatDateShort(d));

  return (
    <div>
      <SectionTitle
        eyebrow={eyebrow}
        title={variant === "overview" ? "Overtime insights" : "Coverage, in depth."}
        description="Operational coverage & workforce response"
      />

      <div className="mt-10">
        <Suspense>
          <FilterBar options={data.options} full={variant === "full"} />
        </Suspense>
      </div>

      {empty ? (
        <div className="surface mt-4">
          <EmptyState art="chart" title="No overtime requests in this view." description="Widen the date range or clear a filter to see coverage trends." />
        </div>
      ) : (
        <>
          <section aria-label="Key figures" className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Overtime requests" value={kpis.requests.value} delta={rel(kpis.requests.value, kpis.requests.prev)} hint="vs prev." spark={spark((d) => d.requests)} />
            <MetricCard label="Confirmation rate" value={kpis.confirmationRate.value * 100} format={(n) => `${Math.round(n)}%`} delta={kpis.confirmationRate.prev ? kpis.confirmationRate.value - kpis.confirmationRate.prev : null} hint="pts vs prev." accent="covered" spark={spark((d) => d.rate)} />
            <MetricCard label="Total additional hours" value={kpis.minutes.value} format={(n) => hours(n)} delta={rel(kpis.minutes.value, kpis.minutes.prev)} hint="vs prev." spark={spark((d) => d.minutes)} />
            <MetricCard label="Avg response time" value={kpis.avgResponseSec.value} format={(n) => formatSeconds(n)} delta={rel(kpis.avgResponseSec.value, kpis.avgResponseSec.prev)} deltaGood="down" hint="vs prev." />
          </section>

          <div className="mt-3 grid gap-3 lg:grid-cols-[1.6fr_1fr]">
            <ChartCard title="Overtime requests by day" note={`${kpis.requests.value} requests · ${kpis.recipients} agents reached`}>
              <BarChart
                ariaLabel="Overtime requests per day"
                data={data.series.map((d) => ({
                  label: dayLabel(d.date),
                  value: d.requests,
                  tip: (
                    <>
                      <span className="text-white/60">{formatDateShort(d.date)}</span> · <b className="font-medium">{d.requests}</b> {d.requests === 1 ? "request" : "requests"} · {d.confirmed} confirmed
                    </>
                  ),
                }))}
                height={220}
                xTicks={data.filters.range === 90 ? 6 : data.filters.range === 30 ? 6 : 7}
              />
            </ChartCard>
            <ChartCard title="Confirmation rate by team" note="Share of reached agents who said yes">
              <HBarList
                tone="covered"
                max={1}
                format={pct}
                data={data.byTeam.map((t) => ({ id: t.id, label: <span><b className="font-medium text-ink-900">{t.code}</b> <span className="text-ink-400">· {t.name}</span></span>, value: t.rate, meta: `${t.confirmed}/${t.recipients}` }))}
                className="pt-2"
              />
              <div className="mt-8 border-t border-ink-900/[0.06] pt-6">
                <p className="mb-4 text-[13px] font-medium text-ink-700">Additional hours by team</p>
                <HBarList format={(n) => hours(n)} data={data.byTeam.map((t) => ({ id: t.id, label: t.code, value: t.minutes }))} />
              </div>
            </ChartCard>
          </div>

          {variant === "full" && (
            <>
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <ChartCard title="Response time trend" note="Average time from request to answer — lower is better">
                  <LineChart
                    ariaLabel="Average response time over time"
                    data={data.responseTrend.map((d) => ({
                      label: dayLabel(d.date),
                      value: d.n ? d.avgResponseSec / 60 : null,
                      tip: d.n ? (
                        <>
                          <span className="text-white/60">{formatDateShort(d.date)}</span> · <b className="font-medium">{formatSeconds(d.avgResponseSec)}</b> avg · {d.n} answers
                        </>
                      ) : undefined,
                    }))}
                    format={(n) => `${n.toFixed(n < 10 && n % 1 ? 1 : 0)}m`}
                    height={220}
                  />
                </ChartCard>
                <ChartCard title="Overtime participation by agent" note="Top contributors by additional time">
                  {data.participation.length ? (
                    <HBarList
                      format={(n) => `+${formatDuration(n)}`}
                      data={data.participation.slice(0, 8).map((a) => ({ id: a.id, label: <span>{a.name} <span className="text-ink-400">· {a.teamCode}</span></span>, value: a.minutes, meta: `${a.confirmed}/${a.recipients} yes` }))}
                    />
                  ) : (
                    <EmptyState compact art="people" title="No participation in this view." />
                  )}
                </ChartCard>
              </div>
            </>
          )}

          <section className="surface mt-3 overflow-hidden" aria-labelledby="dl-perf">
            <div className="px-5 pt-6 sm:px-6">
              <h2 id="dl-perf" className="text-[15px] font-semibold tracking-[-0.01em]">
                Distribution list performance
              </h2>
              <p className="mt-1 text-[13px] text-ink-400">How each list answers when it’s asked.</p>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <caption className="sr-only">Distribution list performance</caption>
                <thead>
                  <tr className="border-b border-ink-900/[0.07] text-[12px] text-ink-400">
                    {["List", "Reached", "Confirmed", "Rate", "Avg reply", "Extra time"].map((h, i) => (
                      <th key={h} scope="col" className={i === 0 ? "py-3 pl-5 font-medium sm:pl-6" : "py-3 pr-5 text-right font-medium sm:pr-6"}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.byDl.map((d) => (
                    <tr key={d.id} className="border-b border-ink-900/[0.05] last:border-0">
                      <td className="py-3.5 pl-5 font-medium sm:pl-6">{d.name}</td>
                      <td className="tnum py-3.5 pr-5 text-right text-ink-600 sm:pr-6">{d.recipients}</td>
                      <td className="tnum py-3.5 pr-5 text-right text-ink-600 sm:pr-6">{d.confirmed}</td>
                      <td className="py-3.5 pr-5 sm:pr-6">
                        <span className="flex items-center justify-end gap-3">
                          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-ink-900/[0.06]">
                            <span className="block h-full rounded-full bg-covered" style={{ width: `${d.rate * 100}%` }} />
                          </span>
                          <span className="tnum w-10 text-right font-medium">{pct(d.rate)}</span>
                        </span>
                      </td>
                      <td className="tnum py-3.5 pr-5 text-right text-ink-600 sm:pr-6">{d.avgResponseSec ? formatSeconds(d.avgResponseSec) : "—"}</td>
                      <td className="tnum py-3.5 pr-5 text-right text-ink-600 sm:pr-6">{d.minutes ? `+${hours(d.minutes)}` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function ChartCard({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="surface p-5 sm:p-6">
      <h2 className="text-[15px] font-semibold tracking-[-0.01em]">{title}</h2>
      {note && <p className="mt-1 text-[13px] text-ink-400">{note}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}
