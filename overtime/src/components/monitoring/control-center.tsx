"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, FileText, Plus, Upload, Users } from "lucide-react";
import type { ActivityItem, RequestCard } from "@/server/views";
import { formatClock, formatDateShort, formatDuration } from "@/lib/time";
import { useLiveRefresh } from "@/lib/use-live";
import { cn } from "@/lib/cn";
import { Button, Magnetic } from "@/components/ui/button";
import { LiveDot } from "@/components/ui/badge";
import { CountUp } from "@/components/ui/count-up";
import { ProgressBar, RadialProgress } from "@/components/ui/progress";
import { Timeline } from "@/components/ui/timeline";
import { EmptyState } from "@/components/ui/empty-state";

interface Overview {
  today: string;
  kpis: { coverage: number; reached: number; confirmed: number; pending: number; declined: number; minutes: number; requests: number };
  live: RequestCard[];
  drafts: RequestCard[];
  lists: { id: string; name: string; teamCode: string; count: number }[];
  groups: { id: string; name: string; count: number }[];
  activity: ActivityItem[];
  setupNeeded: boolean;
}

const ease = [0.22, 1, 0.36, 1] as const;

function headline(d: Overview) {
  const r = d.live[0];
  if (!r) return { main: "All quiet.", rest: "No active coverage request." };
  const togo = Math.max(0, r.target - r.stats.confirmed);
  if (togo === 0) return { main: "Peak covered.", rest: `${r.stats.confirmed} agents are in.` };
  return { main: `${r.stats.confirmed} of ${r.target} in.`, rest: `${togo} to go.` };
}

export function ControlCenter({ data, firstName }: { data: Overview; firstName: string }) {
  const updated = useLiveRefresh(5000);
  const h = headline(data);
  const current = data.live[0];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="eyebrow">Overtime control center</p>
            <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-white px-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-900 shadow-card ring-1 ring-ink-900/[0.06]">
              <LiveDot size="sm" /> Live
            </span>
            {updated && (
              <span className="text-[12px] text-ink-300" suppressHydrationWarning>
                Updated {formatClock(new Date(updated).toISOString())}
              </span>
            )}
          </div>
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="mt-4 text-display-lg font-semibold">
            <span className="tnum">{h.main}</span> <span className="text-ink-300">{h.rest}</span>
          </motion.h1>
        </div>
        <Magnetic strength={0.12}>
          <Button href="/monitoring/new" size="lg" icon={<Plus size={18} className="transition-transform duration-300 group-hover:rotate-90" />} className="px-6">
            Create overtime request
          </Button>
        </Magnetic>
      </div>

      {data.setupNeeded && (
        <section className="on-dark grain relative mt-10 overflow-hidden rounded-2xl bg-ink-900 p-7 text-white sm:p-9" aria-labelledby="setup">
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(227,18,43,0.25),transparent)]" />
          <p className="relative text-[11px] font-medium uppercase tracking-eyebrow text-white/40">First step</p>
          <h2 id="setup" className="relative mt-3 text-[1.75rem] font-semibold tracking-[-0.03em]">Bring your team in.</h2>
          <p className="relative mt-2 max-w-lg text-white/60">Import DL RBC KRK, DL RSM KRK and DL BM KRK from Outlook. Agents can sign in with the agent code as soon as they’re on a list.</p>
          <Button href="/monitoring/lists" variant="inverse" size="lg" className="relative mt-6" icon={<Upload size={16} />}>
            Import distribution lists
          </Button>
        </section>
      )}

      {/* Today strip */}
      <section aria-label="Today" className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-ink-900/[0.07] shadow-card ring-1 ring-ink-900/[0.07] lg:grid-cols-5">
        <Kpi label="Today’s coverage" className="col-span-2 lg:col-span-1">
          <span className="flex items-center gap-3">
            <RadialProgress value={data.kpis.coverage} size={44} stroke={5} label="Today’s coverage" />
            <CountUp value={Math.round(data.kpis.coverage * 100)} format={(n) => `${Math.round(n)}%`} />
          </span>
        </Kpi>
        <Kpi label="Agents reached">
          <CountUp value={data.kpis.reached} />
        </Kpi>
        <Kpi label="Confirmed" dot="covered">
          <CountUp value={data.kpis.confirmed} />
        </Kpi>
        <Kpi label="Pending" dot="waiting">
          <CountUp value={data.kpis.pending} />
        </Kpi>
        <Kpi label="Additional coverage">
          <CountUp value={data.kpis.minutes} format={(n) => `+${formatDuration(Math.round(n))}`} />
        </Kpi>
      </section>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {/* Current request */}
          {current ? (
            data.live.map((r, i) => <LiveRequest key={r.id} r={r} primary={i === 0} />)
          ) : (
            <div className="surface">
              <EmptyState
                title="No active coverage request."
                description="When queues build, launch a request in under a minute. Agents answer in one click."
                action={
                  <Button href="/monitoring/new" icon={<Plus size={16} />}>
                    Create overtime request
                  </Button>
                }
              />
            </div>
          )}

          {data.drafts.length > 0 && (
            <div className="surface p-5 sm:p-6">
              <p className="eyebrow">Drafts</p>
              <ul className="mt-3 divide-y divide-ink-900/[0.06]">
                {data.drafts.map((d) => (
                  <li key={d.id}>
                    <Link href={`/monitoring/new?draft=${d.id}`} className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition hover:bg-ink-50">
                      <FileText size={16} className="text-ink-300" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{d.title}</span>
                        <span className="tnum block text-[12.5px] text-ink-400">
                          {formatDateShort(d.date)} · {d.startTime} → {d.endTime} · {d.stats.recipients} agents
                        </span>
                      </span>
                      <span className="text-[13px] font-medium text-ink-400 transition group-hover:text-ink-900">Continue</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="surface p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Who’s in? · live</p>
              <Link href="/monitoring/requests" className="text-[12px] font-medium text-ink-400 hover:text-ink-900">
                All requests
              </Link>
            </div>
            <div className="mt-5">
              {data.activity.length ? <Timeline items={data.activity.slice(0, 7)} showRequest /> : <EmptyState compact art="inbox" title="No responses yet." description="Answers appear here as they arrive." />}
            </div>
          </div>
          <div className="surface p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Recipients</p>
              <Link href="/monitoring/lists" className="text-[12px] font-medium text-ink-400 hover:text-ink-900">
                Manage
              </Link>
            </div>
            <ul className="mt-4 space-y-1">
              {data.lists.map((l) => (
                <li key={l.id} className="flex items-center justify-between py-1.5 text-sm">
                  <span className="font-medium">{l.name}</span>
                  <span className="tnum text-ink-400">{l.count} agents</span>
                </li>
              ))}
              {data.groups.map((g) => (
                <li key={g.id} className="flex items-center justify-between py-1.5 text-sm">
                  <span className="flex items-center gap-2 text-ink-600">
                    <Users size={13} className="text-ink-300" />
                    {g.name}
                  </span>
                  <span className="tnum text-ink-400">{g.count} agents</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, children, dot, className }: { label: string; children: React.ReactNode; dot?: "covered" | "waiting"; className?: string }) {
  return (
    <div className={cn("bg-white p-5 sm:p-6", className)}>
      <p className="eyebrow flex items-center gap-1.5">
        {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dot === "covered" ? "bg-covered" : "bg-waiting")} />}
        {label}
      </p>
      <div className="tnum mt-4 whitespace-nowrap text-[2rem] font-semibold leading-none tracking-[-0.04em] xl:text-[2.25rem]">{children}</div>
    </div>
  );
}

function LiveRequest({ r, primary }: { r: RequestCard; primary: boolean }) {
  return (
    <Link href={`/monitoring/requests/${r.id}`} className={cn("group block overflow-hidden rounded-2xl transition-shadow duration-300", primary ? "on-dark grain relative bg-ink-900 text-white shadow-lift hover:shadow-float" : "surface hover:shadow-lift")}>
      {primary && <div aria-hidden className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(227,18,43,0.22),transparent)]" />}
      <div className="relative p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={cn("flex items-center gap-2 text-[11px] font-medium uppercase tracking-eyebrow", primary ? "text-white/50" : "text-ink-400")}>
              <LiveDot size="sm" /> {primary ? "Current request" : "Also live"}
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em] sm:text-[1.75rem]">{r.title}</h2>
            <p className={cn("tnum mt-1.5 text-[15px]", primary ? "text-white/60" : "text-ink-500")}>
              {r.startTime} → {r.endTime} · {r.sourceLabels.join(" + ")}
            </p>
          </div>
          <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full transition", primary ? "bg-white/10 group-hover:bg-white group-hover:text-ink-900" : "bg-ink-50 group-hover:bg-ink-900 group-hover:text-white")}>
            <ArrowUpRight size={17} />
          </span>
        </div>
        <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="tnum text-[3.5rem] font-semibold leading-none tracking-[-0.05em] sm:text-[4.25rem]">
              <CountUp value={r.stats.confirmed} />
              <span className={primary ? "text-white/30" : "text-ink-200"}> / {r.target}</span>
            </p>
            <p className={cn("mt-2 text-sm", primary ? "text-white/60" : "text-ink-500")}>confirmed</p>
          </div>
          <div className="text-right">
            <p className="tnum text-[2rem] font-semibold leading-none tracking-[-0.04em]">{Math.round(r.stats.coverage * 100)}%</p>
            <p className={cn("mt-2 text-sm", primary ? "text-white/60" : "text-ink-500")}>coverage</p>
          </div>
        </div>
        <ProgressBar value={r.stats.coverage} tone="covered" height={8} className={cn("mt-6", primary && "bg-white/10")} label={`${r.title} coverage`} />
        <div className={cn("mt-4 flex flex-wrap items-center justify-between gap-2 text-[13px]", primary ? "text-white/55" : "text-ink-500")}>
          <span>
            {r.stats.pending > 0 ? (
              <>
                <span className="tnum font-medium text-current">{r.stats.pending}</span> {r.stats.pending === 1 ? "response" : "responses"} still pending
              </>
            ) : (
              "Everyone has answered"
            )}
            {" · "}
            <span className="tnum">{r.stats.declined}</span> declined · closes {r.startTime}
          </span>
          <span className="inline-flex items-center gap-1 font-medium opacity-80 transition group-hover:translate-x-0.5 group-hover:opacity-100">
            Open <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
