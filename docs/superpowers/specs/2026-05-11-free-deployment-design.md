# Free Production Deployment — nanoteofficial.me

**Date:** 2026-05-11
**Status:** Approved
**Approach:** Vercel Hobby (free) + Namecheap domain

---

## Overview

Deploy `nanoteofficial.me` to production at zero hosting cost using Vercel's free Hobby tier, connected to the existing GitHub repo for automatic CI/CD. The domain `nanoteofficial.me` is already purchased via Namecheap.

---

## Section 1: Vercel Project Setup

Connect the GitHub repo to a Vercel Hobby account (free).

| Setting | Value |
|---|---|
| GitHub repo | `khantee8/nanoteofficial.me` |
| Framework | Next.js (auto-detected) |
| Build command | `npm run build` |
| Root directory | `.` (repo root) |
| Production branch | `main` |

- No environment variables required — no external API keys in the app.
- `secure: true` on the lang cookie is handled automatically by Vercel's HTTPS.
- Every push to `main` → production deploy to `nanoteofficial.me`.
- Every other branch → free preview URL (e.g. `nanoteofficial-git-feature-x.vercel.app`).

**Branch setup:** rename/merge `v0.5` → `main` and set as default on GitHub.

```bash
git checkout v0.5
git checkout -b main
git push origin main
```

---

## Section 2: Domain & DNS Configuration

In the Vercel project dashboard, add two custom domains:

| Domain | Purpose |
|---|---|
| `nanoteofficial.me` | Apex/root |
| `*.nanoteofficial.me` | Wildcard — all subdomains |

In **Namecheap → Advanced DNS**, add these records:

| Type | Host | Value |
|---|---|---|
| A Record | `@` | `76.76.21.21` |
| CNAME Record | `www` | `cname.vercel-dns.com` |
| CNAME Record | `*` | `cname.vercel-dns.com` |

- Vercel provisions SSL (Let's Encrypt) automatically once DNS propagates (~5–30 min).
- No changes to `next.config.ts` — security headers apply globally including all subdomains.

---

## Section 3: CI/CD Flow

```
push to main        →  Vercel build (npm run build)  →  deploy to nanoteofficial.me
push to other branch →  Vercel build                 →  preview URL
```

- No extra tooling or GitHub Actions needed — Vercel handles everything.
- Existing `docker-compose.yml` is unchanged and stays valid for local development.
- No code or config file changes required.

---

## Section 4: Subdomain Routing

`src/proxy.ts` (Next.js 16 native proxy middleware) rewrites subdomains to internal routes. Works natively on Vercel — no adapter or modifications needed.

| URL | Serves |
|---|---|
| `nanoteofficial.me` | `src/app/page.tsx` |
| `finance.nanoteofficial.me` | `src/app/finance/page.tsx` |
| `cyber.nanoteofficial.me` | `src/app/cyber/page.tsx` |
| `art.nanoteofficial.me` | `src/app/art/page.tsx` |
| `kb.nanoteofficial.me` | `src/app/kb/page.tsx` (private — blocked in robots.ts) |

---

## Verification Checklist

After deploy, confirm:

- [ ] `nanoteofficial.me` loads homepage
- [ ] `finance.nanoteofficial.me` loads finance page
- [ ] `cyber.nanoteofficial.me` loads cyber page
- [ ] `art.nanoteofficial.me` loads art page
- [ ] Language toggle (EN/TH) works — confirms Server Actions + cookies function on Vercel
- [ ] SSL padlock present on all domains

---

## Cost Summary

| Item | Cost |
|---|---|
| Vercel Hobby hosting | $0/month forever |
| Domain `nanoteofficial.me` (Namecheap) | Already purchased (first-year promo) |
| SSL certificates | $0 (Let's Encrypt via Vercel) |
| CI/CD | $0 (Vercel Git integration) |
