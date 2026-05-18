# Trace

**Developer Signal Engine** — GitHub-native customer intelligence for solo devs, indie hackers, AI builders, devtool startups.

Developers leak intent everywhere: GitHub stars, issues, PR comments, docs visits, Discord questions, X mentions, waitlist signups, Linear, support tickets. Trace pulls those signals together automatically and tells you who matters today, this week, this month.

## What you get on day one

- Connect GitHub → repos start streaming stars · issues · PRs · watchers
- Identity dedup across handles
- Person timeline: every signal, ordered
- Three baseline signals:
  - `high_intent` — multiple touchpoints in 7 days
  - `power_user` — frequent issues/PRs, sustained over weeks
  - `feature_advocate` — repeated 👍 on the same proposal
- Inbox: today's top 5 people to read
- Cmd-K palette — jump to person, repo, signal

## Why it's not a CRM

CRMs ask you to type. Trace listens.

CRMs model `Contact → Deal → Stage → Pipeline`. Trace models `Person → Event → Signal → Timeline`.

CRMs price for sales teams. Trace prices for one developer who ships.

## Stack

- Next.js (App Router)
- Prisma + Postgres
- pnpm workspace + Turborepo

## Layout

```
trace/
├── apps/
│   └── web/                # Next.js — landing, dashboard, API
├── packages/
│   ├── db/                 # Prisma schema, generated client
│   ├── events/             # Event type catalog (typed)
│   ├── integrations/       # GitHub · Linear · ... adapters
│   ├── ai/                 # Future: summarization, theme clustering
│   └── shared/             # Cross-package types · utils
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Local dev

```bash
pnpm install
pnpm --filter @trace/web dev
```

## Deploy (Vercel + Neon)

One-time setup:

1. **Neon** — create free Postgres at https://neon.tech. Copy the pooled `DATABASE_URL`.
2. **GitHub** — create `trace` repo, push this monorepo.
3. **Vercel** — import the GitHub repo.
   - Root Directory: `apps/web`
   - Framework Preset: Next.js (auto)
   - Environment variable: `DATABASE_URL` = the Neon URL
   - Vercel will pick up `vercel.json` at repo root and run `pnpm install` + `prisma generate` + `next build`.
4. **Schema push** — once Vercel build succeeds, run from your machine:
   ```bash
   cd packages/db
   DATABASE_URL="..." pnpm exec prisma db push
   ```

## Status

Pre-launch. Building MVP scope (4-6 weeks). Waitlist-only.
