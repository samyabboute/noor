"use client";

import Link from "next/link";
import { Logo } from "./components/Logo";
import NoorPattern from "./components/NoorPattern";
import { useStore } from "./lib/store";

export default function NotFound() {
  const { lang } = useStore();
  const pl = lang === "pl";
  return (
    <section className="relative isolate flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden bg-paper px-6 text-center text-ink">
      <NoorPattern placement="edges" color="#122A20" opacity={0.04} scale={150} />
      <Link href="/" aria-label="Maison Noor">
        <Logo size="lg" mono className="text-ink" />
      </Link>
      <div>
        <p className="font-serif text-[64px] font-light leading-none text-ink/90 md:text-8xl">404</p>
        <p className="mx-auto mt-5 max-w-sm font-sans text-[14px] leading-relaxed text-ink/55">
          {pl
            ? "Ta strona zgasła. Ale światło Noor wciąż czeka na Ciebie w kolekcji."
            : "This page has gone dark. The light of Noor still waits for you in the collection."}
        </p>
      </div>
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <Link href="/kolekcja" className="btn-solid">
          {pl ? "Zobacz kolekcję" : "View the collection"}
        </Link>
        <Link href="/" className="btn-line text-[12px] text-ink/70">
          {pl ? "Wróć do domu Noor" : "Return to Maison Noor"}
        </Link>
      </div>
    </section>
  );
}
