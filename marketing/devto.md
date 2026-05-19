# dev.to — Launch Post

> Account: 사장님 dev.to account (없으면 만들어야 함)
> Cross-post: Hashnode, Medium, personal blog if any
> Cover image: TODO — landing page screenshot
> Tags: 4 max — `webdev`, `nextjs`, `prisma`, `buildinpublic`
> Canonical URL: trace-web-srye.vercel.app/blog/launch (when blog ships) or dev.to as primary

---

## Title

**I killed my developer CRM after 17 days. Here's what I built instead.**

(Alt: "Developers leak intent everywhere. Your CRM doesn't see any of it.")

---

## Body

Two weeks ago I had a Next.js 15 app with a Prisma schema for `Contact`, `Deal`, `Stage`, and `Pipeline`. The landing page said "the lightweight CRM for solo developers." The waitlist had three names on it. All three were friends.

I killed it on day 17.

Not because the code was broken. Because the category was a graveyard.

### What I got wrong

Solo developers don't buy CRMs. They live in a stack that already covers the job:

- A Notion board with three columns
- GitHub Issues for actual customer requests
- A spreadsheet someone forwarded them once
- Stripe's customer page when they need a receipt
- Their inbox

Nobody in this group is shopping for HubSpot Lite. The people who *do* outgrow this stack jump directly to Attio or Folk. There's no gap between "I use Notion" and "I need Attio" — those are not adjacent products, but the time you spend at Notion is what makes the leap to Attio feel right.

I was trying to build a product that lives in a gap that doesn't exist.

### What I actually wanted

Building in public, the thing I checked obsessively wasn't a CRM. It was:

- The GitHub repo's traffic graph
- Stars I didn't recognize, to see who they were
- Issue comments from the same handle three weeks apart
- A waitlist CSV I exported to grep for `gmail`
- A search for my domain on X

I was trying to figure out **who was paying attention**. Not who to nurture. Not who to close. Just: who, today, did something that means they're closer to caring than yesterday.

That's not CRM work. That's *signal engineering*.

### Trace

So I rebuilt. New name, new schema, new philosophy:

```ts
// before
Contact → Deal → Stage → Pipeline

// after
Person → Event → Signal → Timeline
```

The day-one feature set:

1. **Connect GitHub.** Pick the repos you ship. Trace starts streaming stars, issues, PR comments, watchers.
2. **Identity dedup.** A person who stars from `@hbsmith` on GitHub and signs the waitlist as `hyunbin@gmail` becomes one row. One person, one timeline.
3. **Three baseline signals** (computed every cycle, rule-based to start):
   - `high_intent` — multiple touchpoints in 7 days
   - `power_user` — sustained issue/PR activity
   - `feature_advocate` — repeated 👍 on the same proposal
4. **Inbox.** Five people every morning. Not five hundred. The point is to read fewer people more carefully.
5. **Cmd-K palette.** Jump to person, repo, signal.

That's it. No automation. No drip campaigns. No "AI personalization." No multi-seat. No outbound. Those are v1.5+ and only ship after 100 waitlist signups produce five people who say "this is a must-have."

### Why not a CRM, again

The hardest part of this rewrite was discipline around language. The old codebase had `Contact`, `Deal`, `Stage`. They sound innocent until you realize they encode a sales-team worldview: there's a pipe, there are stages, contacts move through. A solo developer running ten experiments in parallel doesn't have a pipe. They have a graph of attention.

So Trace's schema bans those words. Models are `Person`, `Identity`, `Event`, `Signal`, `Interest`, `Theme`, `Organization`, `Integration`. The waitlist is a `WaitlistEntry`, not a `Lead`.

If you're building a B2D product, I'd suggest doing the same exercise: write your forbidden-words list before you write the schema. The model bends to the vocabulary, and the vocabulary bends the product.

### The autonomous loop (the part I almost ruined)

Trace has a 60-minute autonomous loop. The first version did exactly what every "AI agent" tutorial demonstrates:

1. Read `decisions.md`
2. Ask the LLM to propose a next decision
3. Append to `decisions.md`
4. Wait 60 minutes
5. Repeat

By day 14 the loop was repeating the same pricing decision (`$7 / $180 / $250`) in eleven different phrasings. It had collapsed into its own context window. Pure echo chamber.

The current loop, V2, is structurally different:

```
observe → analyze → generate experiment → execute lightweight → measure → score
```

- It never reads its own previous decisions as input.
- Its source layer is structured around external metrics (`github.stars`, `waitlist.signups_24h`, `stripe.mrr` — all stubbed v1, real adapters week 1).
- Every experiment must specify a metric to measure and a window to measure it in.
- Decisions without an associated score will be garbage-collected (Memory Gate — in flight, design locked).
- Budget rules block: more than 3 proposals per day, pricing changes without metric evidence, duplicate topics in the last 5 proposals.

Half of building this product turned out to be building the right operating substrate for one developer — not the product itself. The substrate is open-source-able later. For now it's just `src/core/{types,reality,scores,budget,loop}.ts`.

### Stack, for the curious

- **Next.js 16** (App Router, Turbopack)
- **Prisma + Postgres on Neon**
- **pnpm workspace + Turborepo** (`apps/web`, `packages/{db,events,integrations,ai,shared}`)
- **TypeScript strict**, no Python in v1
- **Tailwind v4** with inline `@theme`

### Where it is right now

- Schema deployed to Neon
- Landing page live
- Waitlist API works (zod validation + Prisma upsert)
- Autonomous loop V2 runs end-to-end with mock data
- Real GitHub adapter: week 1 of MVP
- AI summarization: v2, not v1

### What I'd love from you

If you've ever opened seven tabs trying to figure out who in your audience is actually paying attention — drop a comment or hit the waitlist. The MVP scope is intentionally narrow and I want the first 20 signups to tell me which of the three baseline signals is wrong before I wire real ingestion.

👉 https://trace-web-srye.vercel.app   ← waitlist

🐙 https://github.com/moonsu1627/trace   ← code

---

*Posted from a one-person company. Soloing this. Honest replies welcome, especially the harsh ones.*
