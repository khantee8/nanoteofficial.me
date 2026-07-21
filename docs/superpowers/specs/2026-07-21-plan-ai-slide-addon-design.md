# `/plan` — AI Slide Generator add-on (design)

**Date:** 2026-07-21
**Status:** Implemented

## What this is

An add-on to the existing `/plan` project-management tool: a **✦ AI Slide**
button on each project's page that one-click-generates a slide deck for that
project via a 4-step anti-slop pipeline on Claude Sonnet 5, with per-project
version history and PPTX/PDF export.

This is a **port**, not a new design — the slide engine (deck model,
anti-slop linter, generation pipeline, 3 themes, PPTX export) was designed,
built, reviewed, and shipped first in the `company.nanoteofficial.me` repo as
its own `/plan` module (v1.14.0). See that repo's
`docs/superpowers/specs/2026-07-19-v114-plan-ai-slide-generator-design.md`
and `docs/superpowers/plans/2026-07-19-v114-plan-ai-slide-generator.md` for
the underlying feature design, pipeline rationale, and anti-slop rules. This
document covers only what's different about integrating it **here**, into an
existing Drizzle + Auth.js + Server-Actions app instead of a bespoke
cookie-auth admin console.

## Why the integration is smaller here than the original build

The original `/plan` module had to build its own admin login, its own
Postgres tables for "plans," and its own migration route, because the
company app had no equivalent. This app already has all of that:

- **No new "plan" entity.** The existing `project` row already is the plan —
  its name, description, and task list. One new table, `deck_version`, just
  versions decks per `projectId` (FK to `project`, cascade delete).
- **No new auth.** Reuses the existing `auth()` session + role system
  (`admin`/`editor`/`viewer`) already gating every `/plan/(app)/*` page.
  Generating a deck requires `editor` or `admin` (mirrors `requireEditor()`);
  viewing/exporting an existing deck requires only a signed-in session.
- **No new migration route.** Schema changes go through this repo's existing
  `drizzle-kit push` flow (see root `CLAUDE.md`), not a bespoke
  `Bearer $CRON_SECRET` endpoint.
- **The brief is derived, not authored.** Instead of a user typing a plan
  brief from scratch, `buildProjectBrief()` (`src/lib/plan/decks.ts`) turns
  the project's existing name, description, and tasks (grouped by status)
  into the pipeline's brief, recomputed fresh on every generate. The wizard's
  "extra context" field still lets a user add anything the project data
  doesn't capture. **This means project data — including task titles — is
  sent to the Anthropic API when a user clicks generate.**

## What's new here

- **Schema:** `deckVersion` table (`src/lib/db/schema.ts`) — `id`,
  `projectId` (FK), `versionNo`, `deckJson`, `metaJson`, `createdBy` (FK to
  `user`, nullable), `createdAt`; unique on `(projectId, versionNo)`.
- **Data layer:** `src/lib/plan/decks.ts` — `listDeckVersions`,
  `getDeckVersion`, `addDeckVersion`, `buildProjectBrief`. Follows the
  existing `queries.ts` pattern (server-only reads); the version-number
  bump reads-then-inserts (same non-atomic tradeoff the source app accepted
  at single-admin scale — a concurrent double-generate on one project would
  throw on the unique constraint, not corrupt data).
- **Slide engine** (`src/lib/slides/`): `deck.ts`, `slopLint.ts`,
  `prompts.ts`, `pptx.ts` ported verbatim (zero repo-specific imports in the
  source). `cost.ts` is a trimmed single-model version (just
  `claude-sonnet-5` pricing — this repo has no other agent models to price).
  `claude.ts` is a new, minimal `completeRaw()` wrapper (plain streamed
  Messages call + 429/5xx retry) — the source app's version also handled
  `web_search`/MCP/batches, none of which this integration needs.
- **UI** (`src/components/plan/slides/`): `DeckRenderer` + `deck-themes.css`
  ported verbatim (self-contained hex palettes, no clash with this app's
  `--feature-color` tokens). `GenerateWizard`/`ThinkingPane`/
  `VersionSwitcher`/`ExportButtons` ported and adapted to this repo's
  `usePlanT()` i18n hook and the `deckVersion` row's camelCase columns.
  `SlidesPanel` is the Manus-split orchestrator (was `PlanDetail` in the
  source) — simplified to read its initial state from the server page
  instead of self-fetching, since the SSE `done` event already carries
  everything a new version needs (no separate list-refresh route required).
  `SlidesLink` is the actual **✦ AI Slide** button, placed next to
  `ProjectActions` on the project page.
- **Print scoping:** this app's `/plan` chrome (sidebar, mobile topbar,
  command palette, toaster) is more varied than the source app's single
  `<nav>`, so printing uses an isolation root (`.print-root` — everything
  hidden, only the deck made visible again) instead of hiding named chrome
  elements one by one.
- **Routes:** `GET /plan/[projectId]/slides` (page, inherits the existing
  `(app)/layout.tsx` auth gate) and two API routes,
  `POST /api/plan/[projectId]/generate` (SSE) and
  `GET /api/plan/[projectId]/export` (PPTX), both re-checking `auth()`
  directly since Route Handlers aren't covered by the page-group layout gate.

## Deployment

- **New dependencies:** `@anthropic-ai/sdk`, `pptxgenjs`.
- **New env var:** `ANTHROPIC_API_KEY` (Vercel project for
  `nanoteofficial.me`) — everything else (`DATABASE_URL`, Auth.js) already
  exists.
- **New DB column:** apply via the existing documented flow —
  `DATABASE_URL="…" npx drizzle-kit push` — against production once the env
  var is set. Until both are done, the button and page render, but generate
  and export fail (auth/schema errors, not crashes).
- Build verified both with `.env.local` present and with `DATABASE_URL`
  unset (this repo's explicit CI-equivalent gate).

## Out of scope

Moving this to its own subdomain/path outside `/plan`; a stored per-project
"audience" field (the wizard's audience input isn't persisted, matching how
little friction the one-click flow should have); multi-language deck
*content* (only the UI chrome is bilingual — decks are written in whatever
language the project's own data is in).
