"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Logo } from "./Logo";

/**
 * Entrance ritual — a fast, black curtain with the NOOR mark and a thin gold
 * line that fills once, then lifts. Shown once per session (never blocks the
 * user artificially). Content renders beneath, so SEO/reduced-motion are safe.
 */
export default function Loader() {
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (reduce) return;
    if (pathname?.startsWith("/admin")) return;
    if (sessionStorage.getItem("noor.entered")) return;
    setShow(true);
    document.body.style.overflow = "hidden";
    const release = () => {
      // Don't release the scroll lock if the welcome gate is holding it.
      if (!document.body.dataset.noorGate) document.body.style.overflow = "";
    };
    const t = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem("noor.entered", "1");
      release();
    }, 1300);
    return () => {
      clearTimeout(t);
      release();
    };
  }, [reduce]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#05130e]"
          initial={{ opacity: 1 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-5"
          >
            <Logo size="lg" className="text-ivoire" />
          </motion.div>

          <div className="mt-8 h-px w-40 overflow-hidden bg-ivoire/15">
            <motion.div
              className="h-full bg-or"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.05, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-6 font-sans text-[10px] uppercase tracking-[0.4em] text-ivoire/50"
          >
            The Date of Light
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
