/* ARCHVE site scripts */
document.documentElement.classList.remove('no-js')
document.documentElement.classList.add('js')

const $ = (sel, root=document) => root.querySelector(sel)
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)]

function imgWithFallback(src, alt){
  const img = document.createElement('img')
  img.src = src
  img.alt = alt || ''
  img.loading = 'lazy'
  img.decoding = 'async'
  img.className = 'asset-img'
  img.addEventListener('error', ()=>{
    img.remove()
  }, {once:true})
  return img
}

const meta = window.ARCHVE_META || { month:'JULY', year:'2026', issue:'NO. 01' }

$$('[data-meta="month"]').forEach(el=>el.textContent = meta.month)
$$('[data-meta="year"]').forEach(el=>el.textContent = meta.year)
$$('[data-meta="issue"]').forEach(el=>el.textContent = meta.issue)

const mobileMenu = $('.mobile-menu')
const mobileToggle = $('.mobile-toggle')
const closeMobileMenu = ()=>{
  if(!mobileMenu) return
  mobileMenu.hidden = true
  document.body.style.overflow = ''
  mobileToggle?.setAttribute('aria-expanded','false')
}

mobileToggle?.addEventListener('click', ()=>{
  if(!mobileMenu) return
  const willOpen = mobileMenu.hidden
  mobileMenu.hidden = !willOpen
  document.body.style.overflow = willOpen ? 'hidden' : ''
  mobileToggle.setAttribute('aria-expanded', String(willOpen))
})

$$('.mobile-menu a').forEach(link=>link.addEventListener('click', closeMobileMenu))

document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape') closeMobileMenu()
})

const TALLY_FORM_ID = '81z9vB'
const TALLY_LIST_ATTR = 'https://tally.so/r/81z9vB'
const HERO_COVERS = [
  'assets/images/editorial/hero-cover.png?v=2',
  'assets/images/editorial/hero-cover-01.svg',
  'assets/images/editorial/hero-cover-02.avif',
  'assets/images/editorial/hero-cover-03.avif',
  'assets/images/editorial/hero-cover-04.avif',
  'assets/images/editorial/hero-cover-05.avif',
  'assets/images/editorial/hero-cover-06.avif',
  'assets/images/editorial/hero-cover-07.avif',
  'assets/images/editorial/hero-cover-08.avif',
  'assets/images/editorial/hero-cover-09.avif'
]
const HERO_COVER_SRC = HERO_COVERS[Math.floor(Math.random() * HERO_COVERS.length)]
const INK = '#0C0C0B'
const PAPER = '#E6E5E0'
const MUTE = '#9b9a93'

const LEAD_ARTICLE = {
  id:'player-under-pressure',
  cover:HERO_COVER_SRC,
  kicker:'INTERVIEW',
  title:'PLAYER UNDER PRESSURE',
  byline:'ARCHVE',
  date:'JUL 2026',
  dek:'A conversation with Alex Lujan on process, pressure, and building work that carries the city with it.',
  href:'article.html?id=player-under-pressure'
}

const EDITOR_PICKS = [
  {
    id:'sippinwesson-new-55',
    category:'MUSIC',
    title:'SIPPINWESSON — NEW 55',
    dek:'A new chapter from a Houston voice building momentum on its own terms.',
    byline:'ARCHVE',
    date:'JUL 2026',
    cover:'assets/images/editorial/sippinwesson-new55.png'
  },
  {
    id:'rome-is-no-fun-familiar',
    category:'MUSIC',
    title:'ROME IS NO FUN — FAMILIAR',
    dek:'A close look at a release shaped by memory, repetition, and the tension inside what we already know.',
    byline:'ARCHVE',
    date:'JUL 2026',
    cover:'assets/images/editorial/rome-familiar.png'
  }
]

function setImg(container, src, alt){
  if(!container || !src) return
  container.replaceChildren(imgWithFallback(src, alt))
}

function buildLead(){
  const lead = $('.lead')
  if(!lead) return
  const title = $('.lead-title', lead)
  const kicker = $('.kicker', lead)
  const byline = $('.byline', lead)
  const dek = $('.dek', lead)
  const link = $('a[data-lead-link]', lead)

  if(title) title.textContent = LEAD_ARTICLE.title
  if(kicker) kicker.textContent = LEAD_ARTICLE.kicker
  if(byline) byline.textContent = `BY ${LEAD_ARTICLE.byline} · ${LEAD_ARTICLE.date}`
  if(dek) dek.textContent = LEAD_ARTICLE.dek
  if(link) link.href = LEAD_ARTICLE.href
  setImg($('[data-cover="lead"]', lead), LEAD_ARTICLE.cover, LEAD_ARTICLE.title)
}

function buildEditorPicks(){
  const container = $('.editors .body')
  if(!container) return
  container.replaceChildren()

  EDITOR_PICKS.forEach(item=>{
    const card = document.createElement('a')
    card.className = 'acard'
    card.href = `article.html?id=${encodeURIComponent(item.id)}`
    card.innerHTML = `
      <div class="acover" data-card-cover></div>
      <div class="acopy">
        <span class="cat">${item.category}</span>
        <h3>${item.title}</h3>
        <p>${item.dek}</p>
        <div class="byline">BY ${item.byline} · ${item.date}</div>
      </div>
    `
    setImg($('[data-card-cover]', card), item.cover, item.title)
    container.appendChild(card)
  })
}

buildLead()
buildEditorPicks()

$$('.vthumb[data-video]').forEach((thumb)=>{
  thumb.tabIndex = 0
  thumb.setAttribute('role','button')
  const play = ()=>{
    const src = thumb.dataset.video
    if(!src || src.includes('REPLACE')){
      alert('Add a video URL in assets/js/site.js.')
      return
    }
    window.open(src,'_blank','noopener,noreferrer')
  }
  thumb.addEventListener('click', play)
  thumb.addEventListener('keydown', (e)=>{
    if(e.key==='Enter' || e.key===' '){
      e.preventDefault()
      play()
    }
  })
})

function setTallyButtonLink(btn){
  btn.setAttribute('data-tally-open', TALLY_FORM_ID)
  btn.setAttribute('data-tally-layout', 'modal')
  btn.setAttribute('data-tally-width', '680')
  btn.setAttribute('data-tally-hide-title', '1')
  btn.setAttribute('data-tally-overlay', '1')
  btn.setAttribute('data-tally-emoji-text', '👋')
  btn.setAttribute('data-tally-emoji-animation', 'wave')
}

$$('[data-tally-form]').forEach(setTallyButtonLink)

function formatUSD(cents){
  return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100)
}

function renderShop(){
  const products = window.ARCHVE_PRODUCTS || []
  const grid = $('[data-shop-grid]')
  if(!grid) return
  grid.replaceChildren()

  products.forEach(product=>{
    const card = document.createElement('article')
    card.className = 'shop-card'
    card.innerHTML = `
      <a class="shop-media" href="product.html?id=${encodeURIComponent(product.id)}" data-shop-media></a>
      <div class="shop-copy">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="shop-row"><span>${formatUSD(product.price)}</span><a href="product.html?id=${encodeURIComponent(product.id)}">VIEW</a></div>
      </div>
    `
    setImg($('[data-shop-media]', card), product.images?.[0], product.name)
    grid.appendChild(card)
  })
}

renderShop()

function renderProduct(){
  const root = $('[data-product]')
  if(!root) return
  const products = window.ARCHVE_PRODUCTS || []
  const id = new URLSearchParams(location.search).get('id') || products[0]?.id
  const product = products.find(p=>p.id===id) || products[0]
  if(!product) return

  document.title = `${product.name} — ARCHVE`
  const media = $('[data-product-media]', root)
  setImg(media, product.images?.[0], product.name)

  const title = $('[data-product-title]', root)
  const price = $('[data-product-price]', root)
  const desc = $('[data-product-desc]', root)
  const buy = $('[data-product-buy]', root)
  if(title) title.textContent = product.name
  if(price) price.textContent = formatUSD(product.price)
  if(desc) desc.textContent = product.description
  if(buy){
    buy.addEventListener('click', ()=>{
      const url = product.buyUrl
      if(!url || url.includes('REPLACE')){
        alert('Add your Stripe Payment Link in assets/js/data.js.')
        return
      }
      window.location.href = url
    })
  }
}

renderProduct()

function renderArticle(){
  const root = $('[data-article]')
  if(!root) return
  const id = new URLSearchParams(location.search).get('id')
  const articles = [LEAD_ARTICLE, ...EDITOR_PICKS]
  const article = articles.find(a=>a.id===id) || articles[0]

  document.title = `${article.title} — ARCHVE`
  const kicker = $('[data-article-kicker]', root)
  const title = $('[data-article-title]', root)
  const dek = $('[data-article-dek]', root)
  const byline = $('[data-article-byline]', root)
  const cover = $('[data-article-cover]', root)

  if(kicker) kicker.textContent = article.kicker || article.category
  if(title) title.textContent = article.title
  if(dek) dek.textContent = article.dek
  if(byline) byline.textContent = `BY ${article.byline} · ${article.date}`
  setImg(cover, article.cover, article.title)
}

renderArticle()

function renderArchive(){
  const root = $('[data-archive-list]')
  if(!root) return
  const entries = [
    {...LEAD_ARTICLE, category:LEAD_ARTICLE.kicker},
    ...EDITOR_PICKS
  ]
  root.replaceChildren()
  entries.forEach(item=>{
    const row = document.createElement('a')
    row.className = 'archive-row'
    row.href = `article.html?id=${encodeURIComponent(item.id)}`
    row.innerHTML = `
      <span>${item.category}</span>
      <strong>${item.title}</strong>
      <span>${item.date}</span>
    `
    root.appendChild(row)
  })
}

renderArchive()

$$('form[data-endpoint]').forEach(form=>{
  form.addEventListener('submit', async (e)=>{
    e.preventDefault()
    const endpoint = form.dataset.endpoint
    const status = $('[data-form-status]', form)
    const submit = $('[type="submit"]', form)
    if(!endpoint || endpoint.includes('REPLACE')){
      if(status) status.textContent = 'FORM ENDPOINT NOT CONFIGURED.'
      return
    }

    if(status) status.textContent = 'SENDING…'
    if(submit) submit.disabled = true
    try{
      const data = Object.fromEntries(new FormData(form).entries())
      const response = await fetch(endpoint,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(data)
      })
      if(!response.ok) throw new Error('Submit failed')
      form.reset()
      if(status) status.textContent = 'SUBMITTED.'
    }catch(err){
      if(status) status.textContent = 'COULD NOT SUBMIT. TRY AGAIN.'
    }finally{
      if(submit) submit.disabled = false
    }
  })
})

function setupDonate(){
  const form = $('[data-donate-form]')
  if(!form) return
  form.addEventListener('submit', (e)=>{
    e.preventDefault()
    const amount = Number($('[name="amount"]', form)?.value || 0)
    const stripeUrl = form.dataset.stripe
    const status = $('[data-donate-status]', form)
    if(!amount || amount < 1){
      if(status) status.textContent = 'ENTER A VALID AMOUNT.'
      return
    }
    if(!stripeUrl || stripeUrl.includes('REPLACE')){
      if(status) status.textContent = 'STRIPE LINK NOT CONFIGURED.'
      return
    }
    const join = stripeUrl.includes('?') ? '&' : '?'
    window.location.href = `${stripeUrl}${join}client_reference_id=${encodeURIComponent(amount)}`
  })
}
setupDonate()

function loadTally(){
  if(window.Tally){
    window.Tally.loadEmbeds()
    return
  }
  const script = document.createElement('script')
  script.src = 'https://tally.so/widgets/embed.js'
  script.async = true
  script.onload = ()=>window.Tally?.loadEmbeds()
  document.head.appendChild(script)
}
loadTally()

/* Lightweight modal for keychain CTA */
const keyModal = $('[data-key-modal]')
const keyOpen = $('[data-key-open]')
const keyClose = $('[data-key-close]')

function openKeyModal(){
  if(!keyModal) return
  keyModal.hidden = false
  document.body.style.overflow = 'hidden'
  keyClose?.focus()
}
function closeKeyModal(){
  if(!keyModal) return
  keyModal.hidden = true
  document.body.style.overflow = ''
  keyOpen?.focus()
}
keyOpen?.addEventListener('click', openKeyModal)
keyClose?.addEventListener('click', closeKeyModal)
keyModal?.addEventListener('click', (e)=>{
  if(e.target === keyModal) closeKeyModal()
})
document.addEventListener('keydown', (e)=>{
  if(e.key==='Escape' && keyModal && !keyModal.hidden) closeKeyModal()
})

/* Editorial reveal */
const revealNodes = $$('[data-reveal]')
if('IntersectionObserver' in window){
  const observer = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      }
    })
  },{threshold:.12})
  revealNodes.forEach(node=>observer.observe(node))
}else{
  revealNodes.forEach(node=>node.classList.add('is-visible'))
}

/* Interactive editorial tilt for desktop */
const tiltTargets = $$('[data-tilt]')
const allowTilt = window.matchMedia('(pointer:fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
if(allowTilt){
  tiltTargets.forEach(node=>{
    node.addEventListener('mousemove', (e)=>{
      const r=node.getBoundingClientRect()
      const x=(e.clientX-r.left)/r.width-.5
      const y=(e.clientY-r.top)/r.height-.5
      node.style.setProperty('--tilt-x', `${(-y*2.2).toFixed(2)}deg`)
      node.style.setProperty('--tilt-y', `${(x*2.2).toFixed(2)}deg`)
    })
    node.addEventListener('mouseleave', ()=>{
      node.style.setProperty('--tilt-x','0deg')
      node.style.setProperty('--tilt-y','0deg')
    })
  })
}

/* Current nav state */
const page = location.pathname.split('/').pop() || 'index.html'
$$('.nav a, .mobile-menu a').forEach(link=>{
  const href = link.getAttribute('href')
  if(href === page || (page === '' && href === 'index.html')) link.classList.add('is-current')
})

/* Stamp date */
$$('[data-date]').forEach(el=>{
  el.textContent = new Intl.DateTimeFormat('en-US',{month:'short',year:'numeric'}).format(new Date()).toUpperCase()
})
