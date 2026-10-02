/**
 * Reads distribution-list members exactly as Outlook / Exchange copies them:
 *
 *   "Dupont Marie, SCS-B2C-CUC-OTM-2-OTM-RSM-KRA (EXT)" <Marie.Dupont@example.com>; …
 *
 * Also accepts `Name <email>` and bare addresses, one per line or separated by ; or ,.
 * Pure and dependency-free: runs in the browser (preview) and on the server (import).
 */

export interface ImportedPerson {
  name: string; // "Samy Abboute" (first name first)
  email: string; // lower-cased
  orgUnit: string; // "SCS-B2C-CUC-OTM-2-OTM-RSM-KRA (EXT)"
  teamCode: string | null; // "RSM"
  site: string | null; // "KRA" (Kraków), "OPO" (Porto), "SOF" (Sofia)…
}

const EMAIL = /[A-Za-z0-9._%+'-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;

const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L")
    .toLowerCase()
    .replace(/[^a-z]/g, "");

/** "Dupont Marie" + Marie.Dupont@… → "Marie Dupont". Multi-word names are matched against the address. */
export function displayName(directoryName: string, email: string) {
  const tokens = directoryName.trim().split(/\s+/).filter(Boolean);
  const first = fold(email.split("@")[0].split(".")[0] || "");
  if (tokens.length > 1 && first) {
    // Find the run of trailing or leading tokens whose letters spell the first name.
    for (let n = 1; n < tokens.length; n++) {
      const tail = tokens.slice(-n);
      if (fold(tail.join("")) === first) return [...tail, ...tokens.slice(0, -n)].join(" ");
      const head = tokens.slice(0, n);
      if (fold(head.join("")) === first) return tokens.join(" ");
    }
    // Directory convention is "Last First": move the last token to the front.
    return [tokens[tokens.length - 1], ...tokens.slice(0, -1)].join(" ");
  }
  if (tokens.length) return tokens.join(" ");
  // No name at all: build one from the address.
  return email
    .split("@")[0]
    .split(/[._-]/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(" ");
}

/** SCS-B2C-CUC-OTM-2-RBC-MUF-KRA (EXT) → { team: "RBC", site: "KRA" } */
export function teamFromOrgUnit(orgUnit: string): { teamCode: string | null; site: string | null } {
  const ou = orgUnit.replace(/\(.*?\)/g, "").trim().toUpperCase();
  const after = ou.includes("OTM-2-") ? ou.split("OTM-2-")[1] : "";
  const parts = after.split("-").filter(Boolean);
  if (parts[0] === "OTM") parts.shift();
  if (!parts.length) return { teamCode: null, site: null };
  return { teamCode: parts[0], site: parts.length > 1 ? parts[parts.length - 1] : null };
}

/** Nested Exchange groups (group.…@) are lists, not people. */
export const isGroupAddress = (email: string) => /^group[._-]/i.test(email.trim());

export function parseDirectory(text: string): { people: ImportedPerson[]; skipped: string[] } {
  const skipped = new Set<string>();
  const people = parseDirectoryText(text, (e) => skipped.add(e));
  return { people, skipped: [...skipped] };
}

export function parseDirectoryText(text: string, onSkip?: (email: string) => void): ImportedPerson[] {
  const out = new Map<string, ImportedPerson>();
  const add = (rawName: string, rawEmail: string) => {
    const email = rawEmail.trim().toLowerCase();
    if (!EMAIL.test(email) || out.has(email)) return;
    if (isGroupAddress(email)) return onSkip?.(email);
    const [namePart, ...rest] = rawName.split(",");
    const orgUnit = rest.join(",").trim();
    const { teamCode, site } = teamFromOrgUnit(orgUnit);
    out.set(email, { name: displayName(namePart.replace(/["']/g, "").trim(), email), email, orgUnit, teamCode, site });
  };

  const quoted = /"([^"]*)"\s*<([^>]+)>/g;
  let m: RegExpExecArray | null;
  let rest = text;
  while ((m = quoted.exec(text))) add(m[1], m[2]);
  rest = text.replace(quoted, " ");

  const angled = /([^;,<>\n"]*)<([^>]+)>/g;
  while ((m = angled.exec(rest))) add(m[1], m[2]);
  rest = rest.replace(angled, " ");

  for (const token of rest.split(/[;,\s]+/)) {
    const e = token.match(EMAIL);
    if (e) add("", e[0]);
  }
  return [...out.values()];
}

/** "DL RBC KRK" → "RBC" when the list is named after a team. */
export function teamFromListName(name: string) {
  const m = name.toUpperCase().match(/^DL\s+([A-Z0-9]+)/);
  return m ? m[1] : null;
}
