# nanoteofficial.me

Personal portfolio + roadmap site for **Saksit Jantila** — a single Next.js 16 app
that serves the main profile and four planned subdomain projects:

| Subdomain                       | Project                                           |
| ------------------------------- | ------------------------------------------------- |
| `finance.nanoteofficial.me`     | Client portfolio analytics & financial planning   |
| `cyber.nanoteofficial.me`       | Real-time threat monitoring for security pros    |
| `kb.nanoteofficial.me`          | Private personal knowledge base                   |
| `art.nanoteofficial.me`         | Visual art & short-form video                     |

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19, TypeScript, Tailwind v4
- Subdomain rewrite via `src/proxy.ts` (renamed from `middleware.ts` in Next 16)

## Local development

```bash
npm install
npm run dev          # localhost:3000
```

In dev, the four projects are reachable at path-based routes:
`/finance`, `/cyber`, `/kb`, `/art`.

In production, `proxy.ts` maps the corresponding subdomain hostnames onto
those routes, so each subdomain serves the right page.

## Editing your profile

All bio, experience, skills, and roadmap copy lives in
[`src/lib/profile.ts`](./src/lib/profile.ts). The placeholders are clearly
marked — replace them with your real LinkedIn data.

## Quality checks

```bash
npm run lint          # eslint
npx tsc --noEmit      # type check
npm audit             # known CVEs (postcss build-time advisory is non-exploitable here)
```

## Security headers

`next.config.ts` sets `X-Frame-Options`, `X-Content-Type-Options`,
`Referrer-Policy`, `Permissions-Policy`, and HSTS. `X-Powered-By` is removed.
`/kb` is excluded from `robots.txt` and noindexed because it's intended to be
private once auth is wired up.

## Roadmap

- [x] Home page + roadmap + four subdomain stub pages
- [x] Subdomain routing via `proxy.ts`
- [x] Security headers, robots, sitemap
- [ ] Wire real LinkedIn content into `src/lib/profile.ts`
- [ ] `kb.*` authentication
- [ ] `finance.*` integration with the existing Personal Investment Project
- [ ] `cyber.*` live feed source
- [ ] `art.*` content uploader
- [ ] Deploy to Vercel + DNS for the four subdomains
