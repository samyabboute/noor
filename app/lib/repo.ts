import "server-only";
import { prisma, dbEnabled } from "./prisma";
import { shopProducts } from "./products";

/**
 * Server-side data layer for the admin console and order persistence.
 * Reads from Postgres when configured; otherwise returns clearly-labelled
 * sample data so the console previews fully without a database.
 */

export type AdminOrder = {
  id: string;
  customer: string;
  city: string;
  items: number;
  total: number;
  status: string;
  date: string;
};

export type AdminCustomer = { name: string; email: string; orders: number; spent: number; tier: string };
export type AdminProduct = { slug: string; name: string; variety: string; price: number; stock: number; active: boolean };

const sampleRevenue = [4200, 5100, 4800, 6300, 7100, 6900, 8400, 9200, 8800, 10400, 11800, 12600];

const sampleOrders: AdminOrder[] = [
  { id: "NOOR-2418", customer: "Katarzyna W.", city: "Warszawa", items: 2, total: 408, status: "paid", date: "16.08" },
  { id: "NOOR-2417", customer: "Michał R.", city: "Kraków", items: 1, total: 139, status: "shipped", date: "16.08" },
  { id: "NOOR-2416", customer: "Anna L.", city: "Wrocław", items: 3, total: 547, status: "paid", date: "15.08" },
  { id: "NOOR-2415", customer: "Piotr N.", city: "Gdańsk", items: 1, total: 289, status: "fulfilled", date: "15.08" },
  { id: "NOOR-2414", customer: "Zofia K.", city: "Poznań", items: 4, total: 636, status: "refunded", date: "14.08" },
  { id: "NOOR-2413", customer: "Tomasz B.", city: "Łódź", items: 2, total: 258, status: "paid", date: "14.08" },
];

const sampleCustomers: AdminCustomer[] = [
  { name: "Katarzyna W.", email: "k.w@—", orders: 7, spent: 2140, tier: "VIP" },
  { name: "Anna L.", email: "a.l@—", orders: 5, spent: 1490, tier: "VIP" },
  { name: "Michał R.", email: "m.r@—", orders: 3, spent: 690, tier: "—" },
  { name: "Piotr N.", email: "p.n@—", orders: 2, spent: 520, tier: "—" },
];

const sampleStock = [7, 24, 41, 63, 18];

function fallbackProducts(): AdminProduct[] {
  return shopProducts.map((p, i) => ({
    slug: p.slug,
    name: p.name,
    variety: p.variety.pl,
    price: p.price,
    stock: sampleStock[i % sampleStock.length],
    active: true,
  }));
}

export interface AdminData {
  live: boolean;
  revenue: number[];
  kpis: { revenue: number; orders: number; aov: number; conversion: string };
  orders: AdminOrder[];
  customers: AdminCustomer[];
  products: AdminProduct[];
}

export async function getAdminData(): Promise<AdminData> {
  if (!dbEnabled || !prisma) {
    return {
      live: false,
      revenue: sampleRevenue,
      kpis: { revenue: sampleRevenue.reduce((a, b) => a + b, 0), orders: 2418, aov: 214, conversion: "2,9%" },
      orders: sampleOrders,
      customers: sampleCustomers,
      products: fallbackProducts(),
    };
  }

  // ── Live: read from Postgres ──
  const [orders, productRows, userCount, paidAgg] = await Promise.all([
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 25, include: { items: true } }),
    prisma.product.findMany({ include: { variants: true }, orderBy: { createdAt: "asc" } }),
    prisma.user.count(),
    prisma.order.aggregate({ _sum: { totalMinor: true }, _count: true, where: { status: { in: ["PAID", "FULFILLED", "SHIPPED", "DELIVERED"] } } }),
  ]);

  const revenue = paidAgg._sum.totalMinor ? paidAgg._sum.totalMinor / 100 : 0;
  const orderCount = paidAgg._count || 0;

  return {
    live: true,
    revenue: sampleRevenue, // replace with a monthly GROUP BY query when data accrues
    kpis: {
      revenue,
      orders: orderCount,
      aov: orderCount ? Math.round(revenue / orderCount) : 0,
      conversion: "—",
    },
    orders: orders.map((o) => ({
      id: o.number,
      customer: o.email,
      city: "",
      items: o.items.reduce((n, it) => n + it.qty, 0),
      total: o.totalMinor / 100,
      status: o.status.toLowerCase(),
      date: o.createdAt.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit" }),
    })),
    customers: [], // wire a customer aggregate query as the base grows
    products: productRows.map((p) => {
      const v = p.variants[0];
      return {
        slug: p.slug,
        name: p.name,
        variety: (p.variety as { pl?: string })?.pl ?? "",
        price: v ? v.priceMinor / 100 : 0,
        stock: p.variants.reduce((n, vv) => n + vv.stock, 0),
        active: p.active,
      };
    }),
  };
}
