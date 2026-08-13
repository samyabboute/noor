"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import type { Lang } from "./products";
import { products, FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "./products";
import { tr } from "./dictionary";

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
}

const StoreContext = createContext<StoreState | null>(null);

const priceOf = (slug: string) => products.find((p) => p.slug === slug)?.price ?? 0;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pl");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [bagOpen, setBagOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

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
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("noor.cart", JSON.stringify(cart));
  }, [cart, hydrated]);

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
