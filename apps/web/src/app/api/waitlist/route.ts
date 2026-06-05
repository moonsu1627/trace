import crypto from "node:crypto";
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

/** x-forwarded-for의 첫 hop만 사용. 없으면 x-real-ip. 둘 다 없으면 null. */
function clientIp(request: Request): string | null {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip");
}

/** SESSION_SECRET이 있으면 HMAC-SHA256으로 pseudonymize. 없으면 null (랜딩은 OAuth 없이도 동작). */
function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  return crypto.createHmac("sha256", secret).update(ip).digest("base64url");
}

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
  const ipHash = hashIp(clientIp(request));

  try {
    await prisma.waitlistEntry.upsert({
      where: { email },
      create: { email, githubLogin, note, referrer, ipHash, source: "landing" },
      update: { githubLogin, note, referrer, ipHash },
    });
  } catch (err) {
    console.error("[waitlist] insert failed", err);
    return NextResponse.json({ error: "Could not save your spot. Try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export const runtime = "nodejs";
