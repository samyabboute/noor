export type Lang = "pl" | "en";

// The three houses of the catalogue. Every product belongs to exactly one.
export type Category = "coffret" | "enrobee" | "nature";

export interface Product {
  slug: string;
  name: string;
  category: Category;
  tier: "signature" | "collection" | "royal" | "gift" | "corporate";
  // Real product photography (public/products/*). fit controls how it sits in a frame.
  image: string;
  fit: "cover" | "contain";
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
 * THE MAISON NOOR CATALOGUE — three coherent houses, each matched to real
 * product photography (public/products):
 *   · NATURE   — the pure Deglet Nour: Lumière de Tolga, Grande Récolte, Réserve du Ziban
 *   · ENROBÉES — the worked, coated date, one photograph each:
 *                Cœur d'Amande, Noir Framboise, Lait Praliné, Zeste Noir
 *   · COFFRETS — the écrin, the gift box: L'Écrin Découverte, L'Écrin Noor, Le Grand Écrin
 * Prices in PLN. Positioned as a luxury house — premium but credible for the Polish market.
 */
export const products: Product[] = [
  /* ─────────────────────────  NATURE  ───────────────────────── */
  {
    slug: "noor-signature",
    name: "Lumière de Tolga",
    category: "nature",
    tier: "signature",
    image: "/products/deglet-single.webp",
    fit: "cover",
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
    image: "/products/deglet-branch.webp",
    fit: "cover",
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
    image: "/products/deglet-trio.webp",
    fit: "cover",
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
    slug: "perle-pistache",
    name: "Perle de Pistache",
    category: "enrobee",
    tier: "collection",
    image: "/products/DATTE_ENROBEE_INDIVIDUELLE_POUR_SITE_6.webp",
    fit: "cover",
    tagline: {
      pl: "Daktyl w ciemnej czekoladzie, wieńczony zieloną pistacją.",
      en: "A date in dark chocolate, crowned with green pistachio.",
    },
    variety: { pl: "Deglet Nour · pistacja · czekolada 70%", en: "Deglet Nour · pistachio · 70% dark" },
    origin: { pl: "Oazy Tolga, Algieria · Sycylia", en: "Tolga oasis, Algeria · Sicily" },
    taste: {
      pl: "Maślana pistacja, gorzka czekolada, głęboki karmel owocu.",
      en: "Buttery pistachio, bitter chocolate, the fruit's deep caramel.",
    },
    texture: {
      pl: "Chrupiąca skorupa, kruszona pistacja, jedwabiste wnętrze.",
      en: "A crisp shell, crushed pistachio, a silken centre.",
    },
    story: {
      pl: "Oblewane czekoladą Grand Cru i wieńczone ręcznie zieloną pistacją z Bronte. Nasza najbardziej zmysłowa sygnatura.",
      en: "Enrobed in Grand Cru couverture and crowned by hand with green Bronte pistachio. Our most sensual signature.",
    },
    price: 139,
    weight: "280 g",
    pieces: "≈ 15",
    accent: "#6F7A3C",
    badge: { pl: "Nowość", en: "New" },
    bestFor: ["gift", "self"],
  },
  {
    slug: "coeur-de-noor",
    name: "Cœur d'Amande",
    category: "enrobee",
    tier: "collection",
    image: "/products/7_41fd26a6-2086-4647-9168-211dcb466950.webp",
    fit: "cover",
    tagline: {
      pl: "Daktyl nadziewany migdałem, w mlecznej czekoladzie.",
      en: "A date filled with almond, robed in milk chocolate.",
    },
    variety: { pl: "Deglet Nour · migdał · czekolada mleczna", en: "Deglet Nour · almond · milk chocolate" },
    origin: { pl: "Oazy Tolga, Algieria · Piemont", en: "Tolga oasis, Algeria · Piedmont" },
    taste: {
      pl: "Prażony migdał, karmel i mleczna czekolada. Kontrast, który uzależnia.",
      en: "Roasted almond, caramel and milk chocolate. An addictive contrast.",
    },
    texture: {
      pl: "Miękkość owocu, chrupkość karmelizowanego migdału.",
      en: "Soft fruit, the crunch of caramelised almond.",
    },
    story: {
      pl: "Każdy owoc otwierany i nadziewany ręcznie, oblewany mleczną czekoladą i wieńczony karmelizowanym migdałem.",
      en: "Each fruit opened and filled by hand, robed in milk chocolate and crowned with caramelised almond.",
    },
    price: 119,
    weight: "300 g",
    pieces: "≈ 16",
    accent: "#B07B44",
    bestFor: ["gift", "self"],
  },
  {
    slug: "noir-framboise",
    name: "Noir Framboise",
    category: "enrobee",
    tier: "collection",
    image: "/products/6_b0440c01-07cd-4720-9990-d70398687871.webp",
    fit: "cover",
    tagline: {
      pl: "Daktyl w ciemnej czekoladzie z płatkami malin.",
      en: "A date in dark chocolate, strewn with raspberry.",
    },
    variety: { pl: "Deglet Nour · czekolada 70% · malina", en: "Deglet Nour · 70% dark · raspberry" },
    origin: { pl: "Oazy Tolga, Algieria · Grand Cru", en: "Tolga oasis, Algeria · Grand Cru" },
    taste: {
      pl: "Gorzka czekolada, kwaskowa malina, głęboka słodycz owocu.",
      en: "Bitter chocolate, tart raspberry, the deep sweetness of the fruit.",
    },
    texture: {
      pl: "Chrupiąca skorupa, liofilizowana malina, miękkie wnętrze.",
      en: "A crisp shell, freeze-dried raspberry, a soft centre.",
    },
    story: {
      pl: "Oblewane pojedynczo czekoladą Grand Cru i wieńczone kruszonką z malin liofilizowanych.",
      en: "Enrobed one by one in Grand Cru couverture and finished with a crumble of freeze-dried raspberry.",
    },
    price: 139,
    weight: "280 g",
    pieces: "≈ 15",
    accent: "#7A3B39",
    badge: { pl: "Edycja limitowana", en: "Limited edition" },
    bestFor: ["gift", "self"],
  },
  {
    slug: "lait-praline",
    name: "Lait Praliné",
    category: "enrobee",
    tier: "collection",
    image: "/products/12_ea8c6ce5-87b3-4b45-a18f-08619fbeb22b.webp",
    fit: "cover",
    tagline: {
      pl: "Daktyl w mlecznej czekoladzie, z sercem pralinowym.",
      en: "A date in milk chocolate, with a praline heart.",
    },
    variety: { pl: "Deglet Nour · praliné · czekolada mleczna", en: "Deglet Nour · praliné · milk chocolate" },
    origin: { pl: "Oazy Tolga, Algieria · Lyon", en: "Tolga oasis, Algeria · Lyon" },
    taste: {
      pl: "Orzechowe praliné i jedwabista czekolada mleczna. Najłagodniejsza z sygnatur.",
      en: "Nutty praliné and silken milk chocolate. The gentlest of the signatures.",
    },
    texture: {
      pl: "Gładka skorupa, płynne praliné w środku.",
      en: "A smooth shell, a flowing praliné within.",
    },
    story: {
      pl: "Nadziewane pralinowym kremem z prażonych orzechów laskowych, oblewane i dekorowane ręcznie.",
      en: "Filled with a praliné of roasted hazelnuts, enrobed and hand-decorated one by one.",
    },
    price: 119,
    weight: "300 g",
    pieces: "≈ 16",
    accent: "#A9784A",
    bestFor: ["gift", "self"],
  },
  {
    slug: "zeste-noir",
    name: "Zeste Noir",
    category: "enrobee",
    tier: "collection",
    image: "/products/15_1479b91a-a8fb-475c-8647-64b258e99c37.webp",
    fit: "cover",
    tagline: {
      pl: "Daktyl w ciemnej czekoladzie z kandyzowaną skórką pomarańczy.",
      en: "A date in dark chocolate, crowned with candied orange.",
    },
    variety: { pl: "Deglet Nour · czekolada 70% · pomarańcza", en: "Deglet Nour · 70% dark · orange" },
    origin: { pl: "Oazy Tolga, Algieria · Sycylia", en: "Tolga oasis, Algeria · Sicily" },
    taste: {
      pl: "Gorzka czekolada, słońce kandyzowanej pomarańczy, karmel owocu.",
      en: "Bitter chocolate, the sun of candied orange, the fruit's caramel.",
    },
    texture: {
      pl: "Chrupiąca skorupa, sprężysta skórka pomarańczy.",
      en: "A crisp shell, the tender bite of candied peel.",
    },
    story: {
      pl: "Skórka pomarańczy kandyzowana powoli, ułożona ręcznie na każdym owocu oblanym Grand Cru.",
      en: "Orange peel slowly candied, laid by hand on each fruit robed in Grand Cru.",
    },
    price: 139,
    weight: "280 g",
    pieces: "≈ 15",
    accent: "#8A5A3B",
    bestFor: ["gift", "self"],
  },

  /* ─────────────────────────  COFFRETS  ───────────────────────── */
  {
    slug: "ecrin-decouverte",
    name: "L'Écrin Découverte",
    category: "coffret",
    tier: "collection",
    image: "/products/COFFRET_RAMADAN_SITE_26.webp",
    fit: "contain",
    tagline: {
      pl: "Pięć sygnatur, by poznać dom Noor.",
      en: "Five signatures, to discover the house of Noor.",
    },
    variety: { pl: "5 daktyli · selekcja domu", en: "5 dates · house selection" },
    origin: { pl: "Oazy Tolga, Algieria", en: "Tolga oasis, Algeria" },
    taste: {
      pl: "Pięć oblewanych sygnatur, po jednej z każdego smaku.",
      en: "Five enrobed signatures, one of each taste.",
    },
    texture: {
      pl: "Cały repertuar tekstur, w miniaturze.",
      en: "The full repertoire of textures, in miniature.",
    },
    story: {
      pl: "Nasza brama do domu Noor — pastelowa szkatuła z pięcioma oblewanymi daktylami i kartą do dedykacji.",
      en: "Our doorway into the house of Noor — a pastel écrin of five enrobed dates and a card for a wish.",
    },
    price: 149,
    weight: "150 g",
    pieces: "5",
    accent: "#C9A98F",
    badge: { pl: "Na początek", en: "To begin" },
    bestFor: ["gift", "self"],
  },
  {
    slug: "collection-noor",
    name: "L'Écrin Noor",
    category: "coffret",
    tier: "royal",
    image: "/products/Coffret-Revelation-02.webp",
    fit: "contain",
    tagline: {
      pl: "Dziesięć oblewanych sygnatur w jednej szkatule.",
      en: "Ten enrobed signatures in one écrin.",
    },
    variety: { pl: "10 daktyli · selekcja domu", en: "10 dates · house selection" },
    origin: { pl: "Oazy Tolga, Algieria", en: "Tolga oasis, Algeria" },
    taste: {
      pl: "Cœur d'Amande, Noir Framboise, Lait Praliné i Zeste Noir — komplet.",
      en: "Cœur d'Amande, Noir Framboise, Lait Praliné and Zeste Noir — the complete set.",
    },
    texture: {
      pl: "Cały repertuar tekstur domu Noor.",
      en: "The house's full repertoire of textures.",
    },
    story: {
      pl: "Szkatuła obleczona czernią i złotem w stylu art déco, wstążka w kolorze światła, karta z odręcznym życzeniem. Cadeau w najczystszej formie.",
      en: "An art-déco écrin in black and gold, a ribbon the colour of light, a card for a handwritten wish. The gift in its purest form.",
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
    image: "/products/Sans-titre-39.webp",
    fit: "contain",
    tagline: {
      pl: "Nasz najbardziej okazały gest. Dla chwil, które się liczą.",
      en: "Our most lavish gesture. For the moments that matter.",
    },
    variety: { pl: "Wielka selekcja · trzy szkatuły", en: "Grand selection · three écrins" },
    origin: { pl: "Oazy Tolga, Algieria", en: "Tolga oasis, Algeria" },
    taste: {
      pl: "Pełna kolekcja domu, potrojona, w szkatułach ze wstążką.",
      en: "The full house collection, tripled, in ribboned écrins.",
    },
    texture: {
      pl: "Wszystko, co Noor potrafi.",
      en: "Everything Noor can do.",
    },
    story: {
      pl: "Trzy okazałe szkatuły przewiązane wstążką z sygnaturą, karta pochodzenia z numerem serii. Prezent, który się pamięta.",
      en: "Three grand écrins bound in signature ribbon, a numbered certificate of origin. A gift that is remembered.",
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
    image: "/products/63_a6d01f44-fd31-4e5c-8080-ab89ff18ae40.webp",
    fit: "contain",
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
