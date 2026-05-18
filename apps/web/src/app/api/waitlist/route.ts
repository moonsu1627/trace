import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@trace/db";

const InputSchema = z.object({
  email: z.string().email().max(200),
  githubLogin: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[A-Za-z0-9-]+$/u, "GitHub login uses A-Z, 0-9, dashes only.")
    .optional(),
  note: z.string().trim().max(280).optional(),
});

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = InputSchema.safeParse(payload);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const { email, githubLogin, note } = parsed.data;
  const referrer = request.headers.get("referer");

  try {
    await prisma.waitlistEntry.upsert({
      where: { email },
      create: { email, githubLogin, note, referrer, source: "landing" },
      update: { githubLogin, note, referrer },
    });
  } catch (err) {
    console.error("[waitlist] insert failed", err);
    return NextResponse.json({ error: "Could not save your spot. Try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export const runtime = "nodejs";
