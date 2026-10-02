import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton", className)} />;
}

/** Page-level skeleton that mirrors the real layout so nothing jumps on load. */
export function PageSkeleton({ variant = "dashboard" }: { variant?: "dashboard" | "hero" | "table" }) {
  return (
    <div role="status" aria-label="Loading">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-4 h-10 w-80 max-w-full" />
      {variant === "hero" ? (
        <Skeleton className="mt-10 h-[420px] w-full rounded-3xl" />
      ) : variant === "table" ? (
        <div className="mt-10 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </>
      )}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
