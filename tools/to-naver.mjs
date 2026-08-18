// 발행된 글을 네이버 블로그용으로 변환해 미리보기(서식 복사 버튼)를 띄운다.
// 사용: npm run naver -- <글-슬러그>   (예: npm run naver -- 2026-08-16-building-this-blog)
// NAVER_PREPARE_ONLY=1 이면 변환 파일만 만들고 미리보기는 띄우지 않는다(검증용).
// 주의: @jjlabsio/mtnb의 preview는 macOS 전용(`open`)이라 Windows에서 깨진다 —
// 그래서 미리보기 HTML은 여기서 직접 만들고 `start`로 연다 (2026-08-17 실측).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execSync, spawn } from "node:child_process";
import path from "node:path";
import { convert } from "@jjlabsio/md-to-naver-blog";

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

// 소스의 소프트 줄바꿈을 문단 단위로 합친다 — 사이트는 줄바꿈이 공백으로 흡수돼 자연
// 줄바꿈되는데, 네이버 변환은 줄=문단이라 모바일에서 문장 중간이 꺾인다 (2026-08-17 실측)
md = md
  .split(/\n{2,}/)
  .map((block) => {
    const first = block.trimStart();
    if (/^(#{1,6}\s|>|[-*]\s|\d+\.\s|!\[|```|---|\|)/.test(first)) return block;
    return block.replace(/\s*\n\s*/g, " ");
  })
  .join("\n\n");

// 사이트 상대경로 이미지를 절대 URL로 (미리보기 표시용 — 네이버는 핫링크를 막으므로 실제로는 직접 첨부)
const localImages = [...md.matchAll(/!\[[^\]]*\]\((\/[^)]+)\)/g)].map((m) => m[1]);
md = md.replace(/(!\[[^\]]*\]\()(\/[^)]+)(\))/g, `$1${SITE}$2$3`);

// 본문 텍스트 링크·video src의 사이트 상대경로도 절대 URL로 (네이버에선 상대경로가 깨진다)
md = md.replace(/(\]\()(\/(?!\/))/g, `$1${SITE}/`).replace(/(src=")(\/(?!\/))/g, `$1${SITE}/`);

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

// 네이버 에디터 호환 HTML로 변환해 [서식 복사] 버튼이 달린 미리보기 페이지를 만든다
let { html } = convert(readFileSync(workPath, "utf8"));

// 사이트 스타일 주입 (2026-08-17 실측): 볼드 형광펜 #FAD9D9 · 헤딩 연두 #5CAE32
// (헤딩은 사이트 #379427보다 살짝 연두로 — 2026-08-17 사용자 지시)
// SmartEditor는 paste에서 color/background-color 인라인 스타일을 보존한다
html = html
  .replace(/<(strong|b)\b([^>]*?)(\sstyle="([^"]*)")?>/g, (m, tag, attrs, styleAttr, style) =>
    `<${tag}${attrs} style="${style ? style + " " : ""}background-color: #FAD9D9;">`)
  .replace(/<h([1-4])\b([^>]*?)(\sstyle="([^"]*)")?>/g, (m, lv, attrs, styleAttr, style) =>
    `<h${lv}${attrs} style="${style ? style + " " : ""}color: #5CAE32;">`);
const previewPath = path.resolve("naver-out", slug + ".html");
const page = `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><title>네이버 서식 복사 — ${title}</title>
<style>
body{font-family:'Malgun Gothic',sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem}
#bar{position:sticky;top:0;background:#fff;padding:1rem 0;border-bottom:2px solid #2f8a25}
button{font-size:1.2rem;padding:.6rem 1.4rem;background:#2f8a25;color:#fff;border:none;border-radius:8px;cursor:pointer}
#st{margin-left:1rem;color:#2f8a25;font-weight:bold}
</style></head><body>
<div id="bar">
  <div style="margin-bottom:.5rem">제목(네이버에 직접 입력): <b>${title}</b></div>
  <button id="copy">📋 서식 복사</button><span id="st"></span>
</div>
<div id="content">${html}</div>
<script>
document.getElementById("copy").onclick = async () => {
  const el = document.getElementById("content");
  const st = document.getElementById("st");
  try {
    const item = new ClipboardItem({
      "text/html": new Blob([el.innerHTML], { type: "text/html" }),
      "text/plain": new Blob([el.innerText], { type: "text/plain" }),
    });
    await navigator.clipboard.write([item]);
  } catch (e) {
    // 폴백: 본문을 통째로 선택해서 복사 (서식 유지)
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand("copy");
    sel.removeAllRanges();
  }
  st.textContent = "복사됨! 네이버 글쓰기 본문에 Ctrl+V 하세요";
};
</script></body></html>`;
writeFileSync(previewPath, page);

if (process.env.NAVER_PREPARE_ONLY === "1") {
  console.log("PREPARE_ONLY: " + previewPath);
} else {
  spawn("cmd.exe", ["/c", "start", "", previewPath], { stdio: "ignore", detached: true });
  console.log("미리보기를 브라우저로 열었습니다: " + previewPath);
}
