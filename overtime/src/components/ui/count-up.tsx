"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

/** Counts to `value` once visible, then glides between later values. */
export function CountUp({ value, format = (n) => Math.round(n).toLocaleString("en-GB"), duration = 0.9, className }: { value: number; format?: (n: number) => string; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0 });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);
  const from = useRef(reduce ? value : 0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(value);
      return;
    }
    const controls = animate(from.current, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
      onComplete: () => (from.current = value),
    });
    return () => {
      from.current = value;
      controls.stop();
    };
  }, [value, inView, reduce, duration]);

  return (
    <span ref={ref} className={className}>
      {format(display)}
    </span>
  );
}
