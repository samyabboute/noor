import { requirePageUser } from "@/server/auth";
import { isDemoMode } from "@/server/config";
import { WorkspaceShell } from "@/components/shell/workspace-shell";

export const dynamic = "force-dynamic";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser("monitoring");
  return (
    <WorkspaceShell user={user} demo={isDemoMode()}>
      {children}
    </WorkspaceShell>
  );
}
