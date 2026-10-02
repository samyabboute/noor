"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, KeyRound, Search, UserPlus } from "lucide-react";
import type { Role } from "@/lib/types";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Person {
  id: string;
  name: string;
  team: string;
  hasPin: boolean;
}

const ROLE_LABEL: Record<Role, string> = { agent: "Agent", monitoring: "Monitoring", management: "Management" };
const ease = [0.22, 1, 0.36, 1] as const;

/** Access code → your name → your PIN. No SSO, no passwords to remember beyond a short PIN. */
export function CodeSignIn() {
  const router = useRouter();
  const [step, setStep] = useState<"code" | "who" | "pin">("code");
  const [code, setCode] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [canRegister, setCanRegister] = useState(false);
  const [firstRun, setFirstRun] = useState(false);
  const [q, setQ] = useState("");
  const [person, setPerson] = useState<Person | null>(null);
  const [newPerson, setNewPerson] = useState<{ name: string; email: string } | null>(null);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pinRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    return (t ? people.filter((p) => fold(p.name).includes(fold(t))) : people).slice(0, t ? 8 : 6);
  }, [people, q]);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ role: Role; people: Person[]; canRegister: boolean; firstRun: boolean }>("/api/auth/code", { method: "POST", json: { step: "check", code } });
      setRole(r.role);
      setPeople(r.people);
      setCanRegister(r.canRegister);
      setFirstRun(r.firstRun);
      setNewPerson(r.canRegister && r.people.length === 0 ? { name: "", email: "" } : null);
      setStep("who");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function choose(p: Person | null) {
    setPerson(p);
    setPin("");
    setPinConfirm("");
    setError(null);
    setStep("pin");
    setTimeout(() => pinRef.current?.focus(), 50);
  }

  const settingPin = !person?.hasPin;

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ redirect: string }>("/api/auth/code", {
        method: "POST",
        json: { step: "login", code, userId: person?.id, newPerson: person ? undefined : newPerson, pin, pinConfirm: settingPin ? pinConfirm : undefined },
      });
      router.push(r.redirect);
      router.refresh();
    } catch (err) {
      setBusy(false);
      setError((err as Error).message);
      setPin("");
      pinRef.current?.focus();
    }
  }

  return (
    <div className="mt-8">
      <AnimatePresence mode="wait" initial={false}>
        {step === "code" && (
          <motion.form key="code" onSubmit={check} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25, ease }}>
            <label htmlFor="code" className="block text-[13px] font-medium text-ink-700">
              Team access code
            </label>
            <input id="code" autoFocus autoComplete="off" spellCheck={false} value={code} onChange={(e) => setCode(e.target.value)} className="field mt-2 h-12 text-base tracking-[0.06em]" placeholder="Shared by your Monitoring team" />
            <ErrorLine error={error} />
            <Button type="submit" size="lg" className="mt-5 w-full" loading={busy} disabled={code.trim().length < 4} iconRight={<ArrowRight size={17} />}>
              Continue
            </Button>
            <p className="mt-4 text-[12.5px] leading-relaxed text-ink-400">Agents, Monitoring and Management each have their own code. It decides what you can see.</p>
          </motion.form>
        )}

        {step === "who" && role && (
          <motion.div key="who" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25, ease }}>
            <BackRow onBack={() => setStep("code")} label={ROLE_LABEL[role]} />
            <h3 className="mt-5 text-lg font-semibold tracking-[-0.02em]">{newPerson ? "Add yourself" : "Who are you?"}</h3>
            {firstRun && <p className="mt-1.5 text-[13px] text-ink-500">You’re the first one here. Add yourself — next, you’ll import your distribution lists.</p>}
            {newPerson ? (
              <div className="mt-4 space-y-3">
                <input aria-label="Your full name" placeholder="Full name" autoFocus value={newPerson.name} onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })} className="field h-11" />
                <input aria-label="Your work email" placeholder="Work email" type="email" value={newPerson.email} onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })} className="field h-11" />
                <Button size="lg" className="w-full" disabled={newPerson.name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(newPerson.email)} onClick={() => choose(null)} iconRight={<ArrowRight size={17} />}>
                  Continue
                </Button>
                {people.length > 0 && (
                  <button onClick={() => setNewPerson(null)} className="w-full text-center text-[13px] font-medium text-ink-500 hover:text-ink-900">
                    I’m already on the list
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="relative mt-4">
                  <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input autoFocus aria-label="Search your name" placeholder="Type your name…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && results[0] && choose(results[0])} className="field h-11 pl-10" />
                </div>
                <ul className="mt-2 space-y-1" aria-label="People">
                  {results.map((p) => (
                    <li key={p.id}>
                      <button onClick={() => choose(p)} className="group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition hover:bg-white hover:shadow-card">
                        <Avatar name={p.name} size={32} />
                        <span className="min-w-0 flex-1 truncate text-[15px] font-medium">{p.name}</span>
                        {p.team && <span className="text-[12px] text-ink-400">{p.team}</span>}
                        <ArrowRight size={15} className="text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-ink-900" />
                      </button>
                    </li>
                  ))}
                  {results.length === 0 && (
                    <li className="px-2.5 py-4 text-[13px] text-ink-500">
                      {role === "agent" ? "Not on the list? Monitoring adds people when they update the distribution lists." : "No match."}
                    </li>
                  )}
                </ul>
                {canRegister && (
                  <button onClick={() => setNewPerson({ name: q, email: "" })} className="mt-3 inline-flex items-center gap-2 text-[13px] font-medium text-ink-500 hover:text-ink-900">
                    <UserPlus size={14} /> I’m not on the list
                  </button>
                )}
              </>
            )}
          </motion.div>
        )}

        {step === "pin" && (
          <motion.form key="pin" onSubmit={login} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25, ease }}>
            <BackRow onBack={() => setStep("who")} label={person?.name || newPerson?.name || ""} />
            <div className="mt-6 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink-900 text-white">
                <KeyRound size={18} />
              </span>
              <div>
                <h3 className="text-lg font-semibold tracking-[-0.02em]">{settingPin ? "Choose your PIN" : "Your PIN"}</h3>
                <p className="text-[13px] text-ink-500">{settingPin ? "4 to 8 digits. You’ll use it every time you sign in." : "The one you chose the first time."}</p>
              </div>
            </div>
            <input
              ref={pinRef}
              aria-label={settingPin ? "New PIN" : "PIN"}
              type="password"
              inputMode="numeric"
              autoComplete={settingPin ? "new-password" : "current-password"}
              maxLength={8}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className="field mt-5 h-12 text-center text-xl tracking-[0.5em]"
              placeholder="••••"
            />
            {settingPin && (
              <input
                aria-label="Repeat PIN"
                type="password"
                inputMode="numeric"
                autoComplete="new-password"
                maxLength={8}
                value={pinConfirm}
                onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ""))}
                className="field mt-2 h-12 text-center text-xl tracking-[0.5em]"
                placeholder="Repeat"
              />
            )}
            <ErrorLine error={error} />
            <Button type="submit" size="lg" className="mt-5 w-full" loading={busy} disabled={pin.length < 4 || (settingPin && pinConfirm.length < 4)} iconRight={<ArrowRight size={17} />}>
              Sign in
            </Button>
            {!settingPin && <p className="mt-4 text-center text-[12.5px] text-ink-400">Forgot it? Monitoring can reset your PIN in one click.</p>}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function BackRow({ onBack, label }: { onBack: () => void; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-400 transition hover:text-ink-900">
        <ArrowLeft size={14} /> Back
      </button>
      <span className="rounded-md bg-ink-50 px-2 py-0.5 text-[12px] font-medium text-ink-600">{label}</span>
    </div>
  );
}

function ErrorLine({ error }: { error: string | null }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.p role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className={cn("mt-3 text-[13px] font-medium text-signal-600")}>
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
