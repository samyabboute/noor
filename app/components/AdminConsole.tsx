"use client";

import { useState } from "react";
import Link from "next/link";
import { NoorMark } from "./Logo";
import type { AdminData } from "../lib/repo";

const pln = (n: number) => new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 }).format(n);
const monthLabels = ["Sty", "Lut", "Mar", "Kwi", "Maj", "Cze", "Lip", "Sie", "Wrz", "Paź", "Lis", "Gru"];

type Tab = "overview" | "orders" | "products" | "customers";

const statusStyles: Record<string, string> = {
  paid: "bg-[#C2A25A]/15 text-orclair",
  shipped: "bg-sky-400/10 text-sky-300",
  fulfilled: "bg-emerald-400/10 text-emerald-300",
  delivered: "bg-emerald-400/10 text-emerald-300",
  refunded: "bg-rose-400/10 text-rose-300",
  pending: "bg-ivoire/10 text-ivoire/60",
};

function Sparkline({ series }: { series: number[] }) {
  const w = 560, h = 150, max = Math.max(...series), min = Math.min(...series);
  const pts = series.map((v, i) => {
    const x = (i / (series.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 20) - 10;
    return [x, y] as const;
  });
  const line = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Przychód">
      <defs>
        <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C2A25A" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#C2A25A" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1="0" y1={h * g} x2={w} y2={h * g} stroke="#F4EEE0" strokeOpacity="0.06" />
      ))}
      <path d={area} fill="url(#rev)" />
      <path d={line} fill="none" stroke="#D8BE7E" strokeWidth="2" />
      <circle cx={last[0]} cy={last[1]} r="4" fill="#F4EEE0" />
    </svg>
  );
}

function KPI({ label, value, delta, up }: { label: string; value: string; delta?: string; up?: boolean }) {
  return (
    <div className="rounded-sm border border-ivoire/10 bg-ombre/60 p-5">
      <p className="font-sans text-[11px] uppercase tracking-wide2 text-ivoire/45">{label}</p>
      <p className="mt-3 font-serif text-3xl text-ivoire">{value}</p>
      {delta && (
        <p className={`mt-2 font-sans text-[12px] ${up ? "text-emerald-300" : "text-rose-300"}`}>
          {up ? "▲" : "▼"} {delta} <span className="text-ivoire/40">vs poprz. mies.</span>
        </p>
      )}
    </div>
  );
}

function OrdersTable({ rows, full }: { rows: AdminData["orders"]; full?: boolean }) {
  return (
    <div className="overflow-hidden rounded-sm border border-ivoire/10">
      {!full && (
        <div className="border-b border-ivoire/10 bg-ombre/40 px-5 py-3">
          <p className="font-sans text-[12px] uppercase tracking-wide2 text-ivoire/50">Ostatnie zamówienia</p>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead className="bg-ombre/60 font-sans text-[11px] uppercase tracking-wide2 text-ivoire/45">
            <tr>{["Zamówienie", "Klient", "Poz.", "Kwota", "Status", "Data"].map((h) => <th key={h} className="px-5 py-3 font-normal">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-ivoire/10">
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center font-sans text-[13px] text-ivoire/40">Brak zamówień.</td></tr>
            )}
            {rows.map((o) => (
              <tr key={o.id} className="hover:bg-ivoire/[0.03]">
                <td className="px-5 py-4 font-sans text-[13px] tabular-nums text-orclair">{o.id}</td>
                <td className="px-5 py-4 font-serif text-[15px]">{o.customer}{o.city && <span className="ml-2 font-sans text-[11px] text-ivoire/40">{o.city}</span>}</td>
                <td className="px-5 py-4 font-sans text-[13px] tabular-nums text-ivoire/60">{o.items}</td>
                <td className="px-5 py-4 font-sans text-[13px] tabular-nums">{pln(o.total)}</td>
                <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 font-sans text-[11px] capitalize ${statusStyles[o.status] ?? statusStyles.pending}`}>{o.status}</span></td>
                <td className="px-5 py-4 font-sans text-[12px] text-ivoire/45">{o.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminConsole({ data }: { data: AdminData }) {
  const [tab, setTab] = useState<Tab>("overview");
  const nav: { id: Tab; label: string }[] = [
    { id: "overview", label: "Przegląd" },
    { id: "orders", label: "Zamówienia" },
    { id: "products", label: "Produkty" },
    { id: "customers", label: "Klienci" },
  ];
  const lowStock = [...data.products].sort((a, b) => a.stock - b.stock).slice(0, 3);

  return (
    <div className="min-h-screen bg-nuit text-ivoire">
      <div className="mx-auto flex max-w-[1500px]">
        <aside className="sticky top-0 hidden h-screen w-60 flex-none flex-col border-r border-ivoire/10 bg-ombre/40 p-6 md:flex">
          <div className="flex items-center gap-2.5">
            <NoorMark className="h-4 w-4 text-or" />
            <span className="font-serif text-[15px] tracking-[0.14em]">MAISON NOOR</span>
          </div>
          <p className="mt-1 font-sans text-[10px] uppercase tracking-wide2 text-ivoire/40">Konsola</p>
          <nav className="mt-10 flex flex-col gap-1">
            {nav.map((n) => (
              <button key={n.id} onClick={() => setTab(n.id)}
                className={`rounded-sm px-3 py-2.5 text-left font-sans text-[13px] transition ${tab === n.id ? "bg-ivoire/10 text-ivoire" : "text-ivoire/55 hover:text-ivoire"}`}>
                {n.label}
              </button>
            ))}
          </nav>
          <div className="mt-auto space-y-3">
            <span className={`inline-block rounded-full px-3 py-1 font-sans text-[10px] uppercase tracking-wide2 ${data.live ? "bg-emerald-400/15 text-emerald-300" : "bg-or/15 text-orclair"}`}>
              {data.live ? "Dane na żywo" : "Dane demonstracyjne"}
            </span>
            <Link href="/" className="block font-sans text-[12px] uppercase tracking-wide2 text-ivoire/50 hover:text-ivoire">← Do sklepu</Link>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-5 py-8 md:px-10">
          <div className="mb-6 flex gap-2 overflow-x-auto md:hidden">
            {nav.map((n) => (
              <button key={n.id} onClick={() => setTab(n.id)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-[12px] ${tab === n.id ? "bg-ivoire/10" : "text-ivoire/55"}`}>{n.label}</button>
            ))}
          </div>

          <div className="mb-8 flex items-end justify-between">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl">{nav.find((n) => n.id === tab)?.label}</h1>
              <p className="mt-1 font-sans text-[12px] text-ivoire/45">Maison Noor</p>
            </div>
            <button className="btn-solid-invert hidden py-3 text-[11px] sm:inline-flex">+ Nowy produkt</button>
          </div>

          {tab === "overview" && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <KPI label="Przychód" value={pln(data.kpis.revenue)} delta={data.live ? undefined : "12,4%"} up />
                <KPI label="Zamówienia" value={data.kpis.orders.toLocaleString("pl-PL")} delta={data.live ? undefined : "8,1%"} up />
                <KPI label="Śr. wartość koszyka" value={pln(data.kpis.aov)} delta={data.live ? undefined : "3,2%"} up />
                <KPI label="Konwersja" value={data.kpis.conversion} delta={data.live ? undefined : "0,4 pp"} />
              </div>
              <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                <div className="rounded-sm border border-ivoire/10 bg-ombre/40 p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="font-sans text-[12px] uppercase tracking-wide2 text-ivoire/50">Przychód miesięczny</p>
                    <span className="font-serif text-lg text-orclair">{pln(data.revenue[data.revenue.length - 1])}</span>
                  </div>
                  <Sparkline series={data.revenue} />
                  <div className="mt-2 flex justify-between font-sans text-[10px] text-ivoire/35">
                    {monthLabels.filter((_, i) => i % 2 === 0).map((m) => <span key={m}>{m}</span>)}
                  </div>
                </div>
                <div className="rounded-sm border border-ivoire/10 bg-ombre/40 p-6">
                  <p className="mb-4 font-sans text-[12px] uppercase tracking-wide2 text-ivoire/50">Niski stan magazynu</p>
                  <ul className="space-y-3">
                    {lowStock.map((p, i) => (
                      <li key={p.slug} className="flex items-center justify-between">
                        <span className="font-serif text-[15px]">{p.name}</span>
                        <span className={`font-sans text-[12px] ${i === 0 ? "text-rose-300" : "text-ivoire/50"}`}>{p.stock} szt.</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <OrdersTable rows={data.orders.slice(0, 4)} />
            </div>
          )}

          {tab === "orders" && <OrdersTable rows={data.orders} full />}

          {tab === "products" && (
            <div className="overflow-x-auto rounded-sm border border-ivoire/10">
              <table className="w-full min-w-[640px] text-left">
                <thead className="bg-ombre/60 font-sans text-[11px] uppercase tracking-wide2 text-ivoire/45">
                  <tr>{["Produkt", "Odmiana", "Cena", "Stan", "Status"].map((h) => <th key={h} className="px-5 py-3 font-normal">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-ivoire/10">
                  {data.products.map((p) => (
                    <tr key={p.slug} className="hover:bg-ivoire/[0.03]">
                      <td className="px-5 py-4 font-serif text-[16px]">{p.name}</td>
                      <td className="px-5 py-4 font-sans text-[13px] text-ivoire/60">{p.variety}</td>
                      <td className="px-5 py-4 font-sans text-[13px] tabular-nums">{pln(p.price)}</td>
                      <td className="px-5 py-4 font-sans text-[13px] tabular-nums text-ivoire/70">{p.stock} szt.</td>
                      <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 font-sans text-[11px] ${p.active ? "bg-emerald-400/10 text-emerald-300" : "bg-ivoire/10 text-ivoire/50"}`}>{p.active ? "Aktywny" : "Ukryty"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "customers" && (
            <div className="overflow-x-auto rounded-sm border border-ivoire/10">
              <table className="w-full min-w-[560px] text-left">
                <thead className="bg-ombre/60 font-sans text-[11px] uppercase tracking-wide2 text-ivoire/45">
                  <tr>{["Klient", "E-mail", "Zamówienia", "Wydano", "Segment"].map((h) => <th key={h} className="px-5 py-3 font-normal">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-ivoire/10">
                  {data.customers.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-10 text-center font-sans text-[13px] text-ivoire/40">Brak klientów.</td></tr>
                  )}
                  {data.customers.map((c) => (
                    <tr key={c.name} className="hover:bg-ivoire/[0.03]">
                      <td className="px-5 py-4 font-serif text-[16px]">{c.name}</td>
                      <td className="px-5 py-4 font-sans text-[13px] text-ivoire/50">{c.email}</td>
                      <td className="px-5 py-4 font-sans text-[13px] tabular-nums">{c.orders}</td>
                      <td className="px-5 py-4 font-sans text-[13px] tabular-nums">{pln(c.spent)}</td>
                      <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 font-sans text-[11px] ${c.tier === "VIP" ? "bg-or/15 text-orclair" : "bg-ivoire/10 text-ivoire/50"}`}>{c.tier}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
