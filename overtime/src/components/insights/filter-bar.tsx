"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { X } from "lucide-react";
import { Select } from "@/components/ui/select";
import type { Option } from "@/components/ui/select";

/** One row of filters above the charts. State lives in the URL, so views are shareable. */
export function FilterBar({ options, full }: { options: { teams: Option[]; dls: Option[]; agents: Option[]; owners: Option[] }; full?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value && value !== "all") next.set(key, value);
    else next.delete(key);
    start(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  };
  const v = (k: string) => params.get(k) || "all";
  const active = ["team", "dl", "agent", "owner", "status"].some((k) => params.get(k));

  return (
    <div className="flex flex-wrap items-center gap-2" aria-busy={pending}>
      <Select size="sm" label="Date range" value={params.get("range") || "30"} onChange={(x) => set("range", x === "30" ? "" : x)} options={[{ value: "7", label: "Last 7 days" }, { value: "30", label: "Last 30 days" }, { value: "90", label: "Last 90 days" }]} className="w-[140px]" />
      <Select size="sm" label="Team" value={v("team")} onChange={(x) => set("team", x)} options={[{ value: "all", label: "All teams" }, ...options.teams]} className="w-[120px]" />
      <Select size="sm" label="Distribution list" value={v("dl")} onChange={(x) => set("dl", x)} options={[{ value: "all", label: "All DLs" }, ...options.dls]} className="w-[140px]" />
      {full && (
        <>
          <Select size="sm" label="Agent" value={v("agent")} onChange={(x) => set("agent", x)} options={[{ value: "all", label: "All agents" }, ...options.agents]} className="w-[160px]" />
          <Select size="sm" label="Request owner" value={v("owner")} onChange={(x) => set("owner", x)} options={[{ value: "all", label: "All owners" }, ...options.owners]} className="w-[170px]" />
          <Select
            size="sm"
            label="Status"
            value={v("status")}
            onChange={(x) => set("status", x)}
            options={[{ value: "all", label: "Any status" }, { value: "confirmed", label: "Confirmed" }, { value: "declined", label: "Declined" }, { value: "expired", label: "No reply" }]}
            className="w-[130px]"
          />
        </>
      )}
      {active && (
        <button onClick={() => start(() => router.replace(params.get("range") ? `${pathname}?range=${params.get("range")}` : pathname, { scroll: false }))} className="inline-flex h-9 items-center gap-1 rounded-lg px-2.5 text-[13px] font-medium text-ink-500 hover:bg-ink-900/5 hover:text-ink-900">
          <X size={14} /> Clear
        </button>
      )}
      {pending && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-400" aria-label="Updating" />}
    </div>
  );
}
