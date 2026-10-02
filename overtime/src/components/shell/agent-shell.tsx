"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { SessionUser } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Logo } from "./logo";
import { NAV, isActive } from "./nav";
import { DemoBadge, UserMenu } from "./user-menu";
import { CommandPalette } from "./command-palette";

/** The agent gets no dashboard chrome — a quiet header and the page. */
export function AgentShell({ user, demo, sso = false, children }: { user: SessionUser; demo: boolean; sso?: boolean; children: React.ReactNode }) {
  const pathname = usePathname();
  const nav = NAV.agent;
  return (
    <div className="min-h-dvh bg-paper">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ink-900 focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-transparent bg-paper/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-4 px-4 sm:px-8">
          <div className="flex items-center gap-2.5">
            <Link href="/agent" aria-label="Overtime home">
              <Logo />
            </Link>
            {demo && <DemoBadge />}
          </div>
          <nav aria-label="Main" className="hidden items-center gap-1 rounded-full bg-ink-900/[0.04] p-1 sm:flex">
            {nav.map((item) => {
              const active = isActive(pathname, item);
              return (
                <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn("relative rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors", active ? "text-ink-900" : "text-ink-500 hover:text-ink-900")}>
                  {active && <motion.span layoutId="agent-nav" className="absolute inset-0 rounded-full bg-white shadow-card ring-1 ring-ink-900/[0.06]" transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }} />}
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <UserMenu user={user} demo={demo} sso={sso} compact align="down" />
        </div>
      </header>
      <main id="main" className="pb-28 sm:pb-16">
        {children}
      </main>
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-ink-900/[0.06] bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:hidden">
        {nav.map((item) => {
          const active = isActive(pathname, item);
          return (
            <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn("flex flex-1 flex-col items-center gap-1 py-2.5 text-[10.5px] font-medium", active ? "text-ink-900" : "text-ink-400")}>
              <item.icon size={19} strokeWidth={active ? 2.2 : 1.7} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <CommandPalette role="agent" demo={demo} sso={sso} />
    </div>
  );
}
