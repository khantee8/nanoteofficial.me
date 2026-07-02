# /plan Feature Batch: Sidebar Nav, Admin Invites, Gantt View, UX Polish — Design

**Date:** 2026-07-01
**Status:** Approved
**Release:** v0.2.0 (package.json `0.1.0` → `0.2.0`)

## Summary

Four user-facing additions to the `/plan` workspace, shipped as one release:

1. Replace the top header with a **left sidebar navigation** (Linear-style).
2. **Admin email invites** — DB-backed allow-list so inviting a coworker never requires a Vercel env change or redeploy; invitee gets a bilingual email via Resend.
3. A **Gantt view** tab on each project page (hand-rolled SVG/CSS, no chart library).
4. A **UX/UI polish bundle**: assignee avatar chips, designed empty states, view-tab icons, per-project accent tinting.

Process requirements: code + security review before merge; deploy via the base-deployment workflow with the v0.2.0 version bump. One DB migration (`invite` table) at deploy time.

## 1. Left Sidebar Navigation

**Change:** `src/app/plan/(app)/layout.tsx` restructures from top-header to a flex row: sidebar + content column. A new client component `src/components/plan/PlanSidebar.tsx` owns active-state highlighting (`usePathname`) and mobile drawer state.

**Desktop (`lg:` and up):** fixed 16rem (`w-64`) full-height sidebar:

- Top: Plan wordmark (color dot + "Plan"), links back to `/plan`.
- Nav: **Projects** (`/plan`), **Admin** (`/plan/admin`, rendered only for `role === "admin"`).
- **Project quick-list:** each project as a row (its `color` dot + name), active project highlighted. Data already loaded in the layout for the CommandPalette — reuse it.
- Bottom: ⌘K hint chip, `LangToggle`, user email, sign-out button.

**Mobile/tablet (below `lg:`):** sidebar hidden. A slim sticky top bar shows hamburger + Plan logo + LangToggle. Hamburger opens the sidebar as a left slide-over drawer with backdrop; closes on backdrop click, Esc, and route change.

**Constraints:**

- The sign-out `<form>` uses a server action — the layout (RSC) passes it into `PlanSidebar` as a `children`/slot prop; no auth logic moves into client code.
- `<main>` keeps `max-w-6xl` content width inside the content column.
- Reuse existing tokens (`--surface`, `--border`, `--feature-color`, `--feature-contrast`); no hard-coded colors.
- All labels via `pt()`/`usePlanT()` — new i18n keys for anything new (e.g., "Menu").

**Alternative rejected:** icon-only rail — hides the project quick-list, which is the main navigation win.

## 2. Admin Email Invites

**Problem:** sign-in is gated by the `ALLOWED_EMAILS` env var (`src/auth.ts` `signIn` callback). Adding a coworker requires editing Vercel env + redeploy.

**Schema** (`src/lib/db/schema.ts`) — new `invite` table:

| column | type | notes |
|---|---|---|
| `id` | text, pk | crypto random UUID |
| `email` | text, unique, not null | stored lowercased |
| `role` | `user_role` enum, not null, default `viewer` | chosen by admin at invite time |
| `invitedBy` | text, not null | inviting admin's email (display only, no FK cascade concerns) |
| `createdAt` | timestamp, not null, default now | |
| `acceptedAt` | timestamp, nullable | stamped on first sign-in |

**Auth changes** (`src/auth.ts` `signIn` callback):

1. Allow sign-in if email is in `ALLOWED_EMAILS` (kept as bootstrap) **or** an `invite` row exists for the email.
2. If an unaccepted invite matches: apply its `role` to the user row and stamp `acceptedAt`.
3. `PLAN_ADMIN_EMAILS` self-heal runs after invite-role application (env admin wins).
4. Revoked (deleted) invite ⇒ sign-in rejected again (unless already a user — existing users keep access; invites gate *new* sign-ins only, matching current allow-list semantics where the check runs every sign-in: deleting an invite for a not-yet-signed-in email blocks them; a user who already accepted has `acceptedAt` set and their invite row is retained to keep the allow-list check passing).

**Admin UI** (`/plan/admin`): above the existing users table:

- **Invite form:** email input + role select + submit. Client-side + server-side email validation, lowercase normalization.
- **Pending invites table:** email, role, invited date, actions: **Resend** (re-sends the email) and **Revoke** (deletes the row). Accepted invites disappear from this table (they now appear in the users table).

**Server actions** (`src/lib/plan/actions.ts`): `createInvite`, `resendInvite`, `revokeInvite` — all gated by `requireAdmin()`. `createInvite` rejects an email that already belongs to a user or an existing invite.

**Invite email:** sent via the Resend REST API (`RESEND_API_KEY`, from `noreply@nanoteofficial.me`) in a small `src/lib/plan/invite-email.ts` helper. Bilingual (TH + EN in one email), links to `https://nanoteofficial.me/plan/signin`. Email send failure does not roll back the invite row — the admin sees a toast distinguishing "invited, email failed (use Resend)" from success.

**Security notes:**

- All invite mutations `requireAdmin()`; queries for the admin page reuse the existing admin-gated pattern.
- Email is validated (format) and normalized (trim + lowercase) before storage.
- No self-service signup surface is added: `/plan/signin` behavior is unchanged; the gate simply consults the DB in addition to the env var.
- The invite email contains no token or secret — it's a pointer to the normal magic-link sign-in, so nothing sensitive can leak from it.

## 3. Gantt View

**Change:** add `"gantt"` to `VIEWS` in `ViewTabs.tsx` (order: table, kanban, calendar, **gantt**, burndown) and a `view === "gantt"` branch in `src/app/plan/(app)/[projectId]/page.tsx`.

**Component:** `src/components/plan/GanttChart.tsx` — hand-rolled SVG/CSS grid, visually consistent with `BurndownChart`. No chart library (repo convention).

- **Rows:** tasks with `startDate` and/or `dueDate`, sorted by start (then due) date. Row label = task title + assignee avatar chip.
- **Bars:** span `startDate → dueDate`. Single-dated tasks render a 1-day chip at that date. Bar color follows the existing status color mapping; done tasks muted.
- **Axis:** auto-fits the project's min/max date range (padded), week gridlines, month labels, a **today** vertical line using `--feature-color`.
- **Overdue emphasis:** `dueDate` in the past and status ≠ done → warning-colored bar edge/marker.
- **Unscheduled strip:** tasks with no dates listed compactly below the chart so nothing disappears.
- **Interaction:** click bar/row → opens the existing `TaskDrawer` (edit for admin/editor via `canEditPlan(role)`, read-only for viewers). Hover tooltip with dates. Horizontal scroll below `md:` with a `min-w` so the axis stays legible (same pattern as the burndown fix).
- **Not in v1:** drag-to-reschedule (dates edit via the drawer).

Pure date-window math (bar geometry, axis ticks) lives in `src/lib/plan/gantt.ts` so it stays testable-by-inspection and out of the component, mirroring `burndown.ts`.

## 4. UX/UI Polish Bundle

1. **Assignee avatar chips** — new `Avatar` primitive in `ui.tsx`: initials on a color-hashed background (deterministic hash of email → hue). Used in TableView, KanbanCard, and Gantt rows.
2. **Designed empty states** — icon + one-line hint + CTA (respecting role) for: no projects, no tasks in a view, no scheduled tasks in Gantt.
3. **View-tab icons** — small inline SVG icon per tab next to its label.
4. **Per-project accent** — the project's `color` tints its detail-page header (name/badge area) via inline style, tying project identity through list → board.
5. All items verified in light + dark and at 375/768 px; tokens only; every new string added to `src/lib/plan/i18n.ts` in both languages.

## Non-goals

- Drag-rescheduling on the Gantt (v2 candidate).
- Per-project visibility/ownership — the workspace stays flat and shared; roles still gate actions only. (Any future ownership feature must add IDOR checks, per the roles spec.)
- Invite expiry/TTL — invites live until revoked or accepted. Acceptable for an invite-only single-digit-user tool.
- Removing `ALLOWED_EMAILS` — it stays as the bootstrap allow-list.

## Error handling

- Invite actions surface failures via the existing `Toaster` pattern (success / error toasts, bilingual).
- Resend API failure on invite ⇒ invite row persists, distinct toast tells the admin to use "Resend".
- Gantt with zero dated tasks ⇒ designed empty state (not a blank chart).
- Build must still pass with `DATABASE_URL` unset (placeholder guard in `src/lib/db/index.ts` untouched).

## Testing / verification

No test runner in this repo. Gate for every task: `npx tsc --noEmit`, `npm run lint`, `npm run build`, plus `env -u DATABASE_URL npm run build`. Manual verification via dev server: sidebar at 375/768/1280 px in light+dark; invite flow end-to-end (create → email → sign-in → role applied → revoke blocks); Gantt rendering with mixed dated/undated/overdue tasks; viewer read-only checks.

## Release process

1. Feature branch off `main`; implement task-by-task.
2. `/code-review` + security review on the branch; fix findings.
3. DB migration at deploy: `DATABASE_URL="…" npx drizzle-kit push` (adds `invite` table — additive, no data risk).
4. Base-deployment workflow: version bump `0.1.0` → `0.2.0`, merge to `main`, Vercel auto-deploy, post-deploy smoke check.
