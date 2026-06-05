/* lib/signals.ts — Person 활동으로부터 rule-based signal 계산.
 *
 * 3 signal:
 *   high_intent       — issue 또는 PR을 열었음 (passive star 너머의 의도)
 *   power_user        — 누적 weighted score ≥ 10 (반복 engager)
 *   feature_advocate  — PR을 열었음 (코드 기여)
 *
 * deterministic — 같은 event 집합이면 같은 signal. /api/ingest가 createMany 직후
 * recomputeSignalsForPerson을 호출. 룰 조건이 monotonic이라 한 번 fire하면 유지
 * (자동 해제 없음; status는 수동 mute/resolve용).
 */

import { prisma, type Prisma } from "@trace/db";

export type SignalKey = "high_intent" | "power_user" | "feature_advocate";

export const SIGNAL_LABEL: Record<SignalKey, string> = {
  high_intent: "high intent",
  power_user: "power user",
  feature_advocate: "feature advocate",
};

interface SignalDecision {
  key: SignalKey;
  reason: string;
  evidence: Record<string, unknown>;
}

const POWER_USER_THRESHOLD = 10;

/** 한 person의 모든 event를 읽어 룰을 평가하고 fire하는 signal을 upsert. */
export async function recomputeSignalsForPerson(
  workspaceId: string,
  personId: string,
  now: Date = new Date(),
): Promise<void> {
  const events = await prisma.event.findMany({
    where: { workspaceId, personId },
    select: { key: true, weight: true },
  });
  if (events.length === 0) return;

  for (const d of evaluateRules(events)) {
    await prisma.signal.upsert({
      where: {
        workspaceId_personId_key: { workspaceId, personId, key: d.key },
      },
      create: {
        workspaceId,
        personId,
        key: d.key,
        status: "active",
        reason: d.reason,
        evidence: d.evidence as Prisma.InputJsonValue,
        firstFiredAt: now,
        lastFiredAt: now,
      },
      update: {
        reason: d.reason,
        evidence: d.evidence as Prisma.InputJsonValue,
        lastFiredAt: now,
      },
    });
  }
}

function evaluateRules(
  events: Array<{ key: string; weight: number }>,
): SignalDecision[] {
  const out: SignalDecision[] = [];
  const issuesOpened = events.filter((e) => e.key === "github.issue_opened").length;
  const prsOpened = events.filter((e) => e.key === "github.pr_opened").length;
  const totalWeight = events.reduce((s, e) => s + e.weight, 0);

  if (issuesOpened > 0 || prsOpened > 0) {
    out.push({
      key: "high_intent",
      reason: `opened ${issuesOpened} issue(s) and ${prsOpened} PR(s) — beyond passive star`,
      evidence: { issuesOpened, prsOpened },
    });
  }
  if (totalWeight >= POWER_USER_THRESHOLD) {
    out.push({
      key: "power_user",
      reason: `weighted engagement ${totalWeight} ≥ ${POWER_USER_THRESHOLD}`,
      evidence: { totalWeight, eventCount: events.length },
    });
  }
  if (prsOpened > 0) {
    out.push({
      key: "feature_advocate",
      reason: `opened ${prsOpened} PR(s) — contributed code`,
      evidence: { prsOpened },
    });
  }
  return out;
}
