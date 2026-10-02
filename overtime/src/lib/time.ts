/**
 * Time helpers. The contact centre runs on Kraków time, whatever the server's
 * clock says — every "today", "18:00" and greeting is resolved in this zone.
 */
export const TZ = process.env.NEXT_PUBLIC_TIMEZONE || "Europe/Warsaw";

const partsFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function zoned(d: Date) {
  const p: Record<string, string> = {};
  for (const x of partsFmt.formatToParts(d)) p[x.type] = x.value;
  return {
    date: `${p.year}-${p.month}-${p.day}`,
    hour: Number(p.hour),
    minute: Number(p.minute),
    second: Number(p.second),
  };
}

/** Today's date (YYYY-MM-DD) in the site's time zone. */
export function todayISO(now = new Date()) {
  return zoned(now).date;
}

/** Minutes since midnight, site time. */
export function nowMinutes(now = new Date()) {
  const z = zoned(now);
  return z.hour * 60 + z.minute;
}

export function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function fromMinutes(total: number) {
  const t = ((total % 1440) + 1440) % 1440;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

export function addMinutes(hhmm: string, minutes: number) {
  return fromMinutes(toMinutes(hhmm) + minutes);
}

/** Converts a wall-clock date + time in the site zone into a real instant. */
export function zonedToDate(date: string, hhmm: string) {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = hhmm.split(":").map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const z = zoned(new Date(guess));
  const asUTC = Date.UTC(
    Number(z.date.slice(0, 4)),
    Number(z.date.slice(5, 7)) - 1,
    Number(z.date.slice(8, 10)),
    z.hour,
    z.minute,
  );
  const offset = asUTC - guess;
  return new Date(guess - offset);
}

export function shiftDate(date: string, days: number) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function greeting(now = new Date()) {
  const h = zoned(now).hour;
  if (h < 5) return "Good evening";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function formatDuration(min: number) {
  const m = Math.round(min);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${String(r).padStart(2, "0")}m` : `${h}h`;
}

export function formatSeconds(sec: number) {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m === 0) return `${r}s`;
  return `${m}m ${String(r).padStart(2, "0")}s`;
}

export function formatDateLong(date: string, locale = "en-GB") {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

export function formatDateShort(date: string, locale = "en-GB") {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function formatClock(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
}

export function relativeTime(iso: string, now = Date.now()) {
  const diff = Math.round((now - new Date(iso).getTime()) / 1000);
  if (diff < 45) return "just now";
  if (diff < 3600) return `${Math.round(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  const days = Math.round(diff / 86400);
  return days === 1 ? "yesterday" : `${days} days ago`;
}
