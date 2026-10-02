import type { Metadata } from "next";
import { requirePageUser } from "@/server/auth";
import { analytics } from "@/server/analytics";
import { ReportsView } from "@/components/insights/reports-view";

export const metadata: Metadata = { title: "Reports" };
export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  await requirePageUser("management");
  return <ReportsView week={analytics({ range: 7 })} month={analytics({ range: 30 })} quarter={analytics({ range: 90 })} />;
}
