# `/plan` — Dark Mode + Mobile Visual Audit — Design

**Date:** 2026-07-01
**Status:** Approved (brainstorm) — pending spec review
**Project:** nanoteofficial.me (portfolio site)

## Summary

`/plan` shipped its Linear-grade redesign, UX upgrade, and bilingual TH/EN
pass without a systematic dark-mode/mobile check on real data — only
spot-checked. This is a general visual audit-and-fix pass across every
`/plan` view, in both color schemes and at two mobile-relevant widths,
including the two new screens the roles/permissions work (see the
[roles design](2026-07-01-plan-roles-permissions-design.md)) adds — the admin
page and the viewer-restricted UI states.

## Goals

- Every `/plan` view renders correctly in light mode, dark mode, at 375px
  width, and at 768px width (4 combinations per view).
- Fix issues in place as they're found — small, isolated changes using the
  existing design tokens (`--surface`, `--border`, `--feature-color`, etc.),
  not a redesign.
- Cover the admin page and viewer-restricted states as part of this same pass
  (new UI introduced alongside this work).

## Non-Goals

- No new features or layout redesign — this is a correctness pass on
  existing UI, not new design work.
- No automated visual-regression test suite (no test runner in this repo;
  Playwright is used here as a one-time audit tool, not a persisted test).
- Desktop-only issues are out of scope unless they also affect the two
  target mobile widths or either color scheme.

## Scope — Views Audited

- `/plan` (projects overview)
- `/plan/[projectId]` — table tab
- `/plan/[projectId]` — kanban tab
- `/plan/[projectId]` — calendar tab
- `/plan/[projectId]` — burndown chart
- `/plan/[projectId]` — team load
- `/plan/signin`
- `/plan/admin` (new, from the roles design)
- Viewer-role restricted states (from the roles design) — hidden controls,
  read-only `TaskDrawer`, disabled kanban drag

Each is checked at 4 combinations: {375px, 768px} × {light, dark}.

## Test Data

Before auditing, seed one throwaway demo project through the running app
(not a DB script — via the actual UI, matching real usage) with ~6–8 tasks
spanning:
- all four statuses (backlog/todo/in_progress/done)
- at least two different assignees (plus one unassigned)
- due dates including one overdue and one due-soon (to exercise the
  due-date signal styling)
- estimate hours (to populate burndown/team-load)
- tags

This ensures kanban/table/calendar/burndown/team-load all render populated
states instead of empty-state placeholders. At the end of the audit, decide
whether to archive or delete the demo project.

## Method

Use the `webapp-testing` skill (Playwright) against the local dev server
(`npm run dev`):

1. For each view, set viewport to 375px, then 768px; for each, capture both
   `prefers-color-scheme: light` and `dark`.
2. Screenshot and inspect for the usual failure modes:
   - Low-contrast text (hardcoded colors that don't adapt to dark mode)
   - Overflow/clipping (text truncation, horizontal scroll where unintended)
   - Touch target sizing on mobile (buttons/icons too small to tap reliably)
   - Kanban board's horizontal-scroll behavior at 375px
   - Drawer/modal sizing on mobile (`TaskDrawer`, `ProjectForm`,
     `CommandPalette`)
3. Fix immediately in the relevant component (Tailwind classes / CSS
   variables) rather than batching a list of issues.
4. Re-screenshot the fixed view to confirm before moving to the next.

## Output

No separate written report — the result is a series of small, verified
CSS/Tailwind fixes across `src/components/plan/*` and `src/app/plan/**`. A
summary of what was found and changed is given to the user at the end of the
work, not as a persisted document.

## Verification

Existing gate: `tsc --noEmit`, `lint`, `build` (including the
`DATABASE_URL`-unset guard). Visual verification is the Playwright
screenshot pass itself — there's no automated assertion layer for this kind
of check in this repo.
