"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Logo } from "./Logo";

/**
 * The opening scene of the Noor world — not a loading screen.
 *
 * On a calm cream canvas the Arabic نور calligraphy writes itself across as a
 * large, bleeding gold signature; a soft pool of light warms the centre; and
 * the full Noor logo rises from behind a clip. It holds a beat, then the whole
 * surface recedes and fades into the homepage (cream → cream) as one entrance.
 *
 * Brand assets, used directly as SVG:
 *   /brand/noor-logo.svg              — the primary logo (the hero)
 *   /brand/noor-arabic-background.svg — the Arabic calligraphy (the signature)
 * If either ever fails to load, it falls back invisibly to the house wordmark,
 * so the loader is never broken.
 *
 * GPU-friendly (transform / opacity / clip-path only), one framer timeline,
 * once per session, ~2.3s, reduced-motion aware.
 */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const HOLD = 2.3;

const LOGO_SRC = "/brand/noor-logo.svg";
const ART_SRC = "/brand/noor-arabic-background.svg";

export default function Loader() {
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
      (reduce ? 1.1 : HOLD) * 1000,
    );
    return () => {
      clearTimeout(t);
      release();
    };
  }, [reduce]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-paper"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: reduce ? 1 : 1.03 }}
          transition={{ duration: reduce ? 0.5 : 0.85, ease: EASE }}
        >
          {/* Soft pool of light — the gold, lifted */}
          {!reduce && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-[75vmin] w-[75vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ background: "radial-gradient(closest-side, rgba(194,162,90,0.15), transparent 70%)" }}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1.05 }}
              transition={{ duration: 2.2, ease: EASE }}
            />
          )}

          {/* Arabic calligraphy — writes itself across, a large bleeding signature */}
          {!reduce &&
            (artErr ? null : (
              <motion.img
                src={ART_SRC}
                alt=""
                aria-hidden
                draggable={false}
                onError={() => setArtErr(true)}
                className="pointer-events-none absolute left-1/2 top-1/2 w-[min(185vw,1650px)] max-w-none -translate-x-1/2 -translate-y-1/2 select-none portrait:w-[270vw]"
                initial={{ opacity: 0, scale: 1.08, clipPath: "inset(0% 100% 0% 0%)" }}
                animate={{ opacity: 0.14, scale: 1, clipPath: "inset(0% 0% 0% 0%)" }}
                transition={{ duration: 2, ease: EASE }}
              />
            ))}

          {/* The logo — the hero, rising from behind a clip */}
          <motion.div
            className="relative z-10 flex items-center justify-center will-change-transform"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, clipPath: "inset(100% 0% 0% 0%)" }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" }}
            transition={{ duration: reduce ? 0.5 : 1.15, delay: reduce ? 0 : 0.55, ease: EASE }}
          >
            {logoErr ? (
              <div className="scale-125">
                <Logo size="lg" className="text-ink" />
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
