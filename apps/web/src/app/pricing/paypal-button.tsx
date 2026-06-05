"use client";

import { useState } from "react";

interface PaypalSubscribeButtonProps {
  tier: "pro" | "studio";
  label: string;
  highlight?: boolean;
}

export function PaypalSubscribeButton({ tier, label, highlight }: PaypalSubscribeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setError(null);
    const email = window.prompt("Email for invoice and account:");
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, email }),
      });
      const j = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !j.url) throw new Error(j.error ?? `HTTP ${res.status}`);
      window.location.href = j.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Subscribe failed");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className={`block w-full rounded-lg px-4 py-2.5 text-center font-mono text-sm font-medium transition disabled:opacity-50 ${
          highlight
            ? "bg-[color:var(--color-ink)] text-[color:var(--color-bg)] hover:opacity-90"
            : "border border-black/15 dark:border-white/15 hover:bg-black/[.04] dark:hover:bg-white/[.04]"
        }`}
      >
        {loading ? "Loading…" : `${label} (PayPal)`}
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </>
  );
}
