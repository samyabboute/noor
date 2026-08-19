"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Logo } from "./Logo";
import NoorPattern from "./NoorPattern";

/**
 * The opening scene of the Noor world — not a loading screen.
 *
 * A near-empty cream canvas. The Arabic brand artwork rises as a large,
 * bleeding signature texture (masked reveal + a slow settle), and the Noor
 * wordmark emerges from behind a clip — deliberate, calm, editorial. It holds,
 * then the whole surface recedes and fades into the homepage (cream → cream),
 * so the loader and the site feel like one continuous entrance.
 *
 * Brand assets are used directly as SVG when present:
 *   /brand/noor-logo.svg              — the primary logo (the hero)
 *   /brand/noor-arabic-background.svg — the Arabic brand artwork (the texture)
 * Until those files exist the loader falls back — invisibly — to the current
 * wordmark and the house arabesque, so it is never broken.
 *
 * GPU-friendly (transform / opacity / clip-path only), one framer timeline,
 * once per session, and reduced-motion aware.
 */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const HOLD = 2.3; // total visible seconds before the world opens

const LOGO_SRC = "/brand/noor-logo.svg";
const ART_SRC = "/brand/noor-arabic-background.svg";

export default function Loader() {
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [logoOk, setLogoOk] = useState(false); // the real logo SVG resolved
  const [artOk, setArtOk] = useState(false); // the real artwork SVG resolved

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
          {/* ── Arabic brand artwork — a large, bleeding signature texture ── */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.12 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.06 }}
            transition={{ duration: reduce ? 0.5 : 2.1, ease: EASE }}
          >
            {/* real artwork (revealed once loaded) */}
            <motion.img
              src={ART_SRC}
              alt=""
              aria-hidden
              draggable={false}
              onLoad={() => setArtOk(true)}
              onError={() => setArtOk(false)}
              className="absolute left-1/2 top-1/2 w-[min(150vw,1500px)] max-w-none -translate-x-1/2 -translate-y-1/2 select-none portrait:w-[210vw]"
              style={{ display: artOk ? "block" : "none" }}
              initial={reduce ? { opacity: 0 } : { opacity: 0, clipPath: "inset(0% 0% 100% 0%)" }}
              animate={reduce ? { opacity: 0.07 } : { opacity: 0.07, clipPath: "inset(0% 0% 0% 0%)" }}
              transition={{ duration: reduce ? 0.5 : 2, ease: EASE }}
            />
            {/* fallback texture until the artwork exists */}
            {!artOk && <NoorPattern placement="full" color="#122A20" opacity={0.05} scale={170} />}
          </motion.div>

          {/* ── The logo — the hero, rising from behind a clip ── */}
          <motion.div
            className="relative z-10 will-change-transform"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20, clipPath: "inset(100% 0% 0% 0%)" }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" }}
            transition={{ duration: reduce ? 0.5 : 1.15, delay: reduce ? 0 : 0.5, ease: EASE }}
          >
            {/* real logo (shown once loaded), else the house wordmark */}
            <img
              src={LOGO_SRC}
              alt="Maison Noor"
              draggable={false}
              onLoad={() => setLogoOk(true)}
              onError={() => setLogoOk(false)}
              className="block h-auto w-[clamp(160px,26vw,340px)]"
              style={{ display: logoOk ? "block" : "none" }}
            />
            {!logoOk && (
              <div className="scale-[1.15] sm:scale-125">
                <Logo size="lg" className="text-ink" />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
