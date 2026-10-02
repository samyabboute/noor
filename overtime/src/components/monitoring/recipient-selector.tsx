"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Minus, Plus, Search, Users, X } from "lucide-react";
import type { RecipientSource } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";

export interface AgentLite {
  id: string;
  name: string;
  teamCode: string;
  active: boolean;
}
export interface ListLite {
  id: string;
  name: string;
  teamCode: string;
  memberIds: string[];
}
export interface GroupLite {
  id: string;
  name: string;
  memberIds: string[];
}

export type Selection = Record<string, RecipientSource>;

/**
 * "Who should we reach?"
 * Start from whole distribution lists, then trim or extend agent by agent.
 * A DL is a starting point, never an all-or-nothing send.
 */
export function RecipientSelector({
  agents,
  lists,
  groups,
  value,
  onChange,
  exclude = [],
  onSaveGroup,
}: {
  agents: AgentLite[];
  lists: ListLite[];
  groups: GroupLite[];
  value: Selection;
  onChange: (s: Selection) => void;
  exclude?: string[];
  onSaveGroup?: (memberIds: string[]) => void;
}) {
  const byId = useMemo(() => new Map(agents.map((a) => [a.id, a])), [agents]);
  const excluded = useMemo(() => new Set(exclude), [exclude]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [activeResult, setActiveResult] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);

  const eligible = (ids: string[]) => ids.filter((id) => byId.get(id)?.active && !excluded.has(id));
  const selectedIds = Object.keys(value);

  function toggleSet(ids: string[], source: RecipientSource) {
    const pool = eligible(ids);
    const all = pool.length > 0 && pool.every((id) => value[id]);
    const next = { ...value };
    if (all) {
      // Turning a list off keeps agents someone added by hand.
      for (const id of pool) if (next[id]?.type !== "individual") delete next[id];
    } else {
      for (const id of pool) if (!next[id]) next[id] = source;
    }
    onChange(next);
  }

  function toggleOne(id: string, source: RecipientSource) {
    const next = { ...value };
    if (next[id]) delete next[id];
    else next[id] = source;
    onChange(next);
  }

  const results = q.trim()
    ? agents.filter((a) => a.active && !excluded.has(a.id) && a.name.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 7)
    : [];

  const sourceName = (s: RecipientSource) => (s.type === "dl" ? lists.find((l) => l.id === s.id)?.name || "List" : s.type === "group" ? groups.find((g) => g.id === s.id)?.name || "Group" : "Added individually");
  const grouped = useMemo(() => {
    const m = new Map<string, { label: string; ids: string[] }>();
    for (const [id, s] of Object.entries(value)) {
      const key = s.type === "individual" ? "individual" : `${s.type}:${s.id}`;
      const g = m.get(key) || { label: sourceName(s), ids: [] };
      g.ids.push(id);
      m.set(key, g);
    }
    return [...m.entries()].sort((a, b) => (a[0] === "individual" ? 1 : b[0] === "individual" ? -1 : a[1].label.localeCompare(b[1].label)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, lists, groups]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-10">
      <div className="min-w-0 space-y-8">
        {/* Distribution lists */}
        <section aria-labelledby="dl-title">
          <h3 id="dl-title" className="eyebrow">
            Distribution lists
          </h3>
          <ul className="mt-3 space-y-2">
            {lists.map((l) => {
              const pool = eligible(l.memberIds);
              const n = pool.filter((id) => value[id]).length;
              const state = n === 0 ? "none" : n === pool.length ? "all" : "some";
              const open = expanded === l.id;
              return (
                <li key={l.id} className={cn("overflow-hidden rounded-2xl bg-white ring-1 transition-shadow", state !== "none" ? "shadow-lift ring-ink-900/15" : "shadow-card ring-ink-900/[0.07]")}>
                  <div className="flex items-center gap-3 p-3 pr-2 sm:p-4 sm:pr-3">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={state === "all" ? true : state === "some" ? "mixed" : false}
                      onClick={() => toggleSet(l.memberIds, { type: "dl", id: l.id })}
                      className="flex min-w-0 flex-1 items-center gap-3.5 text-left"
                    >
                      <TriCheck state={state} />
                      <span className="min-w-0">
                        <span className="block text-[15px] font-medium tracking-[-0.01em]">{l.name}</span>
                        <span className="tnum block text-[13px] text-ink-400">
                          {state === "none" ? `${pool.length} agents` : `${n} of ${pool.length} selected`}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={`members-${l.id}`}
                      onClick={() => setExpanded(open ? null : l.id)}
                      className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg px-2.5 text-[13px] font-medium text-ink-500 transition hover:bg-ink-50 hover:text-ink-900"
                    >
                      Members <ChevronDown size={14} className={cn("transition-transform duration-200", open && "rotate-180")} />
                    </button>
                  </div>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div id={`members-${l.id}`} initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                        <ul className="grid max-h-72 gap-0.5 overflow-y-auto border-t border-ink-900/[0.06] p-2 sm:grid-cols-2">
                          {l.memberIds.map((id) => {
                            const a = byId.get(id);
                            if (!a) return null;
                            const on = Boolean(value[id]);
                            const disabled = !a.active || excluded.has(id);
                            return (
                              <li key={id}>
                                <button
                                  type="button"
                                  role="checkbox"
                                  aria-checked={on}
                                  disabled={disabled}
                                  onClick={() => toggleOne(id, { type: "dl", id: l.id })}
                                  className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[13px] transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-45"
                                >
                                  <span className={cn("grid h-4 w-4 shrink-0 place-items-center rounded-[5px] ring-1 ring-inset transition", on ? "bg-ink-900 ring-ink-900" : "ring-ink-900/20")}>
                                    {on && <Check size={11} strokeWidth={3} className="text-white" />}
                                  </span>
                                  <span className="truncate">{a.name}</span>
                                  <span className="ml-auto shrink-0 text-[11px] text-ink-400">{!a.active ? "On leave" : excluded.has(id) ? "Already in" : a.teamCode !== l.teamCode ? a.teamCode : ""}</span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Custom groups */}
        {groups.length > 0 && (
          <section aria-labelledby="grp-title">
            <h3 id="grp-title" className="eyebrow">
              Your groups
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {groups.map((g) => {
                const pool = eligible(g.memberIds);
                const n = pool.filter((id) => value[id]).length;
                const state = n === 0 ? "none" : n === pool.length ? "all" : "some";
                return (
                  <button
                    key={g.id}
                    type="button"
                    role="checkbox"
                    aria-checked={state === "all" ? true : state === "some" ? "mixed" : false}
                    onClick={() => toggleSet(g.memberIds, { type: "group", id: g.id })}
                    className={cn("inline-flex h-9 items-center gap-2 rounded-full pl-2 pr-3.5 text-[13px] font-medium ring-1 transition", state === "none" ? "bg-white text-ink-700 ring-ink-900/10 hover:ring-ink-900/20" : "bg-ink-900 text-white ring-ink-900")}
                  >
                    <TriCheck state={state} small inverse={state !== "none"} />
                    {g.name}
                    <span className={cn("tnum", state === "none" ? "text-ink-400" : "text-white/60")}>{pool.length}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Individuals */}
        <section aria-labelledby="ind-title">
          <h3 id="ind-title" className="eyebrow">
            Individual agents
          </h3>
          <div className="relative mt-3">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              ref={searchRef}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setActiveResult(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActiveResult((i) => Math.min(results.length - 1, i + 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActiveResult((i) => Math.max(0, i - 1));
                } else if (e.key === "Enter" && results[activeResult]) {
                  e.preventDefault();
                  toggleOne(results[activeResult].id, { type: "individual" });
                  setQ("");
                } else if (e.key === "Escape") setQ("");
              }}
              placeholder="Search agent…"
              aria-label="Search agents to add"
              role="combobox"
              aria-expanded={results.length > 0}
              aria-controls="agent-results"
              aria-activedescendant={results[activeResult] ? `res-${results[activeResult].id}` : undefined}
              className="field pl-10"
            />
            <AnimatePresence>
              {results.length > 0 && (
                <motion.ul
                  id="agent-results"
                  role="listbox"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  className="absolute inset-x-0 top-full z-30 mt-1.5 overflow-hidden rounded-xl bg-white p-1 shadow-float ring-1 ring-ink-900/[0.06]"
                >
                  {results.map((a, i) => {
                    const on = Boolean(value[a.id]);
                    return (
                      <li
                        key={a.id}
                        id={`res-${a.id}`}
                        role="option"
                        aria-selected={i === activeResult}
                        onMouseEnter={() => setActiveResult(i)}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          toggleOne(a.id, { type: "individual" });
                          setQ("");
                          searchRef.current?.focus();
                        }}
                        className={cn("flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm", i === activeResult && "bg-ink-50")}
                      >
                        <Avatar name={a.name} size={26} />
                        <span className="flex-1 truncate">{a.name}</span>
                        <span className="text-[12px] text-ink-400">{a.teamCode}</span>
                        {on ? <Check size={15} className="text-covered" /> : <Plus size={15} className="text-ink-300" />}
                      </li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
          <p className="mt-2 text-[12.5px] text-ink-400">Mix freely — agents from any list or team can join the same request.</p>
        </section>
      </div>

      {/* Selected */}
      <aside aria-labelledby="sel-title" className="min-w-0 lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-2xl bg-ink-50/70 p-4 ring-1 ring-ink-900/[0.05] sm:p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 id="sel-title" className="text-[15px] font-medium">
              <motion.span key={selectedIds.length} initial={{ opacity: 0.4, y: -3 }} animate={{ opacity: 1, y: 0 }} className="tnum inline-block text-2xl font-semibold tracking-[-0.03em]">
                {selectedIds.length}
              </motion.span>{" "}
              <span className="text-ink-500">{selectedIds.length === 1 ? "agent" : "agents"} selected</span>
            </h3>
            <div className="flex items-center gap-1">
              {onSaveGroup && selectedIds.length > 1 && (
                <button type="button" onClick={() => onSaveGroup(selectedIds)} className="rounded-lg px-2 py-1 text-[12.5px] font-medium text-ink-500 transition hover:bg-white hover:text-ink-900">
                  Save as group
                </button>
              )}
              {selectedIds.length > 0 && (
                <button type="button" onClick={() => onChange({})} className="rounded-lg px-2 py-1 text-[12.5px] font-medium text-ink-500 transition hover:bg-white hover:text-ink-900">
                  Clear
                </button>
              )}
            </div>
          </div>
          {selectedIds.length === 0 ? (
            <EmptyState compact art="people" title="No agents selected." description="Pick a distribution list, a group, or search for someone by name." />
          ) : (
            <div className="mt-4 max-h-[420px] space-y-5 overflow-y-auto pr-1">
              {grouped.map(([key, g]) => (
                <div key={key}>
                  <p className="mb-2 flex items-center gap-1.5 text-[12px] font-medium text-ink-500">
                    {key === "individual" ? <Users size={12} /> : null}
                    {g.label} <span className="tnum text-ink-300">· {g.ids.length}</span>
                  </p>
                  <motion.ul layout className="flex flex-wrap gap-1.5">
                    <AnimatePresence initial={false} mode="popLayout">
                      {g.ids
                        .map((id) => byId.get(id)!)
                        .filter(Boolean)
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((a) => (
                          <motion.li
                            key={a.id}
                            layout
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.12 } }}
                            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white pl-1 pr-1 text-[13px] shadow-card ring-1 ring-ink-900/[0.06]"
                          >
                            <Avatar name={a.name} size={24} />
                            <span className="max-w-[140px] truncate pl-0.5">{a.name}</span>
                            <button
                              type="button"
                              aria-label={`Remove ${a.name}`}
                              onClick={() => {
                                const next = { ...value };
                                delete next[a.id];
                                onChange(next);
                              }}
                              className="grid h-6 w-6 place-items-center rounded-full text-ink-300 transition hover:bg-ink-100 hover:text-ink-900"
                            >
                              <X size={13} />
                            </button>
                          </motion.li>
                        ))}
                    </AnimatePresence>
                  </motion.ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function TriCheck({ state, small, inverse }: { state: "none" | "some" | "all"; small?: boolean; inverse?: boolean }) {
  const s = small ? "h-5 w-5" : "h-6 w-6";
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full transition-colors duration-200",
        s,
        state === "none" ? (inverse ? "ring-1 ring-white/40" : "ring-1 ring-inset ring-ink-900/20") : inverse ? "bg-white text-ink-900" : "bg-ink-900 text-white",
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {state === "all" && (
          <motion.span key="all" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={{ duration: 0.16 }}>
            <Check size={small ? 11 : 13} strokeWidth={3} />
          </motion.span>
        )}
        {state === "some" && (
          <motion.span key="some" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={{ duration: 0.16 }}>
            <Minus size={small ? 11 : 13} strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

export function selectionToPayload(sel: Selection) {
  return Object.entries(sel).map(([userId, source]) => ({ userId, source }));
}

export function sourcesOf(sel: Selection) {
  const dlIds = new Set<string>();
  const groupIds = new Set<string>();
  for (const s of Object.values(sel)) {
    if (s.type === "dl") dlIds.add(s.id);
    if (s.type === "group") groupIds.add(s.id);
  }
  return { dlIds: [...dlIds], groupIds: [...groupIds] };
}
