/* GET /api/auth/github/callback — OAuth 콜백.
 * code+state 검증 → access token 교환 → User/Workspace/Integration upsert → 세션 설정. */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@trace/db";
import { env } from "@/lib/env";
import { encryptToken } from "@/lib/crypto";
import { setSession } from "@/lib/session";
import {
  exchangeCodeForToken,
  fetchGitHubUser,
  fetchPrimaryEmail,
} from "@/lib/github";

export const runtime = "nodejs";

const SCOPES = ["read:user", "user:email", "repo"];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const store = await cookies();
  const savedState = store.get("trace_oauth_state")?.value;
  const connect = (reason: string) =>
    NextResponse.redirect(`${env.appUrl()}/connect?error=${reason}`);

  // CSRF — state 쿠키와 일치해야 함.
  if (!code || !state || !savedState || state !== savedState) {
    return connect("oauth_state");
  }
  store.delete("trace_oauth_state");

  try {
    const token = await exchangeCodeForToken(
      code,
      env.githubClientId(),
      env.githubClientSecret(),
    );
    const ghUser = await fetchGitHubUser(token);
    const email =
      (await fetchPrimaryEmail(token)) ??
      `${ghUser.login}@users.noreply.github.com`;

    // User upsert — githubLogin이 안정적 식별자.
    const user = await prisma.user.upsert({
      where: { githubLogin: ghUser.login },
      create: {
        email,
        name: ghUser.name,
        githubLogin: ghUser.login,
        avatarUrl: ghUser.avatar_url,
      },
      update: { name: ghUser.name, avatarUrl: ghUser.avatar_url },
    });

    // Workspace — 없으면 owner 멤버십과 함께 생성.
    let membership = await prisma.workspaceMember.findFirst({
      where: { userId: user.id },
    });
    if (!membership) {
      const workspace = await prisma.workspace.create({
        data: {
          slug: await uniqueSlug(ghUser.login),
          name: `${ghUser.name ?? ghUser.login}'s workspace`,
          members: { create: { userId: user.id, role: "owner" } },
        },
      });
      membership = await prisma.workspaceMember.findFirstOrThrow({
        where: { userId: user.id, workspaceId: workspace.id },
      });
    }
    const workspaceId = membership.workspaceId;

    // GitHub Integration — 토큰은 암호화해 저장.
    await prisma.integration.upsert({
      where: {
        workspaceId_source_accountLabel: {
          workspaceId,
          source: "github",
          accountLabel: ghUser.login,
        },
      },
      create: {
        workspaceId,
        source: "github",
        accountLabel: ghUser.login,
        encryptedToken: encryptToken(token, env.tokenKey()),
        scopes: SCOPES,
        status: "connected",
      },
      update: {
        encryptedToken: encryptToken(token, env.tokenKey()),
        scopes: SCOPES,
        status: "connected",
      },
    });

    await setSession(user.id, workspaceId);
    return NextResponse.redirect(`${env.appUrl()}/connect`);
  } catch (err) {
    console.error("[oauth/callback] failed", err);
    return connect("oauth_failed");
  }
}

/** workspace slug 충돌 회피 — base, base-1, base-2 ... */
async function uniqueSlug(base: string): Promise<string> {
  const root =
    base.toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 32) || "workspace";
  let slug = root;
  for (let i = 1; ; i += 1) {
    const exists = await prisma.workspace.findUnique({ where: { slug } });
    if (!exists) return slug;
    slug = `${root}-${i}`;
  }
}
