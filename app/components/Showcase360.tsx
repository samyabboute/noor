"use client";

import { useRef, type CSSProperties } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useStore } from "../lib/store";

/* Coffret dimensions (px) — a wide, shallow luxury case. */
const W = 360; // width (front face)
const H = 148; // height
const D = 250; // depth

function face(w: number, h: number, transform: string): CSSProperties {
  return {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: w,
    height: h,
    marginLeft: -w / 2,
    marginTop: -h / 2,
    transform,
    backfaceVisibility: "hidden",
  };
}

const sideStyle: CSSProperties = {
  background: "linear-gradient(150deg, #1a4636 0%, #103128 55%, #0a1f18 100%)",
  boxShadow: "inset 0 0 0 1px rgba(194,162,90,0.35), inset 0 0 60px rgba(0,0,0,0.5)",
};

function GoldMark({ size = 30 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      <path
        d="M20 2 C21 13 27 19 38 20 C27 21 21 27 20 38 C19 27 13 21 2 20 C13 19 19 13 20 2 Z"
        fill="#D8BE7E"
      />
    </svg>
  );
}

function SideFace({ transform }: { transform: string }) {
  return (
    <div style={{ ...face(W, H, transform), ...sideStyle }}>
      <div className="flex h-full w-full flex-col items-center justify-center gap-2">
        <GoldMark />
        <span className="font-serif text-[13px] tracking-[0.28em] text-champagne">MAISON NOOR</span>
        <span className="mt-1 font-sans text-[8px] uppercase tracking-[0.3em] text-or/70">Deglet Nour</span>
      </div>
      {/* gold hairline frame */}
      <span className="pointer-events-none absolute inset-3 rounded-[2px] border border-or/25" />
    </div>
  );
}

function EndFace({ transform }: { transform: string }) {
  return (
    <div style={{ ...face(D, H, transform), ...sideStyle }}>
      <div className="flex h-full w-full items-center justify-center">
        <GoldMark size={22} />
      </div>
    </div>
  );
}

/* Back face — mark only (a symmetric glyph never reads mirrored). */
function MarkFace({ transform }: { transform: string }) {
  return (
    <div style={{ ...face(W, H, transform), ...sideStyle }}>
      <div className="flex h-full w-full items-center justify-center">
        <GoldMark size={30} />
      </div>
      <span className="pointer-events-none absolute inset-3 rounded-[2px] border border-or/25" />
    </div>
  );
}

export default function Showcase360() {
  const { lang } = useStore();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const rotateY = useTransform(scrollYProgress, [0, 1], [-24, 360]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [14, 20, 14]);
  const scale = useTransform(scrollYProgress, [0, 0.14, 0.86, 1], [0.82, 1, 1, 0.92]);
  const shadowScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1.05, 0.9]);

  const cap1 = useTransform(scrollYProgress, [0.06, 0.16, 0.28, 0.36], [0, 1, 1, 0]);
  const cap2 = useTransform(scrollYProgress, [0.4, 0.5, 0.6, 0.68], [0, 1, 1, 0]);
  const cap3 = useTransform(scrollYProgress, [0.72, 0.82, 0.94, 1], [0, 1, 1, 0]);
  const progress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const captions = [
    { o: cap1, k: lang === "pl" ? "Każda strona dopracowana." : "Every side considered." },
    { o: cap2, k: lang === "pl" ? "Wieczko tłoczone złotem." : "A lid embossed in gold." },
    { o: cap3, k: lang === "pl" ? "W środku — Deglet Nour." : "Inside — Deglet Nour." },
  ];

  return (
    <section ref={ref} className="relative bg-nuit" style={{ height: reduce ? "auto" : "300vh" }}>
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden">
        {/* ambient light from above */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(60% 45% at 50% 24%, rgba(216,190,126,0.16), transparent 62%)" }}
        />

        {/* heading */}
        <div className="relative z-10 mb-16 text-center md:mb-24">
          <p className="eyebrow">{lang === "pl" ? "Obiekt" : "The Object"}</p>
          <h2 className="display mt-3 text-4xl md:text-6xl">
            {lang === "pl" ? "Obróć, by odkryć" : "Turn to discover"}
          </h2>
        </div>

        {/* the 3D stage */}
        <div className="relative flex scale-[0.6] items-center justify-center sm:scale-90 md:scale-100">
          <div style={{ perspective: 1500, perspectiveOrigin: "50% 40%" }}>
            <motion.div
              style={{
                width: W,
                height: H,
                transformStyle: "preserve-3d",
                rotateY: reduce ? -24 : rotateY,
                rotateX: reduce ? 14 : rotateX,
                scale: reduce ? 1 : scale,
                position: "relative",
              }}
            >
              {/* 4 sides — front branded, back mark-only */}
              <SideFace transform={`rotateY(0deg) translateZ(${D / 2}px)`} />
              <MarkFace transform={`rotateY(180deg) translateZ(${D / 2}px)`} />
              <EndFace transform={`rotateY(90deg) translateZ(${W / 2}px)`} />
              <EndFace transform={`rotateY(-90deg) translateZ(${W / 2}px)`} />

              {/* top — ivory tray with Deglet Nour */}
              <div
                style={{
                  ...face(W, D, `rotateX(90deg) translateZ(${H / 2}px)`),
                  background: "linear-gradient(160deg, #F4EEE0 0%, #E4D9C2 100%)",
                  boxShadow: "inset 0 0 0 1px rgba(194,162,90,0.5)",
                }}
              >
                <div className="grid h-full w-full grid-cols-4 content-center gap-2 p-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <span
                      key={i}
                      className="mx-auto h-6 w-9 rounded-[45%]"
                      style={{
                        background: "radial-gradient(circle at 38% 32%, #C99A6A, #7A5A34 60%, #3A2818)",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* bottom */}
              <div
                style={{
                  ...face(W, D, `rotateX(-90deg) translateZ(${H / 2}px)`),
                  background: "#081a13",
                }}
              />
            </motion.div>
          </div>

          {/* floor shadow */}
          <motion.div
            className="pointer-events-none absolute -bottom-16 left-1/2 -z-10 h-16 w-[420px] -translate-x-1/2 rounded-[50%]"
            style={{
              scaleX: reduce ? 1 : shadowScale,
              background: "radial-gradient(closest-side, rgba(0,0,0,0.55), transparent)",
              filter: "blur(10px)",
            }}
          />
        </div>

        {/* rotating captions */}
        <div className="relative z-10 mt-16 h-6 w-full max-w-xl text-center md:mt-24">
          {captions.map((c, i) => (
            <motion.p
              key={i}
              style={{ opacity: reduce ? (i === 0 ? 1 : 0) : c.o }}
              className="absolute inset-x-0 whitespace-nowrap font-serif text-lg italic text-champagne"
            >
              {c.k}
            </motion.p>
          ))}
        </div>

        {/* scroll progress hairline */}
        {!reduce && (
          <div className="absolute bottom-8 left-1/2 h-px w-40 -translate-x-1/2 overflow-hidden bg-ivoire/15">
            <motion.div className="h-full bg-or" style={{ width: progress }} />
          </div>
        )}
      </div>
    </section>
  );
}
