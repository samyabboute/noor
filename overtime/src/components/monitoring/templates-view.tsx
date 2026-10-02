"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Star } from "lucide-react";
import type { EmailTemplate, Language, TemplateKind } from "@/lib/types";
import { TEMPLATE_VARIABLES, renderTemplate, requestVars } from "@/lib/template";
import { api } from "@/lib/api";
import { relativeTime, todayISO } from "@/lib/time";
import { cn } from "@/lib/cn";
import { SectionTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Segmented, Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { EmailPreview } from "./create-flow";

type T = EmailTemplate & { updatedByName: string };

const LANGS: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "it", label: "Italiano" },
  { value: "pl", label: "Polski" },
];

export function TemplatesView({ templates, me }: { templates: T[]; me: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [kind, setKind] = useState<TemplateKind>("request");
  const list = templates.filter((t) => t.kind === kind);
  const [selected, setSelected] = useState<string | "new">(list[0]?.id || "new");
  const current = templates.find((t) => t.id === selected);
  const [form, setForm] = useState({ name: "", subject: "", body: "", language: "en" as Language, isDefault: false });
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (current) setForm({ name: current.name, subject: current.subject, body: current.body, language: current.language, isDefault: current.isDefault });
    else setForm({ name: "", subject: "", body: "", language: "en", isDefault: false });
  }, [current]);

  useEffect(() => {
    const first = templates.find((t) => t.kind === kind);
    setSelected(first?.id || "new");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  const dirty = current ? form.name !== current.name || form.subject !== current.subject || form.body !== current.body || form.isDefault !== current.isDefault : Boolean(form.name || form.subject || form.body);

  const vars = useMemo(
    () => requestVars({ id: "OT-1042", date: todayISO(), startTime: "18:00", durationMin: 30 }, { name: me }, { agent: { name: "Samy Abboute" }, team: { code: "RBC" } }),
    [me],
  );

  async function save() {
    setBusy(true);
    try {
      const { template } = await api<{ template: EmailTemplate }>("/api/templates", { method: "POST", json: { id: current?.id, kind, ...form } });
      toast({ title: "Template saved", description: "New requests use it right away." });
      setSelected(template.id);
      router.refresh();
    } catch (e) {
      toast({ tone: "error", title: "Couldn’t save the template", description: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  function insert(key: string) {
    const el = bodyRef.current;
    const token = `{{${key}}}`;
    if (!el) return;
    const s = el.selectionStart;
    const next = form.body.slice(0, s) + token + form.body.slice(el.selectionEnd);
    setForm((f) => ({ ...f, body: next }));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + token.length, s + token.length);
    });
  }

  return (
    <div>
      <SectionTitle
        eyebrow="Templates"
        title="Words that work."
        description="The request agents read, and the confirmation they send back. Variables fill themselves in."
        action={
          <Button variant="secondary" icon={<Plus size={16} />} onClick={() => setSelected("new")}>
            New template
          </Button>
        }
      />
      <div className="mt-10">
        <Segmented
          label="Template type"
          value={kind}
          onChange={setKind}
          options={[
            { value: "request", label: "Request to agents" },
            { value: "confirmation", label: "Agent confirmation" },
          ]}
        />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[260px_1fr_1fr]">
        <nav aria-label="Templates" className="surface h-fit p-2">
          {list.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              aria-current={selected === t.id ? "true" : undefined}
              className={cn("flex w-full items-start justify-between gap-2 rounded-xl px-3 py-2.5 text-left transition", selected === t.id ? "bg-ink-900 text-white" : "hover:bg-ink-50")}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{t.name}</span>
                <span className={cn("block text-[12px]", selected === t.id ? "text-white/50" : "text-ink-400")} suppressHydrationWarning>
                  {t.language.toUpperCase()} · {relativeTime(t.updatedAt)}
                </span>
              </span>
              {t.isDefault && <Star size={13} className={cn("mt-1 shrink-0", selected === t.id ? "fill-white text-white" : "fill-ink-900 text-ink-900")} aria-label="Default" />}
            </button>
          ))}
          <button onClick={() => setSelected("new")} className={cn("mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition", selected === "new" ? "bg-ink-900 text-white" : "text-ink-500 hover:bg-ink-50")}>
            <Plus size={14} /> New template
          </button>
        </nav>

        <div className="surface space-y-5 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-[1fr_150px]">
            <label className="block">
              <span className="mb-2 block text-[13px] font-medium text-ink-700">Name</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field" maxLength={60} />
            </label>
            <div>
              <span className="mb-2 block text-[13px] font-medium text-ink-700">Language</span>
              {current ? (
                <p className="flex h-[42px] items-center text-sm text-ink-600">{LANGS.find((l) => l.value === form.language)?.label}</p>
              ) : (
                <Select label="Language" value={form.language} onChange={(v) => setForm({ ...form, language: v as Language })} options={LANGS} />
              )}
            </div>
          </div>
          <label className="block">
            <span className="mb-2 block text-[13px] font-medium text-ink-700">Subject</span>
            <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="field" />
          </label>
          <label className="block">
            <span className="mb-2 block text-[13px] font-medium text-ink-700">Body</span>
            <textarea ref={bodyRef} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={13} className="field resize-y font-[inherit] leading-relaxed" />
          </label>
          <div>
            <p className="mb-2 text-[12px] text-ink-400">Insert a variable</p>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATE_VARIABLES.map((v) => (
                <button key={v.key} type="button" onClick={() => insert(v.key)} title={v.label} className="rounded-md bg-ink-50 px-2 py-1 font-mono text-[11.5px] text-ink-600 ring-1 ring-inset ring-ink-900/[0.06] transition hover:bg-ink-100 hover:text-ink-900">
                  {`{{${v.key}}}`}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-900/[0.06] pt-5">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-600">
              <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="h-4 w-4 accent-ink-900" />
              Default for {LANGS.find((l) => l.value === form.language)?.label}
            </label>
            <div className="flex items-center gap-3">
              {current && <span className="text-[12px] text-ink-400" suppressHydrationWarning>Edited by {current.updatedByName}</span>}
              <Button loading={busy} disabled={!dirty} onClick={save}>
                {current ? "Save changes" : "Create template"}
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="mb-3 flex items-center justify-between">
            <p className="eyebrow">Live preview</p>
            {form.isDefault && <Badge tone="ink">Default</Badge>}
          </div>
          <EmailPreview
            from={kind === "request" ? me : "Samy Abboute"}
            to={kind === "request" ? "Selected agents" : me}
            cc="Monitoring team"
            subject={renderTemplate(form.subject, vars)}
            body={renderTemplate(form.body, vars)}
            cta={kind === "request"}
          />
          <p className="mt-3 text-[12.5px] text-ink-400">Preview uses sample values. Unknown variables stay visible so typos are easy to spot.</p>
        </div>
      </div>
    </div>
  );
}
