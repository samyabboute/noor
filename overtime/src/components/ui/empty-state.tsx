import { cn } from "@/lib/cn";

/**
 * Empty states tell a small story: a quiet illustration, what this space is
 * for, and the one thing to do next.
 */
export function EmptyState({
  title,
  description,
  action,
  art = "ring",
  className,
  compact,
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  art?: "ring" | "people" | "inbox" | "chart" | "calm";
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center", compact ? "px-6 py-10" : "px-6 py-16 sm:py-20", className)}>
      <EmptyArt kind={art} />
      <h3 className="mt-6 text-[17px] font-semibold tracking-[-0.015em] text-ink-900">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

function EmptyArt({ kind }: { kind: string }) {
  const stroke = "rgba(11,16,32,0.14)";
  if (kind === "people")
    return (
      <svg width="120" height="72" viewBox="0 0 120 72" aria-hidden>
        {[18, 46, 74, 102].map((x, i) => (
          <g key={x} opacity={1 - i * 0.18}>
            <circle cx={x} cy="26" r="9" fill="none" stroke={stroke} strokeWidth="1.5" strokeDasharray={i ? "3 3" : undefined} />
            <path d={`M${x - 14} 58c0-8 6-14 14-14s14 6 14 14`} fill="none" stroke={stroke} strokeWidth="1.5" strokeDasharray={i ? "3 3" : undefined} />
          </g>
        ))}
      </svg>
    );
  if (kind === "inbox")
    return (
      <svg width="96" height="72" viewBox="0 0 96 72" aria-hidden>
        <rect x="10" y="14" width="76" height="48" rx="8" fill="white" stroke={stroke} strokeWidth="1.5" />
        <path d="M10 22l38 22 38-22" fill="none" stroke={stroke} strokeWidth="1.5" />
        <circle cx="80" cy="16" r="6" fill="#E3122B" opacity="0.9" />
      </svg>
    );
  if (kind === "chart")
    return (
      <svg width="120" height="72" viewBox="0 0 120 72" aria-hidden>
        {[14, 30, 46, 62, 78, 94].map((x, i) => (
          <rect key={x} x={x} y={60 - [18, 30, 22, 40, 28, 46][i]} width="10" height={[18, 30, 22, 40, 28, 46][i]} rx="2" fill="none" stroke={stroke} strokeWidth="1.5" strokeDasharray="3 3" />
        ))}
        <path d="M8 62h104" stroke={stroke} strokeWidth="1.5" />
      </svg>
    );
  if (kind === "calm")
    return (
      <svg width="96" height="96" viewBox="0 0 96 96" aria-hidden>
        <circle cx="48" cy="48" r="38" fill="none" stroke={stroke} strokeWidth="1.5" />
        <circle cx="48" cy="48" r="26" fill="none" stroke={stroke} strokeWidth="1.5" strokeDasharray="2 4" />
        <path d="M38 48l7 7 13-14" fill="none" stroke="#0E8A5F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" aria-hidden>
      <circle cx="48" cy="48" r="38" fill="none" stroke={stroke} strokeWidth="6" />
      <path d="M48 10a38 38 0 0 1 38 38" fill="none" stroke="#E3122B" strokeWidth="6" strokeLinecap="round" opacity="0.85" />
      <circle cx="48" cy="48" r="3" fill="#0B1020" />
      <path d="M48 48V30M48 48l10 6" stroke="#0B1020" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
