/**
 * Overtime domain model.
 * Mirrors supabase/migrations/0001_init.sql one-to-one so the demo store and
 * a production Postgres/Supabase repository are interchangeable.
 */

export type Role = "agent" | "monitoring" | "management";
export type Language = "en" | "fr" | "de" | "it" | "pl";
/** Team ids are lowercase team codes (rbc, rsm, bm, ovh…), derived from the org unit on import. */
export type TeamId = string;

export interface Team {
  id: TeamId;
  code: string; // "RBC"
  name: string; // "Residential Billing & Care"
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  teamId: TeamId | null; // agents belong to a team; monitoring/management may not
  language: Language;
  active: boolean;
  title: string;
  /** Regular end of shift, HH:mm — used to suggest the coverage start time. */
  shiftEnd: string;
  /** Access-code mode: scrypt hash of the personal PIN chosen at first sign-in. Never sent to clients. */
  pinHash?: string | null;
  pinFailures?: number;
  pinLockedUntil?: string | null;
  /** Org unit as written in the Exchange directory, e.g. SCS-B2C-CUC-OTM-2-OTM-RSM-KRA (EXT). */
  orgUnit?: string;
}

export interface DistributionList {
  id: string;
  name: string; // "DL RBC KRK"
  address: string; // the DL mailbox ("" when unknown — announcements then BCC each agent)
  teamId: TeamId | null; // the team the list is named after, when there is one
  memberIds: string[];
}

export interface CustomGroup {
  id: string;
  name: string;
  memberIds: string[];
  createdBy: string;
  createdAt: string;
}

export type TemplateKind = "request" | "confirmation";

export interface EmailTemplate {
  id: string;
  name: string;
  kind: TemplateKind;
  language: Language;
  subject: string;
  body: string;
  isDefault: boolean;
  updatedAt: string;
  updatedBy: string;
}

/** Where a recipient came from — Monitoring keeps granular control per agent. */
export type RecipientSource =
  | { type: "dl"; id: string }
  | { type: "group"; id: string }
  | { type: "individual" };

export type RequestStatus = "draft" | "live" | "completed" | "cancelled";
export type RecipientStatus = "sent" | "opened" | "confirmed" | "declined" | "expired";

export interface OvertimeRequest {
  id: string; // "OT-1042"
  title: string;
  createdBy: string;
  createdAt: string; // ISO
  sentAt: string | null; // ISO
  closedAt: string | null; // ISO
  date: string; // YYYY-MM-DD (Europe/Warsaw)
  startTime: string; // HH:mm — coverage starts (usual logout)
  durationMin: number; // requested extra minutes
  flexible: boolean; // agents may pick 15/30/45/60
  target: number; // agents needed to cover the peak
  status: RequestStatus;
  subject: string;
  body: string;
  confirmationTemplateId: string;
  ccIds: string[]; // monitoring team in CC of the confirmation
  sources: { dlIds: string[]; groupIds: string[] };
}

export interface OvertimeRecipient {
  id: string;
  requestId: string;
  userId: string;
  source: RecipientSource;
  status: RecipientStatus;
  addedAt: string;
  openedAt: string | null;
  respondedAt: string | null;
  minutes: number | null; // confirmed extra minutes
  emailPreparedAt: string | null;
}

export type AuditAction =
  | "REQUEST_CREATED"
  | "REQUEST_DRAFTED"
  | "REQUEST_SENT"
  | "REQUEST_UPDATED"
  | "REQUEST_COMPLETED"
  | "REQUEST_CANCELLED"
  | "RECIPIENT_ADDED"
  | "RECIPIENT_REMOVED"
  | "REQUEST_VIEWED"
  | "AGENT_CONFIRMED"
  | "AGENT_DECLINED"
  | "RESPONSE_WITHDRAWN"
  | "EMAIL_OPENED"
  | "TEMPLATE_UPDATED"
  | "GROUP_CREATED"
  | "GROUP_DELETED"
  | "LIST_IMPORTED"
  | "LIST_DELETED"
  | "PERSON_ADDED"
  | "PERSON_REMOVED"
  | "PIN_RESET"
  | "SIGNED_IN";

export interface AuditLog {
  id: string;
  at: string;
  actorId: string;
  action: AuditAction;
  requestId?: string;
  targetUserId?: string;
  meta?: Record<string, string | number | boolean | null>;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  teamId: TeamId | null;
  language: Language;
}
