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

### i18n (`src/lib/i18n.ts` + `src/lib/lang-action.ts`)

Cookie-based, server-side. `getLang()` reads the `lang` cookie in RSC. `setLang()` is a Server Action (validated allow-list: `"en" | "th"`) called by `LangToggle`. The `t()` function is typed — every new UI string requires a new entry in the `UiKey` union **and** the `dict` object in `i18n.ts`. TypeScript will error if a key is missing from either.

Cookie is set with `httpOnly: true` and `secure: true` in production — it is only read server-side, never from client JS.

### Feature theming (`src/app/globals.css` + `src/components/FeatureSync.tsx`)

CSS tokens (`--feature-color`, `--feature-tint`, `--feature-color-strong`, `--feature-glow`) are defined on `:root` (indigo brand default) and overridden per `[data-feature="finance|cyber|kb|art"]`, with separate dark-mode overrides in `@media (prefers-color-scheme: dark)`.

`FeatureSync` (client component) sets `data-feature` on `<body>` via `usePathname()` for global token inheritance. Subdomain pages also set it on their own root div for SSR correctness before hydration. Use `var(--feature-color)` in any component to automatically adopt the active accent.

### Security headers (`next.config.ts`)

All HTTP security headers — CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, X-Content-Type-Options — are applied globally in `next.config.ts` via the `headers()` async function. Modify headers there, not in middleware. `poweredByHeader: false` hides the Next.js version.

CSP uses `'unsafe-inline'` on both `script-src` and `style-src`. `script-src` requires it because Next.js injects inline scripts for RSC hydration — removing it breaks all client components (React never hydrates). `style-src` requires it for Tailwind v4. Neither can be tightened without a full nonce-based CSP overhaul.

## Component conventions

- All page-level RSC components receive `lang: Lang` as a prop, read by the parent via `getLang()`.
- Use `pick(lstr, lang)` to resolve an `LStr` bilingual string; `t(key, lang)` for typed UI copy.
- New homepage sections follow `<Section id="..." eyebrow={...} title={...}>`.
- **RSC constraint:** Do not add inline event handlers (e.g. `onSubmit`, `onClick`) directly to elements in server components — they are not serializable. Use `"use client"` components for any interactivity.
- External links must include `rel="noopener noreferrer"` and `target="_blank"`.

## Key constraints

- `/kb` is intentionally excluded from `sitemap.ts` and blocked in `robots.ts` (private page).
- The `postcss` package is overridden to `>=8.5.10` in `package.json` to resolve a known advisory — do not remove the override.
- The scroll-spy IntersectionObserver in `HeaderNav.tsx` only watches sections that exist on the homepage (`about`, `experience`, `projects`, `roadmap`, `contact`) — it has no effect on subdomain pages.
