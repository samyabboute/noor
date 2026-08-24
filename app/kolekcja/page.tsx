"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Reveal from "../components/Reveal";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import { useStore } from "../lib/store";
import { shopProducts, CATEGORY_LABELS, CATEGORY_ORDER, type Category } from "../lib/products";

type Filter = "all" | Category;

export default function KolekcjaPage() {
  const { t, lang } = useStore();
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState<Filter>("all");
  const pl = lang === "pl";

  const filters: { key: Filter; label: string }[] = useMemo(
    () => [
      { key: "all", label: pl ? "Wszystko" : "All" },
      ...CATEGORY_ORDER.map((c) => ({ key: c as Filter, label: CATEGORY_LABELS[c][lang] })),
    ],
    [lang, pl],
  );

  const visible = useMemo(
    () => (filter === "all" ? shopProducts : shopProducts.filter((p) => p.category === filter)),
    [filter],
  );

  return (
    <>
      <section className="bg-paper px-6 pt-28 pb-10 text-center md:px-10 md:pt-40">
        <Reveal><p className="eyebrow">{t("collection.eyebrow")}</p></Reveal>
        <Reveal delay={0.05} variant="mask">
          <h1 className="display mt-4 text-6xl md:text-8xl">{t("collection.title")}</h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-lg font-sans text-[14px] leading-[1.9] text-ink/60">
            {t("collection.body")}
          </p>
        </Reveal>
      </section>

      {/* The filter — a quiet typographic index, not a row of buttons */}
      <section className="bg-paper px-6 md:px-10">
        <Reveal delay={0.14}>
          <nav
            aria-label={pl ? "Filtr kolekcji" : "Collection filter"}
            className="mx-auto flex max-w-[1400px] flex-nowrap items-center justify-start gap-x-7 gap-y-3 overflow-x-auto border-y border-ink/10 py-5 sm:flex-wrap sm:justify-center sm:gap-x-10 sm:overflow-visible"
          >
            {filters.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  aria-pressed={active}
                  className="group relative shrink-0 whitespace-nowrap pb-1 font-sans text-[11px] uppercase tracking-[0.24em] transition-colors duration-300"
                >
                  <span className={active ? "text-ink" : "text-ink/40 group-hover:text-ink/70"}>{f.label}</span>
                  <span
                    className={`absolute -bottom-[1px] left-0 h-px bg-or transition-all duration-500 ease-luxe ${
                      active ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-40"
                    }`}
                  />
                </button>
              );
            })}
          </nav>
        </Reveal>
      </section>

      <section className="bg-paper px-6 pt-12 pb-20 md:px-10">
        <motion.div
          layout={!reduce}
          className="mx-auto grid max-w-[1400px] grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-3 md:gap-x-8 lg:grid-cols-4"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((p, i) => (
              <motion.div
                key={p.slug}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: reduce ? 0 : (i % 4) * 0.05 }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Corporate teaser */}
        <Reveal>
          <div className="mx-auto mt-20 flex max-w-[1400px] flex-col items-center justify-between gap-6 rounded-sm bg-ombre px-8 py-12 text-center text-ivoire md:flex-row md:text-left">
            <div>
              <p className="eyebrow">{t("corp.eyebrow")}</p>
              <h2 className="display mt-2 text-3xl md:text-4xl">{t("corp.title")}</h2>
            </div>
            <Link href="/#dla-firm" className="btn-solid-invert">
              {t("corp.cta")}
            </Link>
          </div>
        </Reveal>
      </section>
      <Footer />
    </>
  );
}
