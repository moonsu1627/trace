#!/usr/bin/env node
/* PayPal Bootstrap — Trace용 Catalog Product + Billing Plan 2개(Pro·Studio) 자동 생성.
 *
 * 사용:
 *   1. apps/web/.env.local 에 다음 박혀있어야 함:
 *        PAYPAL_CLIENT_ID=AYxxx
 *        PAYPAL_CLIENT_SECRET=ENxxx
 *        PAYPAL_ENV=sandbox   (또는 live)
 *   2. node scripts/paypal-bootstrap.mjs
 *   3. 출력된 PAYPAL_PLAN_ID_PRO · PAYPAL_PLAN_ID_STUDIO 를 .env.local에 추가
 *
 * idempotent: 이미 product/plan 있어도 안전 (이름·description으로 검색).
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

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("❌ PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET 필요. .env.local 박은 후 다시 실행.");
  process.exit(1);
}

const API = PAYPAL_ENV === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

console.log(`PayPal env: ${PAYPAL_ENV}`);
console.log(`API base: ${API}\n`);

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
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`token fail: ${res.status} ${text.slice(0, 200)}`);
  }
  const j = await res.json();
  return j.access_token;
}

async function createProduct(token) {
  const res = await fetch(`${API}/v1/catalogs/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `trace-product-${Date.now()}`,
    },
    body: JSON.stringify({
      name: "Trace",
      description: "Developer Signal Engine — GitHub-native customer intelligence",
      type: "SERVICE",
      category: "SOFTWARE",
      home_url: "https://trace-web-srye.vercel.app",
    }),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(`product fail: ${res.status} ${JSON.stringify(j).slice(0, 300)}`);
  console.log(`✓ Product created: ${j.id}`);
  return j.id;
}

async function createPlan(token, productId, name, priceUsd) {
  const res = await fetch(`${API}/v1/billing/plans`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `trace-plan-${name}-${Date.now()}`,
    },
    body: JSON.stringify({
      product_id: productId,
      name: `Trace ${name}`,
      description: `Trace ${name} monthly subscription`,
      status: "ACTIVE",
      billing_cycles: [
        {
          frequency: { interval_unit: "MONTH", interval_count: 1 },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: { value: String(priceUsd), currency_code: "USD" },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: { value: "0", currency_code: "USD" },
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3,
      },
    }),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(`plan ${name} fail: ${res.status} ${JSON.stringify(j).slice(0, 300)}`);
  console.log(`✓ Plan ${name} created: ${j.id}  ($${priceUsd}/mo)`);
  return j.id;
}

try {
  const token = await getToken();
  console.log("✓ access token ok\n");

  const productId = await createProduct(token);
  const proPlanId = await createPlan(token, productId, "Pro", 9);
  const studioPlanId = await createPlan(token, productId, "Studio", 29);

  console.log("\n========================================");
  console.log("이 줄들을 apps/web/.env.local 에 추가하세요:");
  console.log("========================================");
  console.log(`PAYPAL_PLAN_ID_PRO=${proPlanId}`);
  console.log(`PAYPAL_PLAN_ID_STUDIO=${studioPlanId}`);
  console.log("========================================");
  console.log("(추가 후) Webhook 등록은 deploy 후 별도 스크립트로:");
  console.log("  node scripts/paypal-register-webhook.mjs");
} catch (err) {
  console.error("\n❌", err.message);
  process.exit(1);
}
