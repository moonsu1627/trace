/* POST /api/apply — Pro 베타 신청 폼 처리.
 *
 * 사장님 결정 (2026-06-01): waitlist 숫자 X, 결제 의향 검증 ✓.
 * 신청 폼 → BetaApplication 모델. /admin/applications에서 확인.
 * Stripe 결제 X — 카드 입력 안 받음.
 */

import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { z } from "zod";
import { prisma } from "@trace/db";
import { sendBetaWelcome, sendAdminAlert } from "@/lib/notify-email";

const BUDGET_VALUES = ["zero", "small", "standard", "high"] as const;

const ApplySchema = z.object({
  name: z.string().trim().min(1, "name required").max(120),
  email: z.string().trim().email("invalid email").max(200),
  currentTool: z.string().trim().max(500).optional().nullable(),
  biggestPain: z.string().trim().max(2000).optional().nullable(),
  monthlyBudget: z.enum(BUDGET_VALUES).default("standard"),
  tier: z.string().trim().max(40).optional().nullable(),
  referrer: z.string().trim().max(500).optional().nullable(),
});

function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const parsed = ApplySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "validation failed" },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null;

  try {
    await prisma.betaApplication.upsert({
      where: { email: data.email },
      update: {
        name: data.name,
        currentTool: data.currentTool ?? null,
        biggestPain: data.biggestPain ?? null,
        monthlyBudget: data.monthlyBudget,
        referrer: data.referrer ?? null,
        ipHash: hashIp(ip),
      },
      create: {
        name: data.name,
        email: data.email,
        currentTool: data.currentTool ?? null,
        biggestPain: data.biggestPain ?? null,
        monthlyBudget: data.monthlyBudget,
        referrer: data.referrer ?? null,
        ipHash: hashIp(ip),
      },
    });

    // v201 Phase 4: 자동 이메일. fire-and-forget — 실패해도 응답 200.
    const tier = (data.tier ?? "pro").toLowerCase();
    void sendBetaWelcome({
      to: data.email,
      name: data.name,
      tier,
      monthlyBudget: data.monthlyBudget,
    }).catch((err) => console.error("[apply] welcome email failed:", err));

    // admin notification — KPI 같이.
    const [totalApplications, payingIntent] = await Promise.all([
      prisma.betaApplication.count(),
      prisma.betaApplication.count({
        where: { monthlyBudget: { in: ["standard", "high"] } },
      }),
    ]).catch(() => [0, 0]);
    void sendAdminAlert({
      name: data.name,
      email: data.email,
      tier,
      monthlyBudget: data.monthlyBudget,
      currentTool: data.currentTool ?? null,
      biggestPain: data.biggestPain ?? null,
      totalApplications,
      payingIntent,
    }).catch((err) => console.error("[apply] admin alert failed:", err));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[apply] db error:", err);
    return NextResponse.json(
      { error: "Storage error. Please try again." },
      { status: 500 },
    );
  }
}
