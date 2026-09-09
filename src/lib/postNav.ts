// 글 끝 내비게이션 데이터 — 빌드 타임에 [slug].astro의 getStaticPaths가 계산해 넘긴다 (2026-09-09).
// getStaticPaths는 파일 import 말고는 바깥 스코프를 못 보므로 로직을 여기로 뺐다.

import type { CollectionEntry } from "astro:content";
import createSlug from "./createSlug";

// /blog/ 갈래 탭과 같은 이름·순서 (blog/index.astro의 CATEGORIES). 글의 갈래는 tags 중 이 셋에
// 먼저 걸리는 것 하나다.
export const CATEGORIES = ["회고", "일기", "생각"] as const;
export type Category = (typeof CATEGORIES)[number];

type Entry = CollectionEntry<"blog">;

export interface NavLink {
  title: string;
  url: string;
}

export interface PostNavData {
  category: Category | null;
  /** 더 오래된 글 */
  prev: NavLink | null;
  /** 더 최근 글 */
  next: NavLink | null;
  /** 돌아가기 — 갈래가 있으면 그 탭이 열린 /blog/, 없으면 /blog/all/ */
  backUrl: string;
}

export function categoryOf(entry: Entry): Category | null {
  const tags = entry.data.tags ?? [];
  return CATEGORIES.find((c) => tags.includes(c)) ?? null;
}

export function urlOf(entry: Entry): string {
  return "/blog/" + createSlug(entry.data.title, entry.slug);
}

// 오래된 → 최근. pubDate가 날짜뿐이라 같은 날 글이 흔하다 — 2차 정렬은 파일명(slug)이라
// 빌드마다 순서가 흔들리지 않는다.
export function sortOldestFirst(entries: Entry[]): Entry[] {
  return [...entries].sort(
    (a, b) => a.data.pubDate.valueOf() - b.data.pubDate.valueOf() || a.slug.localeCompare(b.slug),
  );
}

export function postNav(all: Entry[], entry: Entry): PostNavData {
  const category = categoryOf(entry);
  // 갈래 안에서만 잇는다 — 탭과 같은 기준(tags.includes)이라 탭에 보이는 순서와 일치한다.
  const pool = sortOldestFirst(category ? all.filter((e) => e.data.tags?.includes(category)) : all);
  const i = pool.findIndex((e) => e.slug === entry.slug);
  const link = (e: Entry | undefined): NavLink | null =>
    e ? { title: e.data.title, url: urlOf(e) } : null;
  return {
    category,
    prev: i > 0 ? link(pool[i - 1]) : null,
    next: link(pool[i + 1]),
    backUrl: category ? `/blog/#${category}` : "/blog/all/",
  };
}
