const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
let catalog = { articles: {} };
let current = null;
let dirty = false;

const categories = ['Latest', 'Fashion', 'Beauty', 'Art & Photography', 'Film & TV', 'Music', 'Life & Culture'];
const providerOptions = ['youtube', 'vimeo', 'instagram', 'tiktok', 'spotify', 'soundcloud', 'archive', 'file'];

async function api(url, opts = {}) {
  const response = await fetch(url, { headers: { 'content-type': 'application/json' }, ...opts });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Request failed');
  return body;
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function formEl(name) { return document.querySelector(`[name="${name}"]`); }
function setDirty(value = true) { dirty = value; $('#saveState').textContent = value ? 'Unsaved changes' : ''; }
function slugify(value) {
  return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100);
}

function list() {
  const q = $('#search').value.toLowerCase();
  const status = $('#statusFilter').value;
  const rows = Object.values(catalog.articles || {})
    .filter(a => (!status || a.status === status) && (!q || `${a.title} ${a.category} ${(a.tags || []).join(' ')}`.toLowerCase().includes(q)))
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  $('#articleList').innerHTML = rows.map(a => `<button class="article-item ${current?.id === a.id ? 'active' : ''}" data-id="${esc(a.id)}"><strong>${esc(a.title)}</strong><span>${esc(a.status)} · ${esc(a.category || '')}</span></button>`).join('');
  $$('.article-item').forEach(button => button.onclick = () => openArticle(button.dataset.id));
}

function renderCrosspost() {
  const primary = formEl('category').value;
  const extra = (current.categories || []).filter(c => c && c !== primary);
  $('#crosspost').innerHTML = categories.filter(c => c !== primary).map(c => `<label><input type="checkbox" class="xp" value="${esc(c)}" ${extra.includes(c) ? 'checked' : ''}> ${esc(c)}</label>`).join('');
  $$('.xp').forEach(cb => cb.onchange = () => setDirty());
}
function collectCategories() {
  const primary = formEl('category').value;
  const extra = $$('.xp:checked').map(cb => cb.value);
  return [primary, ...extra.filter(c => c !== primary)];
}

function updateSeoWarnings() {
  if (!current) return;
  const box = $('#seoWarnings');
  const warnings = [];
  const title = (formEl('seoTitle').value || formEl('title').value || '').trim();
  const desc = (formEl('seoDescription').value || formEl('dek').value || '').trim();
  const keyword = formEl('keyword').value.trim().toLowerCase();
  const status = formEl('status').value;
  const bodyLen = (current.body || []).length;
  const thumb = formEl('thumbSrc').value.trim();
  const hero = formEl('heroSrc').value.trim();
  const slug = formEl('slug').value.trim();
  const duplicateSlug = Object.values(catalog.articles || {}).find(a => a.id !== current.id && a.slug === slug);

  if (!title) warnings.push(['warn', 'Add an SEO title (or headline).']);
  else if (title.length > 60) warnings.push(['warn', `SEO title is ${title.length} characters; aim for 60 or fewer.`]);
  if (!desc) warnings.push(['warn', 'Add a meta description (or deck).']);
  else if (desc.length < 50) warnings.push(['warn', `Meta description is short (${desc.length} characters); 50–160 is a useful range.`]);
  else if (desc.length > 160) warnings.push(['warn', `Meta description is ${desc.length} characters; trim it to 160 or fewer.`]);
  if (keyword && !(title.toLowerCase().includes(keyword) || desc.toLowerCase().includes(keyword))) warnings.push(['warn', 'Primary keyword does not appear in the SEO title or description.']);
  if (!(hero || thumb)) warnings.push(['warn', 'No hero/thumbnail image is set.']);
  if (!slug) warnings.push(['warn', 'Permanent slug is required.']);
  if (duplicateSlug) warnings.push(['warn', `Slug is already used by “${duplicateSlug.title}”.`]);
  if (status === 'published' && !bodyLen) warnings.push(['warn', 'Published articles need body content before a permanent SEO page can be generated.']);
  if (!warnings.length && (title || desc)) warnings.push(['ok', 'SEO and publication essentials look good.']);
  box.innerHTML = warnings.map(([kind, text]) => `<div class="seo-warn ${kind}">${esc(text)}</div>`).join('');
}

function articleOptionHtml(selected = '') {
  return `<option value="">Choose article…</option>` + Object.values(catalog.articles || {})
    .filter(a => a.id !== current?.id && a.title)
    .sort((a, b) => String(a.title).localeCompare(String(b.title)))
    .map(a => `<option value="${esc(a.id)}" ${a.id === selected ? 'selected' : ''}>${esc(a.title)}</option>`).join('');
}

function openArticle(id) {
  if (dirty && !confirm('Discard unsaved changes?')) return;
  current = structuredClone(catalog.articles[id]);
  $('#empty').hidden = true;
  $('#form').hidden = false;
  $('#articleId').textContent = current.id;
  $('#editorTitle').textContent = current.title;
  const values = {
    title: current.title,
    slug: current.slug,
    status: current.status,
    category: current.category,
    author: current.author,
    date: current.date,
    updatedDate: current.updatedDate,
    dek: current.dek,
    tags: (current.tags || []).join(', '),
    thumbSrc: current.thumbnailImage?.src || '',
    thumbAlt: current.thumbnailImage?.alt || '',
    heroSrc: current.heroImage?.src || '',
    heroAlt: current.heroImage?.alt || '',
    socialSrc: current.seo?.ogImage || '',
    seoTitle: current.seo?.title || '',
    keyword: current.seo?.primaryKeyword || '',
    seoDescription: current.seo?.description || '',
    ogTitle: current.seo?.ogTitle || '',
    ogDescription: current.seo?.ogDescription || '',
    canonical: current.seo?.canonical || ''
  };
  Object.entries(values).forEach(([name, value]) => { if (formEl(name)) formEl(name).value = value || ''; });
  formEl('home').checked = !!current.placement?.home;
  formEl('latest').checked = !!current.placement?.latest;
  formEl('homeSection').value = current.placement?.homeSection || '';
  renderCrosspost();
  renderBlocks();
  updateSeoWarnings();
  setDirty(false);
  list();
}

function collect() {
  if (!current) return null;
  current.title = formEl('title').value.trim();
  current.slug = formEl('slug').value.trim();
  current.status = formEl('status').value;
  current.category = formEl('category').value;
  current.author = formEl('author').value.trim();
  current.date = formEl('date').value.trim();
  current.updatedDate = formEl('updatedDate').value.trim();
  current.dek = formEl('dek').value.trim();
  current.tags = formEl('tags').value.split(',').map(s => s.trim()).filter(Boolean);
  current.topics = current.tags.length ? current.tags : [current.category];
  current.categories = collectCategories();
  current.thumbnailImage = { ...(current.thumbnailImage || {}), src: formEl('thumbSrc').value.trim(), alt: formEl('thumbAlt').value.trim(), focal: current.thumbnailImage?.focal || '50% 50%' };
  current.heroImage = { ...(current.heroImage || {}), src: formEl('heroSrc').value.trim(), alt: formEl('heroAlt').value.trim(), focal: current.heroImage?.focal || '50% 50%' };
  current.image = current.heroImage;
  const home = formEl('home').checked;
  current.placement = { ...(current.placement || {}), home, latest: formEl('latest').checked, homeSection: home ? formEl('homeSection').value : '' };
  current.seo = {
    ...(current.seo || {}),
    title: formEl('seoTitle').value.trim(),
    primaryKeyword: formEl('keyword').value.trim(),
    description: formEl('seoDescription').value.trim(),
    ogTitle: formEl('ogTitle').value.trim(),
    ogDescription: formEl('ogDescription').value.trim(),
    ogImage: formEl('socialSrc').value.trim(),
    canonical: formEl('canonical').value.trim()
  };
  return current;
}

function newBlock(type) {
  if (type === 'paragraph') return '';
  if (type === 'heading') return { heading: '' };
  if (type === 'subheading') return { subheading: '' };
  if (type === 'quote') return { quote: '', by: '' };
  if (type === 'image') return { image: { src: '', alt: '', focal: '50% 50%' }, caption: '' };
  if (type === 'fullImage') return { fullImage: { src: '', alt: '', focal: '50% 50%' }, caption: '' };
  if (type === 'gallery') return { gallery: [], columns: 3, caption: '' };
  if (type === 'video') return { video: { url: '', provider: 'youtube' }, caption: '' };
  if (type === 'spotify') return { video: { url: '', provider: 'spotify' }, caption: '' };
  if (type === 'soundcloud') return { video: { url: '', provider: 'soundcloud' }, caption: '' };
  if (type === 'relatedArticle') return { relatedArticle: '' };
  if (type === 'divider') return { divider: true };
  if (type === 'spacer') return { spacer: 'medium' };
  if (type === 'link') return { link: { href: '', label: 'View link' } };
  if (type === 'credit') return { credit: '' };
  return '';
}

function blockType(block) {
  if (typeof block === 'string') return 'paragraph';
  if (block.heading !== undefined) return 'heading';
  if (block.subheading !== undefined) return 'subheading';
  if (block.quote !== undefined) return 'quote';
  if (block.fullImage) return 'fullImage';
  if (block.image) return 'image';
  if (block.gallery) return 'gallery';
  if (block.relatedArticle !== undefined) return 'relatedArticle';
  if (block.divider) return 'divider';
  if (block.spacer) return 'spacer';
  if (block.video || block.youtube) {
    const provider = block.video?.provider || 'youtube';
    if (provider === 'spotify') return 'spotify';
    if (provider === 'soundcloud') return 'soundcloud';
    return 'video';
  }
  if (block.link) return 'link';
  if (block.credit !== undefined) return 'credit';
  return 'unknown';
}

function richToolbar() {
  return `<div class="rich-toolbar"><button type="button" data-format="bold"><strong>B</strong></button><button type="button" data-format="italic"><em>I</em></button><button type="button" data-format="link">LINK</button><small>Uses lightweight Markdown: **bold**, *italic*, [text](https://…)</small></div>`;
}

function renderBlocks() {
  const body = current.body || [];
  $('#blocks').innerHTML = body.map((block, index) => {
    const type = blockType(block);
    let fields = '';
    if (type === 'paragraph') fields = `${richToolbar()}<textarea data-field="paragraph" rows="7">${esc(block)}</textarea>`;
    if (type === 'heading') fields = `<input data-field="heading" value="${esc(block.heading)}">`;
    if (type === 'subheading') fields = `<input data-field="subheading" value="${esc(block.subheading)}">`;
    if (type === 'quote') fields = `<textarea data-field="quote" rows="5">${esc(block.quote)}</textarea><input data-field="by" placeholder="Attribution" value="${esc(block.by || block.name || block.attribution || '')}">`;
    if (type === 'image' || type === 'fullImage') {
      const image = type === 'fullImage' ? block.fullImage : block.image;
      fields = `<input data-field="src" placeholder="Image path" value="${esc(image?.src || '')}"><input data-field="alt" placeholder="Alt text" value="${esc(image?.alt || '')}"><input data-field="caption" placeholder="Caption / credit" value="${esc(block.caption || '')}"><div class="block-upload"><input type="file" data-upload accept="image/png,image/jpeg,image/webp,image/avif"><small>Upload to set the path</small></div>`;
    }
    if (type === 'gallery') fields = `<textarea data-field="gallery" rows="6" placeholder="One image path per line">${esc((block.gallery || []).map(x => x.src || x).join('\n'))}</textarea><label>Columns<select data-field="columns"><option value="2" ${Number(block.columns) === 2 ? 'selected' : ''}>2</option><option value="3" ${Number(block.columns) !== 2 ? 'selected' : ''}>3</option></select></label><input data-field="caption" placeholder="Caption" value="${esc(block.caption || '')}"><div class="block-upload"><input type="file" data-upload multiple accept="image/png,image/jpeg,image/webp,image/avif"><small>Upload to append paths</small></div>`;
    if (type === 'video' || type === 'spotify' || type === 'soundcloud') {
      const provider = block.video?.provider || (type === 'spotify' ? 'spotify' : type === 'soundcloud' ? 'soundcloud' : 'youtube');
      fields = `<input data-field="url" placeholder="Media URL or local asset path" value="${esc(block.video?.url || block.youtube || '')}"><select data-field="provider">${providerOptions.map(p => `<option value="${p}" ${p === provider ? 'selected' : ''}>${p}</option>`).join('')}</select><input data-field="poster" placeholder="Poster image path (optional)" value="${esc(block.video?.poster || '')}"><input data-field="caption" placeholder="Caption" value="${esc(block.caption || '')}">`;
    }
    if (type === 'relatedArticle') fields = `<select data-field="relatedArticle">${articleOptionHtml(block.relatedArticle || '')}</select>`;
    if (type === 'divider') fields = `<p class="block-note">Horizontal divider</p>`;
    if (type === 'spacer') fields = `<select data-field="spacer"><option value="small" ${block.spacer === 'small' ? 'selected' : ''}>Small</option><option value="medium" ${!block.spacer || block.spacer === 'medium' ? 'selected' : ''}>Medium</option><option value="large" ${block.spacer === 'large' ? 'selected' : ''}>Large</option></select>`;
    if (type === 'link') fields = `<input data-field="href" placeholder="https://" value="${esc(block.link.href || '')}"><input data-field="label" placeholder="Button label" value="${esc(block.link.label || '')}">`;
    if (type === 'credit') fields = `<input data-field="credit" value="${esc(block.credit || '')}">`;
    return `<div class="block" data-index="${index}" data-type="${type}"><div class="block-head"><strong>${esc(type)}</strong><div class="block-actions"><button type="button" data-act="up">↑</button><button type="button" data-act="down">↓</button><button type="button" data-act="remove">REMOVE</button></div></div>${fields}</div>`;
  }).join('');

  $$('.block').forEach(el => {
    const index = Number(el.dataset.index);
    const type = el.dataset.type;
    $$('[data-field]', el).forEach(input => {
      const eventName = input.tagName === 'SELECT' ? 'change' : 'input';
      input.addEventListener(eventName, () => { updateBlock(index, type, el); setDirty(); });
    });
    $$('[data-act]', el).forEach(button => button.onclick = () => blockAction(index, button.dataset.act));
    $$('[data-format]', el).forEach(button => button.onclick = () => applyRichFormat(el, index, button.dataset.format));
    if (type === 'image' || type === 'fullImage' || type === 'gallery') wireBlockUpload(el, index, type === 'gallery' ? 'gallery' : 'src');
  });
}

function applyRichFormat(el, index, format) {
  const area = $('[data-field="paragraph"]', el);
  if (!area) return;
  const start = area.selectionStart, end = area.selectionEnd;
  const selected = area.value.slice(start, end) || (format === 'link' ? 'link text' : 'text');
  let replacement = selected;
  if (format === 'bold') replacement = `**${selected}**`;
  if (format === 'italic') replacement = `*${selected}*`;
  if (format === 'link') replacement = `[${selected}](https://)`;
  area.setRangeText(replacement, start, end, 'select');
  updateBlock(index, 'paragraph', el);
  setDirty();
  area.focus();
}

function updateBlock(index, type, el) {
  const val = field => $(`[data-field="${field}"]`, el)?.value || '';
  if (type === 'paragraph') current.body[index] = val('paragraph');
  else if (type === 'heading') current.body[index] = { heading: val('heading') };
  else if (type === 'subheading') current.body[index] = { subheading: val('subheading') };
  else if (type === 'quote') current.body[index] = { quote: val('quote'), by: val('by') };
  else if (type === 'image') current.body[index] = { image: { src: val('src'), alt: val('alt'), focal: '50% 50%' }, caption: val('caption') };
  else if (type === 'fullImage') current.body[index] = { fullImage: { src: val('src'), alt: val('alt'), focal: '50% 50%' }, caption: val('caption') };
  else if (type === 'gallery') current.body[index] = { gallery: val('gallery').split('\n').map(s => s.trim()).filter(Boolean).map(src => ({ src, alt: '' })), columns: Number(val('columns')) || 3, caption: val('caption') };
  else if (type === 'video' || type === 'spotify' || type === 'soundcloud') current.body[index] = { video: { url: val('url'), provider: val('provider') || 'youtube', ...(val('poster') ? { poster: val('poster') } : {}) }, caption: val('caption') };
  else if (type === 'relatedArticle') current.body[index] = { relatedArticle: val('relatedArticle') };
  else if (type === 'divider') current.body[index] = { divider: true };
  else if (type === 'spacer') current.body[index] = { spacer: val('spacer') || 'medium' };
  else if (type === 'link') current.body[index] = { link: { href: val('href'), label: val('label') } };
  else if (type === 'credit') current.body[index] = { credit: val('credit') };
}

function blockAction(index, action) {
  if (action === 'remove') current.body.splice(index, 1);
  if (action === 'up' && index > 0) [current.body[index - 1], current.body[index]] = [current.body[index], current.body[index - 1]];
  if (action === 'down' && index < current.body.length - 1) [current.body[index + 1], current.body[index]] = [current.body[index], current.body[index + 1]];
  renderBlocks();
  setDirty();
}

async function upload(file, target) {
  if (!current || !file) return;
  const dataUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
  const result = await api('/api/media', { method: 'POST', body: JSON.stringify({ articleId: current.slug || current.id, name: file.name, dataUrl }) });
  formEl(target).value = result.src;
  setDirty();
  updateSeoWarnings();
}

function wireBlockUpload(el, index, field) {
  const uploadEl = $('[data-upload]', el);
  if (!uploadEl) return;
  uploadEl.onchange = async event => {
    const files = [...event.target.files];
    if (!files.length || !current) return;
    try {
      for (const file of files) {
        const dataUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
        const result = await api('/api/media', { method: 'POST', body: JSON.stringify({ articleId: current.slug || current.id, name: file.name, dataUrl }) });
        const target = $(`[data-field="${field}"]`, el);
        if (field === 'gallery') target.value = (target.value ? `${target.value}\n` : '') + result.src;
        else target.value = result.src;
      }
      updateBlock(index, el.dataset.type, el);
      setDirty();
    } catch (error) { alert(error.message); }
  };
}

$('#thumbUpload').onchange = e => upload(e.target.files[0], 'thumbSrc');
$('#heroUpload').onchange = e => upload(e.target.files[0], 'heroSrc');
$('#socialUpload').onchange = e => upload(e.target.files[0], 'socialSrc');

$('#addBlock').onchange = e => {
  if (!e.target.value || !current) return;
  current.body ||= [];
  current.body.push(newBlock(e.target.value));
  e.target.value = '';
  renderBlocks();
  setDirty();
  updateSeoWarnings();
};

$('#form').oninput = e => {
  if (e.target.closest('.block')) return;
  setDirty();
  if (e.target.name === 'category') renderCrosspost();
  if (['title', 'slug', 'dek', 'seoTitle', 'keyword', 'seoDescription', 'category', 'status', 'thumbSrc', 'heroSrc', 'socialSrc'].includes(e.target.name)) updateSeoWarnings();
};

formEl('homeSection').onchange = () => {
  if (formEl('homeSection').value) formEl('home').checked = true;
  setDirty();
};
formEl('home').onchange = () => {
  if (!formEl('home').checked) formEl('homeSection').value = '';
  setDirty();
};

$('#form').onsubmit = async e => {
  e.preventDefault();
  try {
    const article = collect();
    if (!article.title) throw new Error('Headline is required.');
    if (!article.slug) article.slug = slugify(article.title);
    if (article.status === 'published' && !(article.body || []).length) throw new Error('Add article body content before publishing.');
    const duplicateSlug = Object.values(catalog.articles || {}).find(a => a.id !== article.id && a.slug === article.slug);
    if (duplicateSlug) throw new Error(`That permanent slug is already used by “${duplicateSlug.title}”.`);
    const previous = catalog.articles[article.id];
    const oldSlug = previous?.slug;
    if (previous?.status === 'published' && oldSlug && oldSlug !== article.slug && !confirm(`This changes a published permanent URL from /articles/${oldSlug}/ to /articles/${article.slug}/. Continue?`)) return;
    const saved = await api('/api/articles/' + encodeURIComponent(article.id), { method: 'PUT', body: JSON.stringify(article) });
    catalog.articles[article.id] = saved;
    current = structuredClone(saved);
    setDirty(false);
    list();
    $('#saveState').textContent = 'Saved';
    setTimeout(() => { if (!dirty) $('#saveState').textContent = ''; }, 1500);
  } catch (error) { alert(error.message); }
};

$('#newBtn').onclick = async () => {
  if (dirty && !confirm('Discard unsaved changes?')) return;
  const article = await api('/api/articles', { method: 'POST', body: JSON.stringify({ title: 'Untitled Article' }) });
  catalog.articles[article.id] = article;
  openArticle(article.id);
};

$('#deleteBtn').onclick = async () => {
  if (!current || !confirm(`Delete “${current.title}”? This removes the article record. Run the static build afterward to remove its generated page.`)) return;
  await api('/api/articles/' + encodeURIComponent(current.id), { method: 'DELETE' });
  delete catalog.articles[current.id];
  current = null;
  $('#form').hidden = true;
  $('#empty').hidden = false;
  setDirty(false);
  list();
};

$('#duplicateBtn').onclick = async () => {
  if (!current) return;
  if (dirty && !confirm('Unsaved edits will not be copied. Duplicate the last saved version?')) return;
  try {
    const copy = await api('/api/articles/' + encodeURIComponent(current.id) + '/duplicate', { method: 'POST', body: '{}' });
    catalog.articles[copy.id] = copy;
    dirty = false;
    openArticle(copy.id);
  } catch (error) { alert(error.message); }
};

$('#previewBtn').onclick = () => {
  if (!current) return;
  if (dirty && !confirm('Preview uses the last saved version. Continue?')) return;
  const saved = catalog.articles[current.id] || current;
  const isLive = saved.status === 'published' && (saved.body || []).length;
  const url = isLive ? `/site/articles/${encodeURIComponent(saved.slug || saved.id)}/` : `/site/article.html?id=${encodeURIComponent(saved.id)}`;
  window.open(url, '_blank', 'noopener');
};

$('#buildBtn').onclick = async () => {
  const button = $('#buildBtn');
  button.disabled = true;
  button.textContent = 'BUILDING…';
  try {
    const result = await api('/api/build', { method: 'POST', body: '{}' });
    alert(result.output || 'Build complete');
  } catch (error) { alert(error.message); }
  finally { button.disabled = false; button.textContent = 'BUILD STATIC SITE'; }
};


let mediaFiles = [];
function renderMediaLibrary() {
  const q = String($('#mediaSearch')?.value || '').trim().toLowerCase();
  const visible = mediaFiles.filter(file => !q || file.path.toLowerCase().includes(q)).slice(0, 500);
  $('#mediaGrid').innerHTML = visible.map(file => `<button type="button" class="media-card" data-media-path="${esc(file.path)}"><span class="media-thumb"><img src="/site/${esc(file.path)}" alt="" loading="lazy"></span><span class="media-path">${esc(file.path)}</span></button>`).join('') || '<p class="empty-media">No images match that search.</p>';
  $$('.media-card').forEach(card => card.onclick = async () => {
    const path = card.dataset.mediaPath;
    const target = $('#mediaTarget').value;
    if (target === 'copy') {
      try { await navigator.clipboard.writeText(path); $('#mediaTitle').textContent = 'Path copied'; setTimeout(() => { $('#mediaTitle').textContent = 'Media Library'; }, 900); }
      catch { prompt('Copy image path:', path); }
      return;
    }
    if (!current) { alert('Select an article before assigning an image.'); return; }
    formEl(target).value = path;
    setDirty();
    updateSeoWarnings();
    closeMediaLibrary();
  });
}
async function openMediaLibrary() {
  $('#mediaModal').hidden = false;
  document.body.classList.add('modal-open');
  if (!mediaFiles.length) {
    try { const response = await api('/api/media'); mediaFiles = response.files || []; }
    catch (error) { alert(error.message); closeMediaLibrary(); return; }
  }
  renderMediaLibrary();
  setTimeout(() => $('#mediaSearch')?.focus(), 0);
}
function closeMediaLibrary() {
  $('#mediaModal').hidden = true;
  document.body.classList.remove('modal-open');
}
$('#mediaBtn').onclick = openMediaLibrary;
$$('[data-close-media]').forEach(button => button.onclick = closeMediaLibrary);
$('#mediaSearch').oninput = renderMediaLibrary;
window.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#mediaModal').hidden) closeMediaLibrary(); });

$('#search').oninput = list;
$('#statusFilter').onchange = list;
window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

(async () => {
  catalog = await api('/api/articles');
  list();
})().catch(error => alert(error.message));
