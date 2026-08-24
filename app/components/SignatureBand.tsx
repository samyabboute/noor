"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Reveal from "./Reveal";
import { useStore } from "../lib/store";

/**
 * THE SIGNATURES — a full-bleed cinematic product band that bridges the brand
 * story into the shop. The real photograph of the maison's finished signatures
 * (dates filled and dipped by hand) fills the frame; a soft scrim carries an
 * editorial caption and a single route into the collection. One restrained
 * ken-burns drift on scroll — transform only.
 *
 * The photograph lives at /products/signature.webp. Until it is added, a warm
 * fallback ground keeps the band intentional rather than broken.
 */
export default function SignatureBand() {
  const { lang } = useStore();
  const reduce = useReducedMotion();
  const pl = lang === "pl";
  const ref = useRef<HTMLElement>(null);
  const [src, setSrc] = useState("/products/signature.webp");
  const [broken, setBroken] = useState(false);
  const onImgError = () => (src.endsWith(".webp") ? setSrc("/products/signature.jpg") : setBroken(true));
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1.08, 1]);
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-18, 18]);

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{ height: "clamp(30rem, 82vh, 48rem)", background: "linear-gradient(160deg,#2a1a10,#160d07)" }}
    >
      {/* The photograph, drifting a touch on scroll */}
      {!broken && (
        <motion.img
          src={src}
          alt={pl ? "Sygnatury Maison Noor — daktyle nadziewane i oblewane czekoladą" : "Maison Noor signatures — dates filled and dipped in chocolate"}
          onError={onImgError}
          loading="lazy"
          decoding="async"
          style={{ scale, y }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Scrim — legibility from the bottom-left, never a flat overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(90deg, rgba(10,6,4,0.72) 0%, rgba(10,6,4,0.32) 34%, rgba(10,6,4,0) 62%), linear-gradient(0deg, rgba(10,6,4,0.6) 0%, rgba(10,6,4,0) 45%)" }}
      />

      {/* Editorial caption, lower-left */}
      <div className="relative z-10 flex h-full items-end">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col items-start px-6 pb-[clamp(2.5rem,6vh,4.5rem)] md:px-10">
          <Reveal>
            <span className="font-sans text-[11px] uppercase tracking-[0.42em] text-champagne/80">
              {pl ? "Sygnatury" : "The Signatures"}
            </span>
          </Reveal>
          <Reveal delay={0.08} variant="mask">
            <h2 className="display mt-4 max-w-[16ch] text-ivoire" style={{ fontSize: "clamp(2.2rem,5vw,4.25rem)", lineHeight: 1.02 }}>
              {pl ? "Każdy daktyl — mała ceremonia." : "Each date, a small ceremony."}
            </h2>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link href="/kolekcja" className="btn-solid">
                {pl ? "Zobacz kolekcję" : "Discover the collection"}
              </Link>
              <span className="font-sans text-[11px] uppercase tracking-[0.26em] text-ivoire/55">
                {pl ? "Nadziewane i oblewane ręcznie" : "Filled and dipped by hand"}
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
