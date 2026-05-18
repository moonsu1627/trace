import type { TraceEvent } from "@trace/events";

export interface GitHubIngestResult {
  repo: string;
  events: TraceEvent[];
  cursor: string | null;
}

export async function ingestGitHubRepo(_args: {
  accessToken: string;
  owner: string;
  repo: string;
  since?: Date | null;
}): Promise<GitHubIngestResult> {
  throw new Error("ingestGitHubRepo not implemented yet (MVP week 1)");
}
