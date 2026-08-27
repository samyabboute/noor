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
 * film in one continuous take, built around three coated-date frames.
 *
 * The sequence, on spring-smoothed scroll:
 *   FIRST CONTACT  (11) a milk-chocolate fragment opens from a slot behind the
 *                  word — curiosity, nothing given away.
 *   DISCOVERY      (12) the SAME date, tighter — revealed OVER the first through
 *                  a growing slot, so it reads as a continuous push-in, not a cut.
 *   THE WOW        (pistachio) the dark, distinct hero grows from an extreme crop
 *                  into its full composition, taking the stage as the word lifts.
 *   STILLNESS      a held beat — nothing moves, the product speaks.
 *   TRANSITION     the نور signature and warm ground carry the eye into the shop.
 *
 * Mechanic: each frame is stacked above the previous and revealed by a clip-path
 * that GROWS — so the earlier photograph stays visible beneath until covered.
 * No crossfades, no slideshow. Everything is transform / opacity / clip-path on a
 * single spring: weighted, 60fps, and it collapses cleanly under reduced-motion.
 */

const FRAME_1 = "/products/11_6b3e95ba-c26c-46f4-aea0-7f816530104f.webp"; // milk · wider
const FRAME_2 = "/products/12_ea8c6ce5-87b3-4b45-a18f-08619fbeb22b.webp"; // milk · tighter (same date)
const HERO = "/products/DATTE_ENROBEE_INDIVIDUELLE_POUR_SITE_6.webp"; // dark · pistachio

export default function CoatedMoment() {
  const { lang } = useStore();
  const pl = lang === "pl";
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // Weighted scrubbing — the scroll drives a spring, not the values directly.
  const s = useSpring(scrollYProgress, { stiffness: 80, damping: 26, mass: 0.35 });

  /* ── Frame 1 — first contact: a fragment opening from a slot ── */
  const t1 = useTransform(s, [0, 0.26], [reduce ? 0 : 44, 0]);
  const clip1 = useMotionTemplate`inset(${t1}% 0% ${t1}% 0%)`;
  const scale1 = useTransform(s, [0, 0.3], [reduce ? 1 : 1.22, 1.04]);

  /* ── Frame 2 — discovery: the same date, revealed OVER the first (push-in) ── */
  const t2 = useTransform(s, [0.3, 0.5], [reduce ? 0 : 50, 0]);
  const clip2 = useMotionTemplate`inset(${t2}% 0% ${t2}% 0%)`;
  const scale2 = useTransform(s, [0.3, 0.52], [reduce ? 1 : 1.1, 1.0]);

  /* ── Hero — pistachio: extreme crop expanding into the full composition ── */
  const th = useTransform(s, [0.58, 0.8], [reduce ? 0 : 50, 0]);
  const clipH = useMotionTemplate`inset(${th}% ${th}% ${th}% ${th}%)`;
  const scaleH = useTransform(s, [0.58, 0.8, 0.9, 1], [reduce ? 1 : 1.28, 1.03, 1.03, reduce ? 1 : 1.06]);

  /* ── The display word: the image passes BEHIND it, then it lifts away ── */
  const wordOpacity = useTransform(s, [0, 0.05, 0.32], [0, 1, reduce ? 1 : 0]);
  const wordY = useTransform(s, [0, 0.34], [reduce ? 0 : 12, reduce ? 0 : -64]);
  const wordScale = useTransform(s, [0, 0.34], [1, reduce ? 1 : 1.14]);

  /* ── The نور signature — discovered at the peak, never imposed ── */
  const markOpacity = useTransform(s, [0.56, 0.74, 1], [0, 0.06, 0.04]);
  const markScale = useTransform(s, [0.56, 1], [reduce ? 1 : 1.0, reduce ? 1 : 1.12]);

  /* ── The background evolves at exactly the right moment ── */
  const warmth = useTransform(s, [0.5, 0.72, 0.92], [0, 0.42, 0.14]);

  /* ── Captions bridge the acts ── */
  const capMilk = useTransform(s, [0.36, 0.44, 0.52, 0.58], [0, 1, 1, 0]);
  const capHero = useTransform(s, [0.82, 0.92], [0, 1]);
  const eyebrow = useTransform(s, [0.08, 0.18, 0.3, 0.38], [0, 1, 1, 0]);

  /* ── A whisper of depth on the whole plate ── */
  const plateY = useTransform(s, [0, 1], [reduce ? 0 : 18, reduce ? 0 : -18]);

  /* ── The Noor scroll cue — an invitation that becomes a progress rail ── */
  const cuePct = useTransform(s, [0, 1], [0, 100]);
  const cueFill = useMotionTemplate`${cuePct}%`;
  const cueInvite = useTransform(s, [0, 0.05, 0.12], [1, 1, 0]); // the words, only while uncertain
  const cueRail = useTransform(s, [0.86, 0.99], [1, 0]); // the rail retires at the end

  // The hero CTA only accepts clicks once its caption is actually on screen.
  const heroPE = useTransform(s, [0.8, 0.82], ["none", "auto"]);

  // Each node lights up in gold exactly as the travelling head arrives at it —
  // aligned to the three reveals (first contact ≈ 5%, discovery ≈ 42%, hero ≈ 85%).
  const nodeA = useTransform(s, [0, 0.05, 0.18], [1, 1, 0.16]);
  const nodeB = useTransform(s, [0.3, 0.42, 0.56], [0.16, 1, 0.16]);
  const nodeC = useTransform(s, [0.72, 0.85, 0.96], [0.16, 1, 0.7]);
  const NODES: { top: number; glow: MotionValue<number> }[] = [
    { top: 5, glow: nodeA },
    { top: 42, glow: nodeB },
    { top: 85, glow: nodeC },
  ];

  return (
    <section ref={ref} id="enrobe" className="relative h-[240vh] bg-paper text-ink md:h-[300vh]">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        {/* Warm ground — near-white at centre so the field is seamless */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(125% 92% at 50% 44%, #FFFFFF 0%, #FEFCF7 40%, #F7EFDF 78%, #F0E6D2 100%)" }}
        />
        {/* Warmth that swells at the reveal, then settles */}
        <motion.div aria-hidden style={{ opacity: warmth }} className="pointer-events-none absolute inset-0">
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
          className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center"
        >
          <span className="display text-[22vw] leading-[0.82] text-or/[0.16] md:text-[16rem]">Enrobé</span>
        </motion.div>

        {/* THE PLATE — the coated date, given the stage. pointer-events-none so it
            never reads as a button; the journey is scroll-driven, not a click. */}
        <motion.div style={{ y: plateY }} className="pointer-events-none relative z-10 h-[52svh] w-[min(84vw,500px)] md:h-[64svh] md:w-[min(46vw,560px)]">
          {/* contact shadow grounding the object */}
          <div
            aria-hidden
            className="absolute inset-x-[14%] bottom-[9%] h-[9%] rounded-[50%] blur-2xl"
            style={{ background: "rgba(70,45,18,0.22)" }}
          />
          {/* stacked frames — each revealed OVER the last by a growing clip */}
          <Detail src={FRAME_1} clip={clip1} scale={scale1} z={10} priority />
          <Detail src={FRAME_2} clip={clip2} scale={scale2} z={20} />
          <Detail src={HERO} clip={clipH} scale={scaleH} z={30} />
        </motion.div>

        {/* THE NOOR SCROLL CUE — a quiet vertical rail on the right margin: three
            nodes for the three frames, a gold head that travels with the scroll,
            and an invitation that retires once the journey has begun. */}
        <motion.div
          aria-hidden
          style={{ opacity: cueRail }}
          className="pointer-events-none absolute bottom-[7svh] left-1/2 z-40 flex -translate-x-1/2 flex-col items-center md:bottom-auto md:left-auto md:right-9 md:top-1/2 md:-translate-x-0 md:-translate-y-1/2"
        >
          <div className="relative h-[15svh] w-px bg-ink/[0.16] md:h-[40svh]">
            {/* the three frames as nodes — each lights as the head arrives */}
            {NODES.map((n) => (
              <span key={n.top} className="absolute left-1/2 -translate-x-1/2" style={{ top: `${n.top}%` }}>
                <span className="block h-[3px] w-[3px] -translate-y-1/2 rounded-full bg-ink/20" />
                <motion.span
                  style={{ opacity: n.glow }}
                  className="absolute left-0 top-0 block h-[3px] w-[3px] -translate-y-1/2 rounded-full bg-or shadow-[0_0_6px_rgba(194,162,90,0.9)]"
                />
              </span>
            ))}
            {/* the progress fill, drawn from the top down */}
            <motion.span className="absolute left-0 top-0 w-px origin-top bg-or" style={{ height: cueFill }} />
            {/* a comet of light that glides DOWN the rail — the directional
                invitation to scroll, present only until the journey begins */}
            <motion.span aria-hidden style={{ opacity: cueInvite }} className="absolute inset-0">
              <motion.span
                className="absolute left-1/2 block h-[36%] w-[1.5px] -translate-x-1/2 bg-gradient-to-b from-transparent via-orclair to-transparent shadow-[0_0_7px_rgba(216,190,126,0.85)]"
                animate={reduce ? { top: "34%", opacity: 0.55 } : { top: ["-8%", "100%"], opacity: [0, 1, 1, 0] }}
                transition={reduce ? undefined : { duration: 2.4, repeat: Infinity, ease: "easeInOut", times: [0, 0.2, 0.68, 1], repeatDelay: 0.35 }}
              />
            </motion.span>
            {/* the travelling head — the scroll-linked progress marker */}
            <motion.span
              className="absolute left-1/2 h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-or bg-paper shadow-[0_0_10px_rgba(194,162,90,0.7)]"
              style={{ top: cueFill }}
            />
          </div>
          {/* the invitation — a quiet word, gone the moment the sequence reacts */}
          <motion.span
            style={{ opacity: cueInvite }}
            className="mt-4 font-sans text-[11px] uppercase tracking-[0.36em] text-ink/70 md:mt-5"
          >
            {pl ? "Przewiń, by odkryć" : "Scroll to reveal"}
          </motion.span>
        </motion.div>

        {/* Caption — the milk-chocolate discovery (decorative, no interaction) */}
        <Caption
          style={{ opacity: capMilk, pointerEvents: "none" }}
          name="Lait Praliné"
          line={pl ? "Mleczna czekolada, orzechowe praliné, jedwabista skóra." : "Milk chocolate, hazelnut praliné, a silken skin."}
        />
        {/* Caption — the pistachio hero, with the exit CTA to its page */}
        <Caption
          style={{ opacity: capHero, pointerEvents: heroPE }}
          name="Perle de Pistache"
          line={pl ? "Ciemna czekolada, zielona pistacja z Bronte, głęboki owoc." : "Dark chocolate, green Bronte pistachio, the deep fruit."}
          cta={pl ? "Odkryj tę sygnaturę" : "Discover this signature"}
          href="/produkt/perle-pistache"
        />
      </div>
    </section>
  );
}

function Detail({
  src,
  clip,
  scale,
  z,
  priority,
}: {
  src: string;
  clip: MotionValue<string>;
  scale: MotionValue<number>;
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
  href = "/kolekcja",
  style,
}: {
  name: string;
  line: string;
  cta?: string;
  href?: string;
  style: { opacity: MotionValue<number>; pointerEvents?: MotionValue<string> | "none" };
}) {
  return (
    <motion.div
      style={style}
      className="absolute bottom-[8svh] left-1/2 z-50 w-[min(90vw,520px)] -translate-x-1/2 text-center"
    >
      <h3 className="display text-3xl md:text-4xl">{name}</h3>
      <p className="mx-auto mt-3 max-w-sm font-sans text-[13.5px] leading-[1.8] text-ink/60">{line}</p>
      {cta && (
        <Link href={href} className="btn-line mt-6 text-ink">
          {cta}
        </Link>
      )}
    </motion.div>
  );
}
