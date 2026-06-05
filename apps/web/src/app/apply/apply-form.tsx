"use client";

import { useState } from "react";

interface ApplyFormProps {
  defaultTier: string;
}

const BUDGETS = [
  { value: "zero", label: "$0" },
  { value: "small", label: "$5" },
  { value: "standard", label: "$9" },
  { value: "high", label: "$19+" },
];

export function ApplyForm({ defaultTier }: ApplyFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    const data = new FormData(e.currentTarget);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      currentTool: String(data.get("currentTool") ?? "").trim(),
      biggestPain: String(data.get("biggestPain") ?? "").trim(),
      monthlyBudget: String(data.get("monthlyBudget") ?? "standard"),
      tier: defaultTier,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
    };

    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="mt-12 rounded-2xl border border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft,transparent)] p-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Application received ✓</h2>
        <p className="mt-3 text-base text-[color:var(--color-mute)]">
          We'll email an invite when beta opens. First 10 applicants prioritized.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-mute)]">Name</span>
        <input
          name="name"
          required
          autoComplete="name"
          className="rounded-lg border border-black/15 bg-transparent px-4 py-2.5 text-base outline-none focus:border-[color:var(--color-accent)] dark:border-white/15"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-mute)]">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-lg border border-black/15 bg-transparent px-4 py-2.5 text-base outline-none focus:border-[color:var(--color-accent)] dark:border-white/15"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-mute)]">
          How do you track developer signal today?
        </span>
        <input
          name="currentTool"
          placeholder="e.g. spreadsheet · Notion · Common Room · Linear · nothing"
          className="rounded-lg border border-black/15 bg-transparent px-4 py-2.5 text-base outline-none focus:border-[color:var(--color-accent)] dark:border-white/15"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-mute)]">
          Biggest pain
        </span>
        <textarea
          name="biggestPain"
          rows={3}
          placeholder="e.g. no idea who's actually about to buy · digging through GitHub + email + Slack every time"
          className="rounded-lg border border-black/15 bg-transparent px-4 py-2.5 text-base outline-none focus:border-[color:var(--color-accent)] dark:border-white/15"
        />
      </label>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-mute)]">
          Monthly budget you'd actually pay
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {BUDGETS.map((b, i) => (
            <label
              key={b.value}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-black/15 px-3 py-2.5 text-sm transition hover:bg-black/[.04] has-[input:checked]:border-[color:var(--color-accent)] has-[input:checked]:bg-[color:var(--color-accent-soft,transparent)] dark:border-white/15 dark:hover:bg-white/[.04]"
            >
              <input
                type="radio"
                name="monthlyBudget"
                value={b.value}
                defaultChecked={i === 2}
                className="sr-only"
              />
              <span>{b.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 rounded-lg bg-[color:var(--color-ink)] px-4 py-3 font-mono text-sm font-medium text-[color:var(--color-bg)] transition hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Apply for Beta"}
      </button>

      <p className="text-xs text-[color:var(--color-mute)]">
        No card · no billing · invited beta users only.
      </p>
    </form>
  );
}
