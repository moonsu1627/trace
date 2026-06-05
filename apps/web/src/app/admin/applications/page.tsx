/* /admin/applications — Beta application list + KPI.
 *
 * 사장님 결정 (2026-06-01) — PMF 전 단계 단순 접근 제한.
 * Access: ?token=<ADMIN_TOKEN> (env). 사장님만 접근.
 * KPI: total applications · paying-intent ratio ($9+) · first-10 paying gate.
 */

import { redirect } from "next/navigation";
import { prisma } from "@trace/db";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface AdminPageProps {
  searchParams: Promise<{ token?: string }>;
}

const BUDGET_LABEL: Record<string, string> = {
  zero: "$0",
  small: "$5",
  standard: "$9",
  high: "$19+",
};

const BUDGET_ORDER: Record<string, number> = {
  zero: 0,
  small: 5,
  standard: 9,
  high: 19,
};

export default async function AdminApplicationsPage(props: AdminPageProps) {
  const sp = await props.searchParams;
  let expected: string;
  try {
    expected = env.adminToken();
  } catch {
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-6 py-16">
        <h1 className="text-2xl font-semibold">Setup required</h1>
        <p className="mt-2 text-sm text-[color:var(--color-mute)]">
          Set the <code>ADMIN_TOKEN</code> env var before accessing this page.
        </p>
      </main>
    );
  }

  if (!sp.token || sp.token !== expected) {
    redirect("/");
  }

  const apps = await prisma.betaApplication.findMany({
    orderBy: { createdAt: "desc" },
  });

  const total = apps.length;
  const paying = apps.filter(
    (a) => (BUDGET_ORDER[a.monthlyBudget] ?? 0) >= 9,
  ).length;
  const payingPct = total > 0 ? Math.round((paying / total) * 100) : 0;
  const byBudget = apps.reduce<Record<string, number>>((acc, a) => {
    acc[a.monthlyBudget] = (acc[a.monthlyBudget] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-12">
      <header className="flex items-center justify-between">
        <h1 className="font-mono text-sm tracking-tight">
          <span className="text-[color:var(--color-accent)]">●</span> admin / applications
        </h1>
        <a
          href="/"
          className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-mute)]"
        >
          ← landing
        </a>
      </header>

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        <KPI label="Total applications" value={String(total)} />
        <KPI
          label="$9+ paying intent"
          value={`${paying} / ${total}`}
          sub={`${payingPct}%`}
        />
        <KPI
          label="Paying-user goal"
          value={`${paying} / 10`}
          sub={paying >= 10 ? "✓ PMF gate cleared" : `${10 - paying} to go`}
        />
      </section>

      <section className="mt-12">
        <h2 className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-mute)]">
          Budget distribution
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(["zero", "small", "standard", "high"] as const).map((k) => (
            <div
              key={k}
              className="rounded-lg border border-black/10 px-4 py-3 dark:border-white/10"
            >
              <div className="font-mono text-xs uppercase text-[color:var(--color-mute)]">
                {BUDGET_LABEL[k]}
              </div>
              <div className="mt-1 text-2xl font-semibold">{byBudget[k] ?? 0}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-mute)]">
          Applicants ({total})
        </h2>
        {total === 0 ? (
          <p className="mt-4 text-sm text-[color:var(--color-mute)]">
            No applicants yet. Point marketing CTAs at /pricing.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-black/[.03] text-left text-xs uppercase tracking-wider text-[color:var(--color-mute)] dark:bg-white/[.03]">
                <tr>
                  <th className="px-4 py-2.5">Name</th>
                  <th className="px-4 py-2.5">Email</th>
                  <th className="px-4 py-2.5">Budget</th>
                  <th className="px-4 py-2.5">Current tool</th>
                  <th className="px-4 py-2.5">Biggest pain</th>
                  <th className="px-4 py-2.5">Applied</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((a) => (
                  <tr
                    key={a.id}
                    className="border-t border-black/5 dark:border-white/5"
                  >
                    <td className="px-4 py-2.5">{a.name}</td>
                    <td className="px-4 py-2.5">
                      <a
                        href={`mailto:${a.email}`}
                        className="text-[color:var(--color-accent)] hover:underline"
                      >
                        {a.email}
                      </a>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={
                          (BUDGET_ORDER[a.monthlyBudget] ?? 0) >= 9
                            ? "font-semibold text-[color:var(--color-accent)]"
                            : ""
                        }
                      >
                        {BUDGET_LABEL[a.monthlyBudget]}
                      </span>
                    </td>
                    <td className="max-w-[160px] truncate px-4 py-2.5" title={a.currentTool ?? ""}>
                      {a.currentTool ?? "—"}
                    </td>
                    <td className="max-w-[240px] truncate px-4 py-2.5" title={a.biggestPain ?? ""}>
                      {a.biggestPain ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-xs text-[color:var(--color-mute)]">
                      {a.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function KPI({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-black/10 px-5 py-4 dark:border-white/10">
      <div className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-mute)]">
        {label}
      </div>
      <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
      {sub && (
        <div className="mt-1 text-xs text-[color:var(--color-mute)]">{sub}</div>
      )}
    </div>
  );
}
