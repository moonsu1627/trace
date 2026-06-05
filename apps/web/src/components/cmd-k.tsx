"use client";

/* components/cmd-k.tsx — Cmd+K(또는 Ctrl+K) 빠른 탐색 팔레트.
 * 글로벌 키 리스너 등록 → 모달 토글 → /api/search/people 호출(lazy)
 * → 입력 필터 + 키보드(↑↓⏎) 네비 → router.push로 /people/[id] 이동. */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Person {
  id: string;
  primaryHandle: string;
  displayName: string | null;
}

export function CmdKPalette() {
  const [open, setOpen] = useState(false);
  const [people, setPeople] = useState<Person[] | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // ⌘K / Ctrl+K 토글, Esc 닫기.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // 첫 open 시점에만 fetch. 이후는 캐시.
  useEffect(() => {
    if (!open || people !== null) return;
    let cancelled = false;
    fetch("/api/search/people")
      .then(async (r) => {
        if (cancelled) return;
        if (r.status === 401) {
          setAuthed(false);
          setPeople([]);
          return;
        }
        const data = (await r.json()) as { people: Person[] };
        setAuthed(true);
        setPeople(data.people);
      })
      .catch(() => {
        if (cancelled) return;
        setAuthed(true);
        setPeople([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open, people]);

  // open/query 바뀌면 선택 0으로 리셋, input 포커스.
  useEffect(() => {
    setSelected(0);
  }, [query, open]);
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const q = query.toLowerCase().trim();
  const filtered = (people ?? []).filter(
    (p) =>
      !q ||
      p.primaryHandle.toLowerCase().includes(q) ||
      (p.displayName?.toLowerCase().includes(q) ?? false),
  );

  function go(id: string) {
    setOpen(false);
    router.push(`/people/${id}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, Math.max(filtered.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = filtered[selected];
      if (pick) go(pick.id);
    }
  }

  return (
    <div
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-24"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-paper)] shadow-2xl"
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search people…"
          className="w-full border-0 bg-transparent px-5 py-4 font-mono text-sm outline-none placeholder:text-[color:var(--color-mute)]"
        />
        <div className="border-t border-[color:var(--color-line)]">
          {authed === false ? (
            <p className="px-5 py-6 font-mono text-sm text-[color:var(--color-mute)]">
              Sign in to search.{" "}
              <a href="/connect" className="underline">
                Go to connect →
              </a>
            </p>
          ) : people === null ? (
            <p className="px-5 py-6 font-mono text-sm text-[color:var(--color-mute)]">
              Loading…
            </p>
          ) : filtered.length === 0 ? (
            <p className="px-5 py-6 font-mono text-sm text-[color:var(--color-mute)]">
              No people match.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {filtered.map((p, i) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => go(p.id)}
                    onMouseEnter={() => setSelected(i)}
                    className={`flex w-full items-baseline justify-between gap-4 px-5 py-3 text-left font-mono text-sm ${
                      i === selected ? "bg-[color:var(--color-accent-soft)]" : ""
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
          <div className="border-t border-[color:var(--color-line)] px-5 py-2 font-mono text-[10px] uppercase tracking-wider text-[color:var(--color-mute)]">
            ⌘K toggle · ↑↓ navigate · ⏎ open · esc close
          </div>
        </div>
      </div>
    </div>
  );
}
