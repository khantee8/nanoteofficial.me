# AI Slide Add-on v2 — Presentation-Grade — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the `/plan` AI Slide add-on from a JSON→HTML renderer into a presentation-grade tool: a fullscreen Present mode, 6 typographic themes, chart/KPI slide layouts with native editable PowerPoint charts, always-on speaker notes, and a polished wizard + version filmstrip.

**Architecture:** All changes live in the existing slide module (`src/lib/slides/*` + `src/components/plan/slides/*`). A new `themes.ts` registry becomes the single source of truth for theme id/palette/fonts consumed by the deck schema, CSS, PPTX export, and wizard. The slide renderer is extracted into a shared `SlideView` used identically by the web preview, Present mode, and version thumbnails; PPTX export is driven from the same `Slide` data so web and PowerPoint stay in sync. New slide layouts carry *structured* chart data (not pre-rendered), feeding both SVG and `pptx.addChart`.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, `next/font` (self-hosted fonts, CSP-safe), `pptxgenjs` (native charts + notes), hand-rolled SVG charts, Anthropic SDK (existing pipeline).

## Global Constraints

- **No test runner exists** in this repo. The verification gate for every task is `npx tsc --noEmit` + `npm run lint`; `npm run build` is run at milestones. Where a task adds pure logic, a manual node smoke-check is included instead of a unit test.
- **Build must pass with `DATABASE_URL` unset:** `env -u DATABASE_URL npm run build` must succeed (repo invariant). Run at the final task.
- **No database migration.** All new fields (`notes`, chart/KPI layouts) are JSON inside the existing `deck_version.deckJson`; `deck_version.createdAt` already exists. Do **not** run `drizzle-kit push`.
- **i18n is typed and exhaustive:** every new UI string requires a `PlanKey` entry in `src/lib/plan/i18n.ts` with **both** `en` and `th`. Missing either half is a TypeScript error. Client components read strings via `usePlanT()`; server components via `pt(lang, key)`.
- **RSC constraint:** no inline event handlers in server components — all interactivity is in `"use client"` components.
- **Design tokens only** — reuse `--feature-color`, `--border`, `--surface`, `--background`, `--muted`, etc. Do not hard-code UI chrome colors (slide *theme* palettes are the deliberate exception, defined in `themes.ts`).
- **Backward compatibility:** already-stored decks (8 original layouts, no `notes`) must still validate and render unchanged.
- **CSP:** `next/font` self-hosts under `/_next`; after adding fonts, verify no `font-src`/`style-src` CSP violation and add `'self'` to `font-src` in `next.config.ts` only if needed.

**Reference spec:** `docs/superpowers/specs/2026-07-21-plan-ai-slide-v2-presentation-grade-design.md`

---

### Task 1: Theme registry (`themes.ts`)

Create the single source of truth for themes. `ThemeId` and `THEMES` move here (from `deck.ts`) to avoid a circular import; `deck.ts` re-exports them so existing imports keep working.

**Files:**
- Create: `src/lib/slides/themes.ts`
- Modify: `src/lib/slides/deck.ts:1-2` (remove local `ThemeId`/`THEMES`, re-export from `themes.ts`)

**Interfaces:**
- Produces: `type ThemeId = 'midnight'|'editorial'|'grid'|'keynote'|'mono'|'sunrise'`; `interface ThemeDef { id; label; swatch:{bg;fg;accent}; ramp:string[]; displayVar:string; bodyVar:string }`; `const THEME_DEFS: ThemeDef[]`; `const THEMES: ThemeId[]`; `function themeDef(id: ThemeId): ThemeDef`.

- [ ] **Step 1: Create `src/lib/slides/themes.ts`**

```ts
export type ThemeId = 'midnight' | 'editorial' | 'grid' | 'keynote' | 'mono' | 'sunrise';

export interface ThemeDef {
  id: ThemeId;
  label: string;
  /** hex without '#'; drives the wizard swatch preview and the PPTX color map. */
  swatch: { bg: string; fg: string; accent: string };
  /** small categorical ramp (hex without '#') for multi-series charts. */
  ramp: string[];
  /** CSS var names emitted by next/font (see fonts.ts). */
  displayVar: string;
  bodyVar: string;
}

export const THEME_DEFS: ThemeDef[] = [
  { id: 'midnight',  label: 'Midnight',  swatch: { bg: '0b0e14', fg: 'eef1f6', accent: '5cc8ff' }, ramp: ['5cc8ff', '9b8cff', '4fd1a1', 'ffb454'], displayVar: '--font-space-grotesk', bodyVar: '--font-inter' },
  { id: 'editorial', label: 'Editorial', swatch: { bg: 'f7f6f2', fg: '17140f', accent: 'c8452d' }, ramp: ['c8452d', '3d7a6b', 'c79a2d', '4a4a8a'], displayVar: '--font-fraunces', bodyVar: '--font-inter' },
  { id: 'grid',      label: 'Grid',      swatch: { bg: '111111', fg: 'ffffff', accent: 'e8ff00' }, ramp: ['e8ff00', '00e0ff', 'ff5c7a', '9b8cff'], displayVar: '--font-archivo', bodyVar: '--font-jetbrains' },
  { id: 'keynote',   label: 'Keynote',   swatch: { bg: 'ffffff', fg: '141821', accent: '3b4fbf' }, ramp: ['3b4fbf', '2f9e7d', 'd08b12', 'b0416a'], displayVar: '--font-inter-tight', bodyVar: '--font-inter' },
  { id: 'mono',      label: 'Mono',      swatch: { bg: '0a0a0a', fg: 'fafafa', accent: 'fafafa' }, ramp: ['fafafa', 'a3a3a3', '737373', 'd4d4d4'], displayVar: '--font-archivo-black', bodyVar: '--font-inter' },
  { id: 'sunrise',   label: 'Sunrise',   swatch: { bg: 'fff8f0', fg: '231a12', accent: 'e8622a' }, ramp: ['e8622a', 'd8a521', '4a8fb0', '9c5bb8'], displayVar: '--font-fraunces', bodyVar: '--font-inter' },
];

export const THEMES: ThemeId[] = THEME_DEFS.map((t) => t.id);

const BY_ID = new Map(THEME_DEFS.map((t) => [t.id, t]));
export function themeDef(id: ThemeId): ThemeDef {
  return BY_ID.get(id) ?? THEME_DEFS[0];
}
```

- [ ] **Step 2: Rewire `deck.ts` lines 1-2**

Replace:
```ts
export type ThemeId = 'midnight' | 'editorial' | 'grid';
export const THEMES: ThemeId[] = ['midnight', 'editorial', 'grid'];
```
with:
```ts
export type { ThemeId } from './themes';
export { THEMES } from './themes';
import type { ThemeId } from './themes';
```
(The `import type` is needed because the rest of `deck.ts` references `ThemeId` internally.)

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS (no errors; `deck.ts`, `pptx.ts`, generate route all still resolve `THEMES`/`ThemeId`).

- [ ] **Step 4: Commit**

```bash
git add src/lib/slides/themes.ts src/lib/slides/deck.ts
git commit -m "feat(slides): theme registry as single source of truth"
```

---

### Task 2: Deck schema — notes + chart/KPI layouts + validators

**Files:**
- Modify: `src/lib/slides/deck.ts`

**Interfaces:**
- Consumes: `ThemeId`, `THEMES` (Task 1).
- Produces: `type Slide = SlideBody & { notes?: string }`; new layouts `kpi`, `barChart`, `lineChart`, `donutChart`; `interface ChartSeries { name: string; values: number[] }`; `interface Segment { label: string; value: number }`; `validateDeck` accepts them and type-checks `notes`.

- [ ] **Step 1: Add new interfaces + extend the `Slide` union**

In `deck.ts`, replace the `export type Slide = ...` union (lines ~4-12) with a `SlideBody` union plus a notes wrapper, and add chart types:

```ts
export interface ChartSeries { name: string; values: number[] }
export interface Segment { label: string; value: number }
export interface Kpi { value: string; label: string }

type SlideBody =
  | { layout: 'title'; title: string; subtitle?: string }
  | { layout: 'agenda'; heading: string; items: string[] }
  | { layout: 'section'; title: string; kicker?: string }
  | { layout: 'bulletsVisual'; heading: string; bullets: string[]; note?: string }
  | { layout: 'quote'; quote: string; attribution?: string }
  | { layout: 'data'; heading: string; stat: string; caption?: string }
  | { layout: 'comparison'; heading: string; left: { title: string; points: string[] }; right: { title: string; points: string[] } }
  | { layout: 'closing'; title: string; cta?: string }
  | { layout: 'kpi'; heading: string; kpis: Kpi[] }
  | { layout: 'barChart'; heading: string; categories: string[]; series: ChartSeries[]; note?: string }
  | { layout: 'lineChart'; heading: string; categories: string[]; series: ChartSeries[]; note?: string }
  | { layout: 'donutChart'; heading: string; segments: Segment[]; note?: string };

export type Slide = SlideBody & { notes?: string };
export type SlideLayout = SlideBody['layout'];
```

Update the `LAYOUTS` set (line ~16):
```ts
const LAYOUTS = new Set<SlideLayout>(['title','agenda','section','bulletsVisual','quote','data','comparison','closing','kpi','barChart','lineChart','donutChart']);
```

- [ ] **Step 2: Add validation helpers**

After `isStrArray` (line ~24), add:
```ts
function isNum(v: unknown): v is number { return typeof v === 'number' && Number.isFinite(v); }
function isNumArray(v: unknown): v is number[] { return Array.isArray(v) && v.every(isNum); }
function isKpi(v: unknown): v is Kpi {
  if (!v || typeof v !== 'object') return false;
  const k = v as Record<string, unknown>;
  return isStr(k.value) && isStr(k.label);
}
function isSegment(v: unknown): v is Segment {
  if (!v || typeof v !== 'object') return false;
  const s = v as Record<string, unknown>;
  return isStr(s.label) && isNum(s.value);
}
function isSeries(categories: number, v: unknown): v is ChartSeries {
  if (!v || typeof v !== 'object') return false;
  const s = v as Record<string, unknown>;
  return isStr(s.name) && isNumArray(s.values) && (s.values as number[]).length === categories;
}
```

- [ ] **Step 3: Add the four layout cases to `validateSlideFields`**

Inside the `switch` in `validateSlideFields`, before `default:`, add:
```ts
    case 'kpi':
      if (!isStr(s.heading)) return 'missing/invalid heading';
      if (!Array.isArray(s.kpis) || s.kpis.length < 2 || s.kpis.length > 4 || !s.kpis.every(isKpi)) return 'kpi needs 2–4 {value,label}';
      return null;
    case 'barChart':
    case 'lineChart': {
      if (!isStr(s.heading)) return 'missing/invalid heading';
      if (!isStrArray(s.categories) || s.categories.length < 1) return 'missing/invalid categories';
      if (!optStr(s.note)) return 'missing/invalid note';
      const n = (s.categories as string[]).length;
      if (!Array.isArray(s.series) || s.series.length < 1 || !s.series.every((x) => isSeries(n, x))) return 'series must match categories length';
      return null;
    }
    case 'donutChart':
      if (!isStr(s.heading)) return 'missing/invalid heading';
      if (!optStr(s.note)) return 'missing/invalid note';
      if (!Array.isArray(s.segments) || s.segments.length < 1 || !s.segments.every(isSegment)) return 'missing/invalid segments';
      return null;
```

- [ ] **Step 4: Type-check `notes` in `validateDeck`**

In `validateDeck`, inside the `for` loop after the `fieldError` check (line ~99), add a notes check:
```ts
    if (rec.notes !== undefined && !isStr(rec.notes)) {
      return { ok: false, error: `slide ${i}: invalid notes` };
    }
```

- [ ] **Step 5: Smoke-test the validator (no test runner — use node)**

Run:
```bash
npx tsx -e "
import { validateDeck } from './src/lib/slides/deck';
const ok = validateDeck({ theme:'keynote', slides:[
  { layout:'title', title:'Q3', notes:'Open confident' },
  { layout:'kpi', heading:'Numbers', kpis:[{value:'3.2x',label:'ROI'},{value:'12%',label:'Churn'}] },
  { layout:'barChart', heading:'Rev', categories:['Q1','Q2'], series:[{name:'2026',values:[10,20]}] },
  { layout:'donutChart', heading:'Mix', segments:[{label:'A',value:60},{label:'B',value:40}] },
]});
const bad = validateDeck({ theme:'keynote', slides:[{ layout:'barChart', heading:'x', categories:['Q1','Q2'], series:[{name:'a',values:[1]}] }] });
console.log('ok.ok =', ok.ok, '| bad.ok =', bad.ok, bad.ok ? '' : '('+bad.error+')');
"
```
Expected: `ok.ok = true | bad.ok = false (slide 0: series must match categories length)`
(If `tsx` is unavailable, run `npx tsc --noEmit` only and rely on the manual generation check in Task 13.)

- [ ] **Step 6: Type-check + commit**

Run: `npx tsc --noEmit` → PASS
```bash
git add src/lib/slides/deck.ts
git commit -m "feat(slides): notes + chart/kpi layouts in deck schema with validation"
```

---

### Task 3: i18n keys for v2 UI

Add every new string up front so later client components compile. Insert alongside the existing `slides.*` block (after line ~208, before the closing `} as const;`).

**Files:**
- Modify: `src/lib/plan/i18n.ts`

**Interfaces:**
- Produces: new `PlanKey`s: `slides.present.*`, `slides.wizard.audience.*`, `slides.wizard.notesInfo`, `slides.versions.*`, `slides.chart.*`.

- [ ] **Step 1: Add the keys**

Add before `} as const;`:
```ts
  "slides.present.button": { en: "▶ Present", th: "▶ นำเสนอ" },
  "slides.present.exitHint": { en: "Esc to exit · ← → to navigate · S notes · F fullscreen", th: "Esc ออก · ← → เลื่อน · S โน้ต · F เต็มจอ" },
  "slides.present.notes": { en: "Speaker notes", th: "โน้ตผู้บรรยาย" },
  "slides.present.noNotes": { en: "No notes for this slide.", th: "ไม่มีโน้ตสำหรับสไลด์นี้" },
  "slides.present.counter": { en: "{cur} / {total}", th: "{cur} / {total}" },

  "slides.wizard.audienceLabel": { en: "Audience", th: "กลุ่มเป้าหมาย" },
  "slides.wizard.audience.exec": { en: "Executives", th: "ผู้บริหาร" },
  "slides.wizard.audience.investor": { en: "Investors", th: "นักลงทุน" },
  "slides.wizard.audience.team": { en: "Team", th: "ทีมงาน" },
  "slides.wizard.audience.client": { en: "Client", th: "ลูกค้า" },
  "slides.wizard.audience.custom": { en: "Custom…", th: "กำหนดเอง…" },
  "slides.wizard.notesInfo": { en: "Speaker notes are generated for every slide.", th: "ระบบสร้างโน้ตผู้บรรยายให้ทุกสไลด์" },

  "slides.versions.current": { en: "current", th: "ปัจจุบัน" },
  "slides.versions.cost": { en: "${cost} · {fixed} fixed", th: "${cost} · แก้ {fixed}" },
  "slides.versions.justNow": { en: "just now", th: "เมื่อสักครู่" },
  "slides.versions.minsAgo": { en: "{n}m ago", th: "{n} นาทีที่แล้ว" },
  "slides.versions.hrsAgo": { en: "{n}h ago", th: "{n} ชม.ที่แล้ว" },
  "slides.versions.daysAgo": { en: "{n}d ago", th: "{n} วันที่แล้ว" },

  "slides.chart.empty": { en: "No data", th: "ไม่มีข้อมูล" },
```

- [ ] **Step 2: Type-check + commit**

Run: `npx tsc --noEmit` → PASS
```bash
git add src/lib/plan/i18n.ts
git commit -m "feat(slides): i18n keys for present mode, audience picker, version filmstrip"
```

---

### Task 4: Fonts (`next/font`) + themed CSS refactor

**Files:**
- Create: `src/lib/slides/fonts.ts`
- Modify: `src/components/plan/slides/deck-themes.css`
- Modify: `src/app/plan/(app)/[projectId]/slides/page.tsx` (apply font-variable classes to the slides section)
- Verify: `next.config.ts` CSP (`font-src`)

**Interfaces:**
- Produces: `const slideFontVars: string` (space-joined `.variable` classNames to attach to a wrapper so all six pairings' CSS vars are available).

- [ ] **Step 1: Create `src/lib/slides/fonts.ts`**

```ts
import { Inter, Inter_Tight, Space_Grotesk, Fraunces, Archivo, Archivo_Black, JetBrains_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-inter', display: 'swap' });
const interTight = Inter_Tight({ subsets: ['latin'], weight: ['600', '800'], variable: '--font-inter-tight', display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-space-grotesk', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], weight: ['600', '900'], variable: '--font-fraunces', display: 'swap' });
const archivo = Archivo({ subsets: ['latin'], weight: ['600', '800'], variable: '--font-archivo', display: 'swap' });
const archivoBlack = Archivo_Black({ subsets: ['latin'], weight: ['400'], variable: '--font-archivo-black', display: 'swap' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], weight: ['500'], variable: '--font-jetbrains', display: 'swap' });

export const slideFontVars = [inter, interTight, spaceGrotesk, fraunces, archivo, archivoBlack, jetbrains]
  .map((f) => f.variable).join(' ');
```

- [ ] **Step 2: Apply the font vars on the slides page wrapper**

In `src/app/plan/(app)/[projectId]/slides/page.tsx`, import `slideFontVars` and add it to the root `<section>` className:
```tsx
import { slideFontVars } from "@/lib/slides/fonts";
// ...
return (
  <section className={`space-y-6 ${slideFontVars}`}>
```

- [ ] **Step 3: Rewrite `deck-themes.css` — classed layouts, 6 themes, fonts, footer**

Replace the whole file with (extends, does not drop, the existing print block):
```css
.slide { aspect-ratio: 16/9; width: 100%; padding: 6% 7%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; position: relative; overflow: hidden;
  font-family: var(--slide-font-body, -apple-system, Segoe UI, Roboto, sans-serif); }
.slide-title, .slide-stat, .slide-kicker, .slide h2, .slide h3 { font-family: var(--slide-font-display, inherit); }

/* palettes + per-theme font vars (var names come from themes.ts / fonts.ts) */
.slide[data-theme="midnight"]  { background: #0b0e14; color: #eef1f6; --accent: #5cc8ff; --slide-font-display: var(--font-space-grotesk); --slide-font-body: var(--font-inter); }
.slide[data-theme="editorial"] { background: #f7f6f2; color: #17140f; --accent: #c8452d; --slide-font-display: var(--font-fraunces); --slide-font-body: var(--font-inter); }
.slide[data-theme="grid"]      { background: #111; color: #fff; --accent: #e8ff00; --slide-font-display: var(--font-archivo); --slide-font-body: var(--font-jetbrains);
  background-image: linear-gradient(#ffffff10 1px, transparent 1px), linear-gradient(90deg, #ffffff10 1px, transparent 1px); background-size: 40px 40px; }
.slide[data-theme="keynote"]   { background: #fff; color: #141821; --accent: #3b4fbf; --slide-font-display: var(--font-inter-tight); --slide-font-body: var(--font-inter); }
.slide[data-theme="mono"]      { background: #0a0a0a; color: #fafafa; --accent: #fafafa; --slide-font-display: var(--font-archivo-black); --slide-font-body: var(--font-inter); }
.slide[data-theme="sunrise"]   { background: #fff8f0; color: #231a12; --accent: #e8622a; --slide-font-display: var(--font-fraunces); --slide-font-body: var(--font-inter); }

.slide-title { font-size: clamp(24px, 4vw, 52px); font-weight: 800; letter-spacing: -0.02em; line-height: 1.05; }
.slide[data-theme="grid"] .slide-title, .slide[data-theme="mono"] .slide-title { text-transform: uppercase; font-weight: 900; }
.slide-sub { opacity: 0.7; margin-top: 12px; font-size: clamp(14px, 1.6vw, 20px); }
.slide-kicker { font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; opacity: 0.7; }
.slide h2.slide-heading { font-size: clamp(20px, 3vw, 34px); font-weight: 800; letter-spacing: -0.01em; }
.slide-bullets { list-style: none; padding: 0; display: grid; gap: 10px; font-size: clamp(14px, 1.7vw, 20px); }
.slide-bullets li::before { content: "—"; color: var(--accent); margin-right: 10px; }
.slide-note { opacity: 0.6; font-size: 13px; }
.slide-stat { font-size: clamp(40px, 9vw, 110px); font-weight: 800; color: var(--accent); line-height: 1; }
.slide-quote { font-size: clamp(22px, 3vw, 34px); font-weight: 600; }
.slide-cite { opacity: 0.6; }
.slide-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.slide-compare h3 { color: var(--accent); margin-bottom: 8px; }
.slide-kpis { display: grid; grid-auto-flow: column; gap: 24px; }
.slide-kpi-value { font-size: clamp(28px, 5vw, 64px); font-weight: 800; color: var(--accent); line-height: 1; }
.slide-kpi-label { opacity: 0.7; font-size: clamp(12px, 1.3vw, 16px); margin-top: 6px; }
.slide-chart-wrap { flex: 1; min-height: 0; display: flex; align-items: center; }
.slide-chart-wrap svg { width: 100%; height: auto; max-height: 100%; }
.slide-footer { position: absolute; left: 7%; right: 7%; bottom: 3%; display: flex; justify-content: space-between; font-size: 11px; opacity: 0.5; letter-spacing: 0.04em; }

@media print {
  .slide { break-after: page; height: 100vh; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body * { visibility: hidden !important; }
  .print-root, .print-root * { visibility: visible !important; }
  .print-root { position: absolute; inset: 0; width: 100%; }
}
```

- [ ] **Step 4: Verify CSP for fonts**

Run: `grep -n "font-src\|style-src\|Content-Security-Policy" next.config.ts`
If a `font-src` directive exists and lacks `'self'`, add `'self'`. If there is no `font-src` directive, `default-src`/`self` covers it — no change. Document which case applied in the commit body.

- [ ] **Step 5: Build (fonts require a real build to download) + commit**

Run: `npm run build`
Expected: build succeeds; console/network shows fonts served from `/_next` (self-hosted), no external font host.
```bash
git add src/lib/slides/fonts.ts src/components/plan/slides/deck-themes.css "src/app/plan/(app)/[projectId]/slides/page.tsx" next.config.ts
git commit -m "feat(slides): 6 themes with self-hosted next/font pairings + classed layout CSS"
```

---

### Task 5: Extract `SlideView` (existing 8 layouts → classed) + footer

Pull `SlideView` out of `DeckRenderer.tsx` into its own file so Present mode and thumbnails share it, and convert the inline styles to the Task-4 CSS classes. Chart/KPI rendering is added in Task 7.

**Files:**
- Create: `src/components/plan/slides/SlideView.tsx`
- Modify: `src/components/plan/slides/DeckRenderer.tsx`

**Interfaces:**
- Consumes: `Slide`, `Deck` (deck.ts); CSS classes (Task 4).
- Produces: `function SlideView({ slide, theme, footer }: { slide: Slide; theme: string; footer?: { index: number; total: number; project: string } })`.

- [ ] **Step 1: Create `SlideView.tsx` with the 8 existing layouts, classed**

```tsx
import type { Slide } from '@/lib/slides/deck';
import './deck-themes.css';

export function SlideView({ slide, theme, footer }: {
  slide: Slide; theme: string; footer?: { index: number; total: number; project: string };
}) {
  const showFooter = footer && slide.layout !== 'title' && slide.layout !== 'closing';
  const frame = (children: React.ReactNode) => (
    <div className="slide" data-theme={theme}>
      {children}
      {showFooter && (
        <div className="slide-footer"><span>{footer!.project}</span><span>{footer!.index} / {footer!.total}</span></div>
      )}
    </div>
  );
  switch (slide.layout) {
    case 'title': return frame(<><div /><div><div className="slide-title">{slide.title}</div>{slide.subtitle && <p className="slide-sub">{slide.subtitle}</p>}</div><div /></>);
    case 'section': return frame(<><span className="slide-kicker">{slide.kicker}</span><div className="slide-title">{slide.title}</div><div /></>);
    case 'agenda': return frame(<><span className="slide-kicker">{slide.heading}</span><ul className="slide-bullets">{slide.items.map((x, i) => <li key={i}>{x}</li>)}</ul><div /></>);
    case 'bulletsVisual': return frame(<><h2 className="slide-heading">{slide.heading}</h2><ul className="slide-bullets">{slide.bullets.map((x, i) => <li key={i}>{x}</li>)}</ul>{slide.note && <p className="slide-note">{slide.note}</p>}</>);
    case 'quote': return frame(<><div /><blockquote className="slide-quote">&ldquo;{slide.quote}&rdquo;</blockquote><cite className="slide-cite">{slide.attribution}</cite></>);
    case 'data': return frame(<><span className="slide-kicker">{slide.heading}</span><div className="slide-stat">{slide.stat}</div><p className="slide-note" style={{ opacity: 0.7 }}>{slide.caption}</p></>);
    case 'comparison': return frame(<><h2 className="slide-heading">{slide.heading}</h2><div className="slide-compare">{[slide.left, slide.right].map((c, i) => <div key={i}><h3>{c.title}</h3><ul className="slide-bullets">{c.points.map((p, j) => <li key={j}>{p}</li>)}</ul></div>)}</div><div /></>);
    case 'closing': return frame(<><div /><div className="slide-title">{slide.title}</div><p style={{ color: 'var(--accent)' }}>{slide.cta}</p></>);
    default: return frame(<div className="slide-title">{(slide as { heading?: string }).heading ?? ''}</div>); // kpi/charts added in Task 7
  }
}
```

- [ ] **Step 2: Slim `DeckRenderer.tsx` to consume `SlideView`**

Replace the file with:
```tsx
import type { Deck } from '@/lib/slides/deck';
import { SlideView } from './SlideView';

export function DeckRenderer({ deck, project }: { deck: Deck; project?: string }) {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {deck.slides.map((s, i) => (
        <SlideView key={i} slide={s} theme={deck.theme}
          footer={project ? { index: i + 1, total: deck.slides.length, project } : undefined} />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Type-check + commit**

Run: `npx tsc --noEmit` → PASS
```bash
git add src/components/plan/slides/SlideView.tsx src/components/plan/slides/DeckRenderer.tsx
git commit -m "refactor(slides): extract shared SlideView, classed layouts + footer"
```

---

### Task 6: SVG chart components

**Files:**
- Create: `src/components/plan/slides/charts/scale.ts`
- Create: `src/components/plan/slides/charts/BarChart.tsx`
- Create: `src/components/plan/slides/charts/LineChart.tsx`
- Create: `src/components/plan/slides/charts/DonutChart.tsx`

**Interfaces:**
- Consumes: `ChartSeries`, `Segment` (deck.ts); `ThemeDef.ramp` via a `ramp: string[]` prop and an `accent: string` prop (both hex without `#`, caller prefixes `#`).
- Produces: `BarChart({ categories, series, accent, ramp })`, `LineChart({ categories, series, accent, ramp })`, `DonutChart({ segments, accent, ramp })` — each returns an accessible `<svg role="img">`.

- [ ] **Step 1: `scale.ts` — linear scale + nice max**

```ts
export function niceMax(v: number): number {
  if (v <= 0) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / mag;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * mag;
}
export const color = (hex: string) => (hex.startsWith('#') ? hex : `#${hex}`);
export const pick = (ramp: string[], i: number, fallback: string) => color(ramp[i % ramp.length] ?? fallback);
```

- [ ] **Step 2: `BarChart.tsx`**

```tsx
import type { ChartSeries } from '@/lib/slides/deck';
import { niceMax, color, pick } from './scale';

export function BarChart({ categories, series, accent, ramp }: {
  categories: string[]; series: ChartSeries[]; accent: string; ramp: string[];
}) {
  const W = 800, H = 380, padL = 48, padB = 40, padT = 16, padR = 16;
  const max = niceMax(Math.max(1, ...series.flatMap((s) => s.values)));
  const iw = W - padL - padR, ih = H - padT - padB;
  const groupW = iw / categories.length;
  const barW = (groupW * 0.7) / series.length;
  const y = (v: number) => padT + ih - (v / max) * ih;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Bar chart: ${series.map((s) => s.name).join(', ')}`}>
      {[0, 0.5, 1].map((f) => (
        <g key={f}><line x1={padL} x2={W - padR} y1={y(max * f)} y2={y(max * f)} stroke="currentColor" opacity={0.12} />
          <text x={padL - 6} y={y(max * f) + 4} textAnchor="end" fontSize={11} fill="currentColor" opacity={0.6}>{Math.round(max * f)}</text></g>
      ))}
      {categories.map((cat, ci) => (
        <g key={ci}>
          {series.map((s, si) => {
            const x = padL + ci * groupW + groupW * 0.15 + si * barW;
            const h = (s.values[ci] / max) * ih;
            return <rect key={si} x={x} y={padT + ih - h} width={barW - 2} height={h} fill={series.length > 1 ? pick(ramp, si, accent) : color(accent)} rx={2} />;
          })}
          <text x={padL + ci * groupW + groupW / 2} y={H - padB + 16} textAnchor="middle" fontSize={12} fill="currentColor" opacity={0.7}>{cat}</text>
        </g>
      ))}
    </svg>
  );
}
```

- [ ] **Step 3: `LineChart.tsx`**

```tsx
import type { ChartSeries } from '@/lib/slides/deck';
import { niceMax, color, pick } from './scale';

export function LineChart({ categories, series, accent, ramp }: {
  categories: string[]; series: ChartSeries[]; accent: string; ramp: string[];
}) {
  const W = 800, H = 380, padL = 48, padB = 40, padT = 16, padR = 16;
  const max = niceMax(Math.max(1, ...series.flatMap((s) => s.values)));
  const iw = W - padL - padR, ih = H - padT - padB;
  const x = (i: number) => padL + (categories.length === 1 ? iw / 2 : (i / (categories.length - 1)) * iw);
  const y = (v: number) => padT + ih - (v / max) * ih;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Line chart: ${series.map((s) => s.name).join(', ')}`}>
      {[0, 0.5, 1].map((f) => (
        <g key={f}><line x1={padL} x2={W - padR} y1={y(max * f)} y2={y(max * f)} stroke="currentColor" opacity={0.12} />
          <text x={padL - 6} y={y(max * f) + 4} textAnchor="end" fontSize={11} fill="currentColor" opacity={0.6}>{Math.round(max * f)}</text></g>
      ))}
      {series.map((s, si) => (
        <polyline key={si} fill="none" strokeWidth={3} stroke={series.length > 1 ? pick(ramp, si, accent) : color(accent)}
          points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')} />
      ))}
      {categories.map((cat, i) => (
        <text key={i} x={x(i)} y={H - padB + 16} textAnchor="middle" fontSize={12} fill="currentColor" opacity={0.7}>{cat}</text>
      ))}
    </svg>
  );
}
```

- [ ] **Step 4: `DonutChart.tsx`**

```tsx
import type { Segment } from '@/lib/slides/deck';
import { color, pick } from './scale';

export function DonutChart({ segments, accent, ramp }: { segments: Segment[]; accent: string; ramp: string[] }) {
  const W = 800, H = 380, cx = 200, cy = H / 2, r = 130, thick = 46;
  const total = Math.max(1, segments.reduce((a, s) => a + s.value, 0));
  let angle = -Math.PI / 2;
  const arc = (frac: number) => {
    const a0 = angle, a1 = angle + frac * Math.PI * 2; angle = a1;
    const p = (a: number, rad: number) => `${cx + Math.cos(a) * rad} ${cy + Math.sin(a) * rad}`;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M ${p(a0, r)} A ${r} ${r} 0 ${large} 1 ${p(a1, r)} L ${p(a1, r - thick)} A ${r - thick} ${r - thick} 0 ${large} 0 ${p(a0, r - thick)} Z`;
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Donut chart: ${segments.map((s) => s.label).join(', ')}`}>
      {segments.map((s, i) => <path key={i} d={arc(s.value / total)} fill={pick(ramp, i, accent)} />)}
      {segments.map((s, i) => (
        <g key={i} transform={`translate(${W / 2 + 40}, ${cy - segments.length * 14 + i * 28})`}>
          <rect width={14} height={14} rx={3} fill={pick(ramp, i, accent)} />
          <text x={22} y={12} fontSize={15} fill="currentColor">{s.label} · {Math.round((s.value / total) * 100)}%</text>
        </g>
      ))}
    </svg>
  );
}
```

- [ ] **Step 5: Type-check + commit**

Run: `npx tsc --noEmit` → PASS
```bash
git add src/components/plan/slides/charts/
git commit -m "feat(slides): accessible SVG bar/line/donut chart components"
```

---

### Task 7: Render kpi + chart layouts in `SlideView`

**Files:**
- Modify: `src/components/plan/slides/SlideView.tsx`

**Interfaces:**
- Consumes: chart components (Task 6), `themeDef` (Task 1).

- [ ] **Step 1: Import the charts + theme ramp**

At the top of `SlideView.tsx` add:
```tsx
import { themeDef, type ThemeId } from '@/lib/slides/themes';
import { BarChart } from './charts/BarChart';
import { LineChart } from './charts/LineChart';
import { DonutChart } from './charts/DonutChart';
```

- [ ] **Step 2: Replace the `default:` case with the four layouts**

Compute the ramp once inside `SlideView` (before `switch`):
```tsx
  const td = themeDef(theme as ThemeId);
  const accent = td.swatch.accent, ramp = td.ramp;
```
Replace the `default:` return with:
```tsx
    case 'kpi': return frame(<><h2 className="slide-heading">{slide.heading}</h2><div className="slide-kpis">{slide.kpis.map((k, i) => <div key={i}><div className="slide-kpi-value">{k.value}</div><div className="slide-kpi-label">{k.label}</div></div>)}</div><div /></>);
    case 'barChart': return frame(<><h2 className="slide-heading">{slide.heading}</h2><div className="slide-chart-wrap"><BarChart categories={slide.categories} series={slide.series} accent={accent} ramp={ramp} /></div>{slide.note && <p className="slide-note">{slide.note}</p>}</>);
    case 'lineChart': return frame(<><h2 className="slide-heading">{slide.heading}</h2><div className="slide-chart-wrap"><LineChart categories={slide.categories} series={slide.series} accent={accent} ramp={ramp} /></div>{slide.note && <p className="slide-note">{slide.note}</p>}</>);
    case 'donutChart': return frame(<><h2 className="slide-heading">{slide.heading}</h2><div className="slide-chart-wrap"><DonutChart segments={slide.segments} accent={accent} ramp={ramp} /></div>{slide.note && <p className="slide-note">{slide.note}</p>}</>);
```
(The `switch` is now exhaustive over all 12 layouts; keep a final `default: return null;` to satisfy TS.)

- [ ] **Step 3: Type-check + commit**

Run: `npx tsc --noEmit` → PASS
```bash
git add src/components/plan/slides/SlideView.tsx
git commit -m "feat(slides): render kpi + chart layouts in SlideView"
```

---

### Task 8: PPTX export — registry colors + native charts + notes

**Files:**
- Modify: `src/lib/slides/pptx.ts`

**Interfaces:**
- Consumes: `themeDef` (Task 1), new layouts + `notes` (Task 2).

- [ ] **Step 1: Source colors from the registry**

Replace the top of `pptx.ts` (the local `THEME_COLORS` map) with:
```ts
import PptxGenJS from 'pptxgenjs';
import type { Deck, Slide } from './deck';
import { themeDef, type ThemeId } from './themes';

function colorsFor(theme: string) {
  const d = themeDef(theme as ThemeId);
  return { bg: d.swatch.bg, fg: d.swatch.fg, accent: d.swatch.accent, ramp: d.ramp };
}
```
Update `deckToPptx` to use `const c = colorsFor(deck.theme);` instead of the old `THEME_COLORS[...]` lookup.

- [ ] **Step 2: Change `addSlide`'s color param type**

`addSlide(pptx, s, c)` where `c: { bg: string; fg: string; accent: string; ramp: string[] }`. Keep the existing 8 cases unchanged.

- [ ] **Step 3: Add the four new cases + notes**

Inside `addSlide`, add before the closing brace of the `switch`:
```ts
    case 'kpi': {
      body(s.heading, 0.6, { fontSize: 22, bold: true });
      const n = s.kpis.length, w = 9 / n;
      s.kpis.forEach((k, i) => {
        slide.addText(k.value, { x: 0.6 + i * w, y: 1.8, w, h: 1.2, color: c.accent, fontSize: 40, bold: true, align: 'center' });
        slide.addText(k.label, { x: 0.6 + i * w, y: 3.0, w, color: c.fg, fontSize: 14, align: 'center' });
      });
      break;
    }
    case 'barChart':
    case 'lineChart': {
      body(s.heading, 0.5, { fontSize: 22, bold: true });
      const type = s.layout === 'barChart' ? pptx.ChartType.bar : pptx.ChartType.line;
      const data = s.series.map((ser) => ({ name: ser.name, labels: s.categories, values: ser.values }));
      slide.addChart(type, data, {
        x: 0.6, y: 1.3, w: 8.8, h: 3.6, showLegend: s.series.length > 1, legendPos: 'b',
        chartColors: s.series.length > 1 ? c.ramp : [c.accent],
        catAxisLabelColor: c.fg, valAxisLabelColor: c.fg, showValue: false,
      });
      break;
    }
    case 'donutChart': {
      body(s.heading, 0.5, { fontSize: 22, bold: true });
      slide.addChart(pptx.ChartType.doughnut, [{ name: s.heading, labels: s.segments.map((x) => x.label), values: s.segments.map((x) => x.value) }], {
        x: 0.6, y: 1.3, w: 8.8, h: 3.6, showLegend: true, legendPos: 'r', chartColors: c.ramp, holeSize: 55,
      });
      break;
    }
```
Then, after the `switch` (still inside `addSlide`), append notes:
```ts
  if (s.notes) slide.addNotes(s.notes);
```

- [ ] **Step 4: Build (exercises the PPTX path via type-check) + commit**

Run: `npx tsc --noEmit` → PASS
```bash
git add src/lib/slides/pptx.ts
git commit -m "feat(slides): native editable PPTX charts, KPI tiles, speaker notes export"
```

---

### Task 9: Pipeline prompts — chart/KPI guidance + always-on notes

**Files:**
- Modify: `src/lib/slides/prompts.ts`
- Modify: `src/lib/slides/estimate.ts`

**Interfaces:**
- Consumes: new layouts (Task 2). No signature changes — `pipeline.ts` and the SSE contract are untouched.

- [ ] **Step 1: Extend `SCHEMA_DOC` in `prompts.ts`**

Add these layout lines to the `SCHEMA_DOC` template string list, after the `closing` line:
```
- {"layout":"kpi","heading":"...","kpis":[{"value":"3.2x","label":"ROI"}]}  (2–4 tiles)
- {"layout":"barChart","heading":"...","categories":["Q1","Q2"],"series":[{"name":"2026","values":[10,20]}]}  (values length == categories length)
- {"layout":"lineChart","heading":"...","categories":["Jan","Feb"],"series":[{"name":"Users","values":[3,7]}]}
- {"layout":"donutChart","heading":"...","segments":[{"label":"Cloud","value":60},{"label":"On-prem","value":40}]}
```
And append this line to `SCHEMA_DOC` after the layout list:
```
Every slide object MAY include "notes":"..." — a 1–2 sentence speaker note in the presenter's voice.
```

- [ ] **Step 2: Strengthen `VOICE` / draft guidance**

In `prompts.ts`, append to the `VOICE` constant:
```
- When the brief contains numbers, prefer a data/kpi/barChart/lineChart/donutChart slide over prose. NEVER invent numbers — every chart value must trace to a number in the brief.
- ALWAYS include "notes" on every slide: what the presenter says out loud, not a repeat of the on-slide text.
```

- [ ] **Step 3: Bump the draft token budget in `estimate.ts`**

Open `src/lib/slides/estimate.ts`; increase `STEP_BUDGET.draft` by ~40% (notes + chart JSON add output tokens). Example — if it is `2200`, set `3000`. Leave `outline`/`critic` as-is. Adjust the exact number to keep it proportional; the wizard cost estimate reads from this automatically.

- [ ] **Step 4: Type-check + commit**

Run: `npx tsc --noEmit` → PASS
```bash
git add src/lib/slides/prompts.ts src/lib/slides/estimate.ts
git commit -m "feat(slides): prompt guidance for charts/KPIs + always-on speaker notes"
```

---

### Task 10: Present mode overlay

**Files:**
- Create: `src/components/plan/slides/PresentOverlay.tsx`
- Modify: `src/components/plan/slides/SlidesPanel.tsx` (add the Present button + state; pass `projectName`)

**Interfaces:**
- Consumes: `SlideView` (Task 5), `Deck` (deck.ts), `usePlanT`.
- Produces: `PresentOverlay({ deck, project, onClose }: { deck: Deck; project: string; onClose: () => void })`.

- [ ] **Step 1: Create `PresentOverlay.tsx`**

```tsx
'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Deck } from '@/lib/slides/deck';
import { SlideView } from './SlideView';
import { usePlanT } from '@/components/plan/LangContext';

export function PresentOverlay({ deck, project, onClose }: { deck: Deck; project: string; onClose: () => void }) {
  const { t } = usePlanT();
  const [i, setI] = useState(0);
  const [notesOpen, setNotesOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const total = deck.slides.length;
  const next = useCallback(() => setI((v) => Math.min(v + 1, total - 1)), [total]);
  const prev = useCallback(() => setI((v) => Math.max(v - 1, 0)), []);

  useEffect(() => {
    ref.current?.requestFullscreen?.().catch(() => {});
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
      else if (e.key === 'Escape') { /* fullscreenchange handler closes */ if (!document.fullscreenElement) onClose(); }
      else if (e.key.toLowerCase() === 's') setNotesOpen((v) => !v);
      else if (e.key.toLowerCase() === 'f') { document.fullscreenElement ? document.exitFullscreen() : ref.current?.requestFullscreen?.(); }
    };
    const onFsChange = () => { if (!document.fullscreenElement) onClose(); };
    window.addEventListener('keydown', onKey);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('fullscreenchange', onFsChange); };
  }, [next, prev, onClose]);

  const current = deck.slides[i];
  return (
    <div ref={ref} style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#000', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: 'min(100%, 177.78vh)', aspectRatio: '16/9' }}
          onClick={(e) => (e.clientX < window.innerWidth / 2 ? prev() : next())}>
          <SlideView slide={current} theme={deck.theme} footer={{ index: i + 1, total, project }} />
        </div>
      </div>
      {notesOpen && (
        <div style={{ maxHeight: '22vh', overflow: 'auto', padding: '12px 24px', background: '#111', color: '#eee', fontSize: 15, lineHeight: 1.5 }}>
          <div style={{ opacity: 0.5, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>{t('slides.present.notes')}</div>
          {current.notes || t('slides.present.noNotes')}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', background: '#000', color: '#888', fontSize: 12 }}>
        <span>{t('slides.present.exitHint')}</span>
        <span>{t('slides.present.counter', { cur: i + 1, total })}</span>
      </div>
      <div style={{ height: 3, background: '#222' }}><div style={{ height: '100%', width: `${((i + 1) / total) * 100}%`, background: 'var(--feature-color)' }} /></div>
    </div>
  );
}
```

- [ ] **Step 2: Wire the Present button into `SlidesPanel.tsx`**

Add imports:
```tsx
import { PresentOverlay } from './PresentOverlay';
```
Add a prop `projectName: string` to the `SlidesPanel` signature and a state `const [presenting, setPresenting] = useState(false);`. In the deck pane, next to `<ExportButtons .../>`, add a Present button (shown only when `shown`):
```tsx
<button onClick={() => setPresenting(true)} style={{ padding: '6px 12px', border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', color: 'inherit', marginBottom: 12 }}>
  {t('slides.present.button')}
</button>
```
Pass `project={projectName}` to `<DeckRenderer deck={shown} project={projectName} />`. At the end of the returned JSX (after the closing grid `</div>`), render the overlay:
```tsx
{presenting && shown && <PresentOverlay deck={shown} project={projectName} onClose={() => setPresenting(false)} />}
```
Wrap the existing return in a fragment if needed so the overlay is a sibling of the grid.

- [ ] **Step 3: Pass `projectName` from the page**

In `src/app/plan/(app)/[projectId]/slides/page.tsx`, add `projectName={project.name}` to the `<SlidesPanel ... />` props.

- [ ] **Step 4: Type-check + commit**

Run: `npx tsc --noEmit` → PASS
```bash
git add src/components/plan/slides/PresentOverlay.tsx src/components/plan/slides/SlidesPanel.tsx "src/app/plan/(app)/[projectId]/slides/page.tsx"
git commit -m "feat(slides): fullscreen Present mode with keyboard nav + speaker notes"
```

---

### Task 11: Wizard — theme swatches + audience picker + ui primitives

**Files:**
- Modify: `src/components/plan/slides/GenerateWizard.tsx`
- Modify: `src/components/plan/slides/SlidesPanel.tsx` (thread `audience` into `generate`)

**Interfaces:**
- Consumes: `THEME_DEFS` (Task 1), `inputCls`/`btnPrimary` (`ui.tsx`), i18n audience keys (Task 3).
- Produces: `onGenerate` opts now include `audience: string` (already accepted by the generate route as `body.audience`).

- [ ] **Step 1: Rebuild `GenerateWizard.tsx`**

```tsx
'use client';
import { useState } from 'react';
import { THEME_DEFS } from '@/lib/slides/themes';
import type { ThemeId } from '@/lib/slides/deck';
import { estimateCost } from '@/lib/slides/estimate';
import { usePlanT } from '@/components/plan/LangContext';
import { inputCls, btnPrimary } from '@/components/plan/ui';

const AUDIENCES = [
  { key: 'exec', value: 'executives' }, { key: 'investor', value: 'investors' },
  { key: 'team', value: 'the internal team' }, { key: 'client', value: 'the client' },
] as const;

export function GenerateWizard({ audience: _seed, onGenerate, busy }: {
  audience: string; onGenerate: (o: { theme: ThemeId; slideCount: number; extra: string; audience: string }) => void; busy: boolean;
}) {
  const { t } = usePlanT();
  const [theme, setTheme] = useState<ThemeId>('keynote');
  const [slideCount, setSlideCount] = useState(8);
  const [extra, setExtra] = useState('');
  const [audKey, setAudKey] = useState<string>('exec');
  const [custom, setCustom] = useState('');
  const audience = audKey === 'custom' ? custom : (AUDIENCES.find((a) => a.key === audKey)?.value ?? 'executives');

  return (
    <div style={{ display: 'grid', gap: 14, border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
      <div>
        <div className="slide-kicker" style={{ marginBottom: 8 }}>{t('slides.wizard.theme')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {THEME_DEFS.map((td) => (
            <button key={td.id} type="button" onClick={() => setTheme(td.id)}
              style={{ border: theme === td.id ? '2px solid var(--feature-color)' : '1px solid var(--border)', borderRadius: 8, padding: 0, overflow: 'hidden', cursor: 'pointer', background: 'transparent' }}>
              <div style={{ height: 44, background: `#${td.swatch.bg}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: `#${td.swatch.accent}`, fontWeight: 800, fontSize: 18 }}>Aa</span>
              </div>
              <div style={{ fontSize: 11, padding: '4px 0' }}>{td.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="slide-kicker" style={{ marginBottom: 8 }}>{t('slides.wizard.audienceLabel')}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[...AUDIENCES, { key: 'custom', value: '' }].map((a) => (
            <button key={a.key} type="button" onClick={() => setAudKey(a.key)}
              style={{ padding: '5px 10px', borderRadius: 999, fontSize: 12, cursor: 'pointer',
                border: audKey === a.key ? '1px solid var(--feature-color)' : '1px solid var(--border)',
                background: audKey === a.key ? 'color-mix(in srgb, var(--feature-color) 12%, transparent)' : 'transparent', color: 'inherit' }}>
              {t(`slides.wizard.audience.${a.key}` as Parameters<typeof t>[0])}
            </button>
          ))}
        </div>
        {audKey === 'custom' && (
          <input className={inputCls} style={{ marginTop: 8 }} value={custom} onChange={(e) => setCustom(e.target.value)} placeholder={t('slides.wizard.audience.custom')} />
        )}
      </div>

      <label style={{ fontSize: 13 }}>{t('slides.wizard.slides')}: {slideCount}
        <input type="range" min={3} max={20} value={slideCount} onChange={(e) => setSlideCount(Number(e.target.value))} style={{ width: '100%' }} />
      </label>

      <textarea className={inputCls} placeholder={t('slides.wizard.extraPlaceholder')} rows={2} value={extra} onChange={(e) => setExtra(e.target.value)} />
      <div style={{ fontSize: 12, opacity: 0.6 }}>{t('slides.wizard.notesInfo')}</div>
      <div style={{ fontSize: 12, opacity: 0.7 }}>{t('slides.wizard.estCost')}: ${estimateCost(slideCount).toFixed(3)}</div>
      <button disabled={busy} onClick={() => onGenerate({ theme, slideCount, extra, audience })} className={btnPrimary}>
        {busy ? t('slides.wizard.generating') : t('slides.wizard.generate')}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Thread `audience` through `SlidesPanel.generate`**

In `SlidesPanel.tsx`, change the `generate` signature to accept `audience`:
```tsx
async function generate(opts: { theme: ThemeId; slideCount: number; extra: string; audience: string }) {
```
The `fetch` body already serializes `opts`, so `audience` now reaches `body.audience` in the generate route (already read there). No route change needed.

- [ ] **Step 3: Type-check + commit**

Run: `npx tsc --noEmit` → PASS
```bash
git add src/components/plan/slides/GenerateWizard.tsx src/components/plan/slides/SlidesPanel.tsx
git commit -m "feat(slides): wizard theme swatches + audience persona picker on plan primitives"
```

---

### Task 12: Version filmstrip — thumbnails + timestamps

**Files:**
- Modify: `src/components/plan/slides/VersionSwitcher.tsx`
- Modify: `src/components/plan/slides/SlidesPanel.tsx` (extend `Version` type with `createdAt`)
- Modify: `src/app/plan/(app)/[projectId]/slides/page.tsx` (map `createdAt` into the version list)

**Interfaces:**
- Consumes: `SlideView` (Task 5), i18n version keys (Task 3), `deck_version.createdAt` (already selected by `listDeckVersions`).
- Produces: `Version` type gains `createdAt: string`.

- [ ] **Step 1: Extend the `Version` type + pass `createdAt`**

In `SlidesPanel.tsx`, change:
```tsx
type Version = { versionNo: number; deck: Deck; meta: { costUsd: number; lintFixed: number }; createdAt: string };
```
When appending from the SSE `done` event, add `createdAt: new Date().toISOString()`:
```tsx
setVersions((vs) => [{ versionNo: ev.versionNo, deck: ev.deck, meta: ev.meta, createdAt: new Date().toISOString() }, ...vs]);
```

In `page.tsx`, map `createdAt` (it is a `Date` from Drizzle — serialize to ISO):
```tsx
initialVersions={versions.map((v) => ({
  versionNo: v.versionNo,
  deck: v.deckJson as Deck,
  meta: v.metaJson as { costUsd: number; lintFixed: number },
  createdAt: v.createdAt.toISOString(),
}))}
```

- [ ] **Step 2: Rebuild `VersionSwitcher.tsx` as a filmstrip**

```tsx
'use client';
import type { Deck } from '@/lib/slides/deck';
import { SlideView } from './SlideView';
import { usePlanT } from '@/components/plan/LangContext';
import type { PlanKey } from '@/lib/plan/i18n';

type Version = { versionNo: number; deck: Deck; meta: { costUsd: number; lintFixed: number }; createdAt: string };

function useRel() {
  const { t } = usePlanT();
  return (iso: string) => {
    const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 1) return t('slides.versions.justNow');
    if (mins < 60) return t('slides.versions.minsAgo', { n: mins });
    if (mins < 1440) return t('slides.versions.hrsAgo', { n: Math.round(mins / 60) });
    return t('slides.versions.daysAgo', { n: Math.round(mins / 1440) });
  };
}

export function VersionSwitcher({ versions, onPick, disabled, activeVersionNo }: {
  versions: Version[]; onPick: (d: Deck, versionNo: number) => void; disabled?: boolean; activeVersionNo: number | null;
}) {
  const { t } = usePlanT();
  const rel = useRel();
  return (
    <div>
      <div className="slide-kicker" style={{ marginBottom: 8 }}>{t('slides.versions.title')}</div>
      <div style={{ display: 'grid', gap: 8 }}>
        {versions.map((v) => (
          <button key={v.versionNo} disabled={disabled} onClick={() => onPick(v.deck, v.versionNo)}
            style={{ display: 'grid', gridTemplateColumns: '96px 1fr', gap: 10, alignItems: 'center', textAlign: 'left', padding: 6,
              border: activeVersionNo === v.versionNo ? '1px solid var(--feature-color)' : '1px solid var(--border)', borderRadius: 8, background: 'transparent', color: 'inherit', cursor: 'pointer' }}>
            <div style={{ width: 96, aspectRatio: '16/9', overflow: 'hidden', borderRadius: 4, pointerEvents: 'none' }}>
              <div style={{ width: 480, transform: 'scale(0.2)', transformOrigin: 'top left' }}>
                <SlideView slide={v.deck.slides[0]} theme={v.deck.theme} />
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>v{v.versionNo} {activeVersionNo === v.versionNo && <span style={{ fontSize: 11, opacity: 0.6 }}>· {t('slides.versions.current')}</span>}</div>
              <div style={{ fontSize: 12, opacity: 0.6 }}>{rel(v.createdAt)}</div>
              <div style={{ fontSize: 11, opacity: 0.45 }}>{t('slides.versions.cost', { cost: v.meta.costUsd?.toFixed(3) ?? '—', fixed: v.meta.lintFixed ?? 0 })}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Pass `activeVersionNo` from `SlidesPanel`**

In `SlidesPanel.tsx`, update the `VersionSwitcher` usage to pass `activeVersionNo={shownVersionNo}`.

- [ ] **Step 4: Type-check + commit**

Run: `npx tsc --noEmit` → PASS
```bash
git add src/components/plan/slides/VersionSwitcher.tsx src/components/plan/slides/SlidesPanel.tsx "src/app/plan/(app)/[projectId]/slides/page.tsx"
git commit -m "feat(slides): version filmstrip with thumbnails + relative timestamps"
```

---

### Task 13: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: no errors. Fix any `react-hooks/set-state-in-effect` or unused-var findings inline (the repo's ESLint is strict).

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Build (both with and without DATABASE_URL)**

Run: `npm run build`
Expected: success; build output still shows `ƒ Proxy (Middleware)`.
Run: `env -u DATABASE_URL npm run build`
Expected: success (repo invariant — must not crash on missing `DATABASE_URL`).

- [ ] **Step 4: Manual smoke (dev server)**

Run: `npm run dev`, sign in as an editor/admin, open a project with numeric tasks, go to `✦ AI Slide`:
- Generate a deck → confirm at least one chart/KPI slide + speaker notes present in the stream/result.
- Click **▶ Present** → fullscreen; `→/←` navigate, counter updates, `S` toggles notes, `Esc` exits.
- **Export PPTX** → open in PowerPoint/Keynote: charts are native/editable, speaker notes present.
- **Export PDF** (print) → only the deck prints (`.print-root` isolation intact).
- Switch all 6 themes in the wizard; confirm fonts + palettes render and no `font-src`/`style-src` CSP violation in the console.
- Toggle TH/EN; confirm all new strings translate.

- [ ] **Step 5: Final commit (if any lint fixes were made)**

```bash
git add -A
git commit -m "chore(slides): v2 verification fixes"
```

---

## Self-Review

**Spec coverage:**
- Present mode (spec §Present mode) → Task 10. ✓
- 6 themes + next/font + classed CSS + footer (spec §Themes) → Tasks 1, 4, 5. ✓
- SlideView extraction (spec §SlideView) → Task 5. ✓
- Chart/KPI layouts + validators (spec §Data model, §Charts) → Tasks 2, 6, 7. ✓
- Native PPTX charts + notes export (spec §PPTX) → Task 8. ✓
- Speaker notes always-on (spec §Speaker notes) → Tasks 2 (schema), 9 (generation), 8 (export), 10 (present). ✓
- Prompts/budget (spec §Pipeline) → Task 9. ✓
- Wizard swatches + audience + ui primitives (spec §Wizard) → Task 11. ✓
- Version filmstrip (spec §Wizard/versions) → Task 12. ✓
- i18n (spec §i18n) → Task 3. ✓
- CSP verify, both-build invariant (spec §Testing) → Tasks 4, 13. ✓
- No migration (spec §scope) → honored; no `drizzle-kit push` step anywhere. ✓

**Placeholder scan:** No TBD/TODO; every code step shows full code. The one intentionally-deferred value (`STEP_BUDGET.draft` exact number, Task 9 Step 3) reads the current value and gives a concrete formula + example because the current constant isn't in front of us — acceptable and bounded.

**Type consistency:** `SlideView` prop shape (`{ slide, theme, footer }`) is identical in Tasks 5, 7, 10, 12. `Version` type gains `createdAt: string` in Task 12 consistently across `SlidesPanel` + `page` + `VersionSwitcher`. `onGenerate` opts include `audience` in both Task 11 (wizard) and the `SlidesPanel.generate` signature. Chart component props (`categories/series/segments/accent/ramp`) match between Task 6 (definition) and Task 7 (usage). `colorsFor` returns `{bg,fg,accent,ramp}` matching `addSlide`'s `c` param in Task 8.
