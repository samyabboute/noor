"use client";

import { useState } from "react";
import Reveal from "./Reveal";
import NoorPattern from "./NoorPattern";
import { useStore } from "../lib/store";

export default function Newsletter() {
  const { t } = useStore();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <section id="newsletter" className="relative isolate overflow-hidden bg-ombre py-16 text-ivoire md:py-32">
      {/* Closing CTA — the arabesque may be a touch more perceptible here */}
      <NoorPattern placement="edges" opacity={0.06} scale={122} />
      <div className="relative mx-auto max-w-2xl px-6 text-center">
        <Reveal><p className="section-index text-ivoire/40">{t("news.index")}</p></Reveal>
        <Reveal delay={0.05}><p className="eyebrow mt-5">{t("news.eyebrow")}</p></Reveal>
        <Reveal delay={0.1}><h2 className="display mt-3 text-4xl md:text-6xl">{t("news.title")}</h2></Reveal>
        <Reveal delay={0.15}>
          <p className="mx-auto mt-6 max-w-lg font-sans text-[14px] leading-[1.9] text-ivoire/65">{t("news.body")}</p>
        </Reveal>

        <Reveal delay={0.2}>
          {sent ? (
            <p className="mt-10 font-serif text-2xl text-orclair">{t("co.placed")}</p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email.includes("@")) setSent(true);
              }}
              className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("news.placeholder")}
                className="flex-1 border-b border-ivoire/30 bg-transparent px-1 py-3 font-sans text-[14px] text-ivoire placeholder:text-ivoire/40 focus:border-orclair focus:outline-none"
              />
              <button type="submit" className="btn-solid bg-ivoire text-nuit hover:bg-orclair">
                {t("news.cta")}
              </button>
            </form>
          )}
        </Reveal>
        <Reveal delay={0.25}>
          <p className="mx-auto mt-6 max-w-sm font-sans text-[11px] leading-relaxed text-ivoire/35">{t("news.consent")}</p>
        </Reveal>
      </div>
    </section>
  );
}
