"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Photo from "./Photo";
import NoorPattern from "./NoorPattern";
import { useStore } from "../lib/store";

export default function Hero() {
  const { t } = useStore();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // Cinematic scroll-out: the object rises and dims, text lifts, a veil closes.
  const objY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 140]);
  const objScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.15]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -70]);
  const veil = useTransform(scrollYProgress, [0, 1], [0, 0.7]);

  return (
    <section ref={ref} className="relative isolate h-[100svh] min-h-[620px] w-full overflow-hidden bg-nuit text-ivoire">
      {/* Deep base */}
      <div className="absolute inset-0 -z-20" style={{ background: "radial-gradient(120% 90% at 50% 40%, #123227 0%, #0a1f18 55%, #05130e 100%)" }} />

      {/* Arabesque, whispered in from the margins */}
      <NoorPattern placement="sides" opacity={0.04} scale={150} color="#D8BE7E" />

      {/* Warm light that grows in on load — the "sun" rising into the scene */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[34%] h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(216,190,126,0.28), rgba(194,162,90,0.08), transparent 72%)" }}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.6, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* The object — a single Deglet Nour, filmed like a jewel */}
      <motion.div
        className="absolute inset-x-0 top-0 flex h-[54%] items-end justify-center sm:h-[58%]"
        style={{ y: objY, scale: objScale }}
      >
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8, filter: "brightness(0.25)" }}
          animate={{ opacity: 1, scale: 1, filter: "brightness(1)" }}
          transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-[min(74vw,360px)]"
        >
          <motion.div
            animate={reduce ? {} : { y: [0, -10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            <Photo src="/products/deglet-single.webp" alt="Daktyl Deglet Nour" className="aspect-[3/2] w-full" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scrim for legibility */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-t from-nuit via-nuit/85 to-transparent" />

      {/* Text */}
      <motion.div
        className="relative z-10 flex h-full flex-col items-center justify-end px-6 pb-[12vh] text-center"
        style={{ y: textY }}
      >
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="eyebrow mb-5 text-or"
        >
          {t("hero.house")}
        </motion.p>

        <h1 className="display text-[16vw] leading-[0.92] sm:text-[10vw] md:text-[7.5rem]">
          <motion.span
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="block italic font-light text-champagne"
          >
            {t("hero.light.a")}
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="block"
          >
            {t("hero.light.b")}
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.45, duration: 1.4 }}
          className="mt-6 max-w-xs font-sans text-[13px] leading-relaxed tracking-wide text-ivoire/70 sm:max-w-md"
        >
          {t("hero.sub2")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.65, duration: 1.2 }}
          className="mt-9 flex w-full max-w-xs flex-col items-center gap-4 sm:w-auto sm:flex-row"
        >
          <Link href="/kolekcja" className="btn-solid-invert w-full sm:w-auto">
            {t("hero.cta.shop")}
          </Link>
          <a href="#poznaj" className="btn-line text-ivoire">
            {t("hero.cta.discover")}
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-center">
        <p className="eyebrow mb-2 text-ivoire/40">{t("hero.scroll")}</p>
        <div className="mx-auto h-9 w-px overflow-hidden bg-ivoire/15">
          {!reduce && (
            <motion.div
              className="h-4 w-px bg-or"
              animate={{ y: [-16, 36] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </div>
      </div>

      <motion.div className="pointer-events-none absolute inset-0 bg-nuit" style={{ opacity: veil }} />
    </section>
  );
}
