# `/plan` — Project Management Workspace — Design

**Date:** 2026-06-30
**Status:** Approved (brainstorm) — pending spec review
**Project:** nanoteofficial.me (portfolio site)

## Summary

Add a private, invite-only project-management workspace at `/plan` — a small
Notion/Trello/ClickUp-style tool the owner uses for **resource management
(time / team / money)** across **multiple kinds of plans**, not just IT projects:
software builds, job-interview pipelines, travel itineraries, general planning.

This is a deliberate architectural shift. The site is currently a static,
no-database, no-auth RSC portfolio (deps: Next 16, React 19, Resend). `/plan`
introduces the site's first **authentication**, **database**, and rich
**client-side interactivity**.

## Goals

- A usable daily planning tool for the owner and a few invited collaborators.
- Generic enough to plan an IT project, a trip, or interview prep with one model.
- Roll-up visibility: master overview of all projects, per-project status overview.
- Ship a real MVP fast; sequence the heavier analytics (burndown, team load) after.

## Non-Goals

- Public sign-up / SaaS. Invite-only allowlist, small user count.
- Real-time multiplayer collaboration (no live cursors / websockets).
- Mobile-native apps. Responsive web only.
- Role hierarchy in MVP (flat editor permissions — see Permissions).

## Decisions (from brainstorm)

| Decision | Choice | Rationale |
|---|---|---|
| Users | Me + a few invited people | Real multi-user auth, shared data, per-user identity. |
| Auth | Auth.js v5 + Resend magic link, invite-only | Passwordless; Resend already a dependency; no extra paid service. |
| Database | Postgres (Neon via Vercel Marketplace) | Relational fit for projects→tasks, status/team/burndown aggregations; first-class Auth.js Drizzle adapter. |
| ORM | Drizzle | Lightweight, SQL-first, serverless-friendly, official Auth.js adapter. |
| MVP scope | Core + Calendar | Auth, Projects CRUD, master overview, Tasks CRUD, Kanban, Table, **Calendar**, status overview. |
| Phase 2 | Burndown + Team load | Deferred; schema leaves extension points. |
| Kanban DnD | `@dnd-kit` | Accessible, modern standard; hand-rolling drag is painful. |
| Permissions | Flat (all invited = editors) | YAGNI for MVP; roles deferred to Phase 2. |

## Architecture & Routing

- New route group under `src/app/plan/`.
  - `/plan` — master overview (all projects).
  - `/plan/[projectId]` — single project with view tabs (Kanban / Table / Calendar).
  - `/plan/signin` — magic-link sign-in screen.
- **Route protection without middleware.** `middleware.ts` is forbidden in this
  repo — it conflicts with `src/proxy.ts` (Next 16 proxy entry). Gate `/plan` in
  **`src/app/plan/layout.tsx`**: call Auth.js `auth()` server-side and
  `redirect()` unauthenticated users to `/plan/signin`. `/plan` is a path on the
  apex domain, not a subdomain, so `proxy.ts` and `subdomainMap` are untouched.
- **Privacy.** Exclude `/plan` from `sitemap.ts` and disallow it in `robots.ts`,
  mirroring the existing `/kb` treatment.
- **CSP.** DB access is server-side only (no new browser `connect-src`). Auth.js
  magic-link is a same-origin redirect flow. Existing `'unsafe-inline'` CSP in
  `next.config.ts` already covers client-component hydration and Tailwind v4.
  No CSP change anticipated; verify during implementation.
- Data mutations use **Server Actions** (consistent with existing `lang-action.ts`
  pattern); interactive views are `"use client"` components fed by RSC-loaded data.

## Auth (Auth.js v5 + Resend)

- `next-auth@beta` with Resend email provider + `@auth/drizzle-adapter` over Neon.
- Passwordless magic link; **database sessions**.
- **Invite-only:** a `signIn` callback rejects any email not on the allowlist.
  MVP source = `ALLOWED_EMAILS` env (comma-separated). (A DB `allowlist` table is
  a later refinement if managing emails in env gets tedious.)
- New env vars: `AUTH_SECRET`, `DATABASE_URL` (+ Neon-provided variants),
  `ALLOWED_EMAILS`. Reuse existing `RESEND_API_KEY`.
- ⚠️ **Next 16 caveat:** verify Auth.js v5 App-Router APIs against live docs
  (context7 / `node_modules`) before coding — training data may be stale.

## Data Model (Postgres + Drizzle)

**Auth.js standard tables:** `users`, `accounts`, `sessions`, `verificationTokens`.

**`projects`**
- `id` (uuid, pk), `name` (text), `type` (enum: `it | travel | interview | general`),
  `description` (text, nullable), `color` (text), `startDate` (date, nullable),
  `targetDate` (date, nullable), `archived` (boolean, default false),
  `createdAt`, `updatedAt`.

**`tasks`**
- `id` (uuid, pk), `projectId` (fk → projects, cascade delete),
  `title` (text), `description` (text, nullable),
  `status` (enum: `backlog | todo | in_progress | done`, default `backlog`),
  `assigneeId` (fk → users, nullable),
  `startDate` (date, nullable), `dueDate` (date, nullable),
  `estimateHours` (numeric, nullable), `cost` (numeric, nullable),
  `tags` (text[], default `{}`), `order` (integer — within-status ordering for Kanban),
  `createdAt`, `updatedAt`.

**Derived (no extra storage):**
- Master overview progress = `count(status='done') / count(*)` per project.
- Status overview = `count(*) group by status`.

**Phase 2 extension point:** `task_snapshots` (`projectId`, `capturedAt`,
`remainingCount`/`remainingHours`) to feed the burndown chart.

## MVP Views

- **Master overview (`/plan`):** project cards — name, type badge, progress bar
  (done/total), target date. Add / edit / remove (archive) project.
- **Kanban (`/plan/[id]`):** columns per status; `@dnd-kit` drag-and-drop updates
  `status` + `order` via a Server Action. Add task inline per column.
- **Table view:** sortable / filterable task rows; edit fields inline.
- **Calendar view:** hand-rolled month grid (matches the `company` project's
  hand-rolled-SVG ethos); tasks render on their `dueDate`; click → task detail.
- **Status overview:** count-by-status summary band on the project page.

## Phase 2 (designed for, not built)

- **Burndown chart:** hand-rolled SVG, fed by `task_snapshots` (a scheduled/manual
  snapshot writes daily remaining work).
- **Team load:** effort (`estimateHours`) grouped by `assigneeId` across active
  projects; capacity vs. allocation view. May extend assignees to named non-login
  members.
- **Roles:** owner / editor / viewer if collaboration grows.

## Testing / Verification

No test runner configured in this repo. Verify via:
- `npm run build`, `npx tsc --noEmit`, `npm run lint` (must all pass).
- Playwright (webapp-testing skill): magic-link sign-in flow, project CRUD,
  task CRUD, Kanban drag-to-status, calendar render.

## New Dependencies

`next-auth@beta`, `@auth/drizzle-adapter`, `drizzle-orm`,
`@neondatabase/serverless`, `@dnd-kit/core`, `@dnd-kit/sortable`,
`drizzle-kit` (dev).

## Open Risks

- Auth.js v5 + Next 16 API drift — mitigate with live-docs check before coding.
- Neon serverless connection handling on Vercel functions — use the
  `@neondatabase/serverless` driver (HTTP/pooled) rather than node-postgres.
- Drizzle migrations workflow (`drizzle-kit`) against Neon — establish in the
  first implementation task.
