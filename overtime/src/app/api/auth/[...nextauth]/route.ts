import NextAuth from "next-auth";
import { authOptions } from "@/server/nextauth";

// Microsoft Entra ID sign-in (production mode). Inert until AZURE_AD_* is configured.
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
