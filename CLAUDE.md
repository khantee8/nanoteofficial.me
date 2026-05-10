# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Note:** This is Next.js 16 with React 19 — APIs and conventions may differ from your training data. When in doubt, read `node_modules/next/dist/docs/` or use the context7 MCP tool to fetch live docs.

## Commands

```bash
npm run dev      # dev server — http://localhost:3000
npm run build    # production build
npm run lint     # ESLint
```

## Architecture

**Multi-subdomain portfolio site** served from a single Next.js App Router app.

### Subdomain routing (`src/proxy.ts`)

Middleware rewrites `<sub>.nanoteofficial.me` → `/<sub>` internally. The four subdomains — `finance`, `cyber`, `kb`, `art` — map to `src/app/{finance,cyber,kb,art}/page.tsx`. These are preview shells, not live apps.

### Content (`src/lib/profile.ts`)

Single source of truth for all resume/portfolio data: `profile` (experience, education, skills, certs, projects) and `roadmap` (four subdomain items with status). All strings are bilingual via `type LStr = Record<"en" | "th", string>`. Edit here to update any page content.

### i18n (`src/lib/i18n.ts` + `src/lib/lang-action.ts`)

Cookie-based, server-side. `getLang()` reads the `lang` cookie in RSC. `setLang()` is a Server Action called by the `LangToggle` component. The `t()` function looks up keys from a typed dict in `i18n.ts`. All new UI strings must be added to the `UiKey` union and the `dict` object in that file.

### Feature theming (`src/app/globals.css` + `src/components/FeatureSync.tsx`)

CSS tokens (`--feature-color`, `--feature-tint`, `--feature-glow`) are defined on `:root` for the brand (indigo) and overridden per `[data-feature="finance|cyber|kb|art"]`. `FeatureSync` is a client component that sets `data-feature` on `<body>` based on `usePathname()`. Use `var(--feature-color)` in components to automatically adopt the active subdomain's accent.

### Component conventions

- All page-level components receive `lang: Lang` as a prop (read by the parent RSC via `getLang()`).
- Use `pick(lstr, lang)` to resolve a bilingual string, `t(key, lang)` for UI copy.
- New sections on the homepage follow the `<Section id="..." eyebrow={...} title={...}>` pattern.
