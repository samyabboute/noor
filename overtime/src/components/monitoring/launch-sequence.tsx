"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Mail } from "lucide-react";
import type { ActivityItem, RequestCard } from "@/server/views";
import { CountUp } from "@/components/ui/count-up";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/shell/logo";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * The launch moment. A request doesn't get "submitted" — it goes live:
 * every agent reached lights up around the ring, then confirmations fill it.
 */
export function LaunchSequence({ initial, onClose, onAnnounce }: { initial: RequestCard; onClose: () => void; onAnnounce: () => void }) {
  const reduce = useReducedMotion();
  const [card, setCard] = useState(initial);
  const [feed, setFeed] = useState<ActivityItem[]>([]);
  const [phase, setPhase] = useState<"reach" | "live">(reduce ? "live" : "reach");

  const n = card.stats.recipients;
  const confirmedPct = card.target ? Math.min(1, card.stats.confirmed / card.target) : 0;

  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setPhase("live"), Math.min(2400, 900 + n * 45));
    return () => clearTimeout(t);
  }, [n, reduce]);

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const res = await fetch(`/api/requests/${initial.id}/live`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { card: RequestCard; feed: ActivityItem[] };
        if (alive) {
          setCard(data.card);
          setFeed(data.feed);
        }
      } catch {
        /* the next tick will catch up */
      }
    };
    const t = setInterval(poll, 2500);
    poll();
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [initial.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const size = 340;
  const R = size / 2 - 10;
  const ringR = size / 2 - 38;
  const C = 2 * Math.PI * ringR;
  const dots = Array.from({ length: n }, (_, i) => {
    const a = (i / Math.max(1, n)) * Math.PI * 2 - Math.PI / 2;
    return { x: Math.round((size / 2 + R * Math.cos(a)) * 100) / 100, y: Math.round((size / 2 + R * Math.sin(a)) * 100) / 100 };
  });

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Coverage request is live"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
      className="on-dark grain fixed inset-0 z-[95] flex flex-col overflow-y-auto bg-ink-900 text-white"
    >
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(227,18,43,0.14),transparent)]" />
      <div className="relative flex items-center justify-between px-6 py-5 sm:px-10">
        <span className="inline-flex items-center gap-2 text-[13px] font-medium text-white/70">
          <LogoMark inverse size={20} /> {card.id}
        </span>
        <button onClick={onClose} className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-white/50 transition hover:bg-white/10 hover:text-white">
          Close <span className="ml-1 text-white/30">esc</span>
        </button>
      </div>

      <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-10 px-6 pb-12 lg:flex-row lg:gap-20">
        {/* The ring */}
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} aria-hidden className="absolute inset-0">
            {dots.map((d, i) => (
              <motion.circle
                key={i}
                cx={d.x}
                cy={d.y}
                r={4}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1, fill: phase === "live" ? (i < card.stats.confirmed ? "#3FBF8C" : "rgba(255,255,255,0.4)") : "#FFFFFF" }}
                transition={{ delay: reduce ? 0 : 0.35 + i * 0.04, duration: 0.3, ease }}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              />
            ))}
            <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
              <circle cx={size / 2} cy={size / 2} r={ringR} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={14} />
              <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={ringR}
                fill="none"
                stroke="#0E8A5F"
                strokeWidth={14}
                strokeLinecap="round"
                strokeDasharray={C}
                initial={{ strokeDashoffset: C }}
                animate={{ strokeDashoffset: phase === "live" ? C * (1 - confirmedPct) : C }}
                transition={{ duration: 1.1, ease }}
              />
            </g>
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <AnimatePresence mode="wait">
              {phase === "reach" ? (
                <motion.div key="reach" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.25 } }}>
                  <CountUp value={n} duration={Math.min(1.8, 0.6 + n * 0.04)} className="tnum block text-[5.5rem] font-semibold leading-none tracking-[-0.06em]" />
                  <p className="mt-3 text-[11px] font-medium uppercase tracking-eyebrow text-white/50">Agents reached</p>
                </motion.div>
              ) : (
                <motion.div key="live" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease }}>
                  <p className="tnum text-[5.5rem] font-semibold leading-none tracking-[-0.06em]">
                    <CountUp value={Math.round(confirmedPct * 100)} />
                    <span className="text-[2.5rem] text-white/50">%</span>
                  </p>
                  <p className="mt-3 text-[11px] font-medium uppercase tracking-eyebrow text-white/50">Confirmed</p>
                  <p className="tnum mt-1 text-sm text-white/60">
                    {card.stats.confirmed} of {card.target} needed
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* The story */}
        <div className="w-full max-w-md text-center lg:text-left">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.12em]">
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inset-0 animate-pulse-dot rounded-full bg-signal" />
              <span className="relative h-2 w-2 rounded-full bg-signal" />
            </span>
            Request live
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6, ease }} className="mt-6 text-display-md font-semibold">
            Coverage request is live.
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-4 text-white/60">
            <span className="tnum">{card.startTime} → {card.endTime}</span> · {n} agents can answer in one click. Responses close at <span className="tnum">{card.startTime}</span>.
          </motion.p>

          <div className="mt-8 min-h-[148px]" aria-live="polite">
            <AnimatePresence initial={false}>
              {phase === "live" &&
                feed.slice(0, 3).map((f) => (
                  <motion.div key={f.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease }} className="mb-2 flex items-center gap-3 rounded-xl bg-white/[0.06] px-4 py-2.5 text-left text-sm ring-1 ring-white/10">
                    <span className={f.action === "AGENT_CONFIRMED" ? "grid h-5 w-5 place-items-center rounded-full bg-covered" : "grid h-5 w-5 place-items-center rounded-full bg-white/15"}>
                      {f.action === "AGENT_CONFIRMED" ? <Check size={11} strokeWidth={3} /> : <span className="h-1 w-2 rounded bg-white/60" />}
                    </span>
                    <span className="flex-1 truncate">
                      {f.actorName} {f.action === "AGENT_CONFIRMED" ? "is in" : "can’t this time"}
                    </span>
                    {f.minutes && <span className="tnum text-white/50">+{f.minutes} min</span>}
                  </motion.div>
                ))}
              {phase === "live" && feed.length === 0 && (
                <motion.p key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-white/40">
                  Waiting for the first answer…
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center lg:justify-start">
            <Button variant="inverse" size="lg" onClick={onClose} iconRight={<ArrowRight size={16} />}>
              Watch responses
            </Button>
            <Button variant="ghost" size="lg" onClick={onAnnounce} icon={<Mail size={16} />} className="text-white/70 hover:bg-white/10 hover:text-white">
              Announce in Outlook
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
