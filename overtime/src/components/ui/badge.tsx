import { Check, Circle, Clock, Eye, X, Minus } from "lucide-react";
import type { RecipientStatus, RequestStatus } from "@/lib/types";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "covered" | "waiting" | "signal" | "ink" | "muted";

const tones: Record<Tone, string> = {
  neutral: "bg-ink-50 text-ink-600 ring-ink-900/[0.06]",
  covered: "bg-covered-50 text-covered-600 ring-covered/15",
  waiting: "bg-waiting-50 text-waiting ring-waiting/15",
  signal: "bg-signal-50 text-signal-600 ring-signal/15",
  ink: "bg-ink-900 text-white ring-ink-900",
  muted: "bg-transparent text-ink-400 ring-ink-900/[0.08]",
};

export function Badge({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-md px-2 text-[12px] font-medium ring-1 ring-inset", tones[tone], className)}>
      {children}
    </span>
  );
}

const recipientMeta: Record<RecipientStatus, { label: string; tone: Tone; icon: React.ReactNode }> = {
  confirmed: { label: "Confirmed", tone: "covered", icon: <Check size={12} strokeWidth={3} /> },
  opened: { label: "Seen", tone: "waiting", icon: <Eye size={12} strokeWidth={2.5} /> },
  sent: { label: "Pending", tone: "neutral", icon: <Circle size={9} strokeWidth={3} /> },
  declined: { label: "Declined", tone: "muted", icon: <X size={12} strokeWidth={2.5} /> },
  expired: { label: "No reply", tone: "muted", icon: <Minus size={12} strokeWidth={2.5} /> },
};

const requestMeta: Record<RequestStatus, { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "neutral" },
  live: { label: "Live", tone: "signal" },
  completed: { label: "Completed", tone: "muted" },
  cancelled: { label: "Cancelled", tone: "muted" },
};

export function StatusBadge({ status, kind = "recipient" }: { status: RecipientStatus | RequestStatus; kind?: "recipient" | "request" }) {
  if (kind === "request") {
    const m = requestMeta[status as RequestStatus];
    return (
      <Badge tone={m.tone}>
        {status === "live" ? <LiveDot size="sm" /> : status === "draft" ? <Clock size={12} strokeWidth={2.5} /> : null}
        {m.label}
      </Badge>
    );
  }
  const m = recipientMeta[status as RecipientStatus];
  return (
    <Badge tone={m.tone}>
      {m.icon}
      {m.label}
    </Badge>
  );
}

export function LiveDot({ size = "md", className, tone = "signal" }: { size?: "sm" | "md"; className?: string; tone?: "signal" | "covered" }) {
  const s = size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2";
  const c = tone === "signal" ? "bg-signal" : "bg-covered";
  return (
    <span className={cn("relative inline-flex", s, className)} aria-hidden>
      <span className={cn("absolute inset-0 rounded-full animate-pulse-dot", c)} />
      <span className={cn("relative inline-flex rounded-full", s, c)} />
    </span>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-[5px] border border-ink-900/10 bg-white px-1 font-sans text-[11px] font-medium text-ink-500 shadow-card">{children}</kbd>;
}
