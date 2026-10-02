import type { Metadata } from "next";
import { requirePageUser } from "@/server/auth";
import { agentHome, ORG_NAME } from "@/server/views";
import { greeting, todayISO } from "@/lib/time";
import { AgentHome } from "@/components/agent/agent-home";

export const metadata: Metadata = { title: "Home" };
export const dynamic = "force-dynamic";

export default async function AgentPage() {
  const user = await requirePageUser("agent");
  const home = await agentHome(user.id);
  return (
    <AgentHome
      firstName={user.name.split(" ")[0]}
      greeting={greeting()}
      today={todayISO()}
      orgName={ORG_NAME}
      offers={home.offers}
      stats={home.stats}
    />
  );
}
