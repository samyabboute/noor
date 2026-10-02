"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Copy, ExternalLink, Mail, RotateCcw, Undo2 } from "lucide-react";
import type { AgentOffer } from "@/server/views";
import { EmailPrepareError, EmailService } from "@/lib/email";
import { addMinutes, formatClock, formatDateLong, formatDuration } from "@/lib/time";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import { Button, Magnetic } from "@/components/ui/button";
import { LiveDot } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { Segmented } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

const ease = [0.22, 1, 0.36, 1] as const;

export function AgentHome({
  firstName,
  greeting,
  today,
  orgName,
  offers,
  stats,
}: {
  firstName: string;
  greeting: string;
  today: string;
  orgName: string;
  offers: AgentOffer[];
  stats: { asked: number; confirmed: number; minutes: number; minutes30: number };
}) {
  const router = useRouter();
  const opened = useRef(new Set<string>());

  // New requests appear on their own — no inbox to check.
  useEffect(() => {
    const t = setInterval(() => router.refresh(), offers.length ? 30000 : 12000);
    return () => clearInterval(t);
  }, [router, offers.length]);

  useEffect(() => {
    for (const o of offers) {
      if (o.status === "sent" && !opened.current.has(o.requestId)) {
        opened.current.add(o.requestId);
        fetch(`/api/requests/${o.requestId}/open`, { method: "POST" }).catch(() => {});
      }
    }
  }, [offers]);

  const pending = offers.some((o) => o.status === "sent" || o.status === "opened");

  return (
    <div className="mx-auto max-w-[1120px] px-4 pt-8 sm:px-8 sm:pt-14">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="eyebrow">
        {formatDateLong(today)}
      </motion.p>
      <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease }} className="mt-4 text-display-lg font-semibold">
        {greeting}, {firstName}.
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08, ease }} className="mt-4 text-lg text-ink-500 sm:text-xl">
        {offers.length === 0 ? "Nothing needed from you right now." : pending ? "We need a little extra coverage today." : "Thanks for answering — you’re all set."}
      </motion.p>

      <div className="mt-10 space-y-6 sm:mt-14">
        {offers.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.12, ease }} className="surface rounded-[28px]">
            <EmptyState
              art="calm"
              title="You’re all clear."
              description="No coverage request right now. The moment Monitoring needs a hand, it appears here — no inbox digging."
              action={
                stats.minutes30 > 0 ? (
                  <Link href="/agent/history" className="group inline-flex items-center gap-2 text-sm font-medium text-ink-700 hover:text-ink-900">
                    You added <span className="tnum font-semibold text-ink-900">{formatDuration(stats.minutes30)}</span> of coverage in the last 30 days
                    <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
                  </Link>
                ) : undefined
              }
            />
          </motion.div>
        ) : (
          offers.map((o, i) => <OfferCard key={o.requestId} offer={o} orgName={orgName} index={i} />)
        )}
      </div>

      {offers.length > 0 && (
        <motion.ol initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-8 grid gap-3 text-[13px] text-ink-400 sm:grid-cols-3" aria-label="How it works">
          {["Tap “I’m in”", "Overtime prepares your confirmation", "Press Send in Outlook — done"].map((s, i) => (
            <li key={s} className="flex items-center gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-ink-900/10 text-[11px] font-medium text-ink-500 tnum">{i + 1}</span>
              {s}
            </li>
          ))}
        </motion.ol>
      )}
    </div>
  );
}

function OfferCard({ offer: initial, orgName, index }: { offer: AgentOffer; orgName: string; index: number }) {
  const { toast } = useToast();
  const router = useRouter();
  const [offer, setOffer] = useState(initial);
  const [minutes, setMinutes] = useState(initial.minutes ?? initial.durationMin);
  const [showDurations, setShowDurations] = useState(false);
  const [busy, setBusy] = useState<null | "confirm" | "decline" | "withdraw">(null);
  const [celebrate, setCelebrate] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailOpened, setEmailOpened] = useState(initial.emailPrepared);

  // Background refreshes keep colleague counts fresh without clobbering an in-flight action.
  useEffect(() => {
    if (!busy) setOffer((o) => ({ ...initial, email: initial.email ?? o.email }));
  }, [initial, busy]);

  const answered = offer.status === "confirmed" || offer.status === "declined";
  const shownMinutes = offer.status === "confirmed" ? offer.minutes ?? minutes : minutes;
  const logout = addMinutes(offer.startTime, shownMinutes);
  const end = addMinutes(offer.startTime, offer.durationMin);
  const closes = formatClock(offer.closesAt);

  async function respond(decision: "confirm" | "decline" | "withdraw") {
    setBusy(decision);
    setEmailError(null);
    try {
      const res = await api<{ offer: AgentOffer }>(`/api/requests/${offer.requestId}/respond`, { method: "POST", json: { decision, minutes } });
      setOffer(res.offer);
      if (decision === "confirm") {
        setCelebrate(true);
        setEmailOpened(false);
      }
      if (decision === "withdraw") {
        setCelebrate(false);
        toast({ tone: "info", title: "Answer cleared", description: "Take your time — the request is still open." });
      }
      router.refresh();
    } catch (e) {
      toast({ tone: "error", title: "That didn’t go through", description: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  function openOutlook(target: "desktop" | "web") {
    if (!offer.email) return;
    try {
      EmailService.openOutlookCompose(offer.email, target);
      setEmailError(null);
      setEmailOpened(true);
      fetch(`/api/requests/${offer.requestId}/email`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "confirmation" }) }).catch(() => {});
    } catch (e) {
      setEmailError(e instanceof EmailPrepareError && e.reason === "too_long" ? "This message is too long for desktop Outlook." : e instanceof EmailPrepareError && e.reason === "blocked" ? "Your browser blocked the Outlook window." : "We couldn’t open your mail app.");
    }
  }

  async function copyMessage() {
    if (!offer.email) return;
    try {
      await navigator.clipboard.writeText(EmailService.asPlainText(offer.email));
      toast({ title: "Message copied", description: "Paste it into a new email in Outlook." });
    } catch {
      toast({ tone: "error", title: "Couldn’t copy", description: "Your browser blocked clipboard access." });
    }
  }

  const progress = offer.target ? Math.min(1, (offer.colleaguesIn + (offer.status === "confirmed" ? 1 : 0)) / offer.target) : 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.12 + index * 0.08, ease }}
      aria-labelledby={`offer-${offer.requestId}`}
      className="relative overflow-hidden rounded-[28px] bg-white shadow-lift ring-1 ring-ink-900/[0.06]"
    >
      <div className="grid lg:grid-cols-[1.2fr_1fr]">
        {/* Left — the ask */}
        <div className="relative p-7 sm:p-12">
          <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(227,18,43,0.07),transparent)]" />
          <div className="relative flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
            <span className="inline-flex items-center gap-2 font-medium text-ink-900">
              <LiveDot /> Overtime request
            </span>
            <span className="text-ink-300">·</span>
            <span className="text-ink-400">Respond before {closes}</span>
          </div>

          <h2 id={`offer-${offer.requestId}`} className="relative mt-6 text-display-sm font-semibold text-ink-900">
            Help us cover today’s peak.
          </h2>

          <div className="relative mt-8 flex items-end gap-4">
            <div className="relative overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={shownMinutes}
                  initial={{ y: "60%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-60%", opacity: 0 }}
                  transition={{ duration: 0.35, ease }}
                  className="tnum block text-[5.5rem] font-semibold leading-[0.85] tracking-[-0.06em] text-ink-900 sm:text-[7.5rem]"
                >
                  +{shownMinutes}
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="pb-2 sm:pb-3">
              <p className="text-xl font-medium tracking-[-0.02em] text-ink-900 sm:text-2xl">min</p>
              <p className="text-[15px] text-ink-400 sm:text-lg">
                until <span className="tnum font-medium text-ink-700">{logout}</span>
              </p>
            </div>
          </div>
          <p className="relative mt-5 text-[13px] font-medium text-ink-400">{orgName}</p>

          {/* The action */}
          <div className="relative mt-10 min-h-[132px]">
            <AnimatePresence mode="wait" initial={false}>
              {!answered ? (
                <motion.div key="ask" exit={{ opacity: 0, transition: { duration: 0.15 } }}>
                  <div className="flex flex-wrap items-center gap-3">
                    <Magnetic>
                      <motion.div layoutId={`cta-${offer.requestId}`} className="rounded-2xl" transition={{ duration: 0.45, ease }}>
                        <Button variant="signal" size="xl" loading={busy === "confirm"} onClick={() => respond("confirm")} iconRight={<ArrowRight size={20} />} className="min-w-[200px] font-semibold uppercase tracking-[0.02em]" aria-label={`I'm in: stay ${minutes} more minutes until ${logout}`}>
                          I’m in
                        </Button>
                      </motion.div>
                    </Magnetic>
                    <Button variant="ghost" size="lg" loading={busy === "decline"} onClick={() => respond("decline")} className="text-ink-500">
                      Maybe later
                    </Button>
                  </div>
                  <p className="mt-4 flex flex-wrap items-center gap-x-2 text-[13px] text-ink-400">
                    Voluntary overtime · {formatDuration(minutes)}
                    {offer.flexible && (
                      <>
                        <span className="text-ink-200">·</span>
                        <button onClick={() => setShowDurations((s) => !s)} aria-expanded={showDurations} className="font-medium text-ink-600 underline decoration-ink-200 underline-offset-4 hover:text-ink-900 hover:decoration-ink-500">
                          {showDurations ? "Done" : "Different duration?"}
                        </button>
                      </>
                    )}
                  </p>
                  <AnimatePresence initial={false}>
                    {showDurations && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25, ease }} className="overflow-hidden">
                        <Segmented
                          className="mt-4"
                          label="How long can you stay?"
                          value={minutes}
                          onChange={setMinutes}
                          options={[15, 30, 45, 60].map((m) => ({ value: m, label: `+${m}` }))}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : offer.status === "confirmed" ? (
                <motion.div key="in" initial={false}>
                  <motion.div
                    layoutId={`cta-${offer.requestId}`}
                    transition={{ duration: 0.45, ease }}
                    className="relative inline-flex h-16 items-center gap-3 overflow-hidden rounded-2xl bg-covered px-7 text-lg font-semibold uppercase tracking-[0.02em] text-white shadow-[0_10px_30px_-12px_rgba(14,138,95,0.7)]"
                    role="status"
                  >
                    {celebrate && <motion.span aria-hidden className="absolute inset-0 rounded-2xl bg-white" initial={{ opacity: 0.45 }} animate={{ opacity: 0 }} transition={{ duration: 0.7 }} />}
                    <DrawnCheck animate={celebrate} />
                    You’re in
                  </motion.div>
                  <motion.p initial={celebrate ? { opacity: 0, y: 6 } : false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4, ease }} className="mt-5 text-[17px] font-medium tracking-[-0.01em] text-ink-900">
                    You’re helping the team cover the peak.
                  </motion.p>
                  <motion.p initial={celebrate ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ delay: 0.55, duration: 0.4 }} className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[13px] text-ink-400">
                    <span>
                      New logout <span className="tnum font-medium text-ink-700">{offer.logout}</span> · +{offer.minutes} min
                    </span>
                    <span className="text-ink-200">·</span>
                    <button onClick={() => respond("withdraw")} disabled={!!busy} className="inline-flex items-center gap-1 font-medium text-ink-500 underline decoration-ink-200 underline-offset-4 hover:text-ink-900">
                      <Undo2 size={12} /> Change my answer
                    </button>
                  </motion.p>
                </motion.div>
              ) : (
                <motion.div key="out" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }}>
                  <p className="text-[17px] font-medium text-ink-900">No worries — thanks for letting us know.</p>
                  <p className="mt-1.5 text-sm text-ink-500">Saying no is fine. It helps Monitoring plan.</p>
                  <Button variant="secondary" size="md" className="mt-5" loading={busy === "withdraw"} onClick={() => respond("withdraw")} icon={<RotateCcw size={14} />}>
                    Actually, I can help
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right — context, then the prepared email */}
        <motion.div
          className={cn("relative border-t border-ink-900/[0.06] p-7 transition-colors duration-500 sm:p-12 lg:border-l lg:border-t-0", offer.status === "confirmed" ? "on-dark bg-ink-900 text-white" : "bg-ink-50/60")}
        >
          <AnimatePresence mode="wait" initial={false}>
            {offer.status === "confirmed" && offer.email ? (
              <motion.div key="email" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, delay: celebrate ? 0.75 : 0, ease }} className="flex h-full flex-col">
                <p className="text-[11px] font-medium uppercase tracking-eyebrow text-white/40">Step 2 of 2</p>
                <h3 className="mt-3 text-[1.75rem] font-semibold leading-tight tracking-[-0.03em]">Your confirmation is ready.</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">Already addressed and written. Open it, press Send — that’s it.</p>

                <div className="mt-6 rounded-2xl bg-white/[0.06] p-4 text-[13px] ring-1 ring-white/10">
                  <dl className="space-y-1.5">
                    <div className="flex gap-3">
                      <dt className="w-14 shrink-0 text-white/40">To</dt>
                      <dd className="min-w-0 truncate text-white/90">{offer.ownerName}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="w-14 shrink-0 text-white/40">Cc</dt>
                      <dd className="min-w-0 truncate text-white/90">Monitoring team · {offer.email.cc.length}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="w-14 shrink-0 text-white/40">Subject</dt>
                      <dd className="min-w-0 text-white/90">{offer.email.subject}</dd>
                    </div>
                  </dl>
                  <details className="group mt-3 border-t border-white/10 pt-3">
                    <summary className="cursor-pointer list-none text-white/50 transition hover:text-white/80 [&::-webkit-details-marker]:hidden">
                      <span className="group-open:hidden">Preview message</span>
                      <span className="hidden group-open:inline">Hide message</span>
                    </summary>
                    <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap font-sans text-[12.5px] leading-relaxed text-white/70">{offer.email.body}</pre>
                  </details>
                </div>

                <div className="mt-6 lg:mt-auto lg:pt-6">
                  {emailError ? (
                    <div role="alert" className="rounded-2xl bg-white p-4 text-ink-900">
                      <p className="text-sm font-medium">We couldn’t prepare the Outlook message.</p>
                      <p className="mt-1 text-[13px] text-ink-500">{emailError} Your confirmation is still saved.</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => openOutlook("desktop")} icon={<RotateCcw size={13} />}>
                          Try again
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => openOutlook("web")} icon={<ExternalLink size={13} />}>
                          Outlook on the web
                        </Button>
                        <Button size="sm" variant="secondary" onClick={copyMessage} icon={<Copy size={13} />}>
                          Copy
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Magnetic className="w-full">
                        <Button variant="inverse" size="xl" className="w-full font-semibold uppercase tracking-[0.02em]" onClick={() => openOutlook("desktop")} icon={<Mail size={19} />} iconRight={<ArrowRight size={19} />}>
                          Open Outlook
                        </Button>
                      </Magnetic>
                      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[13px] text-white/50">
                        <button onClick={() => openOutlook("web")} className="inline-flex items-center gap-1.5 transition hover:text-white">
                          <ExternalLink size={13} /> Outlook on the web
                        </button>
                        <button onClick={copyMessage} className="inline-flex items-center gap-1.5 transition hover:text-white">
                          <Copy size={13} /> Copy message
                        </button>
                      </div>
                      <AnimatePresence>
                        {emailOpened && (
                          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 flex items-center justify-center gap-2 text-center text-[13px] text-white/70">
                            <Check size={14} className="text-covered-100" /> Opened in Outlook — press Send and you’re done.
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div key="context" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="flex h-full flex-col">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-7 lg:grid-cols-1">
                  <Fact label="Today" value={formatDateLong(offer.date)} />
                  <Fact label="Request from" value={offer.ownerName} sub="Real-Time Monitoring" />
                  <Fact label="Coverage needed" value={<span className="tnum">{offer.startTime} → {end}</span>} sub={offer.flexible ? "Stay 15–60 min, your call" : undefined} />
                  <Fact label="Your team so far" value={<span className="tnum">{offer.colleaguesIn + (offer.status === "confirmed" ? 1 : 0)} of {offer.target} in</span>} />
                </dl>
                <ProgressBar className="mt-4" value={progress} tone="covered" label="Team coverage so far" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.article>
  );
}

function Fact({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-2 text-[17px] font-medium tracking-[-0.015em] text-ink-900">{value}</dd>
      {sub && <dd className="mt-0.5 text-[13px] text-ink-400">{sub}</dd>}
    </div>
  );
}

function DrawnCheck({ animate }: { animate: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden className="relative">
      <motion.circle cx="12" cy="12" r="10.5" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" initial={animate ? { pathLength: 0 } : false} animate={{ pathLength: 1 }} transition={{ duration: 0.45, ease }} />
      <motion.path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" initial={animate ? { pathLength: 0 } : false} animate={{ pathLength: 1 }} transition={{ duration: 0.35, delay: 0.25, ease }} />
    </svg>
  );
}
