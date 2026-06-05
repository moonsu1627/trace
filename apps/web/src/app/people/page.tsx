/* /people — 워크스페이스의 Person 목록 + 활성 signal 배지. */

import { redirect } from "next/navigation";
import { prisma } from "@trace/db";
import { getSession } from "@/lib/session";
import { SIGNAL_LABEL, type SignalKey } from "@/lib/signals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PeoplePage() {
  const session = await getSession();
  if (!session) redirect("/connect");

  const people = await prisma.person.findMany({
    where: { workspaceId: session.workspaceId },
    orderBy: { lastSeenAt: "desc" },
    take: 100,
    include: {
      _count: { select: { events: true } },
      signals: { where: { status: "active" } },
    },
  });

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <header className="flex items-center justify-between">
        <a href="/" className="font-mono text-sm tracking-tight">
          <span className="text-[color:var(--color-accent)]">●</span>{" "}
          <span className="font-semibold">trace</span>
        </a>
        <div className="flex gap-6">
          <a
            href="/inbox"
            className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-mute)] hover:text-[color:var(--color-ink)]"
          >
            inbox →
          </a>
          <a
            href="/connect"
            className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-mute)] hover:text-[color:var(--color-ink)]"
          >
            ← connect
          </a>
        </div>
      </header>

      <section className="mt-20">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
          People
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight">
          {people.length === 0 ? "No people yet" : `${people.length} people`}
        </h1>
        <p className="mt-6 text-[color:var(--color-mute)]">
          {people.length === 0
            ? "Sync the connected repo to see who's leaving signals."
            : "Sorted by most recent activity. Badges show active signals."}
        </p>

        {people.length > 0 && (
          <ul className="mt-10 divide-y divide-[color:var(--color-line)]">
            {people.map((p) => (
              <li key={p.id}>
                <a href={`/people/${p.id}`} className="block py-4 hover:opacity-70">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="min-w-0">
                      <span className="font-mono text-sm font-semibold">
                        @{p.primaryHandle}
                      </span>
                      {p.displayName && (
                        <span className="ml-3 text-sm text-[color:var(--color-mute)]">
                          {p.displayName}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-[color:var(--color-mute)]">
                      {p._count.events} {p._count.events === 1 ? "event" : "events"} ·{" "}
                      {new Date(p.lastSeenAt).toLocaleDateString()}
                    </span>
                  </div>
                  {p.signals.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {p.signals.map((s) => (
                        <span
                          key={s.id}
                          className="rounded-md border border-[color:var(--color-accent)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[color:var(--color-accent)]"
                        >
                          {SIGNAL_LABEL[s.key as SignalKey] ?? s.key}
                        </span>
                      ))}
                    </div>
                  )}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
