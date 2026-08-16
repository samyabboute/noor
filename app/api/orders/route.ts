import { NextResponse } from "next/server";
import { prisma, dbEnabled } from "../../lib/prisma";
import { getProduct, SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from "../../lib/products";

export const dynamic = "force-dynamic";

interface Body {
  email?: string;
  phone?: string;
  items?: { slug: string; qty: number }[];
  shipMethod?: string;
  giftMessage?: string;
  currency?: string;
}

/**
 * Creates an order. Totals are recomputed server-side from the catalogue
 * (never trusts client prices). Persists to Postgres when configured;
 * otherwise returns a demo order number so the flow completes.
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const items = (body.items || []).filter((i) => i && getProduct(i.slug) && i.qty > 0);
  if (items.length === 0) return NextResponse.json({ error: "empty_cart" }, { status: 400 });

  let subtotalMinor = 0;
  const lineItems = items.map((i) => {
    const p = getProduct(i.slug)!;
    const priceMinor = Math.round(p.price * 100);
    subtotalMinor += priceMinor * i.qty;
    return { productSlug: p.slug, name: p.name, qty: i.qty, priceMinor };
  });

  const shippingMinor = subtotalMinor >= FREE_SHIPPING_THRESHOLD * 100 ? 0 : SHIPPING_COST * 100;
  const totalMinor = subtotalMinor + shippingMinor;
  const number = `NOOR-${Date.now().toString().slice(-6)}`;

  if (!dbEnabled || !prisma) {
    // Preview: no DB — acknowledge without persisting.
    return NextResponse.json({ number, persisted: false, totalMinor });
  }

  try {
    const order = await prisma.order.create({
      data: {
        number,
        email: body.email || "",
        phone: body.phone,
        status: "PENDING",
        currency: body.currency || "PLN",
        subtotalMinor,
        shippingMinor,
        totalMinor,
        shipMethod: body.shipMethod,
        giftMessage: body.giftMessage,
        items: {
          create: lineItems.map((l) => ({ name: l.name, sku: l.productSlug, qty: l.qty, priceMinor: l.priceMinor })),
        },
      },
      select: { number: true },
    });
    return NextResponse.json({ number: order.number, persisted: true, totalMinor });
  } catch (e) {
    // Never block the customer on a DB hiccup — the payment step is source of truth.
    return NextResponse.json({ number, persisted: false, totalMinor });
  }
}
