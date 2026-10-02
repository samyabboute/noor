-- ─────────────────────────────────────────────────────────────────────────────
-- Overtime — production schema (Supabase / PostgreSQL)
-- Mirrors src/lib/types.ts. Row Level Security enforces the same rules the API
-- enforces, a second time, in the database:
--   agents      → only their own recipient rows and the requests addressed to them
--   monitoring  → full operational read/write
--   management  → read-only aggregates (via the analytics views), no row edits
-- Identity: Microsoft Entra ID → Supabase Auth (Azure provider). users.auth_id
-- links to auth.users.id; roles come from Entra security groups, synced to users.role.
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";
create extension if not exists "citext";

create type user_role        as enum ('agent', 'monitoring', 'management');
create type request_status   as enum ('draft', 'live', 'completed', 'cancelled');
create type recipient_status as enum ('sent', 'opened', 'confirmed', 'declined', 'expired');
create type recipient_source as enum ('dl', 'group', 'individual');
create type template_kind    as enum ('request', 'confirmation');

create table teams (
  id    text primary key,                -- 'rbc' | 'rsm' | 'bm'
  code  text not null unique,            -- 'RBC'
  name  text not null
);

create table users (
  id         uuid primary key default gen_random_uuid(),
  auth_id    uuid unique references auth.users(id) on delete set null,
  name       text not null,
  email      citext not null unique,
  role       user_role not null default 'agent',
  team_id    text references teams(id),
  language   text not null default 'en' check (language in ('en','fr','de','it','pl')),
  title      text not null default '',
  shift_end  time not null default '18:00',
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- Convenience role tables requested by the brief; membership mirrors users.role.
create view monitoring_users  as select * from users where role = 'monitoring' and active;
create view management_users as select * from users where role = 'management' and active;

create table distribution_lists (
  id       text primary key,             -- 'dl-rbc'
  name     text not null unique,         -- 'DL RBC KRK'
  address  citext not null unique,       -- Exchange DL mailbox
  team_id  text not null references teams(id)
);

create table distribution_list_members (
  list_id text not null references distribution_lists(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  primary key (list_id, user_id)
);

create table custom_groups (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (length(name) between 1 and 60),
  created_by uuid not null references users(id),
  created_at timestamptz not null default now()
);

create table custom_group_members (
  group_id uuid not null references custom_groups(id) on delete cascade,
  user_id  uuid not null references users(id) on delete cascade,
  primary key (group_id, user_id)
);

create table email_templates (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  kind       template_kind not null,
  language   text not null default 'en',
  subject    text not null check (length(subject) <= 200),
  body       text not null check (length(body) <= 4000),
  is_default boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references users(id)
);
create unique index one_default_template on email_templates (kind, language) where is_default;

create sequence overtime_request_seq start 1000;

create table overtime_requests (
  id                        text primary key default ('OT-' || nextval('overtime_request_seq')),
  title                     text not null,
  created_by                uuid not null references users(id),
  created_at                timestamptz not null default now(),
  sent_at                   timestamptz,
  closed_at                 timestamptz,
  date                      date not null,
  start_time                time not null,
  duration_min              int  not null check (duration_min in (15,30,45,60,90,120)),
  end_time                  time generated always as (start_time + make_interval(mins => duration_min)) stored,
  flexible                  boolean not null default true,
  target                    int not null default 1 check (target between 0 and 500),
  status                    request_status not null default 'draft',
  subject                   text not null,
  body                      text not null,
  confirmation_template_id  uuid references email_templates(id),
  cc_ids                    uuid[] not null default '{}',
  source_dl_ids             text[] not null default '{}',
  source_group_ids          uuid[] not null default '{}'
);
create index on overtime_requests (status, date);

create table overtime_recipients (
  id                uuid primary key default gen_random_uuid(),
  request_id        text not null references overtime_requests(id) on delete cascade,
  user_id           uuid not null references users(id),
  source            recipient_source not null,
  source_id         text,                        -- DL id or group id
  status            recipient_status not null default 'sent',
  added_at          timestamptz not null default now(),
  opened_at         timestamptz,
  responded_at      timestamptz,
  minutes           int check (minutes in (15,30,45,60,90,120)),
  email_prepared_at timestamptz,
  unique (request_id, user_id)
);
create index on overtime_recipients (user_id);

-- Immutable response history (the recipient row holds the current answer).
create table overtime_responses (
  id           uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references overtime_recipients(id) on delete cascade,
  decision     text not null check (decision in ('confirm','decline','withdraw')),
  minutes      int,
  created_at   timestamptz not null default now()
);

create table audit_logs (
  id             bigint generated always as identity primary key,
  at             timestamptz not null default now(),
  actor_id       uuid references users(id),        -- null = system
  action         text not null,                    -- REQUEST_CREATED, AGENT_CONFIRMED, …
  request_id     text references overtime_requests(id),
  target_user_id uuid references users(id),
  meta           jsonb not null default '{}'
);
create index on audit_logs (request_id, at);

-- ── Helpers ────────────────────────────────────────────────────────────────
create or replace function current_app_user() returns users
language sql stable security definer set search_path = public as $$
  select * from users where auth_id = auth.uid() and active
$$;

create or replace function current_role_is(r user_role) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from users where auth_id = auth.uid() and active and role = r)
$$;

-- ── Row Level Security ─────────────────────────────────────────────────────
alter table users                     enable row level security;
alter table teams                     enable row level security;
alter table distribution_lists        enable row level security;
alter table distribution_list_members enable row level security;
alter table custom_groups             enable row level security;
alter table custom_group_members      enable row level security;
alter table email_templates           enable row level security;
alter table overtime_requests         enable row level security;
alter table overtime_recipients       enable row level security;
alter table overtime_responses        enable row level security;
alter table audit_logs                enable row level security;

-- Users: everyone sees themselves; monitoring sees the directory.
create policy users_self       on users for select using (auth_id = auth.uid());
create policy users_monitoring on users for select using (current_role_is('monitoring'));

create policy teams_read on teams for select using (auth.uid() is not null);

-- Lists, groups, templates: monitoring operates them.
create policy dl_monitoring      on distribution_lists        for all using (current_role_is('monitoring'));
create policy dlm_monitoring     on distribution_list_members for all using (current_role_is('monitoring'));
create policy grp_monitoring     on custom_groups             for all using (current_role_is('monitoring')) with check (current_role_is('monitoring'));
create policy grpm_monitoring    on custom_group_members      for all using (current_role_is('monitoring'));
create policy tpl_monitoring     on email_templates           for all using (current_role_is('monitoring')) with check (current_role_is('monitoring'));
-- Agents read confirmation templates (their email is rendered from one).
create policy tpl_agent_read     on email_templates for select using (kind = 'confirmation' and auth.uid() is not null);

-- Requests: monitoring full access; agents only the live/closed requests addressed to them.
create policy req_monitoring on overtime_requests for all using (current_role_is('monitoring')) with check (current_role_is('monitoring'));
create policy req_agent_read on overtime_requests for select using (
  status <> 'draft' and exists (
    select 1 from overtime_recipients r where r.request_id = overtime_requests.id and r.user_id = (current_app_user()).id
  )
);

-- Recipients: agents see and answer only their own row, only while the request is live.
create policy rec_monitoring on overtime_recipients for all using (current_role_is('monitoring')) with check (current_role_is('monitoring'));
create policy rec_agent_read on overtime_recipients for select using (user_id = (current_app_user()).id);
create policy rec_agent_answer on overtime_recipients for update
  using (user_id = (current_app_user()).id and exists (select 1 from overtime_requests q where q.id = request_id and q.status = 'live'))
  with check (user_id = (current_app_user()).id);

create policy resp_agent_insert on overtime_responses for insert with check (
  exists (select 1 from overtime_recipients r where r.id = recipient_id and r.user_id = (current_app_user()).id)
);
create policy resp_monitoring_read on overtime_responses for select using (current_role_is('monitoring'));

-- Audit: append-only. Monitoring reads; nobody updates or deletes.
create policy audit_insert on audit_logs for insert with check (auth.uid() is not null and actor_id = (current_app_user()).id);
create policy audit_read   on audit_logs for select using (current_role_is('monitoring'));

-- ── Management: aggregates only, no personal contact data ─────────────────
create view analytics_daily with (security_invoker = false) as
select q.date,
       count(distinct q.id)                                  as requests,
       count(r.id)                                           as recipients,
       count(r.id) filter (where r.status = 'confirmed')     as confirmed,
       coalesce(sum(r.minutes) filter (where r.status = 'confirmed'), 0) as additional_minutes,
       avg(extract(epoch from (r.responded_at - greatest(q.sent_at, r.added_at)))) filter (where r.responded_at is not null) as avg_response_sec
from overtime_requests q
join overtime_recipients r on r.request_id = q.id
where q.status in ('live','completed')
group by q.date;

create view analytics_by_team with (security_invoker = false) as
select u.team_id, q.date,
       count(r.id) as recipients,
       count(r.id) filter (where r.status = 'confirmed') as confirmed,
       coalesce(sum(r.minutes) filter (where r.status = 'confirmed'), 0) as additional_minutes
from overtime_recipients r
join overtime_requests q on q.id = r.request_id
join users u on u.id = r.user_id
where q.status in ('live','completed')
group by u.team_id, q.date;

revoke all on analytics_daily, analytics_by_team from public, anon, authenticated;

-- Aggregates are reachable only through role-checked functions — agents get nothing.
create or replace function insights_daily(from_date date, to_date date)
returns setof analytics_daily language sql stable security definer set search_path = public as $$
  select * from analytics_daily
  where date between from_date and to_date
    and (current_role_is('management') or current_role_is('monitoring'))
$$;

create or replace function insights_by_team(from_date date, to_date date)
returns setof analytics_by_team language sql stable security definer set search_path = public as $$
  select * from analytics_by_team
  where date between from_date and to_date
    and (current_role_is('management') or current_role_is('monitoring'))
$$;

revoke all on function insights_daily(date, date), insights_by_team(date, date) from public, anon;
grant execute on function insights_daily(date, date), insights_by_team(date, date) to authenticated;
