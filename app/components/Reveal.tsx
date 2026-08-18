"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "span" | "li" | "figure" | "section";
  /**
   * "fade" — the block settles up from below (default, for paragraphs/cards).
   * "mask" — the content rises out from behind a clip (for display headings).
   */
  variant?: "fade" | "mask";
}

// The single NOOR easing. Everything shares it, so motion reads as one hand.
const EASE = [0.16, 1, 0.3, 1] as const;
const VIEWPORT = { once: true, margin: "-12% 0px -12% 0px" } as const;

/**
 * The one reveal primitive for the whole site — one easing, one rhythm, one
 * place where reduced-motion is honoured. Headings use `variant="mask"` so the
 * line rises from behind a clip; everything else settles up on a soft fade.
 */
export default function Reveal({ children, delay = 0, y = 24, className, as = "div", variant = "fade" }: RevealProps) {
  const reduce = useReducedMotion();

  if (variant === "mask") {
    // The observer must watch the *unclipped* clip container (which is always
    // in view). It then propagates the reveal, via variants, to the inner line
    // — which starts translated out of the clip, so it can't be observed itself.
    const child = reduce
      ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
      : { hidden: { opacity: 0, y: 120 }, show: { opacity: 1, y: 0 } };
    return (
      <motion.div
        className={`overflow-hidden pb-[0.16em] -mb-[0.16em] ${className ?? ""}`}
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
      >
        <motion.div className="will-change-transform" variants={child} transition={{ duration: 1.15, delay, ease: EASE }}>
          {children}
        </motion.div>
      </motion.div>
    );
  }

  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 1.1, delay, ease: EASE }}
    >
      {children}
    </MotionTag>
  );
}
