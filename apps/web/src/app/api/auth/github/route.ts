/* GET /api/auth/github — OAuth 시작. state 쿠키를 심고 GitHub authorize로 redirect. */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { randomToken } from "@/lib/crypto";
import { authorizeUrl } from "@/lib/github";

export const runtime = "nodejs";

export async function GET() {
  const state = randomToken();
  const store = await cookies();
  store.set("trace_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10분 — OAuth 왕복 동안만
  });

  const url = authorizeUrl({
    clientId: env.githubClientId(),
    redirectUri: `${env.appUrl()}/api/auth/github/callback`,
    scope: "read:user user:email repo",
    state,
  });
  return NextResponse.redirect(url);
}
