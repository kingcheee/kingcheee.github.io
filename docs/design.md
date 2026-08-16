# 디자인 시스템 (2026-08-16 확정)

하루 동안 여러 라운드를 돌며 수렴한 최종 상태의 기록이다. 바꾸기 전에 이 파일을 읽고,
바꿨으면 이 파일도 갱신한다.

## 정체성

- 이름 표기: **김지우** (사이트 전역 — 탭 제목·상단 로고·푸터·OG. GitHub 주소만 kingcheee)
- 마스코트: 거북이 (프로필 `public/profile.webp`, 히어로 `public/turtle-hero.webp`.
  원본은 사용자 제공 `Downloads\turtle.jpg` — 초록 배경의 3D 거북이)
- 좌우명: 불광불급 (현재 화면에는 미노출 — 히어로 간소화 때 뺐다. OG 이미지에는 남아 있지 않음)

## 폰트

- **표시 텍스트(제목 h1~h4·상단 메뉴·`.font-pixel`)**: Mona12 픽셀체.
  CDN `<link>` — `https://cdn.jsdelivr.net/gh/MonadABXY/mona-font/web/mona.css` (BaseHead.astro).
  폴백 순서: `"Mona12", "Mona12 Text KR", "Pretendard Variable"`.
- **본문**: Pretendard Variable (npm `pretendard`, BaseLayout에서 CSS import).
  본문까지 픽셀로 바꾸는 안은 논의됐으나 가독성 때문에 채택 안 함.

## 팔레트 (tailwind.config.cjs의 DaisyUI `turtle` 테마)

| 토큰 | 값 | 용도 |
|---|---|---|
| base-100 | `#FEFDFA` | 바탕 — **저채도 웜화이트.** 순백↔크림 사이를 여러 번 오간 끝의 확정값 |
| base-200 | `#F7F6F0` | 옅은 면 |
| base-300 | `#EAEAE2` | 보더 (카드 ring) |
| base-content | `#23281E` | 본문 글자 |
| primary | `#2F8A25` | 링크·버튼·활성 메뉴 |
| accent | `#55B93E` | 카드 호버 보더 등 (거북이 배경 초록) |
| secondary | `#EAF6E4` | 연한 초록 칩 |

- 헤딩 초록: `#379427` (global.css)
- **볼드(strong)**: 검정 `#111111` 글자 + 초록 밴드 `#C5E8AE`, **직각 모서리**,
  `box-decoration-break: clone`(줄바꿈 시 밴드 유지). 형광색(`#B7FF5E`)·분홍은 시도 후 기각.

## 본문 사진 (2026-08-17 확정)

- 글 속 사진은 **사진+글 한 행(flex) 11rem 정사각형**(모바일 8.5rem) — 사진 옆엔 항상
  글이 앉는다. 플로트는 기각: 글이 먼저 나온 사진 옆부터 채워져 뒤 사진이 짝 없이 남는
  문제("사진 옆에 글이 없잖아", 2026-08-17). `p:has(> img)` 등장 순서로 좌/우 교대(6장까지).
  heroImage(`.hero-img`)는 제외.
- 옆 글은 **사진 세로 중앙**에 맞춘다 (`align-items: center`, 2026-08-17 사용자 요청).
- **마크다운 규칙: 사진과 그 옆에 앉을 글을 같은 문단에 쓰되, 글 전체를 `<span>`으로
  감싼다** — `![...](...) <span>글... **볼드**...</span>` (빈 줄 없이). span 없이 볼드·링크가
  있으면 flex가 그 요소를 별도 칸으로 쪼갠다(실측: "이동 자체가 빡셌다"가 혼자 왼쪽 기둥이 됨).
  사진만 단독 문단이면 옆이 빈다.
- h2/h3·blockquote·divider에 `clear: both` — 절이 바뀔 때 플로트가 끊긴다.
- 원본은 넣지 않는다: `tools/prep-image.ps1`로 **1:1 중앙 크롭 + 480px** 재인코딩
  (EXIF 회전 반영). 세로 원본 그대로는 "너무 크고 길다"로 반려된 결정.

## 구조

- **상단 스티키 바** (Header.astro): 좌측 프로필 원형 + "김지우 🐢" 픽셀 로고,
  우측 Home/Blog/Contact. 활성 항목은 `text-primary font-bold` (activeItemID 스크립트).
  사이드바는 삭제했다 (드로어 레이아웃 → 상단 바로 전환).
- **홈 히어로**: 첫 화면 풀뷰(`min-h-[calc(100vh-4rem)]`), "김지우입니다"(좌) + 거북이 사진(우,
  직각·그림자 없음), 묶음은 `-translate-y-16`으로 살짝 위. 하단 고정 ↓ 화살표.
  **최근 글은 스크롤해야 보인다** — 첫 화면에 글이 비치면 안 된다.
- **글 목록 카드** (HorizontalCard): `bg-white ring-1 ring-base-300`, 호버 시 `ring-accent`.

## 수정할 때 주의 (실측)

- **prose(글 본문) 색은 global.css의 `.prose` 오버라이드가 담당한다.** typography 플러그인의
  `:where()` 셀렉터가 일반 요소 셀렉터를 이기므로, 오버라이드를 지우면 본문 제목·볼드가
  검정으로 돌아간다.
- 테마 색은 DaisyUI가 변환해 CSS에 hex 문자열로 남지 않는다 — 배포 확인을 hex 검색으로 하지 마라.
- 배포 후 GitHub Pages 캐시(10분) 때문에 옛 화면이 보일 수 있다 — Ctrl+F5.
- OG 이미지(`public/social_img.webp`)는 sharp로 생성한다(팔레트 바꾸면 같이 재생성).
  한글은 Malgun Gothic 폰트 스택으로 렌더 확인됨.
