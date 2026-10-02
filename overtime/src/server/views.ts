import "server-only";
import type { AuditLog, OvertimeRecipient, OvertimeRequest, RecipientSource, RecipientStatus, Role } from "@/lib/types";
import type { EmailDraft } from "@/lib/email";
import { addMinutes, todayISO, zonedToDate } from "@/lib/time";
import { pickTemplate, renderTemplate, requestVars } from "@/lib/template";
import { repo, type Repo } from "./store";

/**
 * Role-shaped read models. Pages and API routes return these — never raw rows —
 * so an agent's payload can't carry anyone else's data.
 */

export const ORG_NAME = process.env.NEXT_PUBLIC_ORG_NAME || "Swisscom Customer Care";

export interface RequestStats {
  recipients: number;
  confirmed: number;
  declined: number;
  opened: number;
  pending: number;
  expired: number;
  minutes: number;
  coverage: number; // confirmed / target, 0..1
  responseRate: number;
  avgResponseSec: number | null;
}

export function statsFor(req: OvertimeRequest, recs: OvertimeRecipient[]): RequestStats {
  const c = (s: RecipientStatus) => recs.filter((r) => r.status === s).length;
  const confirmed = c("confirmed");
  const declined = c("declined");
  const responded = recs.filter((r) => r.respondedAt);
  const sent = req.sentAt ? new Date(req.sentAt).getTime() : 0;
  const avg = responded.length && sent
    ? responded.reduce((sum, r) => sum + (new Date(r.respondedAt!).getTime() - Math.max(sent, new Date(r.addedAt).getTime())) / 1000, 0) / responded.length
    : null;
  return {
    recipients: recs.length,
    confirmed,
    declined,
    opened: c("opened"),
    pending: c("sent") + c("opened"),
    expired: c("expired"),
    minutes: recs.reduce((s, r) => s + (r.status === "confirmed" ? r.minutes || 0 : 0), 0),
    coverage: req.target ? Math.min(1, confirmed / req.target) : 0,
    responseRate: recs.length ? (confirmed + declined) / recs.length : 0,
    avgResponseSec: avg,
  };
}

export interface RequestCard {
  id: string;
  title: string;
  status: OvertimeRequest["status"];
  date: string;
  startTime: string;
  endTime: string;
  durationMin: number;
  flexible: boolean;
  target: number;
  ownerName: string;
  createdAt: string;
  sentAt: string | null;
  closesAt: string;
  sourceLabels: string[];
  stats: RequestStats;
}

export function sourceLabel(r: Repo, src: RecipientSource) {
  if (src.type === "dl") return r.dls().find((d) => d.id === src.id)?.name || "Distribution list";
  if (src.type === "group") return r.groups().find((g) => g.id === src.id)?.name || "Custom group";
  return "Added individually";
}

export function requestCard(r: Repo, req: OvertimeRequest): RequestCard {
  const recs = r.recipientsFor(req.id);
  const labels = new Set<string>();
  for (const rec of recs) labels.add(rec.source.type === "individual" ? "Individuals" : sourceLabel(r, rec.source));
  return {
    id: req.id,
    title: req.title,
    status: req.status,
    date: req.date,
    startTime: req.startTime,
    endTime: addMinutes(req.startTime, req.durationMin),
    durationMin: req.durationMin,
    flexible: req.flexible,
    target: req.target,
    ownerName: r.user(req.createdBy)?.name || "Monitoring",
    createdAt: req.createdAt,
    sentAt: req.sentAt,
    closesAt: zonedToDate(req.date, req.startTime).toISOString(),
    sourceLabels: [...labels],
    stats: statsFor(req, recs),
  };
}

export interface ActivityItem {
  id: string;
  at: string;
  action: AuditLog["action"];
  actorName: string;
  actorRole: Role | "system";
  targetName?: string;
  requestId?: string;
  requestTitle?: string;
  minutes?: number;
  detail?: string;
}

export function activity(r: Repo, entries: AuditLog[]): ActivityItem[] {
  return entries.map((e) => {
    const actor = r.user(e.actorId);
    const req = e.requestId ? r.request(e.requestId) : undefined;
    const meta = e.meta || {};
    return {
      id: e.id,
      at: e.at,
      action: e.action,
      actorName: actor?.name || "Overtime",
      actorRole: actor?.role || "system",
      targetName: e.targetUserId ? r.user(e.targetUserId)?.name : undefined,
      requestId: e.requestId,
      requestTitle: req?.title,
      minutes: typeof meta.minutes === "number" ? meta.minutes : undefined,
      detail: typeof meta.list === "string" ? meta.list : typeof meta.template === "string" ? meta.template : typeof meta.group === "string" ? meta.group : typeof meta.kind === "string" ? meta.kind : undefined,
    };
  });
}

// ── Monitoring ─────────────────────────────────────────────────────────────

export async function monitoringOverview() {
  const r = await repo();
  const today = todayISO();
  const todays = r.requests().filter((q) => q.date === today && (q.status === "live" || q.status === "completed"));
  const live = r.requests().filter((q) => q.status === "live").sort((a, b) => (a.sentAt || "").localeCompare(b.sentAt || "")).reverse();
  const cards = todays.map((q) => requestCard(r, q));
  const sum = (f: (c: RequestCard) => number) => cards.reduce((s, c) => s + f(c), 0);
  const target = sum((c) => c.target);
  const confirmed = sum((c) => c.stats.confirmed);
  const users = r.users();
  return {
    today,
    kpis: {
      coverage: target ? Math.min(1, confirmed / target) : 0,
      reached: sum((c) => c.stats.recipients),
      confirmed,
      pending: sum((c) => c.stats.pending),
      declined: sum((c) => c.stats.declined),
      minutes: sum((c) => c.stats.minutes),
      requests: cards.length,
    },
    live: live.map((q) => requestCard(r, q)),
    drafts: r.requests().filter((q) => q.status === "draft").map((q) => requestCard(r, q)),
    lists: r.dls().map((d) => ({ id: d.id, name: d.name, teamCode: (d.teamId || "").toUpperCase(), count: d.memberIds.filter((m) => users.find((u) => u.id === m)?.active).length })),
    groups: r.groups().map((g) => ({ id: g.id, name: g.name, count: g.memberIds.length })),
    activity: activity(r, r.audit().filter((a) => a.action !== "REQUEST_VIEWED" && a.action !== "SIGNED_IN").slice(-14).reverse()),
    setupNeeded: r.dls().length === 0,
  };
}

export interface RecipientRow {
  userId: string;
  name: string;
  email: string;
  teamCode: string;
  source: string;
  sourceType: RecipientSource["type"];
  status: RecipientStatus;
  minutes: number | null;
  logout: string | null;
  openedAt: string | null;
  respondedAt: string | null;
  responseSec: number | null;
  emailPrepared: boolean;
}

export async function requestDetail(id: string) {
  const r = await repo();
  const req = r.request(id);
  if (!req || req.status === "cancelled") return null;
  const recs = r.recipientsFor(id);
  const order: Record<RecipientStatus, number> = { confirmed: 0, opened: 1, sent: 2, declined: 3, expired: 4 };
  const rows: RecipientRow[] = recs
    .map((rec) => {
      const u = r.user(rec.userId)!;
      const base = Math.max(new Date(req.sentAt || req.createdAt).getTime(), new Date(rec.addedAt).getTime());
      return {
        userId: u.id,
        name: u.name,
        email: u.email,
        teamCode: (u.teamId || "").toUpperCase(),
        source: sourceLabel(r, rec.source),
        sourceType: rec.source.type,
        status: rec.status,
        minutes: rec.minutes,
        logout: rec.status === "confirmed" && rec.minutes ? addMinutes(req.startTime, rec.minutes) : null,
        openedAt: rec.openedAt,
        respondedAt: rec.respondedAt,
        responseSec: rec.respondedAt ? Math.max(0, (new Date(rec.respondedAt).getTime() - base) / 1000) : null,
        emailPrepared: Boolean(rec.emailPreparedAt),
      };
    })
    .sort((a, b) => order[a.status] - order[b.status] || (a.respondedAt || "z").localeCompare(b.respondedAt || "z") || a.name.localeCompare(b.name));
  const owner = r.user(req.createdBy);
  return {
    card: requestCard(r, req),
    request: { ...req },
    owner: owner ? { name: owner.name, email: owner.email } : null,
    cc: req.ccIds.map((cid) => r.user(cid)).filter(Boolean).map((u) => ({ name: u!.name, email: u!.email })),
    rows,
    timeline: activity(r, r.audit().filter((a) => a.requestId === id).slice().reverse()),
    announcement: announcementDraft(r, req),
  };
}

/** The request email Monitoring sends to agents from Outlook (to whole DLs where untouched, BCC otherwise). */
export function announcementDraft(r: Repo, req: OvertimeRequest): EmailDraft {
  const recs = r.recipientsFor(req.id);
  const owner = r.user(req.createdBy);
  const vars = requestVars(req, owner);
  const fullDls = r.dls().filter((d) => {
    const active = d.memberIds.filter((m) => r.user(m)?.active);
    return active.length > 0 && active.every((m) => recs.some((x) => x.userId === m && x.source.type === "dl" && x.source.id === d.id));
  });
  const coveredByDl = new Set(fullDls.flatMap((d) => d.memberIds));
  const individuals = recs.filter((x) => !coveredByDl.has(x.userId)).map((x) => r.user(x.userId)!.email);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3100";
  return {
    to: fullDls.length ? fullDls.map((d) => d.address) : [owner?.email || ""],
    cc: req.ccIds.map((id) => r.user(id)?.email).filter((x): x is string => Boolean(x)),
    bcc: individuals,
    subject: renderTemplate(req.subject, vars),
    body: `${renderTemplate(req.body, vars)}\n\n→ Respond in one click: ${appUrl}/agent`,
  };
}

export async function pendingNudgeDraft(id: string): Promise<EmailDraft | null> {
  const r = await repo();
  const req = r.request(id);
  if (!req) return null;
  const pending = r.recipientsFor(id).filter((x) => x.status === "sent" || x.status === "opened");
  const owner = r.user(req.createdBy);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3100";
  return {
    to: [owner?.email || ""],
    cc: [],
    bcc: pending.map((p) => r.user(p.userId)!.email),
    subject: `Still need you: ${req.startTime} → ${addMinutes(req.startTime, req.durationMin)} coverage`,
    body: `Hi,\n\nWe're still a few people short to cover today's peak (${req.startTime} → ${addMinutes(req.startTime, req.durationMin)}).\n\nIf you can stay a little longer, one click is all it takes: ${appUrl}/agent\n\nThank you,\n${owner?.name || "Monitoring"}`,
  };
}

// ── Agent ──────────────────────────────────────────────────────────────────

export interface AgentOffer {
  requestId: string;
  title: string;
  date: string;
  startTime: string;
  durationMin: number;
  flexible: boolean;
  ownerName: string;
  status: RecipientStatus;
  minutes: number | null;
  logout: string | null;
  closesAt: string;
  colleaguesIn: number;
  target: number;
  email: EmailDraft | null;
  emailPrepared: boolean;
}

export function confirmationDraft(r: Repo, req: OvertimeRequest, userId: string, minutes: number): EmailDraft {
  const agent = r.user(userId)!;
  const owner = r.user(req.createdBy);
  const team = r.teams().find((t) => t.id === agent.teamId);
  const tpl = pickTemplate(r.templates(), "confirmation", agent.language, req.confirmationTemplateId);
  const vars = requestVars(req, owner, { agent, team, minutes });
  return {
    to: [owner?.email || ""].filter(Boolean),
    cc: req.ccIds.map((id) => r.user(id)?.email).filter((x): x is string => Boolean(x)),
    subject: renderTemplate(tpl.subject, vars),
    body: renderTemplate(tpl.body, vars),
  };
}

export function agentOffer(r: Repo, req: OvertimeRequest, rec: OvertimeRecipient): AgentOffer {
  const recs = r.recipientsFor(req.id);
  return {
    requestId: req.id,
    title: req.title,
    date: req.date,
    startTime: req.startTime,
    durationMin: req.durationMin,
    flexible: req.flexible,
    ownerName: r.user(req.createdBy)?.name || "Monitoring",
    status: rec.status,
    minutes: rec.minutes,
    logout: rec.minutes ? addMinutes(req.startTime, rec.minutes) : null,
    closesAt: zonedToDate(req.date, req.startTime).toISOString(),
    colleaguesIn: recs.filter((x) => x.status === "confirmed" && x.userId !== rec.userId).length,
    target: req.target,
    email: rec.status === "confirmed" && rec.minutes ? confirmationDraft(r, req, rec.userId, rec.minutes) : null,
    emailPrepared: Boolean(rec.emailPreparedAt),
  };
}

export async function agentHome(userId: string) {
  const r = await repo();
  const mine = r.recipients().filter((x) => x.userId === userId);
  const offers: AgentOffer[] = [];
  const history: (AgentOffer & { requestStatus: OvertimeRequest["status"] })[] = [];
  for (const rec of mine) {
    const req = r.request(rec.requestId);
    if (!req || req.status === "draft" || req.status === "cancelled") continue;
    const o = agentOffer(r, req, rec);
    if (req.status === "live") offers.push(o);
    history.push({ ...o, email: null, requestStatus: req.status });
  }
  offers.sort((a, b) => a.closesAt.localeCompare(b.closesAt));
  history.sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime));
  const confirmed = history.filter((h) => h.status === "confirmed");
  const since = new Date(Date.now() - 30 * 86400e3).toISOString().slice(0, 10);
  return {
    offers,
    history,
    stats: {
      asked: history.length,
      confirmed: confirmed.length,
      minutes: confirmed.reduce((s, h) => s + (h.minutes || 0), 0),
      minutes30: confirmed.filter((h) => h.date >= since).reduce((s, h) => s + (h.minutes || 0), 0),
    },
  };
}

export async function monitoringDirectory() {
  const r = await repo();
  return {
    agents: r
      .users()
      .filter((u) => u.role === "agent")
      .map((u) => ({ id: u.id, name: u.name, teamCode: (u.teamId || "").toUpperCase(), active: u.active }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    lists: r.dls().map((d) => ({ id: d.id, name: d.name, teamCode: (d.teamId || "").toUpperCase(), memberIds: d.memberIds, address: d.address })),
    groups: r.groups().map((g) => ({ id: g.id, name: g.name, memberIds: g.memberIds })),
    templates: r.templates(),
    monitoringTeam: r.users().filter((u) => u.role === "monitoring" && u.active).map((u) => ({ id: u.id, name: u.name })),
  };
}

/** Per-agent participation for Monitoring's directory (operational, last 30 days). */
export async function agentDirectory() {
  const r = await repo();
  const since = new Date(Date.now() - 30 * 86400e3).toISOString().slice(0, 10);
  const reqDate = new Map(r.requests().map((q) => [q.id, q.date]));
  return r
    .users()
    .filter((u) => u.role === "agent" && u.active)
    .map((u) => {
      const recs = r.recipients().filter((x) => x.userId === u.id && (reqDate.get(x.requestId) || "") >= since && r.request(x.requestId)?.status !== "draft");
      const confirmed = recs.filter((x) => x.status === "confirmed");
      const last = recs.filter((x) => x.respondedAt).sort((a, b) => b.respondedAt!.localeCompare(a.respondedAt!))[0];
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        teamCode: (u.teamId || "").toUpperCase(),
        language: u.language,
        active: u.active,
        shiftEnd: u.shiftEnd,
        lists: r.dls().filter((d) => d.memberIds.includes(u.id)).map((d) => d.name),
        asked: recs.length,
        confirmed: confirmed.length,
        minutes: confirmed.reduce((s, x) => s + (x.minutes || 0), 0),
        rate: recs.length ? confirmed.length / recs.length : 0,
        lastResponse: last?.respondedAt || null,
        hasPin: Boolean(u.pinHash),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
