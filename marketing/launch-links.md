# Trace — Launch Links

> **사용법**: 위에서 아래로 시간 간격 두고 클릭. 클릭하면 각 플랫폼의 compose 화면이 prefilled 상태로 열림. 검토 후 Submit.
>
> **오늘 발사 인터벌** (5채널, 사장님 손 ~3시간):
> ```
> T+0      Hacker News         (45분 대기)
> T+0:45   Twitter thread      (1시간 대기)
> T+1:45   LinkedIn            (30분 대기)
> T+2:15   Bluesky             (30분 대기)
> T+2:45   dev.to
> ```
> ⏸ **Reddit 2채널 — 오늘 제외.** 새 계정은 r/SideProject·IndieHackers 자동 제거 위험.
> 계정 만들어 며칠 댓글로 karma 키운 뒤 1주 후 별도 발사.
> ⏸ Product Hunt — 화/수/목 다른 날.

---

## ⏸ Hacker News (Show HN) — 오늘 제외 (계정 익은 후)

HN이 신규 계정 Show HN을 일시 제한 중. 새 계정으로는 게시 불가.
→ HN 계정 며칠 댓글·업보트로 익힌 뒤 (1~2주) Show HN. 그때는 "이미 N명 waitlist 모은 프로젝트"라 오히려 더 강함.
링크 (나중): `news.ycombinator.com/submitlink?u=...&t=Show HN: Trace ...`
첫 댓글: `marketing/hackernews.md` First comment 섹션.

---

## T+0 — Twitter / X (Thread)

**🔗 [Compose first tweet (prefilled)](https://twitter.com/intent/tweet?text=Developers%20leak%20intent%20everywhere.%0A%0AGitHub%20stars%2C%20issue%20comments%2C%20PR%F0%9F%91%8Ds%2C%20docs%20visits%2C%20waitlist%20signups%2C%20X%20mentions.%0A%0AYour%20CRM%20doesn't%20see%20any%20of%20it.%20It%20asks%20you%20to%20type.%0A%0AI'm%20building%20Trace.%20A%20developer%20signal%20engine.%0A%0Ahttps%3A%2F%2Ftrace-web-srye.vercel.app%2Fpricing)**

Prefilled = Tweet 1 (hook). Submit 후 그 트윗에 reply 식으로 Tweet 2~7 차례로 추가.

Tweet 2~7 본문: `marketing/twitter_thread.md` 의 각 `## Tweet N` 섹션.

마지막 reply: HN 글 URL 한 줄 (`Just shared on HN — <link>`).

---

## T+1h 45m — LinkedIn (수동, prefill 미지원)

**🔗 [Compose](https://www.linkedin.com/feed/)**

LinkedIn은 text post prefill 안 됨. 수동 복붙.

본문: `marketing/linkedin.md` 전체 (publish 직후 첫 댓글에 trace URL + GitHub URL).

---

## T+2h 15m — Bluesky

**🔗 [Compose first post (prefilled)](https://bsky.app/intent/compose?text=Developers%20leave%20intent%20everywhere.%20Stars%2C%20issues%2C%20PR%F0%9F%91%8Ds%2C%20docs%20visits%2C%20waitlist%20signups%2C%20X%20mentions.%0A%0AYour%20CRM%20doesn't%20see%20any%20of%20it.%20It%20asks%20you%20to%20type.%0A%0AI'm%20building%20Trace.%20A%20signal%20engine%20for%20one%20developer%20who%20ships.%0A%0Ahttps%3A%2F%2Ftrace-web-srye.vercel.app%2Fpricing)**

Prefilled = Post 1. Submit 후 thread reply 형식으로 Post 2~5 추가.

Post 2~5: `marketing/bluesky.md` 의 `## Post N` 섹션.

---

## T+2h 45m — dev.to (수동, prefill 미지원)

**🔗 [New post](https://dev.to/new)**

dev.to는 markdown editor prefill 없음. 수동.

전체 본문: `marketing/devto.md` 의 `## Body` 섹션 + Title 선택.

Tags: `webdev, nextjs, prisma, buildinpublic` (4 max).

---

## ⏸ Reddit r/SideProject — 오늘 제외 (1주 후)

새 계정 자동 제거 위험. Reddit 계정 만들어 며칠 진짜 댓글로 karma 50~100 쌓은 뒤 게시.
1주 후 "발사 후기" 톤으로 — 갓 만든 빈 프로젝트보다 진행 중인 게 r/SideProject에서 설득력 큼.

링크 (1주 후 사용): `reddit.com/r/SideProject/submit?title=...&selftext=true`
Body: `marketing/reddit.md` 의 `## r/SideProject` 섹션.

---

## ⏸ Reddit r/IndieHackers — 오늘 제외 (1주 후)

위와 동일. karma 키운 뒤 별도 발사.
Body: `marketing/reddit.md` 의 `## r/IndieHackers` 섹션.

---

## T+24h+ — Product Hunt (다른 날, 화/수/목 12:01 AM PT)

**🔗 [Create new post](https://www.producthunt.com/posts/new)**

PH는 prefill X. dashboard 폼 채움.

자료: `marketing/producthunt.md` 의 Tagline · Description · Maker comment · Gallery 등.

---

## 자동 publishing 안 함

이 launcher의 어느 클릭도 자동으로 publish 안 합니다. 각 플랫폼의 compose/preview 화면이 열릴 뿐 — 사장님이 Submit 버튼 누를 때까지 외부에 나가지 않음.

## 발사 전 마지막 체크 (오늘 5채널)

- [ ] 로그인 상태 — HN · X · LinkedIn · Bluesky · dev.to
- [ ] Trace URL ping: https://trace-web-srye.vercel.app/pricing → 200 (코다리 확인 완료)
- [ ] Neon dashboard 열어둠 (실시간 가입자 row 모니터링)
- [ ] 텔레그램 열어둠 — 발사 후 V2가 마케팅 proposal 승인 요청 보냄
- [ ] 답장할 준비 — 첫 6시간이 가장 중요
