"use client";

/* /people/[id]의 "merge into…" 액션 — 같은 사람인데 두 Person으로 쪼개진 경우
 * 현재 Person을 다른 Person으로 합쳐 사라지게 한다(현재가 source, 선택이 target).
 * /api/search/people에서 후보를 받아 입력 필터링 → /api/people/merge POST. */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Candidate {
  id: string;
  primaryHandle: string;
  displayName: string | null;
}

interface Props {
  sourceId: string;
  sourceHandle: string;
}

export function MergeAction({ sourceId, sourceHandle }: Props) {
  const [open, setOpen] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Candidate | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open || candidates !== null) return;
    let cancelled = false;
    fetch("/api/search/people")
      .then(async (r) => {
        if (cancelled) return;
        if (!r.ok) {
          setCandidates([]);
          return;
        }
        const data = (await r.json()) as { people: Candidate[] };
        setCandidates(data.people.filter((p) => p.id !== sourceId));
      })
      .catch(() => {
        if (!cancelled) setCandidates([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open, candidates, sourceId]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    setQuery("");
    setPicked(null);
    setError(null);
  }

  async function submit() {
    if (!picked || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/people/merge", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetId: picked.id, sourceId }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Merge failed.");
        setSubmitting(false);
        return;
      }
      router.replace(`/people/${picked.id}`);
      router.refresh();
    } catch {
      setError("Merge failed.");
      setSubmitting(false);
    }
  }

  const q = query.toLowerCase().trim();
  const filtered = (candidates ?? []).filter(
    (p) =>
      !q ||
      p.primaryHandle.toLowerCase().includes(q) ||
      (p.displayName?.toLowerCase().includes(q) ?? false),
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-mute)] hover:text-[color:var(--color-ink)]"
      >
        merge into…
      </button>

      {open && (
        <div
          onClick={close}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-24"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-paper)] shadow-2xl"
          >
            <div className="border-b border-[color:var(--color-line)] px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-[color:var(--color-mute)]">
              Merge @{sourceHandle} into another person
            </div>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPicked(null);
              }}
              placeholder="Search people…"
              className="w-full border-0 bg-transparent px-5 py-4 font-mono text-sm outline-none placeholder:text-[color:var(--color-mute)]"
            />
            <div className="border-t border-[color:var(--color-line)]">
              {candidates === null ? (
                <p className="px-5 py-6 font-mono text-sm text-[color:var(--color-mute)]">
                  Loading…
                </p>
              ) : filtered.length === 0 ? (
                <p className="px-5 py-6 font-mono text-sm text-[color:var(--color-mute)]">
                  No matches.
                </p>
              ) : (
                <ul className="max-h-72 overflow-y-auto">
                  {filtered.slice(0, 50).map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => setPicked(p)}
                        className={`flex w-full items-baseline justify-between gap-4 px-5 py-3 text-left font-mono text-sm ${
                          picked?.id === p.id ? "bg-[color:var(--color-accent-soft)]" : ""
                        }`}
                      >
                        <span className="font-semibold">@{p.primaryHandle}</span>
                        {p.displayName && (
                          <span className="font-sans text-xs text-[color:var(--color-mute)]">
                            {p.displayName}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex items-center justify-between gap-3 border-t border-[color:var(--color-line)] px-5 py-3">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[color:var(--color-mute)]">
                  {error ? (
                    <span className="text-red-500">{error}</span>
                  ) : picked ? (
                    <>
                      @{sourceHandle} → @{picked.primaryHandle} · this cannot be undone
                    </>
                  ) : (
                    "pick a person to merge into"
                  )}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-md border border-[color:var(--color-line)] px-3 py-1 font-mono text-xs hover:border-[color:var(--color-ink)]"
                  >
                    cancel
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={!picked || submitting}
                    className="rounded-md border border-[color:var(--color-accent)] px-3 py-1 font-mono text-xs text-[color:var(--color-accent)] disabled:opacity-40"
                  >
                    {submitting ? "merging…" : "merge"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
