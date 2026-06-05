/* GET /api/search/people — Cmd-K 팔레트가 호출하는 가벼운 검색 소스.
 * 워크스페이스의 person 최대 200명, 최근 활동 순. 비로그인은 401. */

import { NextResponse } from "next/server";
import { prisma } from "@trace/db";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ people: [] }, { status: 401 });
  }
  const people = await prisma.person.findMany({
    where: { workspaceId: session.workspaceId },
    orderBy: { lastSeenAt: "desc" },
    take: 200,
    select: { id: true, primaryHandle: true, displayName: true },
  });
  return NextResponse.json({ people });
}
