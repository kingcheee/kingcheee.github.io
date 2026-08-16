// 발행된 글을 네이버 블로그용으로 변환해 미리보기(서식 복사 버튼)를 띄운다.
// 사용: npm run naver -- <글-슬러그>   (예: npm run naver -- 2026-08-16-building-this-blog)
// NAVER_PREPARE_ONLY=1 이면 변환 파일만 만들고 미리보기는 띄우지 않는다(검증용).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execSync, spawn } from "node:child_process";
import path from "node:path";

const SITE = "https://kingcheee.github.io";

const slug = (process.argv[2] || "").replace(/\.md$/, "");
if (!slug) {
  console.error("사용법: npm run naver -- <글-슬러그>");
  process.exit(1);
}
const src = path.join("src", "content", "blog", slug + ".md");
if (!existsSync(src)) {
  console.error("글이 없습니다: " + src);
  process.exit(1);
}

let md = readFileSync(src, "utf8");

// frontmatter에서 제목을 뽑고 본문만 남긴다 (네이버 제목은 별도 입력)
let title = slug;
const fm = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
if (fm) {
  const t = fm[1].match(/^title:\s*["']?(.+?)["']?\s*$/m);
  if (t) title = t[1];
  md = md.slice(fm[0].length);
}

// 사이트 상대경로 이미지를 절대 URL로 (미리보기 표시용 — 네이버는 핫링크를 막으므로 실제로는 직접 첨부)
const localImages = [...md.matchAll(/!\[[^\]]*\]\((\/[^)]+)\)/g)].map((m) => m[1]);
md = md.replace(/(!\[[^\]]*\]\()(\/[^)]+)(\))/g, `$1${SITE}$2$3`);

// 하단 원문 링크
md += `\n\n---\n\n원문: ${SITE}/blog/${slug}/\n`;

mkdirSync("naver-out", { recursive: true });
let workPath = path.join("naver-out", slug + ".md");
writeFileSync(workPath, md);

// mermaid 블록이 있으면 PNG로 렌더링해 이미지 참조로 치환한다 (네이버에서 직접 첨부)
if (/```mermaid/.test(md)) {
  const rendered = path.join("naver-out", slug + ".naver.md");
  execSync(
    `npx -y @mermaid-js/mermaid-cli -i "${workPath}" -o "${rendered}" -e png -s 2 -b white`,
    { stdio: "inherit" }
  );
  workPath = rendered;
  console.log("\n[다이어그램] naver-out/ 의 PNG들을 네이버 에디터에 직접 첨부하세요.");
}

console.log("\n========================================");
console.log("네이버 글쓰기에서 제목에 입력: " + title);
if (localImages.length) {
  console.log(`[이미지 ${localImages.length}개] 네이버는 외부 이미지 핫링크를 막습니다 —`);
  localImages.forEach((p) => console.log("  public" + p + " 파일을 에디터에 직접 첨부"));
}
console.log("아래 미리보기에서 [서식 복사] → 네이버 본문에 Ctrl+V → 발행");
console.log("========================================\n");

if (process.env.NAVER_PREPARE_ONLY === "1") {
  console.log("PREPARE_ONLY: " + workPath);
} else {
  spawn("npx", ["-y", "@jjlabsio/mtnb", "preview", workPath], {
    stdio: "inherit",
    shell: true,
  });
}
