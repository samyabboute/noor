/**
 * Overtime domain model.
 * Mirrors supabase/migrations/0001_init.sql one-to-one so the demo store and
 * a production Postgres/Supabase repository are interchangeable.
 */

export type Role = "agent" | "monitoring" | "management";
export type Language = "en" | "fr" | "de" | "it" | "pl";
export type TeamId = "rbc" | "rsm" | "bm";

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
}

export interface DistributionList {
  id: string;
  name: string; // "DL RBC KRK"
  address: string; // the DL mailbox
  teamId: TeamId;
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
  | "GROUP_DELETED";

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
