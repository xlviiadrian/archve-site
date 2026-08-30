import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveArticleRecords } from './lib.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const target = join(root, 'website', 'content', 'articles.json');
const articles = resolveArticleRecords(root);
const payload = {
  _schemaVersion: 2,
  _editingNote: 'Central ARCHVE article catalog. New CMS articles should be created here; legacy page placements are retained under migration.placement until category/home modules are fully refactored.',
  articles
};
writeFileSync(target, JSON.stringify(payload, null, 2) + '\n');
const complete = Object.values(articles).filter(a => a.migration?.contentStatus === 'complete').length;
console.log(`Migrated ${Object.keys(articles).length} article records (${complete} with full body copy).`);
