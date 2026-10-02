"use client";

import Link from "next/link";
import { forwardRef, useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "signal" | "secondary" | "ghost" | "danger" | "inverse";
type Size = "sm" | "md" | "lg" | "xl";

const variants: Record<Variant, string> = {
  primary: "bg-ink-900 text-white hover:bg-ink-800 shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_1px_2px_rgba(11,16,32,0.2)]",
  signal: "bg-signal text-white hover:bg-signal-600 shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_8px_24px_-10px_rgba(227,18,43,0.6)]",
  secondary: "bg-white text-ink-900 hairline shadow-card hover:border-ink-900/15 hover:bg-ink-50",
  ghost: "text-ink-600 hover:text-ink-900 hover:bg-ink-900/[0.04]",
  danger: "bg-white text-signal-600 hairline hover:bg-signal-50 hover:border-signal/30",
  inverse: "bg-white text-ink-900 hover:bg-white/90",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-5 text-[15px] gap-2 rounded-xl",
  xl: "h-16 px-8 text-lg gap-3 rounded-2xl tracking-[-0.01em]",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  href?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, href, icon, iconRight, className, children, disabled, ...rest },
  ref,
) {
  const cls = cn(
    "group relative inline-flex select-none items-center justify-center whitespace-nowrap font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
    variants[variant],
    sizes[size],
    className,
  );
  const content = (
    <>
      {loading ? <Loader2 className="animate-spin" size={size === "xl" ? 20 : 16} aria-hidden /> : icon}
      {children}
      {iconRight && <span className="transition-transform duration-200 ease-out group-hover:translate-x-0.5">{iconRight}</span>}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {content}
      </Link>
    );
  }
  return (
    <button ref={ref} className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {content}
    </button>
  );
});

/** Subtle magnetic pull toward the cursor — for the one hero action on a screen. */
export function Magnetic({ children, strength = 0.18, className }: { children: React.ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 260, damping: 20, mass: 0.6 });
  const y = useSpring(useMotionValue(0), { stiffness: 260, damping: 20, mass: 0.6 });
  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      style={{ x, y }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
