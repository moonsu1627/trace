# Trace — Launch Links

> **사용법**: 위에서 아래로 시간 간격 두고 클릭. 클릭하면 각 플랫폼의 compose 화면이 prefilled 상태로 열림. 검토 후 Submit.
>
> **발사 인터벌** (사장님 손 1시간):
> ```
> T+0      Hacker News         (45분 대기)
> T+0:45   Twitter thread      (1시간 대기)
> T+1:45   LinkedIn            (30분 대기)
> T+2:15   Bluesky             (30분 대기)
> T+2:45   dev.to              (30분 대기)
> T+3:15   Reddit r/SideProject (30분 대기)
> T+3:45   Reddit r/IndieHackers
> ```
> Product Hunt는 화/수/목 다른 날 발사.

---

## T+0 — Hacker News (Show HN)

**🔗 [Submit (prefilled URL + title)](https://news.ycombinator.com/submitlink?u=https%3A%2F%2Ftrace-web-srye.vercel.app&t=Show%20HN%3A%20Trace%20%E2%80%93%20a%20GitHub-native%20signal%20engine%20for%20devtool%20founders)**

Prefills:
- URL: `https://trace-web-srye.vercel.app`
- Title: `Show HN: Trace – a GitHub-native signal engine for devtool founders`

**바로 다음 액션**: Submit 후 자기 자신 글에 첫 댓글 즉시 달기.
첫 댓글 본문은 `marketing/hackernews.md` 의 **First comment** 섹션 전체 복붙.

---

## T+45m — Twitter / X (Thread)

**🔗 [Compose first tweet (prefilled)](https://twitter.com/intent/tweet?text=Developers%20leak%20intent%20everywhere.%0A%0AGitHub%20stars%2C%20issue%20comments%2C%20PR%F0%9F%91%8Ds%2C%20docs%20visits%2C%20waitlist%20signups%2C%20X%20mentions.%0A%0AYour%20CRM%20doesn't%20see%20any%20of%20it.%20It%20asks%20you%20to%20type.%0A%0AI'm%20building%20Trace.%20A%20developer%20signal%20engine.%0A%0Ahttps%3A%2F%2Ftrace-web-srye.vercel.app)**

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

**🔗 [Compose first post (prefilled)](https://bsky.app/intent/compose?text=Developers%20leave%20intent%20everywhere.%20Stars%2C%20issues%2C%20PR%F0%9F%91%8Ds%2C%20docs%20visits%2C%20waitlist%20signups%2C%20X%20mentions.%0A%0AYour%20CRM%20doesn't%20see%20any%20of%20it.%20It%20asks%20you%20to%20type.%0A%0AI'm%20building%20Trace.%20A%20signal%20engine%20for%20one%20developer%20who%20ships.%0A%0Ahttps%3A%2F%2Ftrace-web-srye.vercel.app)**

Prefilled = Post 1. Submit 후 thread reply 형식으로 Post 2~5 추가.

Post 2~5: `marketing/bluesky.md` 의 `## Post N` 섹션.

---

## T+2h 45m — dev.to (수동, prefill 미지원)

**🔗 [New post](https://dev.to/new)**

dev.to는 markdown editor prefill 없음. 수동.

전체 본문: `marketing/devto.md` 의 `## Body` 섹션 + Title 선택.

Tags: `webdev, nextjs, prisma, buildinpublic` (4 max).

---

## T+3h 15m — Reddit r/SideProject

**🔗 [Submit (prefilled title)](https://www.reddit.com/r/SideProject/submit?title=I%20killed%20my%20own%20CRM%20after%2017%20days%20and%20rebuilt%20it%20as%20a%20signal%20engine%20%E2%80%94%20here's%20the%20data%20model&selftext=true)**

Prefilled = title만. body는 수동 복붙 (URL 길이 한계 회피).

Body: `marketing/reddit.md` 의 `## r/SideProject` 섹션 **Body** 전체.

---

## T+3h 45m — Reddit r/IndieHackers

**🔗 [Submit (prefilled title)](https://www.reddit.com/r/IndieHackers/submit?title=Killed%20my%2017-day-old%20MVP.%20Rebuilt%20with%20a%20new%20schema.%20Here's%20why.&selftext=true)**

Prefilled = title. body 수동.

Body: `marketing/reddit.md` 의 `## r/IndieHackers` 섹션 **Body** 전체.

---

## T+24h+ — Product Hunt (다른 날, 화/수/목 12:01 AM PT)

**🔗 [Create new post](https://www.producthunt.com/posts/new)**

PH는 prefill X. dashboard 폼 채움.

자료: `marketing/producthunt.md` 의 Tagline · Description · Maker comment · Gallery 등.

---

## 자동 publishing 안 함

이 launcher의 어느 클릭도 자동으로 publish 안 합니다. 각 플랫폼의 compose/preview 화면이 열릴 뿐 — 사장님이 Submit 버튼 누를 때까지 외부에 나가지 않음.

## 발사 전 마지막 체크

- [ ] 각 플랫폼 로그인 상태 (HN, X, LinkedIn, Bluesky, dev.to, Reddit, PH)
- [ ] Reddit account karma 충분 (r/SideProject·IndieHackers는 0 karma도 OK인 편)
- [ ] Trace URL 마지막 ping: https://trace-web-srye.vercel.app → 200 확인
- [ ] Neon dashboard 열어둠 (실시간 가입자 row 보면서 모니터링)
- [ ] 답장할 준비 — 첫 6시간이 가장 중요
