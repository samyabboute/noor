import type { Metadata } from "next";
import { requirePageUser } from "@/server/auth";
import { agentDirectory } from "@/server/views";
import { AgentDirectory } from "@/components/monitoring/agent-directory";

export const metadata: Metadata = { title: "Recipients" };
export const dynamic = "force-dynamic";

export default async function RecipientsPage() {
  await requirePageUser("monitoring");
  return <AgentDirectory agents={agentDirectory()} />;
}
