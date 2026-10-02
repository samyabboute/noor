# Overtime

**Cover the peak.** Voluntary overtime, without the email thread.

Overtime replaces the "Bonjour à tous… envoyez-nous votre nouvelle heure de déconnexion" email. Monitoring launches a request in under a minute. Agents answer in one click. Overtime writes the confirmation email for them. Management reads the trends.

| Before | Now |
|---|---|
| Read the email → reply all → type your logout time → find the right people → send | Open Overtime → **I'm in** → Open Outlook → Send |

---

## Run it

```bash
cd overtime
npm install
npm run dev          # http://localhost:3100
npm run build && npm start
```

With no environment variables set, the app runs in **demo mode**. Pick a persona on the sign-in page:

| Persona | Role | Try this |
|---|---|---|
| Samy Abboute | Agent · RBC | Press **I'm in** and watch the confirmation get prepared, then **Open Outlook** |
| Bartłomiej Wyżycki | Monitoring | **Create overtime request**, mix DLs and individuals, then launch and watch the coverage ring fill |
| Claire Dubois | Management | Use **Insights → Analytics** filters, team view, and CSV reports |

Any of the 46 demo agents can also be picked from the sign-in page. In demo mode, simulated agents start answering within seconds of a launch. An agent you sign in as never gets simulated answers, so you always answer for them yourself. Restarting the server resets the demo data.

## Three experiences

**Agent** (`/agent`): a landing page, not a dashboard. It shows the greeting, today's request in large type (`+30 min · until 18:30`), and one main action. **I'm in** turns into **✓ You're in**. The side panel then changes to *"Your confirmation is ready"*. It shows To (the request owner), Cc (the monitoring team), the subject and the body, in the agent's language (EN / FR / DE). **Open Outlook** opens a compose window with everything filled in. Agents can pick +15/30/45/60 min when the request allows it, say *Maybe later*, or change their answer. **My overtime** shows their history. **Profile** shows their team, DLs and language.

**Monitoring** (`/monitoring`): the control center.
- A live status headline (`11 of 18 in. 7 to go.`), today's coverage, agents reached, confirmed, pending, and additional time.
- The current request card, a live feed of answers ("Who's in?"), and recipient lists.
- **Create request**, a four-step flow:
  1. **When?** — date, start, duration, agents needed, and whether agents may choose their own duration.
  2. **Who?** — select whole DLs, then tick individual agents in or out, add individuals by search, and save the mix as a custom group.
  3. **Message** — templates, variables and a live preview.
  4. **Review** — owner, time, recipients, CC and the email preview, then **Send**.
- **Launch moment**: every agent reached lights up around a ring, then confirmations fill it in live.
- **Request detail**: radial coverage, a sortable "Who's in?" table (agent, team, request, logout, response time, status), and add or remove agents on a live request. It can also announce the request or nudge pending agents via Outlook, close the request, and show the audit timeline.
- **Recipients** (directory with 30-day participation), **Distribution lists** (members plus custom groups), **Templates** (editor with variables and live preview, default per language), and **Analytics** (read-only).

**Management** (`/insights`): read-only KPIs (requests, confirmation rate, additional hours, average response time, each compared with the previous period). Charts show requests by day, confirmation rate and hours by team, response-time trend, participation by agent, and DL performance. Filters cover date range, team, DL, agent, request owner and status, and they live in the URL so a view can be shared. **Teams** and **Reports** (a one-paragraph summary plus CSV exports) complete it.

## Request lifecycle

```
Request:    DRAFT ──send──▶ LIVE ──(coverage starts | Monitoring closes)──▶ COMPLETED
                 └─discard─▶ CANCELLED
Recipient:  SENT ──views──▶ OPENED ──▶ CONFIRMED | DECLINED      (can withdraw while live)
                                  └──(request closes unanswered)──▶ EXPIRED
```

Responses close when coverage starts, because by then the agent has already logged out. Every step writes to the audit log: `REQUEST_CREATED`, `REQUEST_SENT`, `RECIPIENT_ADDED/REMOVED`, `REQUEST_VIEWED`, `AGENT_CONFIRMED/DECLINED`, `RESPONSE_WITHDRAWN`, `EMAIL_OPENED`, `REQUEST_COMPLETED`, `TEMPLATE_UPDATED`, `GROUP_CREATED/DELETED`.

## Email: real, not pretend

Overtime **never sends mail on anyone's behalf and never sees a password.** `EmailService` (`src/lib/email.ts`) offers two ways to send:

- `openOutlookCompose(draft, "desktop" | "web")`: a `mailto:` link for desktop Outlook, or Outlook on the web's official compose link. The person presses Send from their own mailbox. If the message is too long for a `mailto:` link or a pop-up is blocked, the user sees a clear fallback: *"We couldn't prepare the Outlook message. Your confirmation is still saved."* with Try again, Outlook on the web, and Copy.
- `sendViaGraph(draft)`: ready for Microsoft Graph `POST /me/sendMail` with the delegated `Mail.Send` scope already requested at Entra sign-in. Until it is turned on, `/api/email/graph` returns a plain `501`.

Monitoring uses the same service to **announce** a request: To is the whole DL when every member is selected, otherwise the agents go in BCC. Monitoring can also **nudge** pending agents.

## Architecture

```
overtime/
  src/
    app/                    Next.js 14 App Router — pages per role + API route handlers
      agent/ monitoring/ insights/ login/ api/
    components/
      ui/                   Design system (see below)
      shell/                Workspace sidebar, agent header, ⌘K palette, user menu
      agent/ monitoring/ insights/ auth/
    lib/                    Pure, shared: types, time (Europe/Warsaw), templates, EmailService
    server/                 server-only: auth, repository, read models, analytics
    middleware.ts           Role gate for every page
  supabase/migrations/      Production Postgres schema + Row Level Security
```

- **Repository** (`server/store.ts`): a single interface that every page and route goes through. Demo mode keeps seeded data in memory (`server/seed.ts`: 46 agents, 3 DLs, 2 groups, 6 templates, about 90 days of history, one live request, one draft). For production, implement the same surface on Supabase with `supabase/migrations/0001_init.sql`.
- **Read models** (`server/views.ts`): pages get role-shaped data, never raw rows. An agent's data never includes another agent's details. Management gets aggregates, plus names only in the participation ranking.
- **Live updates**: `useLiveRefresh` re-renders the server page every 4–8 s while the tab is visible, and the launch screen polls a lightweight endpoint. Supabase Realtime or SSE can replace this later without changing any page.

**Stack:** Next.js 14, TypeScript (strict), Tailwind CSS, Framer Motion, NextAuth (Entra ID), Geist, lucide-react. The rest of this repository (Maison Noor) already used Next 14, Tailwind, Framer Motion and NextAuth, so Overtime keeps the same stack as a separate app in its own folder and touches nothing else.

## Authentication — two modes, never mixed

| | Demo mode | Production (Entra) mode |
|---|---|---|
| Activates | default when Entra isn't configured | automatically when `AZURE_AD_CLIENT_ID/SECRET/TENANT_ID` are set (or `AUTH_MODE=entra`) |
| Sign-in | persona picker, labelled **DEMO** everywhere | **Sign in with Microsoft** (NextAuth Azure AD) |
| Session | HMAC-signed, httpOnly, SameSite=Lax cookie (12 h) | NextAuth JWT |
| Role | from the directory record (a cookie can't raise its own role) | from Entra security groups (`ENTRA_GROUP_MONITORING`, `ENTRA_GROUP_MANAGEMENT`) |

In Entra mode `/api/auth/demo` returns `404`.

## Security

- **Role checks in three layers**: middleware redirects pages, every API route calls `requireUser(role)`, and Postgres RLS enforces the same rules again in the database.
- **Agents act only as themselves**: the user id always comes from the session, never from the request body.
- **Same-origin check** on every write request (CSRF protection), plus server-side validation of every input: times, durations, recipient ids and sources, and length limits.
- **CSV exports block formula injection.** Security headers are set (`X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`).
- **No secrets in the client**: only `NEXT_PUBLIC_*` values reach the browser, and the Supabase service key is server-only.

## Design system (`src/components/ui`)

Button (with a magnetic variant for the one main action), Card, Badge, StatusBadge, LiveDot, Avatar and AvatarStack, MetricCard and CountUp, ProgressBar and RadialProgress, Modal and Drawer (focus trap, Esc to close, scroll lock, focus restore), DataTable (sortable, stacked rows on mobile), Select, MultiSelect and Segmented (keyboard-accessible listbox and radio group), Timeline, charts (Bar, Line, HBarList, Sparkline, each with hover tooltips), EmptyState (with illustrations), Skeleton, Toast, and the ⌘K CommandPalette. RecipientSelector lives in `components/monitoring`.

**Colour.** A near-black navy (`ink`) carries the hierarchy. Colour is used only for meaning:
- **signal red**: the one action that matters, and live indicators
- **green**: confirmed coverage
- **amber**: waiting

Motion runs 150–500 ms with out-expo easing, and `prefers-reduced-motion` is respected everywhere.

## Accessibility

Skip links, visible focus rings, ARIA roles on all custom controls (checkbox with `mixed` state, listbox, radiogroup, switch, dialog, combobox), `aria-live` for toasts and the live feed, alt text and labels on progress indicators and charts, keyboard support (⌘K, and ⌘↵ to move through the create flow), and reduced-motion support.

## Assumptions made

- Times are Kraków wall-clock (`Europe/Warsaw`), whatever the server's own time zone.
- "Coverage start" is the agents' normal logout time. Responses close at that moment.
- The confirmation email goes **To:** the request owner, **Cc:** the rest of the monitoring team, in the agent's language when a translation exists.
- "Agents needed" defaults to 60 % of the people reached, and Monitoring can change it.
- Demo addresses use the reserved `example.com` domain, and demo names are fictional.
- Demo data lives in server memory, one copy per process. A multi-instance deployment (for example serverless) needs the Supabase repository so that every instance shares state.

## Ready to extend

Each future integration has one obvious place to plug in:

| Integration | Where it plugs in |
|---|---|
| Microsoft Graph | `EmailService.sendViaGraph` and `/api/email/graph`; DL membership sync |
| Teams notifications and adaptive cards | the `REQUEST_SENT` audit event is the trigger point |
| Power Automate | webhooks on audit events |
| Genesys, real-time presence, forecasted volume | feed the *agents needed* suggestion and choose who to reach |
| Automatic overtime recommendations | suggestions in step 1 of the create flow |
| Email tracking | the `EMAIL_OPENED` event already exists |
