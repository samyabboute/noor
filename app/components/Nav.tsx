"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { Logo } from "./Logo";
import CurrencySwitcher from "./CurrencySwitcher";
import { useStore } from "../lib/store";

const links = [
  { key: "nav.collection", href: "/kolekcja" },
  { key: "nav.date", href: "/#daktyl" },
  { key: "nav.craft", href: "/#rzemioslo" },
  { key: "nav.gift", href: "/#prezenty" },
  { key: "nav.corporate", href: "/#dla-firm" },
  { key: "nav.story", href: "/#dom-noor" },
];

export default function Nav() {
  const { t, lang, toggleLang, count, setBagOpen } = useStore();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const solid = scrolled || !isHome;

  // The admin console has its own chrome.
  if (pathname?.startsWith("/admin")) return null;

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-[100] transition-all duration-700 ease-luxe",
        menuOpen
          ? "text-ivoire"
          : solid
            ? "bg-paper/90 backdrop-blur-md text-ink border-b border-ink/10"
            : "bg-transparent text-ink",
      )}
    >
      {/* Legibility scrim — keeps the menu readable over any hero, without a
          solid bar, until the header goes solid on scroll. */}
      {!solid && !menuOpen && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-paper/80 via-paper/30 to-transparent"
        />
      )}
      <nav className="mx-auto flex max-w-[1440px] items-center justify-between gap-2 px-4 md:px-10 h-[72px] md:h-[84px]">
        {/* Left: mobile menu toggle */}
        <button
          className="-ml-1 flex items-center gap-2.5 p-1 lg:hidden"
          aria-label={menuOpen ? t("common.close") : "Menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="flex flex-col gap-1">
            <span className={clsx("block h-px w-5 bg-current transition-transform duration-300", menuOpen && "translate-y-[3px] rotate-45")} />
            <span className={clsx("block h-px w-5 bg-current transition-all duration-300", menuOpen && "opacity-0")} />
            <span className={clsx("block h-px w-5 bg-current transition-transform duration-300", menuOpen && "-translate-y-[3px] -rotate-45")} />
          </span>
          <span className="hidden font-sans text-[11.5px] uppercase tracking-[0.14em] opacity-75 sm:inline">{menuOpen ? t("common.close") : "Menu"}</span>
        </button>

        <Link href="/" className="lg:flex-none" aria-label="Maison Noor — home" onClick={() => setMenuOpen(false)}>
          <Logo />
        </Link>

        <div className="hidden lg:flex items-center gap-9 xl:gap-12">
          {links.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              className="group relative font-sans text-[13px] uppercase tracking-[0.13em] opacity-85 transition-opacity duration-300 hover:opacity-100"
            >
              {t(l.key)}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-or transition-transform duration-500 ease-luxe group-hover:scale-x-100"
              />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4 md:gap-7">
          <CurrencySwitcher className="hidden sm:block" />
          <Link
            href="/konto"
            className="hidden font-sans text-[11.5px] uppercase tracking-[0.14em] opacity-75 transition hover:opacity-100 lg:inline"
          >
            {lang === "pl" ? "Konto" : "Account"}
          </Link>
          <button
            onClick={toggleLang}
            className="hidden font-sans text-[11.5px] uppercase tracking-[0.14em] opacity-75 transition hover:opacity-100 sm:inline"
            aria-label="Change language"
          >
            <span className={clsx(lang === "pl" && "text-or")}>PL</span>
            <span className="opacity-40"> / </span>
            <span className={clsx(lang === "en" && "text-or")}>EN</span>
          </button>

          <button
            onClick={() => {
              setMenuOpen(false);
              setBagOpen(true);
            }}
            className="relative font-sans text-[12.5px] uppercase tracking-[0.13em] opacity-85 hover:opacity-100 transition"
            aria-label={t("nav.bag")}
          >
            {t("nav.bag")}
            <span className="ml-1.5 tabular-nums">({count})</span>
          </button>
        </div>
      </nav>

      {/* Full-screen menu (mobile / tablet) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 -z-10 flex flex-col bg-nuit lg:hidden"
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            {/* ambient light */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(70% 50% at 50% 30%, rgba(194,162,90,0.10), transparent 60%)" }}
            />
            <nav className="relative mt-auto flex flex-col px-6 pb-4">
              {links.map((l, i) => (
                <motion.div
                  key={l.key}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-baseline gap-4 border-b border-ivoire/10 py-4"
                  >
                    <span className="font-sans text-[11px] tabular-nums text-or">0{i + 1}</span>
                    <span className="font-serif text-[2rem] leading-none text-ivoire">{t(l.key)}</span>
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + links.length * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href="/konto"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-baseline gap-4 border-b border-ivoire/10 py-4"
                >
                  <span className="font-sans text-[11px] tabular-nums text-or">✦</span>
                  <span className="font-serif text-[2rem] leading-none text-ivoire">{lang === "pl" ? "Konto" : "Account"}</span>
                </Link>
              </motion.div>
            </nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="relative mt-auto flex items-center justify-between px-6 pb-10 pt-6"
            >
              <button onClick={toggleLang} className="font-sans text-[11px] uppercase tracking-wide2">
                <span className={clsx(lang === "pl" && "text-or")}>Polski</span>
                <span className="opacity-40"> / </span>
                <span className={clsx(lang === "en" && "text-or")}>English</span>
              </button>
              <CurrencySwitcher />
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setBagOpen(true);
                }}
                className="font-sans text-[11px] uppercase tracking-wide2"
              >
                {t("nav.bag")} ({count})
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
