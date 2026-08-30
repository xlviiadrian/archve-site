import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const source = join(root, "website");
const dist = join(root, "dist");
const SITE_URL = "https://archvemag.com";

if (!existsSync(source)) throw new Error("Missing website source directory");
rmSync(dist, { recursive: true, force: true });
mkdirSync(join(dist, "server"), { recursive: true });
cpSync(source, dist, { recursive: true });

// Public route map. Source files stay flat/editable, while the deployed site uses
// directory index pages so visitors see clean URLs with no `.html` extension.
const CLEAN_ROUTES = {
  "latest.html": "latest/",
  "fashion.html": "fashion/",
  "beauty.html": "beauty/",
  "art.html": "art/",
  "film.html": "film/",
  "music.html": "music/",
  "culture.html": "culture/",
  "photography.html": "photography/",
  "the-index.html": "the-index/",
  "search.html": "search/",
  "article.html": "article/",
  "g6.html": "g6/",
  "g6-services.html": "g6/services/",
  "g6-styling.html": "g6/styling/",
  "g6-model-casting.html": "g6/model-casting/",
  "g6-creative-direction.html": "g6/creative-direction/",
  "g6-personal-shopping.html": "g6/personal-shopping/",
  "g6-music-video-production.html": "g6/music-video-production/",
  "g6-work.html": "g6/work/",
  "g6-models.html": "g6/models/",
  "g6-apply.html": "g6/apply/",
  "g6-contact.html": "g6/contact/"
};

const ROUTE_REPLACEMENTS = [
  ["article.html?id=", "article/?id="],
  ["search.html?q=", "search/?q="],
  ...Object.entries(CLEAN_ROUTES).sort((a, b) => b[0].length - a[0].length),
  ["index.html#", "/#"],
  ["index.html", "/"]
];

function rewritePublicRoutes(text) {
  let out = String(text);
  for (const [oldValue, newValue] of ROUTE_REPLACEMENTS) {
    out = out.split(`${SITE_URL}/${oldValue}`).join(`${SITE_URL}/${newValue}`);
    out = out.split(oldValue).join(newValue);
  }
  return out;
}

function ensureRootBase(html) {
  if (/<base\s/i.test(html)) return html;
  return html.replace(/(<meta\s+name=["']viewport["'][^>]*>)/i, '$1\n  <base href="/">');
}

function walkFiles(dir, callback) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const st = statSync(path);
    if (st.isDirectory()) walkFiles(path, callback);
    else callback(path);
  }
}

// Rewrite all deployed HTML/JS/JSON/XML references so navigation, canonical
// metadata, search, footer links and generated article/category links point at
// the clean public routes.
walkFiles(dist, (path) => {
  if (!/\.(?:html|js|json|xml)$/i.test(path)) return;
  const current = readFileSync(path, "utf8");
  const next = rewritePublicRoutes(current);
  if (next !== current) writeFileSync(path, next);
});

// Create the clean directory-index version of every top-level public page.
for (const [legacyFile, cleanRoute] of Object.entries(CLEAN_ROUTES)) {
  const legacyPath = join(dist, legacyFile);
  if (!existsSync(legacyPath)) continue;
  let page = readFileSync(legacyPath, "utf8");
  page = ensureRootBase(page);
  const cleanDir = join(dist, ...cleanRoute.split("/").filter(Boolean));
  mkdirSync(cleanDir, { recursive: true });
  writeFileSync(join(cleanDir, "index.html"), page);

  // Keep old links alive for bookmarks/search history, but immediately send
  // users to the canonical clean route while preserving query strings/hashes.
  const cleanPath = "/" + cleanRoute;
  const redirect = `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><link rel="canonical" href="${SITE_URL}${cleanPath}"><title>Moved — ARCHVE MAGAZINE</title><script>location.replace(${JSON.stringify(cleanPath)}+location.search+location.hash)</script><noscript><meta http-equiv="refresh" content="0; url=${cleanPath}"></noscript></head><body></body></html>\n`;
  writeFileSync(legacyPath, redirect);
}



// ---------------------------------------------------------------------------
// SEO PRERENDER FALLBACK
// ---------------------------------------------------------------------------
// Most editorial/category/G6 pages are progressively enhanced by main.js. The
// browser experience stays fully interactive, but Googlebot and any crawler that
// reads the first HTML response should not have to execute JavaScript to discover
// the page's real words or links. These helpers place a semantic text/link
// snapshot inside the normal page mount. main.js replaces the same mount when it
// renders, so there is no duplicated visible content for normal visitors.
const articleCatalogPath = join(source, "content", "articles.json");
let ARTICLE_CATALOG = {};
try {
  const parsed = JSON.parse(readFileSync(articleCatalogPath, "utf8"));
  ARTICLE_CATALOG = parsed.articles || {};
} catch {}

function htmlEscape(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[ch]);
}

function cleanHref(value) {
  if (!value) return "";
  let href = rewritePublicRoutes(String(value));
  if (/^(?:https?:|mailto:|tel:|#)/i.test(href)) return href;
  if (!href.startsWith("/")) href = "/" + href.replace(/^\.\//, "");
  return href;
}

function articleHrefById(id) {
  const a = ARTICLE_CATALOG[id];
  if (!a || !a.slug) return "";
  const permanent = join(source, "articles", a.slug, "index.html");
  return existsSync(permanent) ? `/articles/${a.slug}/` : "";
}

function extractPageData(html) {
  const m = String(html).match(/<script\s+type=["']application\/json["']\s+id=["']page-data["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch { return null; }
}

const DISPLAY_KEYS = new Set([
  "title", "name", "dek", "description", "tagline", "intro", "line", "overview",
  "heading", "subheading", "sub", "body", "kicker", "label", "role", "client",
  "pricingNote", "ctaLabel", "alt", "quote", "attribution"
]);
const SKIP_KEYS = new Set([
  "src", "poster", "focal", "id", "slug", "type", "order", "ratio", "filter",
  "email", "fallbackEmail", "primaryKeyword", "canonical", "ogImage", "logo", "logoAlt",
  "_comment", "href", "route", "provider", "year"
]);

function isDisplayText(key, value) {
  if (!DISPLAY_KEYS.has(key) || typeof value !== "string") return false;
  const t = value.trim();
  if (!t || t.length < 2) return false;
  if (/^(?:assets\/|https?:\/\/|mailto:|tel:)/i.test(t)) return false;
  if (/\.(?:html|jpg|jpeg|png|webp|avif|gif|svg|mp4|pdf)(?:[?#].*)?$/i.test(t)) return false;
  return true;
}

function buildPrerenderSnapshot(pageData, pageTitle) {
  if (!pageData) return "";
  const seenText = new Set();
  const seenArticles = new Set();
  const blocks = [];
  const title = String(pageTitle || "ARCHVE MAGAZINE").replace(/\s*[—|]\s*ARCHVE.*$/i, "").trim();
  if (title) blocks.push(`<h1>${htmlEscape(title)}</h1>`);

  function addText(key, value) {
    if (!isDisplayText(key, value)) return;
    const t = value.trim();
    const norm = t.toLowerCase();
    if (seenText.has(norm)) return;
    seenText.add(norm);
    if (key === "title" || key === "heading" || key === "name") blocks.push(`<h2>${htmlEscape(t)}</h2>`);
    else blocks.push(`<p>${htmlEscape(t)}</p>`);
  }

  function visit(v, key = "") {
    if (v == null) return;
    if (Array.isArray(v)) { v.forEach((item) => visit(item, key)); return; }
    if (typeof v !== "object") { addText(key, v); return; }

    if (v.articleId && ARTICLE_CATALOG[v.articleId] && !seenArticles.has(v.articleId)) {
      seenArticles.add(v.articleId);
      const a = ARTICLE_CATALOG[v.articleId];
      const href = articleHrefById(v.articleId);
      const heading = htmlEscape(a.title || v.articleId);
      blocks.push(href ? `<article><h2><a href="${htmlEscape(href)}">${heading}</a></h2>${a.dek ? `<p>${htmlEscape(a.dek)}</p>` : ""}</article>`
                       : `<article><h2>${heading}</h2>${a.dek ? `<p>${htmlEscape(a.dek)}</p>` : ""}</article>`);
    }

    // G6 service records have their own real clean route; make that link
    // crawlable in the initial HTML as well.
    if (v.name && v.route && typeof v.name === "string") {
      const href = cleanHref(v.route);
      const norm = v.name.trim().toLowerCase();
      if (!seenText.has(norm)) {
        seenText.add(norm);
        blocks.push(`<section><h2><a href="${htmlEscape(href)}">${htmlEscape(v.name)}</a></h2>${v.line ? `<p>${htmlEscape(v.line)}</p>` : ""}${v.overview ? `<p>${htmlEscape(v.overview)}</p>` : ""}</section>`);
      }
    }

    for (const [k, val] of Object.entries(v)) {
      if (SKIP_KEYS.has(k) || k === "articleId") continue;
      if (typeof val === "string") addText(k, val);
      else visit(val, k);
    }
  }

  visit(pageData);
  if (blocks.length <= 1) return "";
  return `<section class="seo-prerender" aria-label="Page content">${blocks.join("\n")}</section>`;
}

function injectIntoMount(html, snapshot) {
  if (!snapshot) return html;
  const mounts = ["page-mount", "g6-mount", "sections-mount", "hero-mount"];
  for (const id of mounts) {
    const re = new RegExp(`(<(?:div|main|section)[^>]*\\bid=["']${id}["'][^>]*>)([\\s\\S]*?)(<\\/(?:div|main|section)>)`, "i");
    if (re.test(html)) return html.replace(re, `$1\n${snapshot}\n$3`);
  }
  return html;
}

function titleFromHTML(html) {
  const m = String(html).match(/<title>([\s\S]*?)<\/title>/i);
  return m ? m[1].replace(/<[^>]+>/g, "").trim() : "ARCHVE MAGAZINE";
}

function addPrerenderStyle(html) {
  if (html.includes("data-seo-prerender-style")) return html;
  const css = `<style data-seo-prerender-style>\n.seo-prerender{max-width:1100px;margin:0 auto;padding:32px var(--pad-inline,24px);color:inherit}.seo-prerender h1{font-size:clamp(2rem,6vw,4rem);line-height:1;margin:0 0 28px}.seo-prerender h2{font-size:clamp(1.15rem,3vw,1.75rem);line-height:1.15;margin:28px 0 8px}.seo-prerender p{max-width:75ch;margin:0 0 12px;line-height:1.55}.seo-prerender a{text-decoration:underline;text-underline-offset:.16em}\n</style>`;
  return html.replace(/<\/head>/i, `${css}\n</head>`);
}

function prerenderPublicPage(path) {
  if (!existsSync(path)) return;
  let html = readFileSync(path, "utf8");
  if (/name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html) || /content=["'][^"']*noindex[^"']*["'][^>]*name=["']robots/i.test(html)) return;
  const data = extractPageData(html);
  const snapshot = buildPrerenderSnapshot(data, titleFromHTML(html));
  if (!snapshot) return;
  html = injectIntoMount(html, snapshot);
  html = addPrerenderStyle(html);
  writeFileSync(path, html);
}

// Add crawlable first-response text to the homepage and every clean public route.
prerenderPublicPage(join(dist, "index.html"));
for (const cleanRoute of Object.values(CLEAN_ROUTES)) {
  prerenderPublicPage(join(dist, ...cleanRoute.split("/").filter(Boolean), "index.html"));
}

writeFileSync(
  join(dist, "server", "index.js"),
  `export default {\n  async fetch(request, env) {\n    if (env && env.ASSETS && typeof env.ASSETS.fetch === "function") {\n      return env.ASSETS.fetch(request);\n    }\n    return new Response("ARCHVE Magazine", { headers: { "content-type": "text/plain; charset=utf-8" } });\n  }\n};\n`
);
