"use client";

import { useState } from "react";
import Reveal from "./Reveal";
import SectionIndex from "./SectionIndex";
import NoorPattern from "./NoorPattern";
import { useStore } from "../lib/store";

export default function Newsletter() {
  const { t } = useStore();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <section id="newsletter" className="relative isolate overflow-hidden bg-paper2 pad-y text-ink">
      {/* Closing CTA — the arabesque may be a touch more perceptible here */}
      <NoorPattern placement="edges" opacity={0.05} scale={122} color="#122A20" />
      <div className="relative mx-auto max-w-2xl px-6 text-center">
        <Reveal><SectionIndex>{t("news.index")}</SectionIndex></Reveal>
        <Reveal delay={0.05}><p className="eyebrow mt-5">{t("news.eyebrow")}</p></Reveal>
        <Reveal delay={0.1} variant="mask"><h2 className="display mt-3 text-4xl md:text-6xl">{t("news.title")}</h2></Reveal>
        <Reveal delay={0.15}>
          <p className="mx-auto mt-6 max-w-lg font-sans text-[14px] leading-[1.9] text-ink/65">{t("news.body")}</p>
        </Reveal>

        <Reveal delay={0.2}>
          {sent ? (
            <p className="mt-10 font-serif text-2xl text-or">{t("co.placed")}</p>
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
                className="flex-1 border-b border-ink/25 bg-transparent px-1 py-3 font-sans text-[14px] text-ink placeholder:text-ink/40 focus:border-or focus:outline-none"
              />
              <button type="submit" className="btn-solid">
                {t("news.cta")}
              </button>
            </form>
          )}
        </Reveal>
        <Reveal delay={0.25}>
          <p className="mx-auto mt-6 max-w-sm font-sans text-[11px] leading-relaxed text-ink/45">{t("news.consent")}</p>
        </Reveal>
      </div>
    </section>
  );
}
