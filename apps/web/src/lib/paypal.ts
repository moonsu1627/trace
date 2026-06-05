/* lib/paypal.ts — PayPal Subscriptions API helper.
 *
 * 사장님 결정 (2026-06-01) v203 — Stripe 대신 PayPal (1인 한국 path).
 * PAYPAL_CLIENT_ID·SECRET·PLAN_ID 박혀있을 때 활성. 없으면 silent.
 *
 * 사장님 setup (1회):
 *   1. PayPal Developer Dashboard (https://developer.paypal.com) → My Apps & Credentials
 *   2. REST API app 생성 (Sandbox 먼저 → 검증 후 Live)
 *   3. Catalog Products + Billing Plans 생성 (Pro $9/mo · Studio $29/mo)
 *      - REST: POST /v1/catalogs/products + POST /v1/billing/plans
 *   4. env: PAYPAL_CLIENT_ID·PAYPAL_CLIENT_SECRET·PAYPAL_PLAN_ID_PRO·PAYPAL_PLAN_ID_STUDIO·PAYPAL_ENV (sandbox|live)
 *   5. Webhook: Dashboard → Webhooks → Add → URL <APP_URL>/api/webhooks/paypal
 *      events: BILLING.SUBSCRIPTION.ACTIVATED · BILLING.SUBSCRIPTION.CANCELLED · BILLING.SUBSCRIPTION.SUSPENDED · BILLING.SUBSCRIPTION.EXPIRED
 *      webhook id → PAYPAL_WEBHOOK_ID env
 */

import { env } from "./env";

interface TokenCache {
  token: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

/** OAuth2 access token 발급 (1시간 캐시). */
async function getAccessToken(): Promise<string | null> {
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.token;
  }
  const id = env.paypalClientId();
  const secret = env.paypalClientSecret();
  if (!id || !secret) return null;
  const auth = Buffer.from(`${id}:${secret}`).toString("base64");
  try {
    const res = await fetch(`${env.paypalApiBase()}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    if (!res.ok) return null;
    const j = (await res.json()) as { access_token?: string; expires_in?: number };
    if (!j.access_token) return null;
    tokenCache = {
      token: j.access_token,
      expiresAt: Date.now() + (j.expires_in ?? 3600) * 1000,
    };
    return j.access_token;
  } catch {
    return null;
  }
}

export interface SubscribeInput {
  planId: string;
  email: string;
  returnUrl: string;
  cancelUrl: string;
  customId?: string;
}

export interface SubscribeResult {
  ok: boolean;
  approveUrl?: string;
  subscriptionId?: string;
  error?: string;
}

/** PayPal Billing Subscription 생성 — approve URL(사용자 결제 페이지) 반환. */
export async function createPaypalSubscription(
  input: SubscribeInput,
): Promise<SubscribeResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: "PayPal not configured" };

  const body = {
    plan_id: input.planId,
    custom_id: input.customId,
    subscriber: { email_address: input.email },
    application_context: {
      brand_name: "Trace",
      shipping_preference: "NO_SHIPPING",
      user_action: "SUBSCRIBE_NOW",
      return_url: input.returnUrl,
      cancel_url: input.cancelUrl,
    },
  };

  try {
    const res = await fetch(`${env.paypalApiBase()}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(body),
    });
    const j = (await res.json()) as {
      id?: string;
      links?: Array<{ rel?: string; href?: string }>;
      message?: string;
      details?: Array<{ description?: string }>;
    };
    if (!res.ok || !j.id) {
      return {
        ok: false,
        error: j.message ?? j.details?.[0]?.description ?? `PayPal ${res.status}`,
      };
    }
    const approve = j.links?.find((l) => l.rel === "approve");
    if (!approve?.href) return { ok: false, error: "approve link missing" };
    return { ok: true, approveUrl: approve.href, subscriptionId: j.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export interface SubscriptionDetails {
  id: string;
  status?: string;
  plan_id?: string;
  subscriber?: { payer_id?: string; email_address?: string };
}

/** 단건 subscription 조회 — webhook verify 후 최신 status 확인용. */
export async function getSubscription(id: string): Promise<SubscriptionDetails | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    const res = await fetch(`${env.paypalApiBase()}/v1/billing/subscriptions/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return (await res.json()) as SubscriptionDetails;
  } catch {
    return null;
  }
}

export interface WebhookVerifyInput {
  body: string;
  headers: {
    "paypal-transmission-id"?: string;
    "paypal-transmission-time"?: string;
    "paypal-transmission-sig"?: string;
    "paypal-cert-url"?: string;
    "paypal-auth-algo"?: string;
  };
}

/** PayPal webhook signature 검증 — PayPal /v1/notifications/verify-webhook-signature 호출. */
export async function verifyPaypalWebhook(input: WebhookVerifyInput): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) return false;
  const webhookId = env.paypalWebhookId();
  if (!webhookId) return false;
  const h = input.headers;
  if (!h["paypal-transmission-id"] || !h["paypal-transmission-sig"] || !h["paypal-cert-url"]) {
    return false;
  }
  try {
    const res = await fetch(
      `${env.paypalApiBase()}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transmission_id: h["paypal-transmission-id"],
          transmission_time: h["paypal-transmission-time"],
          cert_url: h["paypal-cert-url"],
          auth_algo: h["paypal-auth-algo"],
          transmission_sig: h["paypal-transmission-sig"],
          webhook_id: webhookId,
          webhook_event: JSON.parse(input.body),
        }),
      },
    );
    if (!res.ok) return false;
    const j = (await res.json()) as { verification_status?: string };
    return j.verification_status === "SUCCESS";
  } catch {
    return false;
  }
}
