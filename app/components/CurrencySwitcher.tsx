"use client";

import { useState } from "react";
import clsx from "clsx";
import { useStore } from "../lib/store";
import { CURRENCIES, type CurrencyCode } from "../lib/regions";

const ORDER: CurrencyCode[] = ["PLN", "EUR", "GBP", "USD"];

export default function CurrencySwitcher({ className }: { className?: string }) {
  const { currency, setCurrency } = useStore();
  const [open, setOpen] = useState(false);

  return (
    <div className={clsx("relative", className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="font-sans text-[11px] uppercase tracking-wide2 opacity-80 transition hover:opacity-100"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {currency} <span className="text-or">{CURRENCIES[currency].symbol}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[95]" onClick={() => setOpen(false)} />
          <ul
            className="absolute right-0 z-[96] mt-3 w-32 overflow-hidden rounded-sm border border-ivoire/12 bg-ombre/95 py-1 shadow-2xl backdrop-blur-md"
            role="listbox"
          >
            {ORDER.map((c) => (
              <li key={c}>
                <button
                  role="option"
                  aria-selected={currency === c}
                  onClick={() => {
                    setCurrency(c);
                    setOpen(false);
                  }}
                  className={clsx(
                    "flex w-full items-center justify-between px-4 py-2 font-sans text-[12px] uppercase tracking-wide2 transition hover:bg-ivoire/5",
                    currency === c ? "text-or" : "text-ivoire/75",
                  )}
                >
                  {c} <span>{CURRENCIES[c].symbol}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
