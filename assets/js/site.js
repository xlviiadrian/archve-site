/* ARCHVE site scripts */
document.documentElement.classList.remove('no-js')
document.documentElement.classList.add('js')

const $ = s => document.querySelector(s)
const $$ = s => Array.from(document.querySelectorAll(s))
const INK = '#0C0C0B'
const PAPER = '#E6E5E0'
const MUTE = '#9b9a93'

const STRIPE = {
  archve_stickers: 'https://buy.stripe.com/28E4gz7EQ5BBceV6F4fjG00',
  archve_keychain_white: 'https://buy.stripe.com/28E4gz7EQ5BBceV6F4fjG00',
  archve_keychain_black: 'https://buy.stripe.com/28E4gz7EQ5BBceV6F4fjG00',
  donate_custom: 'https://buy.stripe.com/28E4gz7EQ5BBceV6F4fjG00'
}

const TALLY_PITCH_ID = 'eqoRyO'
const TALLY_LINK = `#tally-open=${TALLY_PITCH_ID}&tally-align-left=1&tally-overlay=1&tally-emoji-animation=none&tally-auto-close=0`
const TALLY_ATTR = `data-tally-open='${TALLY_PITCH_ID}' data-tally-align-left='1' data-tally-overlay='1' data-tally-emoji-animation='none' data-tally-auto-close='0'`
const TALLY_LIST_ID = 'kdrEPd'
const TALLY_LIST_LINK = `#tally-open=${TALLY_LIST_ID}&tally-layout=modal&tally-overlay=1&tally-auto-close=0`
const TALLY_LIST_ATTR = `data-tally-open='${TALLY_LIST_ID}' data-tally-layout='modal' data-tally-overlay='1' data-tally-auto-close='0'`
const HERO_COVER_SRC = 'assets/images/editorial/hero-cover.png?v=2'

const yr = $('#yr')
if(yr) yr.textContent = new Date().getFullYear()

const flashEl = $('#flash')
let flashT
function flash(html){
  if(!flashEl) return
  flashEl.innerHTML = html
  flashEl.classList.add('show')
  clearTimeout(flashT)
  flashT = setTimeout(() => flashEl.classList.remove('show'), 4200)
}
function goStripe(key,label){
  const url = STRIPE[key]
  if(url && !String(url).startsWith('REPLACE')) window.open(url,'_blank','noopener')
  else flash(`Stripe link not set for <b>${label}</b>.`)
}
function safe(t){
  return String(t || '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll(`'`,'&#39;')
}
function shuffled(arr){
  const a = arr.slice()
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1))
    const temp = a[i]
    a[i] = a[j]
    a[j] = temp
  }
  return a
}
function fallbackCover(label = 'ARCHVE'){
  return `<svg class='fallback-svg' viewBox='0 0 600 338' preserveAspectRatio='xMidYMid slice' xmlns='http://www.w3.org/2000/svg'><rect width='600' height='338' fill='${INK}'/><text x='300' y='190' text-anchor='middle' font-family='Archivo, Arial, sans-serif' font-size='92' font-weight='900' fill='${PAPER}' letter-spacing='-5'>${safe(label)}</text><text x='300' y='230' text-anchor='middle' font-family='Archivo, Arial, sans-serif' font-size='14' fill='${MUTE}' letter-spacing='3'>HOUSTON ARCHVE MAGAZINE</text></svg>`
}
function fallbackProduct(){
  return `<svg class='fallback-svg' viewBox='0 0 600 600' preserveAspectRatio='xMidYMid slice' xmlns='http://www.w3.org/2000/svg'><rect width='600' height='600' fill='${INK}'/><rect x='28' y='28' width='544' height='544' fill='none' stroke='${PAPER}' stroke-width='6'/><text x='300' y='280' text-anchor='middle' font-family='Archivo, Arial, sans-serif' font-size='86' font-weight='900' fill='${PAPER}' letter-spacing='-4'>COMING</text><text x='300' y='370' text-anchor='middle' font-family='Archivo, Arial, sans-serif' font-size='86' font-weight='900' fill='${PAPER}' letter-spacing='-4'>SOON</text><text x='300' y='438' text-anchor='middle' font-family='Archivo, Arial, sans-serif' font-size='16' fill='${MUTE}' letter-spacing='4'>ARCHVE SHOP</text></svg>`
}
function imgWithFallback(src,alt,fallback){
  return `<img class='asset-img' src='${src}' alt='${safe(alt)}' loading='lazy' onerror='this.remove()'>${fallback}`
}
function ytId(input){
  const s = String(input || '').trim()
  if(s.length === 11 && !s.includes('/')) return s
  const parts = ['v=','youtu.be/','/shorts/','/embed/']
  for(const p of parts){
    const i = s.indexOf(p)
    if(i > -1) return s.slice(i + p.length, i + p.length + 11)
  }
  return ''
}
function videoThumb(v){
  const id = ytId(v.youtube)
  return v.thumb || (id ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` : '')
}
function videoHref(v){
  if(v.youtube) return v.youtube
  if(v.list) return `https://www.youtube.com/playlist?list=${v.list}`
  return 'do-not-click.html'
}

const burger = $('#burger')
const nav = $('#nav')
if(burger && nav){
  burger.addEventListener('click',() => {
    const open = nav.classList.toggle('open')
    burger.setAttribute('aria-expanded',open)
    burger.textContent = open ? 'Close' : 'Menu'
    document.body.style.overflow = open ? 'hidden' : ''
  })
  nav.querySelectorAll('[data-close]').forEach(a => a.addEventListener('click',() => {
    nav.classList.remove('open')
    burger.setAttribute('aria-expanded','false')
    burger.textContent = 'Menu'
    document.body.style.overflow = ''
  }))
}

const ticker = $('#ticker')
if(ticker){
  const items = ['ARCHVE magazine','Houston music, style, and culture','Open call for stories','PRINT IS NOT DEAD.','Issue 001 in production','Subscribe for first access']
  const line = items.map(t => `<span>${t}</span><span class='dot'>/</span>`).join('')
  ticker.innerHTML = line + line
}

const lead = $('.lead')
if(lead){
  const h1 = lead.querySelector('h1')
  const dek = lead.querySelector('.dek')
  const cover = lead.querySelector('[data-cover=lead]')
  if(h1) h1.innerHTML = `MODERN MAGAZINES ARE<br><span class='pt'>BORING.</span>`
  if(dek) dek.innerHTML = `Most magazines today feel the same: safe, “minimal,” corporate, lifeless, and flat-out JCPenney’s-ass design.<br><br>ARCHVE is not here to sit politely next to every other magazine. Every safe layout, every watered-down feature, every lifeless publication is competition. Houston is too alive to be documented by dead media. The city has too much culture, too much style, too many artists, too many businesses, and too many stories to keep getting flattened into boring content. This is not another clean little magazine made to disappear. ARCHVE is here to make Houston impossible to ignore and bring cool magazines back.`
  if(cover) cover.insertAdjacentHTML('afterbegin',imgWithFallback(HERO_COVER_SRC,'ARCHVE hero cover image',fallbackCover('ARCHVE')))
}

const REZO_STORY = {
  title: 'Rezoworld’s Supreme × DJ Screw collab brings the S.U.C. to Spring 2026',
  cat: 'Culture',
  href: 'supreme-dj-screw.html',
  thumb: 'assets/images/editorial/rezothumbnail.jpg',
  dek: 'Supreme, DJ Screw, and the Screwed Up Click meet inside a Spring 2026 drop rooted in Houston’s living archive.'
}
const G6_FORM_LINK = 'https://docs.google.com/forms/d/e/1FAIpQLSeC02ZKjiJwIJSuYlCjeggBHcpgk6Ec9dm6ggkbbaxkzjV35g/viewform'
const rows = {
  noise: [
    {cat:'Music Video',img:'https://i.ytimg.com/vi/1zfrMs4jm9Q/maxresdefault.jpg',no:'MV-101',head:'SippinWesson - NEW 55',dek:'Official music video.',href:'https://www.youtube.com/watch?v=1zfrMs4jm9Q&list=RD1zfrMs4jm9Q&start_radio=1'},
    {cat:'Music Video',img:'https://i.ytimg.com/vi/w__kDsMI9Dw/maxresdefault.jpg',no:'MV-102',head:'Rome is No Fun - Familiar',dek:'Official music video.',href:'https://www.youtube.com/watch?v=w__kDsMI9Dw&list=RDw__kDsMI9Dw&start_radio=1'},
    {cat:'Music Video',img:'https://i.ytimg.com/vi/WceFD9vakgo/maxresdefault.jpg',no:'MV-105',head:'KEVIN ABSTRACT - H-TOWN',dek:'Official music video.',href:'https://www.youtube.com/watch?v=WceFD9vakgo'}
  ],
  threads: [
    {cat:'Fashion',img:'assets/images/editorial/g6modelapplicationform.jpg',no:'AR-201',head:'G6 Model Release & Registration Form',dek:'Submit model information for G6 registration, scheduling, and production opportunities.',href:G6_FORM_LINK},
    {cat:'Culture',img:REZO_STORY.thumb,no:'AR-202',head:REZO_STORY.title,dek:REZO_STORY.dek,href:REZO_STORY.href}
  ]
}
const videos = [
  {cat:'Screwtape',title:'DJ Screw — Fat Pat Freestyle',channel:'DJ Screw',youtube:'https://www.youtube.com/watch?v=gBvPJEwFw3U'},
  {cat:'Short',title:'@playerunderpressure_',channel:'@playerunderpressure_',youtube:'https://youtube.com/shorts/oKHiiqsDVBY?si=U_JkKqq0bRV63pKD',thumb:'assets/images/editorial/playerunderpressure-thumbnail.jpg'},
  {cat:'Music Video',title:'NEW 55',channel:'SippinWesson',youtube:'https://www.youtube.com/watch?v=1zfrMs4jm9Q'},
  {cat:'Release',title:'CHEPÉ — Out Now',channel:'SippinWesson',list:'OLAK5uy_kvYAt2Izi9pzL4eCxz5f79u3kE3x1m-DA',thumb:'assets/images/editorial/chepe-sippinwesson-thumbnail.jpg'},
  {cat:'Collab',title:'Faded Decade x Houston Texans Collab',channel:'Faded Decade',youtube:'https://www.youtube.com/watch?v=oPMQp8sBjIM'},
  {cat:'Session',title:'Good Summer Session',channel:'Faded Decade',youtube:'https://www.youtube.com/watch?v=A-yTmI7GjfY'},
  {cat:'Music Video',title:'Familiar',channel:'Rome Is No Fun',youtube:'https://www.youtube.com/watch?v=w__kDsMI9Dw'},
  {cat:'Throwback',title:'Bun B Interviews DJ Screw',channel:'S.U.C.',youtube:'https://www.youtube.com/watch?v=Al26am6FEwY'},
  {cat:'Interview',title:'Pimp C Interview with Bun B',channel:'UGK',youtube:'https://www.youtube.com/watch?v=4Lt-Bx-41sU'}
]
function card(f){
  const href = f.href || TALLY_LINK
  const ext = href.startsWith('http') ? `target='_blank' rel='noopener'` : ''
  return `<a class='acard reveal' href='${href}' ${ext}><div class='cover'>${imgWithFallback(f.img,f.head,fallbackCover(f.cat || 'ARCHVE'))}<span class='frameno'>Ref·${f.no || ''}</span></div><span class='kick'>${safe(f.cat || 'ARCHVE')}</span><h3>${safe(f.head)}</h3><p class='adek'>${safe(f.dek || '')}</p><p class='byline'>${href.startsWith('http') ? 'Open link' : 'Read story'}</p></a>`
}
Object.entries(rows).forEach(([key,items]) => {
  const el = document.querySelector(`[data-row='${key}']`)
  if(el) el.innerHTML = items.map(card).join('')
})
let features = []
const featuresEl = $('#features')
if(featuresEl){
  const pool = [
    ...Object.values(rows).flat(),
    ...videos.map(v => ({cat:v.cat,img:videoThumb(v) || 'assets/images/editorial/feature-music.png',no:'Video',head:v.title,dek:`${v.channel} · ${v.cat}`,href:videoHref(v)})),
    {cat:REZO_STORY.cat,img:REZO_STORY.thumb,no:'Story',head:REZO_STORY.title,dek:REZO_STORY.dek,href:REZO_STORY.href}
  ]
  features = shuffled(pool).slice(0,3)
  featuresEl.innerHTML = features.map(card).join('')
}
const latestFeed = $('#latestFeed')
if(latestFeed){
  latestFeed.innerHTML = shuffled(videos).slice(0,6).map(v => {
    const thumb = videoThumb(v)
    const id = ytId(v.youtube)
    const img = thumb ? `<img src='${thumb}' alt='${safe(v.title)}' loading='lazy' decoding='async' onerror='this.src=&apos;https://i.ytimg.com/vi/${id}/hqdefault.jpg&apos;'>` : `<span class='fallback'><b>${safe(v.channel)}</b></span>`
    return `<a class='ditem ditem-media' href='${videoHref(v)}' target='_blank' rel='noopener'><div class='dthumb'>${img}</div><div class='dmeta'><div class='row'><span class='cat'>${safe(v.cat)}</span><span class='status'>${safe(v.channel)}</span></div><h3>${safe(v.title)}</h3></div></a>`
  }).join('')
}
const videoRows = $('#videoRows')
if(videoRows){
  const groups = [
    {label:'Music Videos',cats:['Music Video']},
    {label:'Behind The Scenes',cats:['BTS']},
    {label:'Interviews',cats:['Interview']},
    {label:'Screwtapes & Throwbacks',cats:['Screwtape','Throwback']},
    {label:'Sessions & Releases',cats:['Session','Release','Collab']}
  ]
  videoRows.innerHTML = groups.map(g => {
    const items = videos.filter(v => g.cats.includes(v.cat))
    if(!items.length) return ''
    return `<div class='sec-head sub-head'><div class='l'><a class='sec-title' href='#noise'>${g.label}</a></div><a class='seeall' href='${TALLY_LINK}' ${TALLY_ATTR}>See All →</a></div><div class='video-grid'>${items.map(v => `<article class='vcard reveal'><a class='video-embed video-facade' href='${videoHref(v)}' target='_blank' rel='noopener'>${videoThumb(v) ? `<img class='video-thumb' src='${videoThumb(v)}' alt='${safe(v.title)}' loading='lazy'>` : `<span class='video-thumb thumb-missing'><b>${safe(v.channel)}</b></span>`}<span class='play-btn'></span></a><span class='kick'>${safe(v.cat)}</span><h3>${safe(v.title)}</h3><p class='byline'>${safe(v.channel)} · Video</p></article>`).join('')}</div>`
  }).join('')
}

const products = [
  {id:'archve_stickers',img:'assets/images/products/coming-soon_stickers_.png',name:'ARCHVE Stickers'},
  {id:'archve_keychain_white',img:'assets/images/products/coming-soon_white-keychain_.png',name:'ARCHVE Keychain — White'},
  {id:'archve_keychain_black',img:'assets/images/products/coming-soon_black-keychain_.png',name:'ARCHVE Keychain — Black'}
].map((p,i) => ({...p,desc:'Coming soon',price:'Soon',no:`SHOP.${String(i + 1).padStart(2,'0')}`,soon:true}))
const grid = $('#shopGrid')
if(grid){
  grid.innerHTML = products.map(p => `<article class='card soon'><div class='thumb' data-img><span class='frameno'>${p.no}</span><span class='sold'>Coming soon</span>${imgWithFallback(p.img,p.name,fallbackProduct())}</div><div class='card-body'><span class='card-name'>${safe(p.name)}</span><span class='card-desc'>${safe(p.desc)}</span><div class='card-foot'><span class='price'>${p.price}</span><a class='btn btn-ink' href='${TALLY_LIST_LINK}' ${TALLY_LIST_ATTR}>Notify me</a></div></div></article>`).join('')
}
const donateBtn = $('#donateBtn')
if(donateBtn) donateBtn.addEventListener('click',() => goStripe('donate_custom','Support ARCHVE'))

if('IntersectionObserver' in window){
  const io = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target) }}),{threshold:.14})
  $$('.reveal').forEach(el => io.observe(el))
}else $$('.reveal').forEach(el => el.classList.add('in'))

;(function(){
  const overlay = $('#searchOverlay')
  const input = $('#searchInput')
  const results = $('#searchResults')
  const catCols = $('#catCols')
  const openBtn = $('.search-btn')
  if(!overlay || !input || !results || !catCols || !openBtn) return
  const DNC = 'do-not-click.html'
  const sectionByCat = {'music':DNC,'fashion & streetwear':DNC,'do not click':DNC,'video':DNC,'documentary':DNC,'support us':'#shop','shop':'#shop','culture':'#top'}
  const index = []
  ;[...features,...Object.values(rows).flat()].forEach(f => index.push({title:f.head,cat:f.cat,dek:f.dek,target:f.href || '#top'}))
  videos.forEach(v => index.push({title:v.title,cat:v.cat,dek:`Video · ${v.channel}`,target:DNC}))
  products.forEach(p => index.push({title:p.name,cat:'Shop',dek:p.desc,target:'#shop'}))
  const cats = ['Arts & Culture','DO NOT CLICK','Documentary','Fashion & Streetwear','Music','News','Support Us','Sports','Technology','Travel','Video']
  catCols.innerHTML = cats.map(c => `<button class='cat-link' data-cat='${safe(c)}' data-go='${sectionByCat[c.toLowerCase()] || ''}'>${safe(c)}</button>`).join('')
  function close(){ overlay.classList.remove('open'); overlay.setAttribute('aria-hidden','true'); document.body.style.overflow = '' }
  function open(){ overlay.classList.add('open'); overlay.setAttribute('aria-hidden','false'); document.body.style.overflow = 'hidden'; setTimeout(() => input.focus(),60) }
  function jump(target){
    close()
    if(!target) return
    if(target.startsWith('http') || target.includes('.html')) window.location.href = target
    else{ const el = document.querySelector(target); if(el) el.scrollIntoView({behavior:'smooth',block:'start'}) }
  }
  function render(q){
    const query = String(q || '').trim().toLowerCase()
    if(!query){ results.innerHTML = ''; results.classList.remove('show'); return }
    const hits = index.filter(it => [it.title,it.cat,it.dek].some(v => String(v || '').toLowerCase().includes(query))).slice(0,8)
    results.classList.add('show')
    results.innerHTML = hits.length ? hits.map(h => `<button class='search-result' data-go='${h.target}'><span class='sr-cat'>${safe(h.cat)}</span><span class='sr-title'>${safe(h.title)}</span>${h.dek ? `<span class='sr-dek'>${safe(h.dek)}</span>` : ''}</button>`).join('') : `<div class='search-empty'>No results for “${safe(q)}” yet — that coverage is coming in a future issue. <a href='${TALLY_LINK}' ${TALLY_ATTR}>Pitch us this story →</a></div>`
    results.querySelectorAll('.search-result').forEach(b => b.addEventListener('click',() => jump(b.dataset.go)))
  }
  openBtn.addEventListener('click',open)
  overlay.querySelectorAll('[data-search-close]').forEach(el => el.addEventListener('click',close))
  document.addEventListener('keydown',e => { if(e.key === 'Escape' && overlay.classList.contains('open')) close() })
  input.addEventListener('input',() => render(input.value))
  catCols.addEventListener('click',e => {
    const b = e.target.closest('.cat-link')
    if(!b) return
    if(b.dataset.go){ jump(b.dataset.go); return }
    input.value = b.dataset.cat
    render(input.value)
  })
})()