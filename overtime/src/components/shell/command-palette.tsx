"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CornerDownLeft, LogOut, Plus, Repeat2, Search } from "lucide-react";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Kbd } from "@/components/ui/badge";
import { NAV } from "./nav";
import { doSignOut } from "./user-menu";

interface Cmd {
  id: string;
  label: string;
  group: string;
  icon: React.ReactNode;
  run: () => void;
  keywords?: string;
}

/** ⌘K — jump anywhere, or start the one thing you came to do. */
export function CommandPalette({ role, demo }: { role: Role; demo: boolean }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      setTimeout(() => input.current?.focus(), 20);
    }
  }, [open]);

  const cmds: Cmd[] = useMemo(() => {
    const go = (href: string) => () => {
      setOpen(false);
      router.push(href);
    };
    const list: Cmd[] = [];
    if (role === "monitoring") list.push({ id: "new", label: "Create overtime request", group: "Actions", icon: <Plus size={16} />, run: go("/monitoring/new"), keywords: "new launch send" });
    for (const n of NAV[role]) list.push({ id: n.href, label: n.label, group: "Go to", icon: <n.icon size={16} />, run: go(n.href) });
    if (demo) list.push({ id: "switch", label: "Switch persona", group: "Account", icon: <Repeat2 size={16} />, run: go("/login?switch=1"), keywords: "demo role" });
    list.push({ id: "out", label: "Sign out", group: "Account", icon: <LogOut size={16} />, run: () => doSignOut(demo, router) });
    return list;
  }, [role, demo, router]);

  const filtered = cmds.filter((c) => (c.label + " " + (c.keywords || "")).toLowerCase().includes(q.toLowerCase()));
  const groups = [...new Set(filtered.map((c) => c.group))];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[14vh]">
          <motion.div className="absolute inset-0 bg-ink-900/30 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12 } }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-float ring-1 ring-ink-900/[0.08]"
          >
            <div className="flex items-center gap-3 border-b border-ink-900/[0.06] px-4">
              <Search size={17} className="text-ink-400" />
              <input
                ref={input}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActive(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActive((a) => Math.min(filtered.length - 1, a + 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive((a) => Math.max(0, a - 1));
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    filtered[active]?.run();
                  } else if (e.key === "Escape") setOpen(false);
                }}
                placeholder="Type a command or search…"
                aria-label="Search commands"
                role="combobox"
                aria-expanded="true"
                aria-controls="cmd-list"
                aria-activedescendant={filtered[active] ? `cmd-${filtered[active].id}` : undefined}
                className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-300"
              />
              <Kbd>esc</Kbd>
            </div>
            <ul id="cmd-list" role="listbox" className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 && <li className="px-3 py-8 text-center text-sm text-ink-400">Nothing matches “{q}”.</li>}
              {groups.map((g) => (
                <li key={g} role="presentation">
                  <p className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-eyebrow text-ink-400">{g}</p>
                  <ul role="presentation">
                    {filtered
                      .filter((c) => c.group === g)
                      .map((c) => {
                        const i = filtered.indexOf(c);
                        return (
                          <li
                            key={c.id}
                            id={`cmd-${c.id}`}
                            role="option"
                            aria-selected={i === active}
                            onMouseEnter={() => setActive(i)}
                            onClick={c.run}
                            className={cn("flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm", i === active ? "bg-ink-900 text-white" : "text-ink-700")}
                          >
                            <span className={i === active ? "text-white/70" : "text-ink-400"}>{c.icon}</span>
                            <span className="flex-1">{c.label}</span>
                            {i === active ? <CornerDownLeft size={14} className="text-white/60" /> : <ArrowRight size={14} className="opacity-0" />}
                          </li>
                        );
                      })}
                  </ul>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
