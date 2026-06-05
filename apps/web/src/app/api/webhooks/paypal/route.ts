/* POST /api/webhooks/paypal — PayPal subscription events → DB update.
 *
 * 사장님 setup: PayPal Dashboard → Webhooks → endpoint:
 *   <APP_URL>/api/webhooks/paypal
 *   events: BILLING.SUBSCRIPTION.ACTIVATED · BILLING.SUBSCRIPTION.CANCELLED ·
 *           BILLING.SUBSCRIPTION.SUSPENDED · BILLING.SUBSCRIPTION.EXPIRED
 *   webhook id → PAYPAL_WEBHOOK_ID env
 */

import { NextResponse } from "next/server";
import { prisma } from "@trace/db";
import { verifyPaypalWebhook, getSubscription } from "@/lib/paypal";

export const runtime = "nodejs";

interface PaypalEvent {
  id: string;
  event_type: string;
  resource: {
    id?: string;
    status?: string;
    plan_id?: string;
    subscriber?: { payer_id?: string; email_address?: string };
    custom_id?: string;
  };
}

const STATUS_EVENTS = new Set([
  "BILLING.SUBSCRIPTION.ACTIVATED",
  "BILLING.SUBSCRIPTION.CANCELLED",
  "BILLING.SUBSCRIPTION.SUSPENDED",
  "BILLING.SUBSCRIPTION.EXPIRED",
  "BILLING.SUBSCRIPTION.UPDATED",
]);

export async function POST(req: Request) {
  const raw = await req.text();

  const valid = await verifyPaypalWebhook({
    body: raw,
    headers: {
      "paypal-transmission-id": req.headers.get("paypal-transmission-id") ?? undefined,
      "paypal-transmission-time": req.headers.get("paypal-transmission-time") ?? undefined,
      "paypal-transmission-sig": req.headers.get("paypal-transmission-sig") ?? undefined,
      "paypal-cert-url": req.headers.get("paypal-cert-url") ?? undefined,
      "paypal-auth-algo": req.headers.get("paypal-auth-algo") ?? undefined,
    },
  });
  if (!valid) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  let event: PaypalEvent;
  try {
    event = JSON.parse(raw) as PaypalEvent;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (!STATUS_EVENTS.has(event.event_type)) {
    return NextResponse.json({ ignored: true });
  }

  const subId = event.resource.id;
  if (!subId) {
    return NextResponse.json({ error: "no subscription id" }, { status: 400 });
  }

  // 최신 상태 다시 조회 (webhook payload보다 GET이 신뢰 가능)
  const detail = await getSubscription(subId);
  const status = detail?.status ?? event.resource.status ?? "UNKNOWN";
  const planId = detail?.plan_id ?? event.resource.plan_id ?? null;
  const payerEmail = detail?.subscriber?.email_address ?? null;
  const payerId = detail?.subscriber?.payer_id ?? event.resource.subscriber?.payer_id ?? null;

  try {
    if (event.event_type === "BILLING.SUBSCRIPTION.ACTIVATED" && payerEmail) {
      await prisma.betaApplication.updateMany({
        where: { email: payerEmail },
        data: {
          paypalSubscriptionId: subId,
          paypalPayerId: payerId,
          paypalStatus: status,
          paypalPlanId: planId,
          paypalSubscribedAt: new Date(),
        },
      });
    } else {
      await prisma.betaApplication.updateMany({
        where: { paypalSubscriptionId: subId },
        data: {
          paypalStatus: status,
          paypalPlanId: planId,
        },
      });
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[paypal webhook] db error:", err);
    return NextResponse.json({ error: "db error" }, { status: 500 });
  }
}
