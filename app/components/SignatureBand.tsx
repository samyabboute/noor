"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Reveal from "./Reveal";
import { useStore } from "../lib/store";

/**
 * THE SIGNATURES — a product editorial, not a banner. The photograph is given
 * its own light room and full height, bleeding to the right edge like a plate on
 * a page; the typography lives in the calm left column with air around it. Text
 * never sits on the image. A gentle transform-only drift on the photo. The
 * seamless bridge from the brand story into the shop.
 *
 * Photograph: /products/signature.webp (falls back to .jpg).
 */
export default function SignatureBand() {
  const { lang } = useStore();
  const reduce = useReducedMotion();
  const pl = lang === "pl";
  const ref = useRef<HTMLElement>(null);
  const [src, setSrc] = useState("/products/signature.webp");
  const [broken, setBroken] = useState(false);
  const onImgError = () => (src.endsWith(".webp") ? setSrc("/products/signature.jpg") : setBroken(true));
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1.06, 1]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-paper text-ink">
      <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
        {/* The calm left room — typography with air, never over the image */}
        <div className="order-2 flex flex-col justify-center px-6 py-16 sm:px-10 lg:order-1 lg:py-28 lg:pl-[max(2.5rem,calc((100vw-1400px)/2+2.5rem))] lg:pr-16">
          <Reveal>
            <span className="font-sans text-[11px] uppercase tracking-[0.42em] text-or/80">{pl ? "Sygnatury" : "The Signatures"}</span>
          </Reveal>
          <Reveal delay={0.08} variant="mask">
            <h2 className="display mt-6 text-4xl leading-[1.02] md:text-6xl">{pl ? "Każdy daktyl —" : "Each date,"}</h2>
          </Reveal>
          <Reveal delay={0.14} variant="mask">
            <h2 className="display text-4xl italic leading-[1.06] text-or md:text-6xl">{pl ? "mała ceremonia." : "a small ceremony."}</h2>
          </Reveal>
          <Reveal delay={0.22}>
            <p className="mt-8 max-w-md font-sans text-[15px] leading-[1.9] text-ink/65">
              {pl
                ? "Cały Deglet Nour, nadziewany migdałem lub pistacją, oblewany szlachetną czekoladą i wykańczany ręcznie. Sygnatury domu Noor — do dzielenia i do dawania."
                : "Whole Deglet Nour, filled with almond or pistachio, dipped in fine couverture and finished by hand. The Noor signatures — to share, and to give."}
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <Link href="/kolekcja" className="btn-line mt-9 text-ink">
              {pl ? "Zobacz kolekcję" : "Discover the collection"}
            </Link>
          </Reveal>
        </div>

        {/* The photograph — its own light room, bleeding to the right edge */}
        <div className="relative order-1 min-h-[56vw] overflow-hidden sm:min-h-[42vw] lg:order-2 lg:min-h-[82vh]">
          {!broken && (
            <motion.img
              src={src}
              alt={pl ? "Sygnatury Maison Noor — daktyle nadziewane i oblewane czekoladą" : "Maison Noor signatures — dates filled and dipped in chocolate"}
              onError={onImgError}
              loading="lazy"
              decoding="async"
              style={{ scale }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          {broken && <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(160deg,#efe7d6,#e0d3ba)" }} />}
        </div>
      </div>
    </section>
  );
}
