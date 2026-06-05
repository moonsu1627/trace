import Link from "next/link";
import type { Route } from "next";
import { env } from "@/lib/env";
import { PaypalSubscribeButton } from "./paypal-button";

export const metadata = {
  title: "Pricing — Trace",
  description: "Trace pricing · Apply for Pro Beta",
};

const paypalOn = env.paypalEnabled();

const TIERS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "/mo",
    description: "1 result/mo. For evaluation.",
    features: [
      "1 workspace",
      "1 GitHub connection",
      "100 signals/mo",
      "Person timeline",
    ],
    cta: { label: "Start Free", href: "/apply?tier=free" },
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9",
    period: "/mo",
    description: "For solo devs and indie hackers.",
    features: [
      "1 workspace",
      "Unlimited GitHub connections",
      "Unlimited signals",
      "Person timeline + signal rules",
      "Inbox prioritization",
      "Email alerts",
    ],
    cta: { label: "Apply for Pro Beta", href: "/apply?tier=pro" },
    highlight: true,
  },
  {
    id: "studio",
    name: "Studio",
    price: "$29",
    period: "/mo",
    description: "Teams running multiple products.",
    features: [
      "5 workspaces",
      "5 team members",
      "All Pro features",
      "Slack / Discord integrations",
      "API access",
      "Priority quota",
    ],
    cta: { label: "Apply for Studio Beta", href: "/apply?tier=studio" },
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-16">
      <header className="flex items-center justify-between">
        <Link href="/" className="font-mono text-sm tracking-tight">
          <span className="text-[color:var(--color-accent)]">●</span>{" "}
          <span className="font-semibold">trace</span>
        </Link>
        <Link
          href="/apply"
          className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-mute)] hover:text-[color:var(--color-ink)]"
        >
          Apply for Beta →
        </Link>
      </header>

      <section className="mt-16 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
          Pricing
        </p>
        <h1 className="mt-4 text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Beta applications open.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-balance text-base leading-relaxed text-[color:var(--color-mute)]">
          We're validating real demand before turning on billing. Apply to be one of
          the first 10 beta users. Prices below are anchors — we'll fine-tune after PMF.
        </p>
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-3">
        {TIERS.map((tier) => {
          // v203: PayPal 활성 + paid tier(pro·studio) → 결제 CTA. 아니면 베타 신청 fallback.
          const isPaidTier = tier.id === "pro" || tier.id === "studio";
          const usePaypal = paypalOn && isPaidTier;
          return (
            <div
              key={tier.id}
              className={`flex flex-col rounded-2xl border p-6 ${
                tier.highlight
                  ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft,transparent)]"
                  : "border-black/10 dark:border-white/10"
              }`}
            >
              <div className="mb-4">
                <h2 className="text-xl font-semibold tracking-tight">{tier.name}</h2>
                <p className="mt-1 text-sm text-[color:var(--color-mute)]">{tier.description}</p>
              </div>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">{tier.price}</span>
                <span className="text-sm text-[color:var(--color-mute)]">{tier.period}</span>
              </div>
              <ul className="mb-8 flex-1 space-y-2 text-sm">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-1 inline-block size-1.5 rounded-full bg-[color:var(--color-accent)]" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              {usePaypal ? (
                <PaypalSubscribeButton
                  tier={tier.id as "pro" | "studio"}
                  label={tier.id === "studio" ? "Subscribe to Studio" : "Subscribe to Pro"}
                  highlight={tier.highlight}
                />
              ) : (
                <Link
                  href={tier.cta.href as Route}
                  className={`block rounded-lg px-4 py-2.5 text-center font-mono text-sm font-medium transition ${
                    tier.highlight
                      ? "bg-[color:var(--color-ink)] text-[color:var(--color-bg)] hover:opacity-90"
                      : "border border-black/15 dark:border-white/15 hover:bg-black/[.04] dark:hover:bg-white/[.04]"
                  }`}
                >
                  {tier.cta.label}
                </Link>
              )}
            </div>
          );
        })}
      </section>

      <p className="mt-12 text-center text-xs text-[color:var(--color-mute)]">
        {paypalOn
          ? "Cancel anytime · billed via PayPal · invoice receipts auto-emailed"
          : "Billing starts after beta · no card required to apply · beta users get launch invite first"}
      </p>
    </main>
  );
}
