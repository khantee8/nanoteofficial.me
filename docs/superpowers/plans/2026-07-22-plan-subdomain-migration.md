# /plan → plan.nanoteofficial.me Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the `/plan` workspace (projects/tasks/invites/AI slides) from the portfolio repo into its own repo `khantee8/plan.nanoteofficial.me`, deployed as its own Vercel project at `https://plan.nanoteofficial.me` with root-path URLs and a fresh Neon DB, then strip the portfolio back to a static site with a permanent `/plan` redirect.

**Architecture:** Fresh new repo (approach A) at `/project/src/plan.nanoteofficial.me`; the plan code is copied in with mechanical path/import renames (`app/plan/(app)` → `app/(app)`, `@/lib/plan/*` → `@/lib/*`, `@/components/plan/*` → `@/components/*`, `/api/plan/*` → `/api/*`, `/plan/...` links → `/...`). The i18n name collision is resolved by copying the site cookie module as `src/lib/lang.ts` and promoting the plan dictionary to `src/lib/i18n.ts`. Auth gating stays in `(app)/layout.tsx` (no middleware/proxy). Cutover is sequenced zero-downtime: new repo green → deployed + verified → only then portfolio cleanup ships.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, Auth.js v5 (`next-auth@beta`) + Resend magic link, Neon Postgres + Drizzle, `@anthropic-ai/sdk`, `pptxgenjs`, dnd-kit.

**Reference spec:** `docs/superpowers/specs/2026-07-22-plan-subdomain-migration-design.md` (in the portfolio repo).

## Global Constraints

- **Source repo:** `/project/src/nanoteofficial.me` (read-only until Task 8). **New repo:** `/project/src/plan.nanoteofficial.me` (independent git repo; never nest it inside the portfolio repo's git).
- **No test runner in either repo.** Gate per task: `npx tsc --noEmit` + `npm run lint`; full gate additionally `npm run build` **and** `env -u DATABASE_URL npm run build` (the `src/lib/db/index.ts` non-throwing fallback must keep both builds green).
- **No `middleware.ts` and no `proxy.ts` in the new repo.** Route protection lives in `src/app/(app)/layout.tsx` via `auth()` + `redirect("/signin")`.
- **New-repo i18n module names (binding):** `src/lib/lang.ts` = cookie module (`Lang`, `LANG_COOKIE`, `DEFAULT_LANG`, `getLang`); `src/lib/lang-action.ts` = `setLang` Server Action; `src/lib/i18n.ts` = the plan dictionary (`pt`, `PlanKey`, `statusKey`, `typeKey`, `roleKey`). Both `en` + `th` required per key.
- **New-repo URLs (binding):** `/` projects, `/signin`, `/admin`, `/[projectId]`, `/[projectId]/slides`, `/api/[projectId]/generate`, `/api/[projectId]/export`, `/api/auth/[...nextauth]`.
- **Env names (new Vercel project):** `DATABASE_URL`, `AUTH_SECRET` (newly generated), `ALLOWED_EMAILS`, `PLAN_ADMIN_EMAILS`, `RESEND_API_KEY`, `AUTH_URL=https://plan.nanoteofficial.me`, `ANTHROPIC_API_KEY`.
- **Fresh DB:** never point the new repo at the old Neon `DATABASE_URL`. Schema applied once via `DATABASE_URL="<new>" npx drizzle-kit push`.
- **Portfolio cleanup (Task 8+) must not start** until Task 7 confirms `https://plan.nanoteofficial.me` serves and signs in.
- Commit messages end with: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

### Task 1: Scaffold the new repo to a green build

**Files:**
- Create: `/project/src/plan.nanoteofficial.me/` — `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.gitignore`, `src/app/layout.tsx`, `src/app/page.tsx` (placeholder), `src/app/globals.css`, `src/app/robots.ts`

**Interfaces:**
- Produces: a compiling Next.js 16 skeleton whose configs later tasks rely on; `src/app/globals.css` with the design tokens (`--background`, `--foreground`, `--surface`, `--border`, `--muted`, `--muted-soft`, `--feature-color`, `--feature-tint`, `--feature-color-strong`, `--feature-glow`) available to every component; path alias `@/*` → `./src/*`.

- [ ] **Step 1: Create the directory and git repo**

```bash
mkdir -p /project/src/plan.nanoteofficial.me
cd /project/src/plan.nanoteofficial.me
git init -b main
```

- [ ] **Step 2: Copy configs from the portfolio and adapt**

Copy these files verbatim from `/project/src/nanoteofficial.me/`: `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`, `.gitignore`, `next.config.ts`.
Then edit:
- `next.config.ts`: keep `headers()` (all security headers incl. CSP) and `poweredByHeader: false` unchanged; the portfolio has no redirects/rewrites to remove.
- Write `package.json` (versions copied from the portfolio's current `package.json` — pin identically):

```json
{
  "name": "plan.nanoteofficial.me",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.112.4",
    "@auth/drizzle-adapter": "^1.11.2",
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@neondatabase/serverless": "^1.1.0",
    "drizzle-orm": "^0.45.2",
    "next": "^16.2.9",
    "next-auth": "^5.0.0-beta.31",
    "pptxgenjs": "^4.0.1",
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "resend": "^6.12.3"
  },
  "overrides": {
    "postcss": ">=8.5.10"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "drizzle-kit": "^0.31.10",
    "eslint": "^9",
    "eslint-config-next": "^16.2.9",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

- [ ] **Step 3: globals.css — Tailwind + tokens**

Copy `/project/src/nanoteofficial.me/src/app/globals.css` to `src/app/globals.css`, then prune: keep the Tailwind `@import`, the `:root` token block, the `@media (prefers-color-scheme: dark)` overrides, and base element styles; delete every `[data-feature=...]` override block (the plan app uses the default navy tokens only) and any rule whose selector targets portfolio-only components (grep the kept selectors against the plan component classes if unsure — plan components use Tailwind utilities + `var(--*)` tokens, not bespoke classes).

- [ ] **Step 4: Minimal app shell (placeholder)**

`src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NaNote Plan",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
```
(The `lang` attribute becomes dynamic in Task 4 when `getLang` exists.)

`src/app/page.tsx` (placeholder, replaced in Task 4):
```tsx
export default function Home() {
  return <main className="p-8">plan.nanoteofficial.me — scaffold</main>;
}
```

`src/app/robots.ts`:
```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
```

- [ ] **Step 5: Install and verify**

```bash
npm install
npx tsc --noEmit && npm run lint && npm run build && env -u DATABASE_URL npm run build
```
Expected: all pass (placeholder app).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: scaffold plan.nanoteofficial.me (Next.js 16 skeleton, tokens, robots disallow)"
```

---

### Task 2: Port the libraries (`lib/`, `auth.ts`, types, drizzle config)

**Files (all in the new repo; sources from `/project/src/nanoteofficial.me/`):**
- Create: `src/lib/lang.ts` (new, pruned copy), `src/lib/lang-action.ts` (copy, import rewired)
- Copy: `src/lib/db/{index.ts,schema.ts}`, `src/lib/slides/*` (all 10 files), `drizzle.config.ts`, `src/types/next-auth.d.ts`, `src/auth.ts`
- Copy with rename: `src/lib/plan/{actions,queries,types,decks,burndown,gantt,dates,invite-email}.ts` → `src/lib/<same-name>.ts`; `src/lib/plan/i18n.ts` → `src/lib/i18n.ts`

**Interfaces:**
- Consumes: scaffold configs (Task 1).
- Produces: `@/lib/lang` (`getLang(): Promise<Lang>`, `Lang`, `LANG_COOKIE`, `DEFAULT_LANG`), `@/lib/lang-action` (`setLang(lang: Lang)`), `@/lib/i18n` (`pt(lang, key, vars?)`, `PlanKey`, `statusKey`, `typeKey`, `roleKey`), `@/lib/{actions,queries,types,decks,...}`, `@/lib/db`, `@/lib/slides/*`, `@/auth` (`handlers`, `auth`, `signIn`, `signOut`) — the exact import paths Tasks 3–4 use.

- [ ] **Step 1: Copy the untouched trees**

```bash
SRC=/project/src/nanoteofficial.me; DST=/project/src/plan.nanoteofficial.me
mkdir -p $DST/src/lib/db $DST/src/lib/slides $DST/src/types
cp $SRC/src/lib/db/index.ts $SRC/src/lib/db/schema.ts $DST/src/lib/db/
cp $SRC/src/lib/slides/*.ts $DST/src/lib/slides/
cp $SRC/drizzle.config.ts $DST/
cp $SRC/src/types/next-auth.d.ts $DST/src/types/
cp $SRC/src/auth.ts $DST/src/
for f in actions queries types decks burndown gantt dates invite-email; do
  cp $SRC/src/lib/plan/$f.ts $DST/src/lib/$f.ts
done
cp $SRC/src/lib/plan/i18n.ts $DST/src/lib/i18n.ts
cp $SRC/src/lib/lang-action.ts $DST/src/lib/
```

- [ ] **Step 2: Write `src/lib/lang.ts`** (pruned from the portfolio's `src/lib/i18n.ts` — cookie parts only, the site `t()`/`UiKey`/`dict` stay behind):

```ts
import { cookies } from "next/headers";

export type Lang = "en" | "th";

export const LANG_COOKIE = "lang";
export const DEFAULT_LANG: Lang = "en";

export async function getLang(): Promise<Lang> {
  const store = await cookies();
  const v = store.get(LANG_COOKIE)?.value;
  return v === "th" ? "th" : DEFAULT_LANG;
}
```
(Before writing, open the portfolio's `src/lib/i18n.ts` `getLang` body and mirror it exactly — if it differs from the above, the portfolio version wins.)

- [ ] **Step 3: Rewire imports inside the copied lib files** (ordered — site-i18n first, then plan-i18n, then plan-lib):

```bash
cd /project/src/plan.nanoteofficial.me/src
# 1. site cookie module -> @/lib/lang  (files importing Lang/getLang from "@/lib/i18n")
grep -rl '@/lib/i18n"' lib auth.ts --include="*.ts" | xargs sed -i 's|@/lib/i18n"|@/lib/lang"|g'
# 2. plan dictionary -> @/lib/i18n
grep -rl '@/lib/plan/i18n' lib auth.ts --include="*.ts" | xargs sed -i 's|@/lib/plan/i18n|@/lib/i18n|g'
# 3. remaining plan-lib paths -> @/lib/
grep -rl '@/lib/plan/' lib auth.ts --include="*.ts" | xargs sed -i 's|@/lib/plan/|@/lib/|g'
```
CAUTION: step 1's pattern must match the *site* module only. In the lib tree the only site-i18n importers are `lang-action.ts` and files using `getLang`/`type Lang`; the plan dictionary is imported as `@/lib/plan/i18n` (distinct string), so the ordered sed is safe. After running, manually verify: `src/lib/i18n.ts` (the dictionary) imports `type { Lang } from "@/lib/lang"` — fix by hand if its original import line was `from "@/lib/i18n"`.

- [ ] **Step 4: Apply the two content changes in libs**

`src/auth.ts`: change `pages: { signIn: "/plan/signin" }` → `pages: { signIn: "/signin" }`.
`src/lib/invite-email.ts`: change `const SIGNIN_URL = "https://nanoteofficial.me/plan/signin";` → `const SIGNIN_URL = "https://plan.nanoteofficial.me/signin";`.

- [ ] **Step 5: Verify and commit**

```bash
cd /project/src/plan.nanoteofficial.me
npx tsc --noEmit
```
Expected: PASS (libs are self-contained; nothing references components/app yet). Then:
```bash
grep -rn "@/lib/plan\|/plan/signin\|nanoteofficial.me/plan" src/ && echo "LEFTOVER REFS — fix before committing" || echo clean
git add -A && git commit -m "feat: port plan libraries (db, slides, actions, auth, i18n split lang/i18n)"
```
Expected: `clean`.

---

### Task 3: Port the components

**Files:**
- Copy with rename: `/project/src/nanoteofficial.me/src/components/plan/**` → new repo `src/components/**` (all 24 files + `slides/` subtree of 13 files, keeping the `slides/` and `slides/charts/` subdirectories)
- Copy: `/project/src/nanoteofficial.me/src/components/LangToggle.tsx` → `src/components/LangToggle.tsx`

**Interfaces:**
- Consumes: `@/lib/*` modules from Task 2 (exact names above).
- Produces: `@/components/*` (`ui`, `Toaster`, `LangContext` with `usePlanT`, `PlanSidebar`, `CommandPalette`, `SignInForm`, `LangToggle`, `slides/*` incl. `SlidesPanel`, `SlidesLink`, `DeckRenderer`, `PresentOverlay`) — the import paths Task 4's pages use.

- [ ] **Step 1: Copy**

```bash
SRC=/project/src/nanoteofficial.me; DST=/project/src/plan.nanoteofficial.me
mkdir -p $DST/src/components
cp -r $SRC/src/components/plan/. $DST/src/components/
cp $SRC/src/components/LangToggle.tsx $DST/src/components/
```

- [ ] **Step 2: Rewire imports** (same ordered rules as Task 2, plus components):

```bash
cd /project/src/plan.nanoteofficial.me/src/components
grep -rl "@/lib/i18n" . | xargs sed -i "s|@/lib/i18n|@/lib/lang|g"
grep -rl "@/lib/plan/i18n" . | xargs sed -i "s|@/lib/plan/i18n|@/lib/i18n|g"
grep -rl "@/lib/plan/" . | xargs sed -i "s|@/lib/plan/|@/lib/|g"
grep -rl "@/components/plan/" . | xargs sed -i "s|@/components/plan/|@/components/|g"
```
Note both quote styles exist in this tree (`'` and `"`) — the patterns above are quote-agnostic (they match the module string itself).

- [ ] **Step 3: Rewrite hardcoded paths in components** (exhaustive list from the source-repo audit — verify each file after sed):

| File | Change |
|---|---|
| `PlanSidebar.tsx` | `href="/plan"` → `href="/"` (3×); `href="/plan/admin"` → `"/admin"`; `` href={`/plan/${p.id}`} `` → `` {`/${p.id}`} ``; `path === "/plan"` → `path === "/"`; `path === "/plan/admin"` → `"/admin"`; `` path.startsWith(`/plan/${p.id}`) `` → `` path.startsWith(`/${p.id}`) `` |
| `ProjectCard.tsx` | `` href={`/plan/${p.id}`} `` → `` {`/${p.id}`} `` |
| `ProjectActions.tsx` | `router.push("/plan")` → `router.push("/")` |
| `CommandPalette.tsx` | `href: "/plan"` → `"/"`; `` href: `/plan/${p.id}` `` → `` `/${p.id}` `` |
| `slides/SlidesLink.tsx` | `` href={`/plan/${projectId}/slides`} `` → `` {`/${projectId}/slides`} `` |
| `slides/SlidesPanel.tsx` | `` fetch(`/api/plan/${projectId}/generate` ``… → `` `/api/${projectId}/generate` `` |
| `slides/ExportButtons.tsx` | `` href={`/api/plan/${projectId}/export?…`} `` → `` `/api/${projectId}/export?…` `` |

Mechanical version (run, then eyeball the table files):
```bash
cd /project/src/plan.nanoteofficial.me/src
grep -rl "/api/plan/" components | xargs sed -i "s|/api/plan/|/api/|g"
grep -rl "/plan" components | xargs sed -i -e "s|\"/plan\"|\"/\"|g" -e "s|\"/plan/admin\"|\"/admin\"|g" -e "s|/plan/\${|/\${|g" -e "s|/plan/admin|/admin|g"
```

- [ ] **Step 4: Also rewrite paths in the Task-2 lib files that carry them** (they were copied but not yet path-rewritten): `src/lib/actions.ts` has 12 `revalidatePath` calls using `/plan…`:

```bash
cd /project/src/plan.nanoteofficial.me/src
sed -i -e 's|revalidatePath("/plan/admin")|revalidatePath("/admin")|g' -e 's|revalidatePath("/plan")|revalidatePath("/")|g' -e 's|revalidatePath(`/plan/${|revalidatePath(`/${|g' lib/actions.ts
grep -n "revalidatePath" lib/actions.ts   # eyeball: all now /, /admin, or /${...}
```

- [ ] **Step 5: Verify and commit**

```bash
cd /project/src/plan.nanoteofficial.me
npx tsc --noEmit
grep -rn '"/plan\|`/plan\|/api/plan\|@/lib/plan\|@/components/plan' src/ && echo "LEFTOVERS" || echo clean
git add -A && git commit -m "feat: port plan components with root-path and import rewires"
```
Expected: tsc PASS, `clean`.

---

### Task 4: Port the app routes + real root layout

**Files:**
- Copy with rename (sources `/project/src/nanoteofficial.me/src/app/...`): `plan/(app)/layout.tsx` → `src/app/(app)/layout.tsx`; `plan/(app)/page.tsx` → `src/app/(app)/page.tsx`; `plan/(app)/admin/page.tsx` → `src/app/(app)/admin/page.tsx`; `plan/(app)/[projectId]/page.tsx` → `src/app/(app)/[projectId]/page.tsx`; `plan/(app)/[projectId]/slides/page.tsx` → `src/app/(app)/[projectId]/slides/page.tsx`; `plan/signin/page.tsx` → `src/app/signin/page.tsx`; `api/plan/[projectId]/generate/route.ts` → `src/app/api/[projectId]/generate/route.ts`; `api/plan/[projectId]/export/route.ts` → `src/app/api/[projectId]/export/route.ts`; `api/auth/[...nextauth]/route.ts` → `src/app/api/auth/[...nextauth]/route.ts`
- Modify: `src/app/layout.tsx` (dynamic lang), delete `src/app/page.tsx` placeholder (the `(app)/page.tsx` route group page serves `/`)

**Interfaces:**
- Consumes: everything from Tasks 2–3.
- Produces: the full route surface (`/`, `/signin`, `/admin`, `/[projectId]`, `/[projectId]/slides`, `/api/...`).

- [ ] **Step 1: Copy the trees**

```bash
SRC=/project/src/nanoteofficial.me/src/app; DST=/project/src/plan.nanoteofficial.me/src/app
mkdir -p "$DST/(app)/admin" "$DST/(app)/[projectId]/slides" "$DST/signin" "$DST/api/[projectId]/generate" "$DST/api/[projectId]/export" "$DST/api/auth/[...nextauth]"
cp "$SRC/plan/(app)/layout.tsx" "$DST/(app)/"
cp "$SRC/plan/(app)/page.tsx" "$DST/(app)/"
cp "$SRC/plan/(app)/admin/page.tsx" "$DST/(app)/admin/"
cp "$SRC/plan/(app)/[projectId]/page.tsx" "$DST/(app)/[projectId]/"
cp "$SRC/plan/(app)/[projectId]/slides/page.tsx" "$DST/(app)/[projectId]/slides/"
cp "$SRC/plan/signin/page.tsx" "$DST/signin/"
cp "$SRC/api/plan/[projectId]/generate/route.ts" "$DST/api/[projectId]/generate/"
cp "$SRC/api/plan/[projectId]/export/route.ts" "$DST/api/[projectId]/export/"
cp "$SRC/api/auth/[...nextauth]/route.ts" "$DST/api/auth/[...nextauth]/"
rm /project/src/plan.nanoteofficial.me/src/app/page.tsx
```

- [ ] **Step 2: Rewire imports and paths in the copied app files** (same ordered rules; then the path table):

```bash
cd /project/src/plan.nanoteofficial.me/src/app
grep -rl "@/lib/i18n" . | xargs sed -i "s|@/lib/i18n|@/lib/lang|g"
grep -rl "@/lib/plan/i18n" . | xargs sed -i "s|@/lib/plan/i18n|@/lib/i18n|g"
grep -rl "@/lib/plan/" . | xargs sed -i "s|@/lib/plan/|@/lib/|g"
grep -rl "@/components/plan/" . | xargs sed -i "s|@/components/plan/|@/components/|g"
grep -rl "/plan" . | xargs sed -i -e 's|redirect("/plan/signin")|redirect("/signin")|g' -e 's|redirectTo: "/plan/signin"|redirectTo: "/signin"|g' -e 's|redirect("/plan")|redirect("/")|g' -e 's|redirectTo: "/plan"|redirectTo: "/"|g' -e 's|href={`/plan/${projectId}`}|href={`/${projectId}`}|g' -e 's|href="/plan"|href="/"|g'
```
Per the source-repo audit these cover every occurrence in app files (`(app)/layout.tsx` redirect + signOut; `signin/page.tsx` redirect + signIn redirectTo; `admin/page.tsx` redirect; `[projectId]/page.tsx` back-link; `[projectId]/slides/page.tsx` back-link). Verify none remain (Step 4).

- [ ] **Step 3: Real root layout**

Replace `src/app/layout.tsx` with:
```tsx
import type { Metadata } from "next";
import { getLang } from "@/lib/lang";
import "./globals.css";

export const metadata: Metadata = {
  title: "NaNote Plan",
  robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
```
(No marketing Header/Footer — this is the double-top-chrome fix. `LangProvider`/`Toaster` stay inside `(app)/layout.tsx` exactly as copied; `signin` renders standalone as before.)

- [ ] **Step 4: Full gate + leftover scan**

```bash
cd /project/src/plan.nanoteofficial.me
grep -rn '"/plan\|`/plan\|/api/plan\|@/lib/plan\|@/components/plan\|nanoteofficial.me/plan' src/ && echo "LEFTOVERS" || echo clean
npx tsc --noEmit && npm run lint && npm run build && env -u DATABASE_URL npm run build
```
Expected: `clean`, all four green. Build route list must show: `/`, `/signin`, `/admin`, `/[projectId]`, `/[projectId]/slides`, `/api/[projectId]/generate`, `/api/[projectId]/export`, `/api/auth/[...nextauth]`, and NO `ƒ Proxy (Middleware)` line.

- [ ] **Step 5: Local runtime smoke (no DB needed for these)**

```bash
npm run dev &   # note the port it binds
sleep 4
curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}\n" http://localhost:<port>/          # expect 307 -> /signin
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:<port>/signin                        # expect 200
kill %1
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: port app routes to root paths + minimal own layout (no marketing chrome)"
```

---

### Task 5: New-repo docs (`CLAUDE.md`, spec copies, `.env.example`)

**Files:**
- Create: `CLAUDE.md`, `.env.example`, `docs/superpowers/specs/` + `docs/superpowers/plans/` (copies)

**Interfaces:** none consumed by code; produced for humans/agents.

- [ ] **Step 1: Copy the plan-related design history**

```bash
SRC=/project/src/nanoteofficial.me/docs/superpowers; DST=/project/src/plan.nanoteofficial.me/docs/superpowers
mkdir -p $DST/specs $DST/plans
cp $SRC/specs/2026-06-30-plan-project-management-design.md $SRC/specs/2026-07-01-plan-*.md $SRC/specs/2026-07-21-plan-ai-slide-*.md $SRC/specs/2026-07-22-plan-subdomain-migration-design.md $DST/specs/
cp $SRC/plans/2026-06-30-plan-*.md $SRC/plans/2026-07-01-plan-*.md $SRC/plans/2026-07-21-plan-ai-slide-v2-presentation-grade.md $SRC/plans/2026-07-22-plan-subdomain-migration.md $DST/plans/ 2>/dev/null || true
```

- [ ] **Step 2: Write `CLAUDE.md`** — full content:

```markdown
# CLAUDE.md

Private project-management workspace (Notion/Linear-style) with an AI slide generator.
Extracted 2026-07-22 from the `nanoteofficial.me` portfolio repo (full pre-migration
history lives there under `src/app/plan/**`). See `docs/superpowers/` for design specs.

## Commands

```bash
npm run dev      # http://localhost:3000
npm run build
npm run lint
npx tsc --noEmit # no test runner — tsc + lint + build are the gate
```

The build must also pass with `DATABASE_URL` unset: `env -u DATABASE_URL npm run build`
(`src/lib/db/index.ts` constructs `neon()` non-throwing with a placeholder URL — keep this).

Migrations: `drizzle-kit` does not read `.env.local` — `DATABASE_URL="postgres://…" npx drizzle-kit push`.

## Architecture

- **Live:** https://plan.nanoteofficial.me (own Vercel project, auto-deploy from `main`;
  Namecheap CNAME `plan` → Vercel). Root-path URLs: `/` projects, `/signin`, `/admin`,
  `/[projectId]`, `/[projectId]/slides`.
- **Auth:** Auth.js v5 magic link (Resend) + Drizzle adapter, database sessions, invite-only
  (`ALLOWED_EMAILS` + invites table). Gate lives in `src/app/(app)/layout.tsx` (`auth()` +
  `redirect("/signin")`). **No middleware.ts / proxy.ts — never add one.** `/signin` sits
  outside the route group and stays public.
- **DB:** Neon Postgres (`@neondatabase/serverless` + Drizzle). Schema in `src/lib/db/schema.ts`
  (Auth.js tables + projects/tasks/invites/deck_version).
- **i18n:** `src/lib/lang.ts` = cookie module (`getLang`); `src/lib/lang-action.ts` = `setLang`
  Server Action; `src/lib/i18n.ts` = typed bilingual dictionary (`pt`, `PlanKey`) — every key
  needs both `en` and `th`. Client components use `usePlanT()` from `components/LangContext`.
- **Slides:** `src/lib/slides/*` (4-step anti-slop pipeline on claude-sonnet-5, SSE streaming,
  versioned decks, native-chart PPTX export) + `src/components/slides/*` (SlideView renderer,
  Present mode, wizard, filmstrip). Theme registry `src/lib/slides/themes.ts` is the single
  source of truth (web CSS + swatches + PPTX).
- **Roles:** every mutation calls `requireEditor()`; `setUserRole` calls `requireAdmin()`;
  `canEditPlan(role)` is the client-side hide/disable check. Single shared workspace — if you
  ever add per-user ownership, add ownership checks (IDOR risk).

## Env vars

`DATABASE_URL`, `AUTH_SECRET`, `ALLOWED_EMAILS`, `PLAN_ADMIN_EMAILS`, `RESEND_API_KEY`,
`AUTH_URL` (pin to `https://plan.nanoteofficial.me`), `ANTHROPIC_API_KEY`. See `.env.example`.

## Conventions

- Design tokens (`--surface`, `--border`, `--feature-color`, …) from `globals.css`; no
  hard-coded chrome colors. Shared UI primitives in `src/components/ui.tsx`.
- RSC: no inline event handlers in server components.
- Client view state resets via server-derived `key` props, not prop→state effects
  (`react-hooks/set-state-in-effect` is enforced; `react-hooks/immutability` too).
- `robots.ts` disallows everything — the whole app is private. Keep it that way.
```

- [ ] **Step 3: Write `.env.example`**

```bash
# Neon Postgres (pooled connection string)
DATABASE_URL=
# openssl rand -base64 33
AUTH_SECRET=
# comma-separated sign-in allow-list
ALLOWED_EMAILS=
# comma-separated emails auto-promoted to admin
PLAN_ADMIN_EMAILS=
RESEND_API_KEY=
# pin so magic links point at production
AUTH_URL=https://plan.nanoteofficial.me
ANTHROPIC_API_KEY=
```

- [ ] **Step 4: Commit**

```bash
cd /project/src/plan.nanoteofficial.me
git add -A && git commit -m "docs: CLAUDE.md, env example, design-history copies"
```

---

### Task 6: Create GitHub repo, push, hand over infra checklist  *(controller task — no subagent)*

- [ ] **Step 1: Create + push**

```bash
cd /project/src/plan.nanoteofficial.me
gh repo create khantee8/plan.nanoteofficial.me --private --source=. --push
git log --oneline   # confirm pushed
```

- [ ] **Step 2: Generate the new AUTH_SECRET**

```bash
openssl rand -base64 33
```

- [ ] **Step 3: Present the user checklist** (verbatim, with the generated secret filled in):

> 1. **Vercel** → Add New Project → import `khantee8/plan.nanoteofficial.me` (framework auto-detects; defaults fine).
> 2. **Vercel → Settings → Domains** → add `plan.nanoteofficial.me`.
> 3. **Neon** → create a new project (e.g. `plan-nanoteofficial`); copy the **pooled** connection string. Then **Vercel → Settings → Environment Variables** (Production + Preview): `DATABASE_URL=<neon url>`, `AUTH_SECRET=<generated>`, `ALLOWED_EMAILS=<your emails>`, `PLAN_ADMIN_EMAILS=<your email>`, `RESEND_API_KEY=<same as portfolio>`, `AUTH_URL=https://plan.nanoteofficial.me`, `ANTHROPIC_API_KEY=<same as portfolio>` → **Redeploy**.
> 4. **Namecheap** → Advanced DNS for `nanoteofficial.me` → add Record: CNAME, host `plan`, value `cname.vercel-dns.com`, TTL automatic.
> Reply when done (paste the new `DATABASE_URL` so I can run the one-time schema push).

**STOP — wait for the user before Task 7.**

---

### Task 7: Schema push + deployment verification  *(controller task; requires user's new DATABASE_URL)*

- [ ] **Step 1: Apply schema to the fresh Neon DB**

```bash
cd /project/src/plan.nanoteofficial.me
DATABASE_URL="<new-neon-url>" npx drizzle-kit push
```
Expected: creates users/accounts/sessions/verification_token/invites/projects/tasks/deck_version. Also write `.env.local` (gitignored) with the same vars for local dev.

- [ ] **Step 2: Verify production**

```bash
curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}\n" https://plan.nanoteofficial.me/        # 307 -> /signin
curl -s -o /dev/null -w "%{http_code}\n" https://plan.nanoteofficial.me/signin                      # 200
curl -s -o /dev/null -w "%{http_code}\n" https://plan.nanoteofficial.me/robots.txt                  # 200 (disallow /)
```
(DNS may take up to ~1h; retry before declaring failure.)

- [ ] **Step 3: User manual smoke** — sign in via magic link on the new domain, create a project, generate a slide deck, export PPTX. **Do not proceed to Task 8 until the user confirms sign-in works.**

---

### Task 8: Portfolio cleanup (delete plan code, add redirect)

**Files (all in `/project/src/nanoteofficial.me`):**
- Delete: `src/app/plan/`, `src/app/api/plan/`, `src/app/api/auth/`, `src/components/plan/`, `src/lib/plan/`, `src/lib/slides/`, `src/lib/db/`, `src/auth.ts`, `src/types/next-auth.d.ts`, `drizzle.config.ts`
- Modify: `package.json` (remove deps), `next.config.ts` (add redirect), `src/app/robots.ts` (drop `/plan`), `CLAUDE.md` (replace the `/plan` section)

**Interfaces:**
- Consumes: confirmation from Task 7 that the new domain works.
- Produces: a static-only portfolio; `/plan/:path*` 308 redirect.

- [ ] **Step 1: Branch, delete, prune deps**

```bash
cd /project/src/nanoteofficial.me
git checkout -b feat/extract-plan
git rm -r src/app/plan src/app/api/plan src/app/api/auth src/components/plan src/lib/plan src/lib/slides src/lib/db src/auth.ts src/types/next-auth.d.ts drizzle.config.ts
npm uninstall @anthropic-ai/sdk @auth/drizzle-adapter @dnd-kit/core @dnd-kit/sortable @neondatabase/serverless drizzle-orm next-auth pptxgenjs resend drizzle-kit
```
Keep: `LangToggle.tsx`, `src/lib/i18n.ts`, `src/lib/lang-action.ts` (still used by the marketing site), and the `postcss` override.

- [ ] **Step 2: Add the redirect in `next.config.ts`** (inside the exported config object, alongside `headers()`):

```ts
  async redirects() {
    return [
      {
        source: "/plan/:path*",
        destination: "https://plan.nanoteofficial.me/:path*",
        permanent: true,
      },
    ];
  },
```
(`:path*` matches zero segments, so bare `/plan` redirects too.)

- [ ] **Step 3: `src/app/robots.ts`** — remove the `/plan` entry from the disallow list (keep `/kb`).

- [ ] **Step 4: `CLAUDE.md`** — replace the entire `### /plan — auth + database workspace` section with:

```markdown
### /plan — migrated out (2026-07-22)

The plan workspace now lives in its own repo/deployment:
`khantee8/plan.nanoteofficial.me` → https://plan.nanoteofficial.me.
This repo keeps a permanent redirect (`/plan/:path*` → the subdomain) in
`next.config.ts` and no longer contains auth, database, or Anthropic code.
Pre-migration history: this repo's git log through v0.2.9.
```

- [ ] **Step 5: Gate + leftover scan**

```bash
grep -rn "next-auth\|drizzle\|@/auth\|@/lib/db\|@/lib/plan\|@/lib/slides\|components/plan\|pptxgenjs\|@anthropic" src/ next.config.ts package.json | grep -v "plan.nanoteofficial.me" && echo LEFTOVERS || echo clean
npx tsc --noEmit && npm run lint && npm run build && env -u DATABASE_URL npm run build
```
Expected: `clean`; all four green; build route list no longer shows any `/plan` or `/api/plan|auth` routes.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: extract /plan to plan.nanoteofficial.me (delete workspace code, add permanent redirect)"
```

---

### Task 9: Portfolio release v0.3.0 + final verification  *(controller task — push needs explicit user confirmation)*

- [ ] **Step 1: Version bump + merge**

```bash
cd /project/src/nanoteofficial.me
# bump package.json "version" to 0.3.0 on the branch, commit "chore: v0.3.0 — plan extracted to own project"
git checkout main && git merge --ff-only feat/extract-plan && git branch -d feat/extract-plan
```

- [ ] **Step 2: Re-run the full gate on main** (tsc, lint, both builds — expected green).

- [ ] **Step 3: ASK THE USER** before pushing (production deploy). On yes:

```bash
git push origin main
```

- [ ] **Step 4: Verify the cutover**

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://nanoteofficial.me                                            # 200
curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}\n" https://nanoteofficial.me/plan                    # 308 -> https://plan.nanoteofficial.me/
curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}\n" https://nanoteofficial.me/plan/signin             # 308 -> https://plan.nanoteofficial.me/signin
curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}\n" https://plan.nanoteofficial.me/                   # 307 -> /signin
```

- [ ] **Step 5: Bookkeeping** — update `/project/CLAUDE.md` (new project section for plan.nanoteofficial.me; trim the portfolio section's `/plan` mention) and the memory files (`plan-workspace-state`, `ai-slide-v2-state`) to point at the new repo/domain. Remind the user: old Neon DB + old Vercel env vars can be cleaned up whenever.

---

## Self-Review

**Spec coverage:** repo scaffold + tokens (Task 1 ↔ spec "New repo"); lib port + i18n split `lang.ts`/`i18n.ts` + auth pages + invite URL (Task 2 ↔ "Code adaptations"); components + path table (Task 3); routes at root + own layout + no proxy + robots (Task 4 ↔ "Route mapping", "no middleware", double-chrome fix); docs/CLAUDE.md/env example (Task 5); gh repo + checklist + AUTH_SECRET (Task 6 ↔ "Infra checklist"); drizzle push + deploy verify + user smoke gate (Task 7 ↔ "Sequencing" 1–2); portfolio delete + redirect + robots + CLAUDE.md (Task 8 ↔ "Portfolio repo cleanup"); release + cutover verify + /project/CLAUDE.md + memory (Task 9 ↔ "Sequencing" 3, "Verification"). Fresh-DB constraint encoded in Global Constraints + Task 7. No gaps found.

**Placeholder scan:** the only intentionally unresolved values are user-supplied at runtime (`<new-neon-url>`, generated secret, dev-server `<port>`) — marked as such at their point of use. No TBDs.

**Type consistency:** module names `@/lib/lang` (`getLang`, `Lang`), `@/lib/i18n` (`pt`, `PlanKey`), `@/lib/lang-action` (`setLang`) used identically in Tasks 2, 3, 4 and in the CLAUDE.md of Task 5. Route names in Task 4's build-output check match the Global Constraints URL list. Env var names identical across Global Constraints, Task 5 `.env.example`, Task 6 checklist, Task 7.
