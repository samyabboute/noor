"use client";

import Link from "next/link";
import Reveal from "./Reveal";
import ProductVisual from "./ProductVisual";
import Photo from "./Photo";
import MacroDate from "./MacroDate";
import NoorPattern from "./NoorPattern";
import { useStore } from "../lib/store";

/* 03 — The Date : why Noor is different */
export function TheDate() {
  const { t } = useStore();
  const features = [
    { k: "date.f1.k", v: "date.f1.v" },
    { k: "date.f2.k", v: "date.f2.v" },
    { k: "date.f3.k", v: "date.f3.v" },
    { k: "date.f4.k", v: "date.f4.v" },
  ];
  return (
    <section id="daktyl" className="bg-ombre py-24 text-ivoire md:py-36">
      <div className="mx-auto grid max-w-[1400px] items-center gap-16 px-6 md:px-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative">
          <Reveal>
            {/* The date as a jewel — macro, turning gently, catching the light. */}
            <MacroDate src="/products/deglet-single.webp" alt="Daktyl Deglet Nour — makro" />
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-4 text-center font-sans text-[11px] uppercase tracking-wide2 text-ivoire/35">
              Deglet Nour · Jumbo · Oazy Tozeur, Tunezja
            </p>
          </Reveal>
        </div>

        <div>
          <Reveal><p className="section-index text-ivoire/40">{t("date.index")}</p></Reveal>
          <Reveal delay={0.05}><p className="eyebrow mt-5">{t("date.eyebrow")}</p></Reveal>
          <Reveal delay={0.1}><h2 className="display mt-3 text-4xl md:text-6xl">{t("date.title")}</h2></Reveal>
          <Reveal delay={0.15}>
            <p className="mt-7 max-w-md font-sans text-[15px] leading-[1.9] text-ivoire/65">{t("date.body")}</p>
          </Reveal>

          <div className="mt-12 grid gap-px overflow-hidden rounded-sm bg-ivoire/10 sm:grid-cols-2">
            {features.map((f, i) => (
              <Reveal key={f.k} delay={0.1 + i * 0.08}>
                <div className="h-full bg-ombre p-7">
                  <p className="font-serif text-2xl text-orclair">0{i + 1}</p>
                  <p className="mt-3 font-sans text-[11px] uppercase tracking-wide2 text-ivoire/50">{t(f.k)}</p>
                  <p className="mt-2 font-sans text-[14px] leading-relaxed text-ivoire/80">{t(f.v)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* 04 — Craftsmanship : from hand to hand */
export function Craftsmanship() {
  const { t } = useStore();
  const steps = [
    { k: "craft.s1.k", v: "craft.s1.v" },
    { k: "craft.s2.k", v: "craft.s2.v" },
    { k: "craft.s3.k", v: "craft.s3.v" },
    { k: "craft.s4.k", v: "craft.s4.v" },
  ];
  return (
    <section id="rzemioslo" className="bg-ombre py-24 text-ivoire md:py-36">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="mb-14 text-center">
          <Reveal><p className="section-index">{t("craft.index")}</p></Reveal>
          <Reveal delay={0.05}><p className="eyebrow mt-5">{t("craft.eyebrow")}</p></Reveal>
          <Reveal delay={0.1}><h2 className="display mt-3 text-5xl md:text-7xl">{t("craft.title")}</h2></Reveal>
        </div>

        {/* The raw harvest — a full cluster of Deglet Nour, straight from the palm. */}
        <Reveal delay={0.05}>
          <figure className="mx-auto mb-16 max-w-sm md:mb-24">
            <Photo
              src="/products/deglet-branch.webp"
              alt="Kiść daktyli Deglet Nour prosto z palmy — oazy Tozeur"
              className="aspect-[4/5]"
            />
            <figcaption className="mt-4 text-center section-index">Prosto z palmy · Oazy Tozeur</figcaption>
          </figure>
        </Reveal>

        <div className="grid gap-10 md:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.k} delay={i * 0.1}>
              <div className="group">
                <div className="flex items-center gap-4">
                  <span className="font-serif text-5xl text-or/40 transition-colors duration-500 group-hover:text-or">
                    0{i + 1}
                  </span>
                  <span className="hairline flex-1" />
                </div>
                <h3 className="mt-6 font-serif text-2xl">{t(s.k)}</h3>
                <p className="mt-3 font-sans text-[14px] leading-[1.8] text-ivoire/60">{t(s.v)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 05 — Gift Collection */
export function GiftCollection() {
  const { t } = useStore();
  return (
    <section id="prezenty" className="relative overflow-hidden bg-nuit py-24 text-ivoire md:py-40">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(80% 60% at 70% 40%, rgba(228,199,132,0.12), transparent 60%)" }}
      />
      <div className="relative mx-auto grid max-w-[1400px] items-center gap-16 px-6 md:px-10 lg:grid-cols-2">
        <div>
          <Reveal><p className="section-index text-ivoire/40">{t("gift.index")}</p></Reveal>
          <Reveal delay={0.05}><p className="eyebrow mt-5">{t("gift.eyebrow")}</p></Reveal>
          <Reveal delay={0.1}><h2 className="display mt-3 text-5xl md:text-7xl">{t("gift.title")}</h2></Reveal>
          <Reveal delay={0.15}>
            <p className="mt-8 max-w-md font-sans text-[15px] leading-[1.9] text-ivoire/70">{t("gift.body")}</p>
          </Reveal>
          <Reveal delay={0.2}>
            <Link href="/produkt/collection-noor" className="btn-solid mt-10 bg-ivoire text-nuit hover:bg-orclair">
              {t("gift.cta")}
            </Link>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <div className="relative mx-auto w-full max-w-[460px]">
            <ProductVisual slug="royal-noor" className="aspect-square w-full drop-shadow-2xl" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* 06 — Corporate Gifting */
export function Corporate() {
  const { t } = useStore();
  const bullets = ["corp.b1", "corp.b2", "corp.b3"];
  return (
    <section id="dla-firm" className="bg-nuit py-24 text-ivoire md:py-36">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <Reveal><p className="section-index">{t("corp.index")}</p></Reveal>
            <Reveal delay={0.05}><p className="eyebrow mt-5">{t("corp.eyebrow")}</p></Reveal>
            <Reveal delay={0.1}><h2 className="display mt-3 text-5xl md:text-6xl">{t("corp.title")}</h2></Reveal>
            <Reveal delay={0.15}>
              <p className="mt-7 max-w-md font-sans text-[15px] leading-[1.9] text-ivoire/70">{t("corp.body")}</p>
            </Reveal>
            <Reveal delay={0.2}>
              <a href="mailto:corporate@maisonnoor.pl" className="btn-solid mt-9">
                {t("corp.cta")}
              </a>
            </Reveal>
          </div>
          <div className="space-y-px overflow-hidden rounded-sm bg-ivoire/10">
            {bullets.map((b, i) => (
              <Reveal key={b} delay={i * 0.1}>
                <div className="flex items-center gap-5 bg-ombre px-5 py-6">
                  <span className="font-serif text-3xl text-or">0{i + 1}</span>
                  <p className="font-serif text-xl text-ivoire md:text-2xl">{t(b)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* 07 — Maison Noor Story */
export function Story() {
  const { t } = useStore();
  return (
    <section id="dom-noor" className="relative isolate overflow-hidden bg-nuit py-28 text-ivoire md:py-44">
      <NoorPattern placement="edges" opacity={0.05} scale={132} />
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <Reveal><p className="section-index text-ivoire/40">{t("story.index")}</p></Reveal>
        <Reveal delay={0.05}><p className="eyebrow mt-6">{t("story.eyebrow")}</p></Reveal>
        <Reveal delay={0.1}>
          <h2 className="display mt-6 text-4xl italic md:text-6xl">“{t("story.title")}”</h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-10 max-w-2xl font-sans text-[16px] leading-[2] text-ivoire/70">{t("story.body")}</p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mt-12 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-or/50" />
            <span className="font-serif tracking-[0.2em] text-orclair">MAISON NOOR</span>
            <span className="h-px w-10 bg-or/50" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
