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

// The official gold lockup (نور over "noor"). Responsive widths per usage.
const WIDTH: Record<LogoSize, string> = {
  sm: "w-[84px] md:w-[94px]",
  md: "w-[116px] md:w-[130px]",
  lg: "w-[clamp(170px,20vw,224px)]",
};

/**
 * The Maison Noor wordmark — the official brand SVG, used directly, never
 * recreated. Two colourways from the same artwork (shapes untouched):
 *   "light" — "noor" in deep green + the نور calligraphy in gold (for cream
 *             surfaces: nav, checkout, account, welcome). The default.
 *   "gold"  — the all-gold mark, for the dark green surfaces (footer).
 * Sized responsively per placement. `mono` is kept for API compatibility.
 */
export function Logo({
  className,
  size = "sm",
  variant = "gold",
  compact = false,
}: {
  className?: string;
  size?: LogoSize;
  variant?: "light" | "gold";
  mono?: boolean;
  compact?: boolean;
}) {
  const s: LogoSize = compact ? "sm" : size;
  const src = variant === "gold" ? "/brand/noor-logo.svg" : "/brand/noor-logo-light.svg";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Maison Noor"
      draggable={false}
      className={clsx("block h-auto select-none", WIDTH[s], className)}
    />
  );
}
