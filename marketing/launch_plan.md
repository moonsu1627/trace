# Trace — Launch Plan

> 사장님 깨어나서 **1시간 안에 발사** 끝내는 체크리스트.
> 모든 자산은 이 폴더 안에 영문으로 준비됨. 사장님 손은 복붙·클릭만.

---

## Pre-flight (15 min)

```
✓ landing URL 살아있나? → https://trace-web-srye.vercel.app (검증 완료, GET 200 + POST /api/waitlist {"ok":true})
✓ waitlist 폼 row 적재 확인 — Neon에 production signup 들어감
✓ GitHub repo public push — github.com/moonsu1627/trace (commit 186a5ab)
✓ 도메인 — trace 변형 13개 다 등록. vercel.app 그대로 발사. 발사 후 PMF 신호 보고 .dev squatter 협상 또는 새 이름 검토.
□ landing OG 이미지 1개 — 없으면 발사 후 추가, blocker 아님
□ X·dev.to·HN·Reddit·LinkedIn·Bluesky·PH 계정 로그인 상태 확인
```

---

## Launch sequence (45 min)

> 순서가 중요. HN을 가장 먼저, X는 그 뒤 1시간, Reddit은 더 늦게.
> HN이 front page에 올라가면 X 트래픽이 따라옴 (역순 안 됨).

### T+0 — Hacker News (Show HN)

```
□ news.ycombinator.com/submit
□ Title 복붙 (marketing/hackernews.md의 옵션 A)
□ URL: <live domain>
□ Submit
□ "First comment" 본문 복붙 → reply 즉시
□ 다음 30분 새로고침하면서 댓글 답장. 욕은 단답 + 차분.
```

### T+45 min — Twitter / X thread

```
□ x.com/compose/post
□ marketing/twitter_thread.md의 7개 트윗 순서대로 ("Add" 버튼)
□ 마지막에 "Pinned reply" 추가
□ HN 링크는 thread 끝에 한 줄 reply로 ("Just shared on HN — https://news.ycombinator.com/item?id=...")
```

### T+1h — LinkedIn

```
□ Post body 복붙 (marketing/linkedin.md)
□ Publish
□ First comment에 트레이스 링크 + GitHub repo 링크 박기
```

### T+1.5h — Bluesky

```
□ bsky.app/compose
□ marketing/bluesky.md의 5 post 순서대로 (thread)
□ #buildinpublic 마지막 post에만
```

### T+2h — dev.to

```
□ dev.to/new
□ marketing/devto.md 전체 복붙
□ Title 위의 옵션 중 1개
□ Tags: webdev, nextjs, prisma, buildinpublic (4개)
□ Cover image: landing screenshot (optional)
□ Publish
□ 같은 글 Hashnode·Medium 크로스포스트는 dev.to 발사 24h 뒤 (SEO 충돌 회피)
```

### T+3h — Reddit (2 subs)

```
□ r/SideProject 먼저 — marketing/reddit.md의 r/SideProject section
□ 30분 뒤 r/IndieHackers — 다른 톤 복붙
□ r/devtools는 옵션 (small sub, 추후)
□ 같은 시간에 두 sub 올리면 spam 플래그
```

### T+24h — Product Hunt (다음 주 화/수/목 권장)

```
□ producthunt.com/posts/new
□ marketing/producthunt.md의 모든 필드 복붙
□ Tagline 옵션 중 1개
□ Cover GIF/이미지 4–6장
□ Maker comment 발사 즉시 reply
□ Tuesday/Wednesday/Thursday 12:01 AM PT 발사 (24h 완전 사이클)
```

---

## 첫 24h 모니터링

```
□ 1시간마다 — HN comments, X replies, Reddit DMs 확인
□ Neon dashboard → WaitlistEntry 행 수 증가 모니터링
□ 의미있는 질문은 답, 트롤은 한 번 답하고 멈춤
□ X에서 누가 RT하면 짧게 thank you + 그 사람 GitHub bio 확인 (Trace 의 첫 dogfood)
□ 모든 가입자 이메일에 personal note (자동화 X — 손편지 톤)
```

---

## 발사 후 — V2 reality adapter 첫 신호

waitlist에 첫 외부 사용자 1명 들어오는 순간:

```
□ trace/packages/integrations/src/waitlist/index.ts 생성 (real adapter)
□ Prisma waitlistEntry.count() → V2 RealitySnapshot에 진짜 metric
□ V2 loop에 mock 제거 — 첫 진짜 외부 신호로 작동
□ V2 score "first signal received" 마커 박기 — 회사가 진짜 깨어남
```

이게 사장님 비전 "외부 데이터를 먹고 학습하는 OS"의 첫 비트.

---

## 발사하지 말아야 할 곳 (적어도 아직)

- ❌ HN Ask HN — Show HN로 가야 함
- ❌ r/programming — 다른 톤 (메타 토론 위주). 발사 24h+ 후 Trace 빌드 후기 글로 따로
- ❌ Korean 채널 (디스콰이엇·뽐뿌·etc) — 타깃 global이라 의도적 skip
- ❌ Facebook — 빈도 0
- ❌ TikTok·인스타 — devtool 타깃 X
- ❌ Indie Hackers main feed의 "Show & Tell" — Reddit 발사 후 일주일 텀

---

## 위기 상황 매뉴얼

**HN front page 진입 후 5xx 에러 폭주 시:**
- Vercel dashboard → Function logs 확인
- Neon connection pool 한도 — pooled DATABASE_URL (`-pooler` suffix) 쓰고 있는지 확인. 아니면 Neon dashboard에서 pooled URL로 바꿔 Vercel env var 갱신.
- 큰 트래픽이면 Cloudflare 앞단 (Vercel 자체 CDN으로 충분할 가능성 더 큼)

**누가 보안 이슈 제보 (waitlist 폼 SQL injection 등) — 가능성 낮지만:**
- 즉시 답장: "확인 중. 30분 내에 패치." 그러고 진짜로 패치.
- Prisma는 parameterized 쿼리이므로 SQLi는 불가. 단 email validation은 zod로 처리됨. 다른 벡터 있으면 패치.

**Bot 가입 폭주:**
- Cloudflare Turnstile 도입 (15 min 작업) — 그 전에 IP rate-limit (이미 코드 없음 → 추가 필요).
- waitlist API에 IP 해시 + 24h 1회 제한 추가 (10 min 작업)

---

## 일정 추천

- **D+0 (오늘 사장님 깨어나는 날)**: GitHub repo·Vercel deploy 마무리. 도메인 확정. 마케팅 자산 마지막 검수. **발사 X.**
- **D+1**: 모든 자산 영문 검수 + landing screenshot 1장. 마지막 점검.
- **D+2 화요일 또는 수요일 06:30 PT**: HN 발사 → 45분 후 X → 그 다음 LinkedIn·Bluesky·dev.to·Reddit 순.

**충분히 자고 발사**. 발사 직전 새벽 코딩 금지. 발사 후 첫 6시간이 가장 중요해서 사장님이 깨어있어야 함.

---

## 발사 책임자

- 발사 자체: **사장님 직접** (계정·OAuth·publish 모두 사장님 손)
- 자산 준비·복붙 가능한 모양·체크리스트: **코다리 (=Claude)** 사전 완료
- 발사 후 모니터링: **사장님이 직접** 첫 24h, **코다리**는 Neon/Vercel logs·V2 loop 보조
- 댓글·DM 답장: **사장님 직접**. 봇 답장 X. 사장님 정체성이 자산.

---

*This plan written by 코다리 while 사장님 sleeps. 사장님이 일어나서 한 줄도 안 고쳐도 발사 가능하게 만듦.*
