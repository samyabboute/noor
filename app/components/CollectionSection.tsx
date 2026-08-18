"use client";

import Link from "next/link";
import Reveal from "./Reveal";
import ProductCard from "./ProductCard";
import { useStore } from "../lib/store";
import { shopProducts } from "../lib/products";

export default function CollectionSection() {
  const { t } = useStore();
  const featured = shopProducts.slice(0, 4);

  return (
    <section id="kolekcja" className="bg-nuit py-16 md:py-36">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="mb-14 flex flex-col items-start justify-between gap-6 md:mb-20 md:flex-row md:items-end">
          <div>
            <Reveal>
              <p className="section-index">{t("collection.index")}</p>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="eyebrow mt-5">{t("collection.eyebrow")}</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="display mt-3 text-5xl md:text-7xl">{t("collection.title")}</h2>
            </Reveal>
          </div>
          <Reveal delay={0.15}>
            <p className="max-w-sm font-sans text-[14px] leading-[1.9] text-ivoire/60">{t("collection.body")}</p>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
          {featured.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.08}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-16 text-center">
            <Link href="/kolekcja" className="btn-ghost">
              {t("collection.all")}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
