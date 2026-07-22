# /plan → plan.nanoteofficial.me Migration

**Date:** 2026-07-22
**Repos:** `nanoteofficial.me` (source, gets cleanup) + `plan.nanoteofficial.me` (new)
**Status:** approved, pending implementation plan

## Motivation

`/plan` has outgrown its host. It is the portfolio site's only stateful area — auth (Auth.js
magic link), database (Neon + Drizzle), Server Actions, an AI slide generator with an
Anthropic dependency — embedded in an otherwise static marketing site. Consequences today:
9 heavy dependencies bloat the portfolio build; the marketing `Header`/`Footer` wrap the
tool (the known double-top-chrome bug on mobile); and every portfolio deploy redeploys the
tool. Migrating `/plan` to its own repo + Vercel project + subdomain gives it an independent
deploy cadence, a clean layout, and returns the portfolio to a lean static site.

Non-goals: no feature changes to the plan tool itself; no data migration (fresh database
was chosen deliberately); no change to the other subdomains or the proxy behavior for them.

## Approved decisions

1. **URL structure:** root paths on the new subdomain (`plan.nanoteofficial.me/` = projects,
   `/signin`, `/admin`, `/[projectId]`, `/[projectId]/slides`). Routes are renamed during
   migration — no `/plan` prefix in the new app.
2. **Apex `/plan`:** permanent redirect. `nanoteofficial.me/plan/:path*` →
   `https://plan.nanoteofficial.me/:path*` (308) via `next.config.ts` `redirects()`. Plan
   code is fully deleted from the portfolio repo.
3. **Database:** fresh Neon project. New `DATABASE_URL`; schema applied with one
   `drizzle-kit push`. The old Neon DB is left untouched (archive/delete later at will).
   All users re-sign-in and re-create workspace content; this is accepted. Side benefit:
   retires the pending old-Neon password-rotation item.
4. **Infra split:** the assistant creates the GitHub repo (`gh`) and pushes; the user does
   4 dashboard steps (Vercel import, Vercel domain, Neon + env vars, Namecheap CNAME);
   the assistant verifies everything after.
5. **Repo creation approach:** fresh repo with a clean scaffold and one documented initial
   commit (approach A). Line-by-line history remains in the portfolio repo permanently; no
   `filter-repo` extraction.

## New repo: `khantee8/plan.nanoteofficial.me`

Local path: `/project/src/plan.nanoteofficial.me` (independent git repo nested under
`src/`, same as finance/company/thai-funds-mcp). Stack: Next.js 16 (App Router), React 19,
TypeScript, Tailwind v4 — same versions as the portfolio (copy dependency pins).

### Route mapping

| Portfolio (old) | New repo |
|---|---|
| `src/app/plan/(app)/layout.tsx` | `src/app/(app)/layout.tsx` (auth gate, unchanged pattern) |
| `src/app/plan/(app)/page.tsx` | `src/app/(app)/page.tsx` |
| `src/app/plan/(app)/admin/page.tsx` | `src/app/(app)/admin/page.tsx` |
| `src/app/plan/(app)/[projectId]/page.tsx` | `src/app/(app)/[projectId]/page.tsx` |
| `src/app/plan/(app)/[projectId]/slides/page.tsx` | `src/app/(app)/[projectId]/slides/page.tsx` |
| `src/app/plan/signin/page.tsx` | `src/app/signin/page.tsx` (public, outside the gate) |
| `src/app/api/plan/[projectId]/generate/route.ts` | `src/app/api/[projectId]/generate/route.ts` |
| `src/app/api/plan/[projectId]/export/route.ts` | `src/app/api/[projectId]/export/route.ts` |
| `src/app/api/auth/[...nextauth]/route.ts` | unchanged path |
| `src/components/plan/**` (incl. `slides/`) | `src/components/**` |
| `src/lib/plan/**` | `src/lib/**` |
| `src/lib/slides/**` | `src/lib/slides/**` (unchanged) |
| `src/lib/db/**` | `src/lib/db/**` (unchanged) |
| `src/auth.ts`, `src/types/next-auth.d.ts` | unchanged paths |
| `drizzle.config.ts` | unchanged path |

**No `proxy.ts` / no middleware.** The subdomain IS the app; route protection stays in
`(app)/layout.tsx` via `auth()` + `redirect('/signin')` exactly as today.

### Code adaptations (mechanical)

- Imports: `@/components/plan/*` → `@/components/*`; `@/lib/plan/*` → `@/lib/*` (`actions.ts`,
  `queries.ts`, `types.ts`, `decks.ts`, `burndown.ts`, `gantt.ts`, `dates.ts`,
  `invite-email.ts` merge into `lib/` at the top level). **Naming collision resolved:** the
  two i18n modules keep distinct names — the site's cookie module (`getLang`/`setLang`/`Lang`)
  is copied as `src/lib/lang.ts`; the plan dictionary (`pt`/`PlanKey`/`usePlanT` source)
  becomes `src/lib/i18n.ts`. All imports updated accordingly.
- Fetch URLs in client components: `/api/plan/${id}/generate|export` → `/api/${id}/…`.
- Internal links: `/plan/...` → `/...` (`SlidesLink`, back-links, sidebar, redirects in
  actions, `signIn`/`signOut` callback URLs).
- **Root layout** (`src/app/layout.tsx`): minimal — `<html>` with lang from cookie, font
  variables (`slideFontVars` for decks + the app's UI font), `LangProvider`, `Toaster`,
  page `children`. **No marketing Header/Footer** (fixes the double-top-chrome bug).
- Copied shared pieces: `getLang`/`setLang` cookie module (as `src/lib/lang.ts`),
  `LangToggle` component, and the design-token block from the portfolio `globals.css`
  (`--background`, `--surface`, `--border`, `--muted*`, `--feature-color*` set to the plan
  navy, plus dark-mode overrides). Tailwind v4 setup identical.
- `next.config.ts`: same global security headers as the portfolio (CSP with
  `'unsafe-inline'` script/style — same Next.js constraint applies), `poweredByHeader:
  false`. No rewrites/redirects needed.
- `robots.ts`: `disallow: /` for all agents (entire app is private). No `sitemap.ts`.
- Auth: `AUTH_URL=https://plan.nanoteofficial.me`; generate a **new** `AUTH_SECRET`.
  Invite-email builder uses the new origin for its links.
- `package.json`: only the deps plan actually uses — `next`, `react`, `react-dom`,
  `next-auth@beta`, `@auth/drizzle-adapter`, `@neondatabase/serverless`, `drizzle-orm`,
  `resend`, `@anthropic-ai/sdk`, `pptxgenjs`, `@dnd-kit/core`, `@dnd-kit/sortable`; dev:
  `typescript`, `eslint`, `eslint-config-next`, `tailwindcss`, `@tailwindcss/postcss`,
  `drizzle-kit`, types. Keep the `postcss >= 8.5.10` override.
- Docs: copy the plan-related `docs/superpowers/` specs/plans into the new repo's
  `docs/superpowers/` for reference; write a new `CLAUDE.md` for the repo.

### Build invariants carried over

- `src/lib/db/index.ts` stays non-throwing with `DATABASE_URL` unset;
  `env -u DATABASE_URL npm run build` must pass.
- No test runner; gate is `npx tsc --noEmit` + `npm run lint` + both builds.
- Typed bilingual i18n (`en` + `th` required per key).
- No middleware file, ever (route-group gating only).

## Portfolio repo cleanup (release v0.3.0)

- Delete: `src/app/plan/`, `src/app/api/plan/`, `src/app/api/auth/`,
  `src/components/plan/`, `src/lib/plan/`, `src/lib/slides/`, `src/lib/db/`,
  `src/auth.ts`, `src/types/next-auth.d.ts`, `drizzle.config.ts`.
- `package.json`: remove `@anthropic-ai/sdk`, `@auth/drizzle-adapter`, `@dnd-kit/core`,
  `@dnd-kit/sortable`, `@neondatabase/serverless`, `drizzle-orm`, `next-auth`, `pptxgenjs`,
  `resend`, and dev `drizzle-kit`. Keep the postcss override.
- `next.config.ts`: add `redirects()` → `/plan/:path*` → `https://plan.nanoteofficial.me/:path*`,
  `permanent: true`.
- `robots.ts`: remove the `/plan` disallow (path now redirects). `/kb` stays.
- `src/lib/i18n.ts`: prune plan-only keys if any exist in the site dict (site `t()` and
  plan `pt()` are separate dictionaries, so expected: none).
- Update `src/nanoteofficial.me/CLAUDE.md` (remove the `/plan` architecture section, note
  the redirect) and `/project/CLAUDE.md` (add the new project's section).
- Vercel env cleanup (user, later, optional): the old project's `DATABASE_URL`,
  `AUTH_SECRET`, `ALLOWED_EMAILS`, `PLAN_ADMIN_EMAILS`, `RESEND_API_KEY`, `AUTH_URL`,
  `ANTHROPIC_API_KEY` become unused and can be removed.

## Infra checklist

Assistant does:
1. `gh repo create khantee8/plan.nanoteofficial.me --private` + push `main`.
2. Generate `AUTH_SECRET` (`openssl rand -base64 33`) and hand it over with the env list.

User does (dashboards):
1. **Vercel:** Add New Project → import `khantee8/plan.nanoteofficial.me` (defaults fine).
2. **Vercel → Domains:** add `plan.nanoteofficial.me`.
3. **Neon:** create a new project/database; copy the pooled connection string. **Vercel →
   Env Vars (Production + Preview):** `DATABASE_URL`, `AUTH_SECRET` (provided),
   `ALLOWED_EMAILS`, `PLAN_ADMIN_EMAILS`, `RESEND_API_KEY` (same key as today),
   `AUTH_URL=https://plan.nanoteofficial.me`, `ANTHROPIC_API_KEY` (same key). Redeploy.
4. **Namecheap:** add CNAME record `plan` → `cname.vercel-dns.com`.

Then assistant (or user) runs the one-time schema apply:
`DATABASE_URL="<new-neon-url>" npx drizzle-kit push` from the new repo.

## Sequencing (safe order)

1. Build the new repo locally to green (all gates) — portfolio untouched, `/plan` still live.
2. Push new repo; user does infra steps; verify `plan.nanoteofficial.me` serves + signin works.
3. Only then ship the portfolio cleanup release (delete + redirect). Zero-downtime cutover;
   the only overlap window has both copies live, which is harmless (separate DBs).

## Verification

- New repo: `tsc`, `lint`, `build`, `env -u DATABASE_URL build` all green; local dev boots;
  `/` 307→`/signin` anonymous; `/signin` 200.
- Post-deploy: `https://plan.nanoteofficial.me` 307→`/signin`; magic-link sign-in works
  (user manual — needs email); create a project; generate a slide deck (confirms
  `ANTHROPIC_API_KEY` + DB writes); PPTX export.
- Portfolio after cleanup: all four gates green; `https://nanoteofficial.me/plan` →
  308 → `https://plan.nanoteofficial.me/`; homepage + subdomains unaffected; bundle no
  longer contains next-auth/drizzle/pptxgenjs.

## Risks / tradeoffs

- **Fresh DB means data loss by choice** — existing projects/tasks/decks stay only in the
  old Neon DB. Mitigation: old DB is preserved; a manual copy remains possible later.
- **Invite emails already sent** point at `nanoteofficial.me/plan/...` — the 308 redirect
  forwards them; the Auth.js token verification happens on the new domain and will fail for
  tokens minted by the old deployment (different secret + DB). Accepted: re-invite.
- **DNS propagation** for the new CNAME may take up to an hour; sequencing keeps the old
  `/plan` live until the new domain is verified.
- **Copy drift**: design tokens and `getLang` are now duplicated between repos (deliberate —
  the repos are independent; a shared package is overkill for two small files).
