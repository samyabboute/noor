"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Logo } from "./Logo";
import { useStore } from "../lib/store";

/**
 * The opening scene of the Noor world — not a loading screen, a curtain-raiser.
 *
 * A deep-emerald gateway that stages itself in four beats before opening onto
 * the luminous cream homepage:
 *   1. the نور calligraphy sweeps in from the bottom-right as a gold ribbon,
 *   2. the gold Noor logo rises from behind a clip at the centre,
 *   3. a second ribbon answers from the top-left, framing the mark diagonally,
 *   4. a quiet line of welcome settles beneath it,
 * then a warm cream light blooms from the centre and the dark surface lifts
 * away — a soft dissolve into the light (nūr = light), never a hard cut.
 *
 * Brand assets, used directly as SVG:
 *   /brand/noor-logo.svg              — the primary logo (the hero)
 *   /brand/noor-arabic-background.svg — the Arabic calligraphy (the ribbons)
 * If either fails to load it falls back to the house wordmark, so the loader is
 * never broken.
 *
 * GPU-friendly (transform / opacity / clip-path only), one framer timeline,
 * once per session, reduced-motion aware.
 */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const HOLD = 4.3; // full timeline before the curtain lifts
const EXIT = 1.15; // gentle dissolve into the homepage

const LOGO_SRC = "/brand/noor-logo.svg";
const ART_SRC = "/brand/noor-arabic-background.svg";

export default function Loader() {
  const { lang } = useStore();
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [logoErr, setLogoErr] = useState(false);
  const [artErr, setArtErr] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    if (sessionStorage.getItem("noor.entered")) return;
    setShow(true);
    document.body.style.overflow = "hidden";
    const release = () => {
      if (!document.body.dataset.noorGate) document.body.style.overflow = "";
    };
    const t = setTimeout(
      () => {
        setShow(false);
        sessionStorage.setItem("noor.entered", "1");
        release();
      },
      (reduce ? 1.5 : HOLD) * 1000,
    );
    return () => {
      clearTimeout(t);
      release();
    };
  }, [reduce]);

  const welcome = lang === "pl" ? "Witaj w świecie Noor" : "Enjoy the experience";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden text-ivoire"
          style={{ background: "radial-gradient(120% 90% at 50% 42%, #123227 0%, #0a1f18 55%, #05130e 100%)" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.6 : EXIT, ease: EASE }}
        >
          {/* Warm pool of light gathering at the centre */}
          {!reduce && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ background: "radial-gradient(closest-side, rgba(216,190,126,0.22), rgba(194,162,90,0.06), transparent 72%)" }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1.05 }}
              transition={{ duration: 2.6, ease: EASE }}
            />
          )}

          {/* Beat 1 — the bottom-right ribbon sweeps in first */}
          {!reduce &&
            !artErr && (
              <motion.img
                src={ART_SRC}
                alt=""
                aria-hidden
                draggable={false}
                onError={() => setArtErr(true)}
                className="pointer-events-none absolute -bottom-[6%] -right-[8%] w-[min(120vw,1180px)] max-w-none select-none portrait:w-[190vw]"
                initial={{ opacity: 0, clipPath: "inset(0% 100% 0% 0%)" }}
                animate={{ opacity: 0.22, clipPath: "inset(0% 0% 0% 0%)" }}
                transition={{ delay: 0.1, duration: 1.3, ease: EASE }}
              />
            )}

          {/* Beat 3 — the top-left ribbon answers, framing the mark */}
          {!reduce &&
            !artErr && (
              <motion.img
                src={ART_SRC}
                alt=""
                aria-hidden
                draggable={false}
                className="pointer-events-none absolute -top-[6%] -left-[8%] w-[min(120vw,1180px)] max-w-none rotate-180 select-none portrait:w-[190vw]"
                initial={{ opacity: 0, clipPath: "inset(0% 100% 0% 0%)" }}
                animate={{ opacity: 0.16, clipPath: "inset(0% 0% 0% 0%)" }}
                transition={{ delay: 1.4, duration: 1.3, ease: EASE }}
              />
            )}

          {/* Beat 2 — the logo rises from behind a clip at the centre */}
          <motion.div
            className="relative z-10 flex items-center justify-center will-change-transform"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, clipPath: "inset(100% 0% 0% 0%)" }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" }}
            transition={{ duration: reduce ? 0.5 : 1.1, delay: reduce ? 0 : 0.7, ease: EASE }}
          >
            {logoErr ? (
              <div className="scale-125">
                <Logo size="lg" variant="gold" />
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={LOGO_SRC}
                alt="Maison Noor"
                draggable={false}
                onError={() => setLogoErr(true)}
                className="block h-auto w-[clamp(190px,30vw,380px)]"
              />
            )}
          </motion.div>

          {/* Beat 4 — a quiet line of welcome settles beneath the mark */}
          <motion.p
            className="absolute left-1/2 bottom-[24%] z-10 -translate-x-1/2 whitespace-nowrap px-6 text-center font-sans text-[10px] uppercase tracking-[0.42em] text-champagne/80 md:text-[11px]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduce ? 0.55 : 2.55, duration: reduce ? 0.5 : 0.85, ease: EASE }}
          >
            {welcome}
          </motion.p>

          {/* The curtain lift — a cream light blooms from the centre on exit,
              bridging the deep green to the luminous cream homepage. */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmax] w-[70vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: "radial-gradient(closest-side, #FFFDF7 0%, #FCFBF8 45%, rgba(252,251,248,0) 72%)" }}
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{ opacity: 0, scale: 0.2 }}
            exit={{ opacity: 1, scale: 3 }}
            transition={{ duration: reduce ? 0.6 : EXIT, ease: EASE }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
