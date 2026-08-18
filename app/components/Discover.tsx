"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import ProductVisual from "./ProductVisual";
import Reveal from "./Reveal";
import { useStore } from "../lib/store";

export default function Discover() {
  const { t } = useStore();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.35"] });

  // Real CSS-3D: as the section scrolls through view, the lid hinges open
  // and the light inside grows. No WebGL — 60fps on a mid smartphone.
  const lidRotate = useTransform(scrollYProgress, [0, 0.6], [0, reduce ? 0 : -108]);
  const lidLift = useTransform(scrollYProgress, [0, 0.6], [0, reduce ? 0 : -18]);
  const glow = useTransform(scrollYProgress, [0.15, 0.7], [0, 1]);
  const caseScale = useTransform(scrollYProgress, [0, 0.6], [0.94, 1]);

  return (
    <section id="poznaj" ref={ref} className="relative overflow-hidden bg-paper py-16 text-ink md:py-36">
      <div className="mx-auto grid max-w-[1400px] items-center gap-14 px-6 md:px-10 lg:grid-cols-2 lg:gap-20">
        {/* Editorial column */}
        <div className="order-2 lg:order-1">
          <Reveal>
            <p className="section-index">{t("discover.index")}</p>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="eyebrow mt-6">{t("discover.eyebrow")}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="display mt-4 text-4xl md:text-6xl">{t("discover.title")}</h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-8 max-w-lg font-sans text-[15px] leading-[1.9] text-ink/70">
              {t("discover.body")}
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <a href="#kolekcja" className="btn-line mt-10 text-or">
              {t("collection.all")}
            </a>
          </Reveal>
        </div>

        {/* The 3D stage */}
        <div className="order-1 lg:order-2">
          <div className="stage mx-auto aspect-square w-full max-w-[520px]">
            <div className="preserve-3d relative h-full w-full">
              {/* glow that grows as the box opens */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  opacity: glow,
                  background: "radial-gradient(circle at 50% 45%, rgba(228,199,132,0.55), transparent 62%)",
                  filter: "blur(30px)",
                }}
              />

              {/* the case revealed inside */}
              <motion.div className="preserve-3d absolute inset-0 flex items-center justify-center" style={{ scale: caseScale }}>
                <ProductVisual slug="collection-noor" className="h-[86%] w-[86%]" />
              </motion.div>

              {/* the lid, hinged at its top edge */}
              <motion.div
                className="absolute inset-x-[7%] top-[7%] h-[46%] origin-top rounded-t-[6px]"
                style={{
                  rotateX: lidRotate,
                  y: lidLift,
                  transformStyle: "preserve-3d",
                  background: "linear-gradient(160deg, #1a4636 0%, #0a1f18 100%)",
                  boxShadow: "0 20px 60px -20px rgba(0,0,0,0.7)",
                }}
              >
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-col items-center gap-2 opacity-70">
                    <svg viewBox="0 0 40 40" className="h-6 w-6 text-orclair">
                      <path d="M20 2 C21 13 27 19 38 20 C27 21 21 27 20 38 C19 27 13 21 2 20 C13 19 19 13 20 2 Z" fill="currentColor" />
                    </svg>
                    <span className="font-serif text-sm tracking-[0.2em] text-orclair/80">NOOR</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          <p className="mt-6 text-center font-sans text-[11px] uppercase tracking-wide2 text-ink/40">
            {reduce ? "Maison Noor" : "↕ " + t("hero.scroll")}
          </p>
        </div>
      </div>
    </section>
  );
}
