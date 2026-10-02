import type { Metadata } from "next";
import { Suspense } from "react";
import { authMode } from "@/server/config";
import { repo } from "@/server/store";
import { LoginView } from "@/components/auth/login-view";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const mode = authMode();
  const r = await repo();
  const agents = mode === "demo" ? r.users().filter((u) => u.role === "agent" && u.active).map((u) => ({ id: u.id, name: u.name, team: (u.teamId || "").toUpperCase() })) : [];
  const personas =
    mode === "demo"
      ? [
          { id: "u-samy", role: "agent" as const, name: "Samy Abboute", detail: "Agent · RBC", blurb: "See today’s request and answer in one click." },
          { id: "u-mon-bartlomiej", role: "monitoring" as const, name: "Bartłomiej Wyżycki", detail: "Real-Time Monitoring", blurb: "Launch a request and watch coverage fill." },
          { id: "u-mgmt-claire", role: "management" as const, name: "Claire Dubois", detail: "Head of Customer Care", blurb: "Read coverage and response trends." },
        ]
      : [];
  return (
    <Suspense>
      <LoginView mode={mode} personas={personas} agents={agents} />
    </Suspense>
  );
}
