import type { Metadata } from "next";
import { requirePageUser } from "@/server/auth";
import { analytics } from "@/server/analytics";
import { repo } from "@/server/store";
import { formatDuration, formatSeconds } from "@/lib/time";
import { SectionTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { HBarList } from "@/components/ui/charts";

export const metadata: Metadata = { title: "Teams" };
export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  await requirePageUser("management");
  const a = await analytics({ range: 30 });
  const r = await repo();
  return (
    <div>
      <SectionTitle eyebrow="Teams · last 30 days" title="How each team shows up." description="Aggregate response by team. Individual contact details stay with Monitoring." />
      <div className="mt-10 grid gap-3 lg:grid-cols-3">
        {a.byTeam.map((t) => {
          const headcount = r.users().filter((u) => u.role === "agent" && u.teamId === t.id && u.active).length;
          const top = a.participation.filter((p) => p.teamCode === t.code).slice(0, 4);
          return (
            <section key={t.id} className="surface flex flex-col p-6" aria-labelledby={`team-${t.id}`}>
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink-900 text-[12px] font-semibold text-white">{t.code}</span>
                <div>
                  <h2 id={`team-${t.id}`} className="text-[17px] font-semibold tracking-[-0.015em]">{t.name}</h2>
                  <p className="text-[13px] text-ink-400">{headcount} active agents</p>
                </div>
              </div>
              <p className="tnum mt-8 text-[3rem] font-semibold leading-none tracking-[-0.05em]">{Math.round(t.rate * 100)}%</p>
              <p className="mt-2 text-sm text-ink-500">confirmation rate</p>
              <ProgressBar value={t.rate} tone="covered" className="mt-4" label={`${t.code} confirmation rate`} />
              <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-ink-900/[0.06] pt-5">
                {[
                  ["Reached", String(t.recipients)],
                  ["Extra time", t.minutes ? `+${formatDuration(t.minutes)}` : "—"],
                  ["Avg reply", t.avgResponseSec ? formatSeconds(t.avgResponseSec) : "—"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="eyebrow">{k}</dt>
                    <dd className="tnum mt-1.5 text-[15px] font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
              {top.length > 0 && (
                <div className="mt-6 border-t border-ink-900/[0.06] pt-5">
                  <p className="mb-4 text-[13px] font-medium text-ink-700">Most extra time</p>
                  <HBarList format={(n) => `+${formatDuration(n)}`} data={top.map((p) => ({ id: p.id, label: p.name, value: p.minutes }))} />
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
