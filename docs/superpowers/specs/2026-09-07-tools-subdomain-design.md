# Design — `tools.nanoteofficial.me`: surfacing the private toolchain

**Date:** 2026-09-07
**Status:** approved design, pending implementation plan
**Anchor repo:** `khantee8/nanoteofficial.me` (this repo — the public portfolio)
**New repo:** `khantee8/tools.nanoteofficial.me` (**private repo, public deployment**)

---

## 1. Problem

Six systems have shipped under `khantee8`. The portfolio surfaces almost none of them.

- `exam`, `plan` and `thai-funds-mcp` are invisible — no menu entry, no page, no mention.
- `kb` and `finance` appear only as *preview shells* (`/kb`, `/finance`) whose copy describes
  aspirational products rather than what was actually built.
- `company` appears only as a homepage iframe.
- `cyber` and `art` are shells for systems that do not exist in any form.

The result is a portfolio that undersells four real systems while overselling two that are thin
or absent. The goal is a truthful, navigable map of the working toolchain, reachable from the
site's main menu.

## 2. Locked decisions

| Question | Decision |
|---|---|
| Audience | Public showcase **and** private depth |
| Where private depth lives | The Figma file (private by default) |
| Systems covered | `company`, `kb`, `thai-funds-mcp`, `plan`, `exam`, `finance` — plus cross-system edges |
| `cyber` / `art` shells | Retire or make honest |
| `finance` copy | Fix — current portfolio copy overstates what was built |
| Structure | New repo → `tools.nanoteofficial.me`, linked from the portfolio header |
| New repo visibility | **Private** (deploying a public site) |
| Naming | "Tools", not "Systems". Header item = `Tools` |
| Diagram approach | **C** — one typed model, two renderers |

`system.nanoteofficial.me` is *not* being built. It may later be pointed at
`tools.nanoteofficial.me` as an alias if wanted.

## 3. Approach C, restated

A single typed model is the source of truth. It drives two outputs:

- the **public** interactive map on `tools.nanoteofficial.me` — simplified, bilingual, theme-aware;
- the **private** detailed FigJam boards, generated through the Figma MCP `generate_diagram` tool.

Rejected alternatives:

- **A — static SVG exports.** Diagrams become images: no dark-mode adaptation, two exports per
  diagram for TH/EN, and manual re-export on every stack change. Decays quickly across six systems.
- **B — code-only interactive map.** Strong public output, but wastes the Figma capability and
  leaves the private detailed layer with no home.

## 4. Decomposition

This is three sub-projects, built in order. Each gets its own plan.

1. **Reverse-engineering + model** *(designed below)* — read all six repos, produce the typed
   model, the private layer, and the Figma boards. No UI.
2. **The site** *(sketched)* — new private repo, Vercel project, DNS, overview map + six detail pages.
3. **Portfolio integration** *(sketched)* — `Tools` header item, homepage section, fix `finance`
   copy, retire `cyber` / `art`.

Sub-project 1 carries the risk: everything downstream renders from it and adds no facts of its own.

---

## 5. Sub-project 1 — detailed design

### 5.1 Deliverables

- `src/data/systems.ts` — public-safe model, the only data file the site imports.
- `src/data/systems.private.ts` — full detail, imported only by the Figma sync script.
- `scripts/figma-sync.ts` — reads the private model, calls `generate_diagram`.
- Model invariant tests.

### 5.2 Model shape

A system is represented as a small graph rather than prose, which is what allows one model to
drive both renderers.

```ts
type NodeKind = "app" | "service" | "datastore" | "external" | "job" | "channel";
type Protocol =
  | "http" | "mcp" | "sql" | "redis" | "webhook" | "cron" | "iframe" | "redirect";

type Node = { id: string; kind: NodeKind; label: LStr; note?: LStr };
type Edge = { from: string; to: string; protocol: Protocol; label?: LStr };

type ToolSystem = {
  slug: "company" | "kb" | "thai-funds-mcp" | "plan" | "exam" | "finance";
  name: LStr;
  tagline: LStr;
  purpose: LStr;                          // why it exists in the day-to-day
  repoVisibility: "public" | "private";
  liveUrl?: string;
  stack: string[];
  nodes: Node[];
  edges: Edge[];
};

export const systems: ToolSystem[];
export const platformEdges: Edge[];       // cross-system graph
```

`LStr = Record<"en" | "th", string>` is reused verbatim from this repo's `src/lib/profile.ts`, so
TypeScript enforces bilingual completeness exactly as it already does for portfolio content.

### 5.3 The public/private seam

The seam is **structural, not a flag**. An earlier draft proposed a `public: false` field on nodes;
that was rejected because a single renderer bug would put private content in the HTML.

```
src/data/systems.ts          ← public-safe. The ONLY data file the site imports.
src/data/systems.private.ts  ← full detail. Imported ONLY by scripts/figma-sync.ts
```

The web build never imports the private module, so private content cannot reach a rendered page
even if the renderer is wrong.

**Guard:** a test asserts that no file under `src/app/**` or `src/components/**` imports
`systems.private`, and fails the build if one does. This test is the load-bearing part of the
design — it must exist before the private module gains any content.

This is why the new repo is private: the private layer has to be committable and diffable.

### 5.4 What belongs in which layer

| Layer | Contains |
|---|---|
| Public (`systems.ts`) | Purpose, role in the platform, stack names, auth *mechanism class* (e.g. "magic link", "bearer token"), datastore *types*, cross-system edges and protocols, live URLs of already-public systems |
| Private (`systems.private.ts`) | Environment variable names, admin route inventories, cron paths and secrets handling, internal gate locations, per-route auth detail, live URLs of private systems |

**This spec follows its own rule.** It is committed to a *public* repo, so it deliberately
contains no environment variable names, no admin route paths, and no per-route auth internals for
the three private systems. That material is gathered and belongs in the private layer only.

### 5.5 Findings that shape the model

Reverse-engineering established the following, verified against source rather than documentation.
Stated here at public-safe altitude:

- **The six are one graph, not six side projects.** `company` is the AI engine; `kb` is a
  deliberately dumb reader over its published output; `thai-funds-mcp` is the machine-to-machine
  data backend that `company`'s finance agent calls over the Anthropic MCP connector; the
  portfolio embeds `company` and redirects to `plan`. This interconnection is the strongest thing
  the section has to show.
- **`exam` and `finance` are leaves** — they connect to nothing else.
- **Six systems use six different authentication mechanisms.** That variety is itself worth
  presenting, and is public-safe at the level of mechanism class.
- **Storage varies meaningfully**: one system runs two datastores, one runs three storage types,
  one runs none at all.
- **`company` has the most operationally interesting design** — staggered per-department
  schedules, a self-heal sweep, an external polling backstop because async batches outlive a
  serverless invocation, and a monthly spend guard.
- **`thai-funds-mcp` has the best failure discipline** — a typed error union that lets a consuming
  agent distinguish "not found" from "source unavailable", added in response to a real incident.

Three findings change what should be published:

1. **`finance` is an authentication shell.** No datastore, no persistence, and its AI endpoint is a
   stub returning a placeholder. The portfolio currently advertises it as a platform with
   portfolio tracking and risk evaluation. → **Decision: fix the copy** (sub-project 3) and draw
   `finance` truthfully as an auth-and-views shell.
2. **`thai-funds-mcp`'s full-universe fund index is built and tested but not wired in**, blocked on
   an upstream provider restriction. Its headline search capability is therefore dormant, and
   should not be presented as working.
3. **`cyber` and `art` have no repo and no deployment.** → retire or mark honestly.

### 5.6 Figma output

`scripts/figma-sync.ts` reads the private model and emits one FigJam board per system plus one
platform-overview board.

**Blocked dependency:** the Figma MCP server is installed (`figma@claude-plugins-official`,
remote endpoint) but still reports `Needs authentication`. Authorization is an interactive OAuth
flow that only the account owner can complete. Everything else in sub-project 1 is independent of
it, so the model is built first and boards are generated once connected.

### 5.7 Verification

The portfolio has no test runner; the new repo gets one.

```
npx tsc --noEmit
npm run lint
npm test          # vitest — model invariants + the private-import guard
npm run build
```

Model invariants under test:

- every edge's `from` / `to` references a node id that exists;
- every `LStr` has both `en` and `th` populated;
- no orphan nodes;
- every `slug` is unique;
- no file under `src/app/**` or `src/components/**` imports `systems.private`.

---

## 6. Sub-projects 2 and 3 — sketch only

**Sub-project 2 — the site.** New private repo → Vercel project → `tools.nanoteofficial.me`. The
apex domain runs on Vercel nameservers, so the subdomain needs no registrar record. Content: an
overview page rendering `platformEdges`, plus six detail pages rendering each system's graph.
Follows this repo's conventions — cookie-based i18n, `LStr` content, class-based dark mode.

**Sub-project 3 — portfolio integration.** A `Tools` item in the header nav; a homepage section
linking out; corrected `finance` copy; `cyber` / `art` retired or marked honestly. Touches
`Header.tsx`, `profile.ts`, `i18n.ts`, and the shell pages. Note that `sitemap.ts`, `robots.ts`
and the per-route `opengraph-image.tsx` files are coupled to which shells exist — removing a
shell is a four-file change, per this repo's CLAUDE.md.

## 7. Risks and open items

| Risk | Mitigation |
|---|---|
| Private detail leaking into the public build | Structural two-file seam + build-failing guard test (§5.3) |
| Model drifts from reality as systems change | Model is the single source for both renderers; drift shows in both at once |
| Figma authorization never completes | Model and site do not depend on it; boards are an additive deliverable |
| Publishing an accurate map of live private systems | Public layer is restricted to mechanism class, never configuration (§5.4) |
| Scope creep back into one mega-plan | Three independent plans, built in order |

**Open:** whether `cyber` / `art` are deleted outright or kept and relabelled honestly. Both
satisfy "make it truthful"; they differ in whether the four-file shell removal is incurred. This
is deferred to sub-project 3's design, and blocks nothing before then.

`finance` is settled: it stays as one of the six, drawn truthfully as an auth-and-views shell,
with the portfolio's overstated copy corrected in sub-project 3.

## 8. Out of scope

- `personal-investment-project` (local/Docker only, no deployment).
- Building `cyber` or `art`.
- Any change to the six systems themselves — this work only *describes* them.
- `system.nanoteofficial.me` as a second deployment.
