"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import type { SessionUser } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Kbd } from "@/components/ui/badge";
import { Logo, LogoMark } from "./logo";
import { NAV, isActive } from "./nav";
import { DemoBadge, UserMenu } from "./user-menu";
import { CommandPalette } from "./command-palette";

/**
 * Monitoring & Management shell: a slim sidebar that stays out of the way,
 * a compact top bar + bottom tabs on mobile.
 */
export function WorkspaceShell({ user, demo, children }: { user: SessionUser; demo: boolean; children: React.ReactNode }) {
  const pathname = usePathname();
  const nav = NAV[user.role];
  const area = user.role === "monitoring" ? "Control center" : "Insights";

  return (
    <div className="min-h-dvh bg-paper">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ink-900 focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[232px] flex-col border-r border-ink-900/[0.06] bg-paper px-3 pb-3 pt-5 lg:flex">
        <div className="flex items-center justify-between px-2">
          <Link href={nav[0].href} aria-label="Overtime home">
            <Logo />
          </Link>
          {demo && <DemoBadge />}
        </div>
        <p className="mt-6 px-3 text-[11px] font-medium uppercase tracking-eyebrow text-ink-300">{area}</p>
        <nav aria-label="Main" className="mt-2 flex flex-col gap-0.5">
          {nav.map((item) => {
            const active = isActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn("relative flex h-9 items-center gap-2.5 rounded-lg px-3 text-[13.5px] font-medium transition-colors", active ? "text-ink-900" : "text-ink-500 hover:bg-ink-900/[0.03] hover:text-ink-900")}
              >
                {active && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-lg bg-white shadow-card ring-1 ring-ink-900/[0.06]" transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }} />}
                <item.icon size={16} className="relative" strokeWidth={active ? 2.2 : 1.8} />
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        {user.role === "monitoring" && (
          <Link
            href="/monitoring/new"
            className="group mt-5 flex h-10 items-center justify-center gap-2 rounded-xl bg-ink-900 text-[13px] font-medium text-white transition hover:bg-ink-800 active:scale-[0.98]"
          >
            <Plus size={15} className="transition-transform duration-300 group-hover:rotate-90" />
            New request
          </Link>
        )}
        <button
          onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
          className="mt-2 flex h-9 items-center gap-2 rounded-lg px-3 text-[13px] text-ink-400 transition hover:bg-ink-900/[0.03] hover:text-ink-700"
        >
          <Search size={14} />
          <span className="flex-1 text-left">Search</span>
          <Kbd>⌘K</Kbd>
        </button>
        <div className="mt-auto border-t border-ink-900/[0.06] pt-3">
          <UserMenu user={user} demo={demo} />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-ink-900/[0.06] bg-paper/85 px-4 backdrop-blur-xl lg:hidden">
        <Link href={nav[0].href} className="flex items-center gap-2" aria-label="Overtime home">
          <LogoMark />
          <span className="text-[15px] font-semibold tracking-[-0.03em]">{area}</span>
          {demo && <DemoBadge />}
        </Link>
        <div className="flex items-center gap-1">
          <button aria-label="Search" onClick={() => window.dispatchEvent(new Event("open-command-palette"))} className="grid h-9 w-9 place-items-center rounded-full text-ink-500 hover:bg-ink-900/5">
            <Search size={17} />
          </button>
          <UserMenu user={user} demo={demo} compact align="down" />
        </div>
      </header>

      <main id="main" className="pb-28 lg:pb-0 lg:pl-[232px]">
        <div className="mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-8 lg:px-12 lg:py-12">{children}</div>
      </main>

      {/* Mobile bottom tabs */}
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-900/[0.06] bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <div className="scrollbar-none flex items-stretch justify-around overflow-x-auto px-1">
          {nav.slice(0, user.role === "monitoring" ? 2 : 4).map((item) => (
            <MobileTab key={item.href} item={item} active={isActive(pathname, item)} />
          ))}
          {user.role === "monitoring" && (
            <>
              <Link href="/monitoring/new" aria-label="New request" className="flex flex-col items-center justify-center px-3 py-2">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-ink-900 text-white shadow-lift">
                  <Plus size={18} />
                </span>
              </Link>
              {nav.slice(2, 4).map((item) => (
                <MobileTab key={item.href} item={item} active={isActive(pathname, item)} />
              ))}
            </>
          )}
        </div>
      </nav>

      <CommandPalette role={user.role} demo={demo} />
    </div>
  );
}

function MobileTab({ item, active }: { item: (typeof NAV)["agent"][number]; active: boolean }) {
  return (
    <Link href={item.href} aria-current={active ? "page" : undefined} className={cn("flex min-w-[64px] flex-col items-center justify-center gap-1 px-2 py-2.5 text-[10.5px] font-medium", active ? "text-ink-900" : "text-ink-400")}>
      <item.icon size={19} strokeWidth={active ? 2.2 : 1.7} />
      <span className="truncate">{item.label.split(" ")[0]}</span>
    </Link>
  );
}
