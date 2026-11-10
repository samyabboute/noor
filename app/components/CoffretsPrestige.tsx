"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Reveal from "./Reveal";
import SectionIndex from "./SectionIndex";
import { NoorArabicArt } from "./BrandArt";
import { useStore } from "../lib/store";
import { getProduct } from "../lib/products";

/**
 * LES COFFRETS — the prestige chapter. A deliberately different register from the
 * enrobé cinema: calmer, architectural, gift-oriented. The hero écrin is revealed
 * with a single "lid-lift" clip, and the three coffrets are presented as a tiered
 * gift menu — a procession of écrins, each a destination. Restrained motion
 * (one signature reveal + staggered rows), light and seamless on cream, de-branded
 * photography. Transform / clip-path only; reduced-motion shows it fully composed.
 */

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const ROWS = ["ecrin-decouverte", "collection-noor", "royal-noor"] as const;

export default function CoffretsPrestige() {
  const { lang, money } = useStore();
  const pl = lang === "pl";
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [26, -26]);

  const lid = reduce
    ? undefined
    : {
        hidden: { clipPath: "inset(100% 0% 0% 0%)", scale: 1.07 },
        show: { clipPath: "inset(0% 0% 0% 0%)", scale: 1, transition: { duration: 1.35, ease: EASE } },
      };

  return (
    <section id="coffrets" ref={ref} className="relative overflow-hidden bg-paper pad-y-lg text-ink">
      {/* نور signature — a large, quiet watermark cropped off the left margin */}
      <div aria-hidden className="pointer-events-none absolute -left-[14%] top-1/2 hidden w-[min(44vw,620px)] -translate-y-1/2 select-none opacity-[0.045] lg:block">
        <NoorArabicArt className="block w-full" />
      </div>

      <div className="relative mx-auto grid max-w-[1400px] items-center gap-12 px-6 md:px-10 lg:grid-cols-[1.04fr_0.96fr] lg:gap-20">
        {/* THE HERO ÉCRIN — revealed by a single lid-lift */}
        <motion.div style={{ y: heroY }} className="order-1">
          <div className="relative overflow-hidden rounded-sm bg-paper2 shadow-[0_40px_90px_-40px_rgba(60,40,15,0.5)]">
            <motion.div
              initial={reduce ? false : "hidden"}
              whileInView={reduce ? undefined : "show"}
              viewport={{ once: true, margin: "-18% 0px -18% 0px" }}
              variants={lid}
              className="will-change-transform"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/products/coffret-ecrin-noir.webp"
                alt={pl ? "L'Écrin Noor — coffret dziesięciu sygnatur" : "L'Écrin Noor — a coffret of ten signatures"}
                loading="lazy"
                decoding="async"
                className="aspect-[5/3] w-full object-cover"
              />
            </motion.div>
            {/* a fine gold rule framing the plate */}
            <span aria-hidden className="pointer-events-none absolute inset-0 rounded-sm ring-1 ring-inset ring-or/25" />
          </div>
          <Reveal delay={0.1}>
            <p className="mt-4 text-center font-sans text-[11px] uppercase tracking-wide2 text-ink/45">
              L'Écrin Noor · {pl ? "10 sygnatur" : "10 signatures"} · {pl ? "wstążka domu" : "house ribbon"}
            </p>
          </Reveal>
        </motion.div>

        {/* THE GIFT MENU — three écrins, a tiered procession */}
        <div className="order-2">
          <Reveal><SectionIndex>05 — Coffrets</SectionIndex></Reveal>
          <Reveal delay={0.05}><p className="eyebrow mt-5">{pl ? "Sztuka écrin" : "The art of the écrin"}</p></Reveal>
          <Reveal delay={0.1} variant="mask">
            <h2 className="display mt-3 text-4xl leading-[1.02] md:text-6xl">{pl ? "Każdy dar" : "Every gift,"}</h2>
          </Reveal>
          <Reveal delay={0.16} variant="mask">
            <h2 className="display text-4xl italic leading-[1.06] text-or md:text-6xl">{pl ? "w swoim écrin." : "in its écrin."}</h2>
          </Reveal>
          <Reveal delay={0.24}>
            <p className="mt-7 max-w-md font-sans text-[15px] leading-[1.9] text-ink/65">
              {pl
                ? "Trzy écrins domu Noor — od pięciu sygnatur po wielką selekcję. Obleczone, przewiązane wstążką w kolorze światła, gotowe do podarowania."
                : "Three écrins from the house of Noor — from five signatures to the grand selection. Wrapped, tied with a ribbon the colour of light, ready to be given."}
            </p>
          </Reveal>

          <div className="mt-10 border-t border-ink/10">
            {ROWS.map((slug, i) => {
              const p = getProduct(slug);
              if (!p) return null;
              return (
                <Reveal key={slug} delay={0.1 + i * 0.1}>
                  <Link
                    href={`/produkt/${p.slug}`}
                    className="group flex items-center gap-5 border-b border-ink/10 py-5 transition-colors hover:bg-ink/[0.015]"
                  >
                    <span className="h-14 w-20 shrink-0 overflow-hidden rounded-sm bg-paper2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-[1200ms] ease-luxe group-hover:scale-105" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-serif text-xl leading-tight">{p.name}</span>
                      <span className="mt-0.5 block font-sans text-[12px] text-ink/50">{p.variety[lang]} · {p.pieces}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block font-serif text-lg">{money(p.price)}</span>
                      <span className="btn-line mt-0.5 text-[10px] text-or">{pl ? "Zobacz" : "View"}</span>
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={0.2}>
            <Link href="/kolekcja" className="btn-solid mt-10">
              {pl ? "Wszystkie coffrets" : "All the coffrets"}
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
