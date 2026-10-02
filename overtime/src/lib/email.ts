/**
 * EmailService — prepares messages, never stores mailbox credentials.
 *
 * MVP: openOutlookCompose() hands a fully-prepared message to the user's own
 * mail client (desktop Outlook via mailto:, or Outlook on the web via the
 * official compose deeplink). The user presses Send — the message leaves from
 * their own mailbox, under their own identity and the organisation's policies.
 *
 * Later: sendViaGraph() posts to /api/email/graph, which will call Microsoft
 * Graph `POST /me/sendMail` with the delegated token obtained through Entra ID
 * sign-in (scope Mail.Send). No passwords are ever handled by this app.
 */

export interface EmailDraft {
  to: string[];
  cc: string[];
  bcc?: string[];
  subject: string;
  body: string;
}

export type ComposeTarget = "desktop" | "web";

/** Practical ceiling: Outlook desktop truncates mailto URLs around 2,000 chars. */
export const MAILTO_LIMIT = 2000;

const enc = (s: string) => encodeURIComponent(s);

export function buildMailto(d: EmailDraft) {
  const params: string[] = [];
  if (d.cc.length) params.push(`cc=${d.cc.map(enc).join(",")}`);
  if (d.bcc?.length) params.push(`bcc=${d.bcc.map(enc).join(",")}`);
  params.push(`subject=${enc(d.subject)}`);
  params.push(`body=${enc(d.body.replace(/\r?\n/g, "\r\n"))}`);
  return `mailto:${d.to.map(enc).join(",")}?${params.join("&")}`;
}

export function buildOutlookWebLink(d: EmailDraft) {
  const q = new URLSearchParams();
  q.set("to", d.to.join(";"));
  if (d.cc.length) q.set("cc", d.cc.join(";"));
  if (d.bcc?.length) q.set("bcc", d.bcc.join(";"));
  q.set("subject", d.subject);
  q.set("body", d.body);
  return `https://outlook.office.com/mail/deeplink/compose?${q.toString()}`;
}

export class EmailPrepareError extends Error {
  constructor(
    message: string,
    public readonly reason: "too_long" | "blocked" | "empty",
  ) {
    super(message);
  }
}

export const EmailService = {
  /** Opens the user's mail client with everything filled in. Browser only. */
  openOutlookCompose(draft: EmailDraft, target: ComposeTarget = "desktop") {
    if (!draft.to.length) throw new EmailPrepareError("No recipient for this message.", "empty");
    if (target === "web") {
      const win = window.open(buildOutlookWebLink(draft), "_blank", "noopener,noreferrer");
      if (!win) throw new EmailPrepareError("Your browser blocked the Outlook window.", "blocked");
      return;
    }
    const href = buildMailto(draft);
    if (href.length > MAILTO_LIMIT) {
      throw new EmailPrepareError("This message is too long for a desktop compose link.", "too_long");
    }
    window.location.href = href;
  },

  /** Ready for Microsoft Graph once Entra ID delegated access is granted. */
  async sendViaGraph(draft: EmailDraft) {
    const res = await fetch("/api/email/graph", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Microsoft Graph is not configured for this workspace.");
    }
    return res.json();
  },

  asPlainText(d: EmailDraft) {
    return [`To: ${d.to.join("; ")}`, d.cc.length ? `Cc: ${d.cc.join("; ")}` : "", `Subject: ${d.subject}`, "", d.body]
      .filter((l, i) => l !== "" || i === 3)
      .join("\n");
  },
};
