import clsx from "clsx";

/**
 * The Maison Noor mark: a four-point radiance — a single point of light.
 * Kept for favicons, the admin chrome and any place too small for the
 * full wordmark. Ownable, symmetrical, legible at 16px.
 */
export function NoorMark({ className, stroke = "currentColor" }: { className?: string; stroke?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path
        d="M20 2 C21 13 27 19 38 20 C27 21 21 27 20 38 C19 27 13 21 2 20 C13 19 19 13 20 2 Z"
        fill={stroke}
      />
    </svg>
  );
}

type LogoSize = "sm" | "md" | "lg";

const NOOR: Record<LogoSize, string> = {
  sm: "text-[22px] md:text-[24px]",
  md: "text-[30px] md:text-[34px]",
  lg: "text-[52px] md:text-[64px]",
};
const ARABIC: Record<LogoSize, string> = {
  sm: "text-[15px] md:text-[16px] -mb-[7px] md:-mb-[8px]",
  md: "text-[20px] md:text-[22px] -mb-[9px] md:-mb-[10px]",
  lg: "text-[34px] md:text-[40px] -mb-[15px] md:-mb-[18px]",
};

/**
 * The house wordmark: the calligraphic نور (nûr — "light") resting above the
 * lower-case serif "noor". One ink by default (`mono`), or with the نور in gold
 * for the signature Vert & Or lockup. Recolours with the surrounding text
 * colour, so it works on cream, on emerald, or embossed in gold.
 */
export function Logo({
  className,
  size = "sm",
  mono = false,
  // Back-compat with earlier call sites.
  compact = false,
}: {
  className?: string;
  size?: LogoSize;
  mono?: boolean;
  compact?: boolean;
}) {
  const s: LogoSize = compact ? "sm" : size;
  return (
    <span
      className={clsx("inline-flex select-none flex-col items-center leading-none", className)}
      aria-label="Maison Noor"
    >
      <span
        lang="ar"
        dir="rtl"
        aria-hidden="true"
        className={clsx("font-arabic font-normal leading-none", ARABIC[s], mono ? "text-current" : "text-or")}
      >
        نور
      </span>
      <span className={clsx("font-serif font-bold lowercase leading-none tracking-[0.01em]", NOOR[s])}>
        noor
      </span>
    </span>
  );
}
