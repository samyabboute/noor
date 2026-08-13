"use client";

import { useStore } from "../lib/store";

const items = [
  { k: "trust.origin", d: "trust.origin.d" },
  { k: "trust.handmade", d: "trust.handmade.d" },
  { k: "trust.ship", d: "trust.ship.d" },
  { k: "trust.pay", d: "trust.pay.d" },
];

export default function TrustBar() {
  const { t } = useStore();
  return (
    <section className="border-y border-nuit/10 bg-ivoire">
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 divide-nuit/10 md:grid-cols-4 md:divide-x">
        {items.map((it) => (
          <div key={it.k} className="px-6 py-7 text-center md:py-8">
            <p className="font-serif text-lg text-nuit md:text-xl">{t(it.k)}</p>
            <p className="mt-1 font-sans text-[11px] uppercase tracking-wide2 text-nuit/45">{t(it.d)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
