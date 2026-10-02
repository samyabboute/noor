import type { Metadata } from "next";
import { requirePageUser } from "@/server/auth";
import { agentHome } from "@/server/views";
import { formatDateShort, formatDuration } from "@/lib/time";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "My overtime" };
export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const user = await requirePageUser("agent");
  const { history, stats } = agentHome(user.id);
  const rate = stats.asked ? Math.round((stats.confirmed / stats.asked) * 100) : 0;

  return (
    <div className="mx-auto max-w-[1120px] px-4 pt-8 sm:px-8 sm:pt-14">
      <p className="eyebrow">My overtime</p>
      <h1 className="mt-4 max-w-3xl text-display-lg font-semibold">
        {stats.minutes > 0 ? (
          <>
            You’ve added <span className="tnum">{formatDuration(stats.minutes)}</span> of coverage.
          </>
        ) : (
          "Your overtime, in one place."
        )}
      </h1>
      <p className="mt-4 text-lg text-ink-500">Every request you received, and how you answered. Nothing to manage here.</p>

      <dl className="mt-12 grid grid-cols-3 gap-px overflow-hidden rounded-2xl bg-ink-900/[0.07] ring-1 ring-ink-900/[0.07]">
        {[
          ["Requests received", String(stats.asked)],
          ["Times you said yes", String(stats.confirmed)],
          ["Yes rate", `${rate}%`],
        ].map(([k, v]) => (
          <div key={k} className="bg-white p-5 sm:p-7">
            <dt className="eyebrow">{k}</dt>
            <dd className="tnum mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{v}</dd>
          </div>
        ))}
      </dl>

      <section className="surface mt-6 overflow-hidden" aria-labelledby="history-title">
        <h2 id="history-title" className="sr-only">
          Request history
        </h2>
        {history.length === 0 ? (
          <EmptyState art="inbox" title="No overtime requests yet." description="When Monitoring asks for extra coverage, your requests and answers will collect here." action={<Button href="/agent" variant="secondary">Back to home</Button>} />
        ) : (
          <ul className="divide-y divide-ink-900/[0.06]">
            {history.map((h) => (
              <li key={h.requestId} className="flex items-center gap-4 px-5 py-4 sm:px-7">
                <div className="w-14 shrink-0 text-center">
                  <p className="text-[11px] font-medium uppercase tracking-eyebrow text-ink-400">{formatDateShort(h.date).split(" ")[1]}</p>
                  <p className="tnum text-2xl font-semibold tracking-[-0.03em]">{formatDateShort(h.date).split(" ")[0]}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium">{h.title}</p>
                  <p className="mt-0.5 truncate text-[13px] text-ink-400">
                    <span className="tnum">
                      {h.startTime} → {h.logout || "—"}
                    </span>{" "}
                    · from {h.ownerName}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <StatusBadge status={h.status} />
                  {h.status === "confirmed" && <span className="tnum text-[13px] font-medium text-ink-700">+{h.minutes} min</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
