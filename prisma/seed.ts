import { PrismaClient } from "@prisma/client";
import { products } from "../app/lib/products";

/**
 * Imports the catalogue (app/lib/products.ts) into Postgres.
 * Run: npx prisma db seed   (after `prisma migrate deploy`).
 * Idempotent — upserts by slug.
 */
const prisma = new PrismaClient();

async function main() {
  for (const p of products) {
    if (p.tier === "corporate") continue; // quote-based, not a stocked SKU
    const priceMinor = Math.round(p.price * 100);
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        tier: p.tier,
        tagline: p.tagline,
        variety: p.variety,
        origin: p.origin,
        accent: p.accent,
      },
      create: {
        slug: p.slug,
        name: p.name,
        tier: p.tier,
        tagline: p.tagline,
        variety: p.variety,
        origin: p.origin,
        accent: p.accent,
        variants: {
          create: [
            {
              sku: `${p.slug}-std`,
              label: p.weight,
              priceMinor,
              stock: 50,
            },
          ],
        },
      },
    });
    console.log(`✓ ${p.name}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
