import { NextResponse } from "next/server";
import { prisma } from "@trace/db";

/**
 * GET /api/metrics — waitlist 가입자 수 조회 (connect-ai V2 reality source용).
 *
 * 범위 (사장님 2026-05-20 허용 범위):
 *  - waitlist 가입자 수만 반환 (total_count / recent_count_24h / recent_count_7d)
 *  - landing UI·디자인·비즈니스 로직 무관
 *  - DB schema 변경 0 (WaitlistEntry.createdAt 그대로 사용)
 *
 * 인증: env METRICS_SECRET 설정 시 x-metrics-secret 헤더 요구. 비어있으면 public.
 */

const WINDOW_24H_MS = 24 * 60 * 60 * 1000;
const WINDOW_7D_MS = 7 * 24 * 60 * 60 * 1000;

export async function GET(request: Request) {
  const secret = process.env.METRICS_SECRET;
  if (secret) {
    const given = request.headers.get("x-metrics-secret");
    if (given !== secret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();
  const since24h = new Date(now.getTime() - WINDOW_24H_MS);
  const since7d = new Date(now.getTime() - WINDOW_7D_MS);

  try {
    const [totalCount, recentCount24h, recentCount7d] = await Promise.all([
      prisma.waitlistEntry.count(),
      prisma.waitlistEntry.count({ where: { createdAt: { gte: since24h } } }),
      prisma.waitlistEntry.count({ where: { createdAt: { gte: since7d } } }),
    ]);

    return NextResponse.json(
      {
        observedAt: now.toISOString(),
        waitlist: {
          total_count: totalCount,
          recent_count_24h: recentCount24h,
          recent_count_7d: recentCount7d,
        },
        sensorVersion: "stage0.v1",
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (err) {
    console.error("[metrics] db query failed", err);
    return NextResponse.json({ error: "metrics unavailable" }, { status: 500 });
  }
}

export const runtime = "nodejs";
