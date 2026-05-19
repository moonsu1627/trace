# Reddit — Launch Posts

> Subreddits: r/SideProject (primary), r/IndieHackers (secondary), r/devtools (tertiary)
> Account: 사장님 reddit account
> Time: 09:00–11:00 ET (US weekday)
> No reposting same text across subs in the same hour — algorithm flags it.
> No waitlist URL in title. Drop it in body only.

---

## r/SideProject

**Title:**
> I killed my own CRM after 17 days and rebuilt it as a signal engine — here's the data model

**Body:**

Two weeks ago I had a working "developer CRM" landing page with three friends on the waitlist. Standard playbook: Next.js, Prisma, Contact/Deal/Stage models, "the lightweight CRM for solo devs."

I killed it on day 17 because I realized solo devs don't buy CRMs. They live in Notion → spreadsheets → Attio. There's no middle for me to occupy.

But the thing I *actually* wanted while building in public never went away: a way to **see who was already paying attention** without juggling seven tabs. Stars I didn't recognize, issue comments from the same handle three weeks apart, a waitlist signup with a bio that mentions LangChain.

So I rebuilt. New schema, no Deal/Stage/Pipeline language:

```
Person → Event → Signal → Timeline
```

Three baseline signals computed every cycle:
- `high_intent` — multiple touchpoints in 7 days
- `power_user` — sustained issue/PR activity
- `feature_advocate` — repeated 👍 on the same proposal

Inbox shows 5 people every morning. Not five hundred. The point is to read fewer people more carefully.

**Stack:** Next.js 16 + Prisma + Postgres (Neon) + pnpm workspace + Turborepo. TypeScript strict. No Python.

**What's actually working:** schema deployed, landing live, waitlist API talks to Neon, autonomous loop runs with mock data.

**What's not:** real GitHub ingestion (week 1 of MVP), AI summarization (v2), pricing (won't decide until 100 signups produce 5 must-haves).

Honest about the parts I'm not sure of:
- The three baseline signals might be the wrong three. Open to being told.
- The mock-data loop feels useful in theory but won't be real until Octokit is wired.

I'm soloing this. If anyone has ever had the "I know someone in my audience cares but I can't name them" feeling, would love to compare notes.

Repo (public soon): github.com/moonsu1627/trace
Waitlist: trace.dev

---

## r/IndieHackers

**Title:**
> Killed my 17-day-old MVP. Rebuilt with a new schema. Here's why.

**Body:**

Quick story for anyone in a similar spot.

I shipped a "developer CRM" landing page two weeks ago. Got three friends on the waitlist. Wrote the Prisma schema for Contact / Deal / Stage / Pipeline. Started coding the dashboard.

On day 17 a friend asked me bluntly: "What do solo devs do *today* that you replace?" I tried to answer and realized the honest answer was "they keep a Notion board until they don't, then they get Attio. Nothing in between is missing."

I killed it that night.

The thing I never stopped doing during those 17 days, though, was checking GitHub traffic, exporting waitlist CSVs, and grepping for handles. Not to manage a pipeline. To *see who was paying attention*. That's a different shape of product.

Rebuilt as **Trace**: a developer signal engine. GitHub stars, issues, PRs, waitlist signups → identity dedup → one timeline per person → three baseline signals → daily top 5.

Lessons I'd flag to other indie hackers:

1. **The category matters more than the product.** "Developer CRM" is a graveyard (Orbit '23, several dead PH launches). I should have checked the graveyard first.
2. **Your forbidden-words list is a feature.** Before the rebuild I wrote down: never use `Contact`, `Deal`, `Stage`, `Pipeline`, `lead`. The schema can't drift back into sales-team land if the vocabulary blocks it.
3. **Build the operating substrate, not just the product.** Half my time the first week of the rebuild was building the autonomous loop (observe → analyze → experiment → measure → score). Sounds like overengineering. Actually saved me from a hallucination loop where the old loop kept proposing the same pricing 11 times.
4. **Pre-launch is a feature.** Trace is waitlist-only until 100 signups produce 5 must-haves. Cheaper than building features nobody wants.

Stack: Next.js 16 + Prisma + Neon Postgres + pnpm workspace + Turborepo. Vercel deploy.

If you've killed and rebuilt your own thing recently, I'd love to hear the inflection point. Specific question I'm sitting with: how do you avoid falling in love with v2 the way you fell in love with v1?

Waitlist: trace.dev
Repo: github.com/moonsu1627/trace (public soon)

---

## r/devtools (optional, smaller sub)

**Title:**
> Trace — open-stack signal engine for devtool founders (pre-launch)

**Body:**

Quick share. Building a tool that aggregates developer intent signals (GitHub stars, issues, PRs, waitlist, eventually Discord/Linear/X) into one timeline per person, with three baseline signals: `high_intent`, `power_user`, `feature_advocate`.

For devtool founders who keep seven tabs open trying to figure out who in their audience to talk to next.

Pre-launch, waitlist-only. Real GitHub adapter is week 1 of MVP — current loop runs on mock data to validate the architecture.

Stack TypeScript-strict end-to-end (Next.js 16, Prisma, Neon, pnpm/Turbo). Repo public soon.

Waitlist: trace.dev

Curious: what's the signal you wish you could detect about your users that no current tool surfaces?
