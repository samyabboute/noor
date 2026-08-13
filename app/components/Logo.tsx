import clsx from "clsx";

/**
 * The Maison Noor mark: a four-point radiance — a single point of light.
 * Ownable, symmetrical, and legible at 16px (favicon) up to an embossed lid.
 * Not a crescent, not an arabesque — light itself, reduced to its essence.
 */
export function NoorMark({ className, stroke = "currentColor" }: { className?: string; stroke?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      {/* radiance: a slender vertical/horizontal star */}
      <path
        d="M20 2 C21 13 27 19 38 20 C27 21 21 27 20 38 C19 27 13 21 2 20 C13 19 19 13 20 2 Z"
        fill={stroke}
      />
      <circle cx="20" cy="20" r="2.4" fill="#16110C" opacity="0.0" />
    </svg>
  );
}

export function Logo({
  className,
  mono = false,
  compact = false,
}: {
  className?: string;
  mono?: boolean;
  compact?: boolean;
}) {
  return (
    <span className={clsx("inline-flex items-center gap-2.5 select-none", className)}>
      <NoorMark className={clsx(compact ? "h-3.5 w-3.5" : "h-4 w-4", mono ? "text-current" : "text-or")} />
      <span className="flex flex-col leading-none">
        <span
          className={clsx(
            "font-serif tracking-[0.12em] md:tracking-[0.14em]",
            compact ? "text-[14px]" : "text-[13px] md:text-[17px]",
          )}
        >
          MAISON NOOR
        </span>
      </span>
    </span>
  );
}
