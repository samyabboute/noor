import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma, dbEnabled } from "./prisma";

/**
 * Auth.js (NextAuth) configuration.
 * - "Continue with Google" activates the moment GOOGLE_CLIENT_ID / SECRET are
 *   set (no database required — JWT sessions). Add the Prisma adapter later to
 *   persist users & order history (see SYSTEM.md).
 * - Admins are promoted by email via ADMIN_EMAILS.
 */
const adminEmails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

const providers: NextAuthOptions["providers"] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  // Persist users/accounts when a database is connected; JWT sessions either way.
  adapter: dbEnabled && prisma ? PrismaAdapter(prisma) : undefined,
  // A real secret must be set in production (AUTH_SECRET). The fallback only
  // keeps the un-configured preview from crashing before keys are added.
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "noor-preview-insecure-secret-set-AUTH_SECRET-in-production",
  session: { strategy: "jwt" },
  pages: { signIn: "/konto" },
  callbacks: {
    async jwt({ token }) {
      const email = (token.email || "").toLowerCase();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (token as any).role = email && adminEmails.includes(email) ? "ADMIN" : (token as any).role || "CUSTOMER";
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = (token as any).role || "CUSTOMER";
      }
      return session;
    },
  },
};

export const authEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
