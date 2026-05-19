import { WaitlistForm } from "@/components/waitlist-form";

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <header className="flex items-center justify-between">
        <div className="font-mono text-sm tracking-tight">
          <span className="text-[color:var(--color-accent)]">●</span>{" "}
          <span className="font-semibold">trace</span>
        </div>
        <a
          href="#waitlist"
          className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-mute)] hover:text-[color:var(--color-ink)]"
        >
          waitlist →
        </a>
      </header>

      <section className="mt-20">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
          Developer Signal Engine
        </p>
        <h1 className="mt-4 text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          Know who's about to buy.
          <br />
          <span className="text-[color:var(--color-mute)]">Before they email you.</span>
        </h1>
        <p className="mt-6 max-w-xl text-balance text-lg leading-relaxed text-[color:var(--color-mute)]">
          Developers leak intent everywhere — GitHub stars, issues, PRs, docs visits, waitlist signups.
          Trace pulls them into one live timeline and tells you who matters today.
        </p>
      </section>

      <section className="mt-20 grid gap-8 sm:grid-cols-3">
        <Feature
          step="01"
          title="Connect GitHub."
          body="Pick the repos you ship. Trace starts streaming stars, issues, PRs, and watchers in seconds."
        />
        <Feature
          step="02"
          title="See one timeline."
          body="Every signal a person leaves — across sources — collapsed into a single readable activity graph."
        />
        <Feature
          step="03"
          title="Get a daily Top 5."
          body="Three built-in signals (high intent · power user · feature advocate) surface the five people to read this morning."
        />
      </section>

      <section className="mt-20 rounded-2xl border border-[color:var(--color-line)] p-8 sm:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-mute)]">
          Why it's not a CRM
        </p>
        <p className="mt-3 text-balance text-xl leading-relaxed">
          CRMs ask you to type. Trace listens.
          <br />
          <span className="text-[color:var(--color-mute)]">
            We model Person · Event · Signal · Timeline. Priced for one developer who ships, not a sales team.
          </span>
        </p>
      </section>

      <section id="waitlist" className="mt-20">
        <h2 className="text-2xl font-semibold tracking-tight">Join the waitlist</h2>
        <p className="mt-2 text-[color:var(--color-mute)]">
          Pre-launch. First 100 builders get the founding plan.
        </p>
        <div className="mt-6">
          <WaitlistForm />
        </div>
      </section>

      <footer className="mt-24 border-t border-[color:var(--color-line)] pt-8 font-mono text-xs text-[color:var(--color-mute)]">
        <p>built by moonsu company · global indie · 2026</p>
      </footer>
    </main>
  );
}

function Feature({ step, title, body }: { step: string; title: string; body: string }) {
  return (
    <div>
      <p className="font-mono text-xs text-[color:var(--color-accent)]">{step}</p>
      <h3 className="mt-2 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-mute)]">{body}</p>
    </div>
  );
}
