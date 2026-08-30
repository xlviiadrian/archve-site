import http from 'node:http';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { extname, join, normalize, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const website = join(root, 'website');
const adminRoot = join(here, 'public');
const articlesPath = join(website, 'content', 'articles.json');
const host = '127.0.0.1';
const port = Number(process.env.PORT || 4173);

const MIME = {
  '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8',
  '.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.avif':'image/avif',
  '.woff2':'font/woff2','.mp4':'video/mp4','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'
};

function json(res, status, value) {
  res.writeHead(status, {'content-type':'application/json; charset=utf-8','cache-control':'no-store'});
  res.end(JSON.stringify(value));
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', c => { raw += c; if (raw.length > 30_000_000) reject(new Error('Request too large')); });
    req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}
function readCatalog() { return JSON.parse(readFileSync(articlesPath, 'utf8')); }
function writeCatalog(payload) { writeFileSync(articlesPath, JSON.stringify(payload, null, 2) + '\n'); }
function safeSlug(v) { return String(v || '').toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,100); }
function safeFileName(v) { return basename(String(v || 'image')).replace(/[^A-Za-z0-9._-]+/g,'-').slice(0,120); }
function serveFile(res, rootDir, requested) {
  const clean = requested.replace(/^\/+/, '');
  let file = normalize(join(rootDir, clean));
  if (!file.startsWith(normalize(rootDir))) return json(res, 403, {error:'Forbidden'});
  if (existsSync(file) && !extname(file)) file = join(file, 'index.html');
  if (!existsSync(file)) return false;
  try {
    const body = readFileSync(file);
    res.writeHead(200, {'content-type': MIME[extname(file).toLowerCase()] || 'application/octet-stream','cache-control':'no-store'});
    res.end(body); return true;
  } catch { return false; }
}

function listMediaFiles() {
  const base = join(website, 'assets', 'images');
  const files = [];
  const allowed = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.svg']);
  function walkDir(dir) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) { walkDir(full); continue; }
      if (!allowed.has(extname(entry.name).toLowerCase())) continue;
      const rel = full.slice(website.length + 1).replace(/\\/g, '/');
      let size = 0, mtime = 0;
      try { const st = statSync(full); size = st.size; mtime = st.mtimeMs; } catch {}
      files.push({ path: rel, name: entry.name, size, mtime });
    }
  }
  walkDir(base);
  return files.sort((a, b) => b.mtime - a.mtime || a.path.localeCompare(b.path));
}
function runBuild() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['scripts/publication/build-publication.mjs'], { cwd: root });
    let out='', err=''; child.stdout.on('data',d=>out+=d); child.stderr.on('data',d=>err+=d);
    child.on('close', code => code === 0 ? resolve(out.trim()) : reject(new Error(err || `Build exited ${code}`)));
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${host}:${port}`);
  const path = decodeURIComponent(url.pathname);
  try {
    if (path === '/') { res.writeHead(302, {location:'/admin/'}); return res.end(); }
    if (path === '/api/articles' && req.method === 'GET') return json(res, 200, readCatalog());
    if (path.startsWith('/api/articles/') && req.method === 'GET') {
      const id = path.split('/').pop(); const payload = readCatalog(); const article = payload.articles?.[id];
      return article ? json(res,200,article) : json(res,404,{error:'Article not found'});
    }
    if (path === '/api/articles' && req.method === 'POST') {
      const input = await readBody(req); const payload = readCatalog(); payload.articles ||= {};
      const base = safeSlug(input.slug || input.title || 'untitled-article') || 'untitled-article';
      let id = base, n = 2; while (payload.articles[id]) id = `${base}-${n++}`;
      const article = {
        id, slug:id, status:'draft', title:input.title || 'Untitled Article', dek:'', category:'Latest', categories:[], tags:[], format:'', author:'', authorUrl:'', date:'', updatedDate:'',
        eyebrow:{}, thumbnailImage:{src:'',alt:'',focal:'50% 50%'}, heroImage:{src:'',alt:'',focal:'50% 50%'}, image:{src:'',alt:'',focal:'50% 50%'}, topics:[],
        placement:{home:false,latest:true,featured:false,pages:[]}, seo:{title:'',description:'',primaryKeyword:'',canonical:'',ogTitle:'',ogDescription:'',ogImage:''}, body:[],
        migration:{contentStatus:'needs-copy',legacyHref:`article.html?id=${id}`,placements:[]}
      };
      payload.articles[id]=article; writeCatalog(payload); return json(res,201,article);
    }
    if (path.startsWith('/api/articles/') && path.endsWith('/duplicate') && req.method === 'POST') {
      const id = path.slice('/api/articles/'.length, -('/duplicate'.length));
      const payload = readCatalog(); const src = payload.articles?.[id];
      if (!src) return json(res, 404, { error: 'Article not found' });
      const base = safeSlug(`${src.slug || id}-copy`) || `${id}-copy`;
      let newId = base, n = 2; while (payload.articles[newId]) newId = `${base}-${n++}`;
      const copy = JSON.parse(JSON.stringify(src));
      copy.id = newId; copy.slug = newId; copy.status = 'draft';
      copy.title = `${src.title || 'Untitled'} (copy)`;
      // A duplicate starts unplaced so it never inherits live feed/home slots.
      copy.placement = { ...(copy.placement || {}), home: false, latest: false, featured: false, homeSection: '', pages: [] };
      copy.seo = { ...(copy.seo || {}), canonical: '' };
      copy.migration = { contentStatus: Array.isArray(copy.body) && copy.body.length ? 'complete' : 'needs-copy', legacyHref: `article.html?id=${newId}`, placements: [] };
      payload.articles[newId] = copy; writeCatalog(payload); return json(res, 201, copy);
    }
    if (path.startsWith('/api/articles/') && req.method === 'PUT') {
      const id = path.split('/').pop(); const article = await readBody(req); const payload = readCatalog();
      if (!payload.articles?.[id]) return json(res,404,{error:'Article not found'});
      if (!article.id || article.id !== id) return json(res,400,{error:'Article id cannot be changed here'});
      article.slug = safeSlug(article.slug || id) || id;
      article.image = article.heroImage || article.image || {};
      article.migration ||= {contentStatus:'complete',legacyHref:`article.html?id=${id}`,placements:[]};
      article.migration.contentStatus = Array.isArray(article.body) && article.body.length ? 'complete' : 'needs-copy';
      payload.articles[id]=article; writeCatalog(payload); return json(res,200,article);
    }
    if (path.startsWith('/api/articles/') && req.method === 'DELETE') {
      const id = path.split('/').pop(); const payload = readCatalog();
      if (!payload.articles?.[id]) return json(res,404,{error:'Article not found'});
      delete payload.articles[id]; writeCatalog(payload); return json(res,200,{ok:true});
    }
    if (path === '/api/media' && req.method === 'GET') return json(res, 200, { files: listMediaFiles() });
    if (path === '/api/media' && req.method === 'POST') {
      const input = await readBody(req); const m = String(input.dataUrl || '').match(/^data:(image\/(?:png|jpeg|webp|avif));base64,(.+)$/s);
      if (!m) return json(res,400,{error:'Only PNG, JPEG, WebP, or AVIF image uploads are supported'});
      const slug = safeSlug(input.articleId || 'shared') || 'shared'; const name = safeFileName(input.name || `image.${m[1].split('/')[1]}`);
      const dir = join(website,'assets','images','articles',slug); mkdirSync(dir,{recursive:true});
      const file = join(dir,name); writeFileSync(file,Buffer.from(m[2],'base64'));
      return json(res,200,{src:`assets/images/articles/${slug}/${name}`});
    }
    if (path === '/api/build' && req.method === 'POST') {
      const output = await runBuild(); return json(res,200,{ok:true,output});
    }
    if (path.startsWith('/admin/')) {
      const reqPath = path === '/admin/' ? 'index.html' : path.slice('/admin/'.length);
      if (serveFile(res, adminRoot, reqPath)) return;
      return json(res,404,{error:'Admin file not found'});
    }
    if (path.startsWith('/site/')) {
      const reqPath = path.slice('/site/'.length) || 'index.html';
      if (serveFile(res, website, reqPath)) return;
      return json(res,404,{error:'Site file not found'});
    }
    return json(res,404,{error:'Not found'});
  } catch (e) { console.error(e); return json(res,500,{error:e.message || 'Server error'}); }
});
server.listen(port, host, () => console.log(`ARCHVE CMS: http://${host}:${port}/admin/`));
