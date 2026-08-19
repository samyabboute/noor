"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Logo } from "./Logo";
import { useStore } from "../lib/store";

/**
 * The opening scene of the Noor world — not a loading screen, a curtain-raiser.
 *
 * Two acts:
 *   Act I — compose. The نور calligraphy sweeps in from the bottom-right as a
 *   gold ribbon; the gold Noor logo rises from behind a clip at the centre; a
 *   mirrored ribbon answers from the top-left, framing the mark diagonally.
 *   Act II — the line. Every element then leaves the way it arrived, in reverse,
 *   while a single line of welcome takes the centre — larger, in an elegant
 *   Cormorant italic, unblurring into place slowly. When the line stands alone,
 *   the dark surface fades and the luminous cream homepage crossfades in.
 *
 * A soft dissolve into the light (nūr = light), never a hard cut.
 *
 * Brand assets, used directly as SVG:
 *   /brand/noor-logo.svg              — the primary logo (the hero)
 *   /brand/noor-arabic-background.svg — the Arabic calligraphy (the ribbons)
 * If either fails to load it falls back to the house wordmark, so the loader is
 * never broken.
 *
 * GPU-friendly (transform / opacity / clip-path / filter), one framer timeline
 * driven by a phase, once per session, reduced-motion aware.
 */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const PHASE2_AT = 2.7; // when the elements reverse out and the line takes over
const HOLD = 5.4; // full timeline before the curtain fades
const EXIT = 1.05; // crossfade into the homepage

const LOGO_SRC = "/brand/noor-logo.svg";
const ART_SRC = "/brand/noor-arabic-background.svg";

export default function Loader() {
  const { lang } = useStore();
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState(0); // 0 = compose, 1 = the line takes over
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
    const p2 = setTimeout(() => setPhase(1), (reduce ? 1.1 : PHASE2_AT) * 1000);
    const end = setTimeout(
      () => {
        setShow(false);
        sessionStorage.setItem("noor.entered", "1");
        release();
      },
      (reduce ? 2.4 : HOLD) * 1000,
    );
    return () => {
      clearTimeout(p2);
      clearTimeout(end);
      release();
    };
  }, [reduce]);

  const line = lang === "pl" ? "Witaj w świetle" : "Enjoy the experience";

  // Ribbon: wipes in left→right in Act I, un-wipes on the way out in Act II.
  const ribbon = (o: number) => ({
    initial: { opacity: 0, clipPath: "inset(0% 100% 0% 0%)" },
    animate: phase === 0 ? { opacity: o, clipPath: "inset(0% 0% 0% 0%)" } : { opacity: 0, clipPath: "inset(0% 100% 0% 0%)" },
  });

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
          {/* Warm pool of light at the centre — a halo the line rests upon */}
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

          {/* Beat 1 — the bottom-right ribbon (leaves last-in / first-out feel) */}
          {!reduce && !artErr && (
            <motion.img
              src={ART_SRC}
              alt=""
              aria-hidden
              draggable={false}
              onError={() => setArtErr(true)}
              className="pointer-events-none absolute -bottom-[6%] -right-[8%] w-[min(120vw,1180px)] max-w-none select-none portrait:w-[190vw]"
              {...ribbon(0.22)}
              transition={phase === 0 ? { delay: 0.1, duration: 1.2, ease: EASE } : { duration: 0.9, ease: EASE }}
            />
          )}

          {/* Beat 3 — the top-left ribbon, mirrored */}
          {!reduce && !artErr && (
            <motion.img
              src={ART_SRC}
              alt=""
              aria-hidden
              draggable={false}
              className="pointer-events-none absolute -top-[6%] -left-[8%] w-[min(120vw,1180px)] max-w-none rotate-180 select-none portrait:w-[190vw]"
              {...ribbon(0.16)}
              transition={phase === 0 ? { delay: 1.25, duration: 1.2, ease: EASE } : { duration: 0.9, ease: EASE }}
            />
          )}

          {/* Beat 2 — the logo rises, then sinks back the way it came */}
          <motion.div
            className="absolute inset-0 z-10 flex items-center justify-center will-change-transform"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, clipPath: "inset(100% 0% 0% 0%)" }}
            animate={
              reduce
                ? { opacity: phase === 0 ? 1 : 0 }
                : phase === 0
                  ? { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" }
                  : { opacity: 0, y: 22, clipPath: "inset(100% 0% 0% 0%)" }
            }
            transition={
              phase === 0
                ? { duration: reduce ? 0.5 : 1.0, delay: reduce ? 0 : 0.6, ease: EASE }
                : { duration: reduce ? 0.4 : 0.9, ease: EASE }
            }
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

          {/* Act II — the line takes the centre, larger, elegant, unhurried */}
          <motion.div
            className="absolute inset-0 z-20 flex items-center justify-center px-6"
            initial={{ opacity: 0, scale: 0.96, y: 10, filter: "blur(7px)" }}
            animate={phase === 1 ? { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, scale: 0.96, y: 10, filter: "blur(7px)" }}
            transition={{ duration: reduce ? 0.7 : 1.8, ease: EASE }}
          >
            <p
              className="display max-w-[86vw] text-center font-serif font-light italic text-champagne"
              style={{ fontSize: "clamp(30px, 5.4vw, 64px)", letterSpacing: "0.01em" }}
            >
              {line}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
