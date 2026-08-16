"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Photo from "./Photo";

/**
 * The date filmed like a jewel: a macro Deglet Nour that turns gently and
 * catches a raking light as it scrolls through view — light revealing texture.
 * A 2D asset given dimension with a small rotateY + a moving specular sweep.
 */
export default function MacroDate({ src, alt }: { src: string; alt: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const rotY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-16, 16]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], reduce ? [1, 1, 1] : [0.9, 1.04, 0.94]);
  const sweepX = useTransform(scrollYProgress, [0.1, 0.9], ["-45%", "145%"]);

  return (
    <div ref={ref} className="relative overflow-hidden" style={{ perspective: 1200 }}>
      <motion.div style={{ rotateY: reduce ? 0 : rotY, scale, transformStyle: "preserve-3d" }}>
        <Photo src={src} alt={alt} className="aspect-square w-full" />
      </motion.div>
      {!reduce && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 mix-blend-screen"
          style={{
            x: sweepX,
            background: "linear-gradient(105deg, transparent 44%, rgba(244,227,173,0.3) 50%, transparent 56%)",
          }}
        />
      )}
    </div>
  );
}
