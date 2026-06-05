/* POST /api/checkout — PayPal Subscription 생성 → approve URL redirect.
 *
 * 사장님 결정 v203: PAYPAL_CLIENT_ID·SECRET·PLAN_ID 박혀있을 때 활성.
 * env 미설정 시 /apply 베타 신청으로 fallback (client side 분기).
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { createPaypalSubscription } from "@/lib/paypal";

const CheckoutSchema = z.object({
  tier: z.enum(["pro", "studio"]).default("pro"),
  email: z.string().trim().email().max(200),
});

export async function POST(req: Request) {
  if (!env.paypalEnabled()) {
    return NextResponse.json(
      { error: "PayPal not configured — use /apply for beta signup" },
      { status: 503 },
    );
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "validation failed" },
      { status: 400 },
    );
  }

  const planId =
    parsed.data.tier === "studio" ? env.paypalPlanIdStudio() : env.paypalPlanIdPro();
  if (!planId) {
    return NextResponse.json({ error: "plan id not configured" }, { status: 503 });
  }

  const appUrl = env.appUrl();
  const sub = await createPaypalSubscription({
    planId,
    email: parsed.data.email,
    returnUrl: `${appUrl}/pricing?success=1`,
    cancelUrl: `${appUrl}/pricing?canceled=1`,
    customId: parsed.data.tier,
  });

  if (!sub.ok || !sub.approveUrl) {
    return NextResponse.json({ error: sub.error ?? "subscribe error" }, { status: 502 });
  }
  return NextResponse.json({ url: sub.approveUrl, subscriptionId: sub.subscriptionId });
}
