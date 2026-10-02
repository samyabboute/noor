import { cn } from "@/lib/cn";

export function Card({ className, children, as: As = "div", ...rest }: React.HTMLAttributes<HTMLElement> & { as?: "div" | "section" | "article" }) {
  return (
    <As className={cn("surface", className)} {...rest}>
      {children}
    </As>
  );
}

export function CardHeader({ eyebrow, title, action, className }: { eyebrow?: React.ReactNode; title?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6", className)}>
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        {title && <h2 className="mt-1 text-[17px] font-semibold tracking-[-0.015em] text-ink-900">{title}</h2>}
      </div>
      {action}
    </div>
  );
}

export function SectionTitle({ eyebrow, title, description, action, className }: { eyebrow?: string; title: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="text-display-md font-semibold text-ink-900">{title}</h1>
        {description && <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-500">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}
