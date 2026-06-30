# `/plan` Project-Management Workspace — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a private, invite-only project-management workspace at `/plan` (master overview + per-project Kanban / Table / Calendar / status overview) backed by Auth.js magic-link login and Neon Postgres.

**Architecture:** A client-heavy route group inside the existing Next 16 RSC portfolio. RSC pages load data via Drizzle queries; interactive views are `"use client"` components; all mutations go through Server Actions. Auth is gated in `src/app/plan/layout.tsx` (not middleware — `middleware.ts` conflicts with `src/proxy.ts`).

**Tech Stack:** Next 16 (App Router), React 19, TypeScript, Tailwind v4, Auth.js v5 (`next-auth@beta`) + Resend email provider, Neon Postgres + Drizzle ORM, `@dnd-kit` for Kanban drag-and-drop.

## Global Constraints

- **Next.js version:** 16 — App-Router APIs differ from training data; verify Auth.js v5 + Next 16 wiring against live docs (context7 / `node_modules/next/dist/docs/`) before coding auth.
- **No `middleware.ts`** — it conflicts with `src/proxy.ts`. Gate routes in the `plan` layout instead.
- **Path alias:** import app code via `@/*` → `./src/*`.
- **i18n:** `/plan` is a private owner tool — **English-only UI is acceptable** (do not wire the `LStr`/`t()` bilingual system into `/plan`). This is an intentional deviation from the public site's bilingual rule.
- **RSC constraint:** no inline event handlers in server components; any interactivity needs `"use client"`.
- **External links:** `rel="noopener noreferrer"` + `target="_blank"`.
- **CSP:** DB is server-side only; do not add browser `connect-src`. No CSP change expected — if a client component needs a new origin, stop and reconsider.
- **No unit-test runner exists in this repo.** Per the approved spec, the per-task verification cycle is: `npx tsc --noEmit` → `npm run lint` → `npm run build`, plus Playwright (webapp-testing skill) for UI/auth flows. "Write the failing test" steps below are Playwright checks or type/build checks, not a unit framework.
- **Secrets:** never commit `.env.local`. Env keys: `AUTH_SECRET`, `DATABASE_URL`, `ALLOWED_EMAILS`, reuse `RESEND_API_KEY`.
- **Commits:** frequent, one per task minimum. Work on branch `feat/plan-workspace`. End commit messages with the `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` trailer.

## File Structure

**Create:**
- `drizzle.config.ts` — drizzle-kit config (schema path, Neon URL).
- `src/lib/db/schema.ts` — Drizzle tables: auth (`users`, `accounts`, `sessions`, `verificationTokens`) + `projects`, `tasks` + enums.
- `src/lib/db/index.ts` — Neon serverless client + drizzle instance.
- `src/auth.ts` — Auth.js config: Resend provider, Drizzle adapter, allowlist `signIn` callback. Exports `auth`, `handlers`, `signIn`, `signOut`.
- `src/app/api/auth/[...nextauth]/route.ts` — re-exports Auth.js `handlers`.
- `src/lib/plan/types.ts` — shared domain types + enum constants + derived view types.
- `src/lib/plan/queries.ts` — read functions (overview, project, tasks, status counts).
- `src/lib/plan/actions.ts` — Server Actions (project + task mutations, task move).
- `src/app/plan/signin/page.tsx` + `src/components/plan/SignInForm.tsx` — magic-link sign-in (PUBLIC, outside the gated group).
- `src/app/plan/(app)/layout.tsx` — auth gate + workspace chrome (protects only the `(app)` group).
- `src/app/plan/(app)/page.tsx` — master overview (RSC).
- `src/app/plan/(app)/[projectId]/page.tsx` — single project (RSC) with view tabs.

> **Route-group structure (decided up front, do not move later):** the gate lives in `(app)/layout.tsx`. `/plan` and `/plan/[projectId]` resolve to files under `(app)/` (the group name is URL-invisible). `/plan/signin` sits outside the group so it is never gated — avoiding a redirect loop.
- `src/components/plan/ProjectCard.tsx`, `ProjectForm.tsx`, `ProjectGrid.tsx` — overview UI.
- `src/components/plan/ViewTabs.tsx` — client tab switcher.
- `src/components/plan/StatusOverview.tsx` — status count band.
- `src/components/plan/TaskForm.tsx` — add/edit task (client, shared).
- `src/components/plan/TableView.tsx`, `KanbanBoard.tsx`, `KanbanCard.tsx`, `CalendarView.tsx` — view components.

**Modify:**
- `src/app/robots.ts` — add `/plan` to disallow list.
- `package.json` — new deps (via install).
- `.env.example` (create if absent) — document new env keys (no secrets).

---

## Task 1: Dependencies, env scaffolding, drizzle config

**Files:**
- Modify: `package.json` (via npm install)
- Create: `drizzle.config.ts`
- Create: `.env.example`
- Modify: `.env.local` (local only — NOT committed)

**Interfaces:**
- Produces: installed packages + `drizzle.config.ts` consumed by drizzle-kit in Task 2.

- [ ] **Step 1: Install runtime + dev dependencies**

```bash
npm install next-auth@beta @auth/drizzle-adapter drizzle-orm @neondatabase/serverless @dnd-kit/core @dnd-kit/sortable
npm install -D drizzle-kit
```

- [ ] **Step 2: Provision Neon Postgres**

Provision a Neon Postgres database (Vercel Marketplace → Storage → Neon, or Neon console). Copy the **pooled** connection string. Add it and the other keys to `.env.local`:

```bash
# .env.local  (DO NOT COMMIT)
DATABASE_URL="postgresql://...-pooler.../neondb?sslmode=require"
AUTH_SECRET="<output of: npx auth secret>"
ALLOWED_EMAILS="khantee9@gmail.com"
# RESEND_API_KEY already present for the contact form
```

Run `npx auth secret` to generate `AUTH_SECRET` (writes to `.env.local` automatically on recent versions; otherwise paste it).

- [ ] **Step 3: Create `.env.example` (committed, no secrets)**

```bash
# .env.example
DATABASE_URL=
AUTH_SECRET=
ALLOWED_EMAILS=
RESEND_API_KEY=
CONTACT_EMAIL=
```

- [ ] **Step 4: Create `drizzle.config.ts`**

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

- [ ] **Step 5: Verify install + typecheck**

Run: `npx tsc --noEmit`
Expected: PASS (no new source files reference missing modules yet).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json drizzle.config.ts .env.example
git commit -m "chore(plan): add auth/db/dnd deps + drizzle config"
```

---

## Task 2: Database schema + client + migration

**Files:**
- Create: `src/lib/db/schema.ts`
- Create: `src/lib/db/index.ts`
- Create: `drizzle/` (generated migration output)

**Interfaces:**
- Produces:
  - `db` (drizzle instance) from `@/lib/db`
  - tables `users, accounts, sessions, verificationTokens, projects, tasks` from `@/lib/db/schema`
  - enums `projectType` (`it|travel|interview|general`), `taskStatus` (`backlog|todo|in_progress|done`)
  - inferred types `Project = typeof projects.$inferSelect`, `Task = typeof tasks.$inferSelect`

- [ ] **Step 1: Write `src/lib/db/schema.ts`**

```ts
import {
  pgTable, text, timestamp, boolean, integer, numeric, date,
  uuid, primaryKey, pgEnum,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

/* ---- Auth.js standard tables (Drizzle adapter shape) ---- */
export const users = pgTable("user", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable("account", {
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").$type<AdapterAccountType>().notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (a) => [primaryKey({ columns: [a.provider, a.providerAccountId] })]);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verificationToken", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
}, (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]);

/* ---- Plan domain ---- */
export const projectType = pgEnum("project_type", ["it", "travel", "interview", "general"]);
export const taskStatus = pgEnum("task_status", ["backlog", "todo", "in_progress", "done"]);

export const projects = pgTable("project", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: projectType("type").notNull().default("general"),
  description: text("description"),
  color: text("color").notNull().default("#3B4FBF"),
  startDate: date("start_date"),
  targetDate: date("target_date"),
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tasks = pgTable("task", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatus("status").notNull().default("backlog"),
  assigneeId: text("assignee_id").references(() => users.id, { onDelete: "set null" }),
  startDate: date("start_date"),
  dueDate: date("due_date"),
  estimateHours: numeric("estimate_hours"),
  cost: numeric("cost"),
  tags: text("tags").array().notNull().default([]),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
```

- [ ] **Step 2: Write `src/lib/db/index.ts`**

```ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

- [ ] **Step 3: Generate the migration**

Run: `npx drizzle-kit generate`
Expected: a SQL file appears under `drizzle/`. Inspect it — it should `CREATE TABLE` for all six tables and both enums.

- [ ] **Step 4: Push schema to Neon**

Run: `npx drizzle-kit push`
Expected: "Changes applied". Confirm with `npx drizzle-kit studio` or a Neon SQL console (`\dt` shows the tables).

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/db drizzle
git commit -m "feat(plan): drizzle schema (auth + projects + tasks) + neon client"
```

---

## Task 3: Auth.js magic-link + route gate + privacy

**Files:**
- Create: `src/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/app/plan/(app)/layout.tsx` (gate)
- Create: `src/app/plan/(app)/page.tsx` (placeholder; replaced by real overview in Task 6)
- Create: `src/app/plan/signin/page.tsx`
- Create: `src/components/plan/SignInForm.tsx`
- Modify: `src/app/robots.ts`

**Interfaces:**
- Consumes: `db` from `@/lib/db`, tables from `@/lib/db/schema`.
- Produces: `auth()` (returns `Session | null`), `handlers`, `signIn`, `signOut` from `@/auth`. Server-action `signInWithEmail(formData)` used by `SignInForm`.

⚠️ **Before coding:** fetch current Auth.js v5 docs (context7: `next-auth`) to confirm the Resend provider import path and `DrizzleAdapter` table-mapping signature against Next 16.

- [ ] **Step 1: Write `src/auth.ts`**

```ts
import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { users, accounts, sessions, verificationTokens } from "@/lib/db/schema";

const allowed = (process.env.ALLOWED_EMAILS ?? "")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Resend({ from: "noreply@nanoteofficial.me" }),
  ],
  session: { strategy: "database" },
  pages: { signIn: "/plan/signin" },
  callbacks: {
    signIn({ user }) {
      const email = user.email?.toLowerCase();
      return !!email && allowed.includes(email);
    },
  },
});
```

> Note: the Resend `from` must be a verified sender on your Resend domain. If `noreply@nanoteofficial.me` is not verified, use the same verified address the contact form sends from.

- [ ] **Step 2: Write `src/app/api/auth/[...nextauth]/route.ts`**

```ts
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```

- [ ] **Step 3: Write `src/app/plan/(app)/layout.tsx` (auth gate)**

```tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function PlanLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/plan/signin");

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="flex items-center justify-between border-b border-black/10 px-6 py-4 dark:border-white/10">
        <Link href="/plan" className="font-semibold">Plan</Link>
        <form action={async () => { "use server"; await signOut({ redirectTo: "/plan/signin" }); }}>
          <span className="mr-3 text-sm opacity-70">{session.user.email}</span>
          <button className="text-sm underline" type="submit">Sign out</button>
        </form>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
```

- [ ] **Step 4: Write `src/components/plan/SignInForm.tsx`**

```tsx
"use client";
import { useState } from "react";

export function SignInForm({ action }: { action: (fd: FormData) => Promise<void> }) {
  const [sent, setSent] = useState(false);
  if (sent) return <p className="text-sm">Check your email for a sign-in link.</p>;
  return (
    <form
      action={async (fd) => { await action(fd); setSent(true); }}
      className="flex flex-col gap-3"
    >
      <input
        name="email" type="email" required placeholder="you@example.com"
        className="rounded-md border border-black/15 px-3 py-2 dark:border-white/15 bg-transparent"
      />
      <button className="rounded-md bg-[var(--feature-color)] px-3 py-2 text-white" type="submit">
        Send magic link
      </button>
    </form>
  );
}
```

- [ ] **Step 5: Write the gated-group placeholder page `src/app/plan/(app)/page.tsx`**

This gives the `(app)` group a route so `/plan` resolves (and the layout gate runs) before Task 6 builds the real overview. It is replaced in Task 6.

```tsx
export const dynamic = "force-dynamic";
export default function PlanPlaceholder() {
  return <p className="opacity-60">Plan overview — coming in Task 6.</p>;
}
```

- [ ] **Step 6: Write the public sign-in page `src/app/plan/signin/page.tsx`**

`/plan/signin` lives OUTSIDE the `(app)` group, so the gate never touches it (no redirect loop). It does its own redirect-if-already-authed.

```tsx
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { SignInForm } from "@/components/plan/SignInForm";

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) redirect("/plan");
  async function action(fd: FormData) {
    "use server";
    await signIn("resend", { email: String(fd.get("email")), redirectTo: "/plan" });
  }
  return (
    <div className="mx-auto mt-24 max-w-sm px-6">
      <h1 className="mb-4 text-xl font-semibold">Sign in to Plan</h1>
      <SignInForm action={action} />
    </div>
  );
}
```

- [ ] **Step 7: Add `/plan` to robots disallow**

In `src/app/robots.ts`, change the disallow array:

```ts
{ userAgent: "*", allow: "/", disallow: ["/kb", "/kb/", "/plan", "/plan/"] },
```

(`/plan` is already absent from `sitemap.ts`, so no sitemap edit is needed.)

- [ ] **Step 8: Typecheck + lint + build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: PASS. Build output still shows `ƒ Proxy (Middleware)` (proxy untouched) and lists `/plan`, `/plan/signin` + `/api/auth/[...nextauth]`.

- [ ] **Step 9: Verify auth flow (Playwright, webapp-testing skill)**

Run `npm run dev`. With Playwright:
1. Navigate to `http://localhost:3000/plan` → expect redirect to `/plan/signin`.
2. Submit a non-allowlisted email → magic link is issued but completing it must NOT create a session (callback rejects). 
3. Submit the allowlisted email → retrieve the link (Resend dashboard or server log) → completing it lands on `/plan`.

Document the manual link-retrieval step in the task notes if Playwright can't read the inbox.

- [ ] **Step 10: Commit**

```bash
git add src/auth.ts src/app/api/auth src/app/plan src/components/plan/SignInForm.tsx src/app/robots.ts
git commit -m "feat(plan): auth.js magic-link sign-in, route gate, robots disallow"
```

---

## Task 4: Domain types + read queries

**Files:**
- Create: `src/lib/plan/types.ts`
- Create: `src/lib/plan/queries.ts`

**Interfaces:**
- Consumes: `db`, `projects`, `tasks`, `Project`, `Task` from `@/lib/db`.
- Produces:
  - types `ProjectWithProgress = Project & { total: number; done: number; progress: number }`
  - `StatusCount = Record<Task["status"], number>`
  - `listProjects(): Promise<ProjectWithProgress[]>` (non-archived, ordered by `createdAt`)
  - `getProject(id: string): Promise<Project | null>`
  - `listTasks(projectId: string): Promise<Task[]>` (ordered by `status`, then `order`)
  - `statusCounts(projectId: string): Promise<StatusCount>`

- [ ] **Step 1: Write `src/lib/plan/types.ts`**

```ts
import type { Project, Task } from "@/lib/db/schema";

export const PROJECT_TYPES = ["it", "travel", "interview", "general"] as const;
export const TASK_STATUSES = ["backlog", "todo", "in_progress", "done"] as const;
export const STATUS_LABELS: Record<Task["status"], string> = {
  backlog: "Backlog", todo: "To do", in_progress: "In progress", done: "Done",
};

export type ProjectWithProgress = Project & { total: number; done: number; progress: number };
export type StatusCount = Record<Task["status"], number>;
```

- [ ] **Step 2: Write `src/lib/plan/queries.ts`**

```ts
import "server-only";
import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects, tasks } from "@/lib/db/schema";
import type { Project, Task } from "@/lib/db/schema";
import type { ProjectWithProgress, StatusCount } from "./types";

export async function listProjects(): Promise<ProjectWithProgress[]> {
  const rows = await db
    .select({
      p: projects,
      total: sql<number>`count(${tasks.id})::int`,
      done: sql<number>`(count(${tasks.id}) filter (where ${tasks.status} = 'done'))::int`,
    })
    .from(projects)
    .leftJoin(tasks, eq(tasks.projectId, projects.id))
    .where(eq(projects.archived, false))
    .groupBy(projects.id)
    .orderBy(asc(projects.createdAt));

  return rows.map(({ p, total, done }) => ({
    ...p, total, done, progress: total ? Math.round((done / total) * 100) : 0,
  }));
}

export async function getProject(id: string): Promise<Project | null> {
  const [row] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return row ?? null;
}

export async function listTasks(projectId: string): Promise<Task[]> {
  return db.select().from(tasks)
    .where(eq(tasks.projectId, projectId))
    .orderBy(asc(tasks.status), asc(tasks.order));
}

export async function statusCounts(projectId: string): Promise<StatusCount> {
  const rows = await db
    .select({ status: tasks.status, n: sql<number>`count(*)::int` })
    .from(tasks).where(eq(tasks.projectId, projectId)).groupBy(tasks.status);
  const out: StatusCount = { backlog: 0, todo: 0, in_progress: 0, done: 0 };
  for (const r of rows) out[r.status] = r.n;
  return out;
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS (no unused imports).

- [ ] **Step 4: Commit**

```bash
git add src/lib/plan/types.ts src/lib/plan/queries.ts
git commit -m "feat(plan): domain types + read queries (overview, tasks, status counts)"
```

---

## Task 5: Server Actions (mutations)

**Files:**
- Create: `src/lib/plan/actions.ts`

**Interfaces:**
- Consumes: `db`, `projects`, `tasks` from `@/lib/db`; `auth` from `@/auth`; `revalidatePath` from `next/cache`.
- Produces (all are `"use server"` actions):
  - `createProject(fd: FormData): Promise<void>`
  - `updateProject(id: string, fd: FormData): Promise<void>`
  - `archiveProject(id: string): Promise<void>`
  - `createTask(projectId: string, fd: FormData): Promise<void>`
  - `updateTask(id: string, fd: FormData): Promise<void>`
  - `deleteTask(id: string): Promise<void>`
  - `moveTask(id: string, status: Task["status"], order: number): Promise<void>`

- [ ] **Step 1: Write `src/lib/plan/actions.ts`**

```ts
"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { projects, tasks } from "@/lib/db/schema";
import type { Task } from "@/lib/db/schema";
import { auth } from "@/auth";

async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" && v.trim() ? v.trim() : null;
};
const num = (fd: FormData, k: string) => {
  const v = str(fd, k);
  return v == null ? null : v; // numeric columns accept string in drizzle
};

export async function createProject(fd: FormData): Promise<void> {
  await requireUser();
  const name = str(fd, "name");
  if (!name) throw new Error("Name required");
  await db.insert(projects).values({
    name,
    type: (str(fd, "type") as never) ?? "general",
    description: str(fd, "description"),
    color: str(fd, "color") ?? "#3B4FBF",
    startDate: str(fd, "startDate"),
    targetDate: str(fd, "targetDate"),
  });
  revalidatePath("/plan");
}

export async function updateProject(id: string, fd: FormData): Promise<void> {
  await requireUser();
  await db.update(projects).set({
    name: str(fd, "name") ?? undefined,
    type: (str(fd, "type") as never) ?? undefined,
    description: str(fd, "description"),
    color: str(fd, "color") ?? undefined,
    startDate: str(fd, "startDate"),
    targetDate: str(fd, "targetDate"),
    updatedAt: new Date(),
  }).where(eq(projects.id, id));
  revalidatePath("/plan");
  revalidatePath(`/plan/${id}`);
}

export async function archiveProject(id: string): Promise<void> {
  await requireUser();
  await db.update(projects).set({ archived: true, updatedAt: new Date() })
    .where(eq(projects.id, id));
  revalidatePath("/plan");
}

export async function createTask(projectId: string, fd: FormData): Promise<void> {
  await requireUser();
  const title = str(fd, "title");
  if (!title) throw new Error("Title required");
  await db.insert(tasks).values({
    projectId, title,
    description: str(fd, "description"),
    status: (str(fd, "status") as never) ?? "backlog",
    assigneeId: str(fd, "assigneeId"),
    startDate: str(fd, "startDate"),
    dueDate: str(fd, "dueDate"),
    estimateHours: num(fd, "estimateHours"),
    cost: num(fd, "cost"),
    tags: (str(fd, "tags") ?? "").split(",").map((t) => t.trim()).filter(Boolean),
  });
  revalidatePath(`/plan/${projectId}`);
}

export async function updateTask(id: string, fd: FormData): Promise<void> {
  await requireUser();
  const projectId = str(fd, "projectId");
  await db.update(tasks).set({
    title: str(fd, "title") ?? undefined,
    description: str(fd, "description"),
    status: (str(fd, "status") as never) ?? undefined,
    assigneeId: str(fd, "assigneeId"),
    startDate: str(fd, "startDate"),
    dueDate: str(fd, "dueDate"),
    estimateHours: num(fd, "estimateHours"),
    cost: num(fd, "cost"),
    tags: (str(fd, "tags") ?? "").split(",").map((t) => t.trim()).filter(Boolean),
    updatedAt: new Date(),
  }).where(eq(tasks.id, id));
  if (projectId) revalidatePath(`/plan/${projectId}`);
}

export async function deleteTask(id: string): Promise<void> {
  await requireUser();
  const [row] = await db.delete(tasks).where(eq(tasks.id, id)).returning({ p: tasks.projectId });
  if (row) revalidatePath(`/plan/${row.p}`);
}

export async function moveTask(id: string, status: Task["status"], order: number): Promise<void> {
  await requireUser();
  const [row] = await db.update(tasks).set({ status, order, updatedAt: new Date() })
    .where(eq(tasks.id, id)).returning({ p: tasks.projectId });
  if (row) revalidatePath(`/plan/${row.p}`);
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/plan/actions.ts
git commit -m "feat(plan): server actions for project + task mutations"
```

---

## Task 6: Master overview UI

**Files:**
- Modify: `src/app/plan/(app)/page.tsx` (replace the Task 3 placeholder with the real overview)
- Create: `src/components/plan/ProjectGrid.tsx`
- Create: `src/components/plan/ProjectCard.tsx`
- Create: `src/components/plan/ProjectForm.tsx`

**Interfaces:**
- Consumes: `listProjects` from `@/lib/plan/queries`; `createProject, updateProject, archiveProject` from `@/lib/plan/actions`; `ProjectWithProgress` + `PROJECT_TYPES` from `@/lib/plan/types`; `Project` from `@/lib/db/schema`.
- Produces: the rendered `/plan` overview. `ProjectForm` is reusable: `{ action, project? }` — when `project` is passed it prefills for editing.

(The gated layout already lives at `src/app/plan/(app)/layout.tsx` from Task 3; nothing to move.)

- [ ] **Step 1: Write `src/components/plan/ProjectCard.tsx`**

```tsx
import Link from "next/link";
import type { ProjectWithProgress } from "@/lib/plan/types";

export function ProjectCard({ p }: { p: ProjectWithProgress }) {
  return (
    <Link href={`/plan/${p.id}`}
      className="block rounded-lg border border-black/10 p-4 transition hover:shadow-md dark:border-white/10">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{p.name}</h3>
        <span className="rounded-full px-2 py-0.5 text-xs"
          style={{ background: `${p.color}22`, color: p.color }}>{p.type}</span>
      </div>
      {p.targetDate && <p className="mt-1 text-xs opacity-60">Target: {p.targetDate}</p>}
      <div className="mt-3 h-2 w-full rounded-full bg-black/10 dark:bg-white/10">
        <div className="h-2 rounded-full" style={{ width: `${p.progress}%`, background: p.color }} />
      </div>
      <p className="mt-1 text-xs opacity-60">{p.done}/{p.total} done · {p.progress}%</p>
    </Link>
  );
}
```

- [ ] **Step 2: Write `src/components/plan/ProjectForm.tsx`**

Reusable for both create and edit. Pass `project` to prefill (edit mode); `defaultOpen` to render expanded (used inline on the detail page); `label` overrides the collapsed button text.

```tsx
"use client";
import { useState } from "react";
import { PROJECT_TYPES } from "@/lib/plan/types";
import type { Project } from "@/lib/db/schema";

export function ProjectForm({
  action, project, defaultOpen = false, label = "+ New project",
}: {
  action: (fd: FormData) => Promise<void>;
  project?: Project;
  defaultOpen?: boolean;
  label?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="rounded-md border border-dashed border-black/20 p-4 text-sm dark:border-white/20">
      {label}
    </button>
  );
  return (
    <form action={async (fd) => { await action(fd); setOpen(false); }}
      className="flex flex-col gap-2 rounded-lg border border-black/10 p-4 dark:border-white/10">
      <input name="name" required defaultValue={project?.name ?? ""} placeholder="Project name" className="border-b bg-transparent py-1" />
      <select name="type" className="bg-transparent py-1" defaultValue={project?.type ?? "general"}>
        {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <input name="targetDate" type="date" defaultValue={project?.targetDate ?? ""} className="bg-transparent py-1" />
      <input name="color" type="color" defaultValue={project?.color ?? "#3B4FBF"} className="h-8 w-16" />
      <div className="flex gap-2">
        <button type="submit" className="rounded bg-[var(--feature-color)] px-3 py-1 text-sm text-white">Save</button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm underline">Cancel</button>
      </div>
    </form>
  );
}
```

- [ ] **Step 3: Write `src/components/plan/ProjectGrid.tsx`**

```tsx
import { ProjectCard } from "./ProjectCard";
import { ProjectForm } from "./ProjectForm";
import { createProject } from "@/lib/plan/actions";
import type { ProjectWithProgress } from "@/lib/plan/types";

export function ProjectGrid({ projects }: { projects: ProjectWithProgress[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => <ProjectCard key={p.id} p={p} />)}
      <ProjectForm action={createProject} />
    </div>
  );
}
```

- [ ] **Step 4: Replace the placeholder `src/app/plan/(app)/page.tsx` with the real overview**

```tsx
import { listProjects } from "@/lib/plan/queries";
import { ProjectGrid } from "@/components/plan/ProjectGrid";

export const dynamic = "force-dynamic";

export default async function PlanOverviewPage() {
  const projects = await listProjects();
  return (
    <section>
      <h1 className="mb-6 text-2xl font-semibold">Projects</h1>
      <ProjectGrid projects={projects} />
    </section>
  );
}
```

- [ ] **Step 5: Typecheck + lint + build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: PASS; `/plan` listed as a dynamic route.

- [ ] **Step 6: Verify (Playwright)**

`npm run dev`, sign in, at `/plan`: create a project → card appears with 0/0 done, 0%. Reload → persists.

- [ ] **Step 7: Commit**

```bash
git add src/app/plan src/components/plan/ProjectCard.tsx src/components/plan/ProjectForm.tsx src/components/plan/ProjectGrid.tsx
git commit -m "feat(plan): master overview with project cards + create form"
```

---

## Task 7: Project page — view tabs, status overview, Table view

**Files:**
- Create: `src/app/plan/(app)/[projectId]/page.tsx`
- Create: `src/components/plan/ViewTabs.tsx`
- Create: `src/components/plan/StatusOverview.tsx`
- Create: `src/components/plan/TaskForm.tsx`
- Create: `src/components/plan/TableView.tsx`
- Create: `src/components/plan/ProjectActions.tsx`
- Create: `src/components/plan/KanbanBoard.tsx` (stub; real in Task 8)
- Create: `src/components/plan/CalendarView.tsx` (stub; real in Task 9)

**Interfaces:**
- Consumes: `getProject, listTasks, statusCounts` from queries; `createTask, updateTask, deleteTask, updateProject, archiveProject` from actions; `STATUS_LABELS, TASK_STATUSES` from types; `ProjectForm` from `@/components/plan/ProjectForm` (created in Task 6).
- Produces: rendered `/plan/[projectId]` with a `?view=table|kanban|calendar` tab state.

- [ ] **Step 1: Write `src/components/plan/ViewTabs.tsx`**

```tsx
"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const VIEWS = ["table", "kanban", "calendar"] as const;
export function ViewTabs() {
  const router = useRouter(); const path = usePathname();
  const params = useSearchParams(); const active = params.get("view") ?? "table";
  return (
    <div className="mb-4 flex gap-1">
      {VIEWS.map((v) => (
        <button key={v} onClick={() => router.push(`${path}?view=${v}`)}
          className={`rounded-md px-3 py-1 text-sm capitalize ${active === v ? "bg-[var(--feature-color)] text-white" : "border border-black/10 dark:border-white/10"}`}>
          {v}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Write `src/components/plan/StatusOverview.tsx`**

```tsx
import { STATUS_LABELS } from "@/lib/plan/types";
import type { StatusCount } from "@/lib/plan/types";

export function StatusOverview({ counts }: { counts: StatusCount }) {
  const keys = Object.keys(STATUS_LABELS) as (keyof StatusCount)[];
  return (
    <div className="mb-4 flex gap-4">
      {keys.map((k) => (
        <div key={k} className="rounded-md border border-black/10 px-3 py-2 text-center dark:border-white/10">
          <div className="text-lg font-semibold">{counts[k]}</div>
          <div className="text-xs opacity-60">{STATUS_LABELS[k]}</div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Write `src/components/plan/TaskForm.tsx`**

```tsx
"use client";
import { useState } from "react";
import { TASK_STATUSES, STATUS_LABELS } from "@/lib/plan/types";
import type { Task } from "@/lib/db/schema";

export function TaskForm({
  projectId, task, action, label = "+ Add task", defaultOpen = false,
}: {
  projectId: string;
  task?: Task;
  action: (fd: FormData) => Promise<void>;
  label?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (!open) return <button onClick={() => setOpen(true)} className="text-sm underline">{label}</button>;
  return (
    <form action={async (fd) => { await action(fd); setOpen(false); }}
      className="flex flex-col gap-2 rounded-md border border-black/10 p-3 dark:border-white/10">
      <input type="hidden" name="projectId" value={projectId} />
      <input name="title" required defaultValue={task?.title ?? ""} placeholder="Title" className="border-b bg-transparent py-1" />
      <select name="status" defaultValue={task?.status ?? "backlog"} className="bg-transparent py-1">
        {TASK_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
      </select>
      <input name="dueDate" type="date" defaultValue={task?.dueDate ?? ""} className="bg-transparent py-1" />
      <input name="estimateHours" type="number" step="0.5" defaultValue={task?.estimateHours ?? ""} placeholder="Estimate (h)" className="bg-transparent py-1" />
      <input name="cost" type="number" step="0.01" defaultValue={task?.cost ?? ""} placeholder="Cost" className="bg-transparent py-1" />
      <input name="tags" defaultValue={(task?.tags ?? []).join(", ")} placeholder="tags, comma separated" className="bg-transparent py-1" />
      <div className="flex gap-2">
        <button type="submit" className="rounded bg-[var(--feature-color)] px-3 py-1 text-sm text-white">Save</button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm underline">Cancel</button>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Write `src/components/plan/TableView.tsx`**

```tsx
"use client";
import { useState } from "react";
import { STATUS_LABELS } from "@/lib/plan/types";
import { updateTask, deleteTask } from "@/lib/plan/actions";
import { TaskForm } from "./TaskForm";
import type { Task } from "@/lib/db/schema";

export function TableView({ projectId, tasks }: { projectId: string; tasks: Task[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  return (
    <table className="w-full text-sm">
      <thead><tr className="text-left opacity-60">
        <th className="py-2">Title</th><th>Status</th><th>Due</th><th>Est (h)</th><th>Cost</th><th></th>
      </tr></thead>
      <tbody>
        {tasks.map((t) => editing === t.id ? (
          <tr key={t.id}><td colSpan={6} className="py-2">
            <TaskForm projectId={projectId} task={t} defaultOpen action={async (fd) => { await updateTask(t.id, fd); setEditing(null); }} />
          </td></tr>
        ) : (
          <tr key={t.id} className="border-t border-black/5 dark:border-white/5">
            <td className="py-2">{t.title}</td>
            <td>{STATUS_LABELS[t.status]}</td>
            <td>{t.dueDate ?? "—"}</td>
            <td>{t.estimateHours ?? "—"}</td>
            <td>{t.cost ?? "—"}</td>
            <td className="text-right">
              <button onClick={() => setEditing(t.id)} className="mr-2 underline">edit</button>
              <button onClick={() => deleteTask(t.id)} className="text-red-500 underline">del</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 5: Write `src/app/plan/(app)/[projectId]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { getProject, listTasks, statusCounts } from "@/lib/plan/queries";
import { createTask } from "@/lib/plan/actions";
import { ViewTabs } from "@/components/plan/ViewTabs";
import { StatusOverview } from "@/components/plan/StatusOverview";
import { TableView } from "@/components/plan/TableView";
import { KanbanBoard } from "@/components/plan/KanbanBoard";
import { CalendarView } from "@/components/plan/CalendarView";
import { TaskForm } from "@/components/plan/TaskForm";
import { ProjectActions } from "@/components/plan/ProjectActions";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params, searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { projectId } = await params;
  const { view = "table" } = await searchParams;
  const project = await getProject(projectId);
  if (!project) notFound();
  const [tasks, counts] = await Promise.all([listTasks(projectId), statusCounts(projectId)]);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{project.name}</h1>
        <ProjectActions project={project} />
      </div>
      <StatusOverview counts={counts} />
      <ViewTabs />
      <div className="mb-4"><TaskForm projectId={projectId} action={createTask.bind(null, projectId)} /></div>
      {view === "kanban" ? <KanbanBoard projectId={projectId} tasks={tasks} />
        : view === "calendar" ? <CalendarView tasks={tasks} />
        : <TableView projectId={projectId} tasks={tasks} />}
    </section>
  );
}
```

> `KanbanBoard` and `CalendarView` are created in Tasks 8 and 9. To keep this task building independently, create minimal stub files for them first (a component that renders `null` or "coming soon"), then flesh them out in their tasks. Add the stubs in Step 6.

- [ ] **Step 6: Create stubs for Kanban + Calendar**

`src/components/plan/KanbanBoard.tsx`:
```tsx
import type { Task } from "@/lib/db/schema";
export function KanbanBoard({ projectId, tasks }: { projectId: string; tasks: Task[] }) {
  void projectId; void tasks;
  return <p className="opacity-60">Kanban coming soon.</p>;
}
```
`src/components/plan/CalendarView.tsx`:
```tsx
import type { Task } from "@/lib/db/schema";
export function CalendarView({ tasks }: { tasks: Task[] }) {
  void tasks;
  return <p className="opacity-60">Calendar coming soon.</p>;
}
```

- [ ] **Step 7: Write `src/components/plan/ProjectActions.tsx` (edit + archive project)**

Satisfies the spec's "edit / remove project". Reuses `ProjectForm` (prefilled) for edit; archive (soft-delete) redirects back to the overview.

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectForm } from "./ProjectForm";
import { updateProject, archiveProject } from "@/lib/plan/actions";
import type { Project } from "@/lib/db/schema";

export function ProjectActions({ project }: { project: Project }) {
  const [editing, setEditing] = useState(false);
  const router = useRouter();
  if (editing) return (
    <ProjectForm project={project} defaultOpen
      action={async (fd) => { await updateProject(project.id, fd); setEditing(false); }} />
  );
  return (
    <div className="flex gap-3 text-sm">
      <button onClick={() => setEditing(true)} className="underline">Edit</button>
      <button onClick={async () => {
        if (!confirm("Archive this project?")) return;
        await archiveProject(project.id);
        router.push("/plan");
      }} className="text-red-500 underline">Archive</button>
    </div>
  );
}
```

- [ ] **Step 8: Typecheck + lint + build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: PASS.

- [ ] **Step 9: Verify (Playwright)**

Sign in → open a project → add a task (appears in Table) → edit it → delete it. Edit the project (rename) → header updates. Archive the project → redirected to `/plan`, card gone. Switch tabs → Kanban/Calendar show stub text. Status overview counts update after adds.

- [ ] **Step 10: Commit**

```bash
git add src/app/plan/\(app\)/\[projectId\] src/components/plan/ViewTabs.tsx src/components/plan/StatusOverview.tsx src/components/plan/TaskForm.tsx src/components/plan/TableView.tsx src/components/plan/ProjectActions.tsx src/components/plan/KanbanBoard.tsx src/components/plan/CalendarView.tsx
git commit -m "feat(plan): project page with tabs, status overview, table view, project edit/archive + task CRUD"
```

---

## Task 8: Kanban board (dnd-kit)

**Files:**
- Modify: `src/components/plan/KanbanBoard.tsx` (replace stub)
- Create: `src/components/plan/KanbanCard.tsx`

**Interfaces:**
- Consumes: `moveTask` from actions; `TASK_STATUSES, STATUS_LABELS` from types; `@dnd-kit/core`, `@dnd-kit/sortable`.
- Produces: drag-and-drop board; dropping a card calls `moveTask(id, status, order)`.

- [ ] **Step 1: Write `src/components/plan/KanbanCard.tsx`**

```tsx
"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/lib/db/schema";

export function KanbanCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="cursor-grab rounded-md border border-black/10 bg-[var(--background)] p-2 text-sm dark:border-white/10">
      {task.title}
      {task.dueDate && <div className="mt-1 text-xs opacity-60">{task.dueDate}</div>}
    </div>
  );
}
```

> `@dnd-kit/utilities` ships with `@dnd-kit/sortable`; if the import fails, `npm install @dnd-kit/utilities`.

- [ ] **Step 2: Write `src/components/plan/KanbanBoard.tsx`**

```tsx
"use client";
import { useState } from "react";
import { DndContext, closestCorners, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TASK_STATUSES, STATUS_LABELS } from "@/lib/plan/types";
import { moveTask } from "@/lib/plan/actions";
import { KanbanCard } from "./KanbanCard";
import type { Task } from "@/lib/db/schema";

export function KanbanBoard({ projectId, tasks }: { projectId: string; tasks: Task[] }) {
  void projectId;
  const [items, setItems] = useState(tasks);
  const byStatus = (s: Task["status"]) => items.filter((t) => t.status === s);

  function onDragEnd(e: DragEndEvent) {
    const id = String(e.active.id);
    const over = e.over?.id ? String(e.over.id) : null;
    if (!over) return;
    // `over` is either a column id ("col:status") or another card id.
    const target = over.startsWith("col:")
      ? (over.slice(4) as Task["status"])
      : items.find((t) => t.id === over)?.status;
    if (!target) return;
    const order = byStatus(target).length;
    setItems((prev) => prev.map((t) => (t.id === id ? { ...t, status: target, order } : t)));
    void moveTask(id, target, order);
  }

  return (
    <DndContext collisionDetection={closestCorners} onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        {TASK_STATUSES.map((s) => (
          <div key={s} id={`col:${s}`} className="rounded-lg bg-black/5 p-2 dark:bg-white/5">
            <h3 className="mb-2 text-xs font-semibold uppercase opacity-60">{STATUS_LABELS[s]}</h3>
            <SortableContext items={byStatus(s).map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {byStatus(s).map((t) => <KanbanCard key={t.id} task={t} />)}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>
    </DndContext>
  );
}
```

> Column drop targets: a `SortableContext` per column makes cards sortable, but dropping onto an empty column needs the column to be a droppable. If empty-column drops don't register, wrap each column body in `useDroppable({ id: 'col:'+s })` from `@dnd-kit/core` and spread its `setNodeRef`. Add this only if verification shows empty columns reject drops.

- [ ] **Step 3: Typecheck + lint + build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: PASS.

- [ ] **Step 4: Verify (Playwright + manual)**

Sign in → project → Kanban tab. Cards appear in their status columns. Drag a card to another column → it moves; reload → the new status persisted (DB updated via `moveTask`). Playwright drag is finicky; if needed, verify the move by asserting the card re-renders in the new column and that a reload (RSC refetch) keeps it there.

- [ ] **Step 5: Commit**

```bash
git add src/components/plan/KanbanBoard.tsx src/components/plan/KanbanCard.tsx
git commit -m "feat(plan): kanban board with dnd-kit drag-to-status"
```

---

## Task 9: Calendar view

**Files:**
- Modify: `src/components/plan/CalendarView.tsx` (replace stub)

**Interfaces:**
- Consumes: `Task` from `@/lib/db/schema`.
- Produces: a hand-rolled month grid with tasks rendered on their `dueDate`; prev/next month navigation (client state).

- [ ] **Step 1: Write `src/components/plan/CalendarView.tsx`**

```tsx
"use client";
import { useState } from "react";
import type { Task } from "@/lib/db/schema";

function monthMatrix(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const start = first.getDay(); // 0=Sun
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < start; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarView({ tasks }: { tasks: Task[] }) {
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const cells = monthMatrix(ym.y, ym.m);
  const byDay = new Map<string, Task[]>();
  for (const t of tasks) if (t.dueDate) {
    const k = t.dueDate.slice(0, 10);
    byDay.set(k, [...(byDay.get(k) ?? []), t]);
  }
  const shift = (delta: number) => setYm(({ y, m }) => {
    const d = new Date(y, m + delta, 1); return { y: d.getFullYear(), m: d.getMonth() };
  });

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => shift(-1)} className="text-sm underline">← Prev</button>
        <span className="font-medium">{new Date(ym.y, ym.m).toLocaleString("en", { month: "long", year: "numeric" })}</span>
        <button onClick={() => shift(1)} className="text-sm underline">Next →</button>
      </div>
      <div className="grid grid-cols-7 gap-px text-xs">
        {WD.map((d) => <div key={d} className="p-1 text-center opacity-60">{d}</div>)}
        {cells.map((c, i) => (
          <div key={i} className="min-h-20 border border-black/5 p-1 dark:border-white/5">
            {c && <>
              <div className="opacity-50">{c.getDate()}</div>
              {(byDay.get(iso(c)) ?? []).map((t) => (
                <div key={t.id} className="mt-0.5 truncate rounded bg-[var(--feature-color)]/15 px-1 text-[10px]">{t.title}</div>
              ))}
            </>}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + lint + build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: PASS.

- [ ] **Step 3: Verify (Playwright)**

Project → Calendar tab. The current month renders. A task with a `dueDate` in this month shows on the correct day. Prev/Next navigation changes the month.

- [ ] **Step 4: Final full verification**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Manually walk the whole flow: sign out → sign in → create project → open → add tasks → Table edit/delete → Kanban drag → Calendar view → sign out.

- [ ] **Step 5: Commit**

```bash
git add src/components/plan/CalendarView.tsx
git commit -m "feat(plan): hand-rolled month calendar view"
```

---

## Post-MVP (Phase 2 — separate spec/plan, NOT in this plan)

- `task_snapshots` table + burndown SVG chart.
- Team-load dashboard (effort grouped by assignee across projects).
- Optional roles (owner/editor/viewer); DB-backed allowlist UI.

## Verification Summary

Every task ends green on: `npx tsc --noEmit`, `npm run lint`, `npm run build`.
UI tasks add a Playwright walkthrough. No unit-test runner is introduced (matches
repo convention and the approved spec).
