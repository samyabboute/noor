import { requirePageUser } from "@/server/auth";
import { authMode, isDemoMode } from "@/server/config";
import { AgentShell } from "@/components/shell/agent-shell";

export const dynamic = "force-dynamic";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser("agent");
  return (
    <AgentShell user={user} demo={isDemoMode()} sso={authMode() === "entra"}>
      {children}
    </AgentShell>
  );
}
