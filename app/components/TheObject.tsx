"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Photo from "./Photo";
import Reveal from "./Reveal";
import { NoorArabicArt } from "./BrandArt";
import { useStore } from "../lib/store";

/**
 * THE OBJECT — the first meaningful product moment, replacing the rotating-box
 * gimmick. A quiet editorial spread: the fruit itself, held large and cropped,
 * one confident line of desire, and the نور calligraphy emerging ton-sur-ton
 * from the right margin as a brand signature. Product-first, Bateel-calm, and it
 * leads naturally toward the collection. Motion is a single gentle image drift —
 * transform only, nothing that competes with the photograph.
 */
export default function TheObject() {
  const { lang } = useStore();
  const reduce = useReducedMotion();
  const pl = lang === "pl";
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [28, -28]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-paper pad-y-lg text-ink">
      {/* Warm tonal floor — barely there, guiding the eye toward the product */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 90% at 22% 60%, rgba(242,236,222,0.9), rgba(252,251,248,0) 62%)" }}
      />

      {/* The نور signature — large, cropped off the right margin, ton-sur-ton */}
      <div aria-hidden className="pointer-events-none absolute -right-[16%] top-1/2 hidden w-[min(52vw,760px)] -translate-y-1/2 select-none opacity-[0.05] md:block">
        <NoorArabicArt className="block w-full" />
      </div>

      <div className="relative mx-auto grid max-w-[1400px] items-center gap-12 px-6 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        {/* The fruit — held large, drifting a touch on scroll */}
        <motion.div style={{ y: imgY }} className="order-1">
          <Photo
            src="/products/deglet-branch.webp"
            alt={pl ? "Kiść daktyli Deglet Nour" : "A branch of Deglet Nour dates"}
            className="aspect-[4/3] w-full"
            fit="contain"
          />
        </motion.div>

        {/* One confident line of desire */}
        <div className="order-2 lg:pl-6">
          <Reveal>
            <span className="font-sans text-[11px] uppercase tracking-[0.4em] text-or/80">{pl ? "Obiekt" : "The Object"}</span>
          </Reveal>
          <Reveal delay={0.08} variant="mask">
            <h2 className="display mt-5 text-4xl leading-[1.02] md:text-6xl">
              {pl ? "Bursztynowy," : "Amber,"}
            </h2>
          </Reveal>
          <Reveal delay={0.14} variant="mask">
            <h2 className="display text-4xl italic leading-[1.05] text-or md:text-6xl">
              {pl ? "niemal przejrzysty." : "almost translucent."}
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-md font-sans text-[15px] leading-[1.9] text-ink/65">
              {pl
                ? "Pod światło Deglet Nour jaśnieje od wewnątrz — miękki, miodowy, nigdy dosładzany. Wybieramy wyłącznie kaliber Jumbo, cały i nienaruszony, z pierwszego zbioru sezonu."
                : "Held to the light, a Deglet Nour glows from within — soft, honeyed, never sugared. We keep only the Jumbo grade, whole and unbroken, from the season's first harvest."}
            </p>
          </Reveal>
          <Reveal delay={0.28}>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link href="/kolekcja" className="btn-solid">
                {pl ? "Zobacz kolekcję" : "Discover the collection"}
              </Link>
              <span className="font-sans text-[11px] uppercase tracking-[0.26em] text-ink/40">Deglet Nour · Jumbo · Tolga</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
