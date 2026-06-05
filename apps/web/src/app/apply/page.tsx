import Link from "next/link";
import { ApplyForm } from "./apply-form";

export const metadata = {
  title: "Apply for Beta — Trace",
  description: "Validating real demand · no card required",
};

interface ApplyPageProps {
  searchParams: Promise<{ tier?: string }>;
}

export default async function ApplyPage(props: ApplyPageProps) {
  const sp = await props.searchParams;
  const tier = sp.tier === "studio" ? "studio" : sp.tier === "free" ? "free" : "pro";
  const tierLabel =
    tier === "studio" ? "Studio Beta" : tier === "free" ? "Free Tier" : "Pro Beta";

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-16">
      <header className="flex items-center justify-between">
        <Link href="/" className="font-mono text-sm tracking-tight">
          <span className="text-[color:var(--color-accent)]">●</span>{" "}
          <span className="font-semibold">trace</span>
        </Link>
        <Link
          href="/pricing"
          className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-mute)] hover:text-[color:var(--color-ink)]"
        >
          ← Pricing
        </Link>
      </header>

      <section className="mt-12">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
          {tierLabel} Application
        </p>
        <h1 className="mt-4 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          Tell us who'd actually use this.
        </h1>
        <p className="mt-4 max-w-xl text-balance text-base leading-relaxed text-[color:var(--color-mute)]">
          We're inviting the first 10 beta users before turning on billing.
          No card required. Your current tools, biggest pain, and willing-to-pay
          number help us prioritize features and price the right tier.
        </p>
      </section>

      <ApplyForm defaultTier={tier} />
    </main>
  );
}
