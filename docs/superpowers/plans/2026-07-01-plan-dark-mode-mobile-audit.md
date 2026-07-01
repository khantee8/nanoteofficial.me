# `/plan` Dark Mode + Mobile Visual Audit — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Systematically check every `/plan` view at 2 mobile widths × 2 color schemes, fixing whatever looks broken, using real (seeded) data.

**Architecture:** No new subsystems — this plan is investigate-then-fix. Each task is one view (or view group); the "test" is a Playwright screenshot comparison, not an assertion. Fixes are small Tailwind/CSS changes to existing components, using the existing design tokens.

**Tech Stack:** Playwright (via the `webapp-testing` skill), the running `npm run dev` server, existing Tailwind v4 tokens (`--surface`, `--border`, `--feature-color`, `--muted`, etc. — see `src/app/globals.css`).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-01-plan-dark-mode-mobile-audit-design.md`.
- **Run this plan after** `docs/superpowers/plans/2026-07-01-plan-roles-permissions.md` is merged and deployed (or at least merged locally) — Task 1 below seeds data and Tasks 7–8 explicitly audit the admin page and viewer-restricted states that the roles work introduces. If roles isn't done yet, skip Tasks 7–8 and note it in the final summary.
- Viewports: **375px** (iPhone SE width) and **768px** (tablet / Tailwind `md:`).
- Color schemes: **light** and **dark**, via Playwright's `colorScheme` emulation (`page.emulateMedia({ colorScheme: "light" | "dark" })`), not OS-level toggling.
- Fix in place as issues are found — no batching into a single end-of-pass list. Every fix must be a small, isolated Tailwind class change (or, if truly necessary, a CSS variable addition in `globals.css`) — not a layout rewrite.
- No test runner in this repo. Verification per task = re-screenshot after each fix + `npx tsc --noEmit` if any `.tsx` changed (pure Tailwind class edits don't need a lint/tsc pass, but run it anyway if a prop or conditional changed, not just a `className` string).
- Use the existing `webapp-testing` skill/toolkit for all browser automation in this plan — don't hand-roll a separate Playwright script setup.

---

### Task 1: Seed demo data and set up the audit harness

**Files:**
- None committed — this task creates throwaway data through the running app and a scratch screenshot script, not source files.

- [ ] **Step 1: Start the dev server**

Run (background): `npm run dev`
Expected: server up at `http://localhost:3000`.

- [ ] **Step 2: Sign in**

Navigate to `http://localhost:3000/plan/signin`, sign in with your invited email via the magic link (check the inbox the Resend `from` address delivers to, or the dev console if `next-auth` logs the link in dev mode).

- [ ] **Step 3: Create the demo project**

Through the UI at `/plan`, click "New project" (or "โปรเจกต์ใหม่" if `lang` cookie is `th`) and create:
- Name: `Audit Demo`
- Type: `it`
- Target date: 2 weeks from today

- [ ] **Step 4: Seed 6–8 tasks**

Open the new project and add tasks covering every combination the spec calls for:

| Title | Status | Assignee | Due date | Estimate (h) | Tags |
|---|---|---|---|---|---|
| Set up CI | done | you | (today − 5d) | 4 | infra |
| Draft API contract | in_progress | you | (today + 2d, "soon") | 6 | api |
| Fix login bug | in_progress | unassigned | (today − 1d, "overdue") | 2 | bug |
| Write onboarding docs | todo | you | (today + 10d) | 3 | docs |
| Research charting lib | backlog | unassigned | — | — | research |
| Plan sprint review | backlog | you | (today + 7d) | 1 | meeting |

(Exact dates: compute from today's date, e.g. via `date -I -d "+2 days"`, and enter them in the task form's date pickers. "you" = your own invited user in the assignee dropdown.)

- [ ] **Step 5: Confirm all views render non-empty**

Visit `/plan/<demo-project-id>?view=table`, `?view=kanban`, `?view=calendar`, `?view=burndown` — confirm each shows real content, not an empty state. Also visit `/plan` and confirm "Team load" shows a bar for "you".

- [ ] **Step 6: No commit** — this task only creates data via the running app, no source changes.

---

### Task 2: Audit `/plan` (projects overview + team load)

**Files:** none known yet — this task is investigate-first; note the actual file(s) touched in the commit message once a fix is made.

- [ ] **Step 1: Screenshot the 4 combinations**

Using the `webapp-testing` skill's Playwright helper, for `http://localhost:3000/plan`:
1. Set viewport to `{ width: 375, height: 812 }`, `colorScheme: "light"` → screenshot.
2. Same viewport, `colorScheme: "dark"` → screenshot.
3. Set viewport to `{ width: 768, height: 1024 }`, `colorScheme: "light"` → screenshot.
4. Same viewport, `colorScheme: "dark"` → screenshot.

- [ ] **Step 2: Inspect each screenshot**

Look specifically at: the project grid card layout at 375px (does it single-column correctly via `grid-cols-1`?), text contrast on `ProjectCard`/`TeamLoad` in dark mode, and whether the "New project" dashed-border tile is legible in dark mode.

- [ ] **Step 3: Fix anything found**

Example fix pattern (only apply if actually observed — do not apply speculatively): if a hardcoded color like `text-gray-500` appears instead of `text-[var(--muted)]` anywhere in `ProjectCard.tsx`/`TeamLoad.tsx`, swap it for the token. If touch targets on the "New project" tile are under ~44px tall at 375px, increase its `min-h-*` class.

- [ ] **Step 4: Re-screenshot to confirm the fix**

Repeat Step 1 for the specific combination that was broken; confirm visually fixed.

- [ ] **Step 5: Commit (only if a fix was made)**

```bash
git add <files touched>
git commit -m "fix(plan): dark-mode/mobile fixes on projects overview"
```

If nothing was broken, skip the commit and move to Task 3.

---

### Task 3: Audit project detail — table view

**Files:** none known yet (investigate-first, same pattern as Task 2).

- [ ] **Step 1: Screenshot the 4 combinations**

For `http://localhost:3000/plan/<demo-project-id>?view=table`, repeat the 4-combination screenshot pass from Task 2, Step 1.

- [ ] **Step 2: Inspect**

Look specifically at: the `overflow-x-auto` table at 375px (does horizontal scroll work, or does content clip?), the search/filter input row wrapping (`flex flex-wrap`), the due-date color signals (`DUE_TEXT` in `src/lib/plan/dates.ts`) in dark mode — overdue/soon colors must stay readable on a dark `--surface`.

- [ ] **Step 3: Fix anything found, re-screenshot, commit**

Same pattern as Task 2 Steps 3–5. Likely file: `src/components/plan/TableView.tsx` or `src/lib/plan/dates.ts` (`DUE_TEXT` color map) if due-date contrast is the issue.

```bash
git add <files touched>
git commit -m "fix(plan): dark-mode/mobile fixes on table view"
```

---

### Task 4: Audit project detail — kanban view

**Files:** none known yet.

- [ ] **Step 1: Screenshot the 4 combinations**

For `http://localhost:3000/plan/<demo-project-id>?view=kanban`, repeat the screenshot pass.

- [ ] **Step 2: Inspect**

Look specifically at: the 4-column grid collapsing to 1 column at 375px (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` — note `sm:` is 640px, so 375px and even up to 639px should still be single-column; confirm this is actually true rather than assumed), card tap targets, the drag-handle affordance on touch (a mouse-only `cursor-grab` cue means nothing on a touchscreen — check whether this matters given the target width), and column header dot/badge contrast in dark mode.

- [ ] **Step 3: Fix anything found, re-screenshot, commit**

```bash
git add <files touched>
git commit -m "fix(plan): dark-mode/mobile fixes on kanban view"
```

---

### Task 5: Audit project detail — calendar view

**Files:** none known yet.

- [ ] **Step 1: Screenshot the 4 combinations**

For `http://localhost:3000/plan/<demo-project-id>?view=calendar`, repeat the screenshot pass.

- [ ] **Step 2: Inspect**

Look specifically at: day-cell sizing and text truncation at 375px, whether task chips inside day cells overflow their cell, and month-grid border/background contrast in dark mode.

- [ ] **Step 3: Fix anything found, re-screenshot, commit**

```bash
git add <files touched>
git commit -m "fix(plan): dark-mode/mobile fixes on calendar view"
```

---

### Task 6: Audit project detail — burndown chart + team load

**Files:** none known yet.

- [ ] **Step 1: Screenshot the 4 combinations for burndown**

For `http://localhost:3000/plan/<demo-project-id>?view=burndown`, repeat the screenshot pass.

- [ ] **Step 2: Inspect burndown**

Look specifically at: the SVG's `fill-current`/`stroke-current` text and gridlines (`BurndownChart.tsx` uses `opacity-*` on `currentColor` — confirm this actually inverts correctly in dark mode rather than becoming invisible), and whether the `viewBox`-scaled SVG stays legible/doesn't overflow at 375px (it's `w-full` inside a `figure`, so it should scale, but verify the axis label font size at `text-[10px]`/`text-[9px]` doesn't become illegibly small when the SVG is heavily downscaled at 375px).

- [ ] **Step 3: Screenshot + inspect team load**

Revisit `/plan` (team load lives on the overview page, already covered in Task 2's screenshots) specifically for the per-person bar contrast and the "over capacity" flag color in dark mode (`TeamLoad.tsx`).

- [ ] **Step 4: Fix anything found, re-screenshot, commit**

```bash
git add <files touched>
git commit -m "fix(plan): dark-mode/mobile fixes on burndown/team-load"
```

---

### Task 7: Audit the admin page (requires roles plan merged)

**Files:** none known yet.

- [ ] **Step 0: Skip condition**

If `docs/superpowers/plans/2026-07-01-plan-roles-permissions.md` has not been implemented yet, skip this task entirely and say so in the final summary (Task 9).

- [ ] **Step 1: Screenshot the 4 combinations**

For `http://localhost:3000/plan/admin` (signed in as admin), repeat the screenshot pass.

- [ ] **Step 2: Inspect**

Look specifically at: the `overflow-x-auto` user-list table at 375px, the `RoleSelect` dropdown's tap target size and its `disabled` (self-row) visual state (`disabled:opacity-50`) in both color schemes — confirm the disabled state is distinguishable from the enabled state in dark mode, not just barely so.

- [ ] **Step 3: Fix anything found, re-screenshot, commit**

```bash
git add <files touched>
git commit -m "fix(plan): dark-mode/mobile fixes on admin page"
```

---

### Task 8: Audit viewer-restricted states (requires roles plan merged)

**Files:** none known yet.

- [ ] **Step 0: Skip condition**

Same as Task 7, Step 0 — skip if roles isn't implemented yet.

- [ ] **Step 1: Sign in as a viewer**

Using the admin page, set a second invited test account to `viewer` (or use the account you already have set as viewer from the roles plan's own manual verification step).

- [ ] **Step 2: Screenshot the 4 combinations for the restricted states**

For the project detail page's table and kanban views (`?view=table`, `?view=kanban`) signed in as viewer, plus the read-only `TaskDrawer` open on a task, repeat the screenshot pass.

- [ ] **Step 3: Inspect**

Look specifically at: disabled form fields in the drawer (do disabled inputs/selects/textareas stay legible — not so faded they're unreadable — in dark mode?), and whether the *absence* of controls (no "Add task", no delete buttons) leaves any awkward empty gaps in the layout at 375px.

- [ ] **Step 4: Fix anything found, re-screenshot, commit**

```bash
git add <files touched>
git commit -m "fix(plan): dark-mode/mobile fixes on viewer read-only states"
```

---

### Task 9: Sign-in page audit, final verification, and wrap-up

**Files:** none known yet for the sign-in audit; verification-only for the rest.

- [ ] **Step 1: Screenshot `/plan/signin`**

Repeat the 4-combination screenshot pass for `http://localhost:3000/plan/signin`, both the initial form and the post-submit "check your inbox" state (`SignInForm.tsx`).

- [ ] **Step 2: Inspect and fix**

Look specifically at: input/button contrast in dark mode, and the form's max-width/centering at 375px.

```bash
git add <files touched>
git commit -m "fix(plan): dark-mode/mobile fixes on sign-in page"
```

(Skip the commit if nothing was broken.)

- [ ] **Step 3: Full verification**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: all pass (only relevant if any `.tsx` prop/conditional logic changed during the audit — pure `className` edits are covered by `lint`/`build` too, so run this regardless as the final gate).

- [ ] **Step 4: Decide the fate of the demo project**

Ask the user (or default to archiving, which is reversible and non-destructive) whether to archive or delete the `Audit Demo` project created in Task 1. Archiving: open the project, click "Archive"/"เก็บเข้าคลัง", confirm. This does not require code changes.

- [ ] **Step 5: Summarize findings**

Produce a short summary for the user (not a committed document, per the spec's "Output" section): which views had issues, what was fixed, which tasks were skipped (if roles wasn't merged yet), and confirmation that light/dark + 375/768 all look correct across every view now.

- [ ] **Step 6: Push and open a PR (if any commits were made)**

```bash
git push -u origin HEAD
gh pr create --title "fix(plan): dark-mode + mobile visual audit" --body "Systematic light/dark × 375px/768px pass across every /plan view per docs/superpowers/specs/2026-07-01-plan-dark-mode-mobile-audit-design.md. See PR description for the per-view findings summary."
```

If no fixes were needed anywhere (unlikely but possible), skip this step and report that the audit found nothing to fix.
