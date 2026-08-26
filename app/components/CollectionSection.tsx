"use client";

import Link from "next/link";
import Reveal from "./Reveal";
import SectionIndex from "./SectionIndex";
import ProductCard from "./ProductCard";
import NoorPattern from "./NoorPattern";
import { useStore } from "../lib/store";
import { shopProducts } from "../lib/products";

export default function CollectionSection() {
  const { t } = useStore();
  const featured = shopProducts.slice(0, 4);

  return (
    <section id="kolekcja" className="relative isolate overflow-hidden bg-paper pad-y">
      {/* Arabesque, engraved into the cream — ink ton-sur-ton, barely there */}
      <NoorPattern placement="edges" color="#122A20" opacity={0.04} scale={140} />
      <div className="relative mx-auto max-w-[1400px] px-6 md:px-10">
        {/* The overture — the collection is introduced, not dropped into a grid */}
        <div className="mx-auto mb-16 max-w-2xl text-center md:mb-24">
          <Reveal>
            <SectionIndex>{t("collection.index")}</SectionIndex>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="eyebrow mt-6">{t("collection.eyebrow")}</p>
          </Reveal>
          <Reveal delay={0.1} variant="mask">
            <h2 className="display mt-4 text-6xl leading-[0.98] md:text-8xl">{t("collection.title")}</h2>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="mx-auto mt-8 h-px w-16 bg-or/40" />
          </Reveal>
          <Reveal delay={0.22}>
            <p className="mx-auto mt-8 max-w-md font-sans text-[14.5px] leading-[1.9] text-ink/60">{t("collection.body")}</p>
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
