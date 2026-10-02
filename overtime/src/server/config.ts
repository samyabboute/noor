/**
 * Runtime mode. Three modes, never mixed:
 *  - DEMO  — persona sign-in, seeded sample data, simulated responses. Badged "Demo" in the UI.
 *  - CODE  — no SSO needed: one access code per role, then your name and a personal PIN.
 *            Real data (DLs imported by Monitoring). The default once access codes are set.
 *  - ENTRA — Microsoft Entra ID single sign-on, when the organisation provides an app registration.
 */
export type AuthMode = "demo" | "code" | "entra";

const entraConfigured = () => Boolean(process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET && process.env.AZURE_AD_TENANT_ID);
const codesConfigured = () => Boolean(process.env.ACCESS_CODE_AGENT && process.env.ACCESS_CODE_MONITORING);

export function authMode(): AuthMode {
  const explicit = process.env.AUTH_MODE;
  if (explicit === "demo" || explicit === "entra" || explicit === "code") return explicit;
  if (entraConfigured()) return "entra";
  if (codesConfigured()) return "code";
  return "demo";
}

export const isDemoMode = () => authMode() === "demo";

export function sessionSecret() {
  const s = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (s) return s;
  if (authMode() !== "demo") throw new Error("AUTH_SECRET must be set outside demo mode.");
  // Demo only: a fixed development secret. Demo sessions grant access to demo data, nothing else.
  return "overtime-demo-only-secret-change-me";
}

/** Access codes per role (CODE mode). Management is optional. */
export function accessCodes() {
  return {
    agent: process.env.ACCESS_CODE_AGENT || "",
    monitoring: process.env.ACCESS_CODE_MONITORING || "",
    management: process.env.ACCESS_CODE_MANAGEMENT || "",
  };
}

export const defaultAgentLanguage = () => {
  const l = process.env.DEFAULT_AGENT_LANGUAGE;
  return l === "en" || l === "de" || l === "it" || l === "pl" ? l : "fr";
};
