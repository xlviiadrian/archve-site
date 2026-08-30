import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

export const CONTENT_PAGE_FILES = [
  'index.html', 'latest.html', 'music.html', 'art.html', 'fashion.html',
  'beauty.html', 'film.html', 'photography.html', 'culture.html', 'the-index.html'
];

export const CATEGORY_ROUTES = {
  latest: 'latest.html',
  fashion: 'fashion.html',
  beauty: 'beauty.html',
  art: 'art.html',
  'art & photography': 'art.html',
  photography: 'photography.html',
  film: 'film.html',
  'film & tv': 'film.html',
  music: 'music.html',
  culture: 'culture.html',
  'life & culture': 'culture.html'
};

export function readJson(path, fallback = null) {
  try { return JSON.parse(readFileSync(path, 'utf8')); } catch { return fallback; }
}

export function extractPageData(html) {
  const match = html.match(/<script[^>]+id=["']page-data["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!match) return null;
  return JSON.parse(match[1]);
}

export function isArticlePlacement(obj) {
  return !!(obj && typeof obj === 'object' && obj.id && obj.title &&
    typeof obj.href === 'string' && /article\.html\?id=/.test(obj.href));
}

export function walk(value, callback, path = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, callback, path.concat(index)));
    return;
  }
  if (!value || typeof value !== 'object') return;
  callback(value, path);
  Object.entries(value).forEach(([key, item]) => walk(item, callback, path.concat(key)));
}

export function pageCategory(filename, pageData) {
  if (filename === 'index.html') return '';
  const slug = String(pageData?.slug || filename.replace(/\.html$/i, '')).toLowerCase();
  const labels = {
    latest: 'Latest', fashion: 'Fashion', beauty: 'Beauty', art: 'Art & Photography',
    photography: 'Art & Photography', film: 'Film & TV', music: 'Music', culture: 'Life & Culture'
  };
  return labels[slug] || pageData?.title || '';
}

export function normalizeCategory(category) {
  const c = String(category || '').trim();
  const lower = c.toLowerCase();
  if (lower === 'art' || lower === 'photography' || lower === 'art & photography') return 'Art & Photography';
  if (lower === 'film' || lower === 'film & tv') return 'Film & TV';
  if (lower === 'culture' || lower === 'life & culture') return 'Life & Culture';
  if (lower === 'music') return 'Music';
  if (lower === 'fashion') return 'Fashion';
  if (lower === 'beauty') return 'Beauty';
  if (lower === 'latest') return 'Latest';
  return c || 'Latest';
}

export function plainTextFromBody(body = []) {
  const chunks = [];
  for (const block of body || []) {
    if (typeof block === 'string') chunks.push(block);
    else if (block?.heading) chunks.push(block.heading);
    else if (block?.quote) chunks.push(block.quote, block.by || block.name || block.attribution || '');
    else if (block?.credit) chunks.push(block.credit);
    else if (block?.caption) chunks.push(block.caption);
    else if (block?.link?.label) chunks.push(block.link.label);
  }
  return chunks.join(' ').replace(/\s+/g, ' ').trim();
}

export function slugify(value) {
  return String(value || '')
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

export function imageExists(websiteRoot, image) {
  const src = typeof image === 'string' ? image : image?.src;
  if (!src || /^(https?:)?\/\//i.test(src) || /^data:/i.test(src)) return !!src;
  const clean = src.replace(/^\.\//, '').split(/[?#]/)[0];
  return existsSync(join(websiteRoot, clean));
}

export function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[c]);
}

export function escapeXml(value) {
  return escapeHtml(value);
}

export function stripMarkdownInline(value) {
  return String(value || '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\[(.*?)\]\([^)]*\)/g, '$1');
}

export function categoryHref(category) {
  return CATEGORY_ROUTES[String(category || '').toLowerCase()] || 'latest.html';
}

export function resolveArticleRecords(projectRoot, options = {}) {
  const websiteRoot = join(projectRoot, 'website');
  const legacyPath = join(websiteRoot, 'content', options.legacyFile || 'articles.legacy.json');
  const currentPath = join(websiteRoot, 'content', 'articles.json');
  const legacyPayload = readJson(legacyPath, null) || readJson(currentPath, { articles: {} }) || { articles: {} };
  const existing = legacyPayload.articles || {};

  const placementsById = new Map();
  for (const filename of CONTENT_PAGE_FILES) {
    const filePath = join(websiteRoot, filename);
    if (!existsSync(filePath)) continue;
    const pageData = extractPageData(readFileSync(filePath, 'utf8'));
    if (!pageData) continue;
    walk(pageData, (obj, path) => {
      if (!isArticlePlacement(obj)) return;
      const id = String(obj.id);
      if (!placementsById.has(id)) placementsById.set(id, []);
      placementsById.get(id).push({ filename, path: path.join('.'), pageData, card: obj });
    });
  }

  const articles = {};
  for (const [id, placements] of placementsById.entries()) {
    const detail = existing[id] || {};
    const preferred = placements.find(p => p.filename === 'index.html') || placements[0];
    const card = preferred.card || {};
    const placementCategories = [...new Set(placements.map(p => pageCategory(p.filename, p.pageData)).filter(Boolean))];
    const cardCategory = normalizeCategory(card.eyebrow?.category || placementCategories.find(c => c !== 'Latest') || placementCategories[0]);
    const body = Array.isArray(detail.body) ? detail.body : (Array.isArray(card.body) ? card.body : []);
    const hasBody = body.length > 0;
    const title = detail.title || card.title || id;
    const dek = detail.dek || card.dek || '';
    const heroImage = detail.heroImage || detail.image || card.image || {};
    const thumbImage = detail.thumbnailImage || card.image || heroImage || {};
    const topics = Array.isArray(detail.topics) && detail.topics.length
      ? detail.topics
      : [...new Set([cardCategory, ...placementCategories].filter(Boolean))];

    const currentNormalized = readJson(currentPath, { articles: {} })?.articles?.[id] || {};
    const preservedSeo = currentNormalized.seo || {};
    const preservedPlacement = currentNormalized.placement || {};
    const status = currentNormalized.status || (hasBody ? 'published' : 'legacy-placeholder');

    articles[id] = {
      id,
      slug: (hasBody && (!currentNormalized.slug || currentNormalized.slug === id) && slugify(title) !== id) ? slugify(title) : (currentNormalized.slug || id),
      status,
      title,
      dek,
      category: currentNormalized.category || cardCategory,
      categories: currentNormalized.categories || [...new Set([cardCategory, ...placementCategories.filter(c => c !== 'Latest')].filter(Boolean))],
      tags: currentNormalized.tags || topics,
      format: detail.format || card.format || '',
      author: detail.author || card.author || '',
      authorUrl: detail.authorUrl || card.authorUrl || '',
      date: detail.date || card.date || '',
      updatedDate: currentNormalized.updatedDate || '',
      eyebrow: detail.eyebrow || card.eyebrow || (cardCategory ? { category: cardCategory } : {}),
      thumbnailImage: thumbImage,
      heroImage,
      image: heroImage,
      topics,
      placement: {
        home: preservedPlacement.home ?? placements.some(p => p.filename === 'index.html'),
        latest: preservedPlacement.latest ?? placements.some(p => p.filename === 'latest.html'),
        featured: preservedPlacement.featured ?? placements.some(p => /hero|featured|feature/i.test(p.path)),
        pages: preservedPlacement.pages || placements.map(p => p.filename)
      },
      seo: {
        title: preservedSeo.title || title,
        description: preservedSeo.description || dek,
        primaryKeyword: preservedSeo.primaryKeyword || '',
        canonical: preservedSeo.canonical || '',
        ogTitle: preservedSeo.ogTitle || '',
        ogDescription: preservedSeo.ogDescription || '',
        ogImage: preservedSeo.ogImage || ''
      },
      body,
      migration: {
        contentStatus: hasBody ? 'complete' : 'needs-copy',
        legacyHref: card.href || `article.html?id=${id}`,
        placements: placements.map(p => ({ page: p.filename, path: p.path }))
      }
    };
  }

  // Preserve normalized articles created later in the CMS even if they do not yet
  // have a legacy card placement in one of the inline page-data files.
  const currentPayload = readJson(currentPath, { articles: {} }) || { articles: {} };
  for (const [id, record] of Object.entries(currentPayload.articles || {})) {
    if (articles[id]) continue;
    if (record && record.id && record.title) articles[id] = record;
  }

  return articles;
}
