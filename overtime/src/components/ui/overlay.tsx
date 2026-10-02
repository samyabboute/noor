"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

const FOCUSABLE = 'a[href],button:not([disabled]),textarea,input:not([disabled]),select,[tabindex]:not([tabindex="-1"])';

/** Focus trap + Escape + scroll lock + focus restore — shared by Modal and Drawer. */
function useDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      const el = ref.current?.querySelector<HTMLElement>("[data-autofocus]") || ref.current?.querySelector<HTMLElement>(FOCUSABLE);
      el?.focus();
    }, 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
      if (e.key === "Tab" && ref.current) {
        const els = [...ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((x) => x.offsetParent !== null);
        if (!els.length) return;
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [open, onClose]);
  return ref;
}

function Portal({ children }: { children: React.ReactNode }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

export function Modal({ open, onClose, title, description, children, footer, size = "md" }: { open: boolean; onClose: () => void; title: string; description?: string; children: React.ReactNode; footer?: React.ReactNode; size?: "sm" | "md" | "lg" }) {
  const ref = useDialog(open, onClose);
  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
            <motion.div className="absolute inset-0 bg-ink-900/40 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={onClose} />
            <motion.div
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              className={cn("relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-float sm:rounded-3xl", size === "sm" ? "sm:max-w-md" : size === "lg" ? "sm:max-w-3xl" : "sm:max-w-xl")}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98, transition: { duration: 0.16 } }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-6">
                <div>
                  <h2 id="modal-title" className="text-xl font-semibold tracking-[-0.02em]">
                    {title}
                  </h2>
                  {description && <p className="mt-1.5 text-sm text-ink-500">{description}</p>}
                </div>
                <button onClick={onClose} aria-label="Close" className="-mr-2 -mt-1 grid h-9 w-9 place-items-center rounded-full text-ink-400 transition hover:bg-ink-50 hover:text-ink-900">
                  <X size={18} />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-2">{children}</div>
              {footer && <div className="flex items-center justify-end gap-2 border-t border-ink-900/[0.06] bg-ink-50/60 px-6 py-4">{footer}</div>}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}

export function Drawer({ open, onClose, title, description, children, footer, width = 520 }: { open: boolean; onClose: () => void; title: string; description?: string; children: React.ReactNode; footer?: React.ReactNode; width?: number }) {
  const ref = useDialog(open, onClose);
  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[70]">
            <motion.div className="absolute inset-0 bg-ink-900/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
            <motion.aside
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-labelledby="drawer-title"
              className="absolute inset-y-0 right-0 flex w-full flex-col bg-paper shadow-float sm:rounded-l-3xl"
              style={{ maxWidth: width }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%", transition: { duration: 0.22, ease: [0.32, 0.72, 0, 1] } }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            >
              <div className="flex items-start justify-between gap-4 border-b border-ink-900/[0.06] px-6 py-5">
                <div>
                  <h2 id="drawer-title" className="text-lg font-semibold tracking-[-0.02em]">
                    {title}
                  </h2>
                  {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
                </div>
                <button onClick={onClose} aria-label="Close panel" className="-mr-2 grid h-9 w-9 place-items-center rounded-full text-ink-400 transition hover:bg-ink-900/5 hover:text-ink-900">
                  <X size={18} />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
              {footer && <div className="flex items-center justify-end gap-2 border-t border-ink-900/[0.06] bg-white px-6 py-4">{footer}</div>}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
