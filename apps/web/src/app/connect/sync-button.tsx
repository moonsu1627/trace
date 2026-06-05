"use client";

/* connect/sync-button.tsx — 추적 repo의 GitHub 신호를 수동 수집. /api/ingest 호출. */

import { useState } from "react";

type State = "idle" | "syncing" | "done" | "error";

interface SyncResult {
  error?: string;
  eventsIngested?: number;
  eventsScanned?: number;
  peopleSeen?: number;
  newIdentities?: number;
  totals?: { people: number; identities: number; events: number; signals: number };
}

export function SyncButton() {
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function sync() {
    setState("syncing");
    setMessage(null);
    try {
      const res = await fetch("/api/ingest", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as SyncResult;
      if (!res.ok) throw new Error(data.error ?? "Sync failed.");
      setState("done");
      const t = data.totals;
      setMessage(
        `${data.eventsIngested ?? 0} new events (${data.eventsScanned ?? 0} scanned).` +
          (t
            ? ` Tracking ${t.people} people · ${t.identities} identities · ${t.events} events · ${t.signals} active signals.`
            : ""),
      );
    } catch (e) {
      setState("error");
      setMessage(e instanceof Error ? e.message : "Sync failed.");
    }
  }

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={sync}
        disabled={state === "syncing"}
        className="rounded-lg border border-[color:var(--color-line)] px-5 py-2.5 font-mono text-sm font-semibold hover:border-[color:var(--color-accent)] disabled:opacity-50"
      >
        {state === "syncing" ? "Syncing…" : "Sync now"}
      </button>
      {message && (
        <p
          className={`mt-3 font-mono text-sm ${
            state === "error"
              ? "text-[color:var(--color-accent)]"
              : "text-[color:var(--color-mute)]"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
