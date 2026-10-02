"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

/**
 * Charts, deliberately few and quiet: one hue per chart (ink, or green when the
 * measure *is* coverage), thin marks with 4px rounded ends, recessive axes,
 * a hover tooltip on every mark, and text that always stays in ink tokens.
 */

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

const TONE = { ink: "#0B1020", covered: "#0E8A5F", muted: "#B3B8C3" };

function niceMax(v: number) {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}

function Tooltip({ x, y, width, children }: { x: number; y: number; width: number; children: React.ReactNode }) {
  const left = Math.min(Math.max(x, 70), width - 70);
  return (
    <div
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-ink-900 px-2.5 py-1.5 text-[12px] text-white shadow-float"
      style={{ left, top: y - 8 }}
    >
      {children}
    </div>
  );
}

export interface BarDatum {
  label: string;
  value: number;
  tip?: React.ReactNode;
  highlight?: boolean;
}

export function BarChart({
  data,
  height = 200,
  tone = "ink",
  format = (n) => String(Math.round(n)),
  xTicks = 6,
  ariaLabel,
}: {
  data: BarDatum[];
  height?: number;
  tone?: keyof typeof TONE;
  format?: (n: number) => string;
  xTicks?: number;
  ariaLabel: string;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const padL = 32;
  const padB = 22;
  const max = niceMax(Math.max(...data.map((d) => d.value), 0));
  const innerW = Math.max(0, width - padL);
  const innerH = height - padB - 8;
  const slot = data.length ? innerW / data.length : 0;
  const bw = Math.max(2, Math.min(28, slot - 2));
  const every = Math.max(1, Math.ceil(data.length / xTicks));
  const ticks = [0, max / 2, max];

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={ariaLabel} onMouseLeave={() => setHover(null)}>
          {ticks.map((t) => {
            const y = 8 + innerH - (t / max) * innerH;
            return (
              <g key={t}>
                <line x1={padL} x2={width} y1={y} y2={y} stroke="rgba(11,16,32,0.06)" />
                <text x={padL - 8} y={y + 4} textAnchor="end" className="fill-ink-400 text-[11px] tnum">
                  {format(t)}
                </text>
              </g>
            );
          })}
          {data.map((d, i) => {
            const h = (d.value / max) * innerH;
            const x = padL + i * slot + (slot - bw) / 2;
            const y = 8 + innerH - h;
            const r = Math.min(4, bw / 2, h);
            const path = h > 0 ? `M${x},${8 + innerH} V${y + r} Q${x},${y} ${x + r},${y} H${x + bw - r} Q${x + bw},${y} ${x + bw},${y + r} V${8 + innerH} Z` : "";
            const dim = hover !== null && hover !== i;
            return (
              <g key={i}>
                {path && (
                  <motion.path
                    d={path}
                    fill={d.highlight ? TONE.covered : TONE[tone]}
                    initial={reduce ? false : { opacity: 0, scaleY: 0 }}
                    animate={{ opacity: dim ? 0.35 : 1, scaleY: 1 }}
                    style={{ originY: 1, transformBox: "fill-box" }}
                    transition={{ duration: 0.5, delay: reduce ? 0 : i * 0.012, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
                <rect x={padL + i * slot} y={0} width={slot} height={height - padB} fill="transparent" onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} tabIndex={-1} />
                {i % every === 0 && (
                  <text x={padL + i * slot + slot / 2} y={height - 6} textAnchor="middle" className="fill-ink-400 text-[11px]">
                    {d.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}
      {hover !== null && data[hover] && (
        <Tooltip x={padL + hover * slot + slot / 2} y={8 + innerH - (data[hover].value / max) * innerH} width={width}>
          {data[hover].tip || (
            <>
              <span className="text-white/60">{data[hover].label}</span> <span className="ml-1 font-medium tnum">{format(data[hover].value)}</span>
            </>
          )}
        </Tooltip>
      )}
    </div>
  );
}

export function LineChart({
  data,
  height = 200,
  tone = "ink",
  format = (n) => String(Math.round(n)),
  xTicks = 6,
  ariaLabel,
  area = true,
}: {
  data: { label: string; value: number | null; tip?: React.ReactNode }[];
  height?: number;
  tone?: keyof typeof TONE;
  format?: (n: number) => string;
  xTicks?: number;
  ariaLabel: string;
  area?: boolean;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const gid = useId().replace(/:/g, "");
  const padL = 44;
  const padB = 22;
  const innerW = Math.max(0, width - padL - 6);
  const innerH = height - padB - 10;
  const vals = data.map((d) => d.value).filter((v): v is number => v != null);
  const max = niceMax(Math.max(...vals, 0) * 1.1);
  const step = data.length > 1 ? innerW / (data.length - 1) : 0;
  const pt = (i: number, v: number) => [padL + i * step, 10 + innerH - (v / max) * innerH] as const;
  const pts = data.map((d, i) => (d.value == null ? null : pt(i, d.value)));
  const line = pts.reduce((acc, p, i) => (p ? acc + `${acc && pts[i - 1] ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}` : acc), "");
  const valid = pts.filter(Boolean) as (readonly [number, number])[];
  const areaPath = valid.length > 1 ? `${line} L${valid[valid.length - 1][0]},${10 + innerH} L${valid[0][0]},${10 + innerH} Z` : "";
  const every = Math.max(1, Math.ceil(data.length / xTicks));

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {width > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={ariaLabel}
          onMouseMove={(e) => {
            const x = e.clientX - e.currentTarget.getBoundingClientRect().left - padL;
            const i = Math.round(x / (step || 1));
            setHover(i >= 0 && i < data.length && data[i].value != null ? i : null);
          }}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={TONE[tone]} stopOpacity="0.12" />
              <stop offset="100%" stopColor={TONE[tone]} stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, max / 2, max].map((t) => {
            const y = 10 + innerH - (t / max) * innerH;
            return (
              <g key={t}>
                <line x1={padL} x2={width - 6} y1={y} y2={y} stroke="rgba(11,16,32,0.06)" />
                <text x={padL - 8} y={y + 4} textAnchor="end" className="fill-ink-400 text-[11px] tnum">
                  {format(t)}
                </text>
              </g>
            );
          })}
          {area && areaPath && <path d={areaPath} fill={`url(#${gid})`} />}
          <motion.path d={line} fill="none" stroke={TONE[tone]} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
          {data.map((d, i) =>
            i % every === 0 ? (
              <text key={i} x={padL + i * step} y={height - 6} textAnchor="middle" className="fill-ink-400 text-[11px]">
                {d.label}
              </text>
            ) : null,
          )}
          {hover !== null && pts[hover] && (
            <g>
              <line x1={pts[hover]![0]} x2={pts[hover]![0]} y1={10} y2={10 + innerH} stroke="rgba(11,16,32,0.18)" strokeDasharray="3 3" />
              <circle cx={pts[hover]![0]} cy={pts[hover]![1]} r={5} fill={TONE[tone]} stroke="white" strokeWidth={2} />
            </g>
          )}
        </svg>
      )}
      {hover !== null && pts[hover] && (
        <Tooltip x={pts[hover]![0]} y={pts[hover]![1]} width={width}>
          {data[hover].tip || (
            <>
              <span className="text-white/60">{data[hover].label}</span> <span className="ml-1 font-medium tnum">{format(data[hover].value!)}</span>
            </>
          )}
        </Tooltip>
      )}
    </div>
  );
}

/** Ranked horizontal bars — label left, value right, the bar as quiet context. */
export function HBarList({
  data,
  format = (n) => String(Math.round(n)),
  tone = "ink",
  max,
  className,
}: {
  data: { id: string; label: React.ReactNode; value: number; meta?: React.ReactNode; tip?: string }[];
  format?: (n: number) => string;
  tone?: keyof typeof TONE;
  max?: number;
  className?: string;
}) {
  const m = max ?? Math.max(...data.map((d) => d.value), 0.0001);
  return (
    <ul className={cn("space-y-3.5", className)}>
      {data.map((d, i) => (
        <li key={d.id} className="group" title={d.tip}>
          <div className="flex items-baseline justify-between gap-3 text-[13px]">
            <span className="min-w-0 truncate text-ink-700">{d.label}</span>
            <span className="flex shrink-0 items-baseline gap-2">
              {d.meta && <span className="text-ink-400">{d.meta}</span>}
              <span className="tnum font-medium text-ink-900">{format(d.value)}</span>
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-900/[0.05]">
            <motion.div
              className="h-full rounded-full transition-opacity group-hover:opacity-80"
              style={{ background: TONE[tone] }}
              initial={{ width: 0 }}
              whileInView={{ width: `${(d.value / m) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Sparkline({ data, className, tone = "ink" }: { data: number[]; className?: string; tone?: keyof typeof TONE }) {
  const d = useMemo(() => {
    const max = Math.max(...data, 0.0001);
    const min = Math.min(...data, 0);
    const span = max - min || 1;
    return data.map((v, i) => `${i ? "L" : "M"}${((i / (data.length - 1)) * 100).toFixed(2)},${(28 - ((v - min) / span) * 26).toFixed(2)}`).join("");
  }, [data]);
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className={className} aria-hidden>
      <path d={d} fill="none" stroke={TONE[tone]} strokeWidth={1.5} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" opacity={0.85} />
    </svg>
  );
}
