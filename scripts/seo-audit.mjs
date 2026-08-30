import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const ORIGIN = "https://archvemag.com";

function fail(message, errors) {
  console.error(`\nSEO crawl audit FAILED: ${message}`);
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}
function stripTags(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}
function attr(html, tag, name, valueName = "content") {
  const tags = html.match(new RegExp(`<${tag}\\b[^>]*>`, "gi")) || [];
  for (const t of tags) {
    const nm = t.match(new RegExp(`\\b${name}=["']([^"']+)["']`, "i"));
    if (!nm) continue;
    const val = t.match(new RegExp(`\\b${valueName}=["']([^"']*)["']`, "i"));
    if (val) return val[1];
  }
  return "";
}
function canonical(html) {
  const tags = html.match(/<link\b[^>]*>/gi) || [];
  for (const t of tags) {
    if (!/\brel=["'][^"']*canonical[^"']*["']/i.test(t)) continue;
    const m = t.match(/\bhref=["']([^"']+)["']/i);
    if (m) return m[1];
  }
  return "";
}
function localPathFor(url) {
  const pathname = new URL(url).pathname;
  return pathname === "/" ? join(dist, "index.html") : join(dist, pathname.replace(/^\//, ""), "index.html");
}

const sitemapPath = join(dist, "sitemap.xml");
const robotsPath = join(dist, "robots.txt");
if (!existsSync(sitemapPath)) fail("missing sitemap.xml", [sitemapPath]);
if (!existsSync(robotsPath)) fail("missing robots.txt", [robotsPath]);

const sitemap = readFileSync(sitemapPath, "utf8");
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
const errors = [];
const seen = new Set();
for (const url of urls) {
  if (seen.has(url)) errors.push(`Duplicate sitemap URL: ${url}`);
  seen.add(url);
  if (!url.startsWith(`${ORIGIN}/`) && url !== `${ORIGIN}/`) errors.push(`Off-domain sitemap URL: ${url}`);
  const file = localPathFor(url);
  if (!existsSync(file)) { errors.push(`Sitemap URL has no deployable index.html: ${url}`); continue; }
  const html = readFileSync(file, "utf8");
  const robots = attr(html, "meta", "name", "content") || "";
  // Find the actual robots meta explicitly if another named meta appeared first.
  const robotTag = (html.match(/<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/i) || [""])[0];
  const robotContent = (robotTag.match(/\bcontent=["']([^"']*)["']/i) || [,"“"])[1] || "";
  if (!/\bindex\b/i.test(robotContent) || /\bnoindex\b/i.test(robotContent)) errors.push(`Not indexable: ${url} (${robotContent || "no robots meta"})`);
  const can = canonical(html);
  if (can.replace(/\/$/, "") !== url.replace(/\/$/, "")) errors.push(`Canonical mismatch: ${url} -> ${can || "missing"}`);
  if (!/<title>[\s\S]*?\S[\s\S]*?<\/title>/i.test(html)) errors.push(`Missing title: ${url}`);
  if (!/<meta\b(?=[^>]*\bname=["']description["'])[^>]*\bcontent=["'][^"']{20,}["'][^>]*>/i.test(html) && !/<meta\b(?=[^>]*\bcontent=["'][^"']{20,}["'])[^>]*\bname=["']description["'][^>]*>/i.test(html)) errors.push(`Missing/short meta description: ${url}`);
  if (!/<h1\b[^>]*>[\s\S]*?\S[\s\S]*?<\/h1>/i.test(html)) errors.push(`No crawlable H1 in first HTML response: ${url}`);
  const text = stripTags(html);
  const minText = url.includes("/articles/") ? 300 : 250;
  if (text.length < minText) errors.push(`Thin first-response HTML (${text.length} chars): ${url}`);
  const legacyLinks = [...html.matchAll(/href=["']([^"']*\.html(?:[?#][^"']*)?)["']/gi)].map((m) => m[1]).filter((h) => !/^https?:\/\//i.test(h));
  if (legacyLinks.length) errors.push(`Legacy .html internal link on ${url}: ${legacyLinks[0]}`);
  if (url.includes("/articles/") && !/"@type"\s*:\s*"(?:NewsArticle|Article)"/i.test(html)) errors.push(`Article structured data missing: ${url}`);
}

const robots = readFileSync(robotsPath, "utf8");
if (/Disallow:\s*\//i.test(robots) && !/Disallow:\s*\/admin\//i.test(robots)) errors.push("robots.txt appears to block public crawling");
if (!robots.includes(`Sitemap: ${ORIGIN}/sitemap.xml`)) errors.push("robots.txt does not advertise the canonical sitemap");
if (!urls.includes(`${ORIGIN}/`)) errors.push("Homepage missing from sitemap");

if (errors.length) fail(`${errors.length} technical issue(s) found`, errors);
console.log(`SEO crawl audit passed: ${urls.length} canonical public URLs are present, indexable, crawlable in first-response HTML, and sitemap-linked.`);
