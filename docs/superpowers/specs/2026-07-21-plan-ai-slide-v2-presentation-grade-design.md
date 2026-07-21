# AI Slide Add-on v2 — "Presentation-Grade"

**Date:** 2026-07-21
**Repo:** `nanoteofficial.me` (`/plan` module)
**Builds on:** `2026-07-21-plan-ai-slide-addon-design.md` (v0.2.8 — the AI Slide Generator this upgrades)
**Status:** approved, pending implementation plan

## Motivation

v0.2.8 shipped a genuinely strong *content* engine (4-step anti-slop pipeline, strict
discriminated-union slide schema, versioned decks, PPTX/PDF export). The gap is the
*presentation* layer: decks render as a vertical scroll of inline-styled boxes, there is no
way to actually present, only 3 themes on a single system font, no charts, and no speaker
notes. This upgrade closes that gap so a generated deck reads as *designed* and is ready to
stand up in front of an audience — on the web, in Present mode, and in PowerPoint.

Non-goals: no changes to auth/roles, no new plan entity, no rework of the generation
pipeline's outline→draft→lint→critic shape, no unrelated refactoring outside the slide module.

## Scope summary (approved decisions)

1. **Present mode** — in-page fullscreen overlay (Fullscreen API), one slide at a time.
2. **Themes** — expand 3 → 6, each with a self-hosted `next/font` display+body pairing;
   refactor inline-style layouts into consistent themed CSS; add a slide footer.
3. **Charts** — multiple chart layouts (`barChart`, `lineChart`, `donutChart`) + a `kpi` row,
   carrying structured series/category data, rendered as accessible SVG.
4. **Chart export** — native, editable PowerPoint charts via `pptx.addChart`.
5. **Speaker notes** — always generated in the pipeline; shown in Present mode; exported to
   PPTX notes.
6. **Wizard + version polish** — theme swatch cards on `plan/ui.tsx` primitives, an audience
   persona picker (audience is already plumbed end-to-end, just unexposed), and a version
   filmstrip with thumbnails + timestamps.

**No database migration required.** `notes` and the new layouts are JSON inside the existing
`deck_version.deckJson`; `deck_version.createdAt` already exists for filmstrip timestamps.

## Data model — `src/lib/slides/deck.ts`

### Speaker notes on every slide

Wrap the existing union so notes attach uniformly without repeating the field per member:

```ts
type SlideBody =
  | { layout: 'title'; title: string; subtitle?: string }
  | ... existing 7 ...
  | { layout: 'kpi'; heading: string; kpis: { value: string; label: string }[] }
  | { layout: 'barChart'; heading: string; categories: string[]; series: ChartSeries[]; note?: string }
  | { layout: 'lineChart'; heading: string; categories: string[]; series: ChartSeries[]; note?: string }
  | { layout: 'donutChart'; heading: string; segments: Segment[]; note?: string };

export type Slide = SlideBody & { notes?: string };

interface ChartSeries { name: string; values: number[] }
interface Segment { label: string; value: number }
```

### New layouts

- **`kpi`** — `heading` + 2–4 `{ value, label }` tiles (e.g. `{"value":"3.2x","label":"ROI"}`).
- **`barChart` / `lineChart`** — `heading`, `categories` (x-axis labels), and one or more
  `series` (`name` + `values`, `values.length === categories.length`), optional `note`.
- **`donutChart`** — `heading` + `segments` (`{ label, value }`), optional `note`.

Structured (not pre-rendered) data is deliberate: the *same* object feeds the SVG web render
**and** `pptx.addChart`, so web and PowerPoint stay in sync.

### Validation

`validateSlideFields` gains cases for the 4 layouts. New helpers:
- `isNumArray(v): v is number[]`
- `isChartSeries(v)` — `name` string + `values` num-array
- series validation asserts `every(s => s.values.length === categories.length)` and
  `categories.length >= 1`, `series.length >= 1`.
- `isSegment(v)`, and `segments.length >= 1`.
- `kpis` — array of `{ value: string, label: string }`, length 2–4.

`validateDeck` also type-checks `notes` (optional string) on every slide after the
layout-specific check. The existing 8 layouts and already-stored decks remain valid
(backward-compatible), so old versions render unchanged.

`LAYOUTS` set and `Slide['layout']` grow accordingly. `THEMES` allow-list grows (see below).

## Themes — `src/lib/slides/themes.ts` (new) + `deck-themes.css`

### Single source of truth

Today the theme definition is duplicated across three places: the `THEMES` array +
CSS `[data-theme]` blocks in `deck-themes.css` + the `THEME_COLORS` map in `pptx.ts`. Introduce
one registry:

```ts
// src/lib/slides/themes.ts
export interface ThemeDef {
  id: ThemeId;
  label: string;                 // shown on the wizard swatch
  swatch: { bg: string; fg: string; accent: string };   // hex, drives swatch + PPTX
  ramp: string[];                // small categorical ramp for multi-series charts
  displayVar: string; bodyVar: string;                   // CSS var names for next/font
}
export const THEME_DEFS: ThemeDef[] = [...];
export const THEMES = THEME_DEFS.map(t => t.id);         // validation allow-list
```

`deck.ts` re-exports `THEMES`/`ThemeId` from here (keeps existing imports working).
`pptx.ts` reads `swatch`/`ramp` from the registry instead of its own map.

### The six themes

| id | look | palette (bg / fg / accent) | display / body |
|----|------|-----------------------------|----------------|
| `midnight` | dark, cool (kept) | `#0b0e14` / `#eef1f6` / `#5cc8ff` | Space Grotesk / Inter |
| `editorial` | warm paper (kept) | `#f7f6f2` / `#17140f` / `#c8452d` | Fraunces / Inter |
| `grid` | techno dark (kept) | `#111` / `#fff` / `#e8ff00` | Archivo / JetBrains Mono accents |
| `keynote` | light corporate | `#ffffff` / `#141821` / `#3b4fbf` (brand navy) | Inter Tight / Inter |
| `mono` | bold monochrome | `#0a0a0a` / `#fafafa` / `#fafafa` | Archivo Black / Inter |
| `sunrise` | warm light | `#fff8f0` / `#231a12` / `#e8622a` | Fraunces / Inter |

Exact hex values are finalized in the plan; the intent above is binding.

### Fonts — `next/font` (CSP-safe)

Pairings load via `next/font/google` in a small module that exposes CSS variables; each theme's
`.slide[data-theme=...]` sets `--slide-font-display` / `--slide-font-body`. `next/font`
self-hosts under `/_next` at build, so **no external font request** — but the plan MUST verify
`next.config.ts` CSP (`font-src`, `style-src`) still passes after adding them; if `font-src`
lacks `'self'`, add it. This is a listed verification step, not an assumption.

### Layout CSS refactor + footer

All inline styles currently in `DeckRenderer`'s `SlideView` move into classed, themed rules in
`deck-themes.css` (`.slide-title`, `.slide-kicker`, `.slide-stat`, `.slide-bullets`,
`.slide-compare`, `.slide-quote`, `.slide-kpi`, `.slide-chart`, …) so every layout shares
margins, vertical rhythm, and type scale per theme. Add a **`.slide-footer`** (slide number +
project name) rendered on content slides (not title/closing). The `@media print` block is
preserved and extended to the new layouts.

## SlideView extraction — `src/components/plan/slides/SlideView.tsx` (new)

`SlideView` (currently inline in `DeckRenderer.tsx`) is extracted to its own file and exported.
`DeckRenderer`, `PresentOverlay`, and the version-filmstrip thumbnail all import the *same*
`SlideView`, guaranteeing preview = present = thumbnail parity (export parity is enforced
separately by driving PPTX from the same `Slide` data). `SlideView` gains an optional
`footer?: { index: number; total: number; project: string }` prop for the footer.

## Charts — `src/components/plan/slides/charts/*` (new)

Hand-rolled SVG components (no chart library), following the existing `company` repo's
`charts/` approach and the `dataviz` skill for palette/accessibility:

- `BarChart.tsx`, `LineChart.tsx`, `DonutChart.tsx` — pure, take the layout's structured data +
  `accent` + `ramp` (for multi-series), and render `<svg role="img">` with `<title>`/`<desc>`.
- Single-series uses the theme accent; multi-series cycles the theme `ramp`.
- A tiny shared `axis`/`scale` helper (linear scale, nice ticks) kept local to `charts/`.

`SlideView` renders `<BarChart .../>` etc. for the chart layouts and a KPI tile grid for `kpi`.

## Present mode — `src/components/plan/slides/PresentOverlay.tsx` (new)

Client component. A **"Present"** button in the deck pane (next to `ExportButtons`, only when a
deck is shown) sets overlay-open state. The overlay:

- Renders a `position: fixed` full-viewport container and requests the Fullscreen API on it
  (graceful fallback to a fixed overlay if the API rejects).
- Shows one `SlideView` at a time, scaled to fit (letterboxed 16:9).
- Keyboard: `→` / `Space` / `PageDown` → next; `←` / `PageUp` → prev; `Esc` → exit;
  `S` → toggle speaker-notes strip; `F` → toggle fullscreen. Handlers attached on mount,
  cleaned up on unmount; guard against running when overlay is closed.
- **Slide counter** (`3 / 8`) + a thin progress bar.
- **Speaker-notes strip** (presenter-lite) that reads the current slide's `notes`, toggled by
  `S`, hidden by default.
- Clicking left/right screen halves also navigates (mouse affordance).

Local state only (`current`, `notesOpen`); no server interaction — reuses the deck already in
`SlidesPanel` memory. Exiting fullscreen (`Esc` or browser chrome) closes the overlay via a
`fullscreenchange` listener.

## PPTX export — `src/lib/slides/pptx.ts`

- Reads colors/ramp from `themes.ts` registry (drops the local `THEME_COLORS`).
- New `addSlide` cases:
  - `kpi` — tiles as positioned text/shape blocks.
  - `barChart` / `lineChart` — `slide.addChart(pptx.ChartType.bar | .line, data, opts)` with
    `categories`/`series` mapped to pptxgenjs's data shape; themed colors.
  - `donutChart` — `pptx.ChartType.doughnut` from `segments`.
- **`slide.addNotes(s.notes)`** appended for every slide that has notes.
- Existing 8 layouts unchanged apart from sourcing colors from the registry.

## Pipeline / prompts — `src/lib/slides/prompts.ts`, `estimate.ts`

- `SCHEMA_DOC` documents the 4 new layouts and the `notes` field (every slide object may carry
  `"notes":"..."`).
- Draft/critic system guidance: **use `kpi`/chart slides when the brief contains numbers**
  (don't invent data — chart values must trace to the brief, consistent with the existing
  "cite a specific number FROM THE BRIEF" rule), and **always write a 1–2 sentence speaker
  note per slide** in the presenter's voice.
- `slopLint` unchanged for v2 (charts/notes not linted); the critic still only touches flagged
  slides. Optional future rule noted but out of scope.
- `estimate.ts`: bump `STEP_BUDGET.draft` to cover the added notes/chart output tokens; the
  wizard's cost estimate already reads from here, so the shown estimate stays accurate. Expect a
  small per-deck cost increase (documented in the version meta as before).

No change to `pipeline.ts`'s step structure or the SSE `step`/`done`/`error` contract.

## Wizard + versions — `GenerateWizard.tsx`, `VersionSwitcher.tsx`, `SlidesPanel.tsx`, page

- **Wizard** rebuilt on `plan/ui.tsx` primitives (matches `/plan` tokens):
  - Theme picker → **swatch cards** (mini bg/accent preview + `label`) from `THEME_DEFS`,
    replacing the raw `<select>`.
  - **Audience persona picker** — Exec / Investor / Team / Client / Custom(free text) — sets the
    `audience` field passed in `generate(opts)` → API `body.audience` (already supported).
  - Keep slide-count slider, extra-context textarea, and cost estimate.
- **`SlidesPanel`** threads `audience` from the wizard through `generate`, and passes
  `projectName` down for the slide footer + Present button; adds the Present button in the deck
  pane.
- **`VersionSwitcher` → filmstrip**: each version is a card with a **scaled-down `SlideView`
  thumbnail** (first slide), a **relative timestamp** (from `createdAt`), and an optional label;
  cost/`fixed` demoted to a subtle secondary line. `page.tsx` maps `createdAt` into the
  `Version` shape and passes `projectName`.

## i18n — `src/lib/plan/i18n.ts`

New `PlanKey`s (EN + TH, both required by the typed dict): present-mode controls
(`slides.present.*` — button, counter, notes toggle, exit hint), audience persona labels
(`slides.wizard.audience.*`), theme labels if localized, and any chart/KPI empty states. All
new UI strings go through `pt`/`usePlanT` as the existing module requires.

## Files touched

New:
- `src/lib/slides/themes.ts`
- `src/components/plan/slides/SlideView.tsx`
- `src/components/plan/slides/PresentOverlay.tsx`
- `src/components/plan/slides/charts/{BarChart,LineChart,DonutChart,scale}.tsx`
- a `next/font` loader module (e.g. `src/lib/slides/fonts.ts`)

Modified:
- `src/lib/slides/deck.ts` (layouts, notes, validators; re-export THEMES from registry)
- `src/lib/slides/prompts.ts`, `src/lib/slides/estimate.ts`, `src/lib/slides/pptx.ts`
- `src/components/plan/slides/{DeckRenderer,GenerateWizard,VersionSwitcher,SlidesPanel,ExportButtons}.tsx`
- `src/components/plan/slides/deck-themes.css`
- `src/app/plan/(app)/[projectId]/slides/page.tsx`
- `src/lib/plan/i18n.ts`
- `next.config.ts` — only if CSP `font-src` needs `'self'` (verify first)

Unchanged: DB schema, `decks.ts` (createdAt already selected via `select()`), generate/export
routes' contracts, auth/roles.

## Testing & verification

No test runner in this repo — the gate is:
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build` **and** `env -u DATABASE_URL npm run build` (build must pass with
  `DATABASE_URL` unset — repo invariant).
- Manual: generate a deck with numeric brief → confirm chart/KPI + notes appear; open Present
  mode (keys, counter, notes strip, Esc); export PPTX → charts are native/editable and notes
  present; export PDF (print) still isolates `.print-root`; switch all 6 themes; toggle TH/EN.
- CSP check: load a generated deck and confirm no `font-src`/`style-src` CSP violations in the
  console after adding `next/font`.

## Risks / tradeoffs

- **Font weight/bundle** — 6 pairings add self-hosted font files; mitigate by limiting weights
  per family (e.g. 2 weights) and `display: 'swap'`.
- **Chart-data hallucination** — charts must trace to brief numbers; enforced by prompt rule,
  not code. Acceptable at single-admin scale; the human reviews before presenting.
- **PPTX chart fidelity** — pptxgenjs native charts won't pixel-match the SVG; that's the
  accepted cost of editable charts (chosen over image parity).
- **Notes cost** — small token increase per deck; surfaced honestly in the estimate + version
  meta.
- **Fullscreen API** — permissioning/quirks across browsers; the overlay degrades to a fixed
  full-viewport layer if the request is rejected.
