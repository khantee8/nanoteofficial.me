# `/plan` Roles & Permissions — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a three-tier `admin` / `editor` / `viewer` role system to `/plan`, enforced server-side in every mutation, with an admin screen to manage roles and read-only UI for viewers.

**Architecture:** One new `role` column on the existing `users` table (enum, default `viewer`). A `PLAN_ADMIN_EMAILS` env var self-heals the bootstrap admin(s) on every sign-in. `session.user.role` is populated via an Auth.js `session` callback (database-session strategy already hands the full adapter row to that callback). Server actions gain `requireEditor()`/`requireAdmin()` alongside the existing `requireUser()`. UI hides mutation controls for viewers using a `role` prop threaded from each server page (no new context — matches this codebase's existing prop-drilling convention for `users`/`lang`).

**Tech Stack:** Next.js 16 App Router, Auth.js v5 (`next-auth@beta`) database sessions, Drizzle ORM + `drizzle-kit push`, Neon Postgres, Tailwind v4.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-01-plan-roles-permissions-design.md` — read it before starting if anything below is unclear.
- **No test runner in this repo.** Per-task verification = `npx tsc --noEmit` and `npm run lint`. Full `npm run build` (and `env -u DATABASE_URL npm run build`) runs at the end (Task 7) and any time a task touches `src/lib/db/`.
- `drizzle-kit` does not read `.env.local` — pass `DATABASE_URL` inline on the command line (existing repo convention, see root `CLAUDE.md`).
- Workspace stays flat/shared — roles gate *actions*, not *which projects are visible*. Do not add `ownerId`/tenant columns.
- All new user-facing strings need both `en` and `th` entries in `src/lib/plan/i18n.ts` (existing repo convention — TypeScript errors if either is missing... actually this dict is untyped-per-lang at each key, so missing a language silently produces `undefined`; add both anyway to match every existing entry in the file).
- Follow existing prop-drilling: `role: UserRole` is passed explicitly to components that need it, the same way `users`/`lang` already are. Do not put `role` in `LangContext`.
- Run `git commit` after each task (not each step) — one commit per task, following this repo's existing granularity for the `/plan` work (PRs #2–#7 were each a cohesive slice, not step-by-step commits).

---

### Task 1: Add `role` column to the `users` table

**Files:**
- Modify: `src/lib/db/schema.ts`

**Interfaces:**
- Produces: `userRole` (drizzle pgEnum, values `"admin" | "editor" | "viewer"`), `User` type (`typeof users.$inferSelect`), `UserRole` type (`User["role"]`). All later tasks importing role types use `import type { UserRole } from "@/lib/db/schema"`.

- [ ] **Step 1: Add the enum and column**

In `src/lib/db/schema.ts`, insert a new enum immediately before the `users` table definition (currently the first export in the file), and add a `role` column to the table:

```ts
/* ---- Auth.js standard tables (Drizzle adapter shape) ---- */
export const userRole = pgEnum("user_role", ["admin", "editor", "viewer"]);

export const users = pgTable("user", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  role: userRole("role").notNull().default("viewer"),
});
```

(Only the `export const userRole = ...` line and the new `role: ...` field are additions — everything else in that block is unchanged.)

- [ ] **Step 2: Export `User`/`UserRole` types**

At the bottom of `src/lib/db/schema.ts`, alongside the existing `Project`/`Task` type exports, add:

```ts
export type User = typeof users.$inferSelect;
export type UserRole = User["role"];
```

So the full end of the file reads:

```ts
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type User = typeof users.$inferSelect;
export type UserRole = User["role"];
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors (schema-only change, nothing consumes `role` yet).

- [ ] **Step 4: Push the schema to Neon**

Run (reads the connection string already in `.env.local` without printing it, then passes it inline since `drizzle-kit` doesn't read `.env.local`):

```bash
DATABASE_URL="$(grep '^DATABASE_URL=' .env.local | cut -d= -f2-)" npx drizzle-kit push
```

Expected: drizzle-kit reports a new `user_role` enum type and a new `role` column on `user`, and applies them. If it prompts to confirm (e.g. "Is user_role enum created or renamed?"), choose "create enum" / accept — this is a brand-new type, not a rename.

- [ ] **Step 5: Verify the column exists**

Run:

```bash
psql "$(grep '^DATABASE_URL=' .env.local | cut -d= -f2-)" -c "\d \"user\"" | grep role
```

Expected output includes a line like:
```
 role          | user_role | | not null | 'viewer'::user_role
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/db/schema.ts
git commit -m "feat(plan): add role column to users table"
```

---

### Task 2: Auth bootstrap + session role

**Files:**
- Create: `src/types/next-auth.d.ts`
- Modify: `src/auth.ts`
- Modify: `.env.local` (add `PLAN_ADMIN_EMAILS`, not committed — this file is gitignored)
- Modify: `.env.example`
- Modify: `CLAUDE.md` (repo root's project doc, the `/plan` env var list)

**Interfaces:**
- Consumes: `UserRole` from Task 1 (`@/lib/db/schema`).
- Produces: `session.user.role: UserRole` available in every server component that calls `auth()`. Task 3's `requireEditor()`/`requireAdmin()` depend on this.

- [ ] **Step 1: Add the Auth.js type augmentation**

Create `src/types/next-auth.d.ts`:

```ts
import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/lib/db/schema";

declare module "next-auth" {
  interface User {
    role: UserRole;
  }
  interface Session {
    user: DefaultSession["user"] & {
      role: UserRole;
    };
  }
}
```

- [ ] **Step 2: Add the admin bootstrap + session callback**

Replace the full contents of `src/auth.ts` with:

```ts
import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, accounts, sessions, verificationTokens } from "@/lib/db/schema";

const allowed = (process.env.ALLOWED_EMAILS ?? "")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

const admins = (process.env.PLAN_ADMIN_EMAILS ?? "")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Resend({ apiKey: process.env.RESEND_API_KEY, from: "noreply@nanoteofficial.me" }),
  ],
  session: { strategy: "database" },
  pages: { signIn: "/plan/signin" },
  callbacks: {
    async signIn({ user }) {
      const email = user.email?.toLowerCase();
      if (!email || !allowed.includes(email)) return false;
      if (admins.includes(email)) {
        await db.update(users).set({ role: "admin" })
          .where(and(eq(users.email, email), ne(users.role, "admin")));
      }
      return true;
    },
    session({ session, user }) {
      session.user.role = user.role;
      return session;
    },
  },
});
```

This is a self-healing bootstrap: it runs on every sign-in, matched by `email` (not `id`, since the adapter user object isn't guaranteed to have `id` populated at every point in the provider flow, and `email` is already relied on by the `allowed` check directly above it). Anyone in `PLAN_ADMIN_EMAILS` is promoted to `admin` if they aren't already; everyone else keeps their current role (defaulting to `viewer` from the column default on first creation).

- [ ] **Step 3: Add your own email to the local + example env**

Add a line to `.env.local` (do not print its contents — this file is gitignored and already holds the real `DATABASE_URL`):

```bash
echo "PLAN_ADMIN_EMAILS=khantee9@gmail.com" >> .env.local
```

Add the same key (blank) to `.env.example`:

```bash
printf 'PLAN_ADMIN_EMAILS=\n' >> .env.example
```

- [ ] **Step 4: Update the CLAUDE.md env var list**

In `CLAUDE.md` (this project's own doc, not the root one), find the line:

```
- **Env vars:** `DATABASE_URL`, `AUTH_SECRET`, `ALLOWED_EMAILS`, `RESEND_API_KEY`, `AUTH_URL` (pin to `https://nanoteofficial.me` so magic links don't point at preview URLs).
```

Replace it with:

```
- **Env vars:** `DATABASE_URL`, `AUTH_SECRET`, `ALLOWED_EMAILS`, `PLAN_ADMIN_EMAILS` (comma-separated emails auto-promoted to the `admin` role on sign-in), `RESEND_API_KEY`, `AUTH_URL` (pin to `https://nanoteofficial.me` so magic links don't point at preview URLs).
```

- [ ] **Step 5: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors. (`session.user.role` and `user.role` now resolve to `UserRole` via the augmentation in Step 1.)

- [ ] **Step 6: Commit**

```bash
git add src/types/next-auth.d.ts src/auth.ts .env.example CLAUDE.md
git commit -m "feat(plan): self-healing admin bootstrap + role on session"
```

(`.env.local` is gitignored and won't be staged by this command — verify with `git status` that it doesn't appear.)

- [ ] **Step 7: Remind the user to set the Vercel env var**

This step has no code — flag to the user (outside this plan) that `PLAN_ADMIN_EMAILS` must also be added to the Vercel project's env vars (same value as `.env.local`) before this takes effect in production, and that Vercel requires a redeploy (or the next deploy in Task 7) to pick it up.

---

### Task 3: Authorization helpers, mutation gating, role-management action, admin query

**Files:**
- Modify: `src/lib/plan/actions.ts`
- Modify: `src/lib/plan/queries.ts`
- Modify: `src/lib/plan/types.ts`

**Interfaces:**
- Consumes: `UserRole` from Task 1, `session.user.role` from Task 2.
- Produces: `requireEditor()`, `requireAdmin()` (internal to `actions.ts`), `setUserRole(userId: string, role: UserRole): Promise<void>` (exported action, used by Task 5's `RoleSelect`), `canEditPlan(role: UserRole): boolean` (exported from `types.ts`, used by every component in Task 6), `PlanUserWithRole` type and `listUsersForAdmin(): Promise<PlanUserWithRole[]>` (used by Task 5's admin page).

- [ ] **Step 1: Add `canEditPlan` and `PlanUserWithRole` to `types.ts`**

In `src/lib/plan/types.ts`, change the top import line from:

```ts
import type { Project, Task } from "@/lib/db/schema";
```

to:

```ts
import type { Project, Task, UserRole } from "@/lib/db/schema";
```

Then add, right after the existing `PlanUser` type (after the line `export type PlanUser = { id: string; name: string | null; email: string | null };`):

```ts
export const USER_ROLES: UserRole[] = ["admin", "editor", "viewer"];

export function canEditPlan(role: UserRole): boolean {
  return role === "admin" || role === "editor";
}

export type PlanUserWithRole = PlanUser & { role: UserRole };
```

- [ ] **Step 2: Add `requireEditor`/`requireAdmin` and gate every mutation in `actions.ts`**

In `src/lib/plan/actions.ts`, change the imports at the top from:

```ts
"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { projects, tasks } from "@/lib/db/schema";
import type { Task } from "@/lib/db/schema";
import { auth } from "@/auth";
```

to:

```ts
"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { projects, tasks, users } from "@/lib/db/schema";
import type { Task, UserRole } from "@/lib/db/schema";
import { auth } from "@/auth";
```

Replace the `requireUser` function:

```ts
async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}
```

with:

```ts
async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

async function requireEditor() {
  const user = await requireUser();
  if (user.role !== "admin" && user.role !== "editor") throw new Error("Forbidden");
  return user;
}

async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") throw new Error("Forbidden");
  return user;
}
```

Then, in every existing mutation, replace the leading `await requireUser();` with `await requireEditor();` — this applies to `createProject`, `updateProject`, `archiveProject`, `createTask`, `updateTask`, `deleteTask`, and `moveTask` (7 call sites total; `requireUser` itself, defined above, is unchanged and no longer called from any mutation).

Finally, add a new action at the end of the file:

```ts
export async function setUserRole(userId: string, role: UserRole): Promise<void> {
  await requireAdmin();
  await db.update(users).set({ role }).where(eq(users.id, userId));
  revalidatePath("/plan/admin");
}
```

- [ ] **Step 3: Add `listUsersForAdmin` to `queries.ts`**

In `src/lib/plan/queries.ts`, change the type import line from:

```ts
import type { PlanUser, ProjectWithProgress, StatusCount, TeamLoadRow } from "./types";
```

to:

```ts
import type { PlanUser, PlanUserWithRole, ProjectWithProgress, StatusCount, TeamLoadRow } from "./types";
```

Then add, right after the existing `listUsers` function:

```ts
export async function listUsersForAdmin(): Promise<PlanUserWithRole[]> {
  return db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role })
    .from(users)
    .orderBy(asc(users.name), asc(users.email));
}
```

- [ ] **Step 4: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 5: Manual verification of server-side gating**

With the dev server running (`npm run dev`) and signed in as your own (now-admin, per Task 2) account, confirm existing mutations still work (e.g. create a task from the UI). This confirms `requireEditor()` didn't break the admin/editor path — viewer-side rejection is verified in Task 6 once there's UI to test it through.

- [ ] **Step 6: Commit**

```bash
git add src/lib/plan/actions.ts src/lib/plan/queries.ts src/lib/plan/types.ts
git commit -m "feat(plan): requireEditor/requireAdmin gating + setUserRole action"
```

---

### Task 4: i18n strings for roles and the admin screen

**Files:**
- Modify: `src/lib/plan/i18n.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `pt(lang, "role.admin" | "role.editor" | "role.viewer")`, `pt(lang, "admin.title" | "admin.user" | "admin.role")`, `pt(lang, "nav.admin")`, `pt(lang, "toast.roleUpdated" | "toast.roleUpdateErr")`, and a `roleKey(role: UserRole): PlanKey` helper — all used by Task 5.

- [ ] **Step 1: Add the new dictionary keys**

In `src/lib/plan/i18n.ts`, add these entries to the `dict` object. Place the nav one next to the existing `"nav.projects"` entry:

```ts
  "nav.admin": { en: "Admin", th: "ผู้ดูแลระบบ" },
```

Add these next to the existing `"toast.*"` entries (anywhere in that block):

```ts
  "toast.roleUpdated": { en: "Role updated", th: "อัปเดตบทบาทแล้ว" },
  "toast.roleUpdateErr": { en: "Couldn't update role", th: "อัปเดตบทบาทไม่สำเร็จ" },
```

Add a new block right before the closing `} as const;` of `dict`:

```ts

  "role.admin": { en: "Admin", th: "ผู้ดูแลระบบ" },
  "role.editor": { en: "Editor", th: "ผู้แก้ไข" },
  "role.viewer": { en: "Viewer", th: "ผู้ชม" },

  "admin.title": { en: "Manage users", th: "จัดการผู้ใช้" },
  "admin.user": { en: "User", th: "ผู้ใช้" },
  "admin.role": { en: "Role", th: "บทบาท" },
```

- [ ] **Step 2: Add the `roleKey` helper**

At the bottom of the file, next to the existing `statusKey`/`typeKey` exports:

```ts
export const statusKey = (s: string) => `status.${s}` as PlanKey;
export const typeKey = (s: string) => `type.${s}` as PlanKey;
export const roleKey = (r: string) => `role.${r}` as PlanKey;
```

(Only the new `roleKey` line is an addition — the two `statusKey`/`typeKey` lines already exist and are shown for placement context.)

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/plan/i18n.ts
git commit -m "feat(plan): i18n strings for roles and admin screen"
```

---

### Task 5: Admin UI — role management screen

**Files:**
- Create: `src/components/plan/RoleSelect.tsx`
- Create: `src/app/plan/(app)/admin/page.tsx`
- Modify: `src/app/plan/(app)/layout.tsx`

**Interfaces:**
- Consumes: `setUserRole` (Task 3), `listUsersForAdmin`/`PlanUserWithRole` (Task 3), `USER_ROLES`/`userLabel` (Task 3 / existing `types.ts`), `roleKey` (Task 4), `usePlanT`/`useToast` (existing).
- Produces: `RoleSelect` component, `/plan/admin` route, an "Admin" nav link visible only to admins.

- [ ] **Step 1: Create `RoleSelect`**

Create `src/components/plan/RoleSelect.tsx`:

```tsx
"use client";
import { useTransition } from "react";
import { setUserRole } from "@/lib/plan/actions";
import { USER_ROLES } from "@/lib/plan/types";
import type { UserRole } from "@/lib/db/schema";
import { useToast } from "./Toaster";
import { usePlanT } from "./LangContext";
import { roleKey } from "@/lib/plan/i18n";
import { inputCls } from "./ui";

export function RoleSelect({
  userId, role, disabled = false,
}: {
  userId: string;
  role: UserRole;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const { t } = usePlanT();

  const onChange = (next: UserRole) => {
    startTransition(async () => {
      try {
        await setUserRole(userId, next);
        toast(t("toast.roleUpdated"), { tone: "success" });
      } catch {
        toast(t("toast.roleUpdateErr"), { tone: "error" });
      }
    });
  };

  return (
    <select
      value={role}
      disabled={disabled || pending}
      onChange={(e) => onChange(e.target.value as UserRole)}
      className={`${inputCls} max-w-[10rem] disabled:opacity-50`}
    >
      {USER_ROLES.map((r) => <option key={r} value={r}>{t(roleKey(r))}</option>)}
    </select>
  );
}
```

- [ ] **Step 2: Create the admin page**

Create `src/app/plan/(app)/admin/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getLang } from "@/lib/i18n";
import { pt } from "@/lib/plan/i18n";
import { listUsersForAdmin } from "@/lib/plan/queries";
import { userLabel } from "@/lib/plan/types";
import { RoleSelect } from "@/components/plan/RoleSelect";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (session?.user.role !== "admin") redirect("/plan");
  const [users, lang] = await Promise.all([listUsersForAdmin(), getLang()]);
  const currentEmail = session.user.email;

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{pt(lang, "admin.title")}</h1>
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <table className="w-full min-w-[28rem] text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-soft)]">
              <th className="px-4 py-2.5 font-medium">{pt(lang, "admin.user")}</th>
              <th className="px-4 py-2.5 font-medium">{pt(lang, "admin.role")}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-[var(--border-soft)]">
                <td className="px-4 py-2.5">
                  <div className="font-medium">{userLabel(u)}</div>
                  <div className="text-xs text-[var(--muted-soft)]">{u.email}</div>
                </td>
                <td className="px-4 py-2.5">
                  <RoleSelect userId={u.id} role={u.role} disabled={u.email === currentEmail} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
```

(`disabled={u.email === currentEmail}` stops an admin from changing their own role through this screen — not a security boundary, since `PLAN_ADMIN_EMAILS` self-heals it back on next sign-in anyway per Task 2, just a small UX guard against confusing mid-session self-lockout.)

- [ ] **Step 3: Add the nav link**

In `src/app/plan/(app)/layout.tsx`, find this block:

```tsx
                <Link href="/plan" className="hidden text-sm text-[var(--muted)] transition hover:text-[var(--foreground)] sm:block">
                  {pt(lang, "nav.projects")}
                </Link>
```

Add immediately after it:

```tsx
                {session.user.role === "admin" && (
                  <Link href="/plan/admin" className="hidden text-sm text-[var(--muted)] transition hover:text-[var(--foreground)] sm:block">
                    {pt(lang, "nav.admin")}
                  </Link>
                )}
```

- [ ] **Step 4: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 5: Manual verification**

With `npm run dev` running, sign in as your (admin) account, visit `/plan` and confirm the "Admin" link appears in the header; click it, confirm your own row's role select is disabled and every other invited user is listed with an editable role select; change a non-yourself user's role and confirm the success toast appears.

- [ ] **Step 6: Commit**

```bash
git add src/components/plan/RoleSelect.tsx "src/app/plan/(app)/admin/page.tsx" "src/app/plan/(app)/layout.tsx"
git commit -m "feat(plan): admin screen for managing user roles"
```

---

### Task 6: Viewer-facing read-only UI

**Files:**
- Modify: `src/components/plan/TaskForm.tsx`
- Modify: `src/components/plan/TaskDrawer.tsx`
- Modify: `src/components/plan/KanbanBoard.tsx`
- Modify: `src/components/plan/TableView.tsx`
- Modify: `src/components/plan/ProjectGrid.tsx`
- Modify: `src/components/plan/ProjectActions.tsx`
- Modify: `src/app/plan/(app)/page.tsx`
- Modify: `src/app/plan/(app)/[projectId]/page.tsx`

**Interfaces:**
- Consumes: `canEditPlan` (Task 3), `UserRole` (Task 1).
- Produces: every mutation-capable component now accepts a `role: UserRole` prop and hides/disables its controls when `!canEditPlan(role)`.

- [ ] **Step 1: Add a `readOnly` mode to `TaskForm`**

In `src/components/plan/TaskForm.tsx`, change the props destructuring from:

```ts
export function TaskForm({
  projectId, task, action, users = [], defaultOpen = false, bare = false,
}: {
  projectId: string;
  task?: Task;
  action: (fd: FormData) => Promise<void>;
  users?: PlanUser[];
  defaultOpen?: boolean;
  /** Render the form fields directly (no toggle button / card chrome) — for the drawer. */
  bare?: boolean;
}) {
```

to:

```ts
export function TaskForm({
  projectId, task, action, users = [], defaultOpen = false, bare = false, readOnly = false,
}: {
  projectId: string;
  task?: Task;
  action: (fd: FormData) => Promise<void>;
  users?: PlanUser[];
  defaultOpen?: boolean;
  /** Render the form fields directly (no toggle button / card chrome) — for the drawer. */
  bare?: boolean;
  /** Disable every field and hide the save/cancel row — viewers looking at a task. */
  readOnly?: boolean;
}) {
```

Then add `disabled={readOnly}` to every field. The `<input name="title" .../>` becomes:

```tsx
      <input name="title" required defaultValue={task?.title ?? ""} placeholder={t("task.title")} className={inputCls} autoFocus disabled={readOnly} />
```

The `<textarea>`:

```tsx
      <textarea name="description" defaultValue={task?.description ?? ""} placeholder={t("task.description")} rows={3} className={`${inputCls} resize-y`} disabled={readOnly} />
```

The status `<select>`:

```tsx
          <select name="status" defaultValue={task?.status ?? "backlog"} className={inputCls} disabled={readOnly}>
```

The assignee `<select>` (inside the `users.length > 0` block):

```tsx
            <select name="assigneeId" defaultValue={task?.assigneeId ?? ""} className={inputCls} disabled={readOnly}>
```

The due date, estimate, and cost `<input>`s each get `disabled={readOnly}` added:

```tsx
          <input name="dueDate" type="date" defaultValue={task?.dueDate ?? ""} className={inputCls} disabled={readOnly} />
```
```tsx
          <input name="estimateHours" type="number" step="0.5" defaultValue={task?.estimateHours ?? ""} placeholder="0" className={inputCls} disabled={readOnly} />
```
```tsx
          <input name="cost" type="number" step="0.01" defaultValue={task?.cost ?? ""} placeholder="0.00" className={inputCls} disabled={readOnly} />
```

The tags `<input>`:

```tsx
      <input name="tags" defaultValue={(task?.tags ?? []).join(", ")} placeholder={t("task.tags")} className={inputCls} disabled={readOnly} />
```

Finally, wrap the save/cancel button row so it doesn't render at all in read-only mode. Change:

```tsx
      <div className="flex gap-2">
        <button type="submit" className={btnPrimary} disabled={pending}>{pending ? t("common.saving") : t("common.save")}</button>
        {!bare && <button type="button" onClick={() => setOpen(false)} className={btnGhost}>{t("common.cancel")}</button>}
      </div>
```

to:

```tsx
      {!readOnly && (
        <div className="flex gap-2">
          <button type="submit" className={btnPrimary} disabled={pending}>{pending ? t("common.saving") : t("common.save")}</button>
          {!bare && <button type="button" onClick={() => setOpen(false)} className={btnGhost}>{t("common.cancel")}</button>}
        </div>
      )}
```

- [ ] **Step 2: Pass `role` through `TaskDrawer` and hide the delete button**

Replace the full contents of `src/components/plan/TaskDrawer.tsx` with:

```tsx
"use client";
import { Drawer } from "./Drawer";
import { TaskForm } from "./TaskForm";
import { StatusBadge, btnDanger } from "./ui";
import { updateTask } from "@/lib/plan/actions";
import { statusKey } from "@/lib/plan/i18n";
import { usePlanT } from "./LangContext";
import { canEditPlan } from "@/lib/plan/types";
import type { PlanUser } from "@/lib/plan/types";
import type { Task, UserRole } from "@/lib/db/schema";

export function TaskDrawer({
  task, users, role, onClose, onDelete,
}: {
  task: Task | null;
  users: PlanUser[];
  role: UserRole;
  onClose: () => void;
  onDelete: (task: Task) => void;
}) {
  const { t } = usePlanT();
  const canEdit = canEditPlan(role);
  return (
    <Drawer
      open={task != null}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          {t("task.editTitle")} {task && <StatusBadge status={task.status} label={t(statusKey(task.status))} />}
        </span>
      }
    >
      {task && (
        <div className="flex flex-col gap-6">
          <TaskForm
            projectId={task.projectId}
            task={task}
            users={users}
            bare
            readOnly={!canEdit}
            action={async (fd) => { await updateTask(task.id, fd); onClose(); }}
          />
          {canEdit && (
            <div className="border-t border-[var(--border)] pt-4">
              <button onClick={() => { onDelete(task); onClose(); }} className={btnDanger}>
                {t("task.deleteBtn")}
              </button>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}
```

- [ ] **Step 3: Gate `KanbanBoard`'s drag sensors and quick-add**

In `src/components/plan/KanbanBoard.tsx`, change the imports from:

```ts
import { TASK_STATUSES } from "@/lib/plan/types";
import type { PlanUser } from "@/lib/plan/types";
import { moveTask, createTask, deleteTask } from "@/lib/plan/actions";
import { statusKey } from "@/lib/plan/i18n";
import { KanbanCard, CardVisual } from "./KanbanCard";
import { TaskDrawer } from "./TaskDrawer";
import { useToast } from "./Toaster";
import { usePlanT } from "./LangContext";
import { PlusIcon } from "./ui";
import type { Task } from "@/lib/db/schema";
```

to:

```ts
import { TASK_STATUSES, canEditPlan } from "@/lib/plan/types";
import type { PlanUser } from "@/lib/plan/types";
import { moveTask, createTask, deleteTask } from "@/lib/plan/actions";
import { statusKey } from "@/lib/plan/i18n";
import { KanbanCard, CardVisual } from "./KanbanCard";
import { TaskDrawer } from "./TaskDrawer";
import { useToast } from "./Toaster";
import { usePlanT } from "./LangContext";
import { PlusIcon } from "./ui";
import type { Task, UserRole } from "@/lib/db/schema";
```

Change the component signature from:

```ts
export function KanbanBoard({ projectId, tasks, users = [] }: { projectId: string; tasks: Task[]; users?: PlanUser[] }) {
```

to:

```ts
export function KanbanBoard({ projectId, tasks, users = [], role }: { projectId: string; tasks: Task[]; users?: PlanUser[]; role: UserRole }) {
```

Change the sensors setup from:

```ts
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
```

to:

```ts
  const canEdit = canEditPlan(role);
  const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 6 } });
  const keyboardSensor = useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates });
  const sensors = useSensors(...(canEdit ? [pointerSensor, keyboardSensor] : []));
```

(Both `useSensor` calls stay unconditional — only the array fed into `useSensors` is conditional — so the Rules of Hooks are respected.)

Change the `QuickAdd` render line from:

```tsx
              <QuickAdd projectId={projectId} status={s} onError={() => toast(t("toast.taskAddErr"), { tone: "error" })} />
```

to:

```tsx
              {canEdit && <QuickAdd projectId={projectId} status={s} onError={() => toast(t("toast.taskAddErr"), { tone: "error" })} />}
```

Change the `TaskDrawer` render line from:

```tsx
      <TaskDrawer task={selected} users={users} onClose={() => setSelected(null)} onDelete={onDelete} />
```

to:

```tsx
      <TaskDrawer task={selected} users={users} role={role} onClose={() => setSelected(null)} onDelete={onDelete} />
```

- [ ] **Step 4: Gate `TableView`'s delete button**

In `src/components/plan/TableView.tsx`, change the imports from:

```ts
import { userLabel, TASK_STATUSES } from "@/lib/plan/types";
import type { PlanUser } from "@/lib/plan/types";
import { deleteTask } from "@/lib/plan/actions";
import { dueState, DUE_TEXT } from "@/lib/plan/dates";
import { statusKey } from "@/lib/plan/i18n";
import { StatusBadge, inputCls } from "./ui";
import { TaskDrawer } from "./TaskDrawer";
import { useToast } from "./Toaster";
import { usePlanT } from "./LangContext";
import type { Task } from "@/lib/db/schema";
```

to:

```ts
import { userLabel, TASK_STATUSES, canEditPlan } from "@/lib/plan/types";
import type { PlanUser } from "@/lib/plan/types";
import { deleteTask } from "@/lib/plan/actions";
import { dueState, DUE_TEXT } from "@/lib/plan/dates";
import { statusKey } from "@/lib/plan/i18n";
import { StatusBadge, inputCls } from "./ui";
import { TaskDrawer } from "./TaskDrawer";
import { useToast } from "./Toaster";
import { usePlanT } from "./LangContext";
import type { Task, UserRole } from "@/lib/db/schema";
```

Change the component signature from:

```ts
export function TableView({ tasks, users = [] }: { tasks: Task[]; users?: PlanUser[] }) {
```

to:

```ts
export function TableView({ tasks, users = [], role }: { tasks: Task[]; users?: PlanUser[]; role: UserRole }) {
```

Add, right after the existing `nameOf` helper (before the `const rows = useMemo(...)` block):

```ts
  const canEdit = canEditPlan(role);
```

Change the delete cell from:

```tsx
                    <td className="px-4 py-2.5">
                      <button onClick={(e) => { e.stopPropagation(); onDelete(task); }}
                        className="rounded-md px-2 py-1 text-sm text-[var(--muted-soft)] transition hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400">
                        {t("common.delete")}
                      </button>
                    </td>
```

to:

```tsx
                    <td className="px-4 py-2.5">
                      {canEdit && (
                        <button onClick={(e) => { e.stopPropagation(); onDelete(task); }}
                          className="rounded-md px-2 py-1 text-sm text-[var(--muted-soft)] transition hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400">
                          {t("common.delete")}
                        </button>
                      )}
                    </td>
```

Change the `TaskDrawer` render line from:

```tsx
      <TaskDrawer task={selected} users={users} onClose={() => setSelected(null)} onDelete={onDelete} />
```

to:

```tsx
      <TaskDrawer task={selected} users={users} role={role} onClose={() => setSelected(null)} onDelete={onDelete} />
```

- [ ] **Step 5: Gate `ProjectGrid`'s "New project" button**

Replace the full contents of `src/components/plan/ProjectGrid.tsx` with:

```tsx
import { ProjectCard } from "./ProjectCard";
import { ProjectForm } from "./ProjectForm";
import { createProject } from "@/lib/plan/actions";
import { canEditPlan } from "@/lib/plan/types";
import type { ProjectWithProgress } from "@/lib/plan/types";
import type { Lang } from "@/lib/i18n";
import type { UserRole } from "@/lib/db/schema";

export function ProjectGrid({ projects, lang, role }: { projects: ProjectWithProgress[]; lang: Lang; role: UserRole }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => <ProjectCard key={p.id} p={p} lang={lang} />)}
      {canEditPlan(role) && <ProjectForm action={createProject} />}
    </div>
  );
}
```

- [ ] **Step 6: Gate `ProjectActions` (edit/archive)**

In `src/components/plan/ProjectActions.tsx`, change the imports from:

```ts
import { updateProject, archiveProject } from "@/lib/plan/actions";
import type { Project } from "@/lib/db/schema";
```

to:

```ts
import { updateProject, archiveProject } from "@/lib/plan/actions";
import { canEditPlan } from "@/lib/plan/types";
import type { Project, UserRole } from "@/lib/db/schema";
```

Change the component signature and add an early return from:

```ts
export function ProjectActions({ project }: { project: Project }) {
  const [editing, setEditing] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const { t } = usePlanT();
  if (editing) return (
```

to:

```ts
export function ProjectActions({ project, role }: { project: Project; role: UserRole }) {
  const [editing, setEditing] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const { t } = usePlanT();
  if (!canEditPlan(role)) return null;
  if (editing) return (
```

- [ ] **Step 7: Fetch and thread `role` from the two server pages**

Replace the full contents of `src/app/plan/(app)/page.tsx` with:

```tsx
import { auth } from "@/auth";
import { getLang } from "@/lib/i18n";
import { pt } from "@/lib/plan/i18n";
import { listProjects, teamLoad } from "@/lib/plan/queries";
import { ProjectGrid } from "@/components/plan/ProjectGrid";
import { TeamLoad } from "@/components/plan/TeamLoad";

export const dynamic = "force-dynamic";

export default async function PlanOverviewPage() {
  const [projects, team, lang, session] = await Promise.all([listProjects(), teamLoad(), getLang(), auth()]);
  const role = session!.user.role;
  return (
    <section className="space-y-12">
      <div>
        <div className="mb-5 flex items-baseline gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{pt(lang, "nav.projects")}</h1>
          <span className="text-sm text-[var(--muted-soft)] tabular-nums">{projects.length}</span>
        </div>
        <ProjectGrid projects={projects} lang={lang} role={role} />
      </div>
      <div>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">{pt(lang, "overview.teamLoad")}</h2>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <TeamLoad rows={team} lang={lang} />
        </div>
      </div>
    </section>
  );
}
```

(`session!` — the `!` is safe here: this page only ever renders inside the `(app)` route group, whose `layout.tsx` already calls `auth()` and redirects to `/plan/signin` for anyone unauthenticated. Auth.js v5's `auth()` is deduped per request, so this second call is not an extra DB round-trip.)

In `src/app/plan/(app)/[projectId]/page.tsx`, change the imports from:

```ts
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, listTasks, listUsers, statusCounts } from "@/lib/plan/queries";
import { createTask } from "@/lib/plan/actions";
import { computeBurndown } from "@/lib/plan/burndown";
import { getLang } from "@/lib/i18n";
import { pt, typeKey } from "@/lib/plan/i18n";
import { ViewTabs } from "@/components/plan/ViewTabs";
import { StatusOverview } from "@/components/plan/StatusOverview";
import { TableView } from "@/components/plan/TableView";
import { KanbanBoard } from "@/components/plan/KanbanBoard";
import { CalendarView } from "@/components/plan/CalendarView";
import { BurndownChart } from "@/components/plan/BurndownChart";
import { TaskForm } from "@/components/plan/TaskForm";
import { ProjectActions } from "@/components/plan/ProjectActions";
import { TypeBadge, CalendarIcon } from "@/components/plan/ui";
```

to:

```ts
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getProject, listTasks, listUsers, statusCounts } from "@/lib/plan/queries";
import { createTask } from "@/lib/plan/actions";
import { computeBurndown } from "@/lib/plan/burndown";
import { canEditPlan } from "@/lib/plan/types";
import { getLang } from "@/lib/i18n";
import { pt, typeKey } from "@/lib/plan/i18n";
import { ViewTabs } from "@/components/plan/ViewTabs";
import { StatusOverview } from "@/components/plan/StatusOverview";
import { TableView } from "@/components/plan/TableView";
import { KanbanBoard } from "@/components/plan/KanbanBoard";
import { CalendarView } from "@/components/plan/CalendarView";
import { BurndownChart } from "@/components/plan/BurndownChart";
import { TaskForm } from "@/components/plan/TaskForm";
import { ProjectActions } from "@/components/plan/ProjectActions";
import { TypeBadge, CalendarIcon } from "@/components/plan/ui";
```

Change the body from:

```tsx
  const { projectId } = await params;
  const { view = "table" } = await searchParams;
  const project = await getProject(projectId);
  if (!project) notFound();
  const [tasks, counts, users, lang] = await Promise.all([
    listTasks(projectId), statusCounts(projectId), listUsers(), getLang(),
  ]);
```

to:

```tsx
  const { projectId } = await params;
  const { view = "table" } = await searchParams;
  const [project, session] = await Promise.all([getProject(projectId), auth()]);
  if (!project) notFound();
  const role = session!.user.role;
  const [tasks, counts, users, lang] = await Promise.all([
    listTasks(projectId), statusCounts(projectId), listUsers(), getLang(),
  ]);
```

Change the `ProjectActions` render line from:

```tsx
          <ProjectActions project={project} />
```

to:

```tsx
          <ProjectActions project={project} role={role} />
```

Change the view-tabs/add-task row from:

```tsx
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ViewTabs />
        {view !== "burndown" && (
          <TaskForm projectId={projectId} users={users} action={createTask.bind(null, projectId)} />
        )}
      </div>

      {view === "kanban" ? <KanbanBoard key={tasksKey} projectId={projectId} tasks={tasks} users={users} />
        : view === "calendar" ? <CalendarView tasks={tasks} lang={lang} />
        : view === "burndown" ? <BurndownChart data={computeBurndown(tasks, project)} lang={lang} />
        : <TableView key={tasksKey} tasks={tasks} users={users} />}
```

to:

```tsx
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ViewTabs />
        {view !== "burndown" && canEditPlan(role) && (
          <TaskForm projectId={projectId} users={users} action={createTask.bind(null, projectId)} />
        )}
      </div>

      {view === "kanban" ? <KanbanBoard key={tasksKey} projectId={projectId} tasks={tasks} users={users} role={role} />
        : view === "calendar" ? <CalendarView tasks={tasks} lang={lang} />
        : view === "burndown" ? <BurndownChart data={computeBurndown(tasks, project)} lang={lang} />
        : <TableView key={tasksKey} tasks={tasks} users={users} role={role} />}
```

- [ ] **Step 8: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 9: Manual verification as a viewer**

Using the admin page from Task 5, demote a second test invited email to `viewer` (or temporarily add a second email to `ALLOWED_EMAILS` and sign in as it in a private browser window). Signed in as that viewer:
- `/plan`: no "New project" tile in the grid.
- A project page: no "Add task" button, no edit/archive buttons, table view has no delete buttons, kanban has no "+ Add" per column and cards can't be dragged (pointer drag does nothing).
- Opening a task (click a table row / kanban card) opens the drawer with all fields visibly disabled and no Save/Delete buttons.
- As a defense-in-depth check, confirm a direct call would still be rejected server-side: temporarily add a page with a button that calls `createTask` while signed in as the viewer, or simply trust Task 3's `requireEditor()` gate (already verified there) — this UI pass is about hiding, not re-proving the server gate.

- [ ] **Step 10: Commit**

```bash
git add src/components/plan/TaskForm.tsx src/components/plan/TaskDrawer.tsx src/components/plan/KanbanBoard.tsx src/components/plan/TableView.tsx src/components/plan/ProjectGrid.tsx src/components/plan/ProjectActions.tsx "src/app/plan/(app)/page.tsx" "src/app/plan/(app)/[projectId]/page.tsx"
git commit -m "feat(plan): read-only UI for viewer role"
```

---

### Task 7: Final verification and deploy

**Files:** none (verification only)

- [ ] **Step 1: Full type-check, lint, and build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: all three pass with no errors.

- [ ] **Step 2: Build with `DATABASE_URL` unset**

Run: `env -u DATABASE_URL npm run build`
Expected: build still succeeds (per this repo's existing invariant — `src/lib/db/index.ts`'s placeholder-URL fallback must still hold with the new `role` column/enum in the schema).

- [ ] **Step 3: Push and open a PR**

```bash
git push -u origin HEAD
gh pr create --title "feat(plan): admin/editor/viewer roles" --body "Adds a three-tier role system to /plan per docs/superpowers/specs/2026-07-01-plan-roles-permissions-design.md — closes the flat-permissions gap called out in the original design."
```

- [ ] **Step 4: Remind the user before merge**

Flag to the user (not a code step): confirm `PLAN_ADMIN_EMAILS` has been added to the Vercel project's env vars (Task 2, Step 7) before or immediately after merging, otherwise the bootstrap admin promotion won't happen in production on next sign-in.
