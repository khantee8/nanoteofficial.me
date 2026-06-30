# `/plan` — Deployment Runbook

**Date:** 2026-06-30
**For:** PR #2 — `feat/plan-workspace` → `main`
**Goal:** take the merged code live so `/plan` works in production.

> The code is done and green (tsc / lint / build). Everything below is **live-credential
> and infrastructure work** that cannot be done from the codebase. Do these in order.

---

## 0. Prerequisites

- Vercel project `nanoteofficial.me` (already auto-deploys from `main`).
- Resend account (already used by the contact form — `RESEND_API_KEY` exists).
- A terminal in `/project/src/nanoteofficial.me`.

---

## 1. Provision Neon Postgres

1. Vercel dashboard → project **nanoteofficial.me** → **Storage** → **Create Database** →
   **Neon** (Postgres) on the Marketplace. Pick the region closest to your Vercel
   functions (US East works with the default).
2. Vercel auto-injects Neon env vars into the project (`DATABASE_URL`,
   `DATABASE_URL_UNPOOLED`, `POSTGRES_*`, etc.).
3. Copy the **pooled** connection string (the one named `DATABASE_URL`) — you need it
   locally for the migration step. It looks like:
   `postgresql://<user>:<pass>@ep-xxxx-pooler.<region>.aws.neon.tech/neondb?sslmode=require`

> The app uses the `@neondatabase/serverless` HTTP driver (`src/lib/db/index.ts`), so
> the pooled URL is correct for both migration and runtime.

---

## 2. Run the database migration

The schema migration already exists at `drizzle/0000_optimal_betty_brant.sql`. Apply it
to the real Neon DB. `drizzle-kit` reads `DATABASE_URL` from the environment, so pass it
inline (it does **not** auto-load `.env.local`):

```bash
cd /project/src/nanoteofficial.me

# Option A — push the schema directly (simplest for first deploy)
DATABASE_URL="postgresql://...your-neon-pooled-url..." npx drizzle-kit push

# Option B — apply the generated SQL migration (if you prefer migration history)
DATABASE_URL="postgresql://...your-neon-pooled-url..." npx drizzle-kit migrate
```

Verify the tables exist:

```bash
DATABASE_URL="postgresql://...your-neon-pooled-url..." \
  npx drizzle-kit studio        # opens a local DB browser, or:
psql "postgresql://...your-neon-pooled-url..." -c "\dt"
# expect: users, accounts, sessions, verificationTokens, projects, tasks
```

---

## 3. Verify the Resend sender

Auth.js sends magic links **from** `noreply@nanoteofficial.me` (hard-coded in
`src/auth.ts`). That domain must be verified in Resend or every sign-in email silently
fails.

1. Resend dashboard → **Domains** → confirm `nanoteofficial.me` is **Verified**
   (DKIM/SPF/DMARC green). If not, add the DNS records Resend shows to Namecheap and
   wait for verification.
2. Optional sanity check — send a test from that sender via the Resend API/dashboard.

> If you want a different sender address, change it in `src/auth.ts` first — don't just
> assume `noreply@` is provisioned.

---

## 4. Set Vercel environment variables

Project → **Settings** → **Environment Variables**. Set these for **Production** (and
**Preview** if you want sign-in on preview URLs):

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | Neon pooled URL | Auto-set by step 1 — confirm it's present. |
| `AUTH_SECRET` | `openssl rand -base64 33` output | Or run `npx auth secret`. Must be set. |
| `ALLOWED_EMAILS` | `khantee9@gmail.com` (comma-separated for more) | Invite allowlist; `signIn` callback fails closed. |
| `RESEND_API_KEY` | existing Resend key | Reused for both contact form and auth email. |
| `AUTH_URL` | `https://nanoteofficial.me` | Pins magic-link callback to the apex domain (not a preview URL). |

Generate a secret locally if needed:

```bash
openssl rand -base64 33
```

> `AUTH_TRUST_HOST` is auto-enabled on Vercel, so you don't need to set it. Setting
> `AUTH_URL` is the belt-and-suspenders fix that keeps magic links pointing at the real
> domain.

---

## 5. Merge & deploy

1. Merge **PR #2** into `main` (squash or merge — your call).
2. Vercel auto-builds from `main`. Watch the deployment → confirm the build log shows
   `ƒ Proxy (Middleware)` and finishes green.
3. If the build fails on a missing env var, re-check step 4 (env vars must exist at
   **build** time, not just runtime, for Vercel to inject them).

---

## 6. End-to-end smoke test (production)

Run through this manually (or with the webapp-testing / Playwright skill):

1. **Gate works:** visit `https://nanoteofficial.me/plan` while signed out →
   redirected to `/plan/signin`.
2. **Allowlist rejects:** try signing in with an email **not** in `ALLOWED_EMAILS` →
   no access granted.
3. **Magic link:** sign in with `khantee9@gmail.com` → receive the Resend email →
   click the link → land on `/plan` master overview.
4. **Project CRUD:** create a project (try each type: it / travel / interview / general)
   → edit it → archive it.
5. **Task CRUD:** open a project → add tasks in different statuses → edit → delete.
6. **Kanban:** drag a card between columns (including into an **empty** column) →
   status persists after refresh.
7. **Table view:** rows render, inline edits persist.
8. **Calendar view:** a task with a `dueDate` shows on the right day; click → detail.
9. **Privacy:** `https://nanoteofficial.me/robots.txt` disallows `/plan`; `/plan` is
   absent from `sitemap.xml`.

---

## 7. Rollback

If something is broken in production:

- **Revert the deploy:** Vercel → Deployments → promote the previous good deployment.
- **Code rollback:** `git revert` the merge commit on `main` (Vercel redeploys).
- The DB schema is additive (new tables only) — no destructive change to roll back.

---

## Notes / gotchas

- `drizzle-kit` does **not** read `.env.local` — always pass `DATABASE_URL` inline for
  migration commands.
- Local `.env.local` holds **dummy** values so `tsc`/`lint`/`build` pass; it is
  gitignored and must never be committed. Real values live only in Vercel.
- Phase 2 (burndown, team load, roles) is designed but not built. **Before** adding
  private/per-user projects or roles, add ownership/role checks to the server actions —
  see the Authorization note in the design spec, or they become IDOR vectors.
