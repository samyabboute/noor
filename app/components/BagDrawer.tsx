"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import ProductVisual from "./ProductVisual";
import { useStore } from "../lib/store";
import {
  products,
  shopProducts,
  getProduct,
  formatPLN,
  FREE_SHIPPING_THRESHOLD,
} from "../lib/products";

export default function BagDrawer() {
  const {
    bagOpen,
    setBagOpen,
    cart,
    setQty,
    removeFromCart,
    addToCart,
    subtotal,
    shipping,
    total,
    remainingForFreeShipping,
    lang,
    t,
  } = useStore();

  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  // Cross-sell: intelligent — suggest signatures not already in the bag.
  const inBag = new Set(cart.map((l) => l.slug));
  const suggestions = shopProducts.filter((p) => !inBag.has(p.slug)).slice(0, 2);

  return (
    <AnimatePresence>
      {bagOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-nuit/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setBagOpen(false)}
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-[80] flex w-full max-w-[440px] flex-col bg-ivoire text-nuit shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            aria-label={t("bag.title")}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-nuit/10 px-6 py-5">
              <h2 className="font-serif text-2xl">{t("bag.title")}</h2>
              <button onClick={() => setBagOpen(false)} className="btn-line text-[11px]">
                {t("common.close")}
              </button>
            </div>

            {/* Free-shipping progress — a gentle, luxurious nudge */}
            <div className="border-b border-nuit/10 px-6 py-4">
              <p className="font-sans text-[12px] leading-relaxed text-nuit/70">
                {remainingForFreeShipping > 0 ? (
                  lang === "pl" ? (
                    <>
                      {t("bag.freeProgressA")}{" "}
                      <span className="font-medium text-or">{formatPLN(remainingForFreeShipping, lang)}</span>.
                    </>
                  ) : (
                    <>
                      {t("bag.freeProgressA")}{" "}
                      <span className="font-medium text-or">{formatPLN(remainingForFreeShipping, lang)}</span>{" "}
                      {t("bag.freeProgressB")}.
                    </>
                  )
                ) : (
                  <span className="text-or">{t("bag.freeDone")}</span>
                )}
              </p>
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-nuit/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-or to-orclair"
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>

            {/* Lines */}
            <div className="flex-1 overflow-y-auto px-6">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
                  <p className="font-serif text-xl text-nuit/60">{t("bag.empty")}</p>
                  <Link href="/kolekcja" onClick={() => setBagOpen(false)} className="btn-ghost">
                    {t("bag.emptyCta")}
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-nuit/10">
                  {cart.map((line) => {
                    const p = getProduct(line.slug);
                    if (!p) return null;
                    return (
                      <li key={line.slug} className="flex gap-4 py-5">
                        <Link
                          href={`/produkt/${p.slug}`}
                          onClick={() => setBagOpen(false)}
                          className="h-24 w-20 flex-none overflow-hidden rounded-sm bg-nuit"
                        >
                          <ProductVisual slug={p.slug} className="h-full w-full" />
                        </Link>
                        <div className="flex flex-1 flex-col">
                          <div className="flex justify-between gap-2">
                            <h3 className="font-serif text-lg leading-tight">{p.name}</h3>
                            <span className="font-serif text-base">{formatPLN(p.price * line.qty, lang)}</span>
                          </div>
                          <p className="mt-0.5 font-sans text-[11px] text-nuit/50">{p.weight} · {p.pieces}</p>
                          <div className="mt-auto flex items-center justify-between pt-3">
                            <div className="flex items-center border border-nuit/20">
                              <button
                                className="px-3 py-1.5 text-sm hover:bg-nuit/5"
                                onClick={() => setQty(line.slug, line.qty - 1)}
                                aria-label="-"
                              >
                                −
                              </button>
                              <span className="w-8 text-center font-sans text-[13px] tabular-nums">{line.qty}</span>
                              <button
                                className="px-3 py-1.5 text-sm hover:bg-nuit/5"
                                onClick={() => setQty(line.slug, line.qty + 1)}
                                aria-label="+"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(line.slug)}
                              className="font-sans text-[11px] uppercase tracking-wide2 text-nuit/40 hover:text-nuit"
                            >
                              {t("bag.remove")}
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Cross-sell */}
              {cart.length > 0 && suggestions.length > 0 && (
                <div className="border-t border-nuit/10 py-6">
                  <p className="eyebrow mb-4 text-nuit/40">{t("bag.crosssell")}</p>
                  <div className="space-y-3">
                    {suggestions.map((s) => (
                      <div key={s.slug} className="flex items-center gap-3">
                        <div className="h-14 w-14 flex-none overflow-hidden rounded-sm bg-nuit">
                          <ProductVisual slug={s.slug} className="h-full w-full" />
                        </div>
                        <div className="flex-1">
                          <p className="font-serif text-[15px] leading-tight">{s.name}</p>
                          <p className="font-sans text-[12px] text-nuit/50">{formatPLN(s.price, lang)}</p>
                        </div>
                        <button
                          onClick={() => addToCart(s.slug, 1)}
                          className="font-sans text-[11px] uppercase tracking-wide2 text-or hover:text-nuit"
                        >
                          + {t("bag.add")}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer / totals */}
            {cart.length > 0 && (
              <div className="border-t border-nuit/10 px-6 py-5">
                <div className="space-y-1.5 font-sans text-[13px]">
                  <div className="flex justify-between text-nuit/60">
                    <span>{t("bag.subtotal")}</span>
                    <span>{formatPLN(subtotal, lang)}</span>
                  </div>
                  <div className="flex justify-between text-nuit/60">
                    <span>{t("bag.shipping")}</span>
                    <span>{shipping === 0 ? t("bag.free") : formatPLN(shipping, lang)}</span>
                  </div>
                  <div className="flex justify-between pt-2 font-serif text-xl text-nuit">
                    <span>{t("bag.total")}</span>
                    <span>{formatPLN(total, lang)}</span>
                  </div>
                </div>
                <p className="mt-3 text-center font-sans text-[11px] uppercase tracking-wide2 text-or/80">
                  ✦ {t("bag.giftwrap")}
                </p>
                <Link href="/checkout" onClick={() => setBagOpen(false)} className="btn-solid mt-4 w-full">
                  {t("bag.checkout")}
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
