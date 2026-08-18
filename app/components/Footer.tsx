"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import NoorPattern from "./NoorPattern";
import { useStore } from "../lib/store";

export default function Footer() {
  const { t } = useStore();
  const cols = [
    {
      head: "footer.shop",
      links: [
        { label: "nav.collection", href: "/kolekcja" },
        { label: "nav.gift", href: "/#prezenty" },
        { label: "nav.corporate", href: "/#dla-firm" },
      ],
    },
    {
      head: "footer.house",
      links: [
        { label: "nav.story", href: "/#dom-noor" },
        { label: "nav.craft", href: "/#rzemioslo" },
        { label: "reviews.index", href: "/#opinie" },
      ],
    },
  ];

  return (
    <footer className="relative isolate overflow-hidden bg-nuit pt-20 text-ivoire">
      <NoorPattern placement="bottom" opacity={0.045} scale={126} />
      <div className="relative mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="grid gap-12 pb-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo size="md" />
            <p className="mt-5 max-w-xs font-serif text-2xl italic text-ivoire/70">{t("footer.tagline")}</p>
            <p className="mt-6 font-sans text-[12px] leading-relaxed text-ivoire/40">{t("footer.made")}</p>
          </div>

          {cols.map((c) => (
            <div key={c.head}>
              <p className="font-sans text-[11px] uppercase tracking-luxe text-or">{t(c.head)}</p>
              <ul className="mt-5 space-y-3">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="font-sans text-[13px] text-ivoire/70 transition hover:text-ivoire">
                      {t(l.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="font-sans text-[11px] uppercase tracking-luxe text-or">{t("footer.care")}</p>
            <ul className="mt-5 space-y-3 font-sans text-[13px] text-ivoire/70">
              <li>kontakt@maisonnoor.pl</li>
              <li>+48 22 000 00 00</li>
              <li>ul. Wilcza, Warszawa</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 border-t border-ivoire/10 py-8 md:flex-row">
          <p className="text-center font-sans text-[11px] uppercase tracking-wide2 text-ivoire/35 md:text-left">
            © {new Date().getFullYear()} Maison Noor · {t("footer.rights")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 font-sans text-[10px] uppercase tracking-wide2 text-ivoire/40 md:justify-end md:gap-3">
            {["BLIK", "Przelewy24", "Visa", "Mastercard", "Apple Pay", "Google Pay"].map((p) => (
              <span key={p} className="rounded border border-ivoire/15 px-2.5 py-1">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
