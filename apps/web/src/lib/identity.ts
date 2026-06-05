/* lib/identity.ts — Identity dedup.
 *
 * Trace는 한 사람이 여러 소스(GitHub user id, waitlist 이메일, 추후 Linear/Discord …)
 * 에 흔적을 남긴다. 같은 사람을 한 Person으로 유지하는 두 갈래:
 *
 *   resolveIdentity()  — ingest 경로의 자동 dedup. 들어오는 (source, externalId)를
 *                        기존 Identity로 찾고, 없으면 같은 워크스페이스 안의
 *                        primaryHandle 매치된 Person에 Identity를 붙인다. 둘 다
 *                        없으면 Person+Identity를 새로 만든다.
 *   mergePeople()      — 수동 dedup. 사람은 같은데 시스템이 두 Person으로 쪼개버린
 *                        경우(다른 handle, 다른 소스 등) 한쪽으로 합친다. 모든
 *                        Identity/Event/Signal/Interest를 target으로 이관하고
 *                        source Person은 삭제. 유니크 키 충돌은 target 우선으로 해소.
 */

import { prisma, type Prisma } from "@trace/db";
import type { SourceKey } from "@trace/shared";

export interface ResolveIdentityInput {
  workspaceId: string;
  source: SourceKey;
  externalId: string;
  handle: string;
  url?: string | null;
  firstSeenAt: Date;
  lastSeenAt: Date;
}

export interface ResolveIdentityResult {
  personId: string;
  /** 이번 호출로 새 Identity가 생성되었는지 — 호출부 stats용. */
  createdIdentity: boolean;
  /** 이번 호출로 새 Person이 생성되었는지 — 호출부 stats용. */
  createdPerson: boolean;
}

/** 한 (source, externalId)에 대응하는 Person을 보장. 우선순위:
 *   1) 기존 Identity hit (안정 매치)
 *   2) 같은 워크스페이스의 primaryHandle 매치 Person — 새 Identity 부착 (cross-source merge)
 *   3) 신규 Person + Identity 생성
 *
 * lastSeenAt은 입력값이 더 최근이면 갱신. Identity.handle은 stale 시 동기화. */
export async function resolveIdentity(
  input: ResolveIdentityInput,
): Promise<ResolveIdentityResult> {
  const { workspaceId, source, externalId, handle, url, firstSeenAt, lastSeenAt } = input;

  const existingIdentity = await prisma.identity.findUnique({
    where: {
      workspaceId_source_externalId: { workspaceId, source, externalId },
    },
  });

  if (existingIdentity) {
    if (existingIdentity.handle !== handle) {
      await prisma.identity.update({
        where: { id: existingIdentity.id },
        data: { handle, url: url ?? existingIdentity.url },
      });
    }
    await bumpPersonSeenAt(existingIdentity.personId, lastSeenAt);
    return { personId: existingIdentity.personId, createdIdentity: false, createdPerson: false };
  }

  // primaryHandle 매치 Person이 있으면 거기에 Identity를 부착 — cross-source merge.
  const existingPerson = await prisma.person.findUnique({
    where: { workspaceId_primaryHandle: { workspaceId, primaryHandle: handle } },
  });

  if (existingPerson) {
    await prisma.identity.create({
      data: {
        workspaceId,
        personId: existingPerson.id,
        source,
        externalId,
        handle,
        url: url ?? null,
      },
    });
    await bumpPersonSeenAt(existingPerson.id, lastSeenAt);
    return { personId: existingPerson.id, createdIdentity: true, createdPerson: false };
  }

  const person = await prisma.person.create({
    data: { workspaceId, primaryHandle: handle, firstSeenAt, lastSeenAt },
  });
  await prisma.identity.create({
    data: {
      workspaceId,
      personId: person.id,
      source,
      externalId,
      handle,
      url: url ?? null,
    },
  });
  return { personId: person.id, createdIdentity: true, createdPerson: true };
}

async function bumpPersonSeenAt(personId: string, lastSeenAt: Date): Promise<void> {
  await prisma.person.update({
    where: { id: personId },
    data: { lastSeenAt: { set: lastSeenAt } },
  });
}

export interface MergePeopleInput {
  workspaceId: string;
  /** 합쳐서 살아남는 쪽 — 모든 Identity/Event/Signal이 여기로 이관. */
  targetId: string;
  /** 사라지는 쪽. */
  sourceId: string;
}

export interface MergePeopleResult {
  identitiesMoved: number;
  eventsMoved: number;
  signalsMoved: number;
  interestsMoved: number;
}

export class MergePeopleError extends Error {
  constructor(
    message: string,
    readonly code:
      | "same_person"
      | "not_found"
      | "different_workspace"
      | "wrong_workspace",
  ) {
    super(message);
    this.name = "MergePeopleError";
  }
}

/** sourceId의 모든 데이터를 targetId로 옮기고 sourceId Person을 삭제.
 * 유니크 키 충돌은 target 우선으로 해소:
 *   - Identity (workspaceId, source, externalId) 중복 → source 쪽 Identity 삭제
 *   - Event    (workspaceId, source, externalId) 중복 → source 쪽 Event 삭제
 *   - Signal   (workspaceId, personId, key) 중복      → source 쪽 Signal 삭제
 * target의 firstSeenAt은 더 이른 쪽, lastSeenAt은 더 늦은 쪽으로 갱신. */
export async function mergePeople(input: MergePeopleInput): Promise<MergePeopleResult> {
  const { workspaceId, targetId, sourceId } = input;
  if (targetId === sourceId) {
    throw new MergePeopleError("Cannot merge a person into itself.", "same_person");
  }

  return prisma.$transaction(async (tx) => {
    const [target, source] = await Promise.all([
      tx.person.findUnique({ where: { id: targetId } }),
      tx.person.findUnique({ where: { id: sourceId } }),
    ]);
    if (!target || !source) {
      throw new MergePeopleError("Person not found.", "not_found");
    }
    if (target.workspaceId !== workspaceId || source.workspaceId !== workspaceId) {
      throw new MergePeopleError("Person belongs to a different workspace.", "wrong_workspace");
    }
    if (target.workspaceId !== source.workspaceId) {
      throw new MergePeopleError("People are in different workspaces.", "different_workspace");
    }

    // ── Identity 이관 — (workspaceId, source, externalId) 충돌 시 source 쪽 삭제. ──
    const sourceIdentities = await tx.identity.findMany({ where: { personId: sourceId } });
    const targetIdentityKeys = new Set(
      (await tx.identity.findMany({
        where: { personId: targetId },
        select: { source: true, externalId: true },
      })).map((i) => `${i.source}:${i.externalId}`),
    );
    let identitiesMoved = 0;
    for (const idn of sourceIdentities) {
      const k = `${idn.source}:${idn.externalId}`;
      if (targetIdentityKeys.has(k)) {
        await tx.identity.delete({ where: { id: idn.id } });
      } else {
        await tx.identity.update({ where: { id: idn.id }, data: { personId: targetId } });
        identitiesMoved += 1;
      }
    }

    // ── Event 이관 — Event 유니크는 (workspaceId, source, externalId)이므로
    //    동일 externalId가 양쪽에 동시에 있는 경우는 정상 흐름엔 없다. 안전망:
    //    먼저 충돌 행을 모아 source 쪽을 삭제 후 일괄 update. ──
    const targetEventKeys = new Set(
      (await tx.event.findMany({
        where: { personId: targetId },
        select: { source: true, externalId: true },
      })).map((e) => `${e.source}:${e.externalId}`),
    );
    const sourceEvents = await tx.event.findMany({
      where: { personId: sourceId },
      select: { id: true, source: true, externalId: true },
    });
    const conflictEventIds: string[] = [];
    for (const e of sourceEvents) {
      if (targetEventKeys.has(`${e.source}:${e.externalId}`)) conflictEventIds.push(e.id);
    }
    if (conflictEventIds.length > 0) {
      await tx.event.deleteMany({ where: { id: { in: conflictEventIds } } });
    }
    const eventMove = await tx.event.updateMany({
      where: { personId: sourceId },
      data: { personId: targetId },
    });

    // ── Signal 이관 — (workspaceId, personId, key) 충돌 시 source 쪽 삭제. ──
    const targetSignals = await tx.signal.findMany({
      where: { personId: targetId },
      select: { key: true },
    });
    const targetSignalKeys = new Set(targetSignals.map((s) => s.key));
    const sourceSignals = await tx.signal.findMany({
      where: { personId: sourceId },
      select: { id: true, key: true },
    });
    const conflictSignalIds: string[] = [];
    for (const s of sourceSignals) {
      if (targetSignalKeys.has(s.key)) conflictSignalIds.push(s.id);
    }
    if (conflictSignalIds.length > 0) {
      await tx.signal.deleteMany({ where: { id: { in: conflictSignalIds } } });
    }
    const signalMove = await tx.signal.updateMany({
      where: { personId: sourceId },
      data: { personId: targetId },
    });

    // ── Interest 이관 — 유니크 제약 없음, 그대로 update. ──
    const interestMove = await tx.interest.updateMany({
      where: { personId: sourceId },
      data: { personId: targetId },
    });

    // ── target 메타 갱신 + source 삭제. ──
    const firstSeenAt = target.firstSeenAt < source.firstSeenAt ? target.firstSeenAt : source.firstSeenAt;
    const lastSeenAt = target.lastSeenAt > source.lastSeenAt ? target.lastSeenAt : source.lastSeenAt;
    const displayName = target.displayName ?? source.displayName;
    const avatarUrl = target.avatarUrl ?? source.avatarUrl;
    const bio = target.bio ?? source.bio;
    const location = target.location ?? source.location;
    const company = target.company ?? source.company;
    const websiteUrl = target.websiteUrl ?? source.websiteUrl;
    const organizationId = target.organizationId ?? source.organizationId;

    const updateData: Prisma.PersonUpdateInput = {
      firstSeenAt,
      lastSeenAt,
      score: target.score + source.score,
    };
    if (displayName !== target.displayName) updateData.displayName = displayName;
    if (avatarUrl !== target.avatarUrl) updateData.avatarUrl = avatarUrl;
    if (bio !== target.bio) updateData.bio = bio;
    if (location !== target.location) updateData.location = location;
    if (company !== target.company) updateData.company = company;
    if (websiteUrl !== target.websiteUrl) updateData.websiteUrl = websiteUrl;
    if (organizationId !== target.organizationId && organizationId) {
      updateData.organization = { connect: { id: organizationId } };
    }

    await tx.person.update({ where: { id: targetId }, data: updateData });
    await tx.person.delete({ where: { id: sourceId } });

    return {
      identitiesMoved,
      eventsMoved: eventMove.count,
      signalsMoved: signalMove.count,
      interestsMoved: interestMove.count,
    };
  });
}
