import { PrismaClient } from "@prisma/client";

/**
 * A single Prisma client, created only when DATABASE_URL is present.
 * When it's absent (preview / not yet provisioned) `prisma` is null and the
 * data layer falls back to sample data — the app never crashes for lack of a DB.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const dbEnabled = Boolean(process.env.DATABASE_URL);

export const prisma: PrismaClient | null = dbEnabled
  ? globalForPrisma.prisma ?? (globalForPrisma.prisma = new PrismaClient())
  : null;

if (process.env.NODE_ENV !== "production" && prisma) globalForPrisma.prisma = prisma;
