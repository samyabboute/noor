"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Repeat2, ChevronsUpDown } from "lucide-react";
import { signOut } from "next-auth/react";
import { Avatar } from "@/components/ui/avatar";
import type { SessionUser } from "@/lib/types";
import { cn } from "@/lib/cn";
import { ROLE_LABEL } from "./nav";

export async function doSignOut(demo: boolean, router: ReturnType<typeof useRouter>) {
  if (demo) {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  } else {
    await signOut({ callbackUrl: "/login" });
  }
}

export function UserMenu({ user, demo, compact, align = "up" }: { user: SessionUser; demo: boolean; compact?: boolean; align?: "up" | "down" }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account: ${user.name}`}
        onClick={() => setOpen((o) => !o)}
        className={cn("flex w-full items-center gap-2.5 rounded-xl text-left transition hover:bg-ink-900/[0.04]", compact ? "p-1" : "p-2")}
      >
        <Avatar name={user.name} size={compact ? 32 : 34} />
        {!compact && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium text-ink-900">{user.name}</span>
              <span className="block truncate text-[12px] text-ink-400">
                {ROLE_LABEL[user.role]}
                {user.teamId ? ` · ${user.teamId.toUpperCase()}` : ""}
              </span>
            </span>
            <ChevronsUpDown size={14} className="text-ink-300" />
          </>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: align === "up" ? 6 : -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12 } }}
            transition={{ duration: 0.18 }}
            className={cn("absolute z-50 w-60 rounded-xl bg-white p-1 shadow-float ring-1 ring-ink-900/[0.06]", align === "up" ? "bottom-full left-0 mb-2" : "right-0 top-full mt-2")}
          >
            <div className="px-3 py-2.5">
              <p className="truncate text-[13px] font-medium">{user.name}</p>
              <p className="truncate text-[12px] text-ink-400">{user.email}</p>
            </div>
            <div className="my-1 h-px bg-ink-900/[0.06]" />
            {demo && (
              <button role="menuitem" onClick={() => router.push("/login?switch=1")} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-ink-700 hover:bg-ink-50">
                <Repeat2 size={15} /> Switch persona
              </button>
            )}
            <button role="menuitem" onClick={() => doSignOut(demo, router)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-ink-700 hover:bg-ink-50">
              <LogOut size={15} /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      title="Demo mode: persona sign-in and sample data. Microsoft Entra ID sign-in replaces this in production."
      className={cn("inline-flex h-5 items-center gap-1 rounded-md bg-waiting-50 px-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-waiting ring-1 ring-inset ring-waiting/20", className)}
    >
      Demo
    </span>
  );
}
