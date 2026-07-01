# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Note:** This is Next.js 16 with React 19 — APIs and conventions may differ from your training data. When in doubt, read `node_modules/next/dist/docs/` or use the context7 MCP tool to fetch live docs.

## Commands

```bash
npm run dev      # dev server — http://localhost:3000
npm run build    # production build
npm run lint     # ESLint
npx tsc --noEmit # type-check only
```

**Docker deployment** — build must happen on the host before starting the container:
```bash
npm run build
docker compose up -d   # runs `next start` inside the container
```

## Architecture

**Multi-subdomain portfolio site** served from a single Next.js App Router app.

### Subdomain routing (`src/proxy.ts`)

Next.js 16 treats `src/proxy.ts` as a native proxy/middleware entry point — **do not create a `middleware.ts`**, it will conflict. The proxy rewrites `<sub>.nanoteofficial.me` → `/<sub>` so that `finance.nanoteofficial.me` serves `src/app/finance/page.tsx`, and so on for `cyber`, `kb`, `art`. These are preview shells, not live apps. The build output will show `ƒ Proxy (Middleware)` confirming it is active.

If you add a new subdomain, update `subdomainMap` in `proxy.ts` and create the corresponding `src/app/<sub>/page.tsx`.

### Content (`src/lib/profile.ts`)

Single source of truth for all resume/portfolio data. `profile` holds experience, education, skills, certs, and projects. `roadmap` holds the four subdomain items. All user-facing strings use `type LStr = Record<"en" | "th", string>` — every field must have both languages. Edit only this file to update page content.

`hardSkills` is `LStr[]` (competency labels, no percentages). `certifications` is `string[]` — each entry maps to a metadata record in `Certifications.tsx` that provides vendor name, brand color, category, and an SVG logo path from `public/logos/`. When adding a cert, add both the string to the array and a `CERT_META` entry.

### i18n (`src/lib/i18n.ts` + `src/lib/lang-action.ts`)

Cookie-based, server-side. `getLang()` reads the `lang` cookie in RSC. `setLang()` is a Server Action (validated allow-list: `"en" | "th"`) called by `LangToggle`. The `t()` function is typed — every new UI string requires a new entry in the `UiKey` union **and** the `dict` object in `i18n.ts`. TypeScript will error if a key is missing from either.

Cookie is set with `httpOnly: true` and `secure: true` in production — it is only read server-side, never from client JS.

### Feature theming (`src/app/globals.css` + `src/components/FeatureSync.tsx`)

CSS tokens (`--feature-color`, `--feature-tint`, `--feature-color-strong`, `--feature-glow`) are defined on `:root` (executive navy brand default `#3B4FBF`) and overridden per `[data-feature="finance|cyber|kb|art"]`, with separate dark-mode overrides in `@media (prefers-color-scheme: dark)`.

`FeatureSync` (client component) sets `data-feature` on `<body>` via `usePathname()` for global token inheritance. Subdomain pages also set it on their own root div for SSR correctness before hydration. Use `var(--feature-color)` in any component to automatically adopt the active accent.

### Security headers (`next.config.ts`)

All HTTP security headers — CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, X-Content-Type-Options — are applied globally in `next.config.ts` via the `headers()` async function. Modify headers there, not in middleware. `poweredByHeader: false` hides the Next.js version.

CSP uses `'unsafe-inline'` on both `script-src` and `style-src`. `script-src` requires it because Next.js injects inline scripts for RSC hydration — removing it breaks all client components (React never hydrates). `style-src` requires it for Tailwind v4. Neither can be tightened without a full nonce-based CSP overhaul.

### `/plan` — auth + database workspace

`/plan` is the site's only stateful area — a private, invite-only Notion/Linear-style project-management tool. It is the site's first **authentication**, **database**, and rich **client interactivity**, and is otherwise unrelated to the static portfolio above. Full design + deployment docs live in `docs/superpowers/`.

- **Route protection without middleware.** `middleware.ts` is forbidden (conflicts with `proxy.ts`). The route group `src/app/plan/(app)/` is gated in its `layout.tsx`, which calls Auth.js `auth()` and `redirect()`s anonymous users. `src/app/plan/signin/` sits **outside** the group so it stays public. `/plan` is an apex path, not a subdomain, so `proxy.ts`/`subdomainMap` are untouched.
- **Auth** (`src/auth.ts`) — Auth.js v5 (`next-auth@beta`) magic link via the Resend provider + `@auth/drizzle-adapter`, **database** sessions. Invite-only: the `signIn` callback rejects any email not in `ALLOWED_EMAILS` (comma-separated). The Resend provider is passed `apiKey: process.env.RESEND_API_KEY` explicitly (Auth.js otherwise looks for `AUTH_RESEND_KEY`); sender is `noreply@nanoteofficial.me` (must be a verified Resend domain).
- **Database** — Neon Postgres via `@neondatabase/serverless` (`neon-http` driver) + Drizzle ORM. `src/lib/db/schema.ts` holds the Auth.js tables + `projects`/`tasks`. **`src/lib/db/index.ts` must construct `neon()` non-throwing** — it falls back to a placeholder URL when `DATABASE_URL` is unset so the build never crashes (the Drizzle adapter needs a real instance at module load, so it cannot be lazy-Proxied). Keep this invariant.
- **Data layer** (`src/lib/plan/`) — `queries.ts` (server-only reads), `actions.ts` (Server Actions for all mutations), `types.ts`, `burndown.ts` (pure, on-the-fly chart computation — no snapshots table), `dates.ts`. **Authorization is flat:** every action only enforces `requireUser()` — the MVP is a single shared workspace with no `ownerId`/tenant column. If you ever add private/per-user projects or roles, these become IDOR vectors and MUST add ownership checks (see the spec's Authorization note).
- **`/plan` i18n** (`src/lib/plan/i18n.ts`) — a **separate** dictionary from the site-wide `src/lib/i18n.ts`, because the latter imports `next/headers` (server-only) and cannot be used in client components. `pt(lang, key, vars)` is pure; server components call it directly with `getLang()`, client components use `usePlanT()` from `LangContext` (a provider fed by the layout). Sign-in (outside the provider) takes `lang` as a prop.
- **UI** (`src/components/plan/`) — shared primitives in `ui.tsx` (button/input classes, `StatusBadge`/`TypeBadge` take a translated `label`); `Toaster` (client mutation feedback), `Drawer`/`TaskDrawer`, `CommandPalette` (⌘K), `KanbanBoard` (dnd-kit). Reuses the global design tokens (`--surface`, `--border`, `--feature-color`, …) — do not hard-code colors.
- **Client view state** (table/kanban) is reset on server revalidation via a server-derived `key` prop, not a prop→state `useEffect` (the repo's ESLint flags `react-hooks/set-state-in-effect`).
- **Env vars:** `DATABASE_URL`, `AUTH_SECRET`, `ALLOWED_EMAILS`, `PLAN_ADMIN_EMAILS` (comma-separated emails auto-promoted to the `admin` role on sign-in), `RESEND_API_KEY`, `AUTH_URL` (pin to `https://nanoteofficial.me` so magic links don't point at preview URLs).

## Component conventions

- All page-level RSC components receive `lang: Lang` as a prop, read by the parent via `getLang()`.
- Use `pick(lstr, lang)` to resolve an `LStr` bilingual string; `t(key, lang)` for typed UI copy.
- New homepage sections follow `<Section id="..." eyebrow={...} title={...}>`.
- **RSC constraint:** Do not add inline event handlers (e.g. `onSubmit`, `onClick`) directly to elements in server components — they are not serializable. Use `"use client"` components for any interactivity.
- External links must include `rel="noopener noreferrer"` and `target="_blank"`.

## Key constraints

- `/kb` is intentionally excluded from `sitemap.ts` and blocked in `robots.ts` (private page).
- The `postcss` package is overridden to `>=8.5.10` in `package.json` to resolve a known advisory — do not remove the override.
- The scroll-spy IntersectionObserver in `HeaderNav.tsx` only watches sections that exist on the homepage (`about`, `company`, `experience`, `projects`, `roadmap`, `contact`) — it has no effect on subdomain pages.
- Certification vendor logos live in `public/logos/` as SVGs. Real logos (Cisco, ISC², Fortinet, Palo Alto, CompTIA) were sourced from Simple Icons CDN; others (EC-Council, PMI, ServiceNow, SEC Thailand) are hand-crafted SVGs.
- CV download files (`public/cv-en.pdf`, `public/cv-th.pdf`) are copied from `/project/Profile/` — update them there first, then copy to `public/`.
