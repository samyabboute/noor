"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import type { Lang } from "./products";
import { products, FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "./products";
import { tr } from "./dictionary";
import { type CurrencyCode, formatMoney, regionForCountry } from "./regions";

export interface CartLine {
  slug: string;
  qty: number;
}

interface StoreState {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (key: string) => string;

  cart: CartLine[];
  addToCart: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  removeFromCart: (slug: string) => void;
  clearCart: () => void;

  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  remainingForFreeShipping: number;

  bagOpen: boolean;
  setBagOpen: (v: boolean) => void;

  // Region & currency
  country: string;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  money: (pln: number) => string;
  regionPrompt: boolean;
  dismissRegionPrompt: () => void;
}

const StoreContext = createContext<StoreState | null>(null);

const priceOf = (slug: string) => products.find((p) => p.slug === slug)?.price ?? 0;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pl");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [bagOpen, setBagOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [country, setCountry] = useState("PL");
  const [currency, setCurrencyState] = useState<CurrencyCode>("PLN");
  const [regionPrompt, setRegionPrompt] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("noor.cart");
      const savedLang = localStorage.getItem("noor.lang");
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedLang === "pl" || savedLang === "en") setLangState(savedLang);
    } catch {
      /* ignore */
    }
    // Restore a manually-chosen currency, if any
    try {
      const savedCur = localStorage.getItem("noor.currency") as CurrencyCode | null;
      if (savedCur && ["PLN", "EUR", "GBP", "USD"].includes(savedCur)) setCurrencyState(savedCur);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("noor.cart", JSON.stringify(cart));
  }, [cart, hydrated]);

  // Detect region from edge geo headers on first visit; suggest the currency.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const chosen = localStorage.getItem("noor.currency");
        const acknowledged = localStorage.getItem("noor.region.ack");
        const res = await fetch("/api/geo");
        if (!res.ok || !active) return;
        const geo = (await res.json()) as { country: string; currency: CurrencyCode; detected: boolean };
        setCountry(geo.country);
        // Only auto-suggest if the visitor hasn't already picked a currency
        // and we actually detected a country different from the default.
        if (!chosen) {
          if (geo.detected && geo.currency !== "PLN" && !acknowledged) {
            setRegionPrompt(true);
          }
        }
      } catch {
        /* ignore — default region stays */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("noor.lang", l);
      document.documentElement.lang = l;
    } catch {
      /* ignore */
    }
  }, []);

  const toggleLang = useCallback(() => setLang(lang === "pl" ? "en" : "pl"), [lang, setLang]);

  const addToCart = useCallback((slug: string, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.slug === slug);
      if (existing) return prev.map((l) => (l.slug === slug ? { ...l, qty: l.qty + qty } : l));
      return [...prev, { slug, qty }];
    });
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    setCart((prev) =>
      qty <= 0 ? prev.filter((l) => l.slug !== slug) : prev.map((l) => (l.slug === slug ? { ...l, qty } : l)),
    );
  }, []);

  const removeFromCart = useCallback((slug: string) => {
    setCart((prev) => prev.filter((l) => l.slug !== slug));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c);
    setRegionPrompt(false);
    try {
      localStorage.setItem("noor.currency", c);
      localStorage.setItem("noor.region.ack", "1");
    } catch {
      /* ignore */
    }
  }, []);

  const dismissRegionPrompt = useCallback(() => {
    setRegionPrompt(false);
    try {
      localStorage.setItem("noor.region.ack", "1");
    } catch {
      /* ignore */
    }
  }, []);

  const money = useCallback((pln: number) => formatMoney(pln, currency), [currency]);

  const { count, subtotal } = useMemo(() => {
    let c = 0;
    let s = 0;
    for (const line of cart) {
      c += line.qty;
      s += line.qty * priceOf(line.slug);
    }
    return { count: c, subtotal: s };
  }, [cart]);

  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const value: StoreState = {
    lang,
    setLang,
    toggleLang,
    t: (key: string) => tr(key, lang),
    cart,
    addToCart,
    setQty,
    removeFromCart,
    clearCart,
    country,
    currency,
    setCurrency,
    money,
    regionPrompt,
    dismissRegionPrompt,
    count,
    subtotal,
    shipping,
    total,
    remainingForFreeShipping,
    bagOpen,
    setBagOpen,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
