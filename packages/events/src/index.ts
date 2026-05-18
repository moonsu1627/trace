import type { SourceKey } from "@trace/shared";

export type EventKey =
  | "github.star"
  | "github.unstar"
  | "github.issue_opened"
  | "github.issue_commented"
  | "github.pr_opened"
  | "github.pr_commented"
  | "github.watch"
  | "waitlist.signup";

export interface TraceEvent {
  key: EventKey;
  source: SourceKey;
  personHandle: string;
  occurredAt: Date;
  payload: Record<string, unknown>;
  externalId: string;
}

export const EVENT_WEIGHTS: Record<EventKey, number> = {
  "github.star": 1,
  "github.unstar": -1,
  "github.issue_opened": 4,
  "github.issue_commented": 2,
  "github.pr_opened": 6,
  "github.pr_commented": 3,
  "github.watch": 2,
  "waitlist.signup": 5,
};
