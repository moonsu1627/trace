/* lib/inbox.ts — Inbox 읽기 로직. /inbox 페이지와 /api/inbox가 공유한다.
 *
 * "오늘 주목할 signal 상위 N개" = 최근 24h 안에 lastFiredAt이 갱신된
 * active signal 중 가장 최근 것부터 N개. signal은 createMany 시점에
 * recomputeSignalsForPerson이 fire하므로 lastFiredAt이 최신 활동 시점이다.
 *
 * total은 같은 window 내 active signal 수 — UI가 "5 of N" 표시할 때 사용. */

import { prisma } from "@trace/db";

export const INBOX_WINDOW_MS = 24 * 60 * 60 * 1000;
export const INBOX_TOP_N = 5;

export interface InboxItem {
  id: string;
  key: string;
  reason: string;
  lastFiredAt: Date;
  person: {
    id: string;
    primaryHandle: string;
    displayName: string | null;
  };
}

export interface InboxResult {
  items: InboxItem[];
  total: number;
  windowMs: number;
  since: Date;
}

export async function getInbox(
  workspaceId: string,
  opts: { now?: Date; take?: number } = {},
): Promise<InboxResult> {
  const now = opts.now ?? new Date();
  const take = opts.take ?? INBOX_TOP_N;
  const since = new Date(now.getTime() - INBOX_WINDOW_MS);

  const where = {
    workspaceId,
    status: "active" as const,
    lastFiredAt: { gte: since },
  };

  const [items, total] = await Promise.all([
    prisma.signal.findMany({
      where,
      orderBy: { lastFiredAt: "desc" },
      take,
      include: {
        person: { select: { id: true, primaryHandle: true, displayName: true } },
      },
    }),
    prisma.signal.count({ where }),
  ]);

  return {
    items: items.map((s) => ({
      id: s.id,
      key: s.key,
      reason: s.reason,
      lastFiredAt: s.lastFiredAt,
      person: s.person,
    })),
    total,
    windowMs: INBOX_WINDOW_MS,
    since,
  };
}
