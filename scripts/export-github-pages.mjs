import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";

const [sourceIndex, world] = await Promise.all([
  readFile("site/index.html", "utf8"),
  readFile("site/world.json", "utf8").then(JSON.parse),
]);

const output = "github-pages";
await rm(output, { recursive: true, force: true });
await mkdir(`${output}/daily-world`, { recursive: true });
await cp("site/style.css", `${output}/style.css`);
await cp("site/app.js", `${output}/app.js`);

const esc = (value = "") => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const write = (path, body) => writeFile(`${output}/${path}`, body);

const home = sourceIndex
  .replace(/href="\/style\.css\?v=\d+"/g, 'href="./style.css?v=6"')
  .replace(/src="\/app\.js\?v=\d+"/g, 'src="./app.js?v=6"')
  .replaceAll('href="/daily-world"', 'href="./daily-world/"')
  .replaceAll('href="/"', 'href="./"')
  .replaceAll('href="/#', 'href="#');
await write("index.html", home);

function nav(depth, active = "world") {
  const root = depth === 0 ? "./" : depth === 1 ? "../" : "../../";
  const worldLink = depth === 0 ? "./daily-world/" : depth === 1 ? "./" : "../";
  return `<nav class="top-nav"><a href="${root}">今日封面</a><a class="${active === "world" ? "active" : ""}" href="${worldLink}">每日世界</a><a href="${root}#book">旧书新读</a><a href="${root}#history">历史切片</a><a href="${root}#archive">往期</a></nav>`;
}

function shell(title, body, depth) {
  const root = depth === 0 ? "./" : depth === 1 ? "../" : "../../";
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} · 每日视界</title><meta name="description" content="每日视界深度杂志"><link rel="stylesheet" href="${root}style.css?v=6"></head><body><main><div class="ticker"><span>DAILY INSIGHT</span><span>2026 / 07 / 10 · 周五</span><span>DEEP EDITION</span><span>10 STORIES</span></div><header class="sub-mast"><a href="${root}" class="mini-logo">每日视界 <i>DAILY INSIGHT</i></a><span>知道世界 · 理解逻辑</span></header>${nav(depth)}${body}<footer class="site-footer"><div><b>每日视界</b><span>不是追赶所有新闻，而是留下值得记住的部分。</span></div><div class="update-times"><span>早刊 08:00</span><span>晚刊 17:00</span></div></footer></main><script src="${root}app.js?v=6"></script></body></html>`;
}

function card(story) {
  return `<a class="world-card ${story.featured ? "featured" : ""}" href="./${story.slug}/">${story.image ? `<figure><img src="${story.image}" alt="${esc(story.imageAlt)}"><figcaption>${esc(story.photoCredit)}</figcaption></figure>` : `<div class="type-image"><span>${story.region === "中国" ? "CN" : "INTL"}</span><b>${String(story.rank).padStart(2,"0")}</b></div>`}<div class="world-card-copy"><p class="tag">${esc(story.kicker)} · ${esc(story.readTime)}</p><h3>${esc(story.title)}</h3><p>${esc(story.summary)}</p><div class="why"><b>为什么值得关注</b><span>${esc(story.why)}</span></div><span class="read-link">进入精读 →</span></div></a>`;
}

const worldPage = shell("每日世界", `<section class="world-header"><p class="eyebrow">TODAY'S CHINA & WORLD · VOL. 001</p><h1>今日中外要闻</h1><div class="world-deck"><p>十条新闻不是十次提醒，而是十个理解今天的入口。本页先告诉你发生了什么；点击任一标题，进入背景、影响与后续观察。</p><div><span><b>05</b> 中国</span><span><b>05</b> 国际</span></div></div></section><section class="world-section china"><header><span>01</span><div><p>CHINA TODAY</p><h2>今日中国要闻</h2></div></header><div class="world-list">${world.filter((story) => story.region === "中国").map(card).join("")}</div></section><section class="world-section global"><header><span>02</span><div><p>WORLD TODAY</p><h2>今日国际要闻</h2></div></header><div class="world-list">${world.filter((story) => story.region === "国际").map(card).join("")}</div></section>`, 1);
await write("daily-world/index.html", worldPage);

for (const story of world) {
  const image = story.image
    ? `<figure class="article-image"><img src="${story.image}" alt="${esc(story.imageAlt)}"><figcaption>${esc(story.photoCredit)} · 图片链接至原始报道来源</figcaption></figure>`
    : `<div class="article-type-hero"><span>${story.region === "中国" ? "CN" : "WORLD"}</span><b>${String(story.rank).padStart(2,"0")}</b><small>本篇未采用无法稳定核验授权的新闻图片</small></div>`;
  const sections = story.sections.map((section) => `<section><h2>${esc(section.title)}</h2>${section.paragraphs.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}</section>`).join("");
  const article = `<article class="article-page"><a class="back-link" href="../">← 返回今日中外要闻</a><header class="article-head"><p class="tag">${esc(story.region)} · ${esc(story.kicker)} · ${esc(story.readTime)}</p><h1>${esc(story.title)}</h1><p class="article-dek">${esc(story.summary)}</p><div class="article-meta"><span>编辑日期 · 2026.07.10</span><a href="${story.sourceUrl}" target="_blank" rel="noreferrer">原始报道 · ${esc(story.source)} ↗</a></div></header>${image}<div class="article-layout"><div class="article-body"><p class="lead">${esc(story.lead)}</p>${sections}<section class="sources-box"><h2>来源与延伸阅读</h2><a href="${story.sourceUrl}" target="_blank" rel="noreferrer">${esc(story.source)}：${esc(story.sourceTitle)} ↗</a></section></div><aside class="article-aside"><div class="key-point"><span>WHY IT MATTERS</span><b>${esc(story.why)}</b></div><div class="watch-box"><span>NEXT / 接下来观察</span><ul>${story.watch.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></div></aside></div><nav class="article-next"><a href="../">查看其余9条要闻 →</a></nav></article>`;
  await mkdir(`${output}/daily-world/${story.slug}`, { recursive: true });
  await write(`daily-world/${story.slug}/index.html`, shell(story.title, article, 2));
}

console.log(`Exported ${world.length + 2} pages to ${output}/`);
