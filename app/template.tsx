"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * A quiet page transition: content settles in with a soft fade on every route
 * change. Opacity only — no layout shift, no scroll fight, and skipped entirely
 * under prefers-reduced-motion.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
