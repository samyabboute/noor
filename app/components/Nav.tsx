"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Logo } from "./Logo";
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

  // The transparent, light-on-dark treatment only makes sense over the hero.
  // Everywhere else the nav is solid so it stays legible.
  const solid = scrolled || !isHome;

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-50 transition-all duration-700 ease-luxe",
        solid ? "bg-ivoire/90 backdrop-blur-md text-nuit border-b border-nuit/10" : "bg-transparent text-ivoire",
      )}
    >
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between gap-2 px-4 md:px-10 h-[64px] md:h-[68px]">
        {/* Left: mobile menu toggle */}
        <button
          className="lg:hidden -ml-1 p-1"
          aria-label="Menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="block h-px w-6 bg-current" />
          <span className="mt-1.5 block h-px w-6 bg-current" />
          <span className="mt-1.5 block h-px w-4 bg-current" />
        </button>

        <Link href="/" className="lg:flex-none" aria-label="Maison Noor — home">
          <Logo />
        </Link>

        <div className="hidden lg:flex items-center gap-8 xl:gap-10">
          {links.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              className="font-sans text-[12px] uppercase tracking-wide2 opacity-80 transition-opacity duration-300 hover:opacity-100"
            >
              {t(l.key)}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <button
            onClick={toggleLang}
            className="font-sans text-[11px] uppercase tracking-wide2 opacity-80 hover:opacity-100 transition"
            aria-label="Change language"
          >
            <span className={clsx(lang === "pl" && "text-or")}>PL</span>
            <span className="opacity-40"> / </span>
            <span className={clsx(lang === "en" && "text-or")}>EN</span>
          </button>

          <button
            onClick={() => setBagOpen(true)}
            className="relative font-sans text-[12px] uppercase tracking-wide2 opacity-90 hover:opacity-100 transition"
            aria-label={t("nav.bag")}
          >
            {t("nav.bag")}
            <span className="ml-1.5 tabular-nums">({count})</span>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={clsx(
          "lg:hidden overflow-hidden bg-nuit text-ivoire transition-all duration-500 ease-luxe",
          menuOpen ? "max-h-[420px] border-t border-ivoire/10" : "max-h-0",
        )}
      >
        <div className="flex flex-col px-6 py-4">
          {links.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="border-b border-ivoire/10 py-4 font-serif text-2xl"
            >
              {t(l.key)}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
