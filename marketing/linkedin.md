# LinkedIn — Launch Post

> Account: 사장님 LinkedIn
> Time: Tue–Thu, 08:00–10:00 KST (overlap with US morning)
> Length: ~1300 chars (LinkedIn truncates after ~210, so first 2 lines must hook)
> No external link in main body (LinkedIn deprioritizes). Drop link in first comment.

---

## Post body

I killed my own SaaS after 17 days.

Not because of bad code. Because I was building a product for a market that doesn't exist.

For two weeks I was shipping a "developer CRM" — a lighter HubSpot for solo developers. The problem: solo developers don't buy CRMs. They run on Notion until they outgrow it, then they jump straight to Attio. There is no middle for a new entrant to occupy.

But the thing I kept doing during those 17 days, obsessively, was something else:

→ checking GitHub traffic
→ exporting waitlist CSVs
→ searching my domain on X
→ scanning Linear comments for the same handle

Not "managing a pipeline." Just trying to see **who was paying attention**.

That, I realized, is a different product. It's a signal engine, not a CRM.

So I rebuilt as Trace.

The data model:
Person → Event → Signal → Timeline

What it shows you:
5 people every morning, surfaced by 3 rule-based signals (high intent · power user · feature advocate). Not a feed. Not a dashboard. A short list.

What it deliberately is not:
Not a CRM. Not enterprise-priced. Not a multi-seat tool. Trace is for the one developer who ships, not a sales team that types.

Three lessons from killing v1 to start v2:

1. The category matters more than the product. "Developer CRM" is a graveyard. I should have checked the graveyard first.

2. Forbidden-words lists are a feature. Before the rebuild I wrote down what Trace cannot say: Contact, Deal, Stage, Pipeline, lead. The schema can't drift back into sales-team land if the vocabulary blocks it.

3. Build the operating substrate, not just the product. Half my time the first week of the rebuild was rebuilding the autonomous loop so it stops repeating its own decisions back to itself. Sounds like overengineering. It is the difference between a tool that learns and a tool that hallucinates.

Pre-launch, waitlist-only. First 100 builders get the founding plan.

(Link in the comments.)

---

## First comment (drop link here)

🔗 trace.dev

GitHub: github.com/moonsu1627/trace (public soon)

If you've ever stared at GitHub Insights, your waitlist CSV, and your Stripe customer list in three different tabs trying to figure out who matters today — let me know. Looking for the first 20 signups to tell me which of the three baseline signals is wrong.

---

## Hashtags (use only 3 — LinkedIn algorithm prefers focus)
#buildinpublic #saas #developertools
