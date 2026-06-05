"use client";

/* connect/repo-picker.tsx — repo 목록에서 하나 골라 /api/repo/select에 POST. */

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface RepoItem {
  fullName: string;
  isPrivate: boolean;
  stars: number;
  description: string | null;
}

export function RepoPicker({ repos }: { repos: RepoItem[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function pick(repo: string) {
    setBusy(repo);
    setError(null);
    try {
      const res = await fetch("/api/repo/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Could not select repo.");
      }
      // 깨끗한 /connect로 이동 — ?repick=1을 떨궈 "추적 중" 화면이 뜨게 한다.
      router.replace("/connect");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not select repo.");
      setBusy(null);
    }
  }

  if (repos.length === 0) {
    return (
      <p className="text-[color:var(--color-mute)]">
        No repositories found on your GitHub account.
      </p>
    );
  }

  return (
    <div>
      {error && (
        <p className="mb-4 font-mono text-sm text-[color:var(--color-accent)]">
          {error}
        </p>
      )}
      <ul className="divide-y divide-[color:var(--color-line)]">
        {repos.map((repo) => (
          <li key={repo.fullName}>
            <button
              type="button"
              onClick={() => pick(repo.fullName)}
              disabled={busy !== null}
              className="flex w-full items-baseline justify-between gap-4 py-3 text-left disabled:opacity-50"
            >
              <span className="min-w-0">
                <span className="font-mono text-sm font-semibold">
                  {repo.fullName}
                </span>
                {repo.isPrivate && (
                  <span className="ml-2 font-mono text-xs text-[color:var(--color-mute)]">
                    private
                  </span>
                )}
                {repo.description && (
                  <span className="mt-0.5 block truncate text-sm text-[color:var(--color-mute)]">
                    {repo.description}
                  </span>
                )}
              </span>
              <span className="shrink-0 font-mono text-xs text-[color:var(--color-mute)]">
                {busy === repo.fullName ? "saving…" : `★ ${repo.stars}`}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
