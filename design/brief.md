# Trace — Design Brief (Figma용)

> 사장님이 Figma에서 landing 초안 만들 때 막히지 않게 정리. 강제 아니라 가이드.
> 끝나면 share link · screenshot 코다리에 주시면 React + Tailwind v4로 1:1 구현.

---

## 핵심 한 줄

**Developer signal engine.** 솔직·계산된 카피 + 데이터 친화 톤. "Tool, not toy. Sensor, not magic."

---

## 사용자 첫 인상에 도달해야 할 메시지 (priority 순)

1. *"이건 CRM 아니다. 다른 종류의 도구다."* — 첫 화면에서 식별 가능
2. *"개발자(나)를 위한 도구다."* — 사용자가 자기 정체성과 연결
3. *"진짜 신호를 다룬다. mockup 아니다."* — 솔직한 build-in-public 정체성
4. *"가입은 가벼운 결정이다."* — 폼 1개, 즉시

---

## 톤 (사장님 회사 미션 기반)

- ✅ 차분 · 정확 · 과장 없음
- ✅ 데이터 친화 · 정직한 limitation 표시
- ✅ Signal · timeline · person 어휘
- ❌ "AI revolution" · "magical" · "smart" 같은 hype 단어
- ❌ Contact · Deal · Pipeline · Stage (Trace 금지언어)
- ❌ 스톡 사진 · 가짜 대시보드 mockup (Stage 0 정직성)

---

## 참조 사이트 (Figma 시작 영감)

| 사이트 | 무엇을 참고 | 비고 |
|---|---|---|
| **linear.app** | 미니멀 · monochrome · 큰 typography · clean spacing | 가장 가까운 톤 |
| **attio.com** | dense data feel · table·timeline 시각 | Trace의 timeline view 미리 그릴 때 |
| **plain.com** | quiet · serif·sans 혼용 · 적당한 brand color | 무난한 신뢰감 |
| **resend.com** | 개발자 친화 · code block · 단정 | 코드 친화 폰트 톤 |
| **cal.com** | open source + 개인 사용자 + 따뜻함 | "1인 개발자용" 정체성 |
| **railway.app** | bold gradient · 강한 vibe (사장님이 더 화려하게 가고 싶다면) | 강한 hero가 필요할 때 |
| **vercel.com** | enterprise + developer + dark mode 우수 | dark theme 참고 |

추천 순위: linear → plain → cal → attio. 무거우면 plain 1개만 보고 따라가도 충분.

---

## 디자인 시스템 (변경 자유, 권장값)

### Color tokens — 현재 landing 값
```
--color-ink:          #0a0a0a    /* primary text */
--color-paper:        #fafafa    /* background */
--color-mute:         #6b7280    /* secondary text */
--color-line:         #e5e7eb    /* borders */
--color-accent:       #14532d    /* deep green, brand accent */
--color-accent-soft:  #d1fae5    /* accent badge bg */
```

사장님 자유 변경. 단 accent 1개 유지 권장 (multi-accent 가면 톤 산만).

대안 brand color 후보 (사장님 취향):
- **현재 deep green** — calm · trustworthy
- **deep navy** (`#0c2340`) — finance·serious
- **monochrome only** (no accent) — extreme minimal
- **electric blue** (`#1d4ed8`) — devtool standard
- **warm clay** (`#9a3412`) — warm·distinctive

### Typography
- **Sans**: Inter (기본) · Geist (Vercel) · 또는 system stack
- **Mono**: JetBrains Mono · IBM Plex Mono · Geist Mono
- **권장**: Sans for hero/body, Mono for code/labels/eyebrows (현재처럼)

### Spacing scale
- Tailwind 기본 (4px step) — 디자인 도구도 4px grid
- 권장 max-width: **720–960px** (long-form text), **1200–1280px** (full layout)
- Section vertical gap: **80–120px**

### Radius
- 현재: 8–12px (rounded-lg, rounded-xl). 사장님 취향대로.
- brutalist 가고 싶으면 0px도 OK

### Breakpoint
- 320 (small mobile) · 640 (mobile) · 768 (tablet) · 1024 (laptop) · 1280 (desktop)
- Figma frame 권장: 1440 (desktop primary), 390 (mobile primary)

---

## 키 섹션 spec (현재 → Figma)

### 1. Header (sticky 또는 정적)
- 좌측: 로고 + brand mark (현재: `● trace`)
- 우측: waitlist anchor 또는 login (login은 MVP 후)

### 2. Hero
- Eyebrow: `Developer Signal Engine` (mono, uppercase, tracked)
- H1: 한 줄 또는 두 줄. 현재: "Know who's about to buy. Before they email you."
- Subhead: 50–80 단어. 무엇을 하는지 한 단락
- CTA: "Join the waitlist" 또는 직접 폼

### 3. Feature triplet (선택)
- 3 step 또는 3 feature
- 현재: "Connect GitHub" → "See one timeline" → "Get a daily Top 5"
- 사장님 결정: 유지 / 축소 / 확장

### 4. Anti-CRM box (브랜드 정체성)
- 박스 또는 분리 섹션
- 핵심: "CRMs ask you to type. Trace listens."
- 모델 비교 (Contact·Deal·Stage·Pipeline vs Person·Event·Signal·Timeline)

### 5. (NEW 권장) "Coming in MVP" 섹션
- 발사 visitor가 "지금 뭐 있고 4-6주 뒤 뭐 있나" 명확화
- 솔직한 timeline: ✅ today / ⏳ week 1–6
- **mockup 그림 절대 X** (Stage 0 정신, Fake 제거)

### 6. (NEW 옵션) Founder note
- 짧은 단락 — "왜 이걸 만드는지" 빌더 시점
- 빌더 사진 또는 이니셜 정도

### 7. Waitlist 폼
- 현재: email + github + note
- 사장님 결정: 단순화 (email only) vs 유지

### 8. Footer
- 현재 (링크 제거): `built by moonsu company · global indie · 2026`
- 사장님 결정

---

## 다크 모드?

- **현재 X** (light only). 사장님 결정 — light only / dark only / 둘 다.
- devtool 청중은 dark 선호. 단 dark theme 만들면 design 2배.
- 추천: **light only로 시작 → MVP 후 dark 추가**.

---

## Figma 권장 워크플로우

1. 새 file, frame 두 개 만들기: `Landing 1440` · `Landing 390`
2. Color · text style 정의 (위 token 참고)
3. 1440 frame부터 hero → CTA로 wireframe
4. block 단위 디자인 — header · hero · features · CTA · footer
5. Figma share → `Anyone with the link → can view` → 그 link을 Claude 창에
6. 코다리가 link 받아 React + Tailwind v4로 1:1 구현 (1–2시간)

---

## 사장님이 결정해야 할 핵심 5개

1. **Accent color** — green 유지 vs 다른 색
2. **다크 모드** — light only / dark only / 둘 다
3. **Hero copy** — 현재 그대로 vs 다른 버전
4. **"Coming in MVP" 섹션 포함?** (Stage 0 정직성, 권장 ✓)
5. **Founder note 포함?** (신뢰 + 인간미, 권장 ✓)

이 5개만 Figma 작업 전에 정해주시면 코다리 구현이 더 빠릅니다.

---

*This brief is a guide, not a constraint. 사장님 디자인 직감 우선. Figma 끝나면 share link로 던져주세요.*
