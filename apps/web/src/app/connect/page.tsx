/* /connect — GitHub 연결 흐름. 한 페이지가 4가지 상태를 처리:
 *   (1) 미로그인 → Connect GitHub 버튼
 *   (2) 로그인·integration 없음 → 재연결 (edge case)
 *   (3) 로그인·repo 미선택 (또는 ?repick=1) → repo picker
 *   (4) 로그인·repo 선택됨 → 추적 중 표시 */

import { prisma } from "@trace/db";
import { getSession } from "@/lib/session";
import { decryptToken } from "@/lib/crypto";
import { env } from "@/lib/env";
import { listUserRepos } from "@/lib/github";
import { RepoPicker, type RepoItem } from "./repo-picker";
import { SyncButton } from "./sync-button";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  oauth_state: "Sign-in expired or was tampered with. Try again.",
  oauth_failed: "GitHub sign-in failed. Try again.",
  repo_fetch: "Could not load your repositories from GitHub.",
};

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; repick?: string }>;
}) {
  const { error, repick } = await searchParams;
  const session = await getSession();

  // (1) 미로그인
  if (!session) {
    return (
      <Shell>
        <Eyebrow>Step 01</Eyebrow>
        <Title>Connect your GitHub</Title>
        <Lead>
          Trace reads stars, issues, PRs, and watchers from a repo you choose —
          and turns them into a live timeline of who matters.
        </Lead>
        {error && <ErrorNote>{ERROR_MESSAGES[error] ?? "Something went wrong."}</ErrorNote>}
        <a href="/api/auth/github" className={buttonClass}>
          Connect GitHub →
        </a>
      </Shell>
    );
  }

  const integration = await prisma.integration.findFirst({
    where: { workspaceId: session.workspaceId, source: "github" },
  });

  // (2) integration 없음 — 정상 흐름이면 안 생기는 상태. 재연결 안내.
  if (!integration) {
    return (
      <Shell>
        <Title>Reconnect GitHub</Title>
        <Lead>Your GitHub connection is missing. Reconnect to continue.</Lead>
        <a href="/api/auth/github" className={buttonClass}>
          Reconnect GitHub →
        </a>
      </Shell>
    );
  }

  const trackedRepo =
    (integration.metadata as { trackedRepo?: string } | null)?.trackedRepo ?? null;

  // (4) repo 선택 완료
  if (trackedRepo && !repick) {
    return (
      <Shell>
        <Eyebrow>Connected</Eyebrow>
        <Title>You&apos;re tracking a repo</Title>
        <p className="mt-6 rounded-xl border border-[color:var(--color-line)] p-5 font-mono text-sm">
          <span className="text-[color:var(--color-accent)]">●</span>{" "}
          <span className="font-semibold">{trackedRepo}</span>
        </p>
        <Lead>
          Pull the latest stars, issues, pull requests, and watchers from this
          repo into your activity timeline.
        </Lead>
        <SyncButton />
        <div>
          <a href="/inbox" className={linkClass}>
            Today&apos;s inbox →
          </a>
        </div>
        <div>
          <a href="/people" className={linkClass}>
            View people →
          </a>
        </div>
        <div>
          <a href="/connect?repick=1" className={linkClass}>
            Pick a different repo →
          </a>
        </div>
      </Shell>
    );
  }

  // (3) repo picker
  let repos: RepoItem[];
  try {
    const token = decryptToken(integration.encryptedToken, env.tokenKey());
    const raw = await listUserRepos(token);
    repos = raw.map((r) => ({
      fullName: r.full_name,
      isPrivate: r.private,
      stars: r.stargazers_count,
      description: r.description,
    }));
  } catch (err) {
    console.error("[connect] repo fetch failed", err);
    return (
      <Shell>
        <Title>Could not load repositories</Title>
        <ErrorNote>{ERROR_MESSAGES.repo_fetch}</ErrorNote>
        <a href="/api/auth/github" className={buttonClass}>
          Reconnect GitHub →
        </a>
      </Shell>
    );
  }

  return (
    <Shell>
      <Eyebrow>Step 02</Eyebrow>
      <Title>Pick a repo to track</Title>
      <Lead>Choose the repo you ship. You can change this anytime.</Lead>
      <div className="mt-8">
        <RepoPicker repos={repos} />
      </div>
    </Shell>
  );
}

// ── presentational helpers ────────────────────────────────────────────────────

const buttonClass =
  "mt-8 inline-block rounded-lg border border-[color:var(--color-line)] px-5 py-2.5 font-mono text-sm font-semibold hover:border-[color:var(--color-accent)]";
const linkClass =
  "mt-8 inline-block font-mono text-xs uppercase tracking-wider text-[color:var(--color-mute)] hover:text-[color:var(--color-ink)]";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <header className="flex items-center justify-between">
        <a href="/" className="font-mono text-sm tracking-tight">
          <span className="text-[color:var(--color-accent)]">●</span>{" "}
          <span className="font-semibold">trace</span>
        </a>
      </header>
      <section className="mt-20">{children}</section>
    </main>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
      {children}
    </p>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.05] tracking-tight">
      {children}
    </h1>
  );
}

function Lead({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-6 max-w-xl text-balance text-lg leading-relaxed text-[color:var(--color-mute)]">
      {children}
    </p>
  );
}

function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-6 rounded-lg border border-[color:var(--color-accent)] p-3 font-mono text-sm text-[color:var(--color-accent)]">
      {children}
    </p>
  );
}
