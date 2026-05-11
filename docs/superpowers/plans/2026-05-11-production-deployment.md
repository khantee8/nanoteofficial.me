# Production Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy nanoteofficial.me to production on Vercel Hobby (free) with custom domain, wildcard subdomains, and automatic GitHub-based CI/CD.

**Architecture:** GitHub repo (`khantee8/nanoteofficial.me`) is the source of truth. Vercel watches the `main` branch and builds on every push. Namecheap DNS routes `nanoteofficial.me` and `*.nanoteofficial.me` to Vercel's edge network. No code changes required — the existing Next.js 16 app runs natively on Vercel without any adapter.

**Tech Stack:** Next.js 16, Vercel Hobby (free), Namecheap DNS, GitHub

---

### Task 1: Create and push `main` branch to GitHub

**Files:**
- No file changes — git operations only

- [ ] **Step 1: Create `main` branch from `v0.5`**

```bash
git -C /project/src/nanoteofficial.me checkout v0.5
git -C /project/src/nanoteofficial.me checkout -b main
```

Expected: `Switched to a new branch 'main'`

- [ ] **Step 2: Push `main` to GitHub**

```bash
git -C /project/src/nanoteofficial.me push origin main
```

Expected: output shows `* [new branch]      main -> main`

- [ ] **Step 3: Verify on GitHub**

Open `https://github.com/khantee8/nanoteofficial.me/branches` and confirm `main` branch appears.

- [ ] **Step 4: Set `main` as the default branch on GitHub**

Go to `https://github.com/khantee8/nanoteofficial.me/settings/branches` → click the pencil icon next to the default branch → change to `main` → confirm.

---

### Task 2: Create Vercel account and import the GitHub repo

**Files:**
- No file changes — Vercel dashboard operations

- [ ] **Step 1: Create a free Vercel Hobby account**

Go to `https://vercel.com/signup` → sign up with the GitHub account that owns `khantee8/nanoteofficial.me`. Using GitHub login links the account automatically.

- [ ] **Step 2: Import the GitHub repository**

From the Vercel dashboard → "Add New Project" → "Import Git Repository" → select `khantee8/nanoteofficial.me`.

- [ ] **Step 3: Confirm build settings (auto-detected)**

Vercel will auto-detect Next.js. Confirm these values before deploying:

| Setting | Expected Value |
|---|---|
| Framework Preset | Next.js |
| Root Directory | `./` |
| Build Command | `next build` |
| Output Directory | `.next` |
| Install Command | `npm install` |

Leave environment variables empty — none required.

- [ ] **Step 4: Deploy**

Click "Deploy". Vercel will run `npm install && npm run build`. Wait for the build to complete (~2–3 min).

Expected: Green checkmark, preview URL like `nanoteofficial-me.vercel.app`.

- [ ] **Step 5: Verify the preview URL works**

Open the preview URL (e.g. `nanoteofficial-me.vercel.app`) and confirm the homepage loads. Check that the EN/TH language toggle works (this confirms Server Actions and cookies function on Vercel).

---

### Task 3: Add custom domains on Vercel

**Files:**
- No file changes — Vercel dashboard operations

- [ ] **Step 1: Open domain settings**

In the Vercel project dashboard → "Settings" → "Domains".

- [ ] **Step 2: Add apex domain**

Type `nanoteofficial.me` → click "Add". Vercel will show the required DNS records.

- [ ] **Step 3: Add wildcard domain**

Type `*.nanoteofficial.me` → click "Add". This covers all subdomains (`finance.*`, `cyber.*`, `kb.*`, `art.*`).

- [ ] **Step 4: Record the DNS values Vercel shows**

Vercel will display the following records (these are the standard Vercel values):

| Type | Host | Value |
|---|---|---|
| A Record | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |
| CNAME | `*` | `cname.vercel-dns.com` |

Both domains will show "Invalid Configuration" until DNS is updated in Task 4 — this is expected.

---

### Task 4: Update Namecheap DNS

**Files:**
- No file changes — Namecheap dashboard operations

- [ ] **Step 1: Open Namecheap Advanced DNS**

Log in to Namecheap → "Domain List" → click "Manage" next to `nanoteofficial.me` → "Advanced DNS" tab.

- [ ] **Step 2: Remove any existing A/CNAME records for `@`, `www`, `*`**

Delete any pre-existing records for these hosts to avoid conflicts.

- [ ] **Step 3: Add A record for apex**

| Type | Host | Value | TTL |
|---|---|---|---|
| A Record | `@` | `76.76.21.21` | Automatic |

- [ ] **Step 4: Add CNAME for www**

| Type | Host | Value | TTL |
|---|---|---|---|
| CNAME Record | `www` | `cname.vercel-dns.com` | Automatic |

- [ ] **Step 5: Add wildcard CNAME**

| Type | Host | Value | TTL |
|---|---|---|---|
| CNAME Record | `*` | `cname.vercel-dns.com` | Automatic |

- [ ] **Step 6: Save all records**

Click the green checkmark to save each record. DNS propagation takes 5–30 minutes.

- [ ] **Step 7: Check propagation**

Run this command to check when DNS has propagated:

```bash
dig nanoteofficial.me A +short
```

Expected once propagated: `76.76.21.21`

---

### Task 5: Verify full production deployment

- [ ] **Step 1: Check Vercel domain status**

In Vercel → Settings → Domains. Both `nanoteofficial.me` and `*.nanoteofficial.me` should show green "Valid Configuration" with SSL active.

- [ ] **Step 2: Verify homepage**

```bash
curl -I https://nanoteofficial.me
```

Expected: `HTTP/2 200` with `x-vercel-id` header present.

- [ ] **Step 3: Verify each subdomain**

Open each URL in a browser and confirm correct page loads:

| URL | Expected page |
|---|---|
| `https://nanoteofficial.me` | Homepage with EN/TH toggle |
| `https://finance.nanoteofficial.me` | Finance page |
| `https://cyber.nanoteofficial.me` | Cyber page |
| `https://art.nanoteofficial.me` | Art page |
| `https://kb.nanoteofficial.me` | KB page (private but accessible) |

- [ ] **Step 4: Verify language toggle**

On the homepage, click the EN/TH toggle. The page should switch languages without a full reload. This confirms Server Actions and `httpOnly` cookies work correctly on Vercel.

- [ ] **Step 5: Verify security headers**

```bash
curl -I https://nanoteofficial.me | grep -E "x-frame|x-content|strict-transport|content-security"
```

Expected: all four headers present with values from `next.config.ts`.

- [ ] **Step 6: Commit deployment notes**

```bash
git -C /project/src/nanoteofficial.me add .
git -C /project/src/nanoteofficial.me commit -m "chore: production deployed to nanoteofficial.me via Vercel"
```

---

## Summary

| Task | Who performs it | Where |
|---|---|---|
| Task 1: Create `main` branch | Claude / terminal | Local git |
| Task 2: Create Vercel project | User | vercel.com |
| Task 3: Add domains on Vercel | User | Vercel dashboard |
| Task 4: Update Namecheap DNS | User | Namecheap dashboard |
| Task 5: Verify deployment | Claude + User | Terminal + browser |
