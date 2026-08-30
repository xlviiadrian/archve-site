import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  readJson, escapeHtml, escapeXml, categoryHref, plainTextFromBody,
  imageExists, slugify
} from './lib.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const website = join(root, 'website');
const config = readJson(join(website, 'content', 'publication.json'), {}) || {};
const siteUrl = String(config.siteUrl || 'https://archvemag.com').replace(/\/$/, '');
const articleBase = String(config.articleBasePath || 'articles').replace(/^\/+|\/+$/g, '');
const payload = readJson(join(website, 'content', 'articles.json'), { articles: {} }) || { articles: {} };
const articles = payload.articles || {};

const outRoot = join(website, articleBase);
rmSync(outRoot, { recursive: true, force: true });
mkdirSync(outRoot, { recursive: true });

function absoluteAsset(src) {
  if (!src) return '';
  if (/^https?:\/\//i.test(src)) return src;
  return `${siteUrl}/${String(src).replace(/^\.\//, '').replace(/^\//, '')}`;
}

function safeJson(obj) {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}

function isoDate(raw) {
  const s = String(raw || '').trim();
  const m = s.match(/^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),\s+(\d{4})$/i);
  if (!m) return '';
  const months = {january:1,february:2,march:3,april:4,may:5,june:6,july:7,august:8,september:9,october:10,november:11,december:12};
  return `${m[3]}-${String(months[m[1].toLowerCase()]).padStart(2,'0')}-${String(Number(m[2])).padStart(2,'0')}`;
}

function inlineFmt(raw) {
  let out = escapeHtml(raw);
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  return out;
}

function mediaHtml(image, cls = 'media--wide') {
  const im = image || {};
  const src = im.src || '';
  const alt = im.alt || '';
  const fitClass = im.fit === 'contain' ? ' media--fit-contain' : '';
  const styleBits = [];
  if (im.focal) styleBits.push(`--focal:${escapeHtml(im.focal)}`);
  if (im.fit === 'contain' && im.w && im.h) styleBits.push(`aspect-ratio:${Number(im.w)}/${Number(im.h)}`);
  const focal = styleBits.length ? ` style="${styleBits.join(';')}"` : '';
  if (!src) return `<div class="media ${cls} media--error"><span class="media-fallback" aria-hidden="true">ARCHVE</span></div>`;
  return `<div class="media ${cls}${fitClass}" data-loaded="true"${focal}><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async"><span class="media-fallback" aria-hidden="true">ARCHVE</span></div>`;
}

function quoteParts(block) {
  const quote = String(block.quote || '').trim();
  const by = String(block.by || block.name || block.attribution || block.cite || '').trim();
  return { quote, by };
}

function videoHtml(video, caption = '') {
  const url = String(video?.url || video || '');
  let provider = String(video?.provider || '').toLowerCase();
  let src = '', ratio = 'landscape';
  const isLocalFile = provider === 'file' || /\.(mp4|webm|ogg|mov)(?:[?#].*)?$/i.test(url);
  if (isLocalFile) {
    if (!url) return '';
    const poster = String(video?.poster || '');
    return `<figure class="body-video body-video--file body-video--full"><div class="body-video-file-frame"><video controls playsinline preload="metadata"${poster ? ` poster="${escapeHtml(poster)}"` : ''}><source src="${escapeHtml(url)}"></video></div>${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ''}</figure>`;
  }
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([A-Za-z0-9_-]{11})/);
  if (provider === 'youtube' || yt) {
    const id = yt ? yt[1] : '';
    if (id) src = `https://www.youtube-nocookie.com/embed/${id}`;
    provider = 'youtube';
  } else if (provider === 'vimeo' || /vimeo\.com\//i.test(url)) {
    const id = (url.match(/vimeo\.com\/(?:video\/)?(\d+)/i) || [])[1];
    if (id) src = `https://player.vimeo.com/video/${id}`;
    provider = 'vimeo';
  } else if (provider === 'spotify' || /open\.spotify\.com\//i.test(url)) {
    const m = url.match(/open\.spotify\.com\/(track|album|playlist|episode|show)\/([A-Za-z0-9]+)/i);
    if (m) src = `https://open.spotify.com/embed/${m[1]}/${m[2]}`;
    provider = 'spotify'; ratio = 'audio';
  } else if (provider === 'soundcloud' || /soundcloud\.com\//i.test(url)) {
    if (url) src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=false`;
    provider = 'soundcloud'; ratio = 'audio';
  } else if (provider === 'tiktok' || /tiktok\.com/i.test(url)) {
    const id = (url.match(/\/video\/(\d+)/) || [])[1];
    if (id) src = `https://www.tiktok.com/player/v1/${id}?autoplay=0&loop=0`;
    provider = 'tiktok'; ratio = 'portrait';
  } else if (provider === 'instagram' || /instagram\.com/i.test(url)) {
    const im = url.match(/instagram\.com\/(p|reels?)\/([A-Za-z0-9_-]+)/i);
    if (im) src = `https://www.instagram.com/${im[1].toLowerCase().startsWith('reel') ? 'reel' : 'p'}/${im[2]}/embed/captioned/`;
    provider = 'instagram'; ratio = 'portrait';
  } else if (provider === 'archive' || /archive\.org\/details\//i.test(url)) {
    const id = (url.match(/archive\.org\/details\/([A-Za-z0-9_.-]+)/i) || [])[1];
    if (id) src = `https://archive.org/embed/${id}`;
    provider = 'archive';
  }
  if (!src) {
    if (!url) return '';
    return `<p class="article-link"><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(caption || `View ${provider || 'media'}`)}</a></p>`;
  }
  return `<figure class="body-video body-video--${escapeHtml(provider || 'embed')} body-video--${ratio}"><div class="body-video-frame"><iframe src="${escapeHtml(src)}" title="${escapeHtml(caption || 'Embedded media')}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ''}</figure>`;
}

function blockHtml(block, firstCopyRef) {
  if (typeof block === 'string') {
    if (/^https?:\/\/\S+$/i.test(block.trim())) return '';
    const cls = firstCopyRef.value ? 'article-copy article-lede' : 'article-copy';
    firstCopyRef.value = false;
    return `<p class="${cls}">${inlineFmt(block)}</p>`;
  }
  if (!block || typeof block !== 'object') return '';
  if (block.heading) return `<h2 class="body-heading">${escapeHtml(block.heading)}</h2>`;
  if (block.subheading) return `<h3 class="body-subheading">${escapeHtml(block.subheading)}</h3>`;
  if (block.divider) return '<hr class="body-divider">';
  if (block.spacer) return `<div class="body-spacer body-spacer--${escapeHtml(block.spacer === true ? 'medium' : block.spacer)}" aria-hidden="true"></div>`;
  if (block.quote) {
    const { quote, by } = quoteParts(block);
    return `<figure class="body-quote"><blockquote class="body-quote-text">${escapeHtml(quote)}</blockquote>${by ? `<figcaption class="body-quote-by">${escapeHtml(by)}</figcaption>` : ''}</figure>`;
  }
  if (block.credit) return `<p class="body-credit">${escapeHtml(block.credit)}</p>`;
  if (block.fullImage) {
    const inner = mediaHtml(block.fullImage);
    const media = block.href ? `<a class="body-media-link" href="${escapeHtml(block.href)}" target="_blank" rel="noopener noreferrer">${inner}</a>` : inner;
    return `<figure class="body-figure body-figure--full">${media}${block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ''}</figure>`;
  }
  if (block.image) {
    const inner = mediaHtml(block.image);
    const media = block.href ? `<a class="body-media-link" href="${escapeHtml(block.href)}" target="_blank" rel="noopener noreferrer">${inner}</a>` : inner;
    return `<figure class="body-figure">${media}${block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ''}</figure>`;
  }
  if (Array.isArray(block.gallery)) {
    const cols = Math.max(2, Math.min(3, Number(block.columns) || (block.gallery.length === 4 ? 2 : 3)));
    const grid = `<div class="body-gallery body-gallery--${cols}">${block.gallery.map(img => mediaHtml(img, 'body-gallery-media')).join('')}</div>`;
    return `<figure class="body-gallery-wrap">${grid}${block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ''}</figure>`;
  }
  if (block.video) return videoHtml(block.video, block.caption || '');
  if (block.youtube) return videoHtml({ url: block.youtube, provider: 'youtube' }, block.caption || '');
  if (block.relatedArticle) {
    const related = articles[block.relatedArticle] || Object.values(articles).find(a => a.slug === block.relatedArticle);
    if (!related || related.status !== 'published' || !related.body?.length) return '';
    return `<aside class="body-related"><span>Related</span><a href="${articleBase}/${escapeHtml(related.slug || related.id)}/">${escapeHtml(related.title)}</a></aside>`;
  }
  if (block.link?.href) return `<p class="article-link"><a href="${escapeHtml(block.link.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(block.link.label || 'View link')}</a></p>`;
  return '';
}

function renderBody(body = []) {
  const first = { value: true };
  return body.map(block => blockHtml(block, first)).join('');
}

function staticPage(article) {
  const slug = article.slug || article.id;
  const canonical = article.seo?.canonical || `${siteUrl}/${articleBase}/${slug}/`;
  const seoTitle = article.seo?.title || article.title;
  const metaDescription = article.seo?.description || article.dek || plainTextFromBody(article.body).slice(0, 155);
  const ogTitle = article.seo?.ogTitle || seoTitle;
  const ogDescription = article.seo?.ogDescription || metaDescription;
  const ogImage = absoluteAsset(article.seo?.ogImage || article.heroImage?.src || article.image?.src || config.defaultSocialImage || '');
  const hero = article.heroImage || article.image || article.thumbnailImage || {};
  const category = article.category || article.eyebrow?.category || 'Latest';
  const author = article.author || config.defaultAuthor || 'ARCHVE Magazine';
  const topics = Array.isArray(article.tags) && article.tags.length ? article.tags : (article.topics || [category]);
  const published = isoDate(article.date);
  const modified = isoDate(article.updatedDate) || published;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: metaDescription || undefined,
    image: ogImage ? [ogImage] : undefined,
    author: { '@type': 'Person', name: author },
    publisher: { '@type': 'Organization', name: config.publisherName || 'ARCHVE MAGAZINE', logo: { '@type': 'ImageObject', url: absoluteAsset('assets/logos/archve-favicon.png') } },
    datePublished: published || undefined,
    dateModified: modified || undefined,
    mainEntityOfPage: canonical
  };
  Object.keys(schema).forEach(k => schema[k] === undefined && delete schema[k]);

  const categoryTopics = new Set(['latest','fashion','beauty','art','art & photography','photography','film','film & tv','music','culture','life & culture']);
  const topicHtml = topics.map(t => categoryTopics.has(String(t || '').toLowerCase())
    ? `<a href="${escapeHtml(categoryHref(t))}">${escapeHtml(t)}</a>`
    : `<span class="topic-label">${escapeHtml(t)}</span>`).join('');
  const authorHtml = article.authorUrl ? `<a href="${escapeHtml(article.authorUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(author)}</a>` : escapeHtml(author);
  const format = article.format ? ` <span class="crumb-sep">/</span> <span>${escapeHtml(article.format)}</span>` : '';

  return `<!DOCTYPE html>
<html lang="en" class="no-js">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <base href="../../">
  <title>${escapeHtml(seoTitle)} — ARCHVE</title>
  <meta name="description" content="${escapeHtml(metaDescription)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="ARCHVE MAGAZINE">
  <meta property="og:title" content="${escapeHtml(ogTitle)}">
  <meta property="og:description" content="${escapeHtml(ogDescription)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  ${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}">` : ''}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(ogTitle)}">
  <meta name="twitter:description" content="${escapeHtml(ogDescription)}">
  ${ogImage ? `<meta name="twitter:image" content="${escapeHtml(ogImage)}">` : ''}
  <meta name="theme-color" content="#000000">
  <meta name="color-scheme" content="dark">
  <link rel="icon" href="assets/logos/archve-favicon.png" type="image/png" sizes="512x512">
  <link rel="apple-touch-icon" href="assets/logos/archve-favicon.png">
  <link rel="alternate" type="application/rss+xml" title="ARCHVE MAGAZINE RSS" href="rss.xml">
  <link rel="preload" href="assets/fonts/NeueHaasDisplayBold.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="assets/fonts/NeueHaasDisplayRoman.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="assets/css/styles.css">
  <script type="application/ld+json">${safeJson(schema)}</script>
</head>
<body data-page="static-article" data-article-id="${escapeHtml(article.id)}">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header" id="site-header" role="banner"></header>
  <div class="mobile-menu" id="mobile-menu" role="dialog" aria-modal="true" aria-label="Site menu"></div>
  <main id="main" role="main">
    <div class="article-promo"><a href="#tally-open=kdrEPd&tally-layout=modal&tally-overlay=1&tally-auto-close=0" data-tally-open="kdrEPd">Sign Up For First Access To The Magazine &amp; Updates</a></div>
    <article class="article article--editorial">
      <div class="container container--narrow">
        <header class="article-head">
          <p class="article-crumb"><a href="${escapeHtml(categoryHref(category))}">${escapeHtml(category)}</a>${format}</p>
          <h1>${escapeHtml(article.title)}</h1>
          ${article.dek ? `<p class="article-standfirst">${escapeHtml(article.dek)}</p>` : ''}
        </header>
      </div>
      <div class="container container--wide">
        <figure class="article-hero">${mediaHtml(hero)}<figcaption class="article-cap"><span class="cap-date">${escapeHtml(article.date || '')}</span><span class="cap-by"><strong>Text</strong> ${authorHtml}</span></figcaption></figure>
      </div>
      <div class="container container--narrow">
        <div class="article-body">${renderBody(article.body || [])}</div>
        <nav class="article-topics" aria-label="Topics"><span class="tt">More on these topics:</span>${topicHtml}</nav>
      </div>
    </article>
    <div id="static-after-article"></div>
  </main>
  <footer class="site-footer" id="site-footer" role="contentinfo"></footer>
  <span id="static-article-data" data-id="${escapeHtml(article.id)}" hidden></span>
  <script src="assets/js/main.js"></script>
</body>
</html>\n`;
}

const all = Object.values(articles);
const complete = all.filter(a => a.status === 'published' && Array.isArray(a.body) && a.body.length > 0);
const generated = [];
for (const article of complete) {
  const slug = article.slug || article.id || slugify(article.title);
  if (!slug) continue;
  const dir = join(outRoot, slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), staticPage({ ...article, slug }));
  generated.push(article.id);
}

const searchIndex = complete.map(article => ({
  id: article.id,
  title: article.title,
  dek: article.dek || '',
  category: article.category || '',
  categories: article.categories || [],
  tags: article.tags || article.topics || [],
  author: article.author || '',
  date: article.date || '',
  image: article.thumbnailImage || article.image || article.heroImage || {},
  url: `${articleBase}/${article.slug || article.id}/`,
  text: plainTextFromBody(article.body || [])
}));
writeFileSync(join(website, 'content', 'search-index.json'), JSON.stringify({ generatedAt: new Date().toISOString(), articles: searchIndex }, null, 2) + '\n');

function rssDate(raw) {
  const cleaned = String(raw || '').replace(/(\d+)(st|nd|rd|th)\b/gi, '$1');
  const d = new Date(cleaned);
  return Number.isNaN(d.getTime()) ? '' : d.toUTCString();
}
const rssItems = [...complete].sort((a, b) => {
  const da = Date.parse(String(a.date || '').replace(/(\d+)(st|nd|rd|th)\b/gi, '$1')) || 0;
  const db = Date.parse(String(b.date || '').replace(/(\d+)(st|nd|rd|th)\b/gi, '$1')) || 0;
  return db - da;
}).slice(0, 50).map(article => {
  const link = `${siteUrl}/${articleBase}/${article.slug || article.id}/`;
  const description = article.dek || plainTextFromBody(article.body || []).slice(0, 240);
  const pubDate = rssDate(article.date);
  return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(description)}</description>
      <category>${escapeXml(article.category || 'Latest')}</category>${pubDate ? `
      <pubDate>${escapeXml(pubDate)}</pubDate>` : ''}
    </item>`;
}).join('\n');
const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>ARCHVE MAGAZINE</title>
    <link>${escapeXml(siteUrl + '/')}</link>
    <description>New stories from ARCHVE MAGAZINE.</description>
    <language>en-us</language>
    <lastBuildDate>${escapeXml(new Date().toUTCString())}</lastBuildDate>
${rssItems}
  </channel>
</rss>
`;
writeFileSync(join(website, 'rss.xml'), rss);

const manifest = all.map(article => ({
  id: article.id, slug: article.slug || article.id, title: article.title, status: article.status,
  category: article.category, url: article.status === 'published' && article.body?.length ? `${articleBase}/${article.slug || article.id}/` : article.migration?.legacyHref || `article.html?id=${article.id}`,
  contentStatus: article.migration?.contentStatus || (article.body?.length ? 'complete' : 'needs-copy')
}));
writeFileSync(join(website, 'content', 'article-manifest.json'), JSON.stringify({ articles: manifest }, null, 2) + '\n');

const fixedPages = ['', 'latest.html', 'fashion.html', 'beauty.html', 'art.html', 'film.html', 'music.html', 'culture.html', 'photography.html', 'the-index.html'];
const urls = fixedPages.map(p => `${siteUrl}/${p}`);
for (const article of complete) urls.push(`${siteUrl}/${articleBase}/${article.slug || article.id}/`);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${escapeXml(url)}</loc></url>`).join('\n')}\n</urlset>\n`;
writeFileSync(join(website, 'sitemap.xml'), sitemap);
writeFileSync(join(website, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${siteUrl}/sitemap.xml\n`);

const issues = [];
const slugSeen = new Map();
for (const article of all) {
  const slug = article.slug || article.id;
  if (slugSeen.has(slug)) issues.push({ severity: 'error', article: article.id, issue: `Duplicate slug: ${slug}` });
  slugSeen.set(slug, article.id);
  if (!article.title) issues.push({ severity: 'error', article: article.id, issue: 'Missing title' });
  if (!article.heroImage?.src && !article.image?.src) issues.push({ severity: 'warning', article: article.id, issue: 'Missing hero image' });
  else if (!imageExists(website, article.heroImage || article.image)) issues.push({ severity: 'warning', article: article.id, issue: `Hero image file not found: ${(article.heroImage || article.image)?.src}` });
  if (article.status === 'published' && !(article.body?.length)) issues.push({ severity: 'error', article: article.id, issue: 'Published article has no body blocks' });
  if (article.status === 'legacy-placeholder') issues.push({ severity: 'info', article: article.id, issue: 'Legacy card still needs real article copy before static SEO publication' });
}
const report = {
  generatedAt: new Date().toISOString(),
  totals: { catalog: all.length, staticPages: generated.length, needsCopy: all.filter(a => !a.body?.length).length, issues: issues.length },
  generatedArticleIds: generated,
  issues
};
writeFileSync(join(root, 'ARCHVE-PUBLICATION-REPORT.json'), JSON.stringify(report, null, 2) + '\n');
const md = `# ARCHVE Publication Build Report\n\n- Central article records: **${all.length}**\n- Permanent static article pages generated: **${generated.length}**\n- Legacy article cards still needing real body copy: **${report.totals.needsCopy}**\n- Validation findings: **${issues.length}**\n\n## What was generated\n\n- \`website/articles/<slug>/index.html\` for complete published articles\n- \`website/sitemap.xml\`\n- \`website/robots.txt\`\n- \`website/content/search-index.json\`\n- \`website/content/article-manifest.json\`\n\n## Important\n\nOnly articles with real body content are given permanent SEO pages. Legacy cards that currently rely on the site's placeholder-body fallback are intentionally excluded from the sitemap so fabricated placeholder copy is not presented to search engines as editorial content.\n\n## Findings\n\n${issues.slice(0, 100).map(i => `- **${i.severity.toUpperCase()}** \`${i.article}\`: ${i.issue}`).join('\n') || '- No findings.'}\n`;
writeFileSync(join(root, 'ARCHVE-PUBLICATION-REPORT.md'), md);

console.log(`Publication build complete: ${generated.length} static article pages, ${searchIndex.length} search records.`);
