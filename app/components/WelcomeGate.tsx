"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Logo } from "./Logo";
import { useStore } from "../lib/store";
import type { Lang } from "../lib/products";
import { REGIONS, CURRENCIES, currencyForCountry, type CurrencyCode } from "../lib/regions";

const FLAG: Record<string, string> = {
  PL: "🇵🇱", DE: "🇩🇪", FR: "🇫🇷", GB: "🇬🇧", US: "🇺🇸", AE: "🇦🇪",
};

const COPY = {
  pl: {
    eyebrow: "Witamy",
    title: "Wejdź do świata Noor",
    detected: (c: string) => `Wygląda na to, że odwiedzasz nas z: ${c}.`,
    noDetect: "Wybierz kraj i język, aby rozpocząć.",
    country: "Kraj dostawy",
    language: "Język",
    priced: (cur: CurrencyCode) => `Ceny w ${cur} (${CURRENCIES[cur].symbol})`,
    enter: "Wejdź",
    skip: "Kontynuuj bez zmian",
  },
  en: {
    eyebrow: "Welcome",
    title: "Enter the world of Noor",
    detected: (c: string) => `It looks like you're visiting from ${c}.`,
    noDetect: "Choose your country and language to begin.",
    country: "Delivery country",
    language: "Language",
    priced: (cur: CurrencyCode) => `Prices in ${cur} (${CURRENCIES[cur].symbol})`,
    enter: "Enter",
    skip: "Continue without changing",
  },
};

/**
 * First contact with Maison Noor — a single, quiet doorway, not a cookie wall.
 * Detects the visitor's country (edge geo) and offers it as a suggestion they
 * can change; lets them pick PL/EN; remembers the choice forever. Returning
 * visitors never see it. If detection fails, sensible defaults still let them in.
 */
export default function WelcomeGate() {
  const { welcome, completeWelcome, country, lang } = useStore();
  const reduce = useReducedMotion();

  const [uiLang, setUiLang] = useState<Lang>(lang);
  const [countryCode, setCountryCode] = useState(country);

  // Keep the form in sync with async geo detection / stored language.
  useEffect(() => setCountryCode(country), [country]);
  useEffect(() => setUiLang(lang), [lang]);

  // Lock the page behind the gate while it's open. The data-attribute lets the
  // entrance Loader know not to release the scroll lock out from under us.
  useEffect(() => {
    if (!welcome) return;
    document.body.dataset.noorGate = "1";
    document.body.style.overflow = "hidden";
    return () => {
      delete document.body.dataset.noorGate;
      document.body.style.overflow = "";
    };
  }, [welcome]);

  const t = COPY[uiLang];
  const currency = currencyForCountry(countryCode);

  // Country options: served regions, plus the detected country if it's elsewhere.
  const options = [...REGIONS];
  if (!options.some((r) => r.country === countryCode) && countryCode) {
    options.unshift({
      country: countryCode,
      name: { pl: countryCode, en: countryCode },
      currency: currencyForCountry(countryCode),
    });
  }
  const detectedName = options.find((r) => r.country === countryCode)?.name[uiLang] ?? countryCode;

  return (
    <AnimatePresence>
      {welcome && (
        <motion.div
          className="fixed inset-0 z-[150] flex items-center justify-center p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-modal="true"
          aria-label={t.title}
        >
          {/* Dimmed, blurred veil over the site */}
          <div className="absolute inset-0 bg-[#05130e]/70 backdrop-blur-md" />

          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 26, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.99 }}
            transition={{ duration: reduce ? 0 : 0.7, ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : 0.08 }}
            className="relative w-full max-w-[420px] overflow-hidden rounded-[4px] bg-ivoire text-nuit shadow-[0_40px_120px_-30px_rgba(0,0,0,0.7)]"
          >
            {/* Gold hairline crown */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-or/60 to-transparent" />

            <div className="px-7 pb-7 pt-9 sm:px-9 sm:pb-9">
              <div className="flex justify-center">
                <Logo size="md" mono className="text-nuit" />
              </div>

              <p className="mt-7 text-center font-sans text-[11px] uppercase tracking-luxe text-or">{t.eyebrow}</p>
              <h2 className="mt-2 text-center font-serif text-[26px] font-light leading-tight sm:text-[30px]">
                {t.title}
              </h2>
              <p className="mx-auto mt-3 max-w-[300px] text-center font-sans text-[13px] leading-relaxed text-nuit/55">
                {country && countryCode ? t.detected(detectedName) : t.noDetect}
              </p>

              {/* Country */}
              <label className="mt-7 block">
                <span className="font-sans text-[10px] uppercase tracking-wide2 text-nuit/45">{t.country}</span>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base">
                    {FLAG[countryCode] ?? "🌍"}
                  </span>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-full appearance-none rounded-[3px] border border-nuit/15 bg-transparent py-3 pl-10 pr-9 font-sans text-[14px] text-nuit transition focus:border-or focus:outline-none"
                  >
                    {options.map((r) => (
                      <option key={r.country} value={r.country}>
                        {r.name[uiLang]}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-nuit/40">▾</span>
                </div>
                <span className="mt-1.5 block font-sans text-[11px] text-nuit/45">{t.priced(currency)}</span>
              </label>

              {/* Language */}
              <div className="mt-5">
                <span className="font-sans text-[10px] uppercase tracking-wide2 text-nuit/45">{t.language}</span>
                <div className="mt-1.5 grid grid-cols-2 gap-2.5">
                  {(["pl", "en"] as Lang[]).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setUiLang(l)}
                      aria-pressed={uiLang === l}
                      className={`flex items-center justify-center gap-2 rounded-[3px] border py-3 font-sans text-[13px] transition-all duration-300 ${
                        uiLang === l
                          ? "border-nuit bg-nuit text-ivoire"
                          : "border-nuit/15 text-nuit/70 hover:border-nuit/40"
                      }`}
                    >
                      <span className="text-base">{l === "pl" ? "🇵🇱" : "🇬🇧"}</span>
                      {l === "pl" ? "Polski" : "English"}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => completeWelcome(uiLang, currency)}
                className="mt-7 w-full rounded-full bg-nuit py-4 font-sans text-[12px] uppercase tracking-wide2 text-ivoire transition-all duration-300 ease-luxe hover:bg-cacao active:scale-[0.99]"
              >
                {t.enter}
              </button>
              <button
                type="button"
                onClick={() => completeWelcome(lang, currencyForCountry(country))}
                className="mx-auto mt-3 block font-sans text-[11px] uppercase tracking-wide2 text-nuit/40 underline-offset-4 transition hover:text-nuit/70 hover:underline"
              >
                {t.skip}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
