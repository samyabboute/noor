"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import ProductVisual from "../../components/ProductVisual";
import Photo from "../../components/Photo";
import AddToBag from "../../components/AddToBag";
import Reveal from "../../components/Reveal";
import Footer from "../../components/Footer";
import { Reviews } from "../../components/SocialProof";
import { useStore } from "../../lib/store";
import { getProduct, shopProducts, formatPLN } from "../../lib/products";

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-nuit/10">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-4 text-left font-sans text-[12px] uppercase tracking-wide2"
      >
        {title}
        <span className="text-lg text-or">{open ? "−" : "+"}</span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden"
      >
        <div className="pb-5 font-sans text-[14px] leading-[1.8] text-nuit/70">{children}</div>
      </motion.div>
    </div>
  );
}

export default function ProductPage() {
  const params = useParams();
  const slug = String(params.slug);
  const { t, lang } = useStore();
  const product = getProduct(slug);
  const [view, setView] = useState(0);
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-ivoire px-6 text-center">
        <p className="font-serif text-3xl">404</p>
        <Link href="/kolekcja" className="btn-ghost">{t("collection.all")}</Link>
      </div>
    );
  }

  const isLimited = product.badge?.[lang]?.toLowerCase().includes("limit") || product.tier === "royal";
  const crossSell = shopProducts.filter((p) => p.slug !== product.slug).slice(0, 3);

  // Gallery: the signature case (SVG) alongside real Deglet Nour photography.
  type GalleryView =
    | { kind: "svg"; variant: "case" | "macro" }
    | { kind: "photo"; src: string; alt: string };
  const views: GalleryView[] = [
    { kind: "svg", variant: "case" },
    { kind: "photo", src: "/products/deglet-trio.webp", alt: `${product.name} — daktyle Deglet Nour` },
    { kind: "photo", src: "/products/deglet-single.webp", alt: `${product.name} — detal owocu` },
    { kind: "svg", variant: "macro" },
  ];
  const current = views[view] ?? views[0];

  return (
    <>
      <div className="bg-ivoire pt-24 md:pt-28">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-6 md:px-10 lg:grid-cols-2 lg:gap-16">
          {/* Gallery */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className={`overflow-hidden rounded-sm ${current.kind === "photo" ? "bg-ivoire" : "bg-nuit"}`}>
              {current.kind === "svg" ? (
                <ProductVisual slug={product.slug} variant={current.variant} className="aspect-square w-full" />
              ) : (
                <Photo src={current.src} alt={current.alt} blend className="aspect-square w-full" />
              )}
            </div>
            <div className="mt-4 flex gap-3">
              {views.map((v, i) => (
                <button
                  key={i}
                  onClick={() => setView(i)}
                  aria-label={`Widok ${i + 1}`}
                  className={`h-20 w-20 overflow-hidden rounded-sm border-2 transition ${
                    view === i ? "border-or" : "border-transparent opacity-60"
                  } ${v.kind === "photo" ? "bg-ivoire" : "bg-nuit"}`}
                >
                  {v.kind === "svg" ? (
                    <ProductVisual slug={product.slug} variant={v.variant} className="h-full w-full" />
                  ) : (
                    <Photo src={v.src} alt="" blend className="h-full w-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Buy panel */}
          <div className="pb-6">
            <Reveal>
              <Link href="/kolekcja" className="btn-line text-[11px] text-nuit/50">
                ← {t("collection.title")}
              </Link>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="display mt-6 text-5xl md:text-6xl">{product.name}</h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-3 font-serif text-xl italic text-nuit/70">{product.tagline[lang]}</p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-7 flex items-baseline gap-4">
                <span className="font-serif text-4xl">{formatPLN(product.price, lang)}</span>
                {product.compareAt && (
                  <>
                    <span className="font-sans text-lg text-nuit/40 line-through">
                      {formatPLN(product.compareAt, lang)}
                    </span>
                    <span className="rounded-full bg-or/15 px-3 py-1 font-sans text-[11px] uppercase tracking-wide2 text-or">
                      −{Math.round((1 - product.price / product.compareAt) * 100)}%
                    </span>
                  </>
                )}
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 font-sans text-[12px] text-nuit/60">
                <span className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${isLimited ? "bg-or" : "bg-green-700"}`} />
                  {isLimited ? t("pdp.lowstock") : t("pdp.instock")}
                </span>
                <span>· {t("pdp.deliveryEst")}</span>
              </div>
            </Reveal>

            {/* Quantity + Add */}
            <Reveal delay={0.25}>
              <div className="mt-8 flex items-stretch gap-4">
                <div className="flex items-center border border-nuit/25">
                  <button className="px-4 py-3.5 hover:bg-nuit/5" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="-">
                    −
                  </button>
                  <span className="w-10 text-center font-sans text-sm tabular-nums">{qty}</span>
                  <button className="px-4 py-3.5 hover:bg-nuit/5" onClick={() => setQty((q) => q + 1)} aria-label="+">
                    +
                  </button>
                </div>
                <div className="flex-1">
                  <AddToBag slug={product.slug} qty={qty} />
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="mt-4 flex items-center gap-3 rounded-sm bg-sable/50 px-4 py-3 font-sans text-[12px] text-nuit/70">
                <span className="text-or">✦</span>
                {t("pdp.giftnote")} · {t("bag.giftwrap")}
              </div>
            </Reveal>

            {/* Quantity incentive — elegant, never shouty */}
            {product.tier !== "royal" && (
              <Reveal delay={0.32}>
                <p className="mt-4 font-sans text-[12px] leading-relaxed text-nuit/50">
                  {lang === "pl"
                    ? "Bierzesz dwie szkatuły? Druga podróżuje bez kosztów dostawy."
                    : "Taking two cases? The second travels with delivery on us."}
                </p>
              </Reveal>
            )}

            {/* Details */}
            <Reveal delay={0.35}>
              <div className="mt-10">
                <Accordion title={`${t("pdp.taste")} · ${t("pdp.texture")}`}>
                  <p className="mb-2"><strong className="text-nuit">{t("pdp.taste")}.</strong> {product.taste[lang]}</p>
                  <p><strong className="text-nuit">{t("pdp.texture")}.</strong> {product.texture[lang]}</p>
                </Accordion>
                <Accordion title={`${t("pdp.variety")} · ${t("pdp.origin")}`}>
                  <p className="mb-2"><strong className="text-nuit">{t("pdp.variety")}.</strong> {product.variety[lang]}</p>
                  <p><strong className="text-nuit">{t("pdp.origin")}.</strong> {product.origin[lang]}</p>
                </Accordion>
                <Accordion title={`${t("pdp.weight")} · ${t("pdp.pieces")}`}>
                  <p>{product.weight} · {product.pieces}</p>
                </Accordion>
                <Accordion title={t("pdp.keep")}>
                  <p>{t("pdp.keep.v")}</p>
                </Accordion>
                <Accordion title={t("pdp.delivery")}>
                  <p>{t("pdp.delivery.v")}</p>
                </Accordion>
                <Accordion title={t("pdp.story")}>
                  <p>{product.story[lang]}</p>
                </Accordion>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Cross-sell */}
      <section className="bg-ivoire py-24 md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <Reveal>
            <p className="eyebrow text-center">{t("pdp.complete")}</p>
            <h2 className="display mt-3 text-center text-4xl md:text-5xl">{t("collection.eyebrow")}</h2>
          </Reveal>
          <div className="mt-14 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 md:gap-x-8">
            {crossSell.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.08}>
                <Link href={`/produkt/${p.slug}`} className="group block">
                  <div className="aspect-[4/5] overflow-hidden rounded-sm bg-nuit">
                    <ProductVisual
                      slug={p.slug}
                      className="h-full w-full transition-transform duration-[1200ms] ease-luxe group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <h3 className="font-serif text-lg">{p.name}</h3>
                    <span className="font-serif">{formatPLN(p.price, lang)}</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Reviews />
      <Footer />
    </>
  );
}
