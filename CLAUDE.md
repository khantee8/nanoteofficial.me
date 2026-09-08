# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Note:** This is Next.js 16 with React 19 — APIs and conventions may differ from your training data. When in doubt, read `node_modules/next/dist/docs/` or use the context7 MCP tool to fetch live docs. (`AGENTS.md` at the repo root carries the same warning for other agents.)

## Commands

```bash
npm run dev      # dev server — http://localhost:3000
npm run build    # production build
npm run lint     # ESLint
npx tsc --noEmit # type-check only
```

There is **no test runner** — verify changes with `tsc --noEmit`, `lint`, and `build` (all must pass).

**Docker deployment** — build must happen on the host before starting the container:
```bash
npm run build
docker compose up -d   # runs `next start` inside the container
```

## Architecture

**Multi-subdomain portfolio site** served from a single Next.js App Router app.

### Subdomain routing (`src/proxy.ts`)

Next.js 16 treats `src/proxy.ts` as a native proxy/middleware entry point — **do not create a `middleware.ts`**, it will conflict. The proxy rewrites `<sub>.nanoteofficial.me` → `/<sub>` so that `finance.nanoteofficial.me` serves `src/app/finance/page.tsx`, and so on for `cyber`, `kb`, `art`. These are preview shells, not live apps. The build output will show `ƒ Proxy (Middleware)` confirming it is active.

Adding a subdomain takes four edits, not two: `subdomainMap` in `proxy.ts`, `src/app/<sub>/page.tsx`, a `src/app/<sub>/opengraph-image.tsx`, and a `sitemap.ts` entry.

There are five `opengraph-image.tsx` routes (root + the four subdomains). Each sets `runtime = "nodejs"`, calls `getLang()` so the OG card is localized, and **hardcodes its own accent hex** — the CSS feature tokens are not available to `ImageResponse`, so the color must be duplicated there by hand.

`sitemap.ts` lists `/finance`, `/cyber`, `/art` as **path** URLs (not subdomain URLs) and deliberately omits `/kb`.

### Content (`src/lib/profile.ts`)

Single source of truth for all resume/portfolio data. `profile` holds experience, education, skills, certs, and projects. `roadmap` holds the four subdomain items. `tools` + `toolEdges` hold the internal-toolchain graph (see below). All user-facing strings use `type LStr = Record<"en" | "th", string>` — every field must have both languages. Edit only this file to update page content.

`hardSkills` is `LStr[]` (competency labels, no percentages). `certifications` is `string[]` — each entry maps to a metadata record in `Certifications.tsx` that provides vendor name, brand color, category, and an SVG logo path from `public/logos/`. When adding a cert, add both the string to the array and a `CERT_META` entry.

### i18n (`src/lib/i18n.ts` + `src/lib/lang-action.ts`)

Cookie-based, server-side. `getLang()` reads the `lang` cookie in RSC. `setLang()` is a Server Action (validated allow-list: `"en" | "th"`) called by `LangToggle`. The `t()` function is typed — every new UI string requires a new entry in the `UiKey` union **and** the `dict` object in `i18n.ts`. TypeScript will error if a key is missing from either.

Cookie is set with `httpOnly: true` and `secure: true` in production — it is only read server-side, never from client JS.

### Feature theming (`src/app/globals.css` + `src/components/FeatureSync.tsx`)

CSS tokens (`--feature-color`, `--feature-tint`, `--feature-color-strong`, `--feature-glow`) are defined on `:root` (executive navy brand default `#3B4FBF`) and overridden per `[data-feature="finance|cyber|kb|art"]`, with separate dark-mode overrides under `html.dark` (class-based, not a media query).

`FeatureSync` (client component) sets `data-feature` on `<body>` via `usePathname()` for global token inheritance. Subdomain pages also set it on their own root div for SSR correctness before hydration. Use `var(--feature-color)` in any component to automatically adopt the active accent.

**Light/dark is a separate axis** from the feature accent. `globals.css` maps Tailwind's `dark:` variant to a class via `@custom-variant dark (&:where(html.dark, ...))`; `ThemeToggle` (in the header) toggles the `html.dark` class and persists to `localStorage("theme")`. A blocking inline `themeScript` in `layout.tsx` (`dangerouslySetInnerHTML`) applies the class pre-hydration to avoid a flash — it is one of the inline scripts the CSP `'unsafe-inline'` covers.

### Security headers (`next.config.ts`)

All HTTP security headers — CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, X-Content-Type-Options — are applied globally in `next.config.ts` via the `headers()` async function. Modify headers there, not in middleware. `poweredByHeader: false` hides the Next.js version.

CSP uses `'unsafe-inline'` on both `script-src` and `style-src`. `script-src` requires it because Next.js injects inline scripts for RSC hydration — removing it breaks all client components (React never hydrates). `style-src` requires it for Tailwind v4. Neither can be tightened without a full nonce-based CSP overhaul.

The policy is `default-src 'self'`, so **any new external embed, fetch, or asset host needs a matching directive added**. The existing allowances are feature-specific, not generic — each exists for exactly one caller:

| Directive | Exists for |
|---|---|
| `frame-src https://company.nanoteofficial.me` | the `<iframe>` in `Company.tsx` |
| `connect-src https://api.resend.com` | the Resend call in the contact route |
| `font-src https://fonts.gstatic.com` | `next/font/google` in `layout.tsx` |

### Contact form (`src/app/api/contact/route.ts`)

The site's **only server code** and **only env-dependent feature**. `ContactForm.tsx` (`"use client"`) POSTs `{name, email, message}` to `/api/contact`, which length-validates each field and sends the message via **Resend** (`from: contact@nanoteofficial.me`, `replyTo` = the sender). It reads the **only two env vars in the codebase**: `RESEND_API_KEY` and `CONTACT_EMAIL` (recipient; falls back to a hardcoded address if unset). Everything else on the site is static — no database, no auth, no other runtime dependencies (`resend` is the sole non-React/Next runtime dependency).

### Tools section (`#tools`) — the internal-toolchain map

Added v0.5.0, became a map in v0.6.0. Renders the shipped `khantee8` systems
(`company, thai-funds-mcp, plan, exam, cyber, kb, finance`) as a connection graph
rather than a card grid — the point of these systems is that they interlock.
`art` is on the map too, but as the one `planned` node (v0.8.0).

Three pieces: `tools` + `toolEdges` in `profile.ts` (data), `graph-layout.ts`
(placement), `ToolsMap.tsx` (`"use client"` SVG renderer).

`layoutGraph` places nodes by **longest path**, not shortest. This matters: the
portfolio links directly to both `kb` and `company` *and* `kb` feeds `company`,
so shortest-path would put them in the same column and draw a backwards-looking
arrow. Don't "simplify" it to a BFS.

Maturity is stated honestly and drives colour via `--tool-production` /
`--tool-minimal` / `--tool-shell` / `--tool-planned` (defined in both themes in
`globals.css`). `finance` is marked `shell` because it has no persistence and a
stubbed endpoint; the roadmap copy was corrected in v0.5.0 to match.

**The `planned` tier is load-bearing, not decorative.** A `planned` tool has no
entry in `toolGraphs`, no `href`, and is drawn dashed and non-clickable — that is
what lets `art` appear on the map without an invented architecture behind it.
`Tools.tsx` derives all three behaviours from the data (`withGraph` filters the
drill-in views; `drillable`/`dashed` come from the maturity), so adding another
unbuilt system is a data edit alone. If you ever give `art` a real graph, delete
the `planned` marking in the same commit — the tier exists to be honest, and a
`planned` node with a drill-in would be worse than no tier at all.

**Duplication to keep in mind:** the authoritative architecture model —
nodes, edges, protocols, plus a private layer of env var names and schedules —
lives in the **private** repo `khantee8/tools.nanoteofficial.me`
(→ https://tools.nanoteofficial.me), which renders the same map plus a page per
system. This repo carries only public-safe summary data and its own renderer. If
a system's connections change, both need updating. Never copy configuration
detail (env var names, admin routes, gate locations) into this public repo.

### /plan — migrated out (2026-07-22)

The plan workspace now lives in its own repo/deployment:
`khantee8/plan.nanoteofficial.me` → https://plan.nanoteofficial.me.
This repo keeps a permanent redirect (`/plan/:path*` → the subdomain) in
`next.config.ts` and no longer contains auth, database, or Anthropic code.
Pre-migration history: this repo's git log through v0.2.9.

## Component conventions

- All page-level RSC components receive `lang: Lang` as a prop, read by the parent via `getLang()`.
- Use `pick(lstr, lang)` to resolve an `LStr` bilingual string; `t(key, lang)` for typed UI copy.
- New homepage sections follow `<Section id="..." eyebrow={...} title={...}>`.
- **RSC constraint:** Do not add inline event handlers (e.g. `onSubmit`, `onClick`) directly to elements in server components — they are not serializable. Use `"use client"` components for any interactivity.
- External links must include `rel="noopener noreferrer"` and `target="_blank"`.

## Key constraints

- `/kb` is intentionally excluded from `sitemap.ts` and blocked in `robots.ts` (private page). `/plan` is a permanent redirect (`next.config.ts`) to `plan.nanoteofficial.me`, not a page on this site.
- The `postcss` package is overridden to `>=8.5.10` in `package.json` to resolve a known advisory — do not remove the override.
- The scroll-spy IntersectionObserver in `HeaderNav.tsx` only watches sections that exist on the homepage (`about`, `company`, `roadmap`, `tools`, `experience`, `projects`, `contact`) — it has no effect on subdomain pages.
- Homepage sections alternate tinted/plain via the `band` prop. Reordering sections means swapping `band` flags too, or the rhythm breaks. Current nav and section order is `about → company → roadmap (Builds) → tools → experience → projects → contact`.
- The `art` preview shell describes a system with no repo and no deployment. This is a known, deliberate choice by the owner — raised and declined; do not "fix" it unprompted.
- **`/cyber` is now a mock of a system that really exists.** `cyber.nanoteofficial.me` shipped v1.0.0 on 2026-09-08, and as of v0.8.0 the roadmap card is marked `Live` and links straight to it. The `src/app/cyber/page.tsx` shell — with its hand-written fake CVE feed — was deliberately left in place; retiring it the way `/plan` was retired is open, unscheduled work. Do not present its fake feed as real data.
- Certification vendor logos live in `public/logos/` as SVGs. Real logos (Cisco, ISC², Fortinet, Palo Alto, CompTIA) were sourced from Simple Icons CDN; others (EC-Council, PMI, ServiceNow, SEC Thailand) are hand-crafted SVGs.
- CV download files (`public/cv-en.pdf`, `public/cv-th.pdf`) are copied from `/project/Profile/` — update them there first, then copy to `public/`. `/project/Profile/` is **not** tracked by git, so a deployed PDF's only durable history is this repo's commits on `public/`.

## Releases

Vercel auto-deploys from `main`. A release is:

1. Bump `package.json` **and** the two top-level `version` fields in `package-lock.json` together — the lock has silently drifted before (it sat at 0.2.9 through the 0.3.0 release).
2. Verify: `npx tsc --noEmit`, `npm run lint`, `npm run build` — all three must pass; there is no test runner.
3. Commit as `feat: vX.Y.Z — …` (or `fix:` for a patch), then annotated tag `git tag -a vX.Y.Z`.
4. Push `main` and the tag; confirm production actually serves the change before calling it done (e.g. checksum a changed asset against the local file).
