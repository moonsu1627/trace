export type SignalKey = "high_intent" | "power_user" | "feature_advocate";

export type SourceKey = "github" | "linear" | "discord" | "x" | "docs" | "waitlist" | "support";

export interface Person {
  id: string;
  primaryHandle: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: Date;
}

export const SIGNALS_V1: readonly SignalKey[] = ["high_intent", "power_user", "feature_advocate"] as const;
