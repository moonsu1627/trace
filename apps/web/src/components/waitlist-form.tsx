"use client";

import { useState } from "react";

type State =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "error"; message: string };

export function WaitlistForm() {
  const [state, setState] = useState<State>({ status: "idle" });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      email: String(data.get("email") ?? "").trim(),
      githubLogin: String(data.get("githubLogin") ?? "").trim() || undefined,
      note: String(data.get("note") ?? "").trim() || undefined,
    };

    setState({ status: "submitting" });
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setState({ status: "error", message: body?.error ?? `HTTP ${res.status}` });
        return;
      }
      form.reset();
      setState({ status: "success" });
    } catch (err) {
      setState({ status: "error", message: err instanceof Error ? err.message : "Network error" });
    }
  }

  if (state.status === "success") {
    return (
      <div className="rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-accent-soft)] p-6 font-mono text-sm text-[color:var(--color-accent)]">
        ✓ You're on the list. We'll email you when the founding plan opens.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:max-w-xl">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          name="email"
          type="email"
          required
          placeholder="you@dev.tools"
          className="flex-1 rounded-lg border border-[color:var(--color-line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--color-accent)]"
        />
        <input
          name="githubLogin"
          type="text"
          placeholder="github login (optional)"
          className="rounded-lg border border-[color:var(--color-line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--color-accent)] sm:w-56"
        />
      </div>
      <input
        name="note"
        type="text"
        placeholder="one thing you'd want Trace to tell you (optional)"
        className="rounded-lg border border-[color:var(--color-line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--color-accent)]"
      />
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={state.status === "submitting"}
          className="rounded-lg bg-[color:var(--color-ink)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {state.status === "submitting" ? "Joining…" : "Join the waitlist"}
        </button>
        {state.status === "error" && (
          <p className="font-mono text-xs text-red-600">{state.message}</p>
        )}
      </div>
    </form>
  );
}
