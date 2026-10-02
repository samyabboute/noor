import "server-only";
import type { OvertimeRecipient, RecipientStatus, TeamId } from "@/lib/types";
import { shiftDate, todayISO } from "@/lib/time";
import { repo } from "./store";

export interface AnalyticsFilters {
  range: 7 | 30 | 90;
  team?: TeamId;
  dl?: string;
  agent?: string;
  owner?: string;
  status?: RecipientStatus;
}

export function parseFilters(sp: URLSearchParams | Record<string, string | string[] | undefined>): AnalyticsFilters {
  const get = (k: string) => {
    const v = sp instanceof URLSearchParams ? sp.get(k) : sp[k];
    return (Array.isArray(v) ? v[0] : v) || undefined;
  };
  const range = Number(get("range"));
  const team = get("team");
  const status = get("status");
  return {
    range: range === 7 || range === 90 ? range : 30,
    team: team === "rbc" || team === "rsm" || team === "bm" ? team : undefined,
    dl: get("dl"),
    agent: get("agent"),
    owner: get("owner"),
    status: (["confirmed", "declined", "expired"] as const).find((s) => s === status),
  };
}

interface Slice {
  requests: number;
  recipients: number;
  confirmed: number;
  declined: number;
  minutes: number;
  responseSecs: number[];
}

const empty = (): Slice => ({ requests: 0, recipients: 0, confirmed: 0, declined: 0, minutes: 0, responseSecs: [] });
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

/** Aggregates only — names appear solely in the participation ranking, never contact details. */
export function analytics(f: AnalyticsFilters) {
  const r = repo();
  const today = todayISO();
  const from = shiftDate(today, -(f.range - 1));
  const prevFrom = shiftDate(from, -f.range);
  const users = new Map(r.users().map((u) => [u.id, u]));

  const recMatches = (rec: OvertimeRecipient) => {
    const u = users.get(rec.userId);
    if (!u) return false;
    if (f.team && u.teamId !== f.team) return false;
    if (f.dl && !(rec.source.type === "dl" && rec.source.id === f.dl)) return false;
    if (f.agent && rec.userId !== f.agent) return false;
    if (f.status && rec.status !== f.status) return false;
    return true;
  };

  const sent = r.requests().filter((q) => (q.status === "live" || q.status === "completed") && (!f.owner || q.createdBy === f.owner));
  const recsByReq = new Map<string, OvertimeRecipient[]>();
  for (const rec of r.recipients()) {
    if (!recMatches(rec)) continue;
    const arr = recsByReq.get(rec.requestId) || [];
    arr.push(rec);
    recsByReq.set(rec.requestId, arr);
  }

  const days: string[] = [];
  for (let i = f.range - 1; i >= 0; i--) days.push(shiftDate(today, -i));
  const byDay = new Map(days.map((d) => [d, empty()]));
  const cur = empty();
  const prev = empty();
  const byTeam = new Map<string, Slice>();
  const byDl = new Map<string, Slice>();
  const byAgent = new Map<string, Slice>();
  const byOwner = new Map<string, Slice>();

  const add = (s: Slice, rec: OvertimeRecipient, sentAt: number) => {
    s.recipients++;
    if (rec.status === "confirmed") {
      s.confirmed++;
      s.minutes += rec.minutes || 0;
    }
    if (rec.status === "declined") s.declined++;
    if (rec.respondedAt) s.responseSecs.push((new Date(rec.respondedAt).getTime() - Math.max(sentAt, new Date(rec.addedAt).getTime())) / 1000);
  };

  for (const q of sent) {
    const recs = recsByReq.get(q.id);
    if (!recs?.length) continue;
    const inCur = q.date >= from && q.date <= today;
    const inPrev = q.date >= prevFrom && q.date < from;
    if (!inCur && !inPrev) continue;
    const sentAt = new Date(q.sentAt!).getTime();
    const bucket = inCur ? cur : prev;
    bucket.requests++;
    if (inCur) {
      byDay.get(q.date)!.requests++;
      const o = byOwner.get(q.createdBy) || empty();
      o.requests++;
      byOwner.set(q.createdBy, o);
    }
    for (const rec of recs) {
      add(bucket, rec, sentAt);
      if (!inCur) continue;
      add(byDay.get(q.date)!, rec, sentAt);
      const u = users.get(rec.userId)!;
      const t = byTeam.get(u.teamId!) || empty();
      add(t, rec, sentAt);
      byTeam.set(u.teamId!, t);
      if (rec.source.type === "dl") {
        const d = byDl.get(rec.source.id) || empty();
        add(d, rec, sentAt);
        byDl.set(rec.source.id, d);
      }
      const a = byAgent.get(rec.userId) || empty();
      add(a, rec, sentAt);
      byAgent.set(rec.userId, a);
      add(byOwner.get(q.createdBy)!, rec, sentAt);
    }
  }

  const rate = (s: Slice) => (s.recipients ? s.confirmed / s.recipients : 0);
  const series = days.map((d) => ({ date: d, ...summ(byDay.get(d)!) }));
  function summ(s: Slice) {
    return { requests: s.requests, recipients: s.recipients, confirmed: s.confirmed, declined: s.declined, minutes: s.minutes, rate: rate(s), avgResponseSec: avg(s.responseSecs) };
  }

  // Response trend: weekly buckets for long ranges, daily otherwise.
  const step = f.range === 90 ? 7 : f.range === 30 ? 3 : 1;
  const responseTrend: { date: string; avgResponseSec: number; n: number }[] = [];
  for (let i = 0; i < days.length; i += step) {
    const chunk = days.slice(i, i + step);
    const secs = chunk.flatMap((d) => byDay.get(d)!.responseSecs);
    responseTrend.push({ date: chunk[0], avgResponseSec: avg(secs), n: secs.length });
  }

  const teams = r.teams();
  return {
    filters: f,
    from,
    to: today,
    kpis: {
      requests: { value: cur.requests, prev: prev.requests },
      confirmationRate: { value: rate(cur), prev: rate(prev) },
      minutes: { value: cur.minutes, prev: prev.minutes },
      avgResponseSec: { value: avg(cur.responseSecs), prev: avg(prev.responseSecs) },
      recipients: cur.recipients,
      confirmed: cur.confirmed,
      declined: cur.declined,
    },
    series,
    responseTrend,
    byTeam: teams.map((t) => ({ id: t.id, code: t.code, name: t.name, ...summ(byTeam.get(t.id) || empty()) })),
    byDl: r.dls().map((d) => ({ id: d.id, name: d.name, ...summ(byDl.get(d.id) || empty()) })),
    byOwner: [...byOwner.entries()].map(([id, s]) => ({ id, name: users.get(id)?.name || "—", ...summ(s) })).sort((a, b) => b.requests - a.requests),
    participation: [...byAgent.entries()]
      .map(([id, s]) => ({ id, name: users.get(id)!.name, teamCode: (users.get(id)!.teamId || "").toUpperCase(), ...summ(s) }))
      .sort((a, b) => b.minutes - a.minutes || b.rate - a.rate),
    options: {
      teams: teams.map((t) => ({ value: t.id, label: t.code })),
      dls: r.dls().map((d) => ({ value: d.id, label: d.name })),
      agents: r.users().filter((u) => u.role === "agent").map((u) => ({ value: u.id, label: u.name })).sort((a, b) => a.label.localeCompare(b.label)),
      owners: r.users().filter((u) => u.role === "monitoring").map((u) => ({ value: u.id, label: u.name })),
    },
  };
}

export type Analytics = ReturnType<typeof analytics>;
