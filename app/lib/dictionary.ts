import type { Lang } from "./products";

type Dict = Record<string, Record<Lang, string>>;

// Copywriting is authored natively in Polish (primary market) — not translated from English.
// English is the secondary, international register.
export const t: Dict = {
  // Nav
  "nav.collection": { pl: "Kolekcja", en: "Collection" },
  "nav.date": { pl: "Daktyl", en: "The Date" },
  "nav.craft": { pl: "Rzemiosło", en: "Craftsmanship" },
  "nav.gift": { pl: "Prezenty", en: "Gifting" },
  "nav.corporate": { pl: "Dla firm", en: "Corporate" },
  "nav.story": { pl: "Dom Noor", en: "Our House" },
  "nav.bag": { pl: "Torba", en: "Bag" },
  "nav.shop": { pl: "Do sklepu", en: "Shop" },

  // Hero
  "hero.eyebrow": { pl: "Maison Noor · Światło daktyla", en: "Maison Noor · The light of the date" },
  "hero.house": { pl: "Maison Noor", en: "Maison Noor" },
  "hero.light.a": { pl: "Daktyl", en: "The date" },
  "hero.light.b": { pl: "światła", en: "of light" },
  "hero.sub2": {
    pl: "Zebrane u źródła. Komponowane ręcznie.",
    en: "Harvested at the source. Composed by hand.",
  },
  "hero.title.a": { pl: "Sztuka", en: "The art" },
  "hero.title.b": { pl: "daktyla", en: "of the date" },
  "hero.sub": {
    pl: "Nie pudełko daktyli. Dom luksusu, którego dziełem jest daktyl.",
    en: "Not a box of dates. A luxury house whose work is the date.",
  },
  "hero.cta.discover": { pl: "Poznaj Maison Noor", en: "Discover Maison Noor" },
  "hero.cta.shop": { pl: "Zobacz kolekcję", en: "Shop the collection" },
  "hero.scroll": { pl: "Przewiń, by wejść", en: "Scroll to enter" },

  // 01 Discover
  "discover.index": { pl: "01 — Poznaj", en: "01 — Discover" },
  "discover.eyebrow": { pl: "Światło z Doliny Jordanu", en: "Light from the Jordan Valley" },
  "discover.title": {
    pl: "Daktyl to owoc światła.",
    en: "The date is a fruit of light.",
  },
  "discover.body": {
    pl: "Noor znaczy światło. I nie przez przypadek nasza odmiana — Deglet Nour — znaczy dosłownie „daktyl światła”. Rodzi się w algierskich oazach Tolga, w regionie Ziban pod Biskrą, tam gdzie słońce spotyka pustynię — w owocu, który od tysięcy lat jest symbolem gościnności i szczodrości. Maison Noor bierze ten gest i podnosi go do rangi haute couture: francuski luksus, północnoafrykańskie dziedzictwo, europejski minimalizm.",
    en: "Noor means light. And it is no accident that our variety — Deglet Nour — literally means “the date of light”. It is born in the Algerian oases of Tolga, in the Ziban near Biskra, where the sun meets the desert — a fruit that for millennia has meant hospitality and generosity. Maison Noor takes that gesture and raises it to haute couture: French luxury, North African heritage, European restraint.",
  },

  // 02 Collection
  "collection.index": { pl: "02 — Kolekcja", en: "02 — The Collection" },
  "collection.eyebrow": { pl: "Sygnatury domu", en: "The house signatures" },
  "collection.title": { pl: "Kolekcja", en: "The Collection" },
  "collection.body": {
    pl: "Cztery sygnatury. Jedno źródło. Każda szkatuła komponowana ręcznie w dniu wysyłki.",
    en: "Four signatures. One source. Every case composed by hand on the day it ships.",
  },
  "collection.all": { pl: "Zobacz całą kolekcję", en: "View the full collection" },
  "collection.from": { pl: "od", en: "from" },
  "collection.view": { pl: "Odkryj", en: "Discover" },

  // 03 The Date
  "date.index": { pl: "03 — Daktyl", en: "03 — The Date" },
  "date.eyebrow": { pl: "Dlaczego Noor jest inny", en: "Why Noor is different" },
  "date.title": {
    pl: "Jeden owoc. Sto decyzji.",
    en: "One fruit. A hundred decisions.",
  },
  "date.body": {
    pl: "Większość daktyli zbiera się masowo, suszy i pakuje miesiącami później. My robimy odwrotnie.",
    en: "Most dates are mass-harvested, dried, and packed months later. We do the opposite.",
  },
  "date.f1.k": { pl: "Kaliber", en: "Calibre" },
  "date.f1.v": { pl: "Tylko owoce Jumbo, selekcja ręczna sztuka po sztuce.", en: "Jumbo grade only, selected by hand, fruit by fruit." },
  "date.f2.k": { pl: "Wilgotność", en: "Moisture" },
  "date.f2.v": { pl: "Zbierane w pełni dojrzałości — nigdy dosuszane sztucznie.", en: "Picked at full maturity — never artificially dried." },
  "date.f3.k": { pl: "Świeżość", en: "Freshness" },
  "date.f3.v": { pl: "Komponowane w dniu wysyłki. Zero konserwantów, zero cukru.", en: "Composed the day they ship. Zero preservatives, zero added sugar." },
  "date.f4.k": { pl: "Pochodzenie", en: "Origin" },
  "date.f4.v": { pl: "Jeden region, jedna rodzina plantatorów, pełna identyfikowalność.", en: "One region, one growing family, full traceability." },

  // 04 Craftsmanship
  "craft.index": { pl: "04 — Rzemiosło", en: "04 — Craftsmanship" },
  "craft.eyebrow": { pl: "Od dłoni do dłoni", en: "From hand to hand" },
  "craft.title": { pl: "Rzemiosło", en: "Craftsmanship" },
  "craft.s1.k": { pl: "Zbiór", en: "The harvest" },
  "craft.s1.v": { pl: "O świcie, ręcznie, w fazie pełnej słodyczy.", en: "At dawn, by hand, at peak sweetness." },
  "craft.s2.k": { pl: "Selekcja", en: "The selection" },
  "craft.s2.v": { pl: "Sztuka po sztuce. Odrzucamy dziewięć na dziesięć.", en: "Fruit by fruit. We reject nine in ten." },
  "craft.s3.k": { pl: "Kompozycja", en: "The composition" },
  "craft.s3.v": { pl: "Nadziewane, oblewane, układane ludzką ręką.", en: "Filled, enrobed, arranged by human hands." },
  "craft.s4.k": { pl: "Szkatuła", en: "The case" },
  "craft.s4.v": { pl: "Zamykana, wiązana wstążką, gotowa na gest.", en: "Closed, ribboned, ready for the gesture." },

  // 05 Gift
  "gift.index": { pl: "05 — Prezenty", en: "05 — Gift Collection" },
  "gift.eyebrow": { pl: "Sztuka dawania", en: "The art of giving" },
  "gift.title": { pl: "Prezent, który się pamięta", en: "A gift that is remembered" },
  "gift.body": {
    pl: "Szkatuła obleczona lnem. Wstążka w kolorze światła. Miejsce na odręczne życzenie. Otwieranie Maison Noor to część prezentu.",
    en: "A linen-wrapped case. A ribbon the colour of light. Room for a handwritten wish. Opening Maison Noor is part of the gift.",
  },
  "gift.cta": { pl: "Skomponuj prezent", en: "Compose a gift" },

  // 06 Corporate
  "corp.index": { pl: "06 — Dla firm", en: "06 — Corporate Gifting" },
  "corp.eyebrow": { pl: "Gest w skali", en: "The gesture, at scale" },
  "corp.title": { pl: "Prezenty firmowe", en: "Corporate Gifting" },
  "corp.body": {
    pl: "Wytłoczone logo. Wstążka w Twoich kolorach. Dedykacja. Wysyłka na setki adresów jednym zamówieniem. Dla klientów, partnerów i zespołu, który na to zasługuje.",
    en: "An embossed logo. A ribbon in your colours. A dedication. Shipping to hundreds of addresses in a single order. For the clients, partners and team who deserve it.",
  },
  "corp.cta": { pl: "Poproś o ofertę", en: "Request a quote" },
  "corp.b1": { pl: "Personalizacja od 10 szkatuł", en: "Personalisation from 10 cases" },
  "corp.b2": { pl: "Faktura VAT i obsługa dedykowana", en: "VAT invoice & a dedicated contact" },
  "corp.b3": { pl: "Wysyłka wieloadresowa w całej UE", en: "Multi-address delivery across the EU" },

  // 07 Story
  "story.index": { pl: "07 — Dom Noor", en: "07 — Maison Noor Story" },
  "story.eyebrow": { pl: "Nasza historia", en: "Our story" },
  "story.title": { pl: "Zbudowany wokół światła", en: "Built around the light" },
  "story.body": {
    pl: "Maison Noor narodził się z prostego przekonania: najstarszy gest gościnności — podanie daktyla gościowi — zasługuje na oprawę godną wielkich domów mody. Nie sprzedajemy przekąski. Ofiarowujemy rytuał.",
    en: "Maison Noor began from a simple conviction: the oldest gesture of hospitality — offering a date to a guest — deserves the setting of the great fashion houses. We do not sell a snack. We offer a ritual.",
  },

  // 08 Reviews
  "reviews.index": { pl: "08 — Opinie", en: "08 — Reviews" },
  "reviews.eyebrow": { pl: "Głosy naszych gości", en: "Voices of our guests" },
  "reviews.title": { pl: "Zaufanie, sztuka po sztuce", en: "Trust, fruit by fruit" },

  // 09 Instagram
  "ig.index": { pl: "09 — Lifestyle", en: "09 — Lifestyle" },
  "ig.eyebrow": { pl: "@maisonnoor", en: "@maisonnoor" },
  "ig.title": { pl: "Światło, wszędzie", en: "The light, everywhere" },
  "ig.cta": { pl: "Obserwuj na Instagramie", en: "Follow on Instagram" },

  // 10 Newsletter
  "news.index": { pl: "10 — Newsletter", en: "10 — Newsletter" },
  "news.eyebrow": { pl: "Krąg Maison Noor", en: "The Maison Noor circle" },
  "news.title": { pl: "Wejdź do kręgu", en: "Enter the circle" },
  "news.body": {
    pl: "Wczesny dostęp do edycji limitowanych, rytuały na Ramadan, Eid i święta, oraz 10% na pierwsze zamówienie.",
    en: "Early access to limited editions, rituals for Ramadan, Eid and the holidays, and 10% off your first order.",
  },
  "news.placeholder": { pl: "Twój adres e-mail", en: "Your email address" },
  "news.cta": { pl: "Dołącz", en: "Join" },
  "news.consent": {
    pl: "Zapisując się, akceptujesz naszą Politykę prywatności. Możesz wypisać się w każdej chwili.",
    en: "By joining you accept our Privacy Policy. Unsubscribe anytime.",
  },

  // Trust bar
  "trust.origin": { pl: "Jedno pochodzenie", en: "Single origin" },
  "trust.origin.d": { pl: "Pełna identyfikowalność", en: "Fully traceable" },
  "trust.handmade": { pl: "Ręcznie komponowane", en: "Composed by hand" },
  "trust.handmade.d": { pl: "W dniu wysyłki", en: "The day it ships" },
  "trust.ship": { pl: "Wysyłka 24 h", en: "Ships in 24 h" },
  "trust.ship.d": { pl: "Kurier w całej UE", en: "Courier across the EU" },
  "trust.pay": { pl: "Bezpieczna płatność", en: "Secure payment" },
  "trust.pay.d": { pl: "BLIK · Przelewy24 · karta", en: "BLIK · Przelewy24 · card" },

  // Product page
  "pdp.add": { pl: "Dodaj do torby", en: "Add to bag" },
  "pdp.added": { pl: "Dodano do torby", en: "Added to bag" },
  "pdp.quote": { pl: "Poproś o wycenę", en: "Request a quote" },
  "pdp.qty": { pl: "Ilość", en: "Quantity" },
  "pdp.instock": { pl: "Dostępny · wysyłka w 24 h", en: "In stock · ships in 24 h" },
  "pdp.lowstock": { pl: "Ostatnie sztuki tej edycji", en: "Final pieces of this edition" },
  "pdp.deliveryEst": { pl: "Dostawa 14–16 sierpnia", en: "Delivery 14–16 August" },
  "pdp.variety": { pl: "Odmiana", en: "Variety" },
  "pdp.origin": { pl: "Pochodzenie", en: "Origin" },
  "pdp.taste": { pl: "Smak", en: "Taste" },
  "pdp.texture": { pl: "Tekstura", en: "Texture" },
  "pdp.weight": { pl: "Waga", en: "Weight" },
  "pdp.pieces": { pl: "Liczba sztuk", en: "Pieces" },
  "pdp.keep": { pl: "Przechowywanie", en: "Keeping" },
  "pdp.keep.v": { pl: "Chłodno i sucho, do 3 tygodni. Nie wymaga lodówki.", en: "Cool and dry, up to 3 weeks. No refrigeration needed." },
  "pdp.delivery": { pl: "Dostawa i zwroty", en: "Delivery & returns" },
  "pdp.delivery.v": { pl: "Kurier InPost / DPD. Darmowa dostawa od 200 zł. Zwrot w 14 dni.", en: "InPost / DPD courier. Free delivery over 200 zł. 14-day returns." },
  "pdp.story": { pl: "Historia sygnatury", en: "The story" },
  "pdp.complete": { pl: "Dopełnij prezent", en: "Complete the gift" },
  "pdp.giftnote": { pl: "Dodaj odręczne życzenie (gratis)", en: "Add a handwritten wish (complimentary)" },

  // Bag
  "bag.title": { pl: "Twoja torba", en: "Your bag" },
  "bag.empty": { pl: "Twoja torba jest jeszcze pusta.", en: "Your bag is still empty." },
  "bag.emptyCta": { pl: "Odkryj kolekcję", en: "Discover the collection" },
  "bag.subtotal": { pl: "Suma częściowa", en: "Subtotal" },
  "bag.shipping": { pl: "Dostawa", en: "Delivery" },
  "bag.free": { pl: "Gratis", en: "Complimentary" },
  "bag.total": { pl: "Razem", en: "Total" },
  "bag.checkout": { pl: "Przejdź do kasy", en: "Proceed to checkout" },
  "bag.remove": { pl: "Usuń", en: "Remove" },
  "bag.freeProgressA": { pl: "Do darmowej dostawy brakuje", en: "You are" },
  "bag.freeProgressB": { pl: "", en: "away from complimentary delivery" },
  "bag.freeDone": { pl: "Masz darmową dostawę — nasz gest dla Ciebie.", en: "You have complimentary delivery — our gesture to you." },
  "bag.crosssell": { pl: "Dopełnij doświadczenie Maison Noor", en: "Complete your Maison Noor experience" },
  "bag.add": { pl: "Dodaj", en: "Add" },
  "bag.giftwrap": { pl: "Eleganckie opakowanie w cenie", en: "Signature gift wrapping included" },

  // Checkout
  "co.title": { pl: "Kasa", en: "Checkout" },
  "co.contact": { pl: "Kontakt", en: "Contact" },
  "co.email": { pl: "E-mail", en: "Email" },
  "co.phone": { pl: "Telefon (do kuriera)", en: "Phone (for the courier)" },
  "co.delivery": { pl: "Dostawa", en: "Delivery" },
  "co.name": { pl: "Imię i nazwisko", en: "Full name" },
  "co.address": { pl: "Adres", en: "Address" },
  "co.city": { pl: "Miasto", en: "City" },
  "co.zip": { pl: "Kod pocztowy", en: "Postcode" },
  "co.method": { pl: "Sposób dostawy", en: "Delivery method" },
  "co.inpost": { pl: "Paczkomat InPost", en: "InPost locker" },
  "co.courier": { pl: "Kurier DPD — pod drzwi", en: "DPD courier — to your door" },
  "co.payment": { pl: "Płatność", en: "Payment" },
  "co.blik": { pl: "BLIK", en: "BLIK" },
  "co.p24": { pl: "Przelewy24", en: "Przelewy24" },
  "co.card": { pl: "Karta płatnicza", en: "Card" },
  "co.wallet": { pl: "Apple Pay / Google Pay", en: "Apple Pay / Google Pay" },
  "co.pay": { pl: "Zapłać", en: "Pay" },
  "co.secure": { pl: "Płatność szyfrowana. Twoje dane są bezpieczne.", en: "Encrypted payment. Your data is safe." },
  "co.giftnote": { pl: "To prezent — dodaj życzenie", en: "This is a gift — add a wish" },
  "co.summary": { pl: "Podsumowanie", en: "Summary" },
  "co.demo": { pl: "Wersja demonstracyjna — płatność nie zostanie pobrana.", en: "Demo build — no payment will be taken." },
  "co.placed": { pl: "Dziękujemy. Twój gest jest w drodze.", en: "Thank you. Your gesture is on its way." },

  // Footer
  "footer.tagline": { pl: "Światło daktyla.", en: "The light of the date." },
  "footer.shop": { pl: "Sklep", en: "Shop" },
  "footer.house": { pl: "Dom", en: "House" },
  "footer.care": { pl: "Obsługa", en: "Care" },
  "footer.legal": { pl: "Prawne", en: "Legal" },
  "footer.rights": { pl: "Wszelkie prawa zastrzeżone.", en: "All rights reserved." },
  "footer.made": { pl: "Skomponowane z troską. Wysyłane z Warszawy.", en: "Composed with care. Shipped from Warsaw." },

  // Common
  "common.back": { pl: "Wróć", en: "Back" },
  "common.close": { pl: "Zamknij", en: "Close" },
};

export function tr(key: string, lang: Lang): string {
  return t[key]?.[lang] ?? key;
}
