# Product Hunt — Launch

> Account: 사장님 PH account
> Hunter: 본인 (self-launch OK on PH)
> Launch date: Tuesday/Wednesday/Thursday 12:01 AM PT for full 24h cycle
> Cover GIF: TODO — 15s loop of landing → form submit → confirmation
> Maker comment: post immediately after launch

---

## Name
**Trace**

## Tagline (60 char limit)
**Know who's about to buy. Before they email you.**

(Alt 1: "GitHub-native signal engine for devtool founders.")
(Alt 2: "See which devs are paying attention. Across every source.")

## Description (260 char limit on PH)

> Trace pulls GitHub stars, issues, PRs, and waitlist signals into one live timeline per person. Three baseline signals (high intent · power user · feature advocate) surface the 5 people you should talk to today. Built for solo devs, indie hackers, AI builders.

## First comment (Maker post, immediately after launch)

Hi Product Hunt 👋

I'm Moonsu, soloing this. Long version of why Trace exists:

I built a "developer CRM" first. Killed it on day 17 because solo devs don't buy CRMs — they live in Notion until they need Attio, and there's no middle.

But the thing I kept doing during those 17 days, obsessively, was checking GitHub traffic, exporting waitlist CSVs, and searching for my domain on X. Not to manage a pipeline. To **see who was already paying attention**.

That's a different product. It's a signal engine, not a CRM.

Trace's data model is intentionally not Contact/Deal/Stage. It's Person → Event → Signal → Timeline. The forbidden-words list is in the repo.

**What ships day one of MVP (4–6 weeks from this post):**
- GitHub OAuth + stars, issues, PRs, watchers ingestion
- Identity dedup across handles (one person, one timeline)
- Three baseline signals: `high_intent`, `power_user`, `feature_advocate`
- Inbox: 5 people to talk to today
- Cmd-K palette

**What's deliberately not v1:** Linear · Discord · X · AI summarization · multi-seat · outbound · billing. Those ship only after 100 waitlist signups produce 5 must-haves.

**Stack:** Next.js 16 + Prisma + Neon Postgres + pnpm workspace + Turborepo. TypeScript strict.

**Honest about what's live today:** landing + waitlist API + database. Real GitHub adapter is week 1 of MVP — the autonomous loop currently runs on mock data so the architecture can be validated. Going from mock to real is intentional sequencing.

**What I'd love from you:**
- If you build a devtool: which signals do you wish you could see about your users that nothing surfaces today?
- If you've used Common Room, Orbit, or rolled your own SQL: what worked, what didn't?
- If you're a solo dev with a waitlist: would seeing 5 names every morning change your behavior?

First 100 waitlist signups get the founding plan. Pricing decided after I see who shows up.

— Moonsu (@moonsu1627)

## Tags
- Developer Tools
- SaaS
- Productivity
- Startup
- Open Source (if repo public on launch)

## Topics
- Developer Tools (primary)
- SaaS
- Productivity

## Gallery (recommended order)
1. Hero shot — landing page H1
2. Inbox view (mock for now)
3. Person timeline view (mock for now)
4. Signal explanation card
5. Architecture diagram (Person · Event · Signal · Timeline)
6. (Optional) Founder photo + one-line

## Pricing display on PH
- **Free during pre-launch / waitlist**
- Price tier set after first 100 signups

## Maker check-in messages (for the 24h window)

**Hour 2:** "Quick update — thanks for the early upvotes. Replying to every comment. The signal-vs-CRM framing seems to land — let me know if it doesn't for you."

**Hour 8:** "Mid-day check — top question is 'how is this different from Common Room?' Short version: Common Room is enterprise-priced and community-team-shaped. Trace is for one developer who ships."

**Hour 20:** "Closing the day — thanks everyone. Replies still open. If you signed up to the waitlist, you'll get a note before the founding plan opens. Cheers."
