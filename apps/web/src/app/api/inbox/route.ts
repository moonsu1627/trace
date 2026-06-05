/* GET /api/inbox — 오늘 주목할 signal 상위 N개.
 *
 * 같은 데이터 형태를 /inbox 페이지 SSR과 공유 (lib/inbox.ts). 비로그인은 401. */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getInbox, INBOX_TOP_N } from "@/lib/inbox";
import { SIGNAL_LABEL, type SignalKey } from "@/lib/signals";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const url = new URL(request.url);
  const takeParam = url.searchParams.get("take");
  const take = takeParam ? Math.min(Math.max(parseInt(takeParam, 10) || INBOX_TOP_N, 1), 50) : INBOX_TOP_N;

  const { items, total, since, windowMs } = await getInbox(session.workspaceId, { take });

  return NextResponse.json(
    {
      since: since.toISOString(),
      windowMs,
      total,
      items: items.map((s) => ({
        id: s.id,
        key: s.key,
        label: SIGNAL_LABEL[s.key as SignalKey] ?? s.key,
        reason: s.reason,
        lastFiredAt: s.lastFiredAt.toISOString(),
        person: s.person,
      })),
    },
    { headers: { "cache-control": "no-store" } },
  );
}
