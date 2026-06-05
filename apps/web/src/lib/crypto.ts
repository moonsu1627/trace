/* lib/crypto.ts — 세션 쿠키 서명 + GitHub 토큰 암호화. 외부 의존성 0 (Node crypto).
 *
 * - 세션 쿠키: HMAC-SHA256 서명. payload 자체는 비밀 아님 — 위변조만 차단.
 * - GitHub 토큰: AES-256-GCM. DB에 평문 저장 금지 (Integration.encryptedToken).
 */

import crypto from "node:crypto";

// ── 세션 쿠키: base64url(payload).base64url(hmac) ──────────────────────────────

export function signSession(payload: object, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifySession<T>(token: string, secret: string): T | null {
  const dot = token.indexOf(".");
  if (dot < 1) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

// ── GitHub 토큰: AES-256-GCM (iv.tag.ciphertext, 전부 base64url) ───────────────

export function encryptToken(plain: string, keyHex: string): string {
  const key = Buffer.from(keyHex, "hex");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${enc.toString("base64url")}`;
}

export function decryptToken(blob: string, keyHex: string): string {
  const key = Buffer.from(keyHex, "hex");
  const [ivB, tagB, encB] = blob.split(".");
  if (!ivB || !tagB || !encB) throw new Error("Malformed encrypted token.");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivB, "base64url"));
  decipher.setAuthTag(Buffer.from(tagB, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encB, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

/** OAuth state·기타용 랜덤 토큰. */
export function randomToken(bytes = 16): string {
  return crypto.randomBytes(bytes).toString("base64url");
}
