export type Lang = "pl" | "en";

export interface Product {
  slug: string;
  name: string;
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

// Prices in PLN. Positioned as a luxury house — premium but credible for the Polish market.
export const products: Product[] = [
  {
    slug: "noor-signature",
    name: "Noor Signature",
    tier: "signature",
    tagline: {
      pl: "Nasza sygnatura. Medjool w najczystszej postaci.",
      en: "Our signature. Medjool in its purest form.",
    },
    variety: { pl: "Daktyle Medjool", en: "Medjool dates" },
    origin: { pl: "Dolina Jordanu", en: "Jordan Valley" },
    taste: {
      pl: "Karmel, miód i nuta toffi. Głęboka, ale nigdy przesłodzona.",
      en: "Caramel, honey and a whisper of toffee. Deep, never cloying.",
    },
    texture: {
      pl: "Aksamitna, wilgotna, topiąca się w ustach.",
      en: "Velvet, moist, melting on the tongue.",
    },
    story: {
      pl: "Owoce zbierane ręcznie w fazie pełnej dojrzałości, selekcjonowane sztuka po sztuce. Tylko najwięksi, najgładsi.",
      en: "Hand-harvested at full maturity, selected one by one. Only the largest, the smoothest.",
    },
    price: 89,
    weight: "250 g",
    pieces: "≈ 14",
    accent: "#D8B978",
    badge: { pl: "Bestseller", en: "Bestseller" },
    bestFor: ["gift", "self"],
  },
  {
    slug: "coeur-de-noor",
    name: "Cœur de Noor",
    tier: "collection",
    tagline: {
      pl: "Daktyl nadziewany. Serce ukryte w owocu.",
      en: "The stuffed date. A heart hidden inside the fruit.",
    },
    variety: { pl: "Medjool · migdał · orzech", en: "Medjool · almond · walnut" },
    origin: { pl: "Dolina Jordanu · Piemont", en: "Jordan Valley · Piedmont" },
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
    slug: "noir-cacao",
    name: "Noir Cacao",
    tier: "collection",
    tagline: {
      pl: "Daktyl w ciemnej czekoladzie. Zmysłowy rytuał.",
      en: "The date in dark chocolate. A sensual ritual.",
    },
    variety: { pl: "Medjool · czekolada 70%", en: "Medjool · 70% dark" },
    origin: { pl: "Dolina Jordanu · Grand Cru", en: "Jordan Valley · Grand Cru" },
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
  {
    slug: "collection-noor",
    name: "The Noor Collection",
    tier: "royal",
    tagline: {
      pl: "Trzy sygnatury w jednej szkatule. Podróż przez smaki.",
      en: "Three signatures in one case. A journey through taste.",
    },
    variety: { pl: "Selekcja domu", en: "House selection" },
    origin: { pl: "Dolina Jordanu", en: "Jordan Valley" },
    taste: {
      pl: "Nasza sygnatura, Cœur de Noor i Noir Cacao — komplet.",
      en: "Our signature, Cœur de Noor and Noir Cacao — the complete set.",
    },
    texture: {
      pl: "Cały repertuar tekstur domu Noor.",
      en: "The house's full repertoire of textures.",
    },
    story: {
      pl: "Szkatuła obleczona lnem, wstążka w kolorze światła, karta z odręcznym życzeniem. Cadeau w najczystszej formie.",
      en: "A linen-wrapped case, a ribbon the colour of light, a card for a handwritten wish. The gift in its purest form.",
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
    name: "The Royal Collection",
    tier: "royal",
    tagline: {
      pl: "Nasz najbardziej okazały gest. Dla chwil, które się liczą.",
      en: "Our most lavish gesture. For the moments that matter.",
    },
    variety: { pl: "Wielka selekcja + akcesoria", en: "Grand selection + accessories" },
    origin: { pl: "Dolina Jordanu", en: "Jordan Valley" },
    taste: {
      pl: "Pełna kolekcja domu, podwojona, w drewnianej szkatule.",
      en: "The full house collection, doubled, in a wooden case.",
    },
    texture: {
      pl: "Wszystko, co Noor potrafi.",
      en: "Everything Noor can do.",
    },
    story: {
      pl: "Ręcznie wykończona szkatuła z drewna, srebrne szczypce, karta pochodzenia z numerem serii. Prezent, który się pamięta.",
      en: "A hand-finished wooden case, silver tongs, a numbered certificate of origin. A gift that is remembered.",
    },
    price: 549,
    compareAt: 640,
    weight: "1.4 kg",
    pieces: "≈ 78",
    accent: "#B8912F",
    badge: { pl: "Sygnatura domu", en: "House signature" },
    bestFor: ["gift", "corporate"],
  },
  {
    slug: "corporate-noor",
    name: "Maison Noor · Corporate",
    tier: "corporate",
    tagline: {
      pl: "Twoja marka, nasze rzemiosło. Prezenty firmowe z klasą.",
      en: "Your brand, our craft. Corporate gifting with grace.",
    },
    variety: { pl: "Personalizacja · grawer · wstążka", en: "Personalised · engraved · ribboned" },
    origin: { pl: "Dolina Jordanu", en: "Jordan Valley" },
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
