"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { NoorLogoArt, NoorArabicArt } from "./BrandArt";
import { useStore } from "../lib/store";

/**
 * NOOR — the opening scene. Not a loading screen: a short brand film that runs
 * once per session and then opens onto the homepage.
 *
 * Art direction — "Ink, then Light". A dim, warm-emerald room. The نور
 * calligraphy is discovered in depth rather than displayed: a deep, out-of-focus
 * layer drifts in first, then a sharp layer draws itself across from the right
 * (the direction the pen travels) and bleeds off the lower corner — cropped,
 * asymmetric, tone-on-tone. The gold mark then resolves at the centre as the
 * destination of the sequence. After a held beat, a signature line rises word by
 * word from behind a mask. Finally the dark surface lifts away like a curtain,
 * revealing the cream homepage beneath — a continuation, not a cut.
 *
 * Depth is built from layering, a vignette and fine film grain — never a glow.
 * All brand artwork is inline SVG (BrandArt), so the first paint never depends on
 * a network fetch. The choreography is driven by framer VARIANTS with stable
 * string labels ("hidden"/"show"), so the store's hydration and geo re-renders
 * can't restart the delayed beats mid-sequence. GPU-only, reduced-motion aware,
 * with an intentionally simpler mobile composition.
 */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]; // settle
const LIFT: [number, number, number, number] = [0.7, 0, 0.2, 1]; // weighted curtain
const HOLD = 4.3; // full sequence before the curtain lifts
const EXIT = 1.05; // curtain lift

// Fine film grain — a texture layer, not an effect. Tiled SVG turbulence.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function Loader() {
  const { lang } = useStore();
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    if (sessionStorage.getItem("noor.entered")) return;
    setShow(true);
    document.body.style.overflow = "hidden";
    const release = () => {
      if (!document.body.dataset.noorGate) document.body.style.overflow = "";
    };
    const end = setTimeout(
      () => {
        setShow(false);
        sessionStorage.setItem("noor.entered", "1");
        release();
      },
      (reduce ? 1.6 : HOLD) * 1000,
    );
    return () => {
      clearTimeout(end);
      release();
    };
  }, [reduce]);

  const words = (lang === "pl" ? "Witaj w świetle" : "Enjoy the experience").split(" ");

  // Variants — stable labels, immune to re-render restarts.
  const grainV: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 0.11, transition: { duration: 1.0, ease: EASE } },
  };
  const deepV: Variants = {
    hidden: { opacity: 0, clipPath: "inset(0% 100% 0% 0%)", scale: 1.12 },
    show: { opacity: 0.06, clipPath: "inset(0% 0% 0% 0%)", scale: 1, transition: { delay: 0.2, duration: 1.5, ease: EASE } },
  };
  const discV: Variants = {
    hidden: { opacity: 0, clipPath: "inset(0% 0% 0% 100%)", scale: 1.06 },
    show: { opacity: 0.19, clipPath: "inset(0% 0% 0% 0%)", scale: 1, transition: { delay: 0.5, duration: 1.6, ease: EASE } },
  };
  const markV: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, clipPath: "inset(100% 0% 0% 0%)", scale: 1.03, y: 12 },
    show: reduce
      ? { opacity: 1, transition: { duration: 0.5 } }
      : { opacity: 1, clipPath: "inset(0% 0% 0% 0%)", scale: 1, y: 0, transition: { delay: 1.5, duration: 1.0, ease: EASE } },
  };
  const wordV = (i: number): Variants => ({
    hidden: reduce ? { opacity: 0 } : { y: "118%" },
    show: reduce
      ? { opacity: 1, transition: { delay: 0.5 } }
      : { y: 0, transition: { delay: 2.7 + i * 0.11, duration: 0.85, ease: EASE } },
  });

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] overflow-hidden text-ivoire"
          style={{ background: "linear-gradient(178deg, #0b241b 0%, #082019 32%, #061a14 64%, #04100a 100%)" }}
          initial={{ y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: "-100%" }}
          transition={{ duration: reduce ? 0.6 : EXIT, ease: reduce ? EASE : LIFT }}
        >
          {/* Atmosphere — a vignette carries the depth the old glow faked */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(125% 105% at 50% 40%, transparent 42%, rgba(0,0,0,0.42) 100%)" }}
          />

          {/* Fine film grain — texture, settled in, not animated */}
          {!reduce && (
            <motion.div
              aria-hidden
              variants={grainV}
              initial="hidden"
              animate="show"
              className="pointer-events-none absolute inset-0 mix-blend-soft-light"
              style={{ backgroundImage: GRAIN, backgroundRepeat: "repeat" }}
            />
          )}

          {/* Depth layer — an out-of-focus fragment of the calligraphy, top-left,
              heavily cropped. Establishes the room before anything is legible. */}
          {!reduce && (
            <motion.div
              aria-hidden
              variants={deepV}
              initial="hidden"
              animate="show"
              className="pointer-events-none absolute -left-[24%] -top-[20%] w-[min(150vw,1560px)] rotate-180 select-none portrait:hidden"
              style={{ filter: "blur(3px)" }}
            >
              <NoorArabicArt className="block w-full" />
            </motion.div>
          )}

          {/* Discovery layer — the sharp calligraphy draws itself in from the
              right (pen direction) and bleeds off the lower corner. */}
          {!reduce && (
            <motion.div
              aria-hidden
              variants={discV}
              initial="hidden"
              animate="show"
              className="pointer-events-none absolute -bottom-[12%] -right-[14%] w-[min(116vw,1240px)] select-none portrait:-bottom-[6%] portrait:-right-[34%] portrait:w-[208vw]"
            >
              <NoorArabicArt className="block w-full" />
            </motion.div>
          )}

          {/* Brand block — the logo resolves as the destination; the line rises
              word by word after a held beat. */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
            <motion.div variants={markV} initial="hidden" animate="show" className="will-change-transform">
              <NoorLogoArt className="block w-[clamp(178px,27vw,352px)]" />
            </motion.div>

            <p
              className="mt-9 flex flex-wrap justify-center gap-x-[0.3em] font-serif font-light italic text-champagne md:mt-11"
              style={{ fontSize: "clamp(19px, 2.7vw, 32px)", letterSpacing: "0.01em" }}
            >
              {words.map((w, i) => (
                <span key={i} className="inline-block overflow-hidden pb-[0.16em] -mb-[0.16em]">
                  <motion.span variants={wordV(i)} initial="hidden" animate="show" className="inline-block">
                    {w}
                  </motion.span>
                </span>
              ))}
            </p>
          </div>

          {/* Leading shadow — as the curtain lifts, its bottom edge casts a soft
              shadow over the homepage revealed beneath. */}
          {!reduce && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.28), transparent)" }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
