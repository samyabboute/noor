/**
 * Runtime mode. Two modes, never mixed:
 *  - DEMO  — persona sign-in, seeded data, simulated responses. Clearly badged in the UI.
 *  - ENTRA — Microsoft Entra ID single sign-on; demo sign-in is disabled entirely.
 * ENTRA activates automatically once the Entra app registration is configured.
 */
export type AuthMode = "demo" | "entra";

export function authMode(): AuthMode {
  const explicit = process.env.AUTH_MODE;
  if (explicit === "demo" || explicit === "entra") return explicit;
  return process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET && process.env.AZURE_AD_TENANT_ID ? "entra" : "demo";
}

export const isDemoMode = () => authMode() === "demo";

export function sessionSecret() {
  const s = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (s) return s;
  if (authMode() === "entra") throw new Error("AUTH_SECRET must be set in Entra mode.");
  // Demo only: a fixed development secret. Demo sessions grant access to demo data, nothing else.
  return "overtime-demo-only-secret-change-me";
}
