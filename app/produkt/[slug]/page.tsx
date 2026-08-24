"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import clsx from "clsx";
import Photo from "../../components/Photo";
import AddToBag from "../../components/AddToBag";
import Reveal from "../../components/Reveal";
import Footer from "../../components/Footer";
import { Reviews } from "../../components/SocialProof";
import { useStore } from "../../lib/store";
import { getProduct, shopProducts } from "../../lib/products";

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-ink/10">
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
        <div className="pb-5 font-sans text-[14px] leading-[1.8] text-ink/70">{children}</div>
      </motion.div>
    </div>
  );
}

export default function ProductPage() {
  const params = useParams();
  const slug = String(params.slug);
  const { t, lang, money } = useStore();
  const product = getProduct(slug);
  const [view, setView] = useState(0);
  const [qty, setQty] = useState(1);

  // Sticky mobile add-to-cart: shown once the inline buy panel scrolls away.
  const buyRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const el = buyRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting), {
      rootMargin: "-72px 0px -12% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [slug]);

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper px-6 text-center">
        <p className="font-serif text-3xl">404</p>
        <Link href="/kolekcja" className="btn-ghost">{t("collection.all")}</Link>
      </div>
    );
  }

  const isLimited = product.badge?.[lang]?.toLowerCase().includes("limit") || product.tier === "royal";
  const crossSell = shopProducts.filter((p) => p.slug !== product.slug).slice(0, 3);

  // Gallery: the product's own photograph, then real Deglet Nour context shots.
  type GalleryView = { src: string; alt: string; fit: "cover" | "contain" };
  const views: GalleryView[] = [
    { src: product.image, alt: product.name, fit: product.fit },
    { src: "/products/deglet-single.webp", alt: `${product.name} — Deglet Nour`, fit: "cover" },
    { src: "/products/deglet-trio.webp", alt: `${product.name} — Deglet Nour`, fit: "cover" },
    { src: "/products/signature.webp", alt: `${product.name} — Maison Noor`, fit: "cover" },
  ];
  const current = views[view] ?? views[0];

  return (
    <>
      <div className="bg-paper pt-24 md:pt-28">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-6 md:px-10 lg:grid-cols-2 lg:gap-16">
          {/* Gallery */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className={`overflow-hidden rounded-sm ${current.fit === "contain" ? "bg-paper" : "bg-paper2"}`}>
              <Photo
                src={current.src}
                alt={current.alt}
                fit={current.fit}
                className={`aspect-square w-full ${current.fit === "contain" ? "p-8" : ""}`}
              />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {views.map((v, i) => (
                <button
                  key={i}
                  onClick={() => setView(i)}
                  aria-label={`Widok ${i + 1}`}
                  className={`aspect-square w-full overflow-hidden rounded-sm border-2 transition ${
                    v.fit === "contain" ? "bg-paper" : "bg-paper2"
                  } ${view === i ? "border-or" : "border-transparent opacity-60"}`}
                >
                  <Photo src={v.src} alt="" glow={false} fit={v.fit} className={`h-full w-full ${v.fit === "contain" ? "p-2" : ""}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Buy panel */}
          <div className="pb-6">
            <Reveal>
              <Link href="/kolekcja" className="btn-line text-[11px] text-ink/50">
                ← {t("collection.title")}
              </Link>
            </Reveal>
            <Reveal delay={0.05} variant="mask">
              <h1 className="display mt-6 text-5xl md:text-6xl">{product.name}</h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-3 font-serif text-xl italic text-ink/70">{product.tagline[lang]}</p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-7 flex items-baseline gap-4">
                <span className="font-serif text-4xl">{money(product.price)}</span>
                {product.compareAt && (
                  <>
                    <span className="font-sans text-lg text-ink/40 line-through">
                      {money(product.compareAt)}
                    </span>
                    <span className="rounded-full bg-or/15 px-3 py-1 font-sans text-[11px] uppercase tracking-wide2 text-or">
                      −{Math.round((1 - product.price / product.compareAt) * 100)}%
                    </span>
                  </>
                )}
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 font-sans text-[12px] text-ink/60">
                <span className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${isLimited ? "bg-or" : "bg-green-700"}`} />
                  {isLimited ? t("pdp.lowstock") : t("pdp.instock")}
                </span>
                <span>· {t("pdp.deliveryEst")}</span>
              </div>
            </Reveal>

            {/* Quantity + Add — stacks on phones so the CTA is always full-width
                and thumb-reachable; side-by-side from the sm breakpoint up. */}
            <Reveal delay={0.25}>
              <div ref={buyRef} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-4">
                <div className="flex items-center justify-between self-stretch rounded-full border border-ink/25 sm:self-auto sm:rounded-none">
                  <button
                    className="flex h-12 w-14 items-center justify-center text-xl transition hover:bg-ink/5"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    aria-label={lang === "pl" ? "Zmniejsz ilość" : "Decrease quantity"}
                  >
                    −
                  </button>
                  <span className="min-w-[2.5rem] text-center font-sans text-sm tabular-nums">{qty}</span>
                  <button
                    className="flex h-12 w-14 items-center justify-center text-xl transition hover:bg-ink/5"
                    onClick={() => setQty((q) => q + 1)}
                    aria-label={lang === "pl" ? "Zwiększ ilość" : "Increase quantity"}
                  >
                    +
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <AddToBag slug={product.slug} qty={qty} className="h-12 sm:h-full" />
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="mt-4 flex items-center gap-3 rounded-sm border border-ink/10 bg-paper2 px-4 py-3 font-sans text-[12px] text-ink/70">
                <span className="text-or">✦</span>
                {t("pdp.giftnote")} · {t("bag.giftwrap")}
              </div>
            </Reveal>

            {/* Quantity incentive — elegant, never shouty */}
            {product.tier !== "royal" && (
              <Reveal delay={0.32}>
                <p className="mt-4 font-sans text-[12px] leading-relaxed text-ink/55">
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
                  <p className="mb-2"><strong className="text-ink">{t("pdp.taste")}.</strong> {product.taste[lang]}</p>
                  <p><strong className="text-ink">{t("pdp.texture")}.</strong> {product.texture[lang]}</p>
                </Accordion>
                <Accordion title={`${t("pdp.variety")} · ${t("pdp.origin")}`}>
                  <p className="mb-2"><strong className="text-ink">{t("pdp.variety")}.</strong> {product.variety[lang]}</p>
                  <p><strong className="text-ink">{t("pdp.origin")}.</strong> {product.origin[lang]}</p>
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
      <section className="bg-paper py-16 md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <Reveal>
            <p className="eyebrow text-center">{t("pdp.complete")}</p>
            <h2 className="display mt-3 text-center text-4xl md:text-5xl">{t("collection.eyebrow")}</h2>
          </Reveal>
          <div className="mt-14 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 md:gap-x-8">
            {crossSell.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.08}>
                <Link href={`/produkt/${p.slug}`} className="group block">
                  <div className={`aspect-[4/5] overflow-hidden rounded-sm ${p.fit === "contain" ? "bg-paper" : "bg-paper2"}`}>
                    <Photo
                      src={p.image}
                      alt={p.name}
                      fit={p.fit}
                      glow={p.fit === "cover"}
                      className={`h-full w-full transition-transform duration-[1200ms] ease-luxe group-hover:scale-105 ${p.fit === "contain" ? "p-4" : ""}`}
                    />
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <h3 className="font-serif text-lg">{p.name}</h3>
                    <span className="font-serif">{money(p.price)}</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Reviews />
      <Footer />

      {/* Sticky mobile add-to-cart — the CTA is never more than a thumb away */}
      <div
        className={clsx(
          "fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-paper/95 px-4 pt-3 backdrop-blur-md transition-transform duration-500 ease-luxe lg:hidden",
          showSticky ? "translate-y-0" : "translate-y-full",
        )}
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-[15px] leading-tight">{product.name}</p>
            <p className="font-sans text-[12px] text-ink/60">
              {money(product.price)}
              {qty > 1 && <span className="text-ink/40"> · ×{qty}</span>}
            </p>
          </div>
          <div className="w-[44%] max-w-[200px] shrink-0">
            <AddToBag
              slug={product.slug}
              qty={qty}
              label={lang === "pl" ? "Dodaj" : "Add"}
              className="h-12 !px-5"
            />
          </div>
        </div>
      </div>
    </>
  );
}
