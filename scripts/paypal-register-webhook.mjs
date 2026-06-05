#!/usr/bin/env node
/* PayPal Webhook 등록 — deploy 끝나고 production URL 결정된 후 실행.
 *
 * 사용:
 *   1. .env.local 에 추가: PAYPAL_WEBHOOK_BASE=https://trace-web-srye.vercel.app
 *      (또는 사장님 production URL)
 *   2. node scripts/paypal-register-webhook.mjs
 *   3. 출력된 PAYPAL_WEBHOOK_ID 를 .env.local 에 박기 (Vercel env에도)
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../apps/web/.env.local");

function loadEnv(p) {
  if (!existsSync(p)) {
    console.error(`❌ .env.local 없음: ${p}`);
    process.exit(1);
  }
  const text = readFileSync(p, "utf-8");
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)\s*=\s*"?([^"\r\n]*)"?$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
loadEnv(envPath);

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_ENV = process.env.PAYPAL_ENV ?? "sandbox";
const WEBHOOK_BASE = process.env.PAYPAL_WEBHOOK_BASE ?? process.env.APP_URL;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("❌ PAYPAL_CLIENT_ID / SECRET 필요");
  process.exit(1);
}
if (!WEBHOOK_BASE || WEBHOOK_BASE.startsWith("http://localhost")) {
  console.error("❌ PAYPAL_WEBHOOK_BASE (production URL) 필요. localhost는 PayPal이 호출 X.");
  process.exit(1);
}

const API = PAYPAL_ENV === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

const WEBHOOK_URL = `${WEBHOOK_BASE.replace(/\/$/, "")}/api/webhooks/paypal`;
console.log(`PayPal env: ${PAYPAL_ENV}`);
console.log(`Webhook URL: ${WEBHOOK_URL}\n`);

async function getToken() {
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const j = await res.json();
  if (!res.ok) throw new Error(`token: ${res.status}`);
  return j.access_token;
}

try {
  const token = await getToken();
  console.log("✓ access token ok");

  // 기존 webhook 검색 — 같은 URL 있으면 그 ID 재사용
  const listRes = await fetch(`${API}/v1/notifications/webhooks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const listJ = await listRes.json();
  const existing = (listJ.webhooks ?? []).find((w) => w.url === WEBHOOK_URL);
  if (existing) {
    console.log(`\n✓ 이미 등록됨 — webhook id 재사용: ${existing.id}`);
    printEnvLine(existing.id);
    process.exit(0);
  }

  const res = await fetch(`${API}/v1/notifications/webhooks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: WEBHOOK_URL,
      event_types: [
        { name: "BILLING.SUBSCRIPTION.ACTIVATED" },
        { name: "BILLING.SUBSCRIPTION.CANCELLED" },
        { name: "BILLING.SUBSCRIPTION.SUSPENDED" },
        { name: "BILLING.SUBSCRIPTION.EXPIRED" },
        { name: "BILLING.SUBSCRIPTION.UPDATED" },
      ],
    }),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(`webhook create: ${res.status} ${JSON.stringify(j).slice(0, 300)}`);

  console.log(`\n✓ Webhook registered: ${j.id}`);
  printEnvLine(j.id);
} catch (err) {
  console.error("\n❌", err.message);
  process.exit(1);
}

function printEnvLine(id) {
  console.log("\n========================================");
  console.log("이 줄을 apps/web/.env.local 에 추가하세요:");
  console.log("========================================");
  console.log(`PAYPAL_WEBHOOK_ID=${id}`);
  console.log("========================================");
}
