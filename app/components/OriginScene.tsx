"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import NoorPattern from "./NoorPattern";
import { NoorOasisArt } from "./BrandArt";
import { useStore } from "../lib/store";

/**
 * ACT II — Origin. The Ziban oasis at the edge of night, held with restraint:
 * a deep sky warming to a low ember horizon (no sun disc, no glow), the palm
 * grove drawn as an engraving on the horizon, and a single dominant line with
 * one accurate origin detail. Scroll drives a slow parallax. Depth comes from
 * layering and a vignette, never a decorative light.
 */
export default function OriginScene() {
  const { lang } = useStore();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const duneBack = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [40, -20]);
  const duneFront = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [70, -34]);
  const textY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [56, -56]);

  return (
    <section id="origin" ref={ref} className="relative h-[150vh] overflow-hidden bg-nuit">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* Sky — night warming to a restrained ember horizon, no sun disc */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, #05130e 0%, #0a1f18 46%, #0f2a20 72%, #21301b 90%, #33301d 100%)" }}
        />

        {/* Heritage arabesque, whispered from the margins */}
        <NoorPattern placement="edges" opacity={0.05} scale={128} color="#D8BE7E" className="!z-0" />

        {/* Dunes — back */}
        <motion.svg
          viewBox="0 0 1440 400" preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-[42%] w-full"
          style={{ y: duneBack }}
        >
          <path d="M0,220 C280,120 520,200 760,180 C1040,150 1220,240 1440,190 L1440,400 L0,400 Z" fill="#0c261d" opacity="0.85" />
        </motion.svg>

        {/* The Ziban grove — a hand-drawn engraving on the horizon */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center"
          style={{ y: duneFront }}
        >
          <NoorOasisArt className="block w-[min(116%,1320px)] max-w-none select-none opacity-[0.8]" />
        </motion.div>

        {/* Text — one dominant line, one accurate origin detail */}
        <motion.div className="relative z-10 px-6 text-center" style={{ y: textY }}>
          <motion.p
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
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
          <motion.p
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 1.1, delay: 0.25 }}
            className="mt-6 font-serif text-lg italic text-champagne md:text-xl"
          >
            {lang === "pl" ? "Z oaz Ziban w Algierii." : "From the Ziban oases of Algeria."}
          </motion.p>
        </motion.div>

        {/* Vignette — depth at the edges */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(125% 100% at 50% 32%, transparent 52%, rgba(0,0,0,0.34) 100%)" }}
        />
      </div>
    </section>
  );
}
