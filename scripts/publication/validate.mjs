import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { imageExists, slugify } from './lib.mjs';
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const website = join(root, 'website');
const payload = JSON.parse(readFileSync(join(website, 'content', 'articles.json'), 'utf8'));
const articles = Object.values(payload.articles || {});
const errors = [], warnings = [];
const slugs = new Map();
for (const a of articles) {
  if (!a.id || !a.title || !a.slug) errors.push(`${a.id || '(unknown)'}: missing id/title/slug`);
  if (slugs.has(a.slug)) errors.push(`${a.id}: duplicate slug with ${slugs.get(a.slug)}`); else slugs.set(a.slug, a.id);
  if (a.status === 'published' && !(Array.isArray(a.body) && a.body.length)) errors.push(`${a.id}: published with no body`);
  if ((a.heroImage || a.image)?.src && !imageExists(website, a.heroImage || a.image)) warnings.push(`${a.id}: image missing ${(a.heroImage || a.image).src}`);
  if (a.status === 'published' && a.body?.length && a.slug === a.id && slugify(a.title) !== a.slug) warnings.push(`${a.id}: legacy slug appears unrelated to current title; initial migration should use ${slugify(a.title)}`);
}
console.log(`Articles: ${articles.length}; errors: ${errors.length}; warnings: ${warnings.length}`);
errors.forEach(x => console.error('ERROR', x));
warnings.forEach(x => console.warn('WARN', x));
if (errors.length) process.exitCode = 1;
