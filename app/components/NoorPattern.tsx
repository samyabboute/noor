import type { CSSProperties } from "react";
import clsx from "clsx";

/**
 * NoorPattern — the house arabesque, as a *texture*, never a decoration.
 *
 * A single, tiny tileable SVG (an 8-fold geometric lattice inspired by the
 * brand key art) is tinted ton-sur-ton and revealed only toward the edges of a
 * section through a soft gradient mask, so the centre stays clean and the motif
 * is discovered rather than seen. Rule of the house: subtlety > visibility.
 *
 * - Pure CSS/SVG (one small data-URI, GPU-tiled) → no image request, no weight.
 * - `opacity` is clamped to ≤ 0.08; 0.03–0.06 is the intended range.
 * - Responsive: intensity + scale step down on tablet/mobile (see globals.css).
 *
 * Usage: give the parent `relative isolate overflow-hidden`, then drop
 *   <NoorPattern placement="sides" /> as its first child.
 */

type Placement = "sides" | "edges" | "full" | "top" | "bottom";

const MASKS: Record<Placement, string> = {
  // Calm centre, motif breathes in from the left & right margins.
  sides: "linear-gradient(90deg,#000 0%,transparent 24%,transparent 76%,#000 100%)",
  // Present around the whole perimeter and corners, hushed at the core.
  edges: "radial-gradient(125% 120% at 50% 50%,transparent 40%,#000 100%)",
  // A gentle all-over vignette (use sparingly).
  full: "radial-gradient(135% 135% at 50% 50%,rgba(0,0,0,0.45) 0%,#000 100%)",
  top: "linear-gradient(180deg,#000 0%,transparent 62%)",
  bottom: "linear-gradient(0deg,#000 0%,transparent 62%)",
};

/** The tile: four pointed-oval "petals" (H, V and the two diagonals) meeting at
 *  dotted nodes — an 8-fold arabesque net that repeats seamlessly at 60px. */
function tileDataUri(color: string): string {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'>` +
    `<g fill='${color}'>` +
    `<path d='M0 0Q30 4 60 0Q30 -4 0 0Z'/>` +
    `<path d='M0 0Q-4 30 0 60Q4 30 0 0Z'/>` +
    `<path d='M0 0Q27.5 32.5 60 60Q32.5 27.5 0 0Z'/>` +
    `<path d='M60 0Q27.5 27.5 0 60Q32.5 32.5 60 0Z'/>` +
    `<circle cx='0' cy='0' r='2'/>` +
    `<circle cx='30' cy='30' r='1.4'/>` +
    `</g></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export default function NoorPattern({
  placement = "edges",
  // Antique-gold by default — warm, muted, never brassy. Pass a near-background
  // tone for a truly engraved, ton-sur-ton feel.
  color = "#C2A25A",
  opacity = 0.05,
  scale = 130,
  className,
}: {
  placement?: Placement;
  color?: string;
  opacity?: number;
  scale?: number;
  className?: string;
}) {
  const op = Math.min(opacity, 0.08); // absolute rule: never exceed 8%
  const mask = MASKS[placement];
  const uri = tileDataUri(color);

  const style: CSSProperties = {
    // Custom props let globals.css step intensity/scale down on smaller screens.
    ["--noor-op" as string]: op,
    ["--noor-scale" as string]: `${scale}px`,
    opacity: op,
    backgroundImage: `url("${uri}")`,
    backgroundSize: `${scale}px ${scale}px`,
    WebkitMaskImage: mask,
    maskImage: mask,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
  };

  return (
    <div
      aria-hidden="true"
      className={clsx("noor-pattern pointer-events-none absolute inset-0 -z-10", className)}
      style={style}
    />
  );
}
