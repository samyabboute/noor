"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import ProductVisual from "./ProductVisual";
import { useStore } from "../lib/store";

export default function Hero() {
  const { t } = useStore();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // Cinematic scroll: the scene sinks and dims as you leave — the light "closes".
  const boxY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 160]);
  const boxScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.08]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -80]);
  const veil = useTransform(scrollYProgress, [0, 1], [0, 0.7]);

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-nuit text-ivoire">
      {/* Base: deep warm dark with a single pool of light */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 22%, #3a2c1e 0%, #211812 35%, #16110C 70%, #0d0906 100%)",
        }}
      />

      {/* The ray of light crossing the scene */}
      {!reduce && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-10%] top-[-30%] h-[160%] w-[38%] rotate-[14deg] bg-gradient-to-b from-orclair/25 via-orclair/5 to-transparent blur-2xl animate-light-sweep" />
        </div>
      )}

      {/* The centerpiece: a case emerging from the dark, held in the upper field */}
      <motion.div
        className="absolute inset-x-0 top-0 flex h-[52%] items-center justify-center md:h-[58%]"
        style={{ y: boxY, scale: boxScale }}
      >
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.86, filter: "brightness(0.3)" }}
          animate={{ opacity: 1, scale: 1, filter: "brightness(1)" }}
          transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative aspect-square w-[min(58vw,400px)]"
          style={{
            WebkitMaskImage: "radial-gradient(circle at 50% 45%, #000 52%, transparent 74%)",
            maskImage: "radial-gradient(circle at 50% 45%, #000 52%, transparent 74%)",
          }}
        >
          <ProductVisual slug="collection-noor" className="relative h-full w-full" />
        </motion.div>
      </motion.div>

      {/* Scrim so the type reads cleanly over the scene */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-nuit via-nuit/80 to-transparent" />

      {/* Text layer */}
      <motion.div
        className="relative z-10 flex h-full flex-col items-center justify-end pb-[11vh] text-center px-6"
        style={{ y: textY }}
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="eyebrow mb-6 text-orclair"
        >
          {t("hero.eyebrow")}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="display text-[15vw] leading-[0.9] md:text-[8.5rem]"
        >
          <span className="block italic font-light text-orclair/90">{t("hero.title.a")}</span>
          <span className="block">{t("hero.title.b")}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 1.4 }}
          className="mt-7 max-w-md font-sans text-[13px] leading-relaxed tracking-wide text-ivoire/70"
        >
          {t("hero.sub")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.55, duration: 1.2 }}
          className="mt-10 flex flex-col items-center gap-5 sm:flex-row"
        >
          <Link href="/kolekcja" className="btn-solid bg-ivoire text-nuit hover:bg-orclair">
            {t("hero.cta.shop")}
          </Link>
          <a href="#poznaj" className="btn-line text-ivoire">
            {t("hero.cta.discover")}
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <div className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 text-center sm:block">
        <p className="eyebrow-dark mb-2 text-ivoire/40">{t("hero.scroll")}</p>
        <div className="mx-auto h-10 w-px overflow-hidden bg-ivoire/15">
          {!reduce && (
            <motion.div
              className="h-4 w-px bg-orclair"
              animate={{ y: [-16, 40] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </div>
      </div>

      {/* Scroll-out veil */}
      <motion.div className="pointer-events-none absolute inset-0 bg-nuit" style={{ opacity: veil }} />
    </section>
  );
}
