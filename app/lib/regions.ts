import type { Lang } from "./products";

export type CurrencyCode = "PLN" | "EUR" | "GBP" | "USD";

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  /** Display rate relative to the PLN base price. Operational value —
   *  wire to a live FX feed (e.g. ECB) in production; not a commercial claim. */
  rate: number;
  locale: string;
  decimals: number;
}

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  PLN: { code: "PLN", symbol: "zł", rate: 1, locale: "pl-PL", decimals: 0 },
  EUR: { code: "EUR", symbol: "€", rate: 0.23, locale: "de-DE", decimals: 2 },
  GBP: { code: "GBP", symbol: "£", rate: 0.2, locale: "en-GB", decimals: 2 },
  USD: { code: "USD", symbol: "$", rate: 0.25, locale: "en-US", decimals: 2 },
};

export interface Region {
  country: string; // ISO-3166 alpha-2
  name: Record<Lang, string>;
  currency: CurrencyCode;
  freeShippingNote?: boolean;
}

/** A curated set of served regions. Everything else falls back to EU / EUR. */
export const REGIONS: Region[] = [
  { country: "PL", name: { pl: "Polska", en: "Poland" }, currency: "PLN" },
  { country: "DE", name: { pl: "Niemcy", en: "Germany" }, currency: "EUR" },
  { country: "FR", name: { pl: "Francja", en: "France" }, currency: "EUR" },
  { country: "GB", name: { pl: "Wielka Brytania", en: "United Kingdom" }, currency: "GBP" },
  { country: "US", name: { pl: "USA", en: "United States" }, currency: "USD" },
  { country: "AE", name: { pl: "Emiraty", en: "United Arab Emirates" }, currency: "USD" },
];

const EU_EUR = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE",
  "IT", "LV", "LT", "LU", "MT", "NL", "PT", "RO", "SK", "SI", "ES", "SE",
]);

export function currencyForCountry(country?: string): CurrencyCode {
  if (!country) return "PLN";
  const c = country.toUpperCase();
  if (c === "PL") return "PLN";
  if (c === "GB") return "GBP";
  if (c === "US") return "USD";
  if (EU_EUR.has(c)) return "EUR";
  return "EUR";
}

export function regionForCountry(country?: string): Region {
  const c = (country || "PL").toUpperCase();
  return (
    REGIONS.find((r) => r.country === c) ?? {
      country: c,
      name: { pl: c, en: c },
      currency: currencyForCountry(c),
    }
  );
}

/** Convert a PLN base price to the active currency and format it. */
export function formatMoney(pln: number, code: CurrencyCode): string {
  const cur = CURRENCIES[code];
  const value = pln * cur.rate;
  // Round EUR/GBP/USD to a clean .00 / .90 feel; PLN stays whole.
  const rounded =
    cur.decimals === 0 ? Math.round(value) : Math.round(value * 100) / 100;
  return new Intl.NumberFormat(cur.locale, {
    style: "currency",
    currency: code,
    minimumFractionDigits: cur.decimals,
    maximumFractionDigits: cur.decimals,
  }).format(rounded);
}
