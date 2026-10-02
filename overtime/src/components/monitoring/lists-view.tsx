"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Mail, Plus, RefreshCw, Trash2, Upload, UserPlus, Users, X } from "lucide-react";
import { api } from "@/lib/api";
import { formatDateShort } from "@/lib/time";
import { cn } from "@/lib/cn";
import { SectionTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarStack } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Drawer, Modal } from "@/components/ui/overlay";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { RecipientSelector, type AgentLite, type Selection } from "./recipient-selector";
import { ImportListModal } from "./import-list";
import { Segmented } from "@/components/ui/select";

interface List {
  id: string;
  name: string;
  teamCode: string;
  memberIds: string[];
  address: string;
}
interface Group {
  id: string;
  name: string;
  memberIds: string[];
  createdBy: string;
  createdAt: string;
}

interface Staff {
  id: string;
  name: string;
  email: string;
  role: "monitoring" | "management";
}

export function ListsView({ agents, lists, groups, staff, meId }: { agents: AgentLite[]; lists: List[]; groups: Group[]; staff: Staff[]; meId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const byId = new Map(agents.map((a) => [a.id, a]));
  const [open, setOpen] = useState<string | null>(lists[0]?.id || null);
  const [creating, setCreating] = useState(false);
  const [sel, setSel] = useState<Selection>({});
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<Group | null>(null);
  const [importing, setImporting] = useState<null | "new" | List>(null);
  const [removingList, setRemovingList] = useState<List | null>(null);
  const [newStaff, setNewStaff] = useState<{ name: string; email: string; role: "monitoring" | "management" } | null>(null);

  async function call(url: string, init: RequestInit & { json?: unknown }, success: string, after?: () => void) {
    setBusy(true);
    try {
      await api(url, init);
      toast({ title: success });
      after?.();
      router.refresh();
    } catch (e) {
      toast({ tone: "error", title: "That didn’t work", description: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function create() {
    setBusy(true);
    try {
      await api("/api/groups", { method: "POST", json: { name, memberIds: Object.keys(sel) } });
      toast({ title: `“${name}” created`, description: `${Object.keys(sel).length} agents, ready for your next request.` });
      setCreating(false);
      setSel({});
      setName("");
      router.refresh();
    } catch (e) {
      toast({ tone: "error", title: "Couldn’t create the group", description: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function remove(g: Group) {
    setBusy(true);
    try {
      await api(`/api/groups/${g.id}`, { method: "DELETE" });
      toast({ title: `“${g.name}” deleted`, description: "Past requests keep their recipients." });
      setDeleting(null);
      router.refresh();
    } catch (e) {
      toast({ tone: "error", title: "Couldn’t delete", description: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <SectionTitle
        eyebrow="Distribution lists"
        title="Who should we reach?"
        description="Lists mirror Exchange. Groups are your own shortcuts — any mix of agents, across teams."
        action={
          <>
            <Button variant="secondary" icon={<Plus size={16} />} onClick={() => setCreating(true)} disabled={!agents.length}>
              New group
            </Button>
            <Button icon={<Upload size={16} />} onClick={() => setImporting("new")}>
              Import a list
            </Button>
          </>
        }
      />

      <section className="mt-10" aria-labelledby="dls">
        <h2 id="dls" className="eyebrow">
          Exchange distribution lists
        </h2>
        {lists.length === 0 && (
          <div className="surface mt-3">
            <EmptyState
              art="people"
              title="No distribution lists yet."
              description="Import DL RBC KRK, DL RSM KRK and DL BM KRK from Outlook — drop the .docx or paste the members. Agents can sign in as soon as they’re on a list."
              action={<Button icon={<Upload size={16} />} onClick={() => setImporting("new")}>Import a list</Button>}
            />
          </div>
        )}
        <ul className="mt-3 space-y-2">
          {lists.map((l) => {
            const isOpen = open === l.id;
            const members = l.memberIds.map((id) => byId.get(id)).filter(Boolean) as AgentLite[];
            return (
              <li key={l.id} className="surface overflow-hidden">
                <button onClick={() => setOpen(isOpen ? null : l.id)} aria-expanded={isOpen} className="flex w-full items-center gap-4 p-5 text-left sm:p-6">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink-900 text-[12px] font-semibold text-white">{l.teamCode || "DL"}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[17px] font-semibold tracking-[-0.015em]">{l.name}</span>
                    <span className="mt-0.5 flex items-center gap-1.5 truncate text-[13px] text-ink-400">
                      <Mail size={12} /> {l.address || "No list address — announcements go to each agent in BCC"}
                    </span>
                  </span>
                  <span className="hidden sm:block">
                    <AvatarStack names={members.map((m) => m.name)} max={5} size={28} />
                  </span>
                  <span className="tnum w-20 text-right text-sm text-ink-500">{members.filter((m) => m.active).length} agents</span>
                  <ChevronDown size={17} className={cn("text-ink-300 transition-transform duration-200", isOpen && "rotate-180")} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div key="m" initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-ink-900/[0.06] px-4 py-3">
                        <Button size="sm" variant="ghost" icon={<Trash2 size={13} />} onClick={() => setRemovingList(l)}>
                          Remove list
                        </Button>
                        <Button size="sm" variant="secondary" icon={<RefreshCw size={13} />} onClick={() => setImporting(l)}>
                          Update members
                        </Button>
                      </div>
                      <ul className="grid max-h-[420px] gap-1 overflow-y-auto border-t border-ink-900/[0.06] p-3 sm:grid-cols-2 lg:grid-cols-3">
                        {members.map((m) => (
                          <li key={m.id} className={cn("flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm", !m.active && "opacity-50")}>
                            <Avatar name={m.name} size={28} />
                            <span className="truncate">{m.name}</span>
                            {m.teamCode !== l.teamCode && <Badge className="ml-auto">{m.teamCode}</Badge>}
                            {!m.active && <Badge tone="muted" className="ml-auto">On leave</Badge>}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-[12.5px] text-ink-400">When a list changes in Outlook, use “Update members” with the new export. (With Microsoft Graph access, this can sync automatically.)</p>
      </section>

      <section className="mt-12" aria-labelledby="staff">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 id="staff" className="eyebrow">
              Monitoring & management
            </h2>
            <p className="mt-1.5 text-[13px] text-ink-500">Monitoring is in CC of every confirmation. Management sees Insights only.</p>
          </div>
          <Button size="sm" variant="secondary" icon={<UserPlus size={14} />} onClick={() => setNewStaff({ name: "", email: "", role: "monitoring" })}>
            Add someone
          </Button>
        </div>
        <ul className="surface mt-3 divide-y divide-ink-900/[0.06]">
          {staff.map((p) => (
            <li key={p.id} className="flex items-center gap-3 px-5 py-3.5">
              <Avatar name={p.name} size={32} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {p.name} {p.id === meId && <span className="font-normal text-ink-400">· you</span>}
                </span>
                <span className="block truncate text-[12.5px] text-ink-400">{p.email}</span>
              </span>
              <Badge tone={p.role === "monitoring" ? "ink" : "neutral"}>{p.role === "monitoring" ? "Monitoring" : "Management"}</Badge>
              {p.id !== meId && (
                <button aria-label={`Remove ${p.name}`} onClick={() => call(`/api/people/${p.id}`, { method: "DELETE" }, `${p.name} removed`)} className="grid h-8 w-8 place-items-center rounded-lg text-ink-300 transition hover:bg-signal-50 hover:text-signal-600">
                  <X size={15} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12" aria-labelledby="groups">
        <h2 id="groups" className="eyebrow">
          Custom groups
        </h2>
        {groups.length === 0 ? (
          <div className="surface mt-3">
            <EmptyState art="people" title="No custom groups yet." description="Save a hand-picked set of agents — say, your Friday evening regulars — and reach them in one click." action={<Button icon={<Plus size={16} />} onClick={() => setCreating(true)}>New group</Button>} />
          </div>
        ) : (
          <ul className="mt-3 grid gap-3 md:grid-cols-2">
            {groups.map((g) => (
              <li key={g.id} className="surface group flex flex-col p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.015em]">
                      <Users size={16} className="text-ink-300" /> {g.name}
                    </p>
                    <p className="mt-1 text-[13px] text-ink-400">
                      {g.memberIds.length} agents · by {g.createdBy} · {formatDateShort(g.createdAt.slice(0, 10))}
                    </p>
                  </div>
                  <button onClick={() => setDeleting(g)} aria-label={`Delete ${g.name}`} className="grid h-8 w-8 place-items-center rounded-lg text-ink-300 transition hover:bg-signal-50 hover:text-signal-600">
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {g.memberIds.map((id) => byId.get(id)).filter(Boolean).map((a) => (
                    <span key={a!.id} className="inline-flex h-7 items-center gap-1.5 rounded-full bg-ink-50 pl-0.5 pr-2.5 text-[12.5px]">
                      <Avatar name={a!.name} size={24} /> {a!.name}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Drawer
        open={creating}
        onClose={() => setCreating(false)}
        title="New group"
        description="Pick agents from any list or team."
        width={880}
        footer={
          <>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Group name" aria-label="Group name" className="field mr-auto max-w-xs" maxLength={60} />
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button loading={busy} disabled={!name.trim() || !Object.keys(sel).length} onClick={create}>
              Create group
            </Button>
          </>
        }
      >
        <RecipientSelector agents={agents} lists={lists} groups={[]} value={sel} onChange={setSel} />
      </Drawer>

      {importing && <ImportListModal open onClose={() => setImporting(null)} list={importing === "new" ? undefined : { id: importing.id, name: importing.name, address: importing.address, count: importing.memberIds.length }} />}

      <Modal
        open={!!removingList}
        onClose={() => setRemovingList(null)}
        size="sm"
        title={`Remove ${removingList?.name}?`}
        description="Its members stay in Overtime only if they’re on another list. Past requests keep their history."
        footer={
          <>
            <Button variant="ghost" onClick={() => setRemovingList(null)}>
              Keep it
            </Button>
            <Button variant="danger" loading={busy} onClick={() => removingList && call(`/api/lists/${removingList.id}`, { method: "DELETE" }, `${removingList.name} removed`, () => setRemovingList(null))}>
              Remove list
            </Button>
          </>
        }
      >
        <span />
      </Modal>

      <Modal
        open={!!newStaff}
        onClose={() => setNewStaff(null)}
        size="sm"
        title="Add a colleague"
        description="They sign in with the Monitoring or Management code and choose their own PIN."
        footer={
          <>
            <Button variant="ghost" onClick={() => setNewStaff(null)}>
              Cancel
            </Button>
            <Button
              loading={busy}
              disabled={!newStaff || newStaff.name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(newStaff.email)}
              onClick={() => newStaff && call("/api/people", { method: "POST", json: newStaff }, `${newStaff.name} added`, () => setNewStaff(null))}
            >
              Add
            </Button>
          </>
        }
      >
        {newStaff && (
          <div className="space-y-3">
            <input data-autofocus aria-label="Full name" placeholder="Full name" value={newStaff.name} onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} className="field" />
            <input aria-label="Work email" placeholder="Work email" type="email" value={newStaff.email} onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })} className="field" />
            <Segmented label="Role" value={newStaff.role} onChange={(v) => setNewStaff({ ...newStaff, role: v })} options={[{ value: "monitoring", label: "Monitoring" }, { value: "management", label: "Management" }]} />
          </div>
        )}
      </Modal>

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        size="sm"
        title={`Delete “${deleting?.name}”?`}
        description="The group disappears from the selector. Requests already sent keep their recipients."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Keep it
            </Button>
            <Button variant="danger" loading={busy} onClick={() => deleting && remove(deleting)}>
              Delete group
            </Button>
          </>
        }
      >
        <span />
      </Modal>
    </div>
  );
}
