/* POST /api/people/merge — 두 Person을 하나로 합침 (수동 dedup).
 *
 * Body: { targetId, sourceId } — sourceId의 모든 Identity·Event·Signal·Interest가
 * targetId로 옮겨가고 sourceId Person은 삭제된다. 세션 워크스페이스의 사람만 허용.
 *
 * UI는 /people/[id]의 "merge into…" 액션이 호출. POST만 노출 — 비가역.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { mergePeople, MergePeopleError } from "@/lib/identity";
import { recomputeSignalsForPerson } from "@/lib/signals";

export const runtime = "nodejs";

const InputSchema = z.object({
  targetId: z.string().min(1),
  sourceId: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = InputSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json({ error: first?.message ?? "Invalid input." }, { status: 400 });
  }

  const { targetId, sourceId } = parsed.data;
  try {
    const result = await mergePeople({ workspaceId: session.workspaceId, targetId, sourceId });
    // 이관 후 target 기준으로 signal 재계산 — 합쳐진 event로 새 룰이 fire할 수 있다.
    await recomputeSignalsForPerson(session.workspaceId, targetId);
    return NextResponse.json({ ok: true, targetId, ...result });
  } catch (err) {
    if (err instanceof MergePeopleError) {
      const status = err.code === "not_found" ? 404 : 400;
      return NextResponse.json({ error: err.message, code: err.code }, { status });
    }
    console.error("[merge] failed", err);
    return NextResponse.json({ error: "Merge failed." }, { status: 500 });
  }
}
