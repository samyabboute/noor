import AdminConsole from "../components/AdminConsole";
import { getAdminData } from "../lib/repo";

// Always render fresh server data (orders/stock change).
export const dynamic = "force-dynamic";

/**
 * Maison Noor — Admin console (server). Reads live data from Postgres when
 * DATABASE_URL is set, otherwise serves sample data (clearly labelled).
 * Access is gated to ADMINs by middleware.ts once auth is configured.
 */
export default async function AdminPage() {
  const data = await getAdminData();
  return <AdminConsole data={data} />;
}
