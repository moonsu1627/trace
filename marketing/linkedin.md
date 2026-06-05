# LinkedIn — Launch Post

> Account: 사장님 LinkedIn
> Time: Tue–Thu, 08:00–10:00 KST (overlap with US morning)
> Length: ~1300 chars (LinkedIn truncates after ~210, so first 2 lines must hook)
> No external link in main body (LinkedIn deprioritizes). Drop link in first comment.

---

## Post body

I killed my own SaaS after 17 days.

Not because of bad code. Because I was building a product for a market that doesn't exist.

For two weeks I was shipping a "developer CRM" — a lighter HubSpot for solo developers. The problem: solo developers don't buy CRMs. They run on Notion until they outgrow it, then they jump straight to Attio. There is no middle for a new entrant to occupy.

But the thing I kept doing during those 17 days, obsessively, was something else:

→ checking GitHub traffic
→ exporting waitlist CSVs
→ searching my domain on X
→ scanning Linear comments for the same handle

Not "managing a pipeline." Just trying to see **who was paying attention**.

That, I realized, is a different product. It's a signal engine, not a CRM.

So I rebuilt as Trace.

The data model:
Person → Event → Signal → Timeline

What it shows you:
5 people every morning, surfaced by 3 rule-based signals (high intent · power user · feature advocate). Not a feed. Not a dashboard. A short list.

What it deliberately is not:
Not a CRM. Not enterprise-priced. Not a multi-seat tool. Trace is for the one developer who ships, not a sales team that types.

Three lessons from killing v1 to start v2:

1. The category matters more than the product. "Developer CRM" is a graveyard. I should have checked the graveyard first.

2. Forbidden-words lists are a feature. Before the rebuild I wrote down what Trace cannot say: Contact, Deal, Stage, Pipeline, lead. The schema can't drift back into sales-team land if the vocabulary blocks it.

3. Build the operating substrate, not just the product. Half my time the first week of the rebuild was rebuilding the autonomous loop so it stops repeating its own decisions back to itself. Sounds like overengineering. It is the difference between a tool that learns and a tool that hallucinates.

Pre-launch, waitlist-only. First 100 builders get the founding plan.

(Link in the comments.)

---

## First comment (drop link here)

🔗 trace-web-srye.vercel.app/pricing

GitHub: github.com/moonsu1627/trace

If you've ever stared at GitHub Insights, your waitlist CSV, and your Stripe customer list in three different tabs trying to figure out who matters today — let me know. Looking for the first 20 signups to tell me which of the three baseline signals is wrong.

---

## Hashtags (use only 3 — LinkedIn algorithm prefers focus)
#buildinpublic #saas #developertools

---

## Post body — 한국어 버전 (사장님 LinkedIn 네트워크가 한국 위주일 때)

> 영문/한국어 중 사장님 네트워크에 맞는 쪽 선택. 둘 다 올리지 말 것 — 하나만.

17일 만에 제가 만들던 SaaS를 접었습니다.

코드가 나빠서가 아닙니다. 존재하지 않는 시장을 위한 제품을 만들고 있었기 때문입니다.

2주 동안 저는 "개발자용 CRM" — 1인 개발자를 위한 가벼운 HubSpot — 을 만들고 있었습니다. 문제는 이거였어요: 1인 개발자는 CRM을 사지 않습니다. Notion으로 버티다가, 한계가 오면 곧장 Attio로 넘어갑니다. 신규 진입자가 비집고 들어갈 중간 지대가 없었습니다.

그런데 그 17일 동안 제가 강박적으로 계속 하던 일은 따로 있었습니다.

→ GitHub 트래픽 확인
→ waitlist CSV 내보내서 들여다보기
→ X에서 제 도메인 검색
→ Linear 댓글에서 같은 사람 찾기

"파이프라인 관리"가 아니었습니다. 그냥 — 누가 우리에게 관심을 두고 있는지 보고 싶었던 겁니다.

그게 다른 제품이라는 걸 깨달았습니다. CRM이 아니라 시그널 엔진입니다.

그래서 Trace로 다시 만들었습니다.

데이터 모델:
Person → Event → Signal → Timeline

보여주는 것:
매일 아침 5명. 3개의 규칙 기반 시그널(high intent · power user · feature advocate)로 추려진 사람들. 피드도, 대시보드도 아닙니다. 짧은 명단입니다.

의도적으로 "아닌" 것:
CRM 아님. 엔터프라이즈 가격 아님. 멀티시트 아님. Trace는 타이핑하는 영업팀이 아니라, 출시하는 한 명의 개발자를 위한 도구입니다.

v1을 죽이고 v2를 시작하며 배운 3가지.

1. 제품보다 카테고리가 중요합니다. "개발자 CRM"은 무덤이었습니다. 무덤부터 확인했어야 했어요.

2. 금지어 목록은 그 자체로 기능입니다. 다시 만들기 전에 Trace가 절대 쓸 수 없는 단어를 적었습니다 — Contact, Deal, Stage, Pipeline, lead. 어휘가 막아주면 스키마가 영업팀 사고방식으로 되돌아가지 못합니다.

3. 제품만이 아니라 그 아래 운영 기반을 만들어야 합니다. 재구축 첫 주의 절반을, 자율 루프가 자기 결정을 스스로에게 반복하지 않도록 다시 짜는 데 썼습니다. 과한 설계처럼 보이지만 — 학습하는 도구와 환각하는 도구의 차이입니다.

출시 전이고, 지금은 waitlist만 받습니다. 첫 100명에게 파운딩 플랜을 드립니다.

(링크는 댓글에 둡니다.)

### 한국어판 첫 댓글
🔗 trace-web-srye.vercel.app/pricing
GitHub: github.com/moonsu1627/trace

GitHub Insights, waitlist CSV, Stripe 고객 목록을 세 개의 탭에 띄워놓고 "오늘 누구한테 연락해야 하지" 고민해 본 적 있다면 — 편하게 말 걸어주세요. 첫 20명의 가입자에게서 "세 가지 기준 시그널 중 뭐가 틀렸는지" 듣고 싶습니다.

### 한국어판 해시태그
#빌드인퍼블릭 #1인창업 #개발자도구
