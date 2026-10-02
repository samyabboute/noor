import { cn } from "@/lib/cn";

/** The mark: a coverage ring with one live segment. */
export function LogoMark({ size = 24, className, inverse }: { size?: number; className?: string; inverse?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="8.5" fill="none" stroke={inverse ? "rgba(255,255,255,0.25)" : "rgba(11,16,32,0.15)"} strokeWidth="3" />
      <path d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5" fill="none" stroke="#E3122B" strokeWidth="3" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2" fill={inverse ? "#fff" : "#0B1020"} />
    </svg>
  );
}

export function Logo({ className, inverse }: { className?: string; inverse?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark inverse={inverse} />
      <span className={cn("text-[15px] font-semibold tracking-[-0.03em]", inverse ? "text-white" : "text-ink-900")}>Overtime</span>
    </span>
  );
}
