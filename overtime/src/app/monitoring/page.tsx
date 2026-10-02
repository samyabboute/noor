import type { Metadata } from "next";
import { requirePageUser } from "@/server/auth";
import { monitoringOverview } from "@/server/views";
import { ControlCenter } from "@/components/monitoring/control-center";

export const metadata: Metadata = { title: "Control center" };
export const dynamic = "force-dynamic";

export default async function MonitoringPage() {
  const user = await requirePageUser("monitoring");
  return <ControlCenter data={monitoringOverview()} firstName={user.name.split(" ")[0]} />;
}
