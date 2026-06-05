/* lib/env.ts — 환경변수 접근. lazy(함수)로 읽어 미설정 시 import 시점이 아니라
 * 실제 사용 시점에 명확한 에러를 던진다 (랜딩/waitlist는 OAuth 없이 계속 동작). */

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const env = {
  githubClientId: () => required("GITHUB_CLIENT_ID"),
  githubClientSecret: () => required("GITHUB_CLIENT_SECRET"),
  /** 세션 쿠키 HMAC 서명 키. 32자 이상 랜덤. */
  sessionSecret: () => required("SESSION_SECRET"),
  /** GitHub 토큰 AES-256 암호화 키. 64 hex 문자(32바이트). */
  tokenKey: () => required("TOKEN_ENCRYPTION_KEY"),
  /** OAuth redirect_uri 베이스. 미설정 시 로컬 기본값. */
  appUrl: () => process.env.APP_URL ?? "http://localhost:3000",
  /** /admin/applications 접근 토큰. PMF 전 단계 단순 접근 제한. */
  adminToken: () => required("ADMIN_TOKEN"),
  /** Resend API key (자동 onboarding 이메일). 없으면 send 함수가 silent skip. */
  resendApiKey: () => process.env.RESEND_API_KEY ?? "",
  /** 보내는 사람 이메일. 기본 onboarding@resend.dev (Resend 무료 sender, deliverability 약함). */
  fromEmail: () => process.env.FROM_EMAIL ?? "Trace <onboarding@resend.dev>",
  /** 사장님 admin notification 받을 이메일. 없으면 admin 알림 skip. */
  adminEmail: () => process.env.ADMIN_EMAIL ?? "",
  /** PayPal — 모두 박혀있을 때만 결제 활성. 미설정 시 /pricing CTA는 베타 신청으로 유지. */
  paypalClientId: () => process.env.PAYPAL_CLIENT_ID ?? "",
  paypalClientSecret: () => process.env.PAYPAL_CLIENT_SECRET ?? "",
  /** sandbox(테스트) 또는 live(실 결제). 기본 sandbox. */
  paypalEnv: () => (process.env.PAYPAL_ENV === "live" ? "live" : "sandbox") as "live" | "sandbox",
  paypalApiBase: () =>
    process.env.PAYPAL_ENV === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com",
  /** PayPal billing plan id (PayPal Dashboard → Catalog → Plans 생성 후). */
  paypalPlanIdPro: () => process.env.PAYPAL_PLAN_ID_PRO ?? "",
  paypalPlanIdStudio: () => process.env.PAYPAL_PLAN_ID_STUDIO ?? "",
  paypalWebhookId: () => process.env.PAYPAL_WEBHOOK_ID ?? "",
  /** PayPal 활성 여부 — 핵심 env 박혀있나 한 줄 체크. */
  paypalEnabled: () =>
    !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET && process.env.PAYPAL_PLAN_ID_PRO),
};
