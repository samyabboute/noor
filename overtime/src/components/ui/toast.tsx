"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

type Tone = "success" | "error" | "info";
interface Toast {
  id: number;
  title: string;
  description?: string;
  tone: Tone;
  action?: { label: string; onClick: () => void };
}

const Ctx = createContext<{ toast: (t: Omit<Toast, "id" | "tone"> & { tone?: Tone }) => void }>({ toast: () => {} });

export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const dismiss = useCallback((id: number) => setItems((xs) => xs.filter((x) => x.id !== id)), []);
  const toast = useCallback(
    (t: Omit<Toast, "id" | "tone"> & { tone?: Tone }) => {
      const id = Date.now() + Math.random();
      setItems((xs) => [...xs.slice(-2), { id, tone: "success", ...t }]);
      setTimeout(() => dismiss(id), t.tone === "error" ? 7000 : 4200);
    },
    [dismiss],
  );
  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-[80] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:pr-6">
        <AnimatePresence initial={false}>
          {items.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.18 } }}
              role={t.tone === "error" ? "alert" : "status"}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl bg-ink-900 px-4 py-3.5 text-white shadow-float"
            >
              <span
                className={cn(
                  "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full",
                  t.tone === "success" && "bg-covered text-white",
                  t.tone === "error" && "bg-signal text-white",
                  t.tone === "info" && "bg-white/15 text-white",
                )}
              >
                {t.tone === "success" ? <Check size={12} strokeWidth={3} /> : t.tone === "error" ? <AlertCircle size={12} strokeWidth={2.5} /> : <Info size={12} strokeWidth={2.5} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{t.title}</p>
                {t.description && <p className="mt-0.5 text-[13px] leading-snug text-white/60">{t.description}</p>}
                {t.action && (
                  <button
                    onClick={() => {
                      t.action!.onClick();
                      dismiss(t.id);
                    }}
                    className="mt-2 text-[13px] font-medium text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
                  >
                    {t.action.label}
                  </button>
                )}
              </div>
              <button aria-label="Dismiss notification" onClick={() => dismiss(t.id)} className="text-white/40 transition hover:text-white">
                <X size={15} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
