"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useStore } from "../lib/store";

/**
 * A minimal, cinematic "selection" scene. The figure is narrative, not a
 * commercial statistic — it dramatises the house's real rule (already stated
 * elsewhere on the site): only one date in ten is kept.
 */
export default function DecisionsCounter() {
  const { lang } = useStore();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const count = useTransform(scrollYProgress, [0.12, 0.62], [1, 9], { clamp: true });
  const rounded = useTransform(count, (v) => String(Math.round(v)).padStart(2, "0"));
  const line = useTransform(scrollYProgress, [0.15, 0.45], ["8%", "100%"]);

  const wordOpacity = useTransform(scrollYProgress, [0.55, 0.68, 0.9, 1], [0, 1, 1, 0.85]);
  const headOpacity = useTransform(scrollYProgress, [0.02, 0.12], [0, 1]);

  return (
    <section ref={ref} className="relative bg-paper" style={{ height: reduce ? "auto" : "230vh" }}>
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
        <motion.p style={{ opacity: reduce ? 1 : headOpacity }} className="eyebrow">
          {lang === "pl" ? "Selekcja" : "Selection"}
        </motion.p>

        {/* the counter */}
        <div className="mt-8 flex items-end justify-center gap-2 font-serif leading-none text-ink">
          <motion.span className="text-[26vw] font-light md:text-[16rem]">
            {reduce ? "09" : rounded}
          </motion.span>
          <span className="mb-[3vw] text-[10vw] text-or md:mb-6 md:text-[5rem]">/10</span>
        </div>

        {/* measuring line */}
        <div className="mt-4 h-px w-[min(80vw,520px)] bg-ink/12">
          <motion.div className="h-full bg-or" style={{ width: reduce ? "100%" : line }} />
        </div>

        {/* the reveal word + statement */}
        <motion.div style={{ opacity: reduce ? 1 : wordOpacity }} className="mt-10">
          <p className="font-sans text-[11px] uppercase tracking-luxe text-or">
            {lang === "pl" ? "Wybrane · sztuka po sztuce" : "Selected · one by one"}
          </p>
          <h2 className="display mt-4 text-3xl italic md:text-5xl">
            {lang === "pl" ? "Dziewięć na dziesięć nigdy nie zostanie Noor." : "Nine in ten never become Noor."}
          </h2>
        </motion.div>
      </div>
    </section>
  );
}
