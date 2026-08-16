"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useStore } from "../lib/store";

/**
 * ACT II — Origin. A cinematic, art-directed desert at golden hour, built
 * entirely from CSS gradients + generated SVG (no heavy assets, no WebGL).
 * Scroll drives a subtle parallax: the sun rises, dunes drift, the light warms.
 * A minimal gold arc suggests "from the oasis to the world" — never a map widget.
 */
export default function OriginScene() {
  const { lang } = useStore();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const sunY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [80, -60]);
  const sunGlow = useTransform(scrollYProgress, [0.1, 0.6], [0.35, 0.9]);
  const duneBack = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [40, -20]);
  const duneFront = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [80, -40]);
  const textY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [60, -60]);
  const arcDraw = useTransform(scrollYProgress, [0.3, 0.7], [0, 1]);

  return (
    <section id="origin" ref={ref} className="relative h-[150vh] overflow-hidden bg-nuit">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* Sky — emerald night warming to a golden horizon */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, #05130e 0%, #0a1f18 42%, #123227 66%, #3a3a1e 88%, #6b5324 100%)" }}
        />

        {/* Sun */}
        <motion.div
          className="absolute left-1/2 h-[46vmin] w-[46vmin] -translate-x-1/2 rounded-full"
          style={{
            bottom: "26%",
            y: sunY,
            opacity: sunGlow,
            background: "radial-gradient(circle, #f4e3ad 0%, #e0b968 34%, rgba(194,162,90,0.35) 55%, transparent 72%)",
            filter: "blur(2px)",
          }}
        />

        {/* Dunes — back */}
        <motion.svg
          viewBox="0 0 1440 400" preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-[42%] w-full"
          style={{ y: duneBack }}
        >
          <path d="M0,220 C280,120 520,200 760,180 C1040,150 1220,240 1440,190 L1440,400 L0,400 Z" fill="#0c261d" opacity="0.85" />
        </motion.svg>

        {/* Palms silhouette on the horizon */}
        <motion.div className="absolute inset-x-0 bottom-[30%] flex justify-center gap-16 opacity-80" style={{ y: duneBack }}>
          {[0, 1, 2].map((i) => (
            <svg key={i} viewBox="0 0 60 90" className={`h-[14vmin] w-auto ${i === 1 ? "translate-y-3 scale-110" : "opacity-70"}`}>
              <path d="M30 90 L30 40" stroke="#081a13" strokeWidth="2.5" fill="none" />
              {[-60, -30, 0, 30, 60, 100, 140].map((a, k) => (
                <path
                  key={k}
                  d={`M30 40 Q ${30 + Math.cos((a * Math.PI) / 180) * 20} ${40 - 14 - Math.abs(Math.sin((a * Math.PI) / 180)) * 6} ${30 + Math.cos((a * Math.PI) / 180) * 34} ${40 - Math.sin((a * Math.PI) / 180) * 20}`}
                  stroke="#081a13" strokeWidth="2" fill="none" strokeLinecap="round"
                />
              ))}
            </svg>
          ))}
        </motion.div>

        {/* Dunes — front */}
        <motion.svg
          viewBox="0 0 1440 300" preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-[30%] w-full"
          style={{ y: duneFront }}
        >
          <path d="M0,180 C320,80 560,160 820,140 C1080,120 1260,200 1440,150 L1440,300 L0,300 Z" fill="#050f0b" />
        </motion.svg>

        {/* Text */}
        <motion.div className="relative z-10 px-6 text-center" style={{ y: textY }}>
          <motion.p
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 1 }}
            className="eyebrow text-orclair"
          >
            {lang === "pl" ? "02 — Pochodzenie" : "02 — Origin"}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 1.1, delay: 0.1 }}
            className="display mt-4 text-5xl text-ivoire md:text-8xl"
          >
            {lang === "pl" ? "Zrodzony ze słońca." : "Born under the sun."}
          </motion.h2>

          {/* Minimal oasis → world arc */}
          <div className="mx-auto mt-12 max-w-md">
            <svg viewBox="0 0 320 70" className="w-full">
              <motion.path
                d="M40 52 Q160 -6 280 40" fill="none" stroke="#C2A25A" strokeWidth="1.2"
                strokeDasharray="3 5" style={{ pathLength: reduce ? 1 : arcDraw }}
              />
              <circle cx="40" cy="52" r="3.5" fill="#D8BE7E" />
              <circle cx="280" cy="40" r="3.5" fill="#F4EEE0" />
              <text x="40" y="68" textAnchor="middle" className="fill-ivoire/60" style={{ font: "600 8px sans-serif", letterSpacing: "2px" }}>TOZEUR</text>
              <text x="280" y="60" textAnchor="middle" className="fill-ivoire/60" style={{ font: "600 8px sans-serif", letterSpacing: "2px" }}>{lang === "pl" ? "ŚWIAT" : "THE WORLD"}</text>
            </svg>
            <p className="mt-4 font-serif text-lg italic text-champagne">
              {lang === "pl" ? "Z oazy — na Twój stół." : "From the oasis — to your table."}
            </p>
          </div>
        </motion.div>

        {/* grain-lite warmth */}
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(80% 50% at 50% 78%, rgba(216,190,126,0.14), transparent 60%)" }} />
      </div>
    </section>
  );
}
