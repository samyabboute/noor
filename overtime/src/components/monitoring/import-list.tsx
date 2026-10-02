"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Upload } from "lucide-react";
import { parseDirectory } from "@/lib/directory-import";
import { readDocxText } from "@/lib/docx";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import { Modal } from "@/components/ui/overlay";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

/**
 * Bring an Exchange DL into Overtime: drop the .docx (or paste what Outlook
 * copies from the list's members). Parsed in the browser for an instant
 * preview; the server parses again before saving.
 */
export function ImportListModal({ open, onClose, list }: { open: boolean; onClose: () => void; list?: { id: string; name: string; address: string; count: number } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState(list?.name || "");
  const [address, setAddress] = useState(list?.address || "");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const parsed = useMemo(() => parseDirectory(text), [text]);
  const teams = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of parsed.people) m.set(p.teamCode || "—", (m.get(p.teamCode || "—") || 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [parsed]);

  async function readFile(f: File) {
    setError(null);
    try {
      const t = f.name.toLowerCase().endsWith(".docx") ? await readDocxText(f) : await f.text();
      setText(t);
      setFileName(f.name);
      if (!name) {
        const guess = f.name.replace(/\.(docx|txt|csv)$/i, "").replace(/[_]+/g, " ").trim();
        if (/^dl\s/i.test(guess)) setName(guess.toUpperCase());
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ total: number; created: number; added: number; removed: number; skipped: number }>("/api/lists", { method: "POST", json: { listId: list?.id, name, address, text } });
      toast({
        title: `${name} — ${r.total} agents`,
        description: list ? `${r.added} added, ${r.removed} removed.` : `${r.created} new ${r.created === 1 ? "person" : "people"} in the directory.${r.skipped ? ` ${r.skipped} nested group skipped.` : ""}`,
      });
      setText("");
      setFileName(null);
      onClose();
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={list ? `Update ${list.name}` : "Import a distribution list"}
      description="In Outlook, open the list’s members and copy them — or use the .docx you exported. The whole list is replaced by what you import."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={busy} disabled={!parsed.people.length || !name.trim()} onClick={submit} icon={<Upload size={15} />}>
            {parsed.people.length ? `Import ${parsed.people.length} agents` : "Import"}
          </Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-ink-700">List name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="DL RBC KRK" className="field" maxLength={60} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-ink-700">
            List address <span className="font-normal text-ink-400">(optional)</span>
          </span>
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="dl-rbc-krk@…" className="field" type="email" />
        </label>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files[0];
          if (f) readFile(f);
        }}
        className={cn("mt-4 rounded-2xl border border-dashed p-5 text-center transition", drag ? "border-ink-900 bg-ink-50" : "border-ink-900/15")}
      >
        <FileText size={22} className="mx-auto text-ink-300" />
        <p className="mt-2 text-sm text-ink-600">
          {fileName ? (
            <b className="font-medium text-ink-900">{fileName}</b>
          ) : (
            <>
              Drop the <b className="font-medium">.docx</b> here, or{" "}
              <button type="button" onClick={() => fileRef.current?.click()} className="font-medium text-ink-900 underline underline-offset-4">
                choose a file
              </button>
            </>
          )}
        </p>
        <input ref={fileRef} type="file" accept=".docx,.txt,.csv" className="hidden" onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0])} />
      </div>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-[13px] font-medium text-ink-700">…or paste the members</span>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setFileName(null);
          }}
          rows={5}
          placeholder={'"Lastname Firstname, SCS-B2C-…-KRA (EXT)" <firstname.lastname@…>; …'}
          className="field resize-y font-mono text-[12px]"
        />
      </label>

      {parsed.people.length > 0 && (
        <div className="mt-4 rounded-2xl bg-ink-50/70 p-4">
          <p className="text-sm">
            <b className="tnum text-xl font-semibold tracking-[-0.02em]">{parsed.people.length}</b> <span className="text-ink-500">agents found</span>
            {parsed.skipped.length > 0 && <span className="text-ink-400"> · {parsed.skipped.length} nested group skipped</span>}
            {list && <span className="text-ink-400"> · currently {list.count}</span>}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {teams.map(([t, n]) => (
              <span key={t} className="rounded-md bg-white px-2 py-0.5 text-[12px] text-ink-600 ring-1 ring-ink-900/[0.06]">
                {t} <span className="tnum text-ink-400">· {n}</span>
              </span>
            ))}
          </div>
          <p className="mt-3 truncate text-[12.5px] text-ink-400">
            {parsed.people
              .slice(0, 6)
              .map((p) => p.name)
              .join(", ")}
            {parsed.people.length > 6 ? "…" : ""}
          </p>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-3 text-[13px] font-medium text-signal-600">
          {error}
        </p>
      )}
      <p className="mt-4 text-[12px] leading-relaxed text-ink-400">Names and addresses are stored only in Overtime’s database — never in the source code. Agents who are no longer on any list can’t sign in.</p>
    </Modal>
  );
}
