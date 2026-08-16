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

## 템플릿에서 바꾼 것

- 패키지 매니저: pnpm → npm (이 머신에 pnpm 없음, package-lock.json이 정본)
- `@astrojs/sitemap`을 3.2.1로 고정 — 3.7.x는 Astro 5용이라 astro 4.16 빌드가
  `astro:build:done`에서 깨진다. astro를 5로 올리기 전에는 sitemap을 올리지 마라
- `rss.xml.js`의 핸들러 `get` → `GET` (Astro 4에서 소문자 제거됨)
- 데모 콘텐츠(post1~3, store, services, cv, projects)와 저자 프로필·소셜 링크 제거
- `public/profile.webp`·`social_img.webp`·`favicon.svg`는 생성한 임시 모노그램 —
  실제 사진/로고로 교체 예정

## 공백

- About/CV/Projects 페이지 없음 — 의도된 상태. 인터뷰로 내용이 쌓이면 얹는다
- 프로필 이미지가 임시 모노그램
- README.md가 아직 템플릿(Astrofy) 원문 — 사이트 소개로 교체 필요
