"use client";

import Link from "next/link";
import Reveal from "../components/Reveal";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import { useStore } from "../lib/store";
import { shopProducts } from "../lib/products";

export default function KolekcjaPage() {
  const { t } = useStore();
  return (
    <>
      <section className="bg-ivoire px-6 pt-32 pb-16 text-center md:px-10 md:pt-40">
        <Reveal><p className="eyebrow">{t("collection.eyebrow")}</p></Reveal>
        <Reveal delay={0.05}>
          <h1 className="display mt-4 text-6xl md:text-8xl">{t("collection.title")}</h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-lg font-sans text-[14px] leading-[1.9] text-nuit/60">
            {t("collection.body")}
          </p>
        </Reveal>
      </section>

      <section className="bg-ivoire px-6 pb-28 md:px-10">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-3 md:gap-x-8 lg:grid-cols-4">
          {shopProducts.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 4) * 0.06}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>

        {/* Corporate teaser */}
        <Reveal>
          <div className="mx-auto mt-20 flex max-w-[1400px] flex-col items-center justify-between gap-6 rounded-sm bg-nuit px-8 py-12 text-center text-ivoire md:flex-row md:text-left">
            <div>
              <p className="eyebrow">{t("corp.eyebrow")}</p>
              <h2 className="display mt-2 text-3xl md:text-4xl">{t("corp.title")}</h2>
            </div>
            <Link href="/#dla-firm" className="btn-solid bg-ivoire text-nuit hover:bg-orclair">
              {t("corp.cta")}
            </Link>
          </div>
        </Reveal>
      </section>
      <Footer />
    </>
  );
}
