export type Lang = "pl" | "en";

// The three houses of the catalogue. Every product belongs to exactly one.
export type Category = "coffret" | "enrobee" | "nature";

export interface Product {
  slug: string;
  name: string;
  category: Category;
  tier: "signature" | "collection" | "royal" | "gift" | "corporate";
  // Localised marketing copy
  tagline: Record<Lang, string>;
  variety: Record<Lang, string>;
  origin: Record<Lang, string>;
  taste: Record<Lang, string>;
  texture: Record<Lang, string>;
  story: Record<Lang, string>;
  price: number; // PLN
  compareAt?: number; // for anchoring / bundle value
  weight: string; // e.g. "250 g"
  pieces: string; // e.g. "≈ 16"
  accent: string; // hex used for the product's light tone
  badge?: Record<Lang, string>;
  bestFor: Array<"gift" | "self" | "corporate">;
}

// Display labels for the catalogue filter, in reading order.
export const CATEGORY_LABELS: Record<Category, Record<Lang, string>> = {
  coffret: { pl: "Coffrets", en: "Coffrets" },
  enrobee: { pl: "Daktyle Enrobées", en: "Enrobées Dates" },
  nature: { pl: "Daktyle Nature", en: "Nature Dates" },
};

export const CATEGORY_ORDER: Category[] = ["coffret", "enrobee", "nature"];

/**
 * THE MAISON NOOR CATALOGUE — three coherent houses, each with its own
 * naming register:
 *   · NATURE   — terroir & light: Lumière de Tolga, Grande Récolte, Réserve du Ziban
 *   · ENROBÉES — the sensual, worked date: Cœur d'Amande, Perle de Pistache, Noir Cacao
 *   · COFFRETS — the écrin, the gift: L'Écrin Noor, Le Grand Écrin
 * Prices in PLN. Positioned as a luxury house — premium but credible for the Polish market.
 */
export const products: Product[] = [
  /* ─────────────────────────  NATURE  ───────────────────────── */
  {
    slug: "noor-signature",
    name: "Lumière de Tolga",
    category: "nature",
    tier: "signature",
    tagline: {
      pl: "Nasza sygnatura. Deglet Nour w najczystszej postaci.",
      en: "Our signature. Deglet Nour in its purest form.",
    },
    variety: { pl: "Deglet Nour · kaliber Jumbo", en: "Deglet Nour · Jumbo grade" },
    origin: { pl: "Oazy Tolga, Algieria", en: "Tolga oasis, Algeria" },
    taste: {
      pl: "Karmel, miód i nuta toffi. Głęboka, ale nigdy przesłodzona.",
      en: "Caramel, honey and a whisper of toffee. Deep, never cloying.",
    },
    texture: {
      pl: "Aksamitna, wilgotna, topiąca się w ustach.",
      en: "Velvet, moist, melting on the tongue.",
    },
    story: {
      pl: "Owoce zbierane ręcznie w fazie pełnej dojrzałości, selekcjonowane sztuka po sztuce. Tylko najwięksi, najgładsi — owoc światła z oaz Tolga.",
      en: "Hand-harvested at full maturity, selected one by one. Only the largest, the smoothest — the fruit of light from the Tolga oases.",
    },
    price: 89,
    weight: "250 g",
    pieces: "≈ 14",
    accent: "#D8B978",
    badge: { pl: "Bestseller", en: "Bestseller" },
    bestFor: ["gift", "self"],
  },
  {
    slug: "grande-recolte",
    name: "Grande Récolte",
    category: "nature",
    tier: "signature",
    tagline: {
      pl: "Hojna kiść z pierwszego zbioru sezonu.",
      en: "A generous branch from the season's first harvest.",
    },
    variety: { pl: "Deglet Nour · na gałązce", en: "Deglet Nour · on the branch" },
    origin: { pl: "Oazy Tolga, Algieria", en: "Tolga oasis, Algeria" },
    taste: {
      pl: "Świeży miód i jasny karmel, prosto z palmy.",
      en: "Fresh honey and bright caramel, straight from the palm.",
    },
    texture: {
      pl: "Jędrna, mięsista, pełna słońca.",
      en: "Firm, fleshy, full of sun.",
    },
    story: {
      pl: "Zbierane całą kiścią, tak jak rosły — najbardziej naturalna postać daktyla, do dzielenia przy stole.",
      en: "Gathered whole on the branch, just as they grew — the date in its most natural form, to share at the table.",
    },
    price: 79,
    weight: "300 g",
    pieces: "na gałązce",
    accent: "#CBA662",
    bestFor: ["self", "gift"],
  },
  {
    slug: "reserve-ziban",
    name: "Réserve du Ziban",
    category: "nature",
    tier: "collection",
    tagline: {
      pl: "Rzadka selekcja z serca oaz Ziban.",
      en: "A rare selection from the heart of the Ziban.",
    },
    variety: { pl: "Deglet Nour · selekcja numerowana", en: "Deglet Nour · numbered selection" },
    origin: { pl: "Oazy Ziban, Algieria", en: "Ziban oases, Algeria" },
    taste: {
      pl: "Skoncentrowany karmel i suszona morela. Intensywna, dostojna.",
      en: "Concentrated caramel and dried apricot. Intense, stately.",
    },
    texture: {
      pl: "Gęsta, prawie kremowa.",
      en: "Dense, almost creamy.",
    },
    story: {
      pl: "Zaledwie kilka palm daje owoc tej klasy. Zbiór ograniczony, każda partia numerowana.",
      en: "Only a handful of palms bear fruit of this grade. A limited harvest, each batch numbered.",
    },
    price: 129,
    weight: "250 g",
    pieces: "≈ 12",
    accent: "#BF9A54",
    badge: { pl: "Rzadka partia", en: "Rare batch" },
    bestFor: ["gift", "self"],
  },

  /* ─────────────────────────  ENROBÉES  ───────────────────────── */
  {
    slug: "coeur-de-noor",
    name: "Cœur d'Amande",
    category: "enrobee",
    tier: "collection",
    tagline: {
      pl: "Daktyl nadziewany migdałem. Serce ukryte w owocu.",
      en: "The date filled with almond. A heart hidden inside the fruit.",
    },
    variety: { pl: "Deglet Nour · prażony migdał", en: "Deglet Nour · roasted almond" },
    origin: { pl: "Oazy Tolga, Algieria · Piemont", en: "Tolga oasis, Algeria · Piedmont" },
    taste: {
      pl: "Prażony migdał spotyka karmel daktyla. Kontrast, który uzależnia.",
      en: "Roasted almond meets the date's caramel. An addictive contrast.",
    },
    texture: {
      pl: "Miękkość owocu, chrupkość orzecha.",
      en: "Soft fruit, the crunch of the nut.",
    },
    story: {
      pl: "Każdy owoc otwierany i nadziewany ręcznie, tego samego dnia. Bez konserwantów, bez skrótów.",
      en: "Each fruit opened and filled by hand, the same day. No preservatives, no shortcuts.",
    },
    price: 119,
    weight: "300 g",
    pieces: "≈ 16",
    accent: "#C99A6A",
    bestFor: ["gift", "self"],
  },
  {
    slug: "perle-pistache",
    name: "Perle de Pistache",
    category: "enrobee",
    tier: "collection",
    tagline: {
      pl: "Daktyl nadziewany zieloną pistacją. Zmysłowa perła.",
      en: "The date filled with green pistachio. A sensual pearl.",
    },
    variety: { pl: "Deglet Nour · pistacja z Bronte", en: "Deglet Nour · Bronte pistachio" },
    origin: { pl: "Oazy Tolga, Algieria · Sycylia", en: "Tolga oasis, Algeria · Sicily" },
    taste: {
      pl: "Maślana pistacja, kwiat pomarańczy, głęboki karmel.",
      en: "Buttery pistachio, orange blossom, deep caramel.",
    },
    texture: {
      pl: "Jedwabiste wnętrze, delikatna ziarnistość pistacji.",
      en: "A silken centre, the fine grain of pistachio.",
    },
    story: {
      pl: "Zielona pistacja z Bronte, ucierana na pastę i nadziewana ręcznie w każdy owoc. Nasza najbardziej zmysłowa sygnatura.",
      en: "Green Bronte pistachio, ground to a paste and piped by hand into each fruit. Our most sensual signature.",
    },
    price: 129,
    weight: "300 g",
    pieces: "≈ 16",
    accent: "#A6A25C",
    bestFor: ["gift", "self"],
  },
  {
    slug: "noir-cacao",
    name: "Noir Cacao",
    category: "enrobee",
    tier: "collection",
    tagline: {
      pl: "Daktyl w ciemnej czekoladzie. Zmysłowy rytuał.",
      en: "The date in dark chocolate. A sensual ritual.",
    },
    variety: { pl: "Deglet Nour · czekolada 70%", en: "Deglet Nour · 70% dark" },
    origin: { pl: "Oazy Tolga, Algieria · Grand Cru", en: "Tolga oasis, Algeria · Grand Cru" },
    taste: {
      pl: "Gorzka czekolada, płatek soli morskiej, słodycz owocu.",
      en: "Bitter chocolate, a flake of sea salt, the sweetness of the fruit.",
    },
    texture: {
      pl: "Chrupiąca skorupa, płynne wnętrze.",
      en: "A crisp shell, a flowing centre.",
    },
    story: {
      pl: "Oblewane pojedynczo czekoladą Grand Cru, temperowaną ręcznie przez naszego chocolatiera.",
      en: "Enrobed one by one in Grand Cru couverture, tempered by hand by our chocolatier.",
    },
    price: 139,
    weight: "280 g",
    pieces: "≈ 15",
    accent: "#8A5A3B",
    badge: { pl: "Edycja limitowana", en: "Limited edition" },
    bestFor: ["gift", "self"],
  },

  /* ─────────────────────────  COFFRETS  ───────────────────────── */
  {
    slug: "collection-noor",
    name: "L'Écrin Noor",
    category: "coffret",
    tier: "royal",
    tagline: {
      pl: "Trzy sygnatury w jednej szkatule. Podróż przez smaki.",
      en: "Three signatures in one écrin. A journey through taste.",
    },
    variety: { pl: "Selekcja domu", en: "House selection" },
    origin: { pl: "Oazy Tolga, Algieria", en: "Tolga oasis, Algeria" },
    taste: {
      pl: "Lumière de Tolga, Cœur d'Amande i Noir Cacao — komplet.",
      en: "Lumière de Tolga, Cœur d'Amande and Noir Cacao — the complete set.",
    },
    texture: {
      pl: "Cały repertuar tekstur domu Noor.",
      en: "The house's full repertoire of textures.",
    },
    story: {
      pl: "Szkatuła obleczona lnem, wstążka w kolorze światła, karta z odręcznym życzeniem. Cadeau w najczystszej formie.",
      en: "A linen-wrapped écrin, a ribbon the colour of light, a card for a handwritten wish. The gift in its purest form.",
    },
    price: 289,
    compareAt: 347,
    weight: "830 g",
    pieces: "≈ 45",
    accent: "#C4A05A",
    badge: { pl: "Idealny prezent", en: "The perfect gift" },
    bestFor: ["gift", "corporate", "self"],
  },
  {
    slug: "royal-noor",
    name: "Le Grand Écrin",
    category: "coffret",
    tier: "royal",
    tagline: {
      pl: "Nasz najbardziej okazały gest. Dla chwil, które się liczą.",
      en: "Our most lavish gesture. For the moments that matter.",
    },
    variety: { pl: "Wielka selekcja + akcesoria", en: "Grand selection + accessories" },
    origin: { pl: "Oazy Tolga, Algieria", en: "Tolga oasis, Algeria" },
    taste: {
      pl: "Pełna kolekcja domu, podwojona, w drewnianej szkatule.",
      en: "The full house collection, doubled, in a wooden écrin.",
    },
    texture: {
      pl: "Wszystko, co Noor potrafi.",
      en: "Everything Noor can do.",
    },
    story: {
      pl: "Ręcznie wykończona szkatuła z drewna, srebrne szczypce, karta pochodzenia z numerem serii. Prezent, który się pamięta.",
      en: "A hand-finished wooden écrin, silver tongs, a numbered certificate of origin. A gift that is remembered.",
    },
    price: 549,
    compareAt: 640,
    weight: "1.4 kg",
    pieces: "≈ 78",
    accent: "#B8912F",
    badge: { pl: "Sygnatura domu", en: "House signature" },
    bestFor: ["gift", "corporate"],
  },

  /* ─────────────────────────  CORPORATE (hidden from shop grid)  ───────────────────────── */
  {
    slug: "corporate-noor",
    name: "Maison Noor · Corporate",
    category: "coffret",
    tier: "corporate",
    tagline: {
      pl: "Twoja marka, nasze rzemiosło. Prezenty firmowe z klasą.",
      en: "Your brand, our craft. Corporate gifting with grace.",
    },
    variety: { pl: "Personalizacja · grawer · wstążka", en: "Personalised · engraved · ribboned" },
    origin: { pl: "Oazy Tolga, Algieria", en: "Tolga oasis, Algeria" },
    taste: {
      pl: "Selekcja dobierana do okazji i budżetu.",
      en: "A selection tailored to the occasion and budget.",
    },
    texture: {
      pl: "Skala od 10 do 10 000 szkatuł.",
      en: "From 10 to 10,000 cases.",
    },
    story: {
      pl: "Logo tłoczone na wieczku, wstążka w Twoich kolorach, karta z dedykacją. Wysyłka na wiele adresów jednym zamówieniem.",
      en: "Your logo embossed on the lid, a ribbon in your colours, a dedication card. Shipping to many addresses in one order.",
    },
    price: 0, // quote-based
    weight: "na wymiar",
    pieces: "na wymiar",
    accent: "#C4A05A",
    bestFor: ["corporate"],
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export const shopProducts = products.filter((p) => p.tier !== "corporate");

export const FREE_SHIPPING_THRESHOLD = 200; // PLN — realistic PL luxury-food threshold
export const SHIPPING_COST = 19; // PLN standard courier

export function formatPLN(value: number, lang: Lang = "pl") {
  return new Intl.NumberFormat(lang === "pl" ? "pl-PL" : "en-GB", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
