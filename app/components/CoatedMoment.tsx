"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionTemplate,
  type MotionValue,
} from "framer-motion";
import { useStore } from "../lib/store";

/**
 * L'INSTANT ENROBÉ — the one true "wow" of the homepage.
 *
 * Not an image that fades in. A sticky, scroll-driven chapter where a single
 * coated date is *introduced*: it opens through a clip-path slot as the display
 * word behind it recedes, holds — completely still — given the whole stage, then
 * hands off to a second detail on a vertical wipe. Warm, indulgent, patisserie-
 * grade. Everything here is transform / opacity / clip-path only, so it stays at
 * 60fps; reduced-motion collapses it to a clean, fully-revealed still.
 *
 * Assets: the two most expressive coated singles (candied orange, raspberry).
 */

const ORANGE = "/products/15_1479b91a-a8fb-475c-8647-64b258e99c37.webp";
const FRAMBOISE = "/products/6_b0440c01-07cd-4720-9990-d70398687871.webp";

export default function CoatedMoment() {
  const { lang } = useStore();
  const pl = lang === "pl";
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // — First detail: opens from a slim horizontal slot into the full frame.
  const revealTop = useTransform(scrollYProgress, [0, 0.42], [reduce ? 0 : 40, 0]);
  const revealBottom = useTransform(scrollYProgress, [0, 0.42], [reduce ? 0 : 40, 0]);
  const clipA = useMotionTemplate`inset(${revealTop}% 0% ${revealBottom}% 0%)`;
  const scaleA = useTransform(scrollYProgress, [0, 0.42], [reduce ? 1 : 1.16, 1]);
  const aOpacity = useTransform(scrollYProgress, [0.6, 0.72], [1, reduce ? 1 : 0]);

  // — The display word behind, receding as the photograph takes over.
  const wordOpacity = useTransform(scrollYProgress, [0, 0.06, 0.26], [0, 1, reduce ? 1 : 0]);
  const wordY = useTransform(scrollYProgress, [0, 0.3], [reduce ? 0 : 30, reduce ? 0 : -46]);
  const wordScale = useTransform(scrollYProgress, [0, 0.3], [1, reduce ? 1 : 1.08]);

  // — Second detail: wipes up from below to replace the first.
  const wipe = useTransform(scrollYProgress, [0.6, 0.82], [100, 0]);
  const clipB = useMotionTemplate`inset(${wipe}% 0% 0% 0%)`;
  const scaleB = useTransform(scrollYProgress, [0.6, 0.86], [reduce ? 1 : 1.1, 1]);
  const bOpacity = useTransform(scrollYProgress, [0.58, 0.66], [0, 1]);

  // — Captions cross-fade with the handoff.
  const capA = useTransform(scrollYProgress, [0.32, 0.44, 0.58, 0.66], [0, 1, 1, 0]);
  const capB = useTransform(scrollYProgress, [0.82, 0.92], [0, 1]);

  // — A whisper of vertical drift on the whole plate, for depth.
  const plateY = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 26, reduce ? 0 : -26]);

  return (
    <section ref={ref} className="relative h-[240vh] bg-paper text-ink">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        {/* Warm ground — near-white at centre so the object's field is seamless,
            warming to amber only toward the edges. A low sun behind the plate. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(125% 90% at 50% 44%, #FFFFFF 0%, #FEFCF7 40%, #F7EFDF 78%, #F0E6D2 100%)" }}
        />

        {/* The receding display word, ton-sur-ton behind the plate */}
        <motion.div
          aria-hidden
          style={{ opacity: wordOpacity, y: wordY, scale: wordScale }}
          className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center text-center"
        >
          <span className="display text-[19vw] leading-[0.85] text-or/[0.13] md:text-[15rem]">Enrobé</span>
        </motion.div>

        {/* Section index, quiet, top-left */}
        <div className="absolute left-6 top-[13svh] z-20 md:left-10">
          <span className="font-sans text-[11px] uppercase tracking-wide2 text-ink/40">
            {pl ? "Rozdział" : "Chapter"} · {pl ? "Enrobée" : "Enrobées"}
          </span>
        </div>

        {/* Eyebrow, top-centered */}
        <motion.p
          style={{ opacity: capA }}
          className="absolute top-[13svh] left-1/2 z-20 -translate-x-1/2 font-sans text-[11px] uppercase tracking-luxe text-or"
        >
          {pl ? "Zanurzone ręcznie" : "Dipped by hand"}
        </motion.p>

        {/* THE PLATE — a single coated date, given the stage */}
        <motion.div style={{ y: plateY }} className="relative z-10 h-[52svh] w-[min(84vw,520px)] md:h-[62svh]">
          {/* contact shadow that grounds the object */}
          <div
            aria-hidden
            className="absolute inset-x-[12%] bottom-[8%] h-[10%] rounded-[50%] blur-2xl"
            style={{ background: "rgba(80,50,20,0.22)" }}
          />
          <Detail src={ORANGE} clip={clipA} scale={scaleA} opacity={aOpacity} z={10} />
          <Detail src={FRAMBOISE} clip={clipB} scale={scaleB} opacity={bOpacity} z={20} />
        </motion.div>

        {/* Caption A — the candied-orange detail */}
        <Caption
          style={{ opacity: capA }}
          name="Zeste Noir"
          line={pl ? "Gorzka czekolada, słońce kandyzowanej pomarańczy." : "Bitter chocolate, the sun of candied orange."}
        />
        {/* Caption B — the raspberry detail, with the exit CTA */}
        <Caption
          style={{ opacity: capB }}
          name="Noir Framboise"
          line={pl ? "Ciemna czekolada, kwaskowa malina, głęboki owoc." : "Dark chocolate, tart raspberry, the deep fruit."}
          cta={pl ? "Zobacz kolekcję enrobées" : "Discover the enrobées"}
        />
      </div>
    </section>
  );
}

function Detail({
  src,
  clip,
  scale,
  opacity,
  z,
}: {
  src: string;
  clip: MotionValue<string>;
  scale: MotionValue<number>;
  opacity: MotionValue<number>;
  z: number;
}) {
  return (
    <motion.img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      style={{ clipPath: clip, WebkitClipPath: clip, scale, opacity, zIndex: z, filter: "drop-shadow(0 30px 46px rgba(60,35,15,0.28))" }}
      className="absolute inset-0 h-full w-full object-contain"
    />
  );
}

function Caption({
  name,
  line,
  cta,
  style,
}: {
  name: string;
  line: string;
  cta?: string;
  style: { opacity: MotionValue<number> };
}) {
  return (
    <motion.div
      style={style}
      className="absolute bottom-[9svh] left-1/2 z-20 w-[min(90vw,520px)] -translate-x-1/2 text-center"
    >
      <h3 className="display text-3xl md:text-4xl">{name}</h3>
      <p className="mx-auto mt-3 max-w-sm font-sans text-[13.5px] leading-[1.8] text-ink/60">{line}</p>
      {cta && (
        <Link href="/kolekcja" className="btn-line mt-6 text-ink">
          {cta}
        </Link>
      )}
    </motion.div>
  );
}
