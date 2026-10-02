import "server-only";
import type { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import type { Role } from "@/lib/types";

/**
 * Microsoft Entra ID (Azure AD) single sign-on — PRODUCTION mode.
 *
 * Roles come from Entra security groups (emitted in the `groups` claim):
 *   ENTRA_GROUP_MONITORING  → monitoring
 *   ENTRA_GROUP_MANAGEMENT  → management
 *   anyone else in the tenant → agent
 * No passwords ever reach this application. Mail.Send is requested so that
 * EmailService.sendViaGraph() can later send from the user's own mailbox.
 */
function roleFromGroups(groups: string[] | undefined): Role {
  const g = new Set(groups || []);
  if (process.env.ENTRA_GROUP_MANAGEMENT && g.has(process.env.ENTRA_GROUP_MANAGEMENT)) return "management";
  if (process.env.ENTRA_GROUP_MONITORING && g.has(process.env.ENTRA_GROUP_MONITORING)) return "monitoring";
  return "agent";
}

export const authOptions: NextAuthOptions = {
  providers:
    process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET && process.env.AZURE_AD_TENANT_ID
      ? [
          AzureADProvider({
            clientId: process.env.AZURE_AD_CLIENT_ID,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
            tenantId: process.env.AZURE_AD_TENANT_ID,
            authorization: { params: { scope: "openid profile email offline_access User.Read Mail.Send" } },
          }),
        ]
      : [],
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        const p = profile as { groups?: string[]; oid?: string };
        (token as Record<string, unknown>).role = roleFromGroups(p.groups);
        (token as Record<string, unknown>).oid = p.oid;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as Record<string, unknown>).role = (token as Record<string, unknown>).role;
      return session;
    },
  },
};
