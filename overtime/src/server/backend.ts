import "server-only";
import postgres from "postgres";
import type { SeedState } from "./seed";

/**
 * Where Overtime keeps its data.
 *
 *  - Memory   — no DATABASE_URL: one copy per server process (local dev, demos).
 *  - Postgres — DATABASE_URL (or POSTGRES_URL) set: Neon, Supabase or Vercel Postgres.
 *
 * The whole workspace is one JSON document in a single row. Writes take a row
 * lock (SELECT … FOR UPDATE), so concurrent answers from many agents are applied
 * one after another and never overwrite each other. That is plenty for a
 * contact-centre site (hundreds of people, a few requests a day) and needs no
 * migrations. supabase/migrations/0001_init.sql is the fully relational schema
 * for when Overtime outgrows this.
 */

export type State = SeedState & { demoAgentsSeen: string[] };

export interface Backend {
  kind: "memory" | "postgres";
  load(): Promise<State>;
  transact<R>(fn: (s: State) => R): Promise<R>;
}

const dbUrl = () => process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

const g = globalThis as unknown as { __otMemory?: State; __otSql?: postgres.Sql; __otReady?: Promise<void> };

function memoryBackend(init: () => State): Backend {
  const get = () => (g.__otMemory ||= init());
  return {
    kind: "memory",
    async load() {
      return get();
    },
    async transact(fn) {
      return fn(get());
    },
  };
}

function postgresBackend(init: () => State): Backend {
  const sql = (g.__otSql ||= postgres(dbUrl(), {
    max: 3,
    idle_timeout: 20,
    prepare: false, // compatible with transaction-mode poolers (Neon, Supabase)
    ssl: /localhost|127\.0\.0\.1/.test(dbUrl()) ? false : "require",
  }));

  const ready = () =>
    (g.__otReady ||= (async () => {
      await sql`create table if not exists overtime_state (
        id int primary key,
        data jsonb not null,
        updated_at timestamptz not null default now()
      )`;
      await sql`insert into overtime_state (id, data) values (1, ${sql.json(init() as unknown as postgres.JSONValue)}) on conflict (id) do nothing`;
    })().catch((e) => {
      g.__otReady = undefined;
      throw e;
    }));

  return {
    kind: "postgres",
    async load() {
      await ready();
      const [row] = await sql<{ data: State }[]>`select data from overtime_state where id = 1`;
      return row.data;
    },
    async transact<R>(fn: (s: State) => R): Promise<R> {
      await ready();
      const out = await sql.begin(async (tx) => {
        const [row] = await tx<{ data: State }[]>`select data from overtime_state where id = 1 for update`;
        const state = row.data;
        const result = fn(state);
        await tx`update overtime_state set data = ${tx.json(state as unknown as postgres.JSONValue)}, updated_at = now() where id = 1`;
        return { result };
      });
      return (out as unknown as { result: R }).result;
    },
  };
}

let backend: Backend | undefined;
export function getBackend(init: () => State): Backend {
  return (backend ||= dbUrl() ? postgresBackend(init) : memoryBackend(init));
}

export const hasDatabase = () => Boolean(dbUrl());
