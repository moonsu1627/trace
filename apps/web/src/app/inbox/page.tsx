/* /inbox — 최근 24h 안에 활성화된 signal 상위 5개. 하루의 "주목해야 할 사람들". */

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getInbox, INBOX_TOP_N } from "@/lib/inbox";
import { SIGNAL_LABEL, type SignalKey } from "@/lib/signals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const session = await getSession();
  if (!session) redirect("/connect");

  const { items, total } = await getInbox(session.workspaceId, { take: INBOX_TOP_N });
  const shown = items.length;
  const extra = Math.max(0, total - shown);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <header className="flex items-center justify-between">
        <a href="/" className="font-mono text-sm tracking-tight">
          <span className="text-[color:var(--color-accent)]">●</span>{" "}
          <span className="font-semibold">trace</span>
        </a>
        <div className="flex gap-6">
          <a
            href="/people"
            className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-mute)] hover:text-[color:var(--color-ink)]"
          >
            people →
          </a>
          <a
            href="/connect"
            className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-mute)] hover:text-[color:var(--color-ink)]"
          >
            connect →
          </a>
        </div>
      </header>

      <section className="mt-20">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
          Inbox
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight">
          Today&apos;s top {shown || INBOX_TOP_N}
        </h1>
        <p className="mt-6 text-[color:var(--color-mute)]">
          Signals fired in the last 24 hours. The people most worth your attention.
          {extra > 0 && (
            <>
              {" "}
              <a href="/people" className="underline decoration-[color:var(--color-line)] underline-offset-4 hover:decoration-[color:var(--color-ink)]">
                +{extra} more active
              </a>
              .
            </>
          )}
        </p>

        {shown === 0 ? (
          <p className="mt-12 rounded-xl border border-[color:var(--color-line)] p-6 text-[color:var(--color-mute)]">
            No signals in the last 24 hours. Sync the connected repo to refresh.
          </p>
        ) : (
          <ul className="mt-10 divide-y divide-[color:var(--color-line)]">
            {items.map((s) => (
              <li key={s.id} className="py-4">
                <div className="flex items-baseline justify-between gap-4">
                  <a
                    href={`/people/${s.person.id}`}
                    className="font-mono text-sm font-semibold hover:opacity-70"
                  >
                    @{s.person.primaryHandle}
                    {s.person.displayName && (
                      <span className="ml-2 font-sans font-normal text-[color:var(--color-mute)]">
                        {s.person.displayName}
                      </span>
                    )}
                  </a>
                  <span className="shrink-0 font-mono text-xs text-[color:var(--color-mute)]">
                    {new Date(s.lastFiredAt).toLocaleString()}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span className="rounded-md border border-[color:var(--color-accent)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[color:var(--color-accent)]">
                    {SIGNAL_LABEL[s.key as SignalKey] ?? s.key}
                  </span>
                  <span className="text-sm text-[color:var(--color-mute)]">{s.reason}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
