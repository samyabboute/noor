"use client";

import { motion, useReducedMotion } from "framer-motion";
import Reveal from "./Reveal";
import { useStore } from "../lib/store";

/**
 * ORIGIN — a chapter, not a section. A dark, quiet interlude between the two
 * lit sections around it, art-directed as the provenance page of a brand book.
 *
 * Concept: "Born under the sun." The focal point is the headline; typography
 * carries the art direction, the story gives it substance, and a single gold
 * hairline with a line of provenance are the only graphic marks. Depth comes
 * from fine grain, a shadowed vignette and negative space — no illustration,
 * no glow, no parallax. The eye goes straight to the words.
 */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function OriginScene() {
  const { lang } = useStore();
  const reduce = useReducedMotion();
  const pl = lang === "pl";

  const line1 = pl ? "Zrodzony" : "Born under";
  const line2 = pl ? "ze słońca." : "the sun.";
  const lede = pl
    ? "Deglet Nour, daktyl światła. Dojrzewa na północnym skraju Sahary, w algierskich oazach Ziban — zbierany ręcznie, u źródła, w pełni słońca."
    : "Deglet Nour, the date of light. Ripened at the northern edge of the Sahara, in the Ziban oases of Algeria, and gathered by hand at the source.";
  const provenance = pl ? ["Tolga · Ziban", "Algieria", "34° Północy"] : ["Tolga · Ziban", "Algeria", "34° North"];

  return (
    <section id="origin" className="relative flex min-h-screen items-center overflow-hidden bg-nuit py-[clamp(6rem,16vh,11rem)]">
      {/* Ground — a near-flat deep green, a shade warmer toward the floor */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#06170f 0%,#0a1f16 55%,#0c2318 100%)" }} />

      {/* Film grain — material, not effect */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-soft-light"
        style={{ backgroundImage: GRAIN, backgroundRepeat: "repeat" }}
      />

      {/* Vignette — depth from shadow at the edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 100% at 50% 42%, transparent 55%, rgba(0,0,0,0.5) 100%)" }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1080px] flex-col items-center px-6 text-center">
        <Reveal>
          <span className="font-sans text-[11px] uppercase tracking-[0.42em] text-champagne/60">
            {pl ? "Pochodzenie" : "Origin"}
          </span>
        </Reveal>

        <div className="mt-8 md:mt-11">
          <Reveal variant="mask">
            <h2 className="display text-ivoire" style={{ fontSize: "clamp(2.9rem,8.4vw,7rem)", lineHeight: 0.92 }}>
              {line1}
            </h2>
          </Reveal>
          <Reveal variant="mask" delay={0.08}>
            <h2 className="display italic text-or" style={{ fontSize: "clamp(2.9rem,8.4vw,7rem)", lineHeight: 0.92 }}>
              {line2}
            </h2>
          </Reveal>
        </div>

        {/* The single graphic mark — a gold hairline that draws itself in */}
        <motion.div
          aria-hidden
          className="mt-10 h-px w-16 origin-center md:mt-12"
          style={{ background: "linear-gradient(90deg,transparent,#C2A25A,transparent)" }}
          initial={reduce ? { opacity: 1 } : { scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1.1, delay: 0.25, ease: EASE }}
        />

        <Reveal delay={0.12} className="mt-10 max-w-[36rem] md:mt-12">
          <p className="font-serif text-[1.05rem] leading-relaxed text-ivoire/75 md:text-xl md:leading-relaxed">{lede}</p>
        </Reveal>

        <Reveal delay={0.24} className="mt-11 md:mt-14">
          <div className="flex flex-col items-center gap-y-3 font-sans text-[10.5px] uppercase tracking-[0.28em] text-ivoire/45 sm:flex-row sm:gap-x-5 md:text-[11px]">
            {provenance.map((item, i) => (
              <span key={item} className="flex items-center gap-x-5">
                {i > 0 && <span aria-hidden className="hidden h-3 w-px bg-ivoire/20 sm:inline-block" />}
                {item}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
