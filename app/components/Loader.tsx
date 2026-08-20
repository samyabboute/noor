"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { NoorLogoArt, NoorOasisArt } from "./BrandArt";
import { useStore } from "../lib/store";

/**
 * NOOR — the opening scene. One idea, not a collection of effects:
 *
 *   "First light over the grove."
 *
 * Deglet Nour means "the date of light"; Noor means light; the fruit is born in
 * the Ziban oases of Algeria. The first impression is a single passage — from
 * the night of the oasis into the light of Noor.
 *
 *   1 · Silence   — a cool, near-black field. Grain. Room to breathe.
 *   2 · Discovery — one cropped band of the Algerian palm grove is found along a
 *                   low horizon; most of the artwork stays outside the frame.
 *   3 · Story     — a single restrained line: the date of light. It recedes.
 *   4 · Signature — the gold mark resolves in the sky above the grove — first
 *                   light, earned by a beat of stillness.
 *   5 · Invitation— a line rises word by word from behind a mask, then holds.
 *   · Opening     — the night lifts away like a curtain, revealing the luminous
 *                   cream homepage beneath. You enter the light.
 *
 * No glow — the light is the payoff, not a gradient. Depth comes from layering,
 * a vignette, film grain and negative space.
 *
 * The choreography is driven by framer VARIANTS with stable string labels
 * ("hidden"/"show"/"gone"), not inline animate objects — so the store's
 * hydration and geo re-renders can't restart the delayed beats mid-sequence.
 * All artwork is inline SVG (BrandArt); GPU-only; reduced-motion aware; with a
 * distinct mobile composition.
 */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const LIFT: [number, number, number, number] = [0.7, 0, 0.2, 1];
const HOLD = 4.6; // full sequence before the night lifts
const EXIT = 1.0; // the opening

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function Loader() {
  const { lang } = useStore();
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [dim, setDim] = useState(false); // the story recedes so the mark stands alone

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    if (sessionStorage.getItem("noor.entered")) return;
    setShow(true);
    document.body.style.overflow = "hidden";
    const release = () => {
      if (!document.body.dataset.noorGate) document.body.style.overflow = "";
    };
    const recede = setTimeout(() => setDim(true), (reduce ? 1.0 : 2.6) * 1000);
    const end = setTimeout(
      () => {
        setShow(false);
        sessionStorage.setItem("noor.entered", "1");
        release();
      },
      (reduce ? 1.7 : HOLD) * 1000,
    );
    return () => {
      clearTimeout(recede);
      clearTimeout(end);
      release();
    };
  }, [reduce]);

  const story = lang === "pl" ? "Daktyl światła" : "The date of light";
  const words = (lang === "pl" ? "Witaj w świetle" : "Enjoy the experience").split(" ");

  // Variants — labels are stable strings, immune to re-render restarts.
  const grove: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 26, clipPath: "inset(0% 0% 100% 0%)" },
    show: reduce
      ? { opacity: 0.32, transition: { duration: 0.6 } }
      : { opacity: 0.4, y: 0, clipPath: "inset(0% 0% 0% 0%)", transition: { delay: 0.3, duration: 1.5, ease: EASE } },
  };
  const storyV: Variants = {
    hidden: { opacity: 0, letterSpacing: reduce ? "0.4em" : "0.2em" },
    show: { opacity: reduce ? 0.7 : 0.82, letterSpacing: "0.46em", transition: { delay: reduce ? 0.2 : 0.9, duration: reduce ? 0.5 : 1.4, ease: EASE } },
    gone: { opacity: 0, letterSpacing: "0.52em", transition: { duration: 0.8, ease: EASE } },
  };
  const mark: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, clipPath: "inset(100% 0% 0% 0%)", scale: 1.03, y: 12 },
    show: reduce
      ? { opacity: 1, transition: { delay: 0.2, duration: 0.5 } }
      : { opacity: 1, clipPath: "inset(0% 0% 0% 0%)", scale: 1, y: 0, transition: { delay: 2.1, duration: 1.0, ease: EASE } },
  };
  const word = (i: number): Variants => ({
    hidden: reduce ? { opacity: 0 } : { y: "120%" },
    show: reduce
      ? { opacity: 1, transition: { delay: 0.5 } }
      : { y: 0, transition: { delay: 3.2 + i * 0.1, duration: 0.82, ease: EASE } },
  });

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] overflow-hidden text-ivoire"
          style={{ background: "linear-gradient(180deg, #071812 0%, #05130e 46%, #04100b 78%, #061912 100%)" }}
          initial={reduce ? "show" : "hidden"}
          animate="show"
          exit={reduce ? { opacity: 0 } : { y: "-100%" }}
          transition={{ duration: reduce ? 0.55 : EXIT, ease: reduce ? EASE : LIFT }}
        >
          {/* Vignette — depth from shadow at the edges, never a central glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(130% 115% at 50% 34%, transparent 44%, rgba(0,0,0,0.5) 100%)" }}
          />

          {/* Film grain — texture */}
          {!reduce && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.1] mix-blend-soft-light"
              style={{ backgroundImage: GRAIN, backgroundRepeat: "repeat" }}
            />
          )}

          {/* Discovery — one cropped band of the Algerian palm grove along a low
              horizon, most of the artwork beyond the frame. */}
          <motion.div
            aria-hidden
            variants={grove}
            initial="hidden"
            animate="show"
            className="pointer-events-none absolute inset-x-0 top-[52%] flex justify-center select-none portrait:top-[60%]"
          >
            <NoorOasisArt className="block w-[128vw] max-w-none portrait:w-[220vw]" />
          </motion.div>

          {/* Brand block — the sky. A full-height column, biased upward so the
              mark sits above the grove. */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pb-[30vh] portrait:pb-[42vh]">
            {/* Story — the date of light. Tracks in, holds, recedes. */}
            <motion.p
              variants={storyV}
              initial="hidden"
              animate={dim ? "gone" : "show"}
              className="mb-7 font-sans uppercase text-champagne/80 md:mb-9"
              style={{ fontSize: "clamp(10px, 1.15vw, 13px)" }}
            >
              {story}
            </motion.p>

            {/* The mark — first light */}
            <motion.div variants={mark} initial="hidden" animate="show" className="will-change-transform">
              <NoorLogoArt className="block w-[clamp(172px,25vw,320px)]" />
            </motion.div>

            {/* The invitation — a line that rises word by word from a mask */}
            <p
              className="mt-8 flex flex-wrap justify-center gap-x-[0.3em] font-serif font-light italic text-champagne md:mt-10"
              style={{ fontSize: "clamp(18px, 2.4vw, 28px)", letterSpacing: "0.01em" }}
            >
              {words.map((w, i) => (
                <span key={i} className="inline-block overflow-hidden pb-[0.16em] -mb-[0.16em]">
                  <motion.span variants={word(i)} initial="hidden" animate="show" className="inline-block">
                    {w}
                  </motion.span>
                </span>
              ))}
            </p>
          </div>

          {/* Leading shadow — as the night lifts, its edge shades the light below */}
          {!reduce && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.3), transparent)" }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
