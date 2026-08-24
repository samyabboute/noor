"use client";

import Link from "next/link";
import ProductVisual from "./ProductVisual";
import { useStore } from "../lib/store";
import { CATEGORY_LABELS, type Product } from "../lib/products";

export default function ProductCard({ product }: { product: Product }) {
  const { t, lang, money } = useStore();
  const isCorporate = product.tier === "corporate";

  return (
    <Link href={isCorporate ? "/#dla-firm" : `/produkt/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-paper2">
        <ProductVisual
          slug={product.slug}
          className="h-full w-full transition-transform duration-[1400ms] ease-luxe group-hover:scale-[1.06]"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-nuit/95 px-2.5 py-1 font-sans text-[9px] uppercase tracking-[0.1em] text-ivoire sm:left-4 sm:top-4 sm:px-3 sm:text-[10px] sm:tracking-wide2">
            {product.badge[lang]}
          </span>
        )}
        {/* hover reveal: a line CTA drawn in from the bottom */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-nuit/90 to-transparent px-5 py-5 text-ivoire transition-transform duration-700 ease-luxe group-hover:translate-y-0">
          <span className="btn-line text-orclair">{t("collection.view")}</span>
        </div>
      </div>

      <div className="mt-3.5 sm:mt-4">
        <p className="font-sans text-[9.5px] uppercase tracking-[0.22em] text-or/80 sm:text-[10px]">
          {CATEGORY_LABELS[product.category][lang]}
        </p>
        <div className="mt-1.5 flex items-start justify-between gap-2.5">
          <h3 className="font-serif text-[17px] leading-snug sm:text-xl">{product.name}</h3>
          {isCorporate ? (
            <span className="shrink-0 whitespace-nowrap pt-0.5 font-sans text-[11px] uppercase tracking-wide2 text-or">{t("corp.cta")}</span>
          ) : (
            <span className="shrink-0 font-serif text-[15px] text-ink sm:text-lg">{money(product.price)}</span>
          )}
        </div>
        <p className="mt-1 font-sans text-[11px] text-ink/55 sm:text-[12px]">{product.variety[lang]}</p>
      </div>
    </Link>
  );
}
