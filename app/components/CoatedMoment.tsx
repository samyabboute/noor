"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useMotionTemplate,
  type MotionValue,
} from "framer-motion";
import { NoorArabicArt } from "./BrandArt";
import { useStore } from "../lib/store";

/**
 * L'INSTANT ENROBÉ — the signature "wow" of the homepage, directed as a silent
 * film in one continuous take.
 *
 * The sequence, on smoothed scroll:
 *   DISCOVERY  a fragment — the coated surface, cropped tight behind the word.
 *   CURIOSITY  the crop pulls back, the date expands into its full form.
 *   DESIRE     the word lifts away; the نور signature breathes in behind.
 *   REVEAL     the photograph reaches its composition, completely still.
 *   STILLNESS  a held beat — nothing moves, the product speaks.
 *   CONTINUITY the first detail wipes upward and, from underneath, the second
 *              expands into place — frames of one campaign, never a slideshow.
 *
 * Everything is transform / opacity / clip-path, driven by a single spring, so
 * motion feels weighted, not literal, and stays at 60fps. Reduced-motion
 * collapses the whole thing to a clean, fully-revealed still.
 */

const ORANGE = "/products/15_1479b91a-a8fb-475c-8647-64b258e99c37.webp";
const FRAMBOISE = "/products/6_b0440c01-07cd-4720-9990-d70398687871.webp";

export default function CoatedMoment() {
  const { lang } = useStore();
  const pl = lang === "pl";
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // Weighted scrubbing — the scroll drives a spring, not the values directly.
  const s = useSpring(scrollYProgress, { stiffness: 80, damping: 26, mass: 0.35 });

  /* ── The display word: the image passes BEHIND it, then it lifts away ── */
  const wordOpacity = useTransform(s, [0, 0.05, 0.3], [0, 1, reduce ? 1 : 0]);
  const wordY = useTransform(s, [0, 0.32], [reduce ? 0 : 12, reduce ? 0 : -64]);
  const wordScale = useTransform(s, [0, 0.32], [1, reduce ? 1 : 1.14]);

  /* ── Detail A — candied orange: fragment → full form → holds → wipes away ── */
  const aTop = useTransform(s, [0, 0.4], [reduce ? 0 : 44, 0]);
  const aBottom = useTransform(s, [0, 0.4, 0.62, 0.82], [reduce ? 0 : 44, 0, 0, 100]);
  const clipA = useMotionTemplate`inset(${aTop}% 0% ${aBottom}% 0%)`;
  const scaleA = useTransform(s, [0, 0.4, 0.6, 0.82], [reduce ? 1 : 1.26, 1.03, 1.03, reduce ? 1 : 1.12]);

  /* ── Detail B — raspberry: revealed underneath, expands into place ── */
  const bTop = useTransform(s, [0.62, 0.88], [reduce ? 0 : 26, 0]);
  const bBottom = useTransform(s, [0.62, 0.88], [reduce ? 0 : 26, 0]);
  const clipB = useMotionTemplate`inset(${bTop}% 0% ${bBottom}% 0%)`;
  const scaleB = useTransform(s, [0.62, 0.9], [reduce ? 1 : 1.16, 1]);
  const bOpacity = useTransform(s, [0.6, 0.66], [0, 1]);

  /* ── The نور signature — discovered at the peak, never imposed ── */
  const markOpacity = useTransform(s, [0.34, 0.52, 0.9, 1], [0, 0.06, 0.05, 0.02]);
  const markScale = useTransform(s, [0.34, 1], [reduce ? 1 : 1.0, reduce ? 1 : 1.14]);

  /* ── The background evolves at exactly the right moment ── */
  const warmth = useTransform(s, [0.28, 0.5, 0.72], [0, 0.5, 0.16]);

  /* ── Captions cross the handoff ── */
  const capA = useTransform(s, [0.4, 0.48, 0.58, 0.66], [0, 1, 1, 0]);
  const capB = useTransform(s, [0.88, 0.96], [0, 1]);
  const eyebrow = useTransform(s, [0.08, 0.18, 0.34, 0.42], [0, 1, 1, 0]);

  /* ── A whisper of depth on the whole plate ── */
  const plateY = useTransform(s, [0, 1], [reduce ? 0 : 20, reduce ? 0 : -20]);

  return (
    <section ref={ref} id="enrobe" className="relative h-[230vh] bg-paper text-ink md:h-[280vh]">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        {/* Warm ground — near-white at centre so the field is seamless */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(125% 92% at 50% 44%, #FFFFFF 0%, #FEFCF7 40%, #F7EFDF 78%, #F0E6D2 100%)" }}
        />
        {/* Warmth that swells at the reveal, then settles */}
        <motion.div
          aria-hidden
          style={{ opacity: warmth }}
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute inset-0" style={{ background: "radial-gradient(90% 70% at 50% 52%, rgba(214,178,110,0.34), transparent 68%)" }} />
        </motion.div>

        {/* The نور signature, breathing behind the plate */}
        <motion.div
          aria-hidden
          style={{ opacity: markOpacity, scale: markScale }}
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 w-[min(120vw,1000px)] max-w-none -translate-x-1/2 -translate-y-1/2 select-none"
        >
          <NoorArabicArt className="block w-full" />
        </motion.div>

        {/* Chapter tag */}
        <div className="absolute left-6 top-[12svh] z-40 md:left-10">
          <span className="font-sans text-[11px] uppercase tracking-wide2 text-ink/35">
            {pl ? "Rozdział" : "Chapter"} · Enrobées
          </span>
        </div>

        {/* Eyebrow, top-centred */}
        <motion.p
          style={{ opacity: eyebrow }}
          className="absolute top-[12svh] left-1/2 z-40 -translate-x-1/2 font-sans text-[11px] uppercase tracking-luxe text-or"
        >
          {pl ? "Zanurzone ręcznie" : "Dipped by hand"}
        </motion.p>

        {/* The receding display word — the photograph passes behind it */}
        <motion.div
          aria-hidden
          style={{ opacity: wordOpacity, y: wordY, scale: wordScale }}
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
        >
          <span className="display text-[22vw] leading-[0.82] text-or/[0.16] md:text-[16rem]">Enrobé</span>
        </motion.div>

        {/* THE PLATE — a single coated date, given the stage */}
        <motion.div style={{ y: plateY }} className="relative z-10 h-[50svh] w-[min(82vw,500px)] md:h-[62svh] md:w-[min(46vw,540px)]">
          {/* contact shadow grounding the object */}
          <div
            aria-hidden
            className="absolute inset-x-[14%] bottom-[9%] h-[9%] rounded-[50%] blur-2xl"
            style={{ background: "rgba(80,50,20,0.22)" }}
          />
          {/* B sits underneath; A rides in front and wipes away to reveal it */}
          <Detail src={FRAMBOISE} clip={clipB} scale={scaleB} opacity={bOpacity} z={10} />
          <Detail src={ORANGE} clip={clipA} scale={scaleA} z={20} priority />
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
  priority,
}: {
  src: string;
  clip: MotionValue<string>;
  scale: MotionValue<number>;
  opacity?: MotionValue<number>;
  z: number;
  priority?: boolean;
}) {
  return (
    <motion.img
      src={src}
      alt=""
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      style={{
        clipPath: clip,
        WebkitClipPath: clip,
        scale,
        ...(opacity ? { opacity } : {}),
        zIndex: z,
        filter: "drop-shadow(0 30px 48px rgba(60,35,15,0.3))",
        willChange: "transform, clip-path",
      }}
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
      className="absolute bottom-[8svh] left-1/2 z-40 w-[min(90vw,520px)] -translate-x-1/2 text-center"
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
