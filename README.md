# Maison Noor

**The light of the date.** A luxury house whose product is the date — designed first for the Polish market.

This is not a "dates shop". It is a cinematic, editorial e-commerce experience with the desirability of a
great premium maison, balanced against elegant, non-aggressive conversion.

> Full creative concept, brand strategy, art direction, CRO, SEO, analytics, self-critique and scores:
> **[`MAISON_NOOR_STRATEGY.md`](./MAISON_NOOR_STRATEGY.md)**.

## Stack
- **Next.js 14** (App Router) · **React 18** · **TypeScript**
- **Tailwind CSS** (bespoke luxury design system — see `tailwind.config.ts`, `app/globals.css`)
- **Framer Motion** (a single disciplined reveal primitive + scroll-driven CSS 3D)
- No WebGL by design — the only 3D is real CSS transforms (the box that opens on scroll), for performance.
  Rationale in `MAISON_NOOR_STRATEGY.md` §J/§P.

## Run
```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm run start   # production
```

## Structure
```
app/
  layout.tsx            Root: metadata (PL SEO), favicon, providers, nav, bag
  page.tsx             Home — Hero + sections 01→10 + footer
  kolekcja/            Collection listing
  produkt/[slug]/      Product page (PDP)
  checkout/            One-page checkout (BLIK · Przelewy24 · card · wallet)
  components/          Hero, Discover (CSS-3D), sections, ProductCard, BagDrawer, Logo…
  lib/
    products.ts        Product data + PLN pricing + shipping thresholds
    dictionary.ts      PL (primary) / EN copy — authored natively, not translated
    store.tsx          Language + cart context (localStorage)
```

## Language
**Polski** is the default (primary market); **English** is the secondary toggle in the nav.
Copy is authored natively in Polish, never machine-translated from English.

## Status
MVP / prototype. Cart, newsletter and checkout are front-end demos (no live backend or payment).
Product imagery is bespoke generated SVG — to be replaced 1:1 by a real photo/video campaign in production
(the single most important next step; see strategy §P). Production path: headless commerce + Przelewy24/BLIK +
Sanity CMS + GA4. Roadmap and scores in the strategy doc.
