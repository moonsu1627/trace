/* GitHub ingest — 추적 repo의 stars·issues·PR·watchers를 TraceEvent로 수집.
 *
 * DB는 안 건드린다 — events 배열만 반환. 호출부(apps/web /api/ingest)가
 * Person·Event로 저장. octokit 없이 fetch만 사용.
 *
 * MVP 범위: stars + issues + PR + watchers. comment는 후속(부모 타입 해석 필요).
 * watchers(/subscribers)는 GitHub API가 timestamp를 제공하지 않아 occurredAt은
 * sync 시각(now)으로 기록 — externalId가 (repo, user) 안정키라 재동기화 시
 * skipDuplicates로 중복 안 생긴다(첫 관찰 시점이 사실상 evidence). */

import type { EventKey, TraceEvent } from "@trace/events";

const API = "https://api.github.com";
const MAX_PAGES = 10; // per_page=100 → 종류당 최대 1000건 (MVP 안전 상한)

export interface GitHubIngestResult {
  repo: string;
  events: TraceEvent[];
  cursor: string | null;
}

interface GitHubActor {
  login: string;
  /** 안정 식별자 — login이 바뀌어도 불변. */
  id: number;
}

interface Stargazer {
  starred_at: string;
  user: GitHubActor | null;
}

interface Issue {
  id: number;
  number: number;
  title: string;
  user: GitHubActor | null;
  created_at: string;
  /** 존재하면 이 issue는 사실 PR. */
  pull_request?: unknown;
}

/** /subscribers는 GitHubActor와 동일한 사용자 객체를 반환 — timestamp 없음. */
type Subscriber = GitHubActor;

/** Link 헤더에서 rel="next" URL 추출. */
function parseNextLink(header: string | null): string | null {
  if (!header) return null;
  for (const part of header.split(",")) {
    const m = part.match(/<([^>]+)>;\s*rel="next"/u);
    if (m && m[1]) return m[1];
  }
  return null;
}

/** Link 헤더 페이지네이션을 따라가며 전부 수집 (MAX_PAGES 상한). */
async function paged<T>(startUrl: string, token: string, accept: string): Promise<T[]> {
  const out: T[] = [];
  let url: string | null = startUrl;
  let page = 0;
  while (url && page < MAX_PAGES) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: accept,
        "User-Agent": "trace-app",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (!res.ok) {
      throw new Error(`GitHub request failed (HTTP ${res.status}): ${startUrl}`);
    }
    out.push(...((await res.json()) as T[]));
    url = parseNextLink(res.headers.get("link"));
    page += 1;
  }
  return out;
}

export async function ingestGitHubRepo(args: {
  accessToken: string;
  owner: string;
  repo: string;
  since?: Date | null;
}): Promise<GitHubIngestResult> {
  const { accessToken, owner, repo, since } = args;
  const slug = `${owner}/${repo}`;
  const events: TraceEvent[] = [];

  // ── stars (star+json accept로 starred_at 타임스탬프 확보) ──
  const stargazers = await paged<Stargazer>(
    `${API}/repos/${owner}/${repo}/stargazers?per_page=100`,
    accessToken,
    "application/vnd.github.star+json",
  );
  for (const s of stargazers) {
    if (!s.user) continue;
    const occurredAt = new Date(s.starred_at);
    if (since && occurredAt < since) continue;
    events.push({
      key: "github.star",
      source: "github",
      personHandle: s.user.login,
      personExternalId: String(s.user.id),
      occurredAt,
      payload: { repo: slug },
      externalId: `star:${slug}:${s.user.login}`,
    });
  }

  // ── issues + PR (GitHub issues 엔드포인트는 PR도 포함) ──
  const sinceQuery = since ? `&since=${since.toISOString()}` : "";
  const issues = await paged<Issue>(
    `${API}/repos/${owner}/${repo}/issues?state=all&per_page=100${sinceQuery}`,
    accessToken,
    "application/vnd.github+json",
  );
  for (const issue of issues) {
    if (!issue.user) continue;
    const isPR = issue.pull_request !== undefined;
    const key: EventKey = isPR ? "github.pr_opened" : "github.issue_opened";
    events.push({
      key,
      source: "github",
      personHandle: issue.user.login,
      personExternalId: String(issue.user.id),
      occurredAt: new Date(issue.created_at),
      payload: { repo: slug, number: issue.number, title: issue.title },
      externalId: `${isPR ? "pr" : "issue"}:${slug}:${issue.id}`,
    });
  }

  // ── watchers (subscribers — repo notifications 구독자) ──
  // GitHub API에 가입 timestamp가 없어 occurredAt은 now. externalId가 user id로
  // 고정이라 재동기화 시 skipDuplicates로 한 사람당 watch 이벤트는 1건만 유지.
  const subscribers = await paged<Subscriber>(
    `${API}/repos/${owner}/${repo}/subscribers?per_page=100`,
    accessToken,
    "application/vnd.github+json",
  );
  const observedAt = new Date();
  for (const sub of subscribers) {
    if (!sub || !sub.login) continue;
    events.push({
      key: "github.watch",
      source: "github",
      personHandle: sub.login,
      personExternalId: String(sub.id),
      occurredAt: observedAt,
      payload: { repo: slug, observed: true },
      externalId: `watch:${slug}:${sub.id}`,
    });
  }

  return { repo: slug, events, cursor: null };
}
