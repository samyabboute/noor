import "server-only";
import type {
  AuditLog,
  CustomGroup,
  DistributionList,
  EmailTemplate,
  OvertimeRecipient,
  OvertimeRequest,
  RecipientSource,
  Team,
  TeamId,
  User,
  Language,
} from "@/lib/types";
import { fromMinutes, nowMinutes, shiftDate, todayISO, zonedToDate } from "@/lib/time";

/**
 * Deterministic demo data: ~90 days of believable overtime activity for a
 * Kraków contact centre, plus one request that is live right now.
 * Names are fictional. Addresses use the reserved example.com domain.
 */

export const DOMAIN = process.env.DEMO_EMAIL_DOMAIN || "example.com";
export const DEMO_AGENT_ID = "u-samy";

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const slug = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L")
    .toLowerCase()
    .replace(/[^a-z ]/g, "")
    .trim()
    .replace(/\s+/g, ".");

export const TEAMS: Team[] = [
  { id: "rbc", code: "RBC", name: "Residential Billing & Care" },
  { id: "rsm", code: "RSM", name: "Residential Service & Moves" },
  { id: "bm", code: "BM", name: "Business & Mobile" },
];

const AGENTS: [string, TeamId, Language][] = [
  ["Samy Abboute", "rbc", "fr"],
  ["Rachid Benali", "rbc", "fr"],
  ["Sarah Lemaire", "rbc", "fr"],
  ["Jakub Kowalski", "rbc", "de"],
  ["Léa Fontaine", "rbc", "fr"],
  ["Mateusz Wójcik", "rbc", "de"],
  ["Inès Haddad", "rbc", "fr"],
  ["Paweł Kamiński", "rbc", "de"],
  ["Chiara Rossi", "rbc", "it"],
  ["Nicolas Girard", "rbc", "fr"],
  ["Zofia Lewandowska", "rbc", "de"],
  ["Yanis Mercier", "rbc", "fr"],
  ["Anna Szymańska", "rbc", "fr"],
  ["Lukas Brunner", "rbc", "de"],
  ["Camille Roux", "rbc", "fr"],
  ["Michał Dąbrowski", "rbc", "de"],
  ["Elena Ferrari", "rbc", "it"],
  ["Hugo Lambert", "rbc", "fr"],
  ["Julia Wiśniewska", "rsm", "de"],
  ["Thomas Keller", "rsm", "de"],
  ["Amira Saidi", "rsm", "fr"],
  ["Piotr Zając", "rsm", "de"],
  ["Laura Meier", "rsm", "de"],
  ["Karim Bouzid", "rsm", "fr"],
  ["Natalia Kozłowska", "rsm", "it"],
  ["Matteo Bianchi", "rsm", "it"],
  ["Sophie Weber", "rsm", "de"],
  ["Adam Mazur", "rsm", "de"],
  ["Manon Petit", "rsm", "fr"],
  ["Tomasz Krawczyk", "rsm", "de"],
  ["Giulia Romano", "rsm", "it"],
  ["David Huber", "rsm", "de"],
  ["Weronika Piotrowska", "rsm", "fr"],
  ["Mehdi Larbi", "rsm", "fr"],
  ["Oliwia Grabowska", "bm", "de"],
  ["Jonas Fischer", "bm", "de"],
  ["Clara Moretti", "bm", "it"],
  ["Bartosz Pawlak", "bm", "de"],
  ["Emma Schneider", "bm", "de"],
  ["Maxime Bonnet", "bm", "fr"],
  ["Aleksandra Michalska", "bm", "fr"],
  ["Luca Galli", "bm", "it"],
  ["Nadia Rahmani", "bm", "fr"],
  ["Krzysztof Nowicki", "bm", "de"],
  ["Lina Vogel", "bm", "de"],
  ["Kacper Adamczyk", "bm", "de"],
];

export const MONITORING_TEAM: [string, string][] = [
  ["u-mon-bartlomiej", "Bartłomiej Wyżycki"],
  ["u-mon-katarzyna", "Katarzyna Nowak"],
  ["u-mon-julien", "Julien Morel"],
  ["u-mon-agnieszka", "Agnieszka Lis"],
  ["u-mon-marco", "Marco Bernasconi"],
  ["u-mon-ewa", "Ewa Kowalczyk"],
];

const MANAGEMENT: [string, string, string][] = [
  ["u-mgmt-claire", "Claire Dubois", "Head of Customer Care"],
  ["u-mgmt-tomasz", "Tomasz Zieliński", "Operations Manager"],
];

export interface SeedState {
  teams: Team[];
  users: User[];
  dls: DistributionList[];
  groups: CustomGroup[];
  templates: EmailTemplate[];
  requests: OvertimeRequest[];
  recipients: OvertimeRecipient[];
  audit: AuditLog[];
  sim: SimPlan[];
  seq: { request: number; id: number };
}

/** Demo-only: a scheduled, simulated response so the command centre feels alive. */
export interface SimPlan {
  recipientId: string;
  openAt: string;
  respondAt: string | null;
  outcome: "confirmed" | "declined" | null;
  minutes: number;
}

export function buildSeed(now = new Date()): SeedState {
  const r = rng(20261002);
  const pick = <T,>(arr: T[]) => arr[Math.floor(r() * arr.length)];
  let idSeq = 1;
  const nid = (p: string) => `${p}-${(idSeq++).toString(36)}`;

  // ── People ─────────────────────────────────────────────────────────────
  const users: User[] = AGENTS.map(([name, teamId, language], i) => ({
    id: i === 0 ? DEMO_AGENT_ID : `u-${slug(name).replace(".", "-")}`,
    name,
    email: `${slug(name)}@${DOMAIN}`,
    role: "agent",
    teamId,
    language,
    active: name !== "Lina Vogel", // one agent on leave — excluded from selection
    title: "Customer Care Agent",
    shiftEnd: i % 5 === 0 ? "17:00" : "18:00",
  }));
  for (const [id, name] of MONITORING_TEAM) {
    users.push({
      id,
      name,
      email: `${slug(name)}@${DOMAIN}`,
      role: "monitoring",
      teamId: null,
      language: id === "u-mon-julien" ? "fr" : id === "u-mon-marco" ? "it" : "en",
      active: true,
      title: id === "u-mon-bartlomiej" ? "Real-Time Monitoring Lead" : "Real-Time Analyst",
      shiftEnd: "20:00",
    });
  }
  for (const [id, name, title] of MANAGEMENT) {
    users.push({ id, name, email: `${slug(name)}@${DOMAIN}`, role: "management", teamId: null, language: "en", active: true, title, shiftEnd: "18:00" });
  }

  const agents = users.filter((u) => u.role === "agent");
  const byTeam = (t: TeamId) => agents.filter((a) => a.teamId === t).map((a) => a.id);

  // DLs mirror the Exchange lists. A few RSM agents are also on DL RBC KRK.
  const dls: DistributionList[] = [
    { id: "dl-rbc", name: "DL RBC KRK", address: `dl.rbc.krk@${DOMAIN}`, teamId: "rbc", memberIds: [...byTeam("rbc"), ...byTeam("rsm").slice(0, 3)] },
    { id: "dl-rsm", name: "DL RSM KRK", address: `dl.rsm.krk@${DOMAIN}`, teamId: "rsm", memberIds: byTeam("rsm") },
    { id: "dl-bm", name: "DL BM KRK", address: `dl.bm.krk@${DOMAIN}`, teamId: "bm", memberIds: byTeam("bm") },
  ];

  const groups: CustomGroup[] = [
    {
      id: "grp-evening",
      name: "Evening volunteers",
      memberIds: ["u-samy", agents[4].id, agents[9].id, agents[20].id, agents[25].id, agents[37].id, agents[41].id],
      createdBy: "u-mon-bartlomiej",
      createdAt: new Date(now.getTime() - 20 * 86400e3).toISOString(),
    },
    {
      id: "grp-fr",
      name: "French-speaking backup",
      memberIds: agents.filter((a) => a.language === "fr").slice(0, 9).map((a) => a.id),
      createdBy: "u-mon-julien",
      createdAt: new Date(now.getTime() - 41 * 86400e3).toISOString(),
    },
  ];

  // ── Templates ──────────────────────────────────────────────────────────
  const tplAt = new Date(now.getTime() - 9 * 86400e3).toISOString();
  const templates: EmailTemplate[] = [
    {
      id: "tpl-req-standard",
      name: "Standard overtime",
      kind: "request",
      language: "en",
      isDefault: true,
      subject: "Overtime coverage — {{date}}",
      body:
        "Hello everyone,\n\nDue to increased call volume and customer waiting times, we are looking for additional voluntary coverage today.\n\nDate: {{date}}\nTime: {{start_time}} → {{end_time}}\n\nPlease confirm your availability through Overtime — it takes one click.\n\nThank you,\n{{request_owner}}\nReal-Time Monitoring",
      updatedAt: tplAt,
      updatedBy: "u-mon-bartlomiej",
    },
    {
      id: "tpl-req-peak",
      name: "Peak alert",
      kind: "request",
      language: "en",
      isDefault: false,
      subject: "Help us cover the peak — {{start_time}} → {{end_time}}",
      body:
        "Hi team,\n\nQueues are building and customers are waiting longer than we'd like. If you can stay {{duration}} today, it makes a real difference.\n\nOne click in Overtime is all it takes.\n\nThanks,\n{{request_owner}}",
      updatedAt: tplAt,
      updatedBy: "u-mon-katarzyna",
    },
    {
      id: "tpl-req-fr",
      name: "Heures supplémentaires (FR)",
      kind: "request",
      language: "fr",
      isDefault: false,
      subject: "Heures supplémentaires — {{date}}",
      body:
        "Bonjour à tous,\n\nNous observons une augmentation du volume d'appels et des temps d'attente élevés pour nos clients.\n\nSi vous pouvez rester un peu plus longtemps aujourd'hui ({{start_time}} → {{end_time}}), confirmez simplement dans Overtime — en un clic.\n\nMerci beaucoup,\n{{request_owner}}",
      updatedAt: tplAt,
      updatedBy: "u-mon-julien",
    },
    {
      id: "tpl-conf-en",
      name: "Confirmation",
      kind: "confirmation",
      language: "en",
      isDefault: true,
      subject: "Overtime confirmation – {{agent_name}} – {{end_time}}",
      body:
        "Hello,\n\nI confirm that I am available for overtime today.\n\nAgent: {{agent_name}}\nTeam: {{team}}\nAdditional time: {{duration}}\nNew logout time: {{end_time}}\nRequest: {{request_id}}\n\nThank you.\n\nBest regards,\n{{agent_name}}",
      updatedAt: tplAt,
      updatedBy: "u-mon-bartlomiej",
    },
    {
      id: "tpl-conf-fr",
      name: "Confirmation (FR)",
      kind: "confirmation",
      language: "fr",
      isDefault: true,
      subject: "Confirmation heures supplémentaires – {{agent_name}} – {{end_time}}",
      body:
        "Bonjour,\n\nJe confirme ma disponibilité pour des heures supplémentaires aujourd'hui.\n\nAgent : {{agent_name}}\nÉquipe : {{team}}\nTemps additionnel : {{duration}}\nNouvelle heure de déconnexion : {{end_time}}\nDemande : {{request_id}}\n\nMerci.\n\nMeilleures salutations,\n{{agent_name}}",
      updatedAt: tplAt,
      updatedBy: "u-mon-julien",
    },
    {
      id: "tpl-conf-de",
      name: "Bestätigung (DE)",
      kind: "confirmation",
      language: "de",
      isDefault: true,
      subject: "Bestätigung Überstunden – {{agent_name}} – {{end_time}}",
      body:
        "Hallo,\n\nich bestätige, dass ich heute für Überstunden verfügbar bin.\n\nAgent: {{agent_name}}\nTeam: {{team}}\nZusätzliche Zeit: {{duration}}\nNeue Abmeldezeit: {{end_time}}\nAnfrage: {{request_id}}\n\nDanke.\n\nFreundliche Grüsse\n{{agent_name}}",
      updatedAt: tplAt,
      updatedBy: "u-mon-marco",
    },
  ];

  // ── History ────────────────────────────────────────────────────────────
  const requests: OvertimeRequest[] = [];
  const recipients: OvertimeRecipient[] = [];
  const audit: AuditLog[] = [];
  const sim: SimPlan[] = [];
  let reqSeq = 1000;
  const monIds = MONITORING_TEAM.map(([id]) => id);
  const confirmBias: Record<TeamId, number> = { rbc: 0.7, rsm: 0.6, bm: 0.5 };
  // Some people simply say yes more often — participation should look human, not uniform.
  const personal = new Map(agents.map((a) => [a.id, 0.55 + r() * 0.75]));
  personal.set(DEMO_AGENT_ID, 1.25);

  const today = todayISO(now);
  const titles = ["Evening peak coverage", "Peak coverage", "Billing wave — evening", "Storm outage follow-up", "Monday backlog", "Late queue support"];

  function makeRequest(opts: {
    date: string;
    start: string;
    duration: number;
    owner: string;
    dlIds: string[];
    groupIds?: string[];
    sentAt: Date;
    status: OvertimeRequest["status"];
    title?: string;
    target?: number;
  }) {
    const id = `OT-${++reqSeq}`;
    const req: OvertimeRequest = {
      id,
      title: opts.title || pick(titles),
      createdBy: opts.owner,
      createdAt: new Date(opts.sentAt.getTime() - (2 + r() * 6) * 60e3).toISOString(),
      sentAt: opts.status === "draft" ? null : opts.sentAt.toISOString(),
      closedAt: opts.status === "completed" ? zonedToDate(opts.date, opts.start).toISOString() : null,
      date: opts.date,
      startTime: opts.start,
      durationMin: opts.duration,
      flexible: r() > 0.3,
      target: opts.target ?? 0,
      status: opts.status,
      subject: templates[0].subject,
      body: templates[0].body,
      confirmationTemplateId: "tpl-conf-en",
      ccIds: monIds.filter((m) => m !== opts.owner),
      sources: { dlIds: opts.dlIds, groupIds: opts.groupIds || [] },
    };
    requests.push(req);
    audit.push({ id: nid("a"), at: req.createdAt, actorId: opts.owner, action: "REQUEST_CREATED", requestId: id });
    if (req.sentAt) audit.push({ id: nid("a"), at: req.sentAt, actorId: opts.owner, action: "REQUEST_SENT", requestId: id });
    return req;
  }

  function addRecipient(req: OvertimeRequest, userId: string, source: RecipientSource) {
    const rec: OvertimeRecipient = {
      id: nid("r"),
      requestId: req.id,
      userId,
      source,
      status: "sent",
      addedAt: req.sentAt || req.createdAt,
      openedAt: null,
      respondedAt: null,
      minutes: null,
      emailPreparedAt: null,
    };
    recipients.push(rec);
    return rec;
  }

  function populate(req: OvertimeRequest, coverageRatio: number) {
    const chosen = new Map<string, RecipientSource>();
    for (const dlId of req.sources.dlIds) {
      const dl = dls.find((d) => d.id === dlId)!;
      for (const m of dl.memberIds) {
        const u = users.find((x) => x.id === m)!;
        if (!u.active || chosen.has(m)) continue;
        if (r() < coverageRatio) chosen.set(m, { type: "dl", id: dlId });
      }
    }
    for (const gid of req.sources.groupIds) {
      for (const m of groups.find((g) => g.id === gid)!.memberIds) if (!chosen.has(m)) chosen.set(m, { type: "group", id: gid });
    }
    return [...chosen.entries()].map(([uid, src]) => addRecipient(req, uid, src));
  }

  function respond(req: OvertimeRequest, rec: OvertimeRecipient, sentAt: Date, closeAt: Date, dayMood: number) {
    const u = users.find((x) => x.id === rec.userId)!;
    const pConfirm = Math.min(0.95, confirmBias[u.teamId!] * dayMood * personal.get(u.id)!);
    const roll = r();
    const openDelay = (0.5 + r() * r() * 25) * 60e3;
    const opened = new Date(sentAt.getTime() + openDelay);
    if (opened > closeAt || r() < 0.08) {
      rec.status = "expired";
      return;
    }
    rec.openedAt = opened.toISOString();
    const respDelay = Math.exp(Math.log(150) + (r() - 0.35) * 2.2) * 1000; // ~2.5 min median, long tail
    const responded = new Date(opened.getTime() + respDelay);
    if (responded > closeAt) {
      rec.status = "expired";
      return;
    }
    if (roll < pConfirm) {
      rec.status = "confirmed";
      rec.minutes = req.flexible && r() < 0.35 ? pick([15, 30, 45, 60]) : req.durationMin;
      rec.emailPreparedAt = r() < 0.9 ? new Date(responded.getTime() + 8e3).toISOString() : null;
      audit.push({ id: nid("a"), at: responded.toISOString(), actorId: u.id, action: "AGENT_CONFIRMED", requestId: req.id, meta: { minutes: rec.minutes } });
    } else if (roll < pConfirm + 0.22) {
      rec.status = "declined";
      audit.push({ id: nid("a"), at: responded.toISOString(), actorId: u.id, action: "AGENT_DECLINED", requestId: req.id });
    } else {
      rec.status = "expired";
      return;
    }
    rec.respondedAt = responded.toISOString();
  }

  for (let back = 90; back >= 1; back--) {
    const date = shiftDate(today, -back);
    const dow = new Date(`${date}T12:00:00Z`).getUTCDay();
    if (dow === 0) continue;
    const intensity = dow === 1 ? 1.6 : dow === 6 ? 0.35 : 1;
    const n = r() < 0.12 * intensity ? 0 : r() < 0.35 * intensity ? 2 : 1;
    for (let k = 0; k < n; k++) {
      const start = k === 0 ? pick(["17:00", "18:00", "18:00", "18:00", "19:00"]) : pick(["12:00", "13:00", "20:00"]);
      const duration = pick([15, 30, 30, 30, 45, 60]);
      const dlCombo = pick([["dl-rbc"], ["dl-rsm"], ["dl-bm"], ["dl-rbc", "dl-rsm"], ["dl-rbc", "dl-rsm"], ["dl-rbc", "dl-rsm", "dl-bm"], ["dl-rsm", "dl-bm"]]);
      const startDate = zonedToDate(date, start);
      const sentAt = new Date(startDate.getTime() - (40 + r() * 140) * 60e3);
      const req = makeRequest({ date, start, duration, owner: pick(monIds), dlIds: dlCombo, groupIds: r() < 0.15 ? ["grp-evening"] : [], sentAt, status: "completed" });
      const recs = populate(req, 0.62 + r() * 0.35);
      req.target = Math.max(4, Math.round(recs.length * (0.45 + r() * 0.3)));
      const mood = 0.75 + r() * 0.45;
      for (const rec of recs) respond(req, rec, sentAt, startDate, mood);
      audit.push({ id: nid("a"), at: req.closedAt!, actorId: "system", action: "REQUEST_COMPLETED", requestId: req.id });
    }
  }

  // ── Today ──────────────────────────────────────────────────────────────
  const nowMin = nowMinutes(now);
  if (nowMin > 13 * 60 + 30) {
    const sentAt = zonedToDate(today, "11:05");
    const req = makeRequest({ date: today, start: "12:00", duration: 30, owner: "u-mon-katarzyna", dlIds: ["dl-bm"], sentAt, status: "completed", title: "Lunch peak — BM", target: 5 });
    const recs = populate(req, 0.9).filter((x) => x.userId !== DEMO_AGENT_ID);
    for (const rec of recs) respond(req, rec, sentAt, zonedToDate(today, "12:00"), 1.05);
    audit.push({ id: nid("a"), at: req.closedAt!, actorId: "system", action: "REQUEST_COMPLETED", requestId: req.id });
  }

  // The live request: starts at 18:00, or ~45 min from now later in the day.
  let liveDate = today;
  let liveStart = Math.max(18 * 60, Math.ceil((nowMin + 45) / 15) * 15);
  if (liveStart > 23 * 60 + 15) {
    liveDate = shiftDate(today, 1);
    liveStart = 18 * 60;
  }
  const liveSent = new Date(now.getTime() - 26 * 60e3);
  const live = makeRequest({
    date: liveDate,
    start: fromMinutes(liveStart),
    duration: 30,
    owner: "u-mon-bartlomiej",
    dlIds: ["dl-rbc", "dl-rsm"],
    sentAt: liveSent,
    status: "live",
    title: "Customer Care — Peak coverage",
    target: 18,
  });
  live.flexible = true;
  // Monitoring trimmed the DLs by hand: everyone on RBC except two, a hand-picked RSM subset, plus two BM individuals.
  const rbcPicked = dls[0].memberIds.filter((id) => users.find((u) => u.id === id)!.teamId === "rbc").filter((_, i) => i !== 5 && i !== 11);
  const rsmPicked = dls[1].memberIds.filter((_, i) => i % 3 !== 2).slice(0, 7);
  for (const id of rbcPicked) addRecipient(live, id, { type: "dl", id: "dl-rbc" });
  for (const id of rsmPicked) addRecipient(live, id, { type: "dl", id: "dl-rsm" });
  for (const id of byTeam("bm").slice(1, 3)) {
    addRecipient(live, id, { type: "individual" });
    audit.push({ id: nid("a"), at: live.sentAt!, actorId: live.createdBy, action: "RECIPIENT_ADDED", requestId: live.id, targetUserId: id });
  }
  const liveRecs = recipients.filter((x) => x.requestId === live.id);
  const sentMs = liveSent.getTime();
  // 10 confirmed, 3 declined, 4 opened, rest untouched — then a few more arrive while you watch.
  const others = liveRecs.filter((x) => x.userId !== DEMO_AGENT_ID);
  others.forEach((rec, i) => {
    const t = sentMs + (40 + i * 85 + r() * 60) * 1000;
    if (i < 10) {
      rec.status = "confirmed";
      rec.openedAt = new Date(t - 30e3).toISOString();
      rec.respondedAt = new Date(t).toISOString();
      rec.minutes = i % 4 === 3 ? 45 : i % 5 === 4 ? 15 : 30;
      rec.emailPreparedAt = new Date(t + 6e3).toISOString();
      audit.push({ id: nid("a"), at: rec.respondedAt, actorId: rec.userId, action: "AGENT_CONFIRMED", requestId: live.id, meta: { minutes: rec.minutes } });
    } else if (i < 13) {
      rec.status = "declined";
      rec.openedAt = new Date(t - 30e3).toISOString();
      rec.respondedAt = new Date(t).toISOString();
      audit.push({ id: nid("a"), at: rec.respondedAt, actorId: rec.userId, action: "AGENT_DECLINED", requestId: live.id });
    } else if (i < 17) {
      rec.status = "opened";
      rec.openedAt = new Date(t).toISOString();
      audit.push({ id: nid("a"), at: rec.openedAt, actorId: rec.userId, action: "REQUEST_VIEWED", requestId: live.id });
      if (i < 15) sim.push({ recipientId: rec.id, openAt: rec.openedAt, respondAt: new Date(now.getTime() + (25 + i * 30) * 1000).toISOString(), outcome: i === 14 ? "declined" : "confirmed", minutes: 30 });
    } else if (i < 19) {
      sim.push({ recipientId: rec.id, openAt: new Date(now.getTime() + (50 + i * 20) * 1000).toISOString(), respondAt: new Date(now.getTime() + (110 + i * 25) * 1000).toISOString(), outcome: "confirmed", minutes: 30 });
    }
  });

  // A draft for tomorrow, so the lifecycle shows every state.
  const draft = makeRequest({
    date: shiftDate(today, 1),
    start: "18:00",
    duration: 45,
    owner: "u-mon-katarzyna",
    dlIds: ["dl-bm"],
    sentAt: new Date(now.getTime() - 3 * 3600e3),
    status: "draft",
    title: "Tomorrow — BM evening",
    target: 6,
  });
  populate(draft, 0.8);
  audit.push({ id: nid("a"), at: draft.createdAt, actorId: draft.createdBy, action: "REQUEST_DRAFTED", requestId: draft.id });

  audit.sort((a, b) => a.at.localeCompare(b.at));
  return { teams: TEAMS, users, dls, groups, templates, requests, recipients, audit, sim, seq: { request: reqSeq, id: idSeq } };
}
