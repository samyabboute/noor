"use client";

import Link from "next/link";
import ProductVisual from "./ProductVisual";
import { useStore } from "../lib/store";
import { formatPLN, type Product } from "../lib/products";

export default function ProductCard({ product }: { product: Product }) {
  const { t, lang } = useStore();
  const isCorporate = product.tier === "corporate";

  return (
    <Link href={isCorporate ? "/#dla-firm" : `/produkt/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-nuit">
        <ProductVisual
          slug={product.slug}
          className="h-full w-full transition-transform duration-[1400ms] ease-luxe group-hover:scale-[1.06]"
        />
        {product.badge && (
          <span className="absolute left-4 top-4 rounded-full bg-ivoire/90 px-3 py-1 font-sans text-[10px] uppercase tracking-wide2 text-nuit">
            {product.badge[lang]}
          </span>
        )}
        {/* hover reveal: a line CTA drawn in from the bottom */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-nuit/90 to-transparent px-5 py-5 text-ivoire transition-transform duration-700 ease-luxe group-hover:translate-y-0">
          <span className="btn-line text-orclair">{t("collection.view")}</span>
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-3">
        <div>
          <h3 className="font-serif text-xl leading-tight">{product.name}</h3>
          <p className="mt-0.5 font-sans text-[12px] text-nuit/50">{product.variety[lang]}</p>
        </div>
        <div className="text-right">
          {isCorporate ? (
            <span className="font-sans text-[12px] uppercase tracking-wide2 text-or">{t("corp.cta")}</span>
          ) : (
            <span className="font-serif text-lg text-nuit">{formatPLN(product.price, lang)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
