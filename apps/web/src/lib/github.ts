/* lib/github.ts — GitHub OAuth + REST API 헬퍼. fetch만 사용 (octokit 의존성 없음). */

const OAUTH_BASE = "https://github.com";
const API_BASE = "https://api.github.com";

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
}

export interface GitHubRepo {
  id: number;
  full_name: string;
  name: string;
  owner: { login: string };
  private: boolean;
  description: string | null;
  stargazers_count: number;
  pushed_at: string;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

/** OAuth authorize URL — /api/auth/github에서 사용자를 여기로 redirect. */
export function authorizeUrl(args: {
  clientId: string;
  redirectUri: string;
  scope: string;
  state: string;
}): string {
  const params = new URLSearchParams({
    client_id: args.clientId,
    redirect_uri: args.redirectUri,
    scope: args.scope,
    state: args.state,
  });
  return `${OAUTH_BASE}/login/oauth/authorize?${params.toString()}`;
}

/** authorization code → access token. */
export async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string,
): Promise<string> {
  const res = await fetch(`${OAUTH_BASE}/login/oauth/access_token`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  });
  if (!res.ok) throw new Error(`GitHub token exchange failed: HTTP ${res.status}`);
  const data = (await res.json()) as { access_token?: string; error?: string };
  if (!data.access_token) {
    throw new Error(`GitHub token exchange: ${data.error ?? "no access_token in response"}`);
  }
  return data.access_token;
}

async function apiGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "trace-app",
    },
  });
  if (!res.ok) throw new Error(`GitHub API ${path} failed: HTTP ${res.status}`);
  return (await res.json()) as T;
}

export function fetchGitHubUser(token: string): Promise<GitHubUser> {
  return apiGet<GitHubUser>("/user", token);
}

/** verified primary 이메일. 못 찾으면 null (호출부가 noreply 폴백). */
export async function fetchPrimaryEmail(token: string): Promise<string | null> {
  try {
    const emails = await apiGet<GitHubEmail[]>("/user/emails", token);
    const primary =
      emails.find((e) => e.primary && e.verified) ?? emails.find((e) => e.verified);
    return primary?.email ?? null;
  } catch {
    return null;
  }
}

/** 사용자가 소유한 repo — 최근 push 순, 최대 100개. */
export function listUserRepos(token: string): Promise<GitHubRepo[]> {
  return apiGet<GitHubRepo[]>(
    "/user/repos?per_page=100&sort=pushed&affiliation=owner",
    token,
  );
}
