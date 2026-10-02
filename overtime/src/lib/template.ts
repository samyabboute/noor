import type { EmailTemplate, OvertimeRequest, Team, User } from "./types";
import { addMinutes, formatDateLong, formatDuration } from "./time";

export const TEMPLATE_VARIABLES = [
  { key: "agent_name", label: "Agent name" },
  { key: "team", label: "Team" },
  { key: "date", label: "Date" },
  { key: "start_time", label: "Start time" },
  { key: "end_time", label: "End time" },
  { key: "duration", label: "Duration" },
  { key: "request_owner", label: "Request owner" },
  { key: "request_id", label: "Request ID" },
] as const;

export type TemplateVars = Partial<Record<(typeof TEMPLATE_VARIABLES)[number]["key"], string>>;

/** Replaces {{variables}}; unknown variables are left visible so mistakes are obvious. */
export function renderTemplate(text: string, vars: TemplateVars) {
  return text.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (match, key: string) => {
    const v = vars[key as keyof TemplateVars];
    return v === undefined || v === "" ? match : v;
  });
}

export function requestVars(
  req: Pick<OvertimeRequest, "id" | "date" | "startTime" | "durationMin">,
  owner: Pick<User, "name"> | undefined,
  extra: { agent?: Pick<User, "name">; team?: Pick<Team, "code">; minutes?: number } = {},
): TemplateVars {
  const minutes = extra.minutes ?? req.durationMin;
  return {
    agent_name: extra.agent?.name,
    team: extra.team?.code,
    date: formatDateLong(req.date),
    start_time: req.startTime,
    end_time: addMinutes(req.startTime, minutes),
    duration: `+${formatDuration(minutes)}`,
    request_owner: owner?.name,
    request_id: req.id,
  };
}

export function pickTemplate(templates: EmailTemplate[], kind: EmailTemplate["kind"], language: string, preferredId?: string) {
  const ofKind = templates.filter((t) => t.kind === kind);
  const preferred = ofKind.find((t) => t.id === preferredId);
  // A preferred confirmation template is honoured in the agent's language when a sibling exists.
  if (preferred && preferred.language === language) return preferred;
  return (
    ofKind.find((t) => t.language === language && t.isDefault) ||
    preferred ||
    ofKind.find((t) => t.isDefault) ||
    ofKind[0]
  );
}
