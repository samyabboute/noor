"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import NoorPattern from "./NoorPattern";
import Reveal from "./Reveal";
import SectionIndex from "./SectionIndex";
import { NoorOasisArt } from "./BrandArt";
import { useStore } from "../lib/store";

/**
 * ACT II — Origin. The Ziban oasis at the edge of night, treated as an editorial
 * plate: the hand-drawn grove sits as a low horizon of palms and draws itself in
 * — left to right, an ink line finding the page — the first time the section is
 * reached. The typography lives in the clear sky above it, never over the
 * drawing. Depth comes from grain and a vignette, never a decorative light. One
 * dominant line, one accurate origin detail.
 */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function OriginScene() {
  const { lang } = useStore();
  const reduce = useReducedMotion();

  // The grove draws itself in — left to right — once, when the section arrives.
  const grove: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, clipPath: "inset(0% 100% 0% 0%)" },
    show: reduce
      ? { opacity: 0.82, transition: { duration: 0.6 } }
      : { opacity: 0.82, clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 1.8, ease: EASE } },
  };

  return (
    <section id="origin" className="relative flex h-screen min-h-[640px] items-center overflow-hidden bg-nuit">
      {/* Sky — night warming to a restrained ember horizon, no sun disc */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, #05130e 0%, #0a1f18 46%, #0f2a20 72%, #21301b 90%, #33301d 100%)" }}
      />

      {/* Heritage arabesque, whispered from the margins */}
      <NoorPattern placement="edges" opacity={0.045} scale={128} color="#D8BE7E" className="!z-0" />

      {/* The Ziban grove — a low horizon of palms that draws itself in; most of
          the engraving stays below the fold. */}
      <motion.div
        aria-hidden
        variants={grove}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-15% 0px -10% 0px" }}
        className="pointer-events-none absolute inset-x-0 top-[55%] flex justify-center select-none portrait:top-[63%]"
      >
        <NoorOasisArt className="block w-[min(126%,1460px)] max-w-none portrait:w-[220%]" />
      </motion.div>

      {/* Film grain — materiality, consistent with the opening */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-soft-light"
        style={{ backgroundImage: GRAIN, backgroundRepeat: "repeat" }}
      />

      {/* Vignette — depth at the edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(125% 105% at 50% 30%, transparent 50%, rgba(0,0,0,0.42) 100%)" }}
      />

      {/* Text — in the clear sky, biased above the horizon, never over the art */}
      <div className="relative z-10 w-full -translate-y-[15vh] px-6 text-center portrait:-translate-y-[20vh]">
        <Reveal>
          <SectionIndex className="justify-center text-orclair">
            {lang === "pl" ? "02 — Pochodzenie" : "02 — Origin"}
          </SectionIndex>
        </Reveal>
        <Reveal variant="mask" className="mt-5">
          <h2 className="display text-5xl text-ivoire md:text-7xl">
            {lang === "pl" ? "Zrodzony ze słońca." : "Born under the sun."}
          </h2>
        </Reveal>
        <Reveal delay={0.15} className="mt-6 font-serif text-lg italic text-champagne md:text-xl">
          {lang === "pl" ? "Z oaz Ziban w Algierii." : "From the Ziban oases of Algeria."}
        </Reveal>
      </div>
    </section>
  );
}
