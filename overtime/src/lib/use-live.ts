"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Keeps a server-rendered page live by re-fetching it on an interval while the
 * tab is visible. Swap for Supabase Realtime / SSE later without touching pages.
 */
export function useLiveRefresh(ms: number, enabled = true) {
  const router = useRouter();
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  useEffect(() => {
    setUpdatedAt(Date.now());
    if (!enabled) return;
    const t = setInterval(() => {
      if (document.visibilityState === "visible") {
        router.refresh();
        setUpdatedAt(Date.now());
      }
    }, ms);
    return () => clearInterval(t);
  }, [ms, enabled, router]);
  return updatedAt;
}
