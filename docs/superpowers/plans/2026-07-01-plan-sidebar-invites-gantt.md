# /plan Sidebar Nav + Admin Invites + Gantt View + UX Polish — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship /plan v0.2.0: left sidebar navigation, DB-backed admin email invites, a per-project Gantt view, and a UX polish bundle (avatars, empty states, tab icons, project accent).

**Architecture:** All work stays inside the existing /plan slice: schema + auth changes for invites (`schema.ts`, `auth.ts`), server actions/queries following the existing `requireAdmin()` pattern, one new pure-math module (`gantt.ts`) mirroring `burndown.ts`, and client components in `src/components/plan/`. Spec: `docs/superpowers/specs/2026-07-01-plan-sidebar-invites-gantt-design.md`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4, Auth.js v5 (`next-auth@beta`), Drizzle + Neon, Resend REST API.

## Global Constraints

- **No test runner exists.** The verification cycle per task is: `npx tsc --noEmit` && `npm run lint`, plus `npm run build` where marked. All three must pass before the release task, **including** `env -u DATABASE_URL npm run build` (the `src/lib/db/index.ts` placeholder guard must keep working — do not touch that file).
- **Never create `middleware.ts`** (conflicts with `proxy.ts`).
- **No new npm dependencies.** Resend is called via plain `fetch`; charts are hand-rolled.
- **Every user-facing string** goes into `src/lib/plan/i18n.ts` with **both** `en` and `th` values. Server components call `pt(lang, key)`; client components use `usePlanT()`.
- **Design tokens only** (`--surface`, `--surface-2`, `--border`, `--border-soft`, `--background`, `--foreground`, `--muted`, `--muted-soft`, `--feature-color`, `--feature-contrast`). No hard-coded colors except project/status colors that already exist as data.
- **RSC constraint:** no inline event handlers in server components; interactivity lives in `"use client"` components.
- All mutations gated server-side: invites use `requireAdmin()`.
- Work on branch `feat/plan-sidebar-invites-gantt` off `main`. Commit after every task.
- Working directory: `/project/src/nanoteofficial.me`.

---

### Task 1: Invite table in schema

**Files:**
- Modify: `src/lib/db/schema.ts` (append after the `tasks` table, before the type exports)

**Interfaces:**
- Produces: `invites` pgTable (`invite`), `export type Invite` — columns `id: string`, `email: string`, `role: "admin"|"editor"|"viewer"`, `invitedBy: string`, `createdAt: Date`, `acceptedAt: Date | null`. Tasks 2–4 import `invites` / `Invite`.

- [ ] **Step 1: Create the branch**

```bash
cd /project/src/nanoteofficial.me
git checkout -b feat/plan-sidebar-invites-gantt main
```

- [ ] **Step 2: Add the table**

In `src/lib/db/schema.ts`, after the `tasks` table definition and before the `export type Project` line, add:

```ts
export const invites = pgTable("invite", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  role: userRole("role").notNull().default("viewer"),
  invitedBy: text("invited_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
});
```

And with the other type exports at the bottom:

```ts
export type Invite = typeof invites.$inferSelect;
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: both pass with no output/errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/db/schema.ts
git commit -m "feat(plan): invite table schema"
```

---

### Task 2: Auth gate accepts DB invites

**Files:**
- Modify: `src/auth.ts` (whole file shown below)

**Interfaces:**
- Consumes: `invites` from Task 1.
- Produces: sign-in allowed for `ALLOWED_EMAILS` **or** any email with an `invite` row; on user creation, an unaccepted invite's role is applied and `acceptedAt` stamped (Auth.js `events.createUser` — the user row does not exist yet during the `signIn` callback for first-time users, so role application must happen in the event, not the callback).

- [ ] **Step 1: Replace `src/auth.ts` with:**

```ts
import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, accounts, sessions, verificationTokens, invites } from "@/lib/db/schema";

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
      if (!email) return false;
      if (!allowed.includes(email)) {
        const [inv] = await db.select({ id: invites.id }).from(invites)
          .where(eq(invites.email, email)).limit(1);
        if (!inv) return false;
      }
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
  events: {
    // Fires after the adapter creates a first-time user — the signIn callback
    // runs before the row exists, so the invite role must be applied here.
    async createUser({ user }) {
      const email = user.email?.toLowerCase();
      if (!email || !user.id) return;
      const [inv] = await db.select().from(invites)
        .where(eq(invites.email, email)).limit(1);
      if (!inv || inv.acceptedAt) return;
      await db.update(users).set({ role: inv.role }).where(eq(users.id, user.id));
      await db.update(invites).set({ acceptedAt: new Date() }).where(eq(invites.id, inv.id));
    },
  },
});
```

Note: this is the existing file plus (a) the invite fallback in `signIn` (env allow-list still checked first — bootstrap emails never hit the DB), and (b) the new `events.createUser` block. `PLAN_ADMIN_EMAILS` self-heal is unchanged.

- [ ] **Step 2: Verify (including no-DB build)**

Run: `npx tsc --noEmit && npm run lint && env -u DATABASE_URL npm run build`
Expected: all pass. The build must not attempt a DB connection at module load (it won't — the queries are inside callbacks).

- [ ] **Step 3: Commit**

```bash
git add src/auth.ts
git commit -m "feat(plan): accept DB invites at sign-in, apply invited role on first sign-in"
```

---

### Task 3: Invite email helper, query, and server actions

**Files:**
- Create: `src/lib/plan/invite-email.ts`
- Modify: `src/lib/plan/queries.ts` (append)
- Modify: `src/lib/plan/actions.ts` (imports + append)

**Interfaces:**
- Consumes: `invites`, `Invite` (Task 1); existing `requireAdmin`, `str` helpers in `actions.ts`.
- Produces (used by Task 4):
  - `sendInviteEmail(to: string, invitedBy: string): Promise<boolean>`
  - `listPendingInvites(): Promise<Invite[]>`
  - `type InviteResult = { ok: true; emailSent: boolean } | { ok: false; reason: "invalid" | "exists" }`
  - `createInvite(fd: FormData): Promise<InviteResult>` (fields: `email`, `role`)
  - `resendInvite(id: string): Promise<{ emailSent: boolean }>`
  - `revokeInvite(id: string): Promise<void>`

Expected failures return a typed result instead of throwing, because Next.js redacts server-action `Error` messages in production — the client cannot branch on `error.message`.

- [ ] **Step 1: Create `src/lib/plan/invite-email.ts`:**

```ts
import "server-only";

const SIGNIN_URL = "https://nanoteofficial.me/plan/signin";
const FROM = "NaNote Plan <noreply@nanoteofficial.me>";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

/** Bilingual invite email. Contains no token or secret — it points at the
 *  normal magic-link sign-in page. Returns false on any failure. */
export async function sendInviteEmail(to: string, invitedBy: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const btn = `display:inline-block;background:#3B4FBF;color:#ffffff;padding:10px 18px;border-radius:8px;text-decoration:none`;
  const html = `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
  <h2 style="margin:0 0 8px">You&rsquo;re invited to Plan</h2>
  <p style="color:#555">${esc(invitedBy)} invited you to the Plan workspace on nanoteofficial.me. Sign in with this email address to get started.</p>
  <p><a href="${SIGNIN_URL}" style="${btn}">Sign in</a></p>
  <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
  <h2 style="margin:0 0 8px">คุณได้รับเชิญเข้าร่วม Plan</h2>
  <p style="color:#555">${esc(invitedBy)} เชิญคุณเข้าร่วมพื้นที่ทำงาน Plan บน nanoteofficial.me ลงชื่อเข้าใช้ด้วยอีเมลนี้เพื่อเริ่มต้น</p>
  <p><a href="${SIGNIN_URL}" style="${btn}">เข้าสู่ระบบ</a></p>
</div>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        subject: "You're invited to Plan · คุณได้รับเชิญเข้าร่วม Plan",
        html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
```

- [ ] **Step 2: Append to `src/lib/plan/queries.ts`:**

Add `isNull` to the drizzle-orm import, add `invites` to the schema import, add `Invite` to the schema type import, then append:

```ts
/** Pending (unaccepted) invites — page is admin-gated. */
export async function listPendingInvites(): Promise<Invite[]> {
  return db.select().from(invites)
    .where(isNull(invites.acceptedAt))
    .orderBy(asc(invites.createdAt));
}
```

- [ ] **Step 3: Append to `src/lib/plan/actions.ts`:**

Extend the imports: add `and`, `isNull` to the drizzle-orm import; add `invites` to the schema import; add `import { USER_ROLES } from "@/lib/plan/types";` and `import { sendInviteEmail } from "@/lib/plan/invite-email";`. Then append:

```ts
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type InviteResult =
  | { ok: true; emailSent: boolean }
  | { ok: false; reason: "invalid" | "exists" };

export async function createInvite(fd: FormData): Promise<InviteResult> {
  const admin = await requireAdmin();
  const email = str(fd, "email")?.toLowerCase() ?? null;
  const role = (str(fd, "role") ?? "viewer") as UserRole;
  if (!email || !EMAIL_RE.test(email) || !USER_ROLES.includes(role)) {
    return { ok: false, reason: "invalid" };
  }
  const [existingUser] = await db.select({ id: users.id }).from(users)
    .where(eq(users.email, email)).limit(1);
  const [existingInvite] = await db.select({ id: invites.id }).from(invites)
    .where(eq(invites.email, email)).limit(1);
  if (existingUser || existingInvite) return { ok: false, reason: "exists" };
  await db.insert(invites).values({ email, role, invitedBy: admin.email ?? "admin" });
  const emailSent = await sendInviteEmail(email, admin.email ?? "an admin");
  revalidatePath("/plan/admin");
  return { ok: true, emailSent };
}

export async function resendInvite(id: string): Promise<{ emailSent: boolean }> {
  const admin = await requireAdmin();
  const [inv] = await db.select().from(invites).where(eq(invites.id, id)).limit(1);
  if (!inv || inv.acceptedAt) throw new Error("Not found");
  return { emailSent: await sendInviteEmail(inv.email, admin.email ?? "an admin") };
}

export async function revokeInvite(id: string): Promise<void> {
  await requireAdmin();
  await db.delete(invites).where(and(eq(invites.id, id), isNull(invites.acceptedAt)));
  revalidatePath("/plan/admin");
}
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/plan/invite-email.ts src/lib/plan/queries.ts src/lib/plan/actions.ts
git commit -m "feat(plan): invite server actions + Resend invite email"
```

---

### Task 4: Admin invite UI + i18n

**Files:**
- Create: `src/components/plan/InviteForm.tsx`
- Create: `src/components/plan/InviteRowActions.tsx`
- Modify: `src/app/plan/(app)/admin/page.tsx`
- Modify: `src/lib/plan/i18n.ts` (new keys)

**Interfaces:**
- Consumes: `createInvite`/`resendInvite`/`revokeInvite`/`InviteResult` (Task 3), `listPendingInvites` (Task 3), `useToast`, `usePlanT`, `roleKey`, `USER_ROLES`, `btnPrimary`/`btnGhost`/`btnDanger`/`inputCls`.
- Produces: `<InviteForm />` (no props), `<InviteRowActions inviteId={string} />`.

- [ ] **Step 1: Add i18n keys to `src/lib/plan/i18n.ts`** (inside `dict`, after the `admin.*` block):

```ts
  "admin.invites": { en: "Invite coworkers", th: "เชิญเพื่อนร่วมงาน" },
  "admin.invitesDesc": {
    en: "Invited emails can sign in with a magic link. Revoke an invite to withdraw access before first sign-in.",
    th: "อีเมลที่ได้รับเชิญสามารถเข้าสู่ระบบด้วยลิงก์วิเศษ เพิกถอนคำเชิญเพื่อยกเลิกสิทธิ์ก่อนการเข้าสู่ระบบครั้งแรก",
  },
  "admin.invitedOn": { en: "Invited", th: "เชิญเมื่อ" },
  "admin.noInvites": { en: "No pending invites.", th: "ไม่มีคำเชิญที่รอดำเนินการ" },
  "invite.emailPh": { en: "coworker@example.com", th: "coworker@example.com" },
  "invite.send": { en: "Send invite", th: "ส่งคำเชิญ" },
  "invite.sending": { en: "Sending…", th: "กำลังส่ง…" },
  "invite.resend": { en: "Resend", th: "ส่งอีกครั้ง" },
  "invite.revoke": { en: "Revoke", th: "เพิกถอน" },
  "toast.inviteSent": { en: "Invite sent", th: "ส่งคำเชิญแล้ว" },
  "toast.inviteNoEmail": {
    en: "Invite saved, but the email couldn’t be sent — use Resend.",
    th: "บันทึกคำเชิญแล้ว แต่ส่งอีเมลไม่สำเร็จ — กด“ส่งอีกครั้ง”",
  },
  "toast.inviteExists": { en: "That email is already a user or invited", th: "อีเมลนี้เป็นผู้ใช้อยู่แล้วหรือได้รับเชิญแล้ว" },
  "toast.inviteInvalid": { en: "Enter a valid email address", th: "กรอกอีเมลให้ถูกต้อง" },
  "toast.inviteResent": { en: "Invite re-sent", th: "ส่งคำเชิญอีกครั้งแล้ว" },
  "toast.inviteRevoked": { en: "Invite revoked", th: "เพิกถอนคำเชิญแล้ว" },
  "toast.inviteErr": { en: "Couldn’t update invite", th: "อัปเดตคำเชิญไม่สำเร็จ" },
```

- [ ] **Step 2: Create `src/components/plan/InviteForm.tsx`:**

```tsx
"use client";
import { useRef, useTransition } from "react";
import { createInvite } from "@/lib/plan/actions";
import { USER_ROLES } from "@/lib/plan/types";
import { useToast } from "./Toaster";
import { usePlanT } from "./LangContext";
import { roleKey } from "@/lib/plan/i18n";
import { btnPrimary, inputCls } from "./ui";

export function InviteForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const { t } = usePlanT();

  const onSubmit = (fd: FormData) => {
    startTransition(async () => {
      try {
        const res = await createInvite(fd);
        if (!res.ok) {
          toast(t(res.reason === "exists" ? "toast.inviteExists" : "toast.inviteInvalid"), { tone: "error" });
          return;
        }
        toast(t(res.emailSent ? "toast.inviteSent" : "toast.inviteNoEmail"), {
          tone: res.emailSent ? "success" : "info",
        });
        formRef.current?.reset();
      } catch {
        toast(t("toast.inviteErr"), { tone: "error" });
      }
    });
  };

  return (
    <form ref={formRef} action={onSubmit} className="flex flex-wrap items-center gap-2">
      <input name="email" type="email" required placeholder={t("invite.emailPh")}
        className={`${inputCls} max-w-xs`} />
      <select name="role" defaultValue="viewer" className={`${inputCls} max-w-[10rem]`}>
        {USER_ROLES.map((r) => <option key={r} value={r}>{t(roleKey(r))}</option>)}
      </select>
      <button type="submit" disabled={pending} className={btnPrimary}>
        {pending ? t("invite.sending") : t("invite.send")}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Create `src/components/plan/InviteRowActions.tsx`:**

```tsx
"use client";
import { useTransition } from "react";
import { resendInvite, revokeInvite } from "@/lib/plan/actions";
import { useToast } from "./Toaster";
import { usePlanT } from "./LangContext";
import { btnDanger, btnGhost } from "./ui";

export function InviteRowActions({ inviteId }: { inviteId: string }) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const { t } = usePlanT();

  const resend = () => startTransition(async () => {
    try {
      const r = await resendInvite(inviteId);
      toast(t(r.emailSent ? "toast.inviteResent" : "toast.inviteNoEmail"), {
        tone: r.emailSent ? "success" : "info",
      });
    } catch { toast(t("toast.inviteErr"), { tone: "error" }); }
  });

  const revoke = () => startTransition(async () => {
    try {
      await revokeInvite(inviteId);
      toast(t("toast.inviteRevoked"), { tone: "success" });
    } catch { toast(t("toast.inviteErr"), { tone: "error" }); }
  });

  return (
    <div className="flex items-center gap-1">
      <button onClick={resend} disabled={pending} className={btnGhost}>{t("invite.resend")}</button>
      <button onClick={revoke} disabled={pending} className={btnDanger}>{t("invite.revoke")}</button>
    </div>
  );
}
```

- [ ] **Step 4: Replace `src/app/plan/(app)/admin/page.tsx` with:**

```tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getLang } from "@/lib/i18n";
import { pt, roleKey } from "@/lib/plan/i18n";
import { listPendingInvites, listUsersForAdmin } from "@/lib/plan/queries";
import { userLabel } from "@/lib/plan/types";
import { RoleSelect } from "@/components/plan/RoleSelect";
import { InviteForm } from "@/components/plan/InviteForm";
import { InviteRowActions } from "@/components/plan/InviteRowActions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (session?.user.role !== "admin") redirect("/plan");
  const [users, invites, lang] = await Promise.all([
    listUsersForAdmin(), listPendingInvites(), getLang(),
  ]);
  const currentEmail = session.user.email;
  const th = "px-4 py-2.5 font-medium";

  return (
    <section className="space-y-10">
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">{pt(lang, "admin.title")}</h1>
        <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <table className="w-full min-w-[28rem] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-soft)]">
                <th className={th}>{pt(lang, "admin.user")}</th>
                <th className={th}>{pt(lang, "admin.role")}</th>
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
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{pt(lang, "admin.invites")}</h2>
          <p className="mt-1 text-sm text-[var(--muted-soft)]">{pt(lang, "admin.invitesDesc")}</p>
        </div>
        <InviteForm />
        {invites.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--muted-soft)]">
            {pt(lang, "admin.noInvites")}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
            <table className="w-full min-w-[32rem] text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-soft)]">
                  <th className={th}>{pt(lang, "admin.user")}</th>
                  <th className={th}>{pt(lang, "admin.role")}</th>
                  <th className={th}>{pt(lang, "admin.invitedOn")}</th>
                  <th className={th} />
                </tr>
              </thead>
              <tbody>
                {invites.map((inv) => (
                  <tr key={inv.id} className="border-t border-[var(--border-soft)]">
                    <td className="px-4 py-2.5">{inv.email}</td>
                    <td className="px-4 py-2.5 text-[var(--muted)]">{pt(lang, roleKey(inv.role))}</td>
                    <td className="px-4 py-2.5 text-[var(--muted)]">
                      {inv.createdAt.toISOString().slice(0, 10)}
                    </td>
                    <td className="px-4 py-2.5"><InviteRowActions inviteId={inv.id} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: pass.

- [ ] **Step 6: Manual check** — with `npm run dev` and a signed-in admin, visit `/plan/admin`: invite form renders; submitting an invalid email shows the error toast; inviting a fresh email adds a pending row (email may fail locally without `RESEND_API_KEY` — expect the "use Resend" info toast); Revoke removes the row.

- [ ] **Step 7: Commit**

```bash
git add src/components/plan/InviteForm.tsx src/components/plan/InviteRowActions.tsx "src/app/plan/(app)/admin/page.tsx" src/lib/plan/i18n.ts
git commit -m "feat(plan): admin invite form + pending invites table"
```

---

### Task 5: Left sidebar navigation

**Files:**
- Create: `src/components/plan/PlanSidebar.tsx`
- Modify: `src/app/plan/(app)/layout.tsx` (whole file shown)
- Modify: `src/lib/plan/i18n.ts` (one key)

**Interfaces:**
- Consumes: `usePlanT`, existing `LangToggle`, `signOut` server action, `listProjects()` result already loaded in the layout.
- Produces: `<PlanSidebar projects={{id,name,color}[]} isAdmin={boolean} email={string} langToggle={ReactNode} signOut={ReactNode} />`. The sidebar renders BOTH the mobile top bar and the aside — the layout must place it as the first child of a `lg:flex` container.

- [ ] **Step 1: Add i18n key** to `src/lib/plan/i18n.ts` next to the other `nav.*` keys:

```ts
  "nav.menu": { en: "Menu", th: "เมนู" },
```

- [ ] **Step 2: Create `src/components/plan/PlanSidebar.tsx`:**

```tsx
"use client";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePlanT } from "./LangContext";

type SidebarProject = { id: string; name: string; color: string };

export function PlanSidebar({ projects, isAdmin, email, langToggle, signOut }: {
  projects: SidebarProject[];
  isAdmin: boolean;
  email: string;
  langToggle: ReactNode;
  signOut: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const { t } = usePlanT();

  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const item = (active: boolean) =>
    `flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition ${
      active
        ? "bg-[color-mix(in_srgb,var(--feature-color)_12%,transparent)] font-medium text-[var(--foreground)]"
        : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
    }`;

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_80%,transparent)] px-4 backdrop-blur lg:hidden">
        <button aria-label={t("nav.menu")} onClick={() => setOpen(true)}
          className="rounded-md p-1.5 text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            className="h-5 w-5" aria-hidden><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
        <Link href="/plan" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="h-2 w-2 rounded-full" style={{ background: "var(--feature-color)" }} /> Plan
        </Link>
      </div>

      {/* Backdrop (mobile drawer) */}
      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} aria-hidden />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-[var(--border)] bg-[var(--surface)] transition-transform lg:sticky lg:top-0 lg:z-auto lg:h-dvh lg:shrink-0 lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex h-full flex-col gap-4 p-4">
          <Link href="/plan" className="flex items-center gap-2 px-1 font-semibold tracking-tight">
            <span className="h-2 w-2 rounded-full" style={{ background: "var(--feature-color)" }} /> Plan
          </Link>
          <nav className="space-y-0.5">
            <Link href="/plan" className={item(path === "/plan")}>{t("nav.projects")}</Link>
            {isAdmin && <Link href="/plan/admin" className={item(path === "/plan/admin")}>{t("nav.admin")}</Link>}
          </nav>
          {projects.length > 0 && (
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="space-y-0.5">
                {projects.map((p) => (
                  <Link key={p.id} href={`/plan/${p.id}`} className={item(path.startsWith(`/plan/${p.id}`))}>
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: p.color }} />
                    <span className="truncate">{p.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div className="mt-auto space-y-3 border-t border-[var(--border)] pt-3">
            <span className="hidden items-center gap-1 rounded-md border border-[var(--border)] px-2 py-1 text-[11px] text-[var(--muted-soft)] lg:inline-flex">
              <kbd className="font-sans">⌘</kbd><kbd className="font-sans">K</kbd>
            </span>
            <div className="flex items-center justify-between gap-2">
              {langToggle}
              {signOut}
            </div>
            <div className="truncate text-xs text-[var(--muted-soft)]" title={email}>{email}</div>
          </div>
        </div>
      </aside>
    </>
  );
}
```

- [ ] **Step 3: Replace `src/app/plan/(app)/layout.tsx` with:**

```tsx
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { getLang } from "@/lib/i18n";
import { pt } from "@/lib/plan/i18n";
import { listProjects } from "@/lib/plan/queries";
import { btnGhost } from "@/components/plan/ui";
import { Toaster } from "@/components/plan/Toaster";
import { CommandPalette } from "@/components/plan/CommandPalette";
import { LangProvider } from "@/components/plan/LangContext";
import { LangToggle } from "@/components/LangToggle";
import { PlanSidebar } from "@/components/plan/PlanSidebar";

export default async function PlanLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/plan/signin");
  const [projects, lang] = await Promise.all([listProjects(), getLang()]);

  return (
    <LangProvider lang={lang}>
      <Toaster>
        <div className="min-h-dvh bg-[var(--background)] text-[var(--foreground)] lg:flex">
          <PlanSidebar
            projects={projects.map((p) => ({ id: p.id, name: p.name, color: p.color }))}
            isAdmin={session.user.role === "admin"}
            email={session.user.email ?? ""}
            langToggle={<LangToggle current={lang} />}
            signOut={
              <form action={async () => { "use server"; await signOut({ redirectTo: "/plan/signin" }); }}>
                <button className={btnGhost} type="submit">{pt(lang, "action.signOut")}</button>
              </form>
            }
          />
          <div className="min-w-0 flex-1">
            <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
          </div>
        </div>
        <CommandPalette projects={projects.map((p) => ({ id: p.id, name: p.name, type: p.type }))} />
      </Toaster>
    </LangProvider>
  );
}
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: pass.

- [ ] **Step 5: Manual check** — `npm run dev`: at ≥1024px the sidebar is static with active highlight following navigation; below 1024px the top bar shows, hamburger opens the drawer, backdrop/Esc/navigation close it; sign-out and lang toggle work from the sidebar footer.

- [ ] **Step 6: Commit**

```bash
git add src/components/plan/PlanSidebar.tsx "src/app/plan/(app)/layout.tsx" src/lib/plan/i18n.ts
git commit -m "feat(plan): left sidebar navigation with mobile drawer"
```

---

### Task 6: Avatar primitive + table/kanban integration

**Files:**
- Modify: `src/components/plan/ui.tsx` (export `STATUS_DOT`, add `Avatar`)
- Modify: `src/components/plan/TableView.tsx` (assignee cell)
- Modify: `src/components/plan/KanbanCard.tsx` (card meta row)

**Interfaces:**
- Produces: `Avatar({ name: string | null, email: string | null, size?: "sm" | "md" })` and `STATUS_DOT` becomes exported (Task 8 uses both). `CardVisual` and `KanbanCard` gain an optional `assignee?: { name: string | null; email: string | null } | null` prop — optional, so callers that don't pass it render unchanged. `KanbanBoard.tsx` already receives `users` as a prop (see `[projectId]/page.tsx`), so add the lookup there and pass `assignee` down to each `KanbanCard`.

- [ ] **Step 1: In `src/components/plan/ui.tsx`**, change `const STATUS_DOT` to `export const STATUS_DOT`, and append:

```tsx
const AVATAR_HUES = [210, 260, 330, 20, 150, 45, 190, 285];
function hashHue(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_HUES[Math.abs(h) % AVATAR_HUES.length];
}

/** Deterministic initials avatar — same email always gets the same hue.
 *  Fixed oklch pastel bg + dark text stays legible in both themes. */
export function Avatar({ name, email, size = "md" }: {
  name: string | null; email: string | null; size?: "sm" | "md";
}) {
  const label = name?.trim() || email?.trim() || "?";
  const initials = label.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const hue = hashHue(email?.trim() || label);
  const cls = size === "sm" ? "h-5 w-5 text-[9px]" : "h-6 w-6 text-[10px]";
  return (
    <span title={label}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${cls}`}
      style={{ background: `oklch(0.85 0.08 ${hue})`, color: `oklch(0.35 0.1 ${hue})` }}>
      {initials}
    </span>
  );
}
```

- [ ] **Step 2: In `src/components/plan/TableView.tsx`**, import `Avatar` from `./ui` and replace the assignee `<td>` (currently `<td className="px-4 py-2.5 text-[var(--muted)]">{nameOf(task.assigneeId)}</td>`) with:

```tsx
<td className="px-4 py-2.5 text-[var(--muted)]">
  {task.assigneeId ? (
    <span className="inline-flex items-center gap-2">
      <Avatar size="sm"
        name={users.find((u) => u.id === task.assigneeId)?.name ?? null}
        email={users.find((u) => u.id === task.assigneeId)?.email ?? null} />
      {nameOf(task.assigneeId)}
    </span>
  ) : "—"}
</td>
```

- [ ] **Step 3: In `src/components/plan/KanbanCard.tsx`**, import `Avatar` from `./ui`, extend both components with an optional assignee:

```tsx
export function CardVisual({ task, assignee, dragging }: {
  task: Task;
  assignee?: { name: string | null; email: string | null } | null;
  dragging?: boolean;
}) {
```

and inside the meta row (the `mt-2 flex flex-wrap` div), render as the first child — also extend its visibility condition with `|| assignee`:

```tsx
{assignee && <Avatar size="sm" name={assignee.name} email={assignee.email} />}
```

Then thread it through `KanbanCard`:

```tsx
export function KanbanCard({ task, assignee, onOpen }: {
  task: Task;
  assignee?: { name: string | null; email: string | null } | null;
  onOpen?: () => void;
}) {
```

passing `<CardVisual task={task} assignee={assignee} />`. In `src/components/plan/KanbanBoard.tsx`, find where `<KanbanCard` is rendered and pass `assignee={users.find((u) => u.id === task.assigneeId) ?? null}` (adjust the variable names to that file's actual map callback — read it before editing). If `KanbanBoard` also renders `CardVisual` for the drag overlay, passing `assignee` there is optional.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: pass. Manual: table + kanban show initials chips for assigned tasks in both themes.

- [ ] **Step 5: Commit**

```bash
git add src/components/plan/ui.tsx src/components/plan/TableView.tsx src/components/plan/KanbanCard.tsx src/components/plan/KanbanBoard.tsx
git commit -m "feat(plan): color-hashed assignee avatar chips in table and kanban"
```

---

### Task 7: Gantt window math (`gantt.ts`)

**Files:**
- Create: `src/lib/plan/gantt.ts`

**Interfaces:**
- Consumes: `Task` from `@/lib/db/schema`.
- Produces (Task 8 renders this):

```ts
export type GanttBar = { task: Task; startIdx: number; span: number; overdue: boolean };
export type GanttMonth = { label: string; startIdx: number };
export type GanttData = {
  days: number;               // window width in days (0 when no dated tasks)
  bars: GanttBar[];           // sorted by startIdx
  unscheduled: Task[];        // tasks with neither date
  todayIdx: number | null;    // day offset of today within the window
  weeks: number[];            // day offsets of Monday gridlines
  months: GanttMonth[];       // month labels with their starting offset
};
export function computeGantt(
  tasks: Task[],
  opts?: { todayIso?: string; locale?: string },
): GanttData;
```

- [ ] **Step 1: Create `src/lib/plan/gantt.ts`:**

```ts
import type { Task } from "@/lib/db/schema";

export type GanttBar = { task: Task; startIdx: number; span: number; overdue: boolean };
export type GanttMonth = { label: string; startIdx: number };
export type GanttData = {
  days: number;
  bars: GanttBar[];
  unscheduled: Task[];
  todayIdx: number | null;
  weeks: number[];
  months: GanttMonth[];
};

const DAY = 86_400_000;
const toUtc = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
const isoToday = () => new Date().toISOString().slice(0, 10);

/** Pure window math for the Gantt view — all dates are ISO `date` columns,
 *  compared in UTC so the chart is timezone-stable. */
export function computeGantt(
  tasks: Task[],
  opts?: { todayIso?: string; locale?: string },
): GanttData {
  const locale = opts?.locale ?? "en-GB";
  const today = toUtc(opts?.todayIso ?? isoToday());
  const dated = tasks.filter((t) => t.startDate || t.dueDate);
  const unscheduled = tasks.filter((t) => !t.startDate && !t.dueDate);
  if (dated.length === 0) {
    return { days: 0, bars: [], unscheduled, todayIdx: null, weeks: [], months: [] };
  }

  const startOf = (t: Task) => toUtc((t.startDate ?? t.dueDate)!);
  const endOf = (t: Task) => toUtc((t.dueDate ?? t.startDate)!);

  let min = Math.min(...dated.flatMap((t) => [startOf(t), endOf(t)]));
  let max = Math.max(...dated.flatMap((t) => [startOf(t), endOf(t)]));
  min -= 3 * DAY;
  max += 3 * DAY;
  // Pull today into view when it's near the task window (keeps the marker useful
  // without stretching the chart for far-past/future projects).
  if (today >= min - 7 * DAY && today <= max + 7 * DAY) {
    min = Math.min(min, today - DAY);
    max = Math.max(max, today + DAY);
  }

  const days = Math.round((max - min) / DAY) + 1;

  const bars: GanttBar[] = dated
    .map((task) => {
      const s = Math.min(startOf(task), endOf(task)); // tolerate start > due
      const e = Math.max(startOf(task), endOf(task));
      return {
        task,
        startIdx: Math.round((s - min) / DAY),
        span: Math.round((e - s) / DAY) + 1,
        overdue: task.status !== "done" && !!task.dueDate && toUtc(task.dueDate) < today,
      };
    })
    .sort((a, b) => a.startIdx - b.startIdx || a.span - b.span);

  const todayIdx = today >= min && today <= max ? Math.round((today - min) / DAY) : null;

  const weeks: number[] = [];
  const months: GanttMonth[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(min + i * DAY);
    if (d.getUTCDay() === 1) weeks.push(i);
    if (d.getUTCDate() === 1 || i === 0) {
      months.push({
        label: d.toLocaleDateString(locale, { month: "short", year: "numeric", timeZone: "UTC" }),
        startIdx: i,
      });
    }
  }
  return { days, bars, unscheduled, todayIdx, weeks, months };
}
```

- [ ] **Step 2: Verify the math with a scratch run** (no test runner — spot-check with tsx-less node via a temp script is overkill; instead verify via `tsc` here and visually in Task 8):

Run: `npx tsc --noEmit && npm run lint`
Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/lib/plan/gantt.ts
git commit -m "feat(plan): pure gantt window math"
```

---

### Task 8: GanttChart component + view wiring

**Files:**
- Create: `src/components/plan/GanttChart.tsx`
- Modify: `src/components/plan/ViewTabs.tsx` (add view + icons)
- Modify: `src/app/plan/(app)/[projectId]/page.tsx` (render branch)
- Modify: `src/lib/plan/i18n.ts` (keys)

**Interfaces:**
- Consumes: `computeGantt`/`GanttData` (Task 7), `Avatar`, `STATUS_DOT` (Task 6), `TaskDrawer` (existing: `{ task, users, role, onClose, onDelete }`), `deleteTask` action, `useToast`, `usePlanT`, `useLang` if exposed — **check `LangContext.tsx`:** `usePlanT()` returns `{ t }`; if it also exposes `lang`, use it; otherwise pass `lang` as a prop from the page (the page already has `lang`). This plan passes `lang` as a prop to be safe.
- Produces: `<GanttChart tasks={Task[]} users={PlanUser[]} role={UserRole} lang={Lang} />`.

- [ ] **Step 1: Add i18n keys** to `src/lib/plan/i18n.ts` (next to the `view.*` and `bd.*` blocks):

```ts
  "view.gantt": { en: "Gantt", th: "แกนต์" },
  "gantt.today": { en: "today", th: "วันนี้" },
  "gantt.unscheduled": { en: "Unscheduled", th: "ยังไม่กำหนดวัน" },
  "gantt.empty": {
    en: "No scheduled tasks yet. Give tasks a start or due date to see them on the timeline.",
    th: "ยังไม่มีงานที่กำหนดวัน กำหนดวันเริ่มหรือวันครบกำหนดให้งานเพื่อแสดงบนไทม์ไลน์",
  },
```

- [ ] **Step 2: Create `src/components/plan/GanttChart.tsx`:**

```tsx
"use client";
import { useState } from "react";
import type { Task, UserRole } from "@/lib/db/schema";
import type { Lang } from "@/lib/i18n";
import type { PlanUser } from "@/lib/plan/types";
import { userLabel } from "@/lib/plan/types";
import { computeGantt } from "@/lib/plan/gantt";
import { deleteTask } from "@/lib/plan/actions";
import { TaskDrawer } from "./TaskDrawer";
import { Avatar, STATUS_DOT } from "./ui";
import { useToast } from "./Toaster";
import { usePlanT } from "./LangContext";

export function GanttChart({ tasks, users, role, lang }: {
  tasks: Task[]; users: PlanUser[]; role: UserRole; lang: Lang;
}) {
  const [selected, setSelected] = useState<Task | null>(null);
  const toast = useToast();
  const { t } = usePlanT();
  const g = computeGantt(tasks, { locale: lang === "th" ? "th-TH" : "en-GB" });
  const pct = (d: number) => `${(d / g.days) * 100}%`;
  const assigneeOf = (id: string | null) => users.find((u) => u.id === id) ?? null;

  const onDelete = async (task: Task) => {
    try { await deleteTask(task.id); toast(t("toast.taskDeleted"), { tone: "info" }); }
    catch { toast(t("toast.taskDeleteErr"), { tone: "error" }); }
  };

  if (g.bars.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--border)] p-10 text-center text-sm text-[var(--muted-soft)]">
        {t("gantt.empty")}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <figure className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="overflow-x-auto">
          <div className="min-w-[48rem]">
            {/* Month labels */}
            <div className="relative ml-[12rem] h-5">
              {g.months.map((m) => (
                <span key={m.startIdx} style={{ left: pct(m.startIdx) }}
                  className="absolute text-[10px] uppercase tracking-wide text-[var(--muted-soft)]">
                  {m.label}
                </span>
              ))}
            </div>
            <div className="relative">
              {/* Week gridlines + today marker overlay */}
              <div className="pointer-events-none absolute inset-y-0 left-[12rem] right-0">
                {g.weeks.map((w) => (
                  <span key={w} className="absolute inset-y-0 w-px bg-current opacity-[0.06]"
                    style={{ left: pct(w) }} />
                ))}
                {g.todayIdx != null && (
                  <span className="absolute inset-y-0 w-px opacity-60"
                    style={{ left: pct(g.todayIdx + 0.5), background: "var(--feature-color)" }}>
                    <span className="absolute -top-0.5 left-1 text-[9px]" style={{ color: "var(--feature-color)" }}>
                      {t("gantt.today")}
                    </span>
                  </span>
                )}
              </div>
              {/* Rows */}
              {g.bars.map(({ task, startIdx, span, overdue }) => {
                const a = assigneeOf(task.assigneeId);
                return (
                  <div key={task.id} className="flex items-center border-t border-[var(--border-soft)] first:border-t-0">
                    <button onClick={() => setSelected(task)}
                      className="flex w-[12rem] shrink-0 items-center gap-2 truncate px-2 py-2 text-left text-sm transition hover:bg-[var(--surface-2)]">
                      {a && <Avatar size="sm" name={a.name} email={a.email} />}
                      <span className={`truncate ${task.status === "done" ? "text-[var(--muted-soft)] line-through" : ""}`}>
                        {task.title}
                      </span>
                    </button>
                    <div className="relative h-9 min-w-0 flex-1">
                      <button onClick={() => setSelected(task)}
                        title={`${task.startDate ?? task.dueDate} → ${task.dueDate ?? task.startDate}`}
                        aria-label={task.title}
                        className={`absolute top-1/2 h-3.5 min-w-2 -translate-y-1/2 rounded-full transition hover:opacity-80 ${STATUS_DOT[task.status]} ${
                          task.status === "done" ? "opacity-50" : ""
                        } ${overdue ? "ring-2 ring-rose-500/70" : ""}`}
                        style={{ left: pct(startIdx), width: pct(span) }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </figure>

      {g.unscheduled.length > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
          <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--muted-soft)]">
            {t("gantt.unscheduled")} · {g.unscheduled.length}
          </span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {g.unscheduled.map((task) => (
              <button key={task.id} onClick={() => setSelected(task)}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-xs text-[var(--muted)] transition hover:text-[var(--foreground)]">
                {task.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <TaskDrawer task={selected} users={users} role={role}
        onClose={() => setSelected(null)} onDelete={onDelete} />
    </div>
  );
}
```

- [ ] **Step 3: Replace `src/components/plan/ViewTabs.tsx` with** (adds `gantt` + per-view icons — the polish item folded in here to avoid editing the file twice):

```tsx
"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { usePlanT } from "./LangContext";
import type { PlanKey } from "@/lib/plan/i18n";

const VIEWS = ["table", "kanban", "calendar", "gantt", "burndown"] as const;

const icon = "h-3.5 w-3.5";
const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" } as const;
const ICONS: Record<(typeof VIEWS)[number], ReactNode> = {
  table: <svg viewBox="0 0 24 24" {...stroke} className={icon} aria-hidden><path d="M4 6h16M4 12h16M4 18h16" /></svg>,
  kanban: <svg viewBox="0 0 24 24" {...stroke} className={icon} aria-hidden><path d="M5 4v16M12 4v10M19 4v13" /></svg>,
  calendar: <svg viewBox="0 0 24 24" {...stroke} className={icon} aria-hidden><rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M3 9h18M8 2.5v4M16 2.5v4" /></svg>,
  gantt: <svg viewBox="0 0 24 24" {...stroke} className={icon} aria-hidden><path d="M4 6h8M8 12h10M6 18h7" /></svg>,
  burndown: <svg viewBox="0 0 24 24" {...stroke} className={icon} aria-hidden><path d="M4 5l6 7 4-3 6 8" /></svg>,
};

export function ViewTabs() {
  const router = useRouter(); const path = usePathname();
  const params = useSearchParams(); const active = params.get("view") ?? "table";
  const { t } = usePlanT();
  return (
    <div className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0.5">
      {VIEWS.map((v) => (
        <button key={v} onClick={() => router.push(`${path}?view=${v}`)}
          aria-current={active === v}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--feature-color)] ${
            active === v
              ? "bg-[var(--feature-color)] text-[var(--feature-contrast)] shadow-sm"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}>
          {ICONS[v]}
          <span className="hidden sm:inline">{t(`view.${v}` as PlanKey)}</span>
        </button>
      ))}
    </div>
  );
}
```

Note: labels collapse to icons-only below `sm:` now that there are five tabs — verify 375 px width in the manual check.

- [ ] **Step 4: Wire the page.** In `src/app/plan/(app)/[projectId]/page.tsx`, add `import { GanttChart } from "@/components/plan/GanttChart";` and extend the view ternary:

```tsx
{view === "kanban" ? <KanbanBoard key={tasksKey} projectId={projectId} tasks={tasks} users={users} role={role} />
  : view === "calendar" ? <CalendarView tasks={tasks} lang={lang} />
  : view === "gantt" ? <GanttChart key={tasksKey} tasks={tasks} users={users} role={role} lang={lang} />
  : view === "burndown" ? <BurndownChart data={computeBurndown(tasks, project)} lang={lang} />
  : <TableView key={tasksKey} tasks={tasks} users={users} role={role} />}
```

Leave the TaskForm condition as-is (`view !== "burndown"`): the form stays visible on the gantt view so tasks can be created there (they'll usually get dates). Do not modify it.

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: pass. Manual (`npm run dev`, a project with a mix of dated/undated/overdue tasks): five tabs render; gantt shows bars positioned by date, week gridlines, today line, rose ring on overdue, muted struck-through done tasks; clicking a bar or an unscheduled chip opens the drawer; viewer role gets a read-only drawer.

- [ ] **Step 6: Commit**

```bash
git add src/components/plan/GanttChart.tsx src/components/plan/ViewTabs.tsx "src/app/plan/(app)/[projectId]/page.tsx" src/lib/plan/i18n.ts
git commit -m "feat(plan): per-project gantt view with today marker and unscheduled strip"
```

---

### Task 9: Remaining polish — project accent header + projects empty state

**Files:**
- Modify: `src/app/plan/(app)/[projectId]/page.tsx` (header wrapper)
- Modify: `src/components/plan/ProjectGrid.tsx` (empty state)
- Modify: `src/lib/plan/i18n.ts` (one key)

**Interfaces:** consumes `CalendarIcon` from `./ui`, `pt` (both existing).

- [ ] **Step 1: Add i18n key:**

```ts
  "grid.empty": {
    en: "No projects yet. Create your first project to start planning.",
    th: "ยังไม่มีโปรเจกต์ สร้างโปรเจกต์แรกของคุณเพื่อเริ่มวางแผน",
  },
```

- [ ] **Step 2: Project accent header.** In `src/app/plan/(app)/[projectId]/page.tsx`, wrap the existing header block (the outer `<div>` that contains the back-link and the `mt-2 flex flex-wrap…` row) in a tinted panel by replacing that outer `<div>` with:

```tsx
<div className="rounded-xl border border-[var(--border)] p-5"
  style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${project.color} 10%, transparent), transparent 60%)` }}>
```

(keep all inner content — back link, title row, `TypeBadge`, target date, `ProjectActions` — unchanged; just close the new wrapper where the old one closed).

- [ ] **Step 3: Projects empty state.** Replace `src/components/plan/ProjectGrid.tsx` with:

```tsx
import { ProjectCard } from "./ProjectCard";
import { ProjectForm } from "./ProjectForm";
import { createProject } from "@/lib/plan/actions";
import { canEditPlan } from "@/lib/plan/types";
import type { ProjectWithProgress } from "@/lib/plan/types";
import { pt } from "@/lib/plan/i18n";
import { CalendarIcon } from "./ui";
import type { Lang } from "@/lib/i18n";
import type { UserRole } from "@/lib/db/schema";

export function ProjectGrid({ projects, lang, role }: { projects: ProjectWithProgress[]; lang: Lang; role: UserRole }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.length === 0 && (
        <div className="col-span-full rounded-xl border border-dashed border-[var(--border)] p-10 text-center">
          <CalendarIcon className="mx-auto h-6 w-6 opacity-40" />
          <p className="mt-2 text-sm text-[var(--muted-soft)]">{pt(lang, "grid.empty")}</p>
        </div>
      )}
      {projects.map((p) => <ProjectCard key={p.id} p={p} lang={lang} />)}
      {canEditPlan(role) && <ProjectForm action={createProject} />}
    </div>
  );
}
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add "src/app/plan/(app)/[projectId]/page.tsx" src/components/plan/ProjectGrid.tsx src/lib/plan/i18n.ts
git commit -m "feat(plan): project accent header + designed projects empty state"
```

---

### Task 10: Full visual + functional verification pass

**Files:** none (fixes go into the files above if found).

- [ ] **Step 1:** `npm run dev`, then use the webapp-testing skill (Playwright) to screenshot every /plan surface at **375 px, 768 px, 1280 px** × **light + dark** (`prefers-color-scheme` emulation): `/plan`, `/plan/[projectId]` in all five views, `/plan/admin`, `/plan/signin`. Check: sidebar/drawer behavior, five tabs at 375 px (icons only), gantt axis legibility, avatar contrast, admin invite tables.
- [ ] **Step 2:** Functional sweep as admin: create invite → pending row; revoke; resend. As viewer (temporarily set a role in DB or use canEditPlan-hidden UI observation): all controls hidden/read-only, gantt drawer read-only.
- [ ] **Step 3:** Fix anything found; re-run `npx tsc --noEmit && npm run lint && npm run build && env -u DATABASE_URL npm run build`.
- [ ] **Step 4:** Commit fixes if any:

```bash
git add -A src/
git commit -m "fix(plan): visual/functional audit fixes for v0.2.0 features"
```

---

### Task 11: Code review + security review

- [ ] **Step 1:** Run the `code-review` skill on the branch diff (`git diff main...HEAD`) at high effort. Apply/fix legitimate findings.
- [ ] **Step 2:** Run the `security-review` skill on the pending changes. Priority areas: invite actions (`requireAdmin` on every mutation, email validation, no HTML injection in the invite email — `esc()` is applied), `auth.ts` gate logic (no bypass: missing email → reject; revoked invite for a not-yet-created user → reject), no secrets in the invite email.
- [ ] **Step 3:** Fix findings, re-run the full gate (`npx tsc --noEmit && npm run lint && npm run build && env -u DATABASE_URL npm run build`), commit:

```bash
git add -A
git commit -m "fix(plan): address code + security review findings"
```

---

### Task 12: Release v0.2.0 — migrate, merge, deploy

- [ ] **Step 1: Version bump.** In `package.json` change `"version": "0.1.0"` to `"version": "0.2.0"`. Commit:

```bash
git add package.json
git commit -m "chore: release v0.2.0"
```

- [ ] **Step 2: DB migration** (additive — creates the `invite` table only). `drizzle-kit` does not read `.env.local`; take `DATABASE_URL` from `.env.local` and pass inline:

```bash
DATABASE_URL="<value from .env.local>" npx drizzle-kit push
```

Expected: statement creating `invite` table; no destructive statements — **abort and ask the user if drizzle-kit proposes anything other than the new table.**

- [ ] **Step 3: Deploy** via the base-deployment skill: merge `feat/plan-sidebar-invites-gantt` to `main` (PR per repo convention), push, Vercel auto-deploys.
- [ ] **Step 4: Smoke check** on https://nanoteofficial.me/plan — sidebar renders, gantt tab works, `/plan/admin` shows the invite section. Tag the release:

```bash
git tag v0.2.0 && git push origin v0.2.0
```
