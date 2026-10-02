import type { Metadata } from "next";
import { requirePageUser } from "@/server/auth";
import { analytics } from "@/server/analytics";
import { ReportsView } from "@/components/insights/reports-view";

export const metadata: Metadata = { title: "Reports" };
export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  await requirePageUser("management");
  return <ReportsView week={await analytics({ range: 7 })} month={await analytics({ range: 30 })} quarter={await analytics({ range: 90 })} />;
}
