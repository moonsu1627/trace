# Hacker News — Show HN

> Account: 사장님 HN account (없으면 만들어야 함)
> Time: post 06:00–08:00 PT weekday. Avoid weekends/Mondays.
> URL: trace-web-srye.vercel.app/pricing
> Title rule: starts with "Show HN: ", under 80 chars, no clickbait.

---

## Title (pick one)

A) **Show HN: Trace – a GitHub-native signal engine for devtool founders**
B) **Show HN: Trace – see which devs are about to buy, before they email you**
C) **Show HN: I killed my developer CRM and built a signal engine instead**

(추천: A. 가장 정확·검색 친화·non-clickbait.)

---

## First comment (post immediately after submission)

Hi HN — I'm Moonsu, soloing this.

I spent 17 days building a "developer CRM" before killing it. The market didn't exist the way I framed it. Solo devs don't buy CRMs — they keep a Notion board and use spreadsheets until they need a real one, then jump straight to Attio. Nothing in the middle is missing.

What *was* missing for me, building in public: a way to **see who's already trying to reach me**. Stars I don't recognize, issue comments from the same handle over three weeks, docs visits from a Pro Stripe subscriber, a waitlist signup with a GitHub bio that mentions LangChain.

Those are signals. They live in seven different tabs. No tool unifies them for a one-person team.

Trace is my attempt:

- Connect GitHub → stars, issues, PRs, watchers stream in
- Identity dedup across handles (one person, one timeline)
- Three baseline signals computed every cycle:
  - `high_intent` — multiple touchpoints in 7 days
  - `power_user` — sustained issue/PR activity
  - `feature_advocate` — repeated 👍 on the same proposal
- Inbox: today's top 5 people to read
- Cmd-K palette
- Waitlist signup as the only thing that works right now

Things it deliberately is not:
- Not a CRM. There is no Deal/Stage/Pipeline. The data model is Person · Event · Signal · Timeline.
- Not enterprise-priced. Built for one developer who ships, not a sales team.
- Not a feed. The point is to read fewer people more carefully.

Stack:
- Next.js 16 (App Router, Turbopack)
- Prisma + Postgres (Neon)
- pnpm workspace + Turborepo
- score-driven autonomous loop in TypeScript (no Python, no separate worker for v1)

What's not built yet (will lie about nothing):
- Real GitHub adapter — current loop uses mock data, real Octokit integration is week 1 of MVP
- Linear · Discord · X integrations — v1.5
- AI summarization of timelines — v2
- Multi-seat, billing, outbound automation — won't ship until 100+ waitlist signups and 5 say "must have"

Why I'm posting here pre-launch: I want feedback on the data model and the three baseline signals before I wire real ingestion. If you've ever stared at GitHub Insights and thought "I know who matters in here but I can't name them" — what would you want the daily top-5 to surface? Open to being wrong about the signals.

Waitlist: https://trace-web-srye.vercel.app/pricing

Repo: https://github.com/moonsu1627/trace

Happy to answer anything. The harder the question the better.

---

## If post takes off — followup ready

If anyone asks "why not just use Common Room / Orbit / etc":

> Common Room is enterprise-priced and built for community managers. Orbit shut down in 2023. Both started from "build a community" — I'm starting from "one developer needs to know who's about to buy." Different shape.

If anyone asks "isn't this just analytics":

> Analytics tells you what aggregates did. Trace tells you what one person did. Aggregates don't write you emails. People do.

If anyone asks "why GitHub-first":

> GitHub is the densest intent signal source devs leave: stars are bookmarks, issues are need statements, PRs are deep commitment, watchers are subscription. Linear/Discord/X are noisier in comparison — coming in v1.5 once GitHub-first works.

---

## Don't engage with

- Pricing trolls (Trace is pre-launch — pricing not decided)
- "AI hype" framing (Trace's AI module is v2, not v1)
- Reply flames — single calm reply, then disengage
