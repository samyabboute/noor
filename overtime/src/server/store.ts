import "server-only";
import type {
  AuditAction,
  AuditLog,
  CustomGroup,
  EmailTemplate,
  OvertimeRecipient,
  OvertimeRequest,
  RecipientSource,
} from "@/lib/types";
import { zonedToDate } from "@/lib/time";
import { buildSeed, type SeedState } from "./seed";
import { isDemoMode } from "./config";

/**
 * Repository.
 *
 * DEMO MODE: an in-memory store, seeded with deterministic data, shared by
 * every request served by this Node process. Restarting the server resets it.
 * PRODUCTION: implement the same surface against Supabase/Postgres using
 * supabase/migrations/0001_init.sql (RLS enforces the same rules again in
 * the database). Route handlers and pages only ever talk to `repo()`.
 */

export class ValidationError extends Error {
  status = 400;
}
export class NotFoundError extends Error {
  status = 404;
}

type Store = SeedState & { demoAgentsSeen: Set<string> };

const g = globalThis as unknown as { __overtimeStore?: Store };

function store(): Store {
  if (!g.__overtimeStore) {
    g.__overtimeStore = { ...buildSeed(), demoAgentsSeen: new Set() };
  }
  return g.__overtimeStore;
}

const nowIso = () => new Date().toISOString();

function log(s: Store, entry: Omit<AuditLog, "id" | "at"> & { at?: string }) {
  s.audit.push({ id: `a-${(s.seq.id++).toString(36)}`, at: entry.at || nowIso(), ...entry });
}

/** Moves time forward: simulated demo responses land, past requests complete. */
function tick(s: Store) {
  const now = Date.now();
  if (isDemoMode()) {
    for (const plan of s.sim) {
      const rec = s.recipients.find((r) => r.id === plan.recipientId);
      if (!rec || s.demoAgentsSeen.has(rec.userId)) continue;
      const req = s.requests.find((r) => r.id === rec.requestId);
      if (!req || req.status !== "live") continue;
      if (rec.status === "sent" && new Date(plan.openAt).getTime() <= now) {
        rec.status = "opened";
        rec.openedAt = plan.openAt;
        log(s, { at: plan.openAt, actorId: rec.userId, action: "REQUEST_VIEWED", requestId: req.id });
      }
      if (rec.status === "opened" && plan.respondAt && plan.outcome && new Date(plan.respondAt).getTime() <= now) {
        rec.status = plan.outcome;
        rec.respondedAt = plan.respondAt;
        if (plan.outcome === "confirmed") {
          rec.minutes = plan.minutes;
          rec.emailPreparedAt = plan.respondAt;
        }
        log(s, {
          at: plan.respondAt,
          actorId: rec.userId,
          action: plan.outcome === "confirmed" ? "AGENT_CONFIRMED" : "AGENT_DECLINED",
          requestId: req.id,
          meta: plan.outcome === "confirmed" ? { minutes: plan.minutes } : undefined,
        });
      }
    }
    s.sim = s.sim.filter((p) => {
      const rec = s.recipients.find((r) => r.id === p.recipientId);
      return rec && (rec.status === "sent" || rec.status === "opened");
    });
  }
  // Responses close when coverage starts — after that the request is history.
  for (const req of s.requests) {
    if (req.status !== "live") continue;
    const closes = zonedToDate(req.date, req.startTime).getTime();
    if (closes <= now) completeRequest(s, req, "system");
  }
}

function completeRequest(s: Store, req: OvertimeRequest, actorId: string) {
  req.status = "completed";
  req.closedAt = nowIso();
  for (const r of s.recipients) {
    if (r.requestId === req.id && (r.status === "sent" || r.status === "opened")) r.status = "expired";
  }
  log(s, { actorId, action: "REQUEST_COMPLETED", requestId: req.id });
}

export interface RequestInput {
  title: string;
  date: string;
  startTime: string;
  durationMin: number;
  flexible: boolean;
  target: number;
  subject: string;
  body: string;
  confirmationTemplateId: string;
  recipients: { userId: string; source: RecipientSource }[];
  sources: { dlIds: string[]; groupIds: string[] };
}

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function validateRequestInput(raw: unknown, forSend: boolean): RequestInput {
  const x = (raw || {}) as Record<string, unknown>;
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const s = store();
  const input: RequestInput = {
    title: str(x.title, 80) || "Peak coverage",
    date: str(x.date, 10),
    startTime: str(x.startTime, 5),
    durationMin: Number(x.durationMin),
    flexible: Boolean(x.flexible),
    target: Math.round(Number(x.target) || 0),
    subject: str(x.subject, 200),
    body: str(x.body, 4000),
    confirmationTemplateId: str(x.confirmationTemplateId, 64) || "tpl-conf-en",
    recipients: [],
    sources: { dlIds: [], groupIds: [] },
  };
  if (!DATE.test(input.date)) throw new ValidationError("Choose a valid date.");
  if (!HHMM.test(input.startTime)) throw new ValidationError("Choose a valid start time.");
  if (![15, 30, 45, 60, 90, 120].includes(input.durationMin)) throw new ValidationError("Choose a supported duration.");
  if (input.target < 0 || input.target > 500) throw new ValidationError("Target must be between 0 and 500 agents.");
  const srcs = (x.sources || {}) as Record<string, unknown>;
  input.sources.dlIds = (Array.isArray(srcs.dlIds) ? srcs.dlIds : []).filter((id): id is string => s.dls.some((d) => d.id === id));
  input.sources.groupIds = (Array.isArray(srcs.groupIds) ? srcs.groupIds : []).filter((id): id is string => s.groups.some((gr) => gr.id === id));
  const seen = new Set<string>();
  for (const item of Array.isArray(x.recipients) ? x.recipients : []) {
    const it = item as { userId?: unknown; source?: { type?: unknown; id?: unknown } };
    const user = s.users.find((u) => u.id === it.userId && u.role === "agent" && u.active);
    if (!user || seen.has(user.id)) continue;
    seen.add(user.id);
    const t = it.source?.type;
    const sid = typeof it.source?.id === "string" ? it.source.id : "";
    const source: RecipientSource =
      t === "dl" && s.dls.some((d) => d.id === sid)
        ? { type: "dl", id: sid }
        : t === "group" && s.groups.some((gr) => gr.id === sid)
          ? { type: "group", id: sid }
          : { type: "individual" };
    input.recipients.push({ userId: user.id, source });
  }
  if (forSend) {
    if (!input.recipients.length) throw new ValidationError("Select at least one agent to reach.");
    if (!input.subject || !input.body) throw new ValidationError("The message needs a subject and a body.");
    if (zonedToDate(input.date, input.startTime).getTime() <= Date.now())
      throw new ValidationError("Coverage start must be in the future — responses close when it begins.");
  }
  if (!input.target) input.target = Math.max(1, Math.ceil(input.recipients.length * 0.6));
  return input;
}

function scheduleDemoResponses(s: Store, req: OvertimeRequest) {
  if (!isDemoMode()) return;
  const recs = s.recipients.filter((r) => r.requestId === req.id && !s.demoAgentsSeen.has(r.userId) && r.userId !== "u-samy");
  const base = Date.now();
  recs.forEach((rec, i) => {
    // The first replies land within seconds — that is the moment Monitoring watches for.
    const fast = i < 3;
    const open = base + (fast ? 2500 + i * 1800 : 6000 + Math.random() * 150000);
    const roll = Math.random();
    s.sim.push({
      recipientId: rec.id,
      openAt: new Date(open).toISOString(),
      respondAt: roll < 0.82 ? new Date(open + (fast ? 1500 + i * 900 : 4000 + Math.random() * 60000)).toISOString() : null,
      outcome: roll < 0.62 || fast ? "confirmed" : roll < 0.82 ? "declined" : null,
      minutes: req.flexible && Math.random() < 0.3 ? [15, 45, 60][Math.floor(Math.random() * 3)] : req.durationMin,
    });
  });
}

export const repo = () => {
  const s = store();
  tick(s);
  return {
    teams: () => s.teams,
    users: () => s.users,
    user: (id: string) => s.users.find((u) => u.id === id),
    userByEmail: (email: string) => s.users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
    dls: () => s.dls,
    groups: () => s.groups,
    templates: () => s.templates,
    requests: () => s.requests,
    request: (id: string) => s.requests.find((r) => r.id === id),
    recipients: () => s.recipients,
    recipientsFor: (requestId: string) => s.recipients.filter((r) => r.requestId === requestId),
    audit: () => s.audit,

    /** Demo: once a person signs in as an agent, they answer for themselves. */
    markDemoAgentActive(userId: string) {
      s.demoAgentsSeen.add(userId);
    },

    createRequest(actorId: string, input: RequestInput, send: boolean, draftId?: string) {
      let req = draftId ? s.requests.find((r) => r.id === draftId && r.status === "draft") : undefined;
      if (draftId && !req) throw new NotFoundError("That draft no longer exists.");
      const owner = s.users.find((u) => u.id === actorId)!;
      const { recipients: chosen, ...fields } = input;
      const monitoring = s.users.filter((u) => u.role === "monitoring" && u.active && u.id !== actorId).map((u) => u.id);
      if (!req) {
        req = {
          id: `OT-${++s.seq.request}`,
          createdBy: owner.id,
          createdAt: nowIso(),
          sentAt: null,
          closedAt: null,
          status: "draft",
          ccIds: monitoring,
          ...fields,
        };
        s.requests.push(req);
        log(s, { actorId, action: send ? "REQUEST_CREATED" : "REQUEST_DRAFTED", requestId: req.id });
      } else {
        Object.assign(req, fields);
        s.recipients = s.recipients.filter((r) => r.requestId !== req!.id);
        log(s, { actorId, action: "REQUEST_UPDATED", requestId: req.id });
      }
      for (const rcp of chosen) {
        s.recipients.push({
          id: `r-${(s.seq.id++).toString(36)}`,
          requestId: req.id,
          userId: rcp.userId,
          source: rcp.source,
          status: "sent",
          addedAt: nowIso(),
          openedAt: null,
          respondedAt: null,
          minutes: null,
          emailPreparedAt: null,
        });
      }
      if (send) {
        req.status = "live";
        req.sentAt = nowIso();
        log(s, { actorId, action: "REQUEST_SENT", requestId: req.id, meta: { recipients: chosen.length } });
        scheduleDemoResponses(s, req);
      }
      return req;
    },

    deleteDraft(actorId: string, id: string) {
      const req = s.requests.find((r) => r.id === id && r.status === "draft");
      if (!req) throw new NotFoundError("Draft not found.");
      req.status = "cancelled";
      s.recipients = s.recipients.filter((r) => r.requestId !== id);
      log(s, { actorId, action: "REQUEST_CANCELLED", requestId: id });
    },

    closeRequest(actorId: string, id: string) {
      const req = s.requests.find((r) => r.id === id);
      if (!req || req.status !== "live") throw new ValidationError("Only a live request can be closed.");
      completeRequest(s, req, actorId);
    },

    addRecipients(actorId: string, id: string, items: { userId: string; source: RecipientSource }[]) {
      const req = s.requests.find((r) => r.id === id);
      if (!req || req.status !== "live") throw new ValidationError("Recipients can only be added to a live request.");
      const added: OvertimeRecipient[] = [];
      for (const it of items) {
        const user = s.users.find((u) => u.id === it.userId && u.role === "agent" && u.active);
        if (!user || s.recipients.some((r) => r.requestId === id && r.userId === user.id)) continue;
        const rec: OvertimeRecipient = {
          id: `r-${(s.seq.id++).toString(36)}`,
          requestId: id,
          userId: user.id,
          source: it.source,
          status: "sent",
          addedAt: nowIso(),
          openedAt: null,
          respondedAt: null,
          minutes: null,
          emailPreparedAt: null,
        };
        s.recipients.push(rec);
        added.push(rec);
        log(s, { actorId, action: "RECIPIENT_ADDED", requestId: id, targetUserId: user.id });
      }
      return added;
    },

    removeRecipient(actorId: string, id: string, userId: string) {
      const req = s.requests.find((r) => r.id === id);
      if (!req || req.status !== "live") throw new ValidationError("Recipients can only be removed from a live request.");
      const rec = s.recipients.find((r) => r.requestId === id && r.userId === userId);
      if (!rec) throw new NotFoundError("This agent is not on the request.");
      if (rec.status === "confirmed") throw new ValidationError("This agent already confirmed — they can't be removed.");
      s.recipients = s.recipients.filter((r) => r !== rec);
      log(s, { actorId, action: "RECIPIENT_REMOVED", requestId: id, targetUserId: userId });
    },

    markOpened(userId: string, requestId: string) {
      const rec = s.recipients.find((r) => r.requestId === requestId && r.userId === userId);
      if (rec && rec.status === "sent") {
        rec.status = "opened";
        rec.openedAt = nowIso();
        log(s, { actorId: userId, action: "REQUEST_VIEWED", requestId });
      }
    },

    respond(userId: string, requestId: string, decision: "confirm" | "decline" | "withdraw", minutes?: number) {
      const req = s.requests.find((r) => r.id === requestId);
      const rec = s.recipients.find((r) => r.requestId === requestId && r.userId === userId);
      if (!req || !rec) throw new NotFoundError("This request isn't addressed to you.");
      if (req.status !== "live") throw new ValidationError("This request has closed — responses are no longer accepted.");
      if (decision === "withdraw") {
        rec.status = rec.openedAt ? "opened" : "sent";
        rec.respondedAt = null;
        rec.minutes = null;
        log(s, { actorId: userId, action: "RESPONSE_WITHDRAWN", requestId });
        return rec;
      }
      if (!rec.openedAt) rec.openedAt = nowIso();
      rec.respondedAt = nowIso();
      if (decision === "confirm") {
        const allowed = req.flexible ? [15, 30, 45, 60] : [req.durationMin];
        const m = minutes && allowed.includes(minutes) ? minutes : req.durationMin;
        rec.status = "confirmed";
        rec.minutes = m;
        log(s, { actorId: userId, action: "AGENT_CONFIRMED", requestId, meta: { minutes: m } });
      } else {
        rec.status = "declined";
        rec.minutes = null;
        log(s, { actorId: userId, action: "AGENT_DECLINED", requestId });
      }
      return rec;
    },

    markEmailPrepared(userId: string, requestId: string, kind: string) {
      const rec = s.recipients.find((r) => r.requestId === requestId && r.userId === userId);
      if (rec) rec.emailPreparedAt = nowIso();
      log(s, { actorId: userId, action: "EMAIL_OPENED", requestId, meta: { kind } });
    },

    logEmailOpenedByMonitoring(actorId: string, requestId: string, kind: string) {
      log(s, { actorId, action: "EMAIL_OPENED", requestId, meta: { kind } });
    },

    saveTemplate(actorId: string, input: Partial<EmailTemplate> & { id?: string }) {
      const name = (input.name || "").trim().slice(0, 60);
      const subject = (input.subject || "").trim().slice(0, 200);
      const body = (input.body || "").slice(0, 4000);
      if (!name || !subject || !body.trim()) throw new ValidationError("A template needs a name, a subject and a body.");
      let tpl = input.id ? s.templates.find((t) => t.id === input.id) : undefined;
      if (input.id && !tpl) throw new NotFoundError("Template not found.");
      if (!tpl) {
        const kind = input.kind === "confirmation" ? "confirmation" : "request";
        const language = (["en", "fr", "de", "it", "pl"] as const).find((l) => l === input.language) || "en";
        tpl = { id: `tpl-${(s.seq.id++).toString(36)}`, name, kind, language, subject, body, isDefault: false, updatedAt: nowIso(), updatedBy: actorId };
        s.templates.push(tpl);
      } else {
        Object.assign(tpl, { name, subject, body, updatedAt: nowIso(), updatedBy: actorId });
      }
      if (input.isDefault) {
        for (const t of s.templates) if (t.kind === tpl.kind && t.language === tpl.language) t.isDefault = t.id === tpl.id;
      }
      log(s, { actorId, action: "TEMPLATE_UPDATED", meta: { template: tpl.name } });
      return tpl;
    },

    createGroup(actorId: string, name: string, memberIds: string[]) {
      const clean = name.trim().slice(0, 60);
      const members = [...new Set(memberIds)].filter((id) => s.users.some((u) => u.id === id && u.role === "agent"));
      if (!clean) throw new ValidationError("Give the group a name.");
      if (!members.length) throw new ValidationError("A group needs at least one agent.");
      const grp: CustomGroup = { id: `grp-${(s.seq.id++).toString(36)}`, name: clean, memberIds: members, createdBy: actorId, createdAt: nowIso() };
      s.groups.push(grp);
      log(s, { actorId, action: "GROUP_CREATED", meta: { group: clean, members: members.length } });
      return grp;
    },

    deleteGroup(actorId: string, id: string) {
      const grp = s.groups.find((x) => x.id === id);
      if (!grp) throw new NotFoundError("Group not found.");
      s.groups = s.groups.filter((x) => x.id !== id);
      log(s, { actorId, action: "GROUP_DELETED", meta: { group: grp.name } });
    },

    logAction(actorId: string, action: AuditAction, requestId?: string) {
      log(s, { actorId, action, requestId });
    },
  };
};

export type Repo = ReturnType<typeof repo>;
