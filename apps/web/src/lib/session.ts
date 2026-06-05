/* lib/session.ts — 로그인 세션. 서명된 httpOnly 쿠키 1개 (DB 세션 테이블 없음).
 * setSession/clearSession은 Route Handler에서만 호출 (cookies() 쓰기 제약). */

import { cookies } from "next/headers";
import { signSession, verifySession } from "./crypto";
import { env } from "./env";

const SESSION_COOKIE = "trace_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30일

export interface Session {
  userId: string;
  workspaceId: string;
  iat: number;
}

/** 현재 세션. 쿠키 없거나 서명 불일치면 null. 어디서든 호출 가능. */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  return verifySession<Session>(raw, env.sessionSecret());
}

/** 세션 쿠키 설정 — Route Handler에서만. */
export async function setSession(userId: string, workspaceId: string): Promise<void> {
  const store = await cookies();
  const token = signSession({ userId, workspaceId, iat: Date.now() }, env.sessionSecret());
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

/** 세션 쿠키 제거 — Route Handler에서만. */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
