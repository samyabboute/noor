"use client";

import { useState } from "react";
import Link from "next/link";
import ProductVisual from "../components/ProductVisual";
import { Logo } from "../components/Logo";
import { useStore } from "../lib/store";
import { getProduct, SHIPPING_COST } from "../lib/products";

function Field({
  label,
  type = "text",
  full = false,
  ...rest
}: { label: string; type?: string; full?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <span className="font-sans text-[11px] uppercase tracking-wide2 text-ink/50">{label}</span>
      <input
        type={type}
        className="border-b border-ink/25 bg-transparent py-2.5 font-sans text-[14px] focus:border-or focus:outline-none"
        {...rest}
      />
    </label>
  );
}

export default function CheckoutPage() {
  const { t, lang, money, cart, subtotal, shipping, total, clearCart } = useStore();
  const [pay, setPay] = useState<"blik" | "p24" | "card" | "wallet">("blik");
  const [ship, setShip] = useState<"inpost" | "courier">("inpost");
  const [gift, setGift] = useState(false);
  const [placed, setPlaced] = useState(false);

  const payMethods = [
    { id: "blik", label: t("co.blik"), hint: "6 cyfr z aplikacji banku" },
    { id: "p24", label: t("co.p24"), hint: "350+ banków" },
    { id: "card", label: t("co.card"), hint: "Visa · Mastercard" },
    { id: "wallet", label: t("co.wallet"), hint: "1-tap" },
  ] as const;

  if (placed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-paper px-6 text-center text-ink">
        <svg viewBox="0 0 40 40" className="h-12 w-12 text-or">
          <path d="M20 2 C21 13 27 19 38 20 C27 21 21 27 20 38 C19 27 13 21 2 20 C13 19 19 13 20 2 Z" fill="currentColor" />
        </svg>
        <h1 className="display text-4xl md:text-5xl">{t("co.placed")}</h1>
        <p className="max-w-sm font-sans text-[14px] text-ink/60">{t("pdp.deliveryEst")}</p>
        <Link href="/" className="btn-solid mt-2">
          Maison Noor
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper px-6 text-center">
        <Logo />
        <p className="font-serif text-2xl text-ink/60">{t("bag.empty")}</p>
        <Link href="/kolekcja" className="btn-ghost">{t("bag.emptyCta")}</Link>
      </div>
    );
  }

  const shippingCost = ship === "inpost" ? shipping : shipping === 0 ? 0 : SHIPPING_COST + 6;
  const grand = subtotal + shippingCost;

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto grid max-w-[1200px] lg:grid-cols-[1.3fr_1fr]">
        {/* Form */}
        <div className="px-6 pb-20 pt-28 md:px-12 md:pt-32">
          <Link href="/"><Logo /></Link>
          <h1 className="display mt-8 text-4xl">{t("co.title")}</h1>
          <p className="mt-2 font-sans text-[12px] uppercase tracking-wide2 text-or">{t("co.demo")}</p>

          <form
            className="mt-10 space-y-12"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              try {
                await fetch("/api/orders", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({
                    email: (form.querySelector('input[type="email"]') as HTMLInputElement)?.value || "",
                    phone: (form.querySelector('input[type="tel"]') as HTMLInputElement)?.value || "",
                    items: cart,
                    shipMethod: ship,
                    currency: "PLN",
                  }),
                });
              } catch {
                /* best-effort — payment is the source of truth */
              }
              clearCart();
              setPlaced(true);
            }}
          >
            <fieldset>
              <legend className="font-serif text-2xl">{t("co.contact")}</legend>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field label={t("co.email")} type="email" required full />
                <Field label={t("co.phone")} type="tel" required full />
              </div>
            </fieldset>

            <fieldset>
              <legend className="font-serif text-2xl">{t("co.delivery")}</legend>
              {/* Delivery method */}
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {([
                  { id: "inpost", label: t("co.inpost"), price: shipping === 0 ? t("bag.free") : money(SHIPPING_COST) },
                  { id: "courier", label: t("co.courier"), price: shipping === 0 ? t("bag.free") : money(SHIPPING_COST + 6) },
                ] as const).map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setShip(m.id)}
                    className={`flex items-center justify-between rounded-sm border px-4 py-4 text-left transition ${
                      ship === m.id ? "border-or bg-or/5" : "border-ink/20"
                    }`}
                  >
                    <span className="font-sans text-[13px]">{m.label}</span>
                    <span className="font-sans text-[12px] text-ink/60">{m.price}</span>
                  </button>
                ))}
              </div>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field label={t("co.name")} required full />
                <Field label={t("co.address")} required full />
                <Field label={t("co.zip")} required placeholder="00-000" />
                <Field label={t("co.city")} required />
              </div>

              <label className="mt-5 flex items-center gap-3 font-sans text-[13px]">
                <input type="checkbox" checked={gift} onChange={(e) => setGift(e.target.checked)} className="accent-or" />
                {t("co.giftnote")}
              </label>
              {gift && (
                <textarea
                  rows={3}
                  placeholder={t("pdp.giftnote")}
                  className="mt-3 w-full rounded-sm border border-ink/20 bg-transparent p-3 font-sans text-[14px] focus:border-or focus:outline-none"
                />
              )}
            </fieldset>

            <fieldset>
              <legend className="font-serif text-2xl">{t("co.payment")}</legend>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {payMethods.map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setPay(m.id)}
                    className={`flex flex-col items-start rounded-sm border px-4 py-4 text-left transition ${
                      pay === m.id ? "border-or bg-or/5" : "border-ink/20"
                    }`}
                  >
                    <span className="font-sans text-[13px] font-medium">{m.label}</span>
                    <span className="mt-0.5 font-sans text-[11px] text-ink/50">{m.hint}</span>
                  </button>
                ))}
              </div>
              {pay === "blik" && (
                <input
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="• • •  • • •"
                  className="mt-4 w-40 border-b border-ink/25 bg-transparent py-2.5 text-center font-sans text-2xl tracking-[0.3em] focus:border-or focus:outline-none"
                />
              )}
            </fieldset>

            <div>
              <button type="submit" className="btn-solid w-full py-5 text-[13px]">
                {t("co.pay")} · {money(grand)}
              </button>
              <p className="mt-4 flex items-center justify-center gap-2 font-sans text-[11px] uppercase tracking-wide2 text-ink/50">
                <span className="text-or">⌾</span> {t("co.secure")}
              </p>
            </div>
          </form>
        </div>

        {/* Summary */}
        <aside className="border-t border-ink/10 bg-paper2 px-6 py-12 lg:border-l lg:border-t-0 lg:px-10 lg:pt-32">
          <p className="eyebrow">{t("co.summary")}</p>
          <ul className="mt-6 space-y-5">
            {cart.map((line) => {
              const p = getProduct(line.slug);
              if (!p) return null;
              return (
                <li key={line.slug} className="flex gap-4">
                  <div className="relative h-20 w-16 flex-none overflow-hidden rounded-sm bg-nuit">
                    <ProductVisual slug={p.slug} className="h-full w-full" />
                    <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-nuit text-[11px] text-ivoire">
                      {line.qty}
                    </span>
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <div>
                      <p className="font-serif text-[16px] leading-tight">{p.name}</p>
                      <p className="font-sans text-[11px] text-ink/55">{p.weight}</p>
                    </div>
                    <span className="font-serif">{money(p.price * line.qty)}</span>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 space-y-2 border-t border-ink/15 pt-6 font-sans text-[13px]">
            <div className="flex justify-between text-ink/60">
              <span>{t("bag.subtotal")}</span>
              <span>{money(subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink/60">
              <span>{t("bag.shipping")}</span>
              <span>{shippingCost === 0 ? t("bag.free") : money(shippingCost)}</span>
            </div>
            <div className="flex justify-between pt-2 font-serif text-2xl text-ink">
              <span>{t("bag.total")}</span>
              <span>{money(grand)}</span>
            </div>
          </div>

          <div className="mt-8 space-y-3 font-sans text-[12px] text-ink/60">
            <p className="flex items-center gap-2"><span className="text-or">✦</span> {t("bag.giftwrap")}</p>
            <p className="flex items-center gap-2"><span className="text-or">✦</span> {t("pdp.delivery.v")}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
