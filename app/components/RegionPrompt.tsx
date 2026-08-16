"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../lib/store";
import { regionForCountry, CURRENCIES } from "../lib/regions";

/**
 * On first visit from outside Poland, a discreet, luxurious prompt offers to
 * switch to the local currency — detected from the visitor's region (IP geo),
 * never a modal wall. Dismiss keeps PLN and never asks again.
 */
export default function RegionPrompt() {
  const { regionPrompt, country, setCurrency, dismissRegionPrompt, lang } = useStore();
  const region = regionForCountry(country);
  const suggested = region.currency;

  return (
    <AnimatePresence>
      {regionPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 bottom-0 z-[90] px-4 pb-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:px-0"
          role="dialog"
          aria-label="Region"
        >
          <div className="mx-auto max-w-md rounded-sm border border-ivoire/12 bg-ombre/95 p-5 shadow-2xl backdrop-blur-md sm:w-[360px]">
            <p className="eyebrow text-or">{lang === "pl" ? "Twój region" : "Your region"}</p>
            <p className="mt-3 font-serif text-lg leading-snug text-ivoire">
              {lang === "pl" ? (
                <>
                  Wygląda na to, że odwiedzasz nas z{" "}
                  <span className="text-orclair">{region.name.pl}</span>.
                </>
              ) : (
                <>
                  It looks like you're visiting from{" "}
                  <span className="text-orclair">{region.name.en}</span>.
                </>
              )}
            </p>
            <p className="mt-2 font-sans text-[13px] leading-relaxed text-ivoire/60">
              {lang === "pl"
                ? `Pokazać ceny w ${suggested} (${CURRENCIES[suggested].symbol})?`
                : `Show prices in ${suggested} (${CURRENCIES[suggested].symbol})?`}
            </p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setCurrency(suggested)} className="btn-solid flex-1 py-3 text-[11px]">
                {lang === "pl" ? `Tak, ${suggested}` : `Yes, ${suggested}`}
              </button>
              <button onClick={dismissRegionPrompt} className="btn-ghost flex-1 py-3 text-[11px]">
                {lang === "pl" ? "Zostań w PLN" : "Keep PLN"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
