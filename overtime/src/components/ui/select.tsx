"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export interface Option {
  value: string;
  label: string;
  hint?: string;
}

/** Accessible listbox dropdown: arrows, Home/End, type-ahead, Enter, Escape. */
export function Select({
  value,
  onChange,
  options,
  label,
  placeholder = "Select",
  className,
  size = "md",
}: {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  label: string;
  placeholder?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  return <ListboxBase multiple={false} values={value ? [value] : []} onToggle={(v) => onChange(v)} options={options} label={label} placeholder={placeholder} className={className} size={size} />;
}

export function MultiSelect({ values, onChange, options, label, placeholder = "All", className, size = "md" }: { values: string[]; onChange: (v: string[]) => void; options: Option[]; label: string; placeholder?: string; className?: string; size?: "sm" | "md" }) {
  return (
    <ListboxBase
      multiple
      values={values}
      onToggle={(v) => onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v])}
      options={options}
      label={label}
      placeholder={placeholder}
      className={className}
      size={size}
    />
  );
}

function ListboxBase({
  multiple,
  values,
  onToggle,
  options,
  label,
  placeholder,
  className,
  size,
}: {
  multiple: boolean;
  values: string[];
  onToggle: (v: string) => void;
  options: Option[];
  label: string;
  placeholder: string;
  className?: string;
  size: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const id = useId();
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const typed = useRef({ s: "", t: 0 });

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    const i = options.findIndex((o) => values.includes(o.value));
    setActive(i >= 0 ? i : 0);
    setTimeout(() => list.current?.focus(), 0);
    return () => document.removeEventListener("mousedown", close);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    list.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const selectedLabels = options.filter((o) => values.includes(o.value)).map((o) => o.label);
  const display = selectedLabels.length === 0 ? placeholder : multiple && selectedLabels.length > 1 ? `${selectedLabels[0]} +${selectedLabels.length - 1}` : selectedLabels[0];

  const choose = (i: number) => {
    const o = options[i];
    if (!o) return;
    onToggle(o.value);
    if (!multiple) {
      setOpen(false);
      btn.current?.focus();
    }
  };

  return (
    <div ref={wrap} className={cn("relative", className)}>
      <button
        ref={btn}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${display}`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={cn(
          "inline-flex w-full items-center justify-between gap-2 rounded-xl bg-white text-left font-medium text-ink-800 hairline shadow-card transition hover:border-ink-900/15",
          size === "sm" ? "h-9 px-3 text-[13px]" : "h-10 px-3.5 text-sm",
          open && "border-ink-900/25 ring-4 ring-ink-900/[0.05]",
        )}
      >
        <span className={cn("truncate", !selectedLabels.length && "text-ink-500")}>{display}</span>
        <ChevronDown size={15} className={cn("shrink-0 text-ink-400 transition-transform duration-200", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            ref={list}
            id={id}
            role="listbox"
            aria-label={label}
            aria-multiselectable={multiple || undefined}
            aria-activedescendant={`${id}-${active}`}
            tabIndex={-1}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.12 } }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 z-50 mt-1.5 max-h-72 min-w-full overflow-auto rounded-xl bg-white p-1 shadow-float ring-1 ring-ink-900/[0.06] focus:outline-none"
            style={{ transformOrigin: "top" }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(options.length - 1, a + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(0, a - 1));
              } else if (e.key === "Home") {
                e.preventDefault();
                setActive(0);
              } else if (e.key === "End") {
                e.preventDefault();
                setActive(options.length - 1);
              } else if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                choose(active);
              } else if (e.key === "Escape" || e.key === "Tab") {
                if (e.key === "Escape") e.preventDefault();
                setOpen(false);
                btn.current?.focus();
              } else if (e.key.length === 1) {
                const now = Date.now();
                typed.current.s = now - typed.current.t > 600 ? e.key.toLowerCase() : typed.current.s + e.key.toLowerCase();
                typed.current.t = now;
                const i = options.findIndex((o) => o.label.toLowerCase().startsWith(typed.current.s));
                if (i >= 0) setActive(i);
              }
            }}
          >
            {options.map((o, i) => {
              const sel = values.includes(o.value);
              return (
                <li
                  key={o.value}
                  id={`${id}-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={sel}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(i)}
                  className={cn("flex cursor-pointer items-center justify-between gap-3 whitespace-nowrap rounded-lg px-2.5 py-2 text-sm", i === active ? "bg-ink-50 text-ink-900" : "text-ink-700")}
                >
                  <span className="flex flex-col">
                    {o.label}
                    {o.hint && <span className="text-[12px] text-ink-400">{o.hint}</span>}
                  </span>
                  <Check size={15} className={cn("text-ink-900", sel ? "opacity-100" : "opacity-0")} />
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Segmented control (radio group) — for small, mutually exclusive choices. */
export function Segmented<T extends string | number>({ value, onChange, options, label, size = "md", className }: { value: T; onChange: (v: T) => void; options: { value: T; label: React.ReactNode }[]; label: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const id = useId();
  return (
    <div role="radiogroup" aria-label={label} className={cn("inline-flex rounded-xl bg-ink-900/[0.05] p-1", className)}>
      {options.map((o) => {
        const sel = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={sel}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => {
              const i = options.findIndex((x) => x.value === value);
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                onChange(options[(i + 1) % options.length].value);
              }
              if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                onChange(options[(i - 1 + options.length) % options.length].value);
              }
            }}
            tabIndex={sel ? 0 : -1}
            className={cn(
              "relative flex-1 whitespace-nowrap rounded-lg font-medium transition-colors",
              size === "sm" ? "h-7 px-2.5 text-[12px]" : size === "lg" ? "h-11 px-4 text-[15px]" : "h-8 px-3 text-[13px]",
              sel ? "text-ink-900" : "text-ink-500 hover:text-ink-800",
            )}
          >
            {sel && <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-lg bg-white shadow-card ring-1 ring-ink-900/[0.06]" transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }} />}
            <span className="relative tnum">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
