"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { CountUp } from "./count-up";
import { Sparkline } from "./charts";

export function MetricCard({
  label,
  value,
  format,
  hint,
  delta,
  deltaGood = "up",
  spark,
  accent,
  className,
}: {
  label: string;
  value: number;
  format?: (n: number) => string;
  hint?: React.ReactNode;
  delta?: number | null; // relative change, e.g. 0.12
  deltaGood?: "up" | "down";
  spark?: number[];
  accent?: "covered" | "signal" | "waiting";
  className?: string;
}) {
  const good = delta == null ? null : deltaGood === "up" ? delta >= 0 : delta <= 0;
  return (
    <div className={cn("surface flex flex-col justify-between gap-6 p-5 sm:p-6", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow">{label}</p>
        {accent && <span className={cn("h-1.5 w-1.5 rounded-full", accent === "covered" ? "bg-covered" : accent === "signal" ? "bg-signal" : "bg-waiting")} />}
      </div>
      <div>
        <CountUp value={value} format={format} className="tnum block whitespace-nowrap text-[2.25rem] font-semibold leading-none tracking-[-0.04em] text-ink-900 xl:text-[2.5rem]" />
        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 text-[12.5px] text-ink-400">
            {delta != null && Number.isFinite(delta) && (
              <span className={cn("inline-flex shrink-0 items-center gap-0.5 font-medium", good ? "text-covered-600" : "text-signal-600")}>
                {delta >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {Math.abs(Math.round(delta * 100))}%
              </span>
            )}
            <span className="truncate">{hint}</span>
          </div>
          {spark && spark.length > 1 && <Sparkline data={spark} className="h-8 w-20 shrink-0" />}
        </div>
      </div>
    </div>
  );
}
