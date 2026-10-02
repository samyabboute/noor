import type { Metadata } from "next";
import { requirePageUser } from "@/server/auth";
import { analytics, parseFilters } from "@/server/analytics";
import { InsightsDashboard } from "@/components/insights/insights-dashboard";

export const metadata: Metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  await requirePageUser("monitoring");
  return <InsightsDashboard data={analytics(parseFilters(searchParams))} variant="full" eyebrow="Analytics · read-only" />;
}
