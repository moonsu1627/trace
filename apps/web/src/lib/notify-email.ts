/* lib/notify-email.ts — Resend 기반 자동 이메일.
 *
 * 사장님 결정 (2026-06-01) v201 Phase 4 — 자동 onboarding + admin notification.
 * RESEND_API_KEY 없으면 silent skip (개발 환경 또는 사장님 setup 전).
 *
 * Resend 무료 tier: 3000/mo, sender `onboarding@resend.dev` 검증 없이 사용 가능.
 * Production: 사장님 domain 등록 후 FROM_EMAIL=Trace <hello@yourdomain.com>.
 */

import { env } from "./env";

interface ResendSendBody {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  reply_to?: string;
}

async function resendSend(body: ResendSendBody): Promise<{ ok: boolean; error?: string }> {
  const key = env.resendApiKey();
  if (!key) return { ok: false, error: "RESEND_API_KEY missing" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `Resend ${res.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export interface BetaWelcomeInput {
  to: string;
  name: string;
  tier: string;
  monthlyBudget: string;
}

/** 신청자에게 자동 환영 이메일. */
export async function sendBetaWelcome(input: BetaWelcomeInput): Promise<{ ok: boolean; error?: string }> {
  const tierLabel =
    input.tier === "studio" ? "Studio Beta" : input.tier === "free" ? "Free Tier" : "Pro Beta";

  const html = `<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 40px auto; padding: 0 20px; color: #111;">
  <h1 style="font-size: 22px; font-weight: 600; margin: 0 0 16px;">${tierLabel} application received ✓</h1>
  <p style="font-size: 15px; line-height: 1.6;">Hi ${escapeHtml(input.name)},</p>
  <p style="font-size: 15px; line-height: 1.6;">
    Thanks for applying. We're inviting the first 10 beta users and you're in the queue.
    No card required — we'll email an invite when beta opens.
  </p>
  <p style="font-size: 15px; line-height: 1.6;">
    In the meantime, the data model and 3 baseline signals are open at
    <a href="https://github.com/moonsu1627/trace" style="color: #0070f3;">github.com/moonsu1627/trace</a>.
  </p>
  <p style="font-size: 13px; color: #666; margin-top: 32px;">
    — Trace · Developer Signal Engine
  </p>
</body>
</html>`;

  return resendSend({
    from: env.fromEmail(),
    to: input.to,
    subject: `${tierLabel} application received — Trace`,
    html,
    reply_to: env.adminEmail() || undefined,
  });
}

export interface AdminAlertInput {
  name: string;
  email: string;
  tier: string;
  monthlyBudget: string;
  currentTool: string | null;
  biggestPain: string | null;
  totalApplications: number;
  payingIntent: number;
}

const BUDGET_LABEL: Record<string, string> = {
  zero: "$0",
  small: "$5",
  standard: "$9",
  high: "$19+",
};

/** 사장님에게 새 신청자 알림. */
export async function sendAdminAlert(input: AdminAlertInput): Promise<{ ok: boolean; error?: string }> {
  const adminEmail = env.adminEmail();
  if (!adminEmail) return { ok: false, error: "ADMIN_EMAIL missing" };

  const budget = BUDGET_LABEL[input.monthlyBudget] ?? input.monthlyBudget;
  const isPaying = ["standard", "high"].includes(input.monthlyBudget);
  const tierLabel = input.tier === "studio" ? "Studio" : input.tier === "free" ? "Free" : "Pro";

  const html = `<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 40px auto; padding: 0 20px; color: #111;">
  <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 8px;">
    ${isPaying ? "💵" : "📋"} New ${tierLabel} application · ${budget}/mo
  </h1>
  <p style="font-size: 13px; color: #666; margin: 0 0 24px;">
    ${input.payingIntent} / 10 paying-intent users · ${input.totalApplications} total
  </p>
  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
    <tr><td style="padding: 8px 0; color: #666; width: 110px;">Name</td><td>${escapeHtml(input.name)}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Email</td><td><a href="mailto:${escapeHtml(input.email)}" style="color: #0070f3;">${escapeHtml(input.email)}</a></td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Budget</td><td><strong>${budget}/mo</strong></td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Tier</td><td>${tierLabel}</td></tr>
    ${input.currentTool ? `<tr><td style="padding: 8px 0; color: #666; vertical-align: top;">Current tool</td><td>${escapeHtml(input.currentTool)}</td></tr>` : ""}
    ${input.biggestPain ? `<tr><td style="padding: 8px 0; color: #666; vertical-align: top;">Biggest pain</td><td>${escapeHtml(input.biggestPain)}</td></tr>` : ""}
  </table>
  <p style="font-size: 13px; color: #666; margin-top: 32px;">
    /admin/applications 에서 KPI 확인.
  </p>
</body>
</html>`;

  return resendSend({
    from: env.fromEmail(),
    to: adminEmail,
    subject: `${isPaying ? "💵" : "📋"} ${input.name} (${budget}/mo) — Trace ${tierLabel} application`,
    html,
    reply_to: input.email,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
