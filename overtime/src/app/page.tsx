import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth";
import { HOME_FOR_ROLE } from "@/lib/session-token";

export const dynamic = "force-dynamic";

export default async function Root() {
  const user = await getSessionUser();
  redirect(user ? HOME_FOR_ROLE[user.role] : "/login");
}
