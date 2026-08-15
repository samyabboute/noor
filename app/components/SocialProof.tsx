"use client";

import Reveal from "./Reveal";
import ProductVisual from "./ProductVisual";
import { useStore } from "../lib/store";
import { products } from "../lib/products";

const reviews: { pl: string; en: string; who: string; city: string }[] = [
  {
    pl: "Zamówiłam jako prezent dla klienta. Reakcja przy otwieraniu szkatuły była bezcenna. To nie są daktyle — to gest.",
    en: "I ordered this as a client gift. The reaction on opening the case was priceless. These aren't dates — they're a gesture.",
    who: "Katarzyna W.",
    city: "Warszawa",
  },
  {
    pl: "Najlepsze daktyle, jakie jadłem. Cœur de Noor z migdałem to poziom najlepszej czekoladerni.",
    en: "The best dates I have ever eaten. Cœur de Noor with almond is on the level of the finest chocolatier.",
    who: "Michał R.",
    city: "Kraków",
  },
  {
    pl: "Opakowanie godne domu mody. Zamawiam co miesiąc, odkąd odkryłam markę na Wilczej.",
    en: "Packaging worthy of a fashion house. I've ordered every month since I discovered the brand.",
    who: "Anna L.",
    city: "Wrocław",
  },
];

function Stars() {
  return (
    <div className="flex gap-1 text-or" aria-label="5 / 5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-current">
          <path d="M10 1l2.6 5.6L18 7.3l-4 4 1 5.7L10 14l-5 3 1-5.7-4-4 5.4-.7z" />
        </svg>
      ))}
    </div>
  );
}

export function Reviews() {
  const { t, lang } = useStore();
  return (
    <section id="opinie" className="bg-nuit py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="mb-14 text-center">
          <Reveal><p className="section-index">{t("reviews.index")}</p></Reveal>
          <Reveal delay={0.05}><p className="eyebrow mt-5">{t("reviews.eyebrow")}</p></Reveal>
          <Reveal delay={0.1}><h2 className="display mt-3 text-4xl md:text-6xl">{t("reviews.title")}</h2></Reveal>
          <Reveal delay={0.15}>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Stars />
              <span className="font-sans text-[12px] uppercase tracking-wide2 text-ivoire/50">
                4.9 / 5 · 1 240+ {lang === "pl" ? "opinii" : "reviews"}
              </span>
            </div>
          </Reveal>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {reviews.map((r, i) => (
            <Reveal key={r.who} delay={i * 0.1}>
              <figure className="flex h-full flex-col border-t border-ivoire/15 pt-7">
                <Stars />
                <blockquote className="mt-5 flex-1 font-serif text-xl leading-[1.5] text-ivoire/90">
                  “{lang === "pl" ? r.pl : r.en}”
                </blockquote>
                <figcaption className="mt-6 font-sans text-[12px] uppercase tracking-wide2 text-ivoire/50">
                  {r.who} · {r.city}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Instagram() {
  const { t } = useStore();
  const tiles = products.slice(0, 6);
  return (
    <section id="lifestyle" className="bg-nuit py-20 text-ivoire">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="mb-10 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <p className="section-index text-ivoire/40">{t("ig.index")}</p>
            <h2 className="display mt-2 text-3xl md:text-4xl">
              {t("ig.title")} <span className="text-orclair">{t("ig.eyebrow")}</span>
            </h2>
          </div>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="btn-line text-orclair">
            {t("ig.cta")}
          </a>
        </div>
        <div className="grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-3">
          {tiles.map((p, i) => (
            <div key={p.slug} className="group relative aspect-square overflow-hidden rounded-sm">
              <ProductVisual
                slug={p.slug}
                variant={i % 2 === 0 ? "case" : "macro"}
                className="h-full w-full transition-transform duration-[1200ms] ease-luxe group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-nuit/0 transition-colors duration-500 group-hover:bg-nuit/20" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
