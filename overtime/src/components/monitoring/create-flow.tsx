"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, Minus, Plus, Send } from "lucide-react";
import type { EmailTemplate } from "@/lib/types";
import { addMinutes, formatDateLong, nowMinutes, shiftDate, toMinutes } from "@/lib/time";
import { TEMPLATE_VARIABLES, renderTemplate, requestVars } from "@/lib/template";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import { Button, Magnetic } from "@/components/ui/button";
import { Segmented, Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/overlay";
import { Avatar, AvatarStack } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { Kbd } from "@/components/ui/badge";
import { RecipientSelector, selectionToPayload, sourcesOf, type AgentLite, type GroupLite, type ListLite, type Selection } from "./recipient-selector";

export interface DraftInit {
  id: string;
  title: string;
  date: string;
  startTime: string;
  durationMin: number;
  flexible: boolean;
  target: number;
  subject: string;
  body: string;
  confirmationTemplateId: string;
  selection: Selection;
}

const STEPS = [
  { key: "when", label: "When?" },
  { key: "who", label: "Who?" },
  { key: "message", label: "Message" },
  { key: "review", label: "Review" },
] as const;

const ease = [0.22, 1, 0.36, 1] as const;

export function CreateRequestFlow({
  me,
  today,
  suggestedStart,
  directory,
  draft,
}: {
  me: { id: string; name: string };
  today: string;
  suggestedStart: string;
  directory: { agents: AgentLite[]; lists: ListLite[]; groups: GroupLite[]; templates: EmailTemplate[]; monitoringTeam: { id: string; name: string }[] };
  draft: DraftInit | null;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const requestTemplates = directory.templates.filter((t) => t.kind === "request");
  const confirmationTemplates = directory.templates.filter((t) => t.kind === "confirmation");
  const defaultTpl = requestTemplates.find((t) => t.isDefault) || requestTemplates[0];

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [title, setTitle] = useState(draft?.title || "Peak coverage");
  const [date, setDate] = useState(draft?.date || today);
  const [startTime, setStartTime] = useState(draft?.startTime || suggestedStart);
  const [duration, setDuration] = useState(draft?.durationMin || 30);
  const [flexible, setFlexible] = useState(draft?.flexible ?? true);
  const [target, setTarget] = useState(draft?.target || 0);
  const [targetTouched, setTargetTouched] = useState(Boolean(draft?.target));
  const [selection, setSelection] = useState<Selection>(draft?.selection || {});
  const [templateId, setTemplateId] = useState(draft ? "" : defaultTpl?.id || "");
  const [subject, setSubject] = useState(draft?.subject || defaultTpl?.subject || "");
  const [body, setBody] = useState(draft?.body || defaultTpl?.body || "");
  const [confTplId, setConfTplId] = useState(draft?.confirmationTemplateId || confirmationTemplates.find((t) => t.isDefault && t.language === "en")?.id || "");
  const [busy, setBusy] = useState<null | "send" | "draft">(null);
  const [error, setError] = useState<string | null>(null);
  const [groupModal, setGroupModal] = useState<string[] | null>(null);
  const [groups, setGroups] = useState(directory.groups);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const count = Object.keys(selection).length;
  const effectiveTarget = targetTouched ? target : Math.max(1, Math.ceil(count * 0.6));
  const endTime = addMinutes(startTime, duration);
  const vars = requestVars({ id: draft?.id || "OT-NEW", date, startTime, durationMin: duration }, me);
  const isPast = date === today && toMinutes(startTime) <= nowMinutes();

  const stepError = useMemo(() => {
    if (step === 0) {
      if (!/^\d{2}:\d{2}$/.test(startTime)) return "Pick a start time.";
      if (date < today) return "That date has passed.";
      if (isPast) return "That time has already passed today — responses close when coverage starts.";
    }
    if (step === 1 && count === 0) return "Select at least one agent to reach.";
    if (step === 2 && (!subject.trim() || !body.trim())) return "The message needs a subject and a body.";
    return null;
  }, [step, startTime, date, today, isPast, count, subject, body]);

  function go(to: number) {
    if (to > step && stepError) {
      setError(stepError);
      return;
    }
    setError(null);
    setDir(to > step ? 1 : -1);
    setStep(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => setError(null), [startTime, date, count, subject, body]);

  // ⌘/Ctrl + Enter moves forward — the whole flow can be driven from the keyboard.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (step < 3) go(step + 1);
        else submit(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function applyTemplate(id: string) {
    const t = requestTemplates.find((x) => x.id === id);
    if (!t) return;
    setTemplateId(id);
    setSubject(t.subject);
    setBody(t.body);
  }

  function insertVariable(key: string) {
    const el = bodyRef.current;
    const token = `{{${key}}}`;
    if (!el) return setBody((b) => b + token);
    const s = el.selectionStart;
    const e = el.selectionEnd;
    const next = body.slice(0, s) + token + body.slice(e);
    setBody(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + token.length, s + token.length);
    });
  }

  async function submit(send: boolean) {
    if (send) {
      if (count === 0) return setError("Select at least one agent to reach.");
      if (isPast) return setError("That time has already passed today.");
      if (!subject.trim() || !body.trim()) return setError("The message needs a subject and a body.");
    }
    setBusy(send ? "send" : "draft");
    try {
      const res = await api<{ id: string }>("/api/requests", {
        method: "POST",
        json: {
          send,
          draftId: draft?.id,
          title,
          date,
          startTime,
          durationMin: duration,
          flexible,
          target: effectiveTarget,
          subject,
          body,
          confirmationTemplateId: confTplId,
          recipients: selectionToPayload(selection),
          sources: sourcesOf(selection),
        },
      });
      if (send) {
        router.push(`/monitoring/requests/${res.id}?launched=1`);
      } else {
        toast({ title: "Draft saved", description: "Pick it up any time from Requests." });
        router.push("/monitoring/requests?tab=draft");
      }
      router.refresh();
    } catch (e) {
      setBusy(null);
      setError((e as Error).message);
      toast({ tone: "error", title: send ? "The request wasn’t sent" : "Couldn’t save the draft", description: `${(e as Error).message} Nothing was lost.` });
    }
  }

  async function saveGroup(name: string, ids: string[]) {
    try {
      const { group } = await api<{ group: GroupLite }>("/api/groups", { method: "POST", json: { name, memberIds: ids } });
      setGroups((g) => [...g, group]);
      toast({ title: `“${group.name}” saved`, description: `${ids.length} agents — reuse it on your next request.` });
      setGroupModal(null);
    } catch (e) {
      toast({ tone: "error", title: "Couldn’t save the group", description: (e as Error).message });
    }
  }

  const sourceSummary = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of Object.values(selection)) {
      const label = s.type === "dl" ? directory.lists.find((l) => l.id === s.id)?.name || "List" : s.type === "group" ? groups.find((g) => g.id === s.id)?.name || "Group" : "Individuals";
      m.set(label, (m.get(label) || 0) + 1);
    }
    return [...m.entries()];
  }, [selection, directory.lists, groups]);

  const confTpl = confirmationTemplates.find((t) => t.id === confTplId);
  const cc = directory.monitoringTeam.filter((m) => m.id !== me.id);

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <Link href="/monitoring" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-400 transition hover:text-ink-900">
          <ChevronLeft size={15} /> Control center
        </Link>
        {draft && <span className="text-[13px] text-ink-400">Editing draft {draft.id}</span>}
      </div>

      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">New overtime request</p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.h1 key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease }} className="mt-3 text-display-md font-semibold">
              {["When do you need cover?", "Who should we reach?", "What should they read?", "Ready to launch."][step]}
            </motion.h1>
          </AnimatePresence>
        </div>
        <ol className="flex items-center gap-1" aria-label="Progress">
          {STEPS.map((s, i) => (
            <li key={s.key}>
              <button
                type="button"
                onClick={() => (i < step ? go(i) : i === step + 1 ? go(i) : undefined)}
                aria-current={i === step ? "step" : undefined}
                className={cn("group flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-[13px] font-medium transition", i === step ? "bg-ink-900 text-white" : i < step ? "text-ink-700 hover:bg-ink-900/5" : "text-ink-300")}
              >
                <span className={cn("grid h-6 w-6 place-items-center rounded-full text-[11px] tnum", i === step ? "bg-white/15" : i < step ? "bg-covered text-white" : "ring-1 ring-ink-900/10")}>
                  {i < step ? <Check size={12} strokeWidth={3} /> : i + 1}
                </span>
                <span className={cn(i !== step && "hidden md:inline")}>{s.label}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="relative mt-10">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -24, transition: { duration: 0.15 } }}
            transition={{ duration: 0.35, ease }}
          >
            {step === 0 && (
              <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
                <div className="surface min-w-0 space-y-8 p-5 sm:p-8">
                  <Field label="Date">
                    <div className="flex flex-wrap items-center gap-2">
                      <Segmented
                        label="Date"
                        value={date === today ? "today" : date === shiftDate(today, 1) ? "tomorrow" : "other"}
                        onChange={(v) => v !== "other" && setDate(v === "today" ? today : shiftDate(today, 1))}
                        options={[
                          { value: "today", label: "Today" },
                          { value: "tomorrow", label: "Tomorrow" },
                          { value: "other", label: "Other" },
                        ]}
                      />
                      <input type="date" aria-label="Pick a date" min={today} value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="field h-10 w-auto py-0" />
                    </div>
                  </Field>
                  <Field label="Coverage starts" hint="Usually the end of the regular shift. Responses close at this time.">
                    <div className="flex flex-wrap items-center gap-2">
                      <input type="time" aria-label="Start time" value={startTime} step={900} onChange={(e) => setStartTime(e.target.value)} className="field tnum h-10 w-32 py-0" />
                      {["17:00", "18:00", "19:00", "20:00"].map((t) => (
                        <button key={t} type="button" onClick={() => setStartTime(t)} className={cn("tnum h-10 rounded-xl px-3.5 text-sm font-medium ring-1 transition", startTime === t ? "bg-ink-900 text-white ring-ink-900" : "bg-white text-ink-600 ring-ink-900/10 hover:ring-ink-900/25")}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Requested overtime">
                    <Segmented
                      label="Requested overtime"
                      size="lg"
                      className="w-full sm:w-auto"
                      value={duration}
                      onChange={setDuration}
                      options={[15, 30, 45, 60].map((m) => ({ value: m, label: <>+{m}<span className="hidden sm:inline"> min</span></> }))}
                    />
                    <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-ink-600">
                      <Toggle checked={flexible} onChange={setFlexible} label="Let agents choose 15–60 minutes" />
                      Let agents choose 15–60 minutes
                    </label>
                  </Field>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field label="Agents needed" hint={targetTouched ? undefined : "Suggested from your selection"}>
                      <Stepper
                        value={effectiveTarget}
                        onChange={(v) => {
                          setTargetTouched(true);
                          setTarget(v);
                        }}
                      />
                    </Field>
                    <Field label="Internal name">
                      <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} className="field" aria-label="Internal name" />
                    </Field>
                  </div>
                </div>
                <div className="on-dark grain relative flex flex-col justify-between overflow-hidden rounded-2xl bg-ink-900 p-6 text-white sm:p-8">
                  <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[radial-gradient(closest-side,rgba(227,18,43,0.25),transparent)]" />
                  <p className="relative text-[11px] font-medium uppercase tracking-eyebrow text-white/40">What agents will see</p>
                  <div className="relative mt-10">
                    <p className="text-white/60">{formatDateLong(date)}</p>
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.p key={duration} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.3, ease }} className="tnum mt-2 text-[5.5rem] font-semibold leading-none tracking-[-0.06em]">
                        +{duration}
                      </motion.p>
                    </AnimatePresence>
                    <p className="mt-2 text-xl text-white/70">
                      min · new logout <span className="tnum font-medium text-white">{endTime}</span>
                    </p>
                  </div>
                  <p className="relative mt-10 text-[13px] text-white/45">
                    <span className="tnum">{startTime} → {endTime}</span> · voluntary
                  </p>
                </div>
              </div>
            )}

            {step === 1 && (
              <RecipientSelector agents={directory.agents} lists={directory.lists} groups={groups} value={selection} onChange={setSelection} onSaveGroup={(ids) => setGroupModal(ids)} />
            )}

            {step === 2 && (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="surface space-y-6 p-6 sm:p-8">
                  <Field label="Start from a template">
                    <Select
                      label="Template"
                      value={templateId}
                      onChange={applyTemplate}
                      placeholder="Custom message"
                      options={requestTemplates.map((t) => ({ value: t.id, label: t.name, hint: t.language.toUpperCase() + (t.isDefault ? " · default" : "") }))}
                    />
                  </Field>
                  <Field label="Subject">
                    <input
                      value={subject}
                      onChange={(e) => {
                        setSubject(e.target.value);
                        setTemplateId("");
                      }}
                      className="field"
                      aria-label="Subject"
                    />
                  </Field>
                  <Field label="Message">
                    <textarea
                      ref={bodyRef}
                      value={body}
                      onChange={(e) => {
                        setBody(e.target.value);
                        setTemplateId("");
                      }}
                      rows={11}
                      className="field resize-y leading-relaxed"
                      aria-label="Message body"
                    />
                    <div className="mt-2.5 flex flex-wrap gap-1.5" aria-label="Insert variable">
                      {TEMPLATE_VARIABLES.filter((v) => v.key !== "agent_name" && v.key !== "team").map((v) => (
                        <button key={v.key} type="button" onClick={() => insertVariable(v.key)} className="rounded-md bg-ink-50 px-2 py-1 font-mono text-[11.5px] text-ink-600 ring-1 ring-inset ring-ink-900/[0.06] transition hover:bg-ink-100 hover:text-ink-900">
                          {`{{${v.key}}}`}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Agent confirmation email" hint="Prepared for each agent who says yes. Sent in their language when a translation exists.">
                    <Select label="Confirmation template" value={confTplId} onChange={setConfTplId} options={confirmationTemplates.map((t) => ({ value: t.id, label: t.name, hint: t.language.toUpperCase() }))} />
                  </Field>
                </div>
                <div className="lg:sticky lg:top-6 lg:self-start">
                  <p className="eyebrow mb-3">Preview</p>
                  <EmailPreview from={me.name} to={`${count} agents`} cc="Monitoring team" subject={renderTemplate(subject, vars)} body={renderTemplate(body, vars)} />
                  {confTpl && (
                    <details className="mt-4 rounded-2xl bg-white p-5 text-sm hairline">
                      <summary className="cursor-pointer font-medium text-ink-700">What a confirming agent sends back</summary>
                      <pre className="mt-3 whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-ink-600">
                        <b className="font-medium text-ink-900">{renderTemplate(confTpl.subject, { ...requestVars({ id: draft?.id || "OT-NEW", date, startTime, durationMin: duration }, me, { agent: { name: "Samy Abboute" }, team: { code: "RBC" } }) })}</b>
                        {"\n\n"}
                        {renderTemplate(confTpl.body, requestVars({ id: draft?.id || "OT-NEW", date, startTime, durationMin: duration }, me, { agent: { name: "Samy Abboute" }, team: { code: "RBC" } }))}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
                <div className="surface divide-y divide-ink-900/[0.06]">
                  <ReviewRow label="Request owner" onEdit={undefined}>
                    <span className="flex items-center gap-2.5">
                      <Avatar name={me.name} size={28} /> {me.name}
                    </span>
                  </ReviewRow>
                  <ReviewRow label="Time" onEdit={() => go(0)}>
                    <span className="tnum text-2xl font-semibold tracking-[-0.03em]">
                      {startTime} → {endTime}
                    </span>
                    <span className="mt-1 block text-[13px] text-ink-400">
                      {formatDateLong(date)} · +{duration} min{flexible ? " · agents may choose 15–60" : ""} · {effectiveTarget} needed
                    </span>
                  </ReviewRow>
                  <ReviewRow label="Recipients" onEdit={() => go(1)}>
                    <span className="flex items-center gap-3">
                      <span className="tnum text-2xl font-semibold tracking-[-0.03em]">{count} agents</span>
                      <AvatarStack names={Object.keys(selection).map((id) => directory.agents.find((a) => a.id === id)?.name || "")} max={5} size={26} />
                    </span>
                    <span className="mt-1.5 flex flex-wrap gap-1.5">
                      {sourceSummary.map(([label, n]) => (
                        <span key={label} className="rounded-md bg-ink-50 px-2 py-0.5 text-[12px] text-ink-600">
                          {label} <span className="tnum text-ink-400">· {n}</span>
                        </span>
                      ))}
                    </span>
                  </ReviewRow>
                  <ReviewRow label="CC on confirmations">
                    <span className="text-[15px]">Monitoring team</span>
                    <span className="mt-1 block text-[13px] text-ink-400">{cc.map((c) => c.name).join(", ")}</span>
                  </ReviewRow>
                </div>
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="eyebrow">Email preview</p>
                    <button type="button" onClick={() => go(2)} className="text-[13px] font-medium text-ink-500 hover:text-ink-900">
                      Edit
                    </button>
                  </div>
                  <EmailPreview from={me.name} to={`${count} agents`} cc="Monitoring team" subject={renderTemplate(subject, vars)} body={renderTemplate(body, vars)} />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-[60px] z-30 border-t border-ink-900/[0.06] bg-paper/90 backdrop-blur-xl lg:bottom-0 lg:left-[232px]">
        <div className="mx-auto flex max-w-[1240px] items-center gap-3 px-4 py-3 sm:px-8 lg:px-12">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => go(step - 1)} icon={<ArrowLeft size={16} />}>
              <span className="hidden sm:inline">Back</span>
            </Button>
          ) : (
            <Button variant="ghost" href="/monitoring">
              Cancel
            </Button>
          )}
          <div className="min-w-0 flex-1 text-[13px] text-ink-500" aria-live="polite">
            <AnimatePresence mode="wait">
              {error ? (
                <motion.p key="err" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="truncate font-medium text-signal-600" role="alert">
                  {error}
                </motion.p>
              ) : (
                <motion.p key="sum" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="truncate">
                  <span className="tnum font-medium text-ink-900">
                    {startTime} → {endTime}
                  </span>
                  <span className="hidden sm:inline">
                    {" "}
                    · {count} {count === 1 ? "agent" : "agents"} · {effectiveTarget} needed
                  </span>
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          {step === 3 && (
            <Button variant="secondary" loading={busy === "draft"} disabled={!!busy} onClick={() => submit(false)} className="hidden sm:inline-flex">
              Save draft
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={() => go(step + 1)} iconRight={<ArrowRight size={16} />}>
              Continue <span className="ml-1 hidden items-center gap-0.5 opacity-50 md:inline-flex"><Kbd>⌘</Kbd><Kbd>↵</Kbd></span>
            </Button>
          ) : (
            <Magnetic strength={0.12}>
              <Button variant="signal" size="lg" loading={busy === "send"} disabled={!!busy} onClick={() => submit(true)} icon={<Send size={16} />} className="font-semibold">
                Send overtime request
              </Button>
            </Magnetic>
          )}
        </div>
      </div>

      <GroupModal ids={groupModal} onClose={() => setGroupModal(null)} onSave={saveGroup} />
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2.5 text-[13px] font-medium text-ink-700">{label}</p>
      {children}
      {hint && <p className="mt-2 text-[12.5px] text-ink-400">{hint}</p>}
    </div>
  );
}

function ReviewRow({ label, children, onEdit }: { label: string; children: React.ReactNode; onEdit?: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
      <div className="min-w-0">
        <p className="eyebrow mb-2">{label}</p>
        <div className="text-[15px] text-ink-900">{children}</div>
      </div>
      {onEdit && (
        <button type="button" onClick={onEdit} className="shrink-0 text-[13px] font-medium text-ink-400 transition hover:text-ink-900">
          Edit
        </button>
      )}
    </div>
  );
}

export function EmailPreview({ from, to, cc, subject, body, cta = true }: { from: string; to: string; cc: string; subject: string; body: string; cta?: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-lift ring-1 ring-ink-900/[0.06]">
      <div className="flex items-center gap-1.5 border-b border-ink-900/[0.06] bg-ink-50/70 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
        <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
        <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
      </div>
      <dl className="space-y-1 border-b border-ink-900/[0.06] px-5 py-4 text-[13px]">
        {[
          ["From", from],
          ["To", to],
          ["Cc", cc],
        ].map(([k, v]) => (
          <div key={k} className="flex gap-3">
            <dt className="w-10 text-ink-400">{k}</dt>
            <dd className="text-ink-700">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="px-5 py-5">
        <p className="text-[17px] font-semibold tracking-[-0.015em]">{subject || <span className="text-ink-300">No subject</span>}</p>
        <p className="mt-4 whitespace-pre-wrap text-[14px] leading-relaxed text-ink-600">{body}</p>
        {cta && (
          <span className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-ink-900 px-4 text-[13px] font-medium text-white">
            Respond in Overtime <ArrowRight size={14} />
          </span>
        )}
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn("relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors duration-200", checked ? "bg-ink-900" : "bg-ink-900/15")}
    >
      <motion.span layout transition={{ duration: 0.2, ease }} className={cn("h-5 w-5 rounded-full bg-white shadow", checked ? "ml-[18px]" : "ml-0.5")} />
    </button>
  );
}

function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="inline-flex h-10 items-center rounded-xl bg-white shadow-card ring-1 ring-ink-900/10">
      <button type="button" aria-label="Fewer agents" onClick={() => onChange(Math.max(1, value - 1))} className="grid h-10 w-10 place-items-center text-ink-500 transition hover:text-ink-900">
        <Minus size={15} />
      </button>
      <input
        aria-label="Agents needed"
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value.replace(/\D/g, ""), 10);
          onChange(Number.isFinite(n) ? Math.min(500, Math.max(1, n)) : 1);
        }}
        className="tnum w-12 bg-transparent text-center text-[15px] font-medium outline-none"
      />
      <button type="button" aria-label="More agents" onClick={() => onChange(Math.min(500, value + 1))} className="grid h-10 w-10 place-items-center text-ink-500 transition hover:text-ink-900">
        <Plus size={15} />
      </button>
    </div>
  );
}

function GroupModal({ ids, onClose, onSave }: { ids: string[] | null; onClose: () => void; onSave: (name: string, ids: string[]) => Promise<void> }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Modal
      open={!!ids}
      onClose={onClose}
      size="sm"
      title="Save as group"
      description={ids ? `${ids.length} agents, ready to reuse with one click.` : undefined}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={busy}
            disabled={!name.trim()}
            onClick={async () => {
              setBusy(true);
              await onSave(name, ids || []);
              setBusy(false);
              setName("");
            }}
          >
            Save group
          </Button>
        </>
      }
    >
      <label className="block text-[13px] font-medium text-ink-700" htmlFor="grp-name">
        Group name
      </label>
      <input id="grp-name" data-autofocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Friday evening regulars" className="field mt-2" maxLength={60} />
    </Modal>
  );
}
