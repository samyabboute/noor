"use client";

import { MotionConfig } from "framer-motion";
import { ToastProvider } from "./ui/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
      <ToastProvider>{children}</ToastProvider>
    </MotionConfig>
  );
}
