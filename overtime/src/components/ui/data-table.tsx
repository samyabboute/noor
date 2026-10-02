"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/cn";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sort?: (row: T) => string | number;
  className?: string;
  align?: "left" | "right";
  /** Hidden below the md breakpoint; the mobile card shows the essentials instead. */
  desktopOnly?: boolean;
}

/**
 * Sortable table on desktop, stacked rows on mobile. Rows animate in and out
 * so live status changes are noticed without being shouted.
 */
export function DataTable<T>({
  rows,
  columns,
  rowKey,
  mobile,
  empty,
  caption,
  initialSort,
  onRowClick,
}: {
  rows: T[];
  columns: Column<T>[];
  rowKey: (r: T) => string;
  mobile?: (r: T) => React.ReactNode;
  empty?: React.ReactNode;
  caption: string;
  initialSort?: { key: string; dir: "asc" | "desc" };
  onRowClick?: (r: T) => void;
}) {
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(initialSort || null);
  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sort) return rows;
    const s = col.sort;
    return [...rows].sort((a, b) => {
      const x = s(a);
      const y = s(b);
      const r = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
      return sort.dir === "asc" ? r : -r;
    });
  }, [rows, sort, columns]);

  if (!rows.length && empty) return <>{empty}</>;

  return (
    <>
      <div className="hidden md:block">
        <table className="w-full border-separate border-spacing-0 text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              {columns.map((c) => {
                const active = sort?.key === c.key;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={active ? (sort!.dir === "asc" ? "ascending" : "descending") : undefined}
                    className={cn("sticky top-0 z-[1] border-b border-ink-900/[0.07] bg-white/95 px-4 py-3 text-[12px] font-medium text-ink-400 backdrop-blur first:pl-6 last:pr-6", c.align === "right" && "text-right", c.className)}
                  >
                    {c.sort ? (
                      <button
                        type="button"
                        onClick={() => setSort((s) => (s?.key === c.key ? { key: c.key, dir: s.dir === "asc" ? "desc" : "asc" } : { key: c.key, dir: "asc" }))}
                        className={cn("inline-flex items-center gap-1 transition hover:text-ink-900", active && "text-ink-900")}
                      >
                        {c.header}
                        {active ? sort!.dir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} /> : null}
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {sorted.map((r) => (
                <motion.tr
                  key={rowKey(r)}
                  layout="position"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  onClick={onRowClick ? () => onRowClick(r) : undefined}
                  className={cn("group", onRowClick && "cursor-pointer")}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={cn("border-b border-ink-900/[0.05] px-4 py-3.5 align-middle transition-colors first:pl-6 last:pr-6 group-hover:bg-ink-50/70", c.align === "right" && "text-right", c.className)}>
                      {c.cell(r)}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      <ul className="divide-y divide-ink-900/[0.06] md:hidden" aria-label={caption}>
        {sorted.map((r) => (
          <li key={rowKey(r)} className={cn("px-5 py-4", onRowClick && "cursor-pointer active:bg-ink-50")} onClick={onRowClick ? () => onRowClick(r) : undefined}>
            {mobile ? mobile(r) : columns[0].cell(r)}
          </li>
        ))}
      </ul>
    </>
  );
}
