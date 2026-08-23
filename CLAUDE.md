# kingcheee.github.io — 기록 사이트

kingcheee의 기록 공간. **첫 번째 독자는 미래의 나다** — 채용용 포장이 아니라 회고체로 쓴다.
채용용 About/CV/Projects 층은 나중에 이 위에 얹는다 (2026-08-16 그릴링 결정).

## 출처

Astrofy 템플릿 기반 (https://github.com/manuelernestog/astrofy, 커밋 9398dea 2024-01-08,
클론 2026-08-16). 템플릿 이력은 제거하고 새 repo로 시작했다. 삭제한 템플릿 기능
(Projects/CV/Services/Store 페이지)은 필요해지면 업스트림에서 다시 가져온다.

## 검증 명령 (2026-08-16 실측)

- `npm run build` — 정적 빌드 + Zod frontmatter 검증. **발행 전 반드시 돌린다** ✅ 통과 확인
- `npm run dev` — 로컬 개발 서버 (미실행·미확인)
- 배포: main에 push하면 GitHub Actions(`.github/workflows/deploy.yml`)가 빌드·배포한다

## 글 발행 흐름

1. 초안은 `drafts/`에 (gitignore됨 — 공개 repo에 초안을 올리지 않는다)
2. 승인된 글만 `src/content/blog/YYYY-MM-DD-slug.md`로 옮긴다
3. **파일명이 곧 URL 슬러그다** — 영문 소문자-하이픈으로 짓는다.
   `GENERATE_SLUG_FROM_TITLE`는 반드시 false 유지: 한글 제목은 슬러그 생성 규칙에
   전부 지워져 빈 슬러그가 된다 (`src/lib/createSlug.ts`)
4. frontmatter 스키마는 `src/content/config.ts` (title, description, pubDate 필수)
5. `npm run build` 통과 확인 후 commit + push

## 글 안에 이미지·다이어그램

- **이미지**: 파일을 `public/images/<글-슬러그>/`에 넣고 본문에서
  `![설명](/images/<글-슬러그>/파일명.png)`. 대표 이미지는 frontmatter `heroImage`.
- **다이어그램**: 본문에 ` ```mermaid ` 코드블록을 쓰면 브라우저에서 렌더링된다
  (PostLayout의 인라인 스크립트가 CDN mermaid@11을 블록이 있을 때만 로드. 2026-08-16 실측)

글 초안 작성은 portfolio-agent(`C:\workspace\02-sandbox\portfolio-agent`)의
`/write-post` 스킬이 담당한다 — 인터뷰→초안→승인→발행 규율이 거기 있다.

## 네이버 블로그 크로스포스팅 (2026-08-17 결정)

발행된 글을 네이버에도 올린다. **완전 자동 발행은 금지** — 네이버 약관 위반 + 봇 탐지 +
검색 저품질 페널티 (리서치: `C:\projects\00-research\2026-08\w2\2026-08-16-crossposting-naver\`).
채택 방식은 클립보드 반자동:

1. `npm run naver -- <글-슬러그>` → 마크다운을 네이버 에디터 호환 HTML로 변환해
   브라우저 미리보기(`@jjlabsio/mtnb`)를 띄운다 (`tools/to-naver.mjs`)
2. 미리보기의 [서식 복사] 클릭 → 네이버 글쓰기 본문에 Ctrl+V → 제목 입력 → 발행은 사용자가
3. 이미지·mermaid PNG는 네이버가 핫링크를 막으므로 에디터에 직접 첨부 (스크립트가 목록을 알려준다)
4. 포맷은 **전문 그대로 + 하단 원문 링크** — 검색엔진 유사문서 리스크(원본이 밀릴 수 있음)를
   안내받고 사용자가 감수하기로 결정함. 추가 채널(velog 등)은 미연결 — 필요 시 리서치 참조.

## /blog/ 갈래 탭 (회고·일기·생각) — 절대 링크로 되돌리지 마라

탭 3개는 `<button>`이다 (2026-08-23 사용자 지시 — **영구**). 링크(+JS 가로채기)로 만들면
ViewTransitions 재진입처럼 스크립트가 안 붙은 순간 클릭이 `/blog/tag/…` 페이지로 튕긴다 —
실제로 났던 사고다. JS가 꺼진 환경은 noscript 폴백이 세 갈래를 세로로 다 보여준다.
탭 초기화는 `astro:page-load`마다 다시 돈다 — 이 재초기화도 빼지 마라.

## 템플릿에서 바꾼 것

- 패키지 매니저: pnpm → npm (이 머신에 pnpm 없음, package-lock.json이 정본)
- `@astrojs/sitemap`을 3.2.1로 고정 — 3.7.x는 Astro 5용이라 astro 4.16 빌드가
  `astro:build:done`에서 깨진다. astro를 5로 올리기 전에는 sitemap을 올리지 마라
- `rss.xml.js`의 핸들러 `get` → `GET` (Astro 4에서 소문자 제거됨)
- 데모 콘텐츠(post1~3, store, services, cv, projects)와 저자 프로필·소셜 링크 제거
- **디자인 시스템 전문은 `docs/design.md`** — 팔레트·폰트·구조·수정 시 주의점.
  디자인을 바꾸면 그 파일도 갱신한다

## 공백

- About/CV/Projects 페이지 없음 — 의도된 상태. 인터뷰로 내용이 쌓이면 얹는다
- README.md가 아직 템플릿(Astrofy) 원문 — 사이트 소개로 교체 필요
- 멀티 채널 발행(네이버 블로그 등) 구상 중 — 채널 선정·업로드 방식 미정
