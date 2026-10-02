import type { Metadata } from "next";
import { requirePageUser } from "@/server/auth";
import { repo } from "@/server/store";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Profile" };
export const dynamic = "force-dynamic";

const LANG: Record<string, string> = { en: "English", fr: "Français", de: "Deutsch", it: "Italiano", pl: "Polski" };

export default async function ProfilePage() {
  const session = await requirePageUser("agent");
  const r = repo();
  const user = r.user(session.id)!;
  const team = r.teams().find((t) => t.id === user.teamId);
  const lists = r.dls().filter((d) => d.memberIds.includes(user.id));
  const groups = r.groups().filter((g) => g.memberIds.includes(user.id));

  const rows: [string, React.ReactNode][] = [
    ["Email", user.email],
    ["Team", team ? `${team.code} — ${team.name}` : "—"],
    ["Role", user.title],
    ["Usual logout", <span key="s" className="tnum">{user.shiftEnd}</span>],
    ["Language", `${LANG[user.language]} · confirmations are written in this language`],
    ["Distribution lists", <span key="d" className="flex flex-wrap gap-1.5">{lists.map((l) => <Badge key={l.id}>{l.name}</Badge>)}</span>],
    ["Groups", groups.length ? <span key="g" className="flex flex-wrap gap-1.5">{groups.map((g) => <Badge key={g.id}>{g.name}</Badge>)}</span> : "—"],
  ];

  return (
    <div className="mx-auto max-w-[1120px] px-4 pt-8 sm:px-8 sm:pt-14">
      <p className="eyebrow">Profile</p>
      <div className="mt-6 flex items-center gap-5">
        <Avatar name={user.name} size={72} />
        <div>
          <h1 className="text-display-md font-semibold">{user.name}</h1>
          <p className="mt-2 text-ink-500">
            You are currently assigned to <span className="font-medium text-ink-900">{team?.code}</span>.
          </p>
        </div>
      </div>

      <section className="surface mt-10" aria-label="Your details">
        <dl className="divide-y divide-ink-900/[0.06]">
          {rows.map(([k, v]) => (
            <div key={k} className="grid gap-1 px-5 py-4 sm:grid-cols-[200px_1fr] sm:px-7">
              <dt className="text-[13px] text-ink-400">{k}</dt>
              <dd className="text-[15px] text-ink-900">{v}</dd>
            </div>
          ))}
        </dl>
      </section>
      <p className="mt-4 text-[13px] text-ink-400">Your details come from the company directory. Ask your team lead if something looks wrong.</p>

      <section className="mt-10 rounded-2xl border border-dashed border-ink-900/10 p-6">
        <p className="eyebrow">Coming next</p>
        <p className="mt-2 text-[15px] text-ink-600">Availability preferences — tell Monitoring which evenings usually work for you, so you only get asked when it suits.</p>
      </section>
    </div>
  );
}
