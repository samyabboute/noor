import clsx from "clsx";

/**
 * The editorial section index. Instead of a templated "02 — Origin" with a dash,
 * the number and the label are set as two elements and separated by rhythm, not
 * punctuation: the numeral sits a touch brighter with tabular figures, a measured
 * gap, then the tracked label. Accepts the legacy "NN — Label" string and splits
 * it, so callers and copy stay untouched.
 */
export default function SectionIndex({ children, className }: { children: string; className?: string }) {
  const parts = children.split(/\s*[—–-]\s*/);
  const num = parts.length > 1 ? parts[0] : "";
  const label = parts.length > 1 ? parts.slice(1).join(" ") : children;

  return (
    <span className={clsx("section-index inline-flex items-baseline gap-x-[0.9em]", className)}>
      {num && <span className="font-normal tabular-nums text-current opacity-90">{num}</span>}
      <span className="opacity-70">{label}</span>
    </span>
  );
}
