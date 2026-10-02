"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Check, Loader2, Lock } from "lucide-react";
import { signIn } from "next-auth/react";
import type { Role } from "@/lib/types";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/avatar";
import { Select } from "@/components/ui/select";
import { Logo } from "@/components/shell/logo";
import { useToast } from "@/components/ui/toast";

interface Persona {
  id: string;
  role: Role;
  name: string;
  detail: string;
  blurb: string;
}

const ROLE_TAG: Record<Role, string> = { agent: "Agent", monitoring: "Monitoring", management: "Management" };

export function LoginView({ mode, personas, agents }: { mode: "demo" | "entra"; personas: Persona[]; agents: { id: string; name: string; team: string }[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const [other, setOther] = useState("");

  async function enter(userId: string) {
    setBusy(userId);
    try {
      const { redirect } = await api<{ redirect: string }>("/api/auth/demo", { method: "POST", json: { userId } });
      const next = params.get("next");
      router.push(next && next.startsWith(redirect) ? next : redirect);
      router.refresh();
    } catch (e) {
      setBusy(null);
      toast({ tone: "error", title: "Couldn’t sign you in", description: (e as Error).message });
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      {/* Editorial side */}
      <section className="on-dark grain relative hidden overflow-hidden bg-ink-900 text-white lg:flex lg:flex-col lg:justify-between lg:p-14">
        <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[640px] w-[640px] rounded-full bg-[radial-gradient(closest-side,rgba(227,18,43,0.22),transparent)]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-56 -left-32 h-[560px] w-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.07),transparent)]" />
        <Logo inverse />
        <div className="relative">
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-display-xl font-semibold">
            Cover
            <br />
            the peak.
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }} className="mt-6 max-w-md text-lg leading-relaxed text-white/60">
            Voluntary overtime, without the email thread. Monitoring asks once. Agents answer in one click.
          </motion.p>
        </div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }} className="relative grid max-w-xl grid-cols-2 gap-4 text-sm">
          <div className="rounded-2xl border border-white/10 p-5">
            <p className="text-[11px] font-medium uppercase tracking-eyebrow text-white/40">Before</p>
            <ol className="mt-3 space-y-1.5 text-white/50">
              {["Read the email", "Reply all", "Type your logout time", "Find the right people", "Send"].map((s) => (
                <li key={s} className="line-through decoration-white/25">
                  {s}
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-2xl bg-white p-5 text-ink-900">
            <p className="text-[11px] font-medium uppercase tracking-eyebrow text-ink-400">Now</p>
            <p className="mt-3 text-2xl font-semibold tracking-[-0.03em]">I’m in.</p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-covered-600">
              <Check size={15} strokeWidth={3} /> Done in under 5 seconds
            </p>
          </div>
        </motion.div>
      </section>

      {/* Sign-in side */}
      <section className="flex flex-col px-5 py-8 sm:px-12 lg:justify-center lg:px-16">
        <div className="lg:hidden">
          <Logo />
          <h1 className="mt-14 text-display-lg font-semibold">Cover the peak.</h1>
          <p className="mt-4 text-[15px] text-ink-500">Voluntary overtime, without the email thread.</p>
        </div>

        <div className="mx-auto mt-12 w-full max-w-md lg:mt-0">
          <h2 className="text-2xl font-semibold tracking-[-0.03em]">Sign in</h2>
          <p className="mt-2 text-sm text-ink-500">Use your work account. Your role decides what you see.</p>

          <button
            type="button"
            onClick={() => mode === "entra" && signIn("azure-ad")}
            disabled={mode !== "entra"}
            className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-white text-[15px] font-medium hairline shadow-card transition hover:border-ink-900/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <MicrosoftMark />
            Sign in with Microsoft
          </button>
          {mode === "demo" && (
            <p className="mt-2.5 flex items-start gap-2 text-[12.5px] leading-snug text-ink-400">
              <Lock size={13} className="mt-0.5 shrink-0" />
              Microsoft Entra ID sign-in activates in production. No passwords are ever handled by Overtime.
            </p>
          )}

          {mode === "demo" && (
            <div className="mt-10">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-5 items-center rounded-md bg-waiting-50 px-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-waiting ring-1 ring-inset ring-waiting/20">Demo mode</span>
                <span className="h-px flex-1 bg-ink-900/[0.07]" />
              </div>
              <p className="mt-3 text-sm text-ink-500">Explore with sample data. Pick a persona:</p>
              <ul className="mt-4 space-y-2">
                {personas.map((p, i) => (
                  <motion.li key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                    <button
                      onClick={() => enter(p.id)}
                      disabled={!!busy}
                      className={cn(
                        "group flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left hairline shadow-card transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:border-ink-900/15 hover:shadow-lift disabled:opacity-60",
                        busy === p.id && "border-ink-900/30",
                      )}
                    >
                      <Avatar name={p.name} size={42} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-[15px] font-medium">{p.name}</span>
                          <span className="rounded-md bg-ink-50 px-1.5 py-0.5 text-[11px] font-medium text-ink-500">{ROLE_TAG[p.role]}</span>
                        </span>
                        <span className="mt-0.5 block truncate text-[13px] text-ink-400">{p.blurb}</span>
                      </span>
                      {busy === p.id ? <Loader2 size={18} className="animate-spin text-ink-400" /> : <ArrowRight size={18} className="text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-ink-900" />}
                    </button>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-6 flex items-center gap-2">
                <Select
                  value={other}
                  onChange={setOther}
                  label="Sign in as another agent"
                  placeholder="Or try as another agent…"
                  options={agents.map((a) => ({ value: a.id, label: a.name, hint: a.team }))}
                  className="flex-1"
                />
                <button
                  onClick={() => other && enter(other)}
                  disabled={!other || !!busy}
                  aria-label="Sign in as selected agent"
                  className="grid h-10 w-10 place-items-center rounded-xl bg-ink-900 text-white transition hover:bg-ink-800 disabled:opacity-30"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function MicrosoftMark() {
  return (
    <svg width="17" height="17" viewBox="0 0 21 21" aria-hidden>
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}
