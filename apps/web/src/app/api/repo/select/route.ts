/* POST /api/repo/select — 추적할 repo 선택. Integration.metadata.trackedRepo에 저장. */

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@trace/db";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

const InputSchema = z.object({
  repo: z
    .string()
    .regex(/^[\w.-]+\/[\w.-]+$/u, "Expected owner/repo format."),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = InputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid repo." },
      { status: 400 },
    );
  }

  const integration = await prisma.integration.findFirst({
    where: { workspaceId: session.workspaceId, source: "github" },
  });
  if (!integration) {
    return NextResponse.json({ error: "GitHub not connected." }, { status: 400 });
  }

  await prisma.integration.update({
    where: { id: integration.id },
    data: { metadata: { trackedRepo: parsed.data.repo } },
  });

  return NextResponse.json({ ok: true });
}
