import { Check, Mail, Minus, Plus, Send, Sparkles, X, Eye, FileText, Users, Flag, Undo2, Pencil, Upload, KeyRound, LogIn, UserPlus, UserMinus, ListX } from "lucide-react";
import type { AuditAction } from "@/lib/types";
import { cn } from "@/lib/cn";
import { relativeTime } from "@/lib/time";

export interface TimelineItem {
  id: string;
  at: string;
  action: AuditAction;
  actorName: string;
  targetName?: string;
  requestTitle?: string;
  minutes?: number;
  detail?: string;
}

const meta: Record<AuditAction, { icon: React.ReactNode; tone: string; text: (i: TimelineItem) => React.ReactNode }> = {
  REQUEST_CREATED: { icon: <Sparkles size={13} />, tone: "bg-ink-900 text-white", text: (i) => <><b>{i.actorName}</b> created the request</> },
  REQUEST_DRAFTED: { icon: <FileText size={13} />, tone: "bg-ink-100 text-ink-600", text: (i) => <><b>{i.actorName}</b> saved a draft</> },
  REQUEST_SENT: { icon: <Send size={13} />, tone: "bg-signal text-white", text: (i) => <><b>{i.actorName}</b> launched {i.requestTitle ? <span className="text-ink-500">“{i.requestTitle}”</span> : "the request"}</> },
  REQUEST_UPDATED: { icon: <Pencil size={13} />, tone: "bg-ink-100 text-ink-600", text: (i) => <><b>{i.actorName}</b> updated the request</> },
  REQUEST_COMPLETED: { icon: <Flag size={13} />, tone: "bg-ink-100 text-ink-600", text: (i) => <>{i.actorName === "Overtime" ? "Responses closed automatically" : <><b>{i.actorName}</b> closed the request</>}</> },
  REQUEST_CANCELLED: { icon: <X size={13} />, tone: "bg-ink-100 text-ink-600", text: (i) => <><b>{i.actorName}</b> discarded a draft</> },
  RECIPIENT_ADDED: { icon: <Plus size={13} />, tone: "bg-ink-100 text-ink-600", text: (i) => <><b>{i.actorName}</b> added {i.targetName}</> },
  RECIPIENT_REMOVED: { icon: <Minus size={13} />, tone: "bg-ink-100 text-ink-600", text: (i) => <><b>{i.actorName}</b> removed {i.targetName}</> },
  REQUEST_VIEWED: { icon: <Eye size={13} />, tone: "bg-waiting-50 text-waiting", text: (i) => <><b>{i.actorName}</b> saw the request</> },
  AGENT_CONFIRMED: { icon: <Check size={13} strokeWidth={3} />, tone: "bg-covered text-white", text: (i) => <><b>{i.actorName}</b> is in{i.minutes ? <span className="text-ink-500"> · +{i.minutes} min</span> : null}</> },
  AGENT_DECLINED: { icon: <X size={13} />, tone: "bg-ink-100 text-ink-500", text: (i) => <><b>{i.actorName}</b> can’t this time</> },
  RESPONSE_WITHDRAWN: { icon: <Undo2 size={13} />, tone: "bg-ink-100 text-ink-600", text: (i) => <><b>{i.actorName}</b> changed their answer</> },
  EMAIL_OPENED: { icon: <Mail size={13} />, tone: "bg-ink-100 text-ink-600", text: (i) => <><b>{i.actorName}</b> opened the {i.detail === "announcement" ? "announcement" : i.detail === "nudge" ? "reminder" : "confirmation"} in Outlook</> },
  TEMPLATE_UPDATED: { icon: <FileText size={13} />, tone: "bg-ink-100 text-ink-600", text: (i) => <><b>{i.actorName}</b> updated template {i.detail ? <span className="text-ink-500">“{i.detail}”</span> : null}</> },
  GROUP_CREATED: { icon: <Users size={13} />, tone: "bg-ink-100 text-ink-600", text: (i) => <><b>{i.actorName}</b> created group {i.detail ? <span className="text-ink-500">“{i.detail}”</span> : null}</> },
  GROUP_DELETED: { icon: <Users size={13} />, tone: "bg-ink-100 text-ink-600", text: (i) => <><b>{i.actorName}</b> deleted group {i.detail ? <span className="text-ink-500">“{i.detail}”</span> : null}</> },
  LIST_IMPORTED: { icon: <Upload size={13} />, tone: "bg-ink-100 text-ink-600", text: (i) => <><b>{i.actorName}</b> updated {i.detail ? <span className="text-ink-500">{i.detail}</span> : "a distribution list"}</> },
  LIST_DELETED: { icon: <ListX size={13} />, tone: "bg-ink-100 text-ink-600", text: (i) => <><b>{i.actorName}</b> removed {i.detail ? <span className="text-ink-500">{i.detail}</span> : "a distribution list"}</> },
  PERSON_ADDED: { icon: <UserPlus size={13} />, tone: "bg-ink-100 text-ink-600", text: (i) => <><b>{i.actorName}</b> added {i.targetName} to the team</> },
  PERSON_REMOVED: { icon: <UserMinus size={13} />, tone: "bg-ink-100 text-ink-600", text: (i) => <><b>{i.actorName}</b> removed {i.targetName}</> },
  PIN_RESET: { icon: <KeyRound size={13} />, tone: "bg-ink-100 text-ink-600", text: (i) => <><b>{i.actorName}</b> reset {i.targetName}’s PIN</> },
  SIGNED_IN: { icon: <LogIn size={13} />, tone: "bg-ink-100 text-ink-600", text: (i) => <><b>{i.actorName}</b> signed in</> },
};

export function Timeline({ items, className, showRequest }: { items: TimelineItem[]; className?: string; showRequest?: boolean }) {
  return (
    <ol className={cn("relative", className)}>
      {items.map((i, idx) => {
        const m = meta[i.action];
        return (
          <li key={i.id} className="relative flex gap-3 pb-5 last:pb-0">
            {idx < items.length - 1 && <span aria-hidden className="absolute left-[11px] top-7 h-[calc(100%-22px)] w-px bg-ink-900/[0.07]" />}
            <span className={cn("relative z-[1] mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full", m.tone)}>{m.icon}</span>
            <div className="min-w-0 pt-0.5 text-[13px] leading-snug text-ink-700 [&_b]:font-medium [&_b]:text-ink-900">
              <p>{m.text(i)}</p>
              <p className="mt-0.5 text-[12px] text-ink-400">
                <time dateTime={i.at} suppressHydrationWarning>{relativeTime(i.at)}</time>
                {showRequest && i.requestTitle && i.action !== "REQUEST_SENT" ? <> · {i.requestTitle}</> : null}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
