/* POST /api/ingest — 추적 repo의 GitHub 신호를 수집해 Person·Identity·Event로 저장.
 *
 * "Sync now" 버튼이 호출. identity dedup: 같은 GitHub 계정은 안정 user id(Identity)로
 * 묶어 login(handle)이 바뀌어도 한 Person으로 유지한다. */

import { NextResponse } from "next/server";
import { prisma, type Prisma } from "@trace/db";
import { EVENT_WEIGHTS } from "@trace/events";
import { ingestGitHubRepo } from "@trace/integrations";
import { getSession } from "@/lib/session";
import { decryptToken } from "@/lib/crypto";
import { env } from "@/lib/env";
import { resolveIdentity } from "@/lib/identity";
import { recomputeSignalsForPerson } from "@/lib/signals";

export const runtime = "nodejs";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const integration = await prisma.integration.findFirst({
    where: { workspaceId: session.workspaceId, source: "github" },
  });
  if (!integration) {
    return NextResponse.json({ error: "GitHub not connected." }, { status: 400 });
  }

  const trackedRepo =
    (integration.metadata as { trackedRepo?: string } | null)?.trackedRepo ?? null;
  if (!trackedRepo) {
    return NextResponse.json({ error: "No repo selected." }, { status: 400 });
  }
  const [owner, repo] = trackedRepo.split("/");
  if (!owner || !repo) {
    return NextResponse.json({ error: "Invalid tracked repo." }, { status: 400 });
  }

  // ── GitHub에서 수집 ──
  let events;
  try {
    const token = decryptToken(integration.encryptedToken, env.tokenKey());
    const result = await ingestGitHubRepo({ accessToken: token, owner, repo });
    events = result.events;
  } catch (err) {
    console.error("[ingest] GitHub fetch failed", err);
    return NextResponse.json({ error: "GitHub ingestion failed." }, { status: 502 });
  }

  const workspaceId = session.workspaceId;

  // 안정 식별자(personExternalId)별 집계 — handle은 변할 수 있어 id로 묶는다.
  const seen = new Map<string, { handle: string; first: Date; last: Date }>();
  for (const e of events) {
    const cur = seen.get(e.personExternalId);
    if (!cur) {
      seen.set(e.personExternalId, {
        handle: e.personHandle,
        first: e.occurredAt,
        last: e.occurredAt,
      });
    } else {
      cur.handle = e.personHandle;
      if (e.occurredAt < cur.first) cur.first = e.occurredAt;
      if (e.occurredAt > cur.last) cur.last = e.occurredAt;
    }
  }

  try {
    // ── Identity resolution — cross-source dedup은 lib/identity.ts에 위임. ──
    // 같은 GitHub user id → 기존 Identity로 매치. 없으면 같은 primaryHandle의
    // Person에 새 Identity를 부착(예: waitlist로 먼저 들어왔던 사람). 둘 다 없으면
    // 새 Person 생성.
    const personIdByExternalId = new Map<string, string>();
    let newIdentities = 0;
    for (const [externalId, info] of seen) {
      const { personId, createdIdentity } = await resolveIdentity({
        workspaceId,
        source: "github",
        externalId,
        handle: info.handle,
        url: `https://github.com/${info.handle}`,
        firstSeenAt: info.first,
        lastSeenAt: info.last,
      });
      if (createdIdentity) newIdentities += 1;
      personIdByExternalId.set(externalId, personId);
    }

    // ── Event 일괄 삽입 — externalId 중복은 skip (재동기화 안전) ──
    const rows: Prisma.EventCreateManyInput[] = events.map((e) => ({
      workspaceId,
      personId: personIdByExternalId.get(e.personExternalId) as string,
      source: "github",
      key: e.key,
      externalId: e.externalId,
      occurredAt: e.occurredAt,
      payload: e.payload as Prisma.InputJsonValue,
      weight: EVENT_WEIGHTS[e.key] ?? 1,
    }));
    const inserted = await prisma.event.createMany({ data: rows, skipDuplicates: true });

    // ── 영향받은 person들의 signal 재계산 — rule 기반, deterministic ──
    for (const personId of personIdByExternalId.values()) {
      await recomputeSignalsForPerson(workspaceId, personId);
    }

    await prisma.integration.update({
      where: { id: integration.id },
      data: { lastSyncedAt: new Date() },
    });

    // 워크스페이스 누적 현황.
    const [people, identities, totalEvents, signalsActive] = await Promise.all([
      prisma.person.count({ where: { workspaceId } }),
      prisma.identity.count({ where: { workspaceId } }),
      prisma.event.count({ where: { workspaceId } }),
      prisma.signal.count({ where: { workspaceId, status: "active" } }),
    ]);

    return NextResponse.json({
      ok: true,
      repo: trackedRepo,
      eventsScanned: events.length,
      eventsIngested: inserted.count,
      peopleSeen: seen.size,
      newIdentities,
      totals: {
        people,
        identities,
        events: totalEvents,
        signals: signalsActive,
      },
    });
  } catch (err) {
    console.error("[ingest] DB write failed", err);
    return NextResponse.json({ error: "Could not save signals." }, { status: 500 });
  }
}
