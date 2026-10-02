"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

export function ProgressBar({ value, tone = "ink", className, label, height = 6 }: { value: number; tone?: "ink" | "covered" | "signal"; className?: string; label?: string; height?: number }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v * 100)}
      className={cn("relative w-full overflow-hidden rounded-full bg-ink-900/[0.06]", className)}
      style={{ height }}
    >
      <motion.div
        className={cn("absolute inset-y-0 left-0 rounded-full", tone === "ink" ? "bg-ink-900" : tone === "covered" ? "bg-covered" : "bg-signal")}
        initial={{ width: 0 }}
        animate={{ width: `${v * 100}%` }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

/** Coverage ring. `segments` lets confirmed (solid) and pending (faint) share the ring. */
export function RadialProgress({
  value,
  secondary = 0,
  size = 220,
  stroke = 10,
  children,
  tone = "covered",
  dark,
  label,
}: {
  value: number;
  secondary?: number;
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
  tone?: "covered" | "signal" | "ink";
  dark?: boolean;
  label?: string;
}) {
  const reduce = useReducedMotion();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  const s = Math.max(0, Math.min(1 - v, secondary));
  const color = tone === "covered" ? "#0E8A5F" : tone === "signal" ? "#E3122B" : dark ? "#FFFFFF" : "#0B1020";
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }} role="img" aria-label={label || `${Math.round(v * 100)}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={dark ? "rgba(255,255,255,0.1)" : "rgba(11,16,32,0.06)"} strokeWidth={stroke} />
        {s > 0 && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={dark ? "rgba(255,255,255,0.28)" : "rgba(11,16,32,0.14)"}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c * (1 - (v + s)) }}
            transition={{ duration: reduce ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - v) }}
          transition={{ duration: reduce ? 0 : 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}
