# `/plan` — Roles & Permissions — Design

**Date:** 2026-07-01
**Status:** Approved (brainstorm) — pending spec review
**Project:** nanoteofficial.me (portfolio site)

## Summary

`/plan` (the invite-only project-management workspace) currently has flat
permissions: every signed-in invited user (gated only by `ALLOWED_EMAILS`) can
call every server action. This adds a real three-tier role system —
**admin / editor / viewer** — enforced server-side in every mutation, plus a
small admin screen to manage roles. This closes the workspace's only
authorization gap (see the original design's Permissions decision, which
explicitly deferred roles to "Phase 2").

## Goals

- Some invited users can be restricted to read-only access (viewer).
- A separate `admin` tier can promote/demote other users' roles.
- Enforcement happens in the server actions, not just hidden in the UI.
- Bootstrapping the first admin requires no manual DB surgery beyond one
  documented one-time backfill.

## Non-Goals

- Per-project ownership or private/multi-tenant projects. The workspace stays
  flat and shared — roles gate *what a user can do*, not *which projects they
  can see*. (If per-project ownership is ever wanted, this doc's
  authorization approach would need revisiting — see the original design's
  note on ownership as an IDOR vector.)
- Snapshot-based burndown (evaluated and explicitly deferred; the on-the-fly
  computation from Phase 2 stays as-is).
- Fine-grained per-action permissions (e.g. "can edit tasks but not archive
  projects"). Three flat tiers only.

## Data Model

Add one column to the existing `users` table (`src/lib/db/schema.ts`):

```ts
export const userRole = pgEnum("user_role", ["admin", "editor", "viewer"]);

// on users table:
role: userRole("role").notNull().default("viewer"),
```

No new tables. Migrated via `drizzle-kit push` per the existing `/plan`
convention (drizzle-kit doesn't read `.env.local`, so `DATABASE_URL` must be
passed inline).

**One-time backfill:** after migration, the owner's existing user row (created
during earlier `/plan` sessions) needs one manual `UPDATE users SET role =
'admin' WHERE email = '<owner email>'` — or just sign in once after deploying
(see bootstrap below), since the self-healing logic covers existing rows too.

## Bootstrapping Admins

New env var `PLAN_ADMIN_EMAILS` (comma-separated, same parsing pattern as the
existing `ALLOWED_EMAILS` in `src/auth.ts`).

In the existing `signIn` callback, **after** the invite-list check passes,
self-heal the role:

```ts
signIn: async ({ user }) => {
  const email = user.email?.toLowerCase();
  if (!email || !allowed.includes(email)) return false;
  if (adminEmails.includes(email)) {
    await db.update(users).set({ role: "admin" })
      .where(and(eq(users.email, email), ne(users.role, "admin")));
  }
  return true;
},
```

(Matched by `email`, not `id` — the adapter user object passed to this
callback isn't guaranteed to have `id` populated on every provider flow, but
`email` is already relied on by the existing `ALLOWED_EMAILS` check above it.)

This runs on every login, so it's resilient: if the DB is ever reset, or an
admin accidentally demotes themselves via the admin UI, the next sign-in for
an email in `PLAN_ADMIN_EMAILS` restores `admin`. Everyone else keeps
whatever role is stored, defaulting to `viewer` on first creation (Auth.js
adapter creates the row on first sign-in — the column default handles this
with no extra code).

## Session

Add a `session({ session, user })` callback in `src/auth.ts`:

```ts
session: ({ session, user }) => {
  session.user.role = user.role;
  return session;
},
```

Because `/plan` uses **database** sessions (not JWT), the adapter passes the
full `users` row (including the new `role` column) to this callback — no
extra query needed. (Contrast with `finance.nanoteofficial.me`, which uses JWT
sessions and strips custom claims — not applicable here.)

`session.user.role` needs a TypeScript augmentation (`next-auth.d.ts` or
inline module augmentation) so `Session["user"]` includes `role: UserRole`.

## Authorization

In `src/lib/plan/actions.ts`, replace the single `requireUser()` with three
helpers:

```ts
async function requireUser() { ... }               // any signed-in user — reads
async function requireEditor() { ... }              // role admin | editor — mutations
async function requireAdmin() { ... }               // role admin — role management
```

Every existing mutation switches from `requireUser()` to `requireEditor()`:
`createProject`, `updateProject`, `archiveProject`, `createTask`,
`updateTask`, `deleteTask`, `moveTask`.

A new mutation `setUserRole(userId: string, role: UserRole)` is guarded by
`requireAdmin()`.

This is the concrete fix for the workspace's authorization gap: today any
signed-in invited user can call any mutation regardless of intent; after this
change, only `editor`/`admin` roles can, and it's enforced where it matters
(the server action), not just in the UI.

## Admin UI

New route `src/app/plan/(app)/admin/page.tsx`:
- Gated the same way as the existing `(app)` layout: read `session.user.role`
  server-side, `redirect("/plan")` if not `"admin"`.
- New query `listUsersForAdmin()` in `src/lib/plan/queries.ts` returning
  `id`/`name`/`email`/`role` for every invited user (superset of the existing
  `listUsers()`, which stays as-is for the assignee dropdown/team-load use
  cases that don't need role).
- Renders one row per user with a role `<select>`.
- A new client component `RoleSelect` (`src/components/plan/RoleSelect.tsx`)
  calls `setUserRole` via `startTransition`, wired into the existing
  `Toaster` for success/error feedback (same pattern as other mutations).

Nav: the header in `src/app/plan/(app)/layout.tsx` shows an "Admin" link only
when `session.user.role === "admin"`.

## Viewer-Facing UI

`role` flows down from the layout (`session.user.role`) as a prop into the
views that render mutation controls:

| Component | Viewer behavior |
|---|---|
| Projects overview / `ProjectGrid` | Hide "New project" button and per-card archive action. |
| Project detail (table/kanban/calendar tabs) | Hide "Add task" button and edit/delete icons. |
| `TaskDrawer` | Opens read-only — no Save button, fields disabled. |
| `KanbanBoard` | Drag sensors disabled entirely. |
| Burndown / Team load / Calendar | No change — already read-only views for everyone. |
| `CommandPalette` | No change — navigation-only already. |

Hiding controls (rather than showing them and failing on submit) was chosen
for UX clarity — it also naturally matches what the server already rejects.

## Testing / Verification

No test runner in this repo — verification is `tsc --noEmit`, `lint`,
`build` (including the `DATABASE_URL`-unset guard), plus manual smoke test:
sign in as an existing viewer-role user and confirm mutations are hidden in
the UI *and* rejected if called directly; sign in as admin and confirm role
changes via the admin page take effect immediately for the target user's next
action.

## Env Vars (new)

- `PLAN_ADMIN_EMAILS` — comma-separated emails auto-promoted to `admin` on
  sign-in. Should include the owner's email at minimum.
