"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Logo } from "./Logo";

/**
 * The entrance ritual — a signature, not a spinner.
 *
 * A single drop of amber nectar falls, meets the surface with real surface
 * tension (squash + a gold ripple + a settling pool), and from that pool the
 * NOOR wordmark is revealed — rising into focus like liquid finding a form.
 * Then the whole ritual expands away and the cream world opens beneath it, so
 * the last frame of the loader is very nearly the first frame of the homepage.
 *
 * Narrative: nectar → light → NOOR. Pure SVG + CSS transforms (no WebGL), light
 * on mobile. Shown once per session; skipped entirely under reduced-motion.
 */
const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];
const GRAVITY: [number, number, number, number] = [0.5, 0, 0.85, 0.35]; // accelerate into the surface

// Choreography (seconds).
const DROP_IN = 0.18;
const IMPACT = 0.92; // when the drop meets the surface
const REVEAL = 1.2; // when the wordmark begins to rise
const HOLD = 2.4; // total visible time before the world opens away
const DROP_DUR = IMPACT + 0.18;

export default function Loader() {
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    if (sessionStorage.getItem("noor.entered")) return;
    setShow(true);
    document.body.style.overflow = "hidden";
    const release = () => {
      if (!document.body.dataset.noorGate) document.body.style.overflow = "";
    };
    const t = setTimeout(
      () => {
        setShow(false);
        sessionStorage.setItem("noor.entered", "1");
        release();
      },
      (reduce ? 1.1 : HOLD) * 1000,
    );
    return () => {
      clearTimeout(t);
      release();
    };
  }, [reduce]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-paper"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: reduce ? 1 : 1.05, filter: reduce ? "none" : "blur(4px)" }}
          transition={{ duration: reduce ? 0.5 : 0.75, ease: EASE_OUT }}
        >
          {/* Reduced motion: the wordmark, a gentle fade, then the world opens. */}
          {reduce && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <Logo size="lg" className="text-ink" />
            </motion.div>
          )}

          {!reduce && (
            <>
          {/* A warm pool of light that swells as the wordmark is revealed */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: "radial-gradient(closest-side, rgba(194,162,90,0.16), transparent 70%)" }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0, 0, 0.9, 1], scale: [0.6, 0.6, 1, 1.06] }}
            transition={{ duration: HOLD, ease: EASE_OUT, times: [0, IMPACT / HOLD, REVEAL / HOLD, 1] }}
          />

          {/* The drop stage — surface at y=224 */}
          <svg viewBox="0 0 240 360" className="absolute h-[64vmin] max-h-[560px] w-auto" aria-hidden>
            <defs>
              <radialGradient id="noor-honey" cx="38%" cy="30%" r="75%">
                <stop offset="0%" stopColor="#F6DFA6" />
                <stop offset="42%" stopColor="#D6A85B" />
                <stop offset="100%" stopColor="#8A5A22" />
              </radialGradient>
              <linearGradient id="noor-pool" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E7C173" />
                <stop offset="100%" stopColor="#A9762F" />
              </linearGradient>
            </defs>

            {/* the settling pool */}
            <motion.ellipse
              cx="120"
              cy="224"
              fill="url(#noor-pool)"
              initial={{ rx: 0, ry: 0, opacity: 0 }}
              animate={{ rx: [0, 30, 26], ry: [0, 7, 6], opacity: [0, 1, 1] }}
              transition={{ duration: 0.5, delay: IMPACT, ease: EASE_OUT }}
            />

            {/* the drop — falls under gravity, then squashes into the pool and merges away */}
            <motion.g
              initial={{ x: 120, y: 60, opacity: 0 }}
              animate={{
                x: 120,
                y: [60, 60, 209, 209, 209],
                opacity: [0, 1, 1, 1, 0],
                scaleX: [1, 1, 1, 1.42, 1.1],
                scaleY: [1, 1, 1, 0.5, 0.9],
              }}
              transition={{
                duration: DROP_DUR,
                times: [0, DROP_IN / DROP_DUR, (IMPACT - 0.02) / DROP_DUR, IMPACT / DROP_DUR, 1],
                ease: [EASE_OUT, GRAVITY, EASE_OUT, EASE_OUT],
              }}
              style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
            >
              {/* teardrop in local coords: tail up, round bottom (contact at y≈15) */}
              <path
                d="M0,-40 C9,-22 15,-12 15,-2 A15,15 0 1 1 -15,-2 C-15,-12 -9,-22 0,-40 Z"
                fill="url(#noor-honey)"
              />
              <ellipse cx="-5" cy="-6" rx="3.2" ry="6.5" fill="#FFF6DD" opacity="0.7" />
            </motion.g>

            {/* impact ripples */}
            {[0, 1].map((i) => (
              <motion.circle
                key={i}
                cx="120"
                cy="224"
                fill="none"
                stroke="#C2A25A"
                strokeWidth="1.1"
                initial={{ r: 4, opacity: 0 }}
                animate={{ r: [4, 46 + i * 24], opacity: [0.5, 0] }}
                transition={{ duration: 1, delay: IMPACT + i * 0.14, ease: EASE_OUT }}
              />
            ))}

            {/* the surface — a thin gold line drawn across at impact */}
            <motion.line
              x1="30"
              y1="224"
              x2="210"
              y2="224"
              stroke="#C2A25A"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 0.55, 0.32] }}
              transition={{ duration: 0.8, delay: IMPACT, ease: EASE_OUT }}
            />
          </svg>

          {/* The revelation — the wordmark rises out of the pool, blur → sharp */}
          <motion.div
            className="relative -mt-[6vmin] will-change-transform"
            initial={{ clipPath: "inset(100% 0% 0% 0%)", filter: "blur(9px)", opacity: 0, y: 14 }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)", filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: REVEAL, ease: EASE_OUT }}
          >
            <Logo size="lg" className="text-ink" />
          </motion.div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
