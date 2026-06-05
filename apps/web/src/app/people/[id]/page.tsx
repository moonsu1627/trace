/* /people/[id] — Person 상세 + 활성 signal 배지 + 활동 타임라인. */

import { notFound, redirect } from "next/navigation";
import { prisma } from "@trace/db";
import { getSession } from "@/lib/session";
import { SIGNAL_LABEL, type SignalKey } from "@/lib/signals";
import { MergeAction } from "./merge-action";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface EventPayload {
  number?: number;
  title?: string;
  repo?: string;
}

const KEY_LABEL: Record<string, string> = {
  "github.star": "starred the repo",
  "github.unstar": "unstarred",
  "github.issue_opened": "opened issue",
  "github.issue_commented": "commented on an issue",
  "github.pr_opened": "opened pull request",
  "github.pr_commented": "commented on a pull request",
  "github.watch": "watched the repo",
  "waitlist.signup": "joined the waitlist",
};

export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/connect");

  const person = await prisma.person.findUnique({
    where: { id },
    include: {
      identities: true,
      signals: { where: { status: "active" } },
      _count: { select: { events: true } },
    },
  });
  if (!person || person.workspaceId !== session.workspaceId) notFound();

  const events = await prisma.event.findMany({
    where: { workspaceId: session.workspaceId, personId: id },
    orderBy: { occurredAt: "desc" },
    take: 100,
  });
  const totalEvents = person._count.events;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <header className="flex items-center justify-between">
        <a href="/" className="font-mono text-sm tracking-tight">
          <span className="text-[color:var(--color-accent)]">●</span>{" "}
          <span className="font-semibold">trace</span>
        </a>
        <div className="flex gap-6">
          <MergeAction sourceId={person.id} sourceHandle={person.primaryHandle} />
          <a
            href="/people"
            className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-mute)] hover:text-[color:var(--color-ink)]"
          >
            ← people
          </a>
        </div>
      </header>

      <section className="mt-20">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
          Person
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight">
          @{person.primaryHandle}
        </h1>
        <div className="mt-4 flex flex-wrap gap-3 font-mono text-xs text-[color:var(--color-mute)]">
          <span>first seen {new Date(person.firstSeenAt).toLocaleDateString()}</span>
          <span>·</span>
          <span>last seen {new Date(person.lastSeenAt).toLocaleDateString()}</span>
          <span>·</span>
          <span>
            {totalEvents} {totalEvents === 1 ? "event" : "events"}
          </span>
        </div>

        {person.signals.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {person.signals.map((s) => (
              <span
                key={s.id}
                title={s.reason}
                className="rounded-md border border-[color:var(--color-accent)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[color:var(--color-accent)]"
              >
                {SIGNAL_LABEL[s.key as SignalKey] ?? s.key}
              </span>
            ))}
          </div>
        )}

        {person.identities.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {person.identities.map((identity) => (
              <a
                key={identity.id}
                href={identity.url ?? "#"}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-[color:var(--color-line)] px-3 py-1 font-mono text-xs hover:border-[color:var(--color-accent)]"
              >
                {identity.source}: @{identity.handle}
              </a>
            ))}
          </div>
        )}

        <h2 className="mt-12 font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-mute)]">
          Timeline
        </h2>
        {events.length === 0 ? (
          <p className="mt-4 text-[color:var(--color-mute)]">No signals yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[color:var(--color-line)]">
            {events.map((e) => {
              const label = KEY_LABEL[e.key] ?? e.key;
              const payload = e.payload as EventPayload | null;
              const detail =
                payload?.number !== undefined
                  ? ` #${payload.number}${payload.title ? ` — ${payload.title}` : ""}`
                  : "";
              return (
                <li key={e.id} className="py-3">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-sm">
                      {label}
                      {detail && (
                        <span className="text-[color:var(--color-mute)]">{detail}</span>
                      )}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-[color:var(--color-mute)]">
                      {new Date(e.occurredAt).toLocaleString()}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
